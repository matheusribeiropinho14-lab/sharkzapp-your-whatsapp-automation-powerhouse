import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";

export const Route = createFileRoute("/_authenticated/painel/crm")({
  head: () => ({ meta: [{ title: "CRM — SharkZapp" }, { name: "robots", content: "noindex" }] }),
  component: Crm,
});

const stages = [
  { key: "novo", label: "Novo" },
  { key: "qualificado", label: "Qualificado" },
  { key: "proposta", label: "Proposta" },
  { key: "negociacao", label: "Negociação" },
  { key: "ganho", label: "Ganho" },
  { key: "perdido", label: "Perdido" },
] as const;

type Stage = (typeof stages)[number]["key"];

function brl(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Crm() {
  const { data: org } = useOrg();
  const orgId = org?.organizationId;
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", value: "" });

  const { data: deals = [] } = useQuery({
    queryKey: ["deals", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("deals").insert({
        organization_id: orgId!,
        title: form.title,
        value_cents: Math.round(Number(form.value.replace(",", ".")) * 100) || 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Negócio criado.");
      setForm({ title: "", value: "" });
      qc.invalidateQueries({ queryKey: ["deals", orgId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const move = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: Stage }) => {
      const { error } = await supabase.from("deals").update({ stage }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deals", orgId] }),
  });

  const total = deals
    .filter((d) => d.stage !== "perdido")
    .reduce((acc, d) => acc + Number(d.value_cents), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">CRM</h1>
        <p className="mt-1 text-muted-foreground">Pipeline ativo: {brl(total)}</p>
      </div>

      <Card className="border-border/60 bg-surface/60">
        <CardContent className="p-6">
          <form
            className="grid gap-4 sm:grid-cols-[1fr_200px_auto] sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="t">Negócio</Label>
              <Input
                id="t"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="v">Valor (R$)</Label>
              <Input
                id="v"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder="1500"
              />
            </div>
            <Button type="submit">Adicionar</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {stages.map((s) => {
          const list = deals.filter((d) => d.stage === s.key);
          return (
            <div key={s.key} className="rounded-xl border border-border bg-surface/40 p-3">
              <p className="text-sm font-semibold">
                {s.label} <span className="text-muted-foreground">({list.length})</span>
              </p>
              <div className="mt-3 space-y-2">
                {list.map((d) => (
                  <div key={d.id} className="rounded-lg border border-border/60 bg-background p-3">
                    <p className="text-sm font-medium">{d.title}</p>
                    <p className="text-xs text-muted-foreground">{brl(Number(d.value_cents))}</p>
                    <select
                      value={d.stage}
                      onChange={(e) => move.mutate({ id: d.id, stage: e.target.value as Stage })}
                      className="mt-2 w-full rounded-md border border-border bg-surface px-2 py-1 text-xs"
                    >
                      {stages.map((o) => (
                        <option key={o.key} value={o.key}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
