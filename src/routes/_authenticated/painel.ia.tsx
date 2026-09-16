import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";

export const Route = createFileRoute("/_authenticated/painel/ia")({
  head: () => ({ meta: [{ title: "Agente de IA — SharkZapp" }, { name: "robots", content: "noindex" }] }),
  component: IA,
});

function IA() {
  const { data: org } = useOrg();
  const orgId = org?.organizationId;
  const qc = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["ai-settings", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_settings")
        .select("*")
        .eq("organization_id", orgId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({
    enabled: false,
    persona: "",
    knowledge: "",
    handoff_keywords: "",
    working_hours: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        enabled: settings.enabled,
        persona: settings.persona,
        knowledge: settings.knowledge,
        handoff_keywords: settings.handoff_keywords.join(", "),
        working_hours: settings.working_hours,
      });
    }
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("ai_settings")
        .update({
          enabled: form.enabled,
          persona: form.persona,
          knowledge: form.knowledge,
          handoff_keywords: form.handoff_keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean),
          working_hours: form.working_hours,
        })
        .eq("organization_id", orgId!);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Configurações salvas.");
      qc.invalidateQueries({ queryKey: ["ai-settings", orgId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Agente de IA</h1>
        <p className="mt-1 text-muted-foreground">
          O agente responde automaticamente as conversas com base no que você ensinar aqui.
        </p>
      </div>

      <Card className="border-border/60 bg-surface/60">
        <CardContent className="space-y-6 p-6">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium">Respostas automáticas</p>
              <p className="text-sm text-muted-foreground">
                Quando ligado, o agente responde novas mensagens sozinho.
              </p>
            </div>
            <Switch
              checked={form.enabled}
              onCheckedChange={(v) => setForm({ ...form, enabled: v })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="persona">Como o agente deve falar</Label>
            <Textarea
              id="persona"
              rows={3}
              value={form.persona}
              onChange={(e) => setForm({ ...form, persona: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="know">O que o agente precisa saber</Label>
            <Textarea
              id="know"
              rows={8}
              value={form.knowledge}
              onChange={(e) => setForm({ ...form, knowledge: e.target.value })}
              placeholder="Produtos, preços, prazos, endereço, política de troca..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hand">Palavras que chamam um humano</Label>
              <Input
                id="hand"
                value={form.handoff_keywords}
                onChange={(e) => setForm({ ...form, handoff_keywords: e.target.value })}
                placeholder="atendente, humano, falar com alguém"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Horário de atendimento</Label>
              <Input
                id="hours"
                value={form.working_hours}
                onChange={(e) => setForm({ ...form, working_hours: e.target.value })}
                placeholder="Seg a sex, 9h às 18h"
              />
            </div>
          </div>

          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Salvando..." : "Salvar configurações"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
