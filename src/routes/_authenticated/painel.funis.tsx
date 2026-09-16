import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";

export const Route = createFileRoute("/_authenticated/painel/funis")({
  head: () => ({ meta: [{ title: "Funis — SharkZapp" }, { name: "robots", content: "noindex" }] }),
  component: Funis,
});

type Step = { message: string; delay_minutes: number };

function Funis() {
  const { data: org } = useOrg();
  const orgId = org?.organizationId;
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [steps, setSteps] = useState<Step[]>([{ message: "", delay_minutes: 0 }]);

  const { data: flows = [] } = useQuery({
    queryKey: ["flows", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flows")
        .select("*")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("flows").insert({
        organization_id: orgId!,
        name,
        trigger_type: keywords ? "keyword" : "manual",
        trigger_keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        steps: steps.filter((s) => s.message.trim()),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Funil criado.");
      setName("");
      setKeywords("");
      setSteps([{ message: "", delay_minutes: 0 }]);
      qc.invalidateQueries({ queryKey: ["flows", orgId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const { error } = await supabase.from("flows").update({ is_active: value }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["flows", orgId] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("flows").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["flows", orgId] }),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Funis de atendimento</h1>
        <p className="mt-1 text-muted-foreground">
          Sequências automáticas disparadas por palavra-chave do cliente.
        </p>
      </div>

      <Card className="border-border/60 bg-surface/60">
        <CardContent className="p-6">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do funil</Label>
                <Input id="nome" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kw">Palavras que disparam</Label>
                <Input
                  id="kw"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="orçamento, preço"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Mensagens</Label>
              {steps.map((s, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-[1fr_140px]">
                  <Textarea
                    rows={2}
                    value={s.message}
                    placeholder={`Mensagem ${i + 1}`}
                    onChange={(e) => {
                      const next = [...steps];
                      next[i] = { ...s, message: e.target.value };
                      setSteps(next);
                    }}
                  />
                  <Input
                    type="number"
                    min={0}
                    value={s.delay_minutes}
                    onChange={(e) => {
                      const next = [...steps];
                      next[i] = { ...s, delay_minutes: Number(e.target.value) };
                      setSteps(next);
                    }}
                    placeholder="Atraso (min)"
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSteps([...steps, { message: "", delay_minutes: 5 }])}
              >
                <Plus className="mr-2 h-4 w-4" /> Adicionar mensagem
              </Button>
            </div>

            <Button type="submit" disabled={create.isPending}>
              Criar funil
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {flows.map((f) => (
          <Card key={f.id} className="border-border/60 bg-surface/60">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-semibold">{f.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(f.steps as Step[]).length} mensagens ·{" "}
                  {f.trigger_keywords.length > 0 ? f.trigger_keywords.join(", ") : "manual"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={f.is_active}
                    onCheckedChange={(v) => toggle.mutate({ id: f.id, value: v })}
                  />
                  {f.is_active ? "Ativo" : "Pausado"}
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove.mutate(f.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {flows.length === 0 && <p className="text-sm text-muted-foreground">Nenhum funil criado.</p>}
      </div>
    </div>
  );
}
