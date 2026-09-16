import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";

export const Route = createFileRoute("/_authenticated/painel/agenda")({
  head: () => ({ meta: [{ title: "Agenda — SharkZapp" }, { name: "robots", content: "noindex" }] }),
  component: Agenda,
});

function Agenda() {
  const { data: org } = useOrg();
  const orgId = org?.organizationId;
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: "", starts_at: "", duration_minutes: 30 });

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("organization_id", orgId!)
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("appointments").insert({
        organization_id: orgId!,
        title: form.title,
        starts_at: new Date(form.starts_at).toISOString(),
        duration_minutes: form.duration_minutes,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Agendamento criado.");
      setForm({ title: "", starts_at: "", duration_minutes: 30 });
      qc.invalidateQueries({ queryKey: ["appointments", orgId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("appointments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["appointments", orgId] }),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Agenda</h1>
        <p className="mt-1 text-muted-foreground">Compromissos marcados com seus clientes.</p>
      </div>

      <Card className="border-border/60 bg-surface/60">
        <CardContent className="p-6">
          <form
            className="grid gap-4 sm:grid-cols-[1fr_220px_140px_auto] sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="t">Título</Label>
              <Input
                id="t"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d">Data e hora</Label>
              <Input
                id="d"
                type="datetime-local"
                required
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m">Duração (min)</Label>
              <Input
                id="m"
                type="number"
                min={5}
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
              />
            </div>
            <Button type="submit">Agendar</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {appointments.map((a) => (
          <Card key={a.id} className="border-border/60 bg-surface/60">
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="font-semibold">{a.title}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(a.starts_at).toLocaleString("pt-BR")} · {a.duration_minutes} min
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove.mutate(a.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {appointments.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum agendamento.</p>
        )}
      </div>
    </div>
  );
}
