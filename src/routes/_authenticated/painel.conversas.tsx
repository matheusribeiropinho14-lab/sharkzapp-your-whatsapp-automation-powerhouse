import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";
import { sendWhatsappMessage } from "@/lib/whatsapp.functions";

export const Route = createFileRoute("/_authenticated/painel/conversas")({
  head: () => ({ meta: [{ title: "Conversas — SharkZapp" }, { name: "robots", content: "noindex" }] }),
  component: Conversas,
});

function Conversas() {
  const { data: org } = useOrg();
  const orgId = org?.organizationId;
  const qc = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [text, setText] = useState("");
  const send = useServerFn(sendWhatsappMessage);

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, status, last_message_at, contacts(name, phone)")
        .eq("organization_id", orgId!)
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", selected],
    enabled: !!selected,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selected!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!selected) return;
    const channel = supabase
      .channel(`messages-${selected}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `conversation_id=eq.${selected}` },
        () => qc.invalidateQueries({ queryKey: ["messages", selected] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selected, qc]);

  const sendMutation = useMutation({
    mutationFn: async () => send({ data: { conversationId: selected!, text } }),
    onSuccess: (res) => {
      setText("");
      qc.invalidateQueries({ queryKey: ["messages", selected] });
      if (res.status === "failed") toast.error(res.errorMessage ?? "Não foi possível enviar.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const current = conversations.find((c) => c.id === selected);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Conversas</h1>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="max-h-[70vh] space-y-2 overflow-y-auto rounded-xl border border-border p-2">
          {conversations.map((c) => {
            const contact = c.contacts as unknown as { name: string; phone: string } | null;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(c.id)}
                className={`w-full rounded-lg p-3 text-left transition-colors ${
                  selected === c.id ? "bg-primary/15" : "hover:bg-surface"
                }`}
              >
                <p className="font-medium">{contact?.name ?? "Contato"}</p>
                <p className="text-xs text-muted-foreground">{contact?.phone}</p>
                <Badge variant="outline" className="mt-1 text-[10px]">
                  {c.status === "open" ? "Aberta" : c.status === "pending" ? "Aguardando" : "Fechada"}
                </Badge>
              </button>
            );
          })}
          {conversations.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              Nenhuma conversa ainda. Elas aparecem aqui quando alguém escreve no seu WhatsApp.
            </p>
          )}
        </div>

        <div className="flex max-h-[70vh] flex-col rounded-xl border border-border">
          {selected ? (
            <>
              <div className="border-b border-border p-4">
                <p className="font-semibold">
                  {(current?.contacts as unknown as { name: string } | null)?.name ?? "Conversa"}
                </p>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[75%] rounded-xl px-4 py-2 text-sm ${
                      m.direction === "outbound"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-surface"
                    }`}
                  >
                    {m.body}
                    {m.status === "failed" && (
                      <p className="mt-1 text-[10px] opacity-80">Falha no envio</p>
                    )}
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-sm text-muted-foreground">Sem mensagens nesta conversa.</p>
                )}
              </div>
              <form
                className="flex gap-2 border-t border-border p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (text.trim()) sendMutation.mutate();
                }}
              >
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Escreva sua mensagem"
                />
                <Button type="submit" disabled={sendMutation.isPending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="grid flex-1 place-items-center p-8 text-sm text-muted-foreground">
              Escolha uma conversa à esquerda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
