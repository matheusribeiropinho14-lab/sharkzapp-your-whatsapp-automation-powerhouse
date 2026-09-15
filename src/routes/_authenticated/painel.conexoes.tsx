import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";

export const Route = createFileRoute("/_authenticated/painel/conexoes")({
  head: () => ({ meta: [{ title: "Conexões — SharkZapp" }, { name: "robots", content: "noindex" }] }),
  component: Conexoes,
});

function Conexoes() {
  const { data: org } = useOrg();
  const orgId = org?.organizationId;
  const qc = useQueryClient();
  const [form, setForm] = useState({
    label: "",
    phone_number: "",
    phone_number_id: "",
    waba_id: "",
    access_token: "",
  });

  const { data: numbers = [] } = useQuery({
    queryKey: ["numbers", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_numbers")
        .select("*")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("whatsapp_numbers").insert({
        organization_id: orgId!,
        label: form.label,
        phone_number: form.phone_number,
        phone_number_id: form.phone_number_id || null,
        waba_id: form.waba_id || null,
        access_token: form.access_token || null,
        status: form.access_token && form.phone_number_id ? "connected" : "pending",
        connected_at: form.access_token && form.phone_number_id ? new Date().toISOString() : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Número salvo.");
      setForm({ label: "", phone_number: "", phone_number_id: "", waba_id: "", access_token: "" });
      qc.invalidateQueries({ queryKey: ["numbers", orgId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("whatsapp_numbers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Número removido.");
      qc.invalidateQueries({ queryKey: ["numbers", orgId] });
    },
  });

  const webhookUrl =
    typeof window !== "undefined" ? `${window.location.origin}/api/public/whatsapp` : "";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Conexões do WhatsApp</h1>
        <p className="mt-1 text-muted-foreground">
          Conecte o número da sua empresa pela API oficial da Meta (WhatsApp Cloud API).
        </p>
      </div>

      <Card className="border-border/60 bg-surface/60">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-lg font-semibold">Endereço do webhook</h2>
          <p className="text-sm text-muted-foreground">
            Cole este endereço no painel da Meta, em Configuração do webhook, e use o token de
            verificação exibido no número abaixo.
          </p>
          <div className="flex gap-2">
            <Input readOnly value={webhookUrl} />
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(webhookUrl);
                toast.success("Endereço copiado.");
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-surface/60">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold">Adicionar número</h2>
          <form
            className="mt-4 grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="label">Apelido</Label>
              <Input
                id="label"
                required
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Comercial"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Número</Label>
              <Input
                id="phone"
                required
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                placeholder="5511999990000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pnid">ID do número (Meta)</Label>
              <Input
                id="pnid"
                value={form.phone_number_id}
                onChange={(e) => setForm({ ...form, phone_number_id: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waba">ID da conta comercial (WABA)</Label>
              <Input
                id="waba"
                value={form.waba_id}
                onChange={(e) => setForm({ ...form, waba_id: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="token">Token de acesso permanente</Label>
              <Input
                id="token"
                type="password"
                value={form.access_token}
                onChange={(e) => setForm({ ...form, access_token: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? "Salvando..." : "Salvar número"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {numbers.map((n) => (
          <Card key={n.id} className="border-border/60 bg-surface/60">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-semibold">
                  {n.label} <span className="text-muted-foreground">· {n.phone_number}</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Token de verificação: <code className="text-primary">{n.verify_token}</code>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={n.status === "connected" ? "default" : "outline"}>
                  {n.status === "connected" ? "Conectado" : "Pendente"}
                </Badge>
                <Button variant="ghost" size="icon" onClick={() => remove.mutate(n.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {numbers.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum número conectado ainda.</p>
        )}
      </div>
    </div>
  );
}
