import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Rocket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { runCampaign } from "@/lib/whatsapp.functions";

export const Route = createFileRoute("/_authenticated/painel/campanhas")({
  head: () => ({ meta: [{ title: "Campanhas — SharkZapp" }, { name: "robots", content: "noindex" }] }),
  component: Campanhas,
});

const statusLabel: Record<string, string> = {
  draft: "Rascunho",
  scheduled: "Agendada",
  sending: "Enviando",
  done: "Concluída",
  paused: "Pausada",
  failed: "Falhou",
};

function Campanhas() {
  const { data: org } = useOrg();
  const orgId = org?.organizationId;
  const qc = useQueryClient();
  const run = useServerFn(runCampaign);
  const [form, setForm] = useState({
    name: "",
    template_name: "",
    message_preview: "",
    audience_tag: "",
  });

  const { data: numbers = [] } = useQuery({
    queryKey: ["numbers", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_numbers")
        .select("id, label")
        .eq("organization_id", orgId!);
      if (error) throw error;
      return data;
    },
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: contactsQuery } = await supabase
        .from("contacts")
        .select("id")
        .eq("organization_id", orgId!)
        .eq("opt_in", true)
        .filter(
          "tags",
          form.audience_tag ? "cs" : "not.is",
          form.audience_tag ? `{${form.audience_tag}}` : null,
        );

      const contacts = contactsQuery ?? [];
      if (contacts.length === 0) throw new Error("Nenhum contato encontrado para esse público.");

      const { data: campaign, error } = await supabase
        .from("campaigns")
        .insert({
          organization_id: orgId!,
          name: form.name,
          number_id: numbers[0]?.id ?? null,
          template_name: form.template_name || null,
          message_preview: form.message_preview,
          audience_tag: form.audience_tag || null,
          total_recipients: contacts.length,
        })
        .select("id")
        .single();
      if (error) throw error;

      const { error: recError } = await supabase.from("campaign_recipients").insert(
        contacts.map((c) => ({
          organization_id: orgId!,
          campaign_id: campaign.id,
          contact_id: c.id,
        })),
      );
      if (recError) throw recError;
    },
    onSuccess: () => {
      toast.success("Campanha criada.");
      setForm({ name: "", template_name: "", message_preview: "", audience_tag: "" });
      qc.invalidateQueries({ queryKey: ["campaigns", orgId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const dispatch = useMutation({
    mutationFn: async (id: string) => run({ data: { campaignId: id } }),
    onSuccess: (res) => {
      toast.success(`Enviadas: ${res.sent} · Falhas: ${res.failed} · Na fila: ${res.remaining}`);
      qc.invalidateQueries({ queryKey: ["campaigns", orgId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Campanhas</h1>
        <p className="mt-1 text-muted-foreground">
          Envios em massa pela API oficial. Para o primeiro contato, use um modelo aprovado pela Meta.
        </p>
      </div>

      <Card className="border-border/60 bg-surface/60">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold">Nova campanha</h2>
          <form
            className="mt-4 grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da campanha</Label>
              <Input
                id="nome"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag">Etiqueta do público (opcional)</Label>
              <Input
                id="tag"
                value={form.audience_tag}
                onChange={(e) => setForm({ ...form, audience_tag: e.target.value })}
                placeholder="lead"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tpl">Modelo aprovado (opcional)</Label>
              <Input
                id="tpl"
                value={form.template_name}
                onChange={(e) => setForm({ ...form, template_name: e.target.value })}
                placeholder="promocao_setembro"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="msg">Mensagem</Label>
              <Textarea
                id="msg"
                required
                rows={4}
                value={form.message_preview}
                onChange={(e) => setForm({ ...form, message_preview: e.target.value })}
                placeholder="Olá {{nome}}, temos uma novidade para você!"
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={create.isPending}>
                Criar campanha
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {campaigns.map((c) => (
          <Card key={c.id} className="border-border/60 bg-surface/60">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-muted-foreground">
                  {c.total_recipients} destinatários · {c.sent_count} enviadas · {c.failed_count} falhas
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">{statusLabel[c.status] ?? c.status}</Badge>
                <Button
                  size="sm"
                  disabled={dispatch.isPending || c.status === "done"}
                  onClick={() => dispatch.mutate(c.id)}
                >
                  <Rocket className="mr-2 h-4 w-4" /> Disparar lote
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {campaigns.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma campanha criada ainda.</p>
        )}
      </div>
    </div>
  );
}
