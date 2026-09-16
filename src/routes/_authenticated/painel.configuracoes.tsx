import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";

export const Route = createFileRoute("/_authenticated/painel/configuracoes")({
  head: () => ({
    meta: [{ title: "Configurações — SharkZapp" }, { name: "robots", content: "noindex" }],
  }),
  component: Configuracoes,
});

function Configuracoes() {
  const { data: org } = useOrg();
  const orgId = org?.organizationId;
  const qc = useQueryClient();
  const [name, setName] = useState("");

  useEffect(() => {
    if (org) setName(org.name);
  }, [org]);

  const { data: members = [] } = useQuery({
    queryKey: ["members", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organization_members")
        .select("id, role, user_id, profiles:user_id(full_name, email)")
        .eq("organization_id", orgId!);
      if (error) throw error;
      return data;
    },
  });

  const saveName = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("organizations").update({ name }).eq("id", orgId!);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Nome atualizado.");
      qc.invalidateQueries({ queryKey: ["current-org"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Configurações</h1>

      <Card className="border-border/60 bg-surface/60">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Empresa</h2>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[240px] flex-1 space-y-2">
              <Label htmlFor="n">Nome da empresa</Label>
              <Input id="n" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <Button onClick={() => saveName.mutate()} disabled={saveName.isPending}>
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-surface/60">
        <CardContent className="space-y-3 p-6">
          <h2 className="text-lg font-semibold">Plano</h2>
          <p className="text-sm text-muted-foreground">
            Plano atual: <Badge variant="outline" className="capitalize">{org?.plan}</Badge> · situação:{" "}
            {org?.subscriptionStatus === "trialing" ? "período de teste" : org?.subscriptionStatus}
          </p>
          {org?.trialEndsAt && (
            <p className="text-sm text-muted-foreground">
              Teste válido até {new Date(org.trialEndsAt).toLocaleDateString("pt-BR")}.
            </p>
          )}
          <Button asChild variant="outline">
            <Link to="/planos">Ver planos</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-surface/60">
        <CardContent className="space-y-3 p-6">
          <h2 className="text-lg font-semibold">Equipe</h2>
          <ul className="space-y-2 text-sm">
            {members.map((m) => {
              const p = m.profiles as unknown as { full_name: string | null; email: string } | null;
              return (
                <li
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3"
                >
                  <span>{p?.full_name ?? p?.email ?? "Usuário"}</span>
                  <Badge variant="outline" className="capitalize">
                    {m.role === "owner" ? "dono" : m.role === "admin" ? "administrador" : "atendente"}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
