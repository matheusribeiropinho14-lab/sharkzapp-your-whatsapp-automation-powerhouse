import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GRAPH = "https://graph.facebook.com/v21.0";

const sendSchema = z.object({
  conversationId: z.string().uuid(),
  text: z.string().min(1).max(4000),
});

/** Envia uma mensagem de texto em uma conversa aberta (janela de 24h). */
export const sendWhatsappMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => sendSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: conv, error: convError } = await supabase
      .from("conversations")
      .select("id, organization_id, number_id, contacts(phone)")
      .eq("id", data.conversationId)
      .maybeSingle();
    if (convError) throw new Error(convError.message);
    if (!conv) throw new Error("Conversa não encontrada.");

    const phone = (conv.contacts as unknown as { phone: string } | null)?.phone;
    if (!phone) throw new Error("Contato sem telefone.");

    const { data: number } = conv.number_id
      ? await supabase
          .from("whatsapp_numbers")
          .select("phone_number_id, access_token")
          .eq("id", conv.number_id)
          .maybeSingle()
      : { data: null };

    let status: "sent" | "failed" = "sent";
    let errorMessage: string | null = null;
    let waMessageId: string | null = null;

    if (number?.access_token && number.phone_number_id) {
      const res = await fetch(`${GRAPH}/${number.phone_number_id}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${number.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "text",
          text: { body: data.text },
        }),
      });
      const json = (await res.json()) as {
        messages?: { id: string }[];
        error?: { message: string };
      };
      if (!res.ok) {
        status = "failed";
        errorMessage = json.error?.message ?? "Falha ao enviar pela Meta.";
      } else {
        waMessageId = json.messages?.[0]?.id ?? null;
      }
    } else {
      status = "failed";
      errorMessage = "Número sem credenciais da Meta configuradas.";
    }

    const { error: insertError } = await supabase.from("messages").insert({
      organization_id: conv.organization_id,
      conversation_id: conv.id,
      direction: "outbound",
      status,
      body: data.text,
      wa_message_id: waMessageId,
      sent_by: context.userId,
    });
    if (insertError) throw new Error(insertError.message);

    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conv.id);

    return { status, errorMessage };
  });

const campaignSchema = z.object({ campaignId: z.string().uuid() });

/** Dispara uma campanha para os destinatários pendentes, em lotes de 50. */
export const runCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => campaignSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: campaign, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", data.campaignId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!campaign) throw new Error("Campanha não encontrada.");

    const { data: number } = campaign.number_id
      ? await supabase
          .from("whatsapp_numbers")
          .select("phone_number_id, access_token")
          .eq("id", campaign.number_id)
          .maybeSingle()
      : { data: null };

    const { data: recipients } = await supabase
      .from("campaign_recipients")
      .select("id, contacts(phone, name)")
      .eq("campaign_id", campaign.id)
      .eq("status", "queued")
      .limit(50);

    await supabase
      .from("campaigns")
      .update({ status: "sending", started_at: new Date().toISOString() })
      .eq("id", campaign.id);

    let sent = 0;
    let failed = 0;

    for (const r of recipients ?? []) {
      const contact = r.contacts as unknown as { phone: string; name: string } | null;
      if (!contact) continue;

      let ok = false;
      let errMsg: string | null = null;
      let waId: string | null = null;

      if (number?.access_token && number.phone_number_id) {
        const body = campaign.template_name
          ? {
              messaging_product: "whatsapp",
              to: contact.phone,
              type: "template",
              template: {
                name: campaign.template_name,
                language: { code: campaign.template_language },
              },
            }
          : {
              messaging_product: "whatsapp",
              to: contact.phone,
              type: "text",
              text: { body: campaign.message_preview.replace(/\{\{nome\}\}/g, contact.name) },
            };

        const res = await fetch(`${GRAPH}/${number.phone_number_id}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${number.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        const json = (await res.json()) as {
          messages?: { id: string }[];
          error?: { message: string };
        };
        ok = res.ok;
        waId = json.messages?.[0]?.id ?? null;
        errMsg = ok ? null : (json.error?.message ?? "Falha no envio.");
      } else {
        errMsg = "Número sem credenciais da Meta configuradas.";
      }

      await supabase
        .from("campaign_recipients")
        .update({
          status: ok ? "sent" : "failed",
          sent_at: ok ? new Date().toISOString() : null,
          wa_message_id: waId,
          error: errMsg,
        })
        .eq("id", r.id);

      if (ok) sent += 1;
      else failed += 1;
    }

    const { count: remaining } = await supabase
      .from("campaign_recipients")
      .select("id", { count: "exact", head: true })
      .eq("campaign_id", campaign.id)
      .eq("status", "queued");

    await supabase
      .from("campaigns")
      .update({
        status: (remaining ?? 0) > 0 ? "sending" : "done",
        sent_count: campaign.sent_count + sent,
        failed_count: campaign.failed_count + failed,
        finished_at: (remaining ?? 0) > 0 ? null : new Date().toISOString(),
      })
      .eq("id", campaign.id);

    return { sent, failed, remaining: remaining ?? 0 };
  });
