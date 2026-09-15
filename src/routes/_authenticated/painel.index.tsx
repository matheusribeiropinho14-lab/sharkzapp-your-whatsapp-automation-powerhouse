import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Inbox, Megaphone, Smartphone, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";

export const Route = createFileRoute("/_authenticated/painel/")({
  head: () => ({ meta: [{ title: "Visão geral — SharkZapp" }, { name: "robots", content: "noindex" }] }),
  component: Overview,
});

function Overview() {
  const { data: org } = useOrg();
  const orgId = org?.organizationId;

  const { data: stats } = useQuery({
    queryKey: ["overview", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const [contacts, conversations, campaigns, numbers, messages] = await Promise.all([
        supabase.from("contacts").select("id", { count: "exact", head: true }).eq("organization_id", orgId!),
        supabase
          .from("conversations")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", orgId!)
          .eq("status", "open"),
        supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("organization_id", orgId!),
        supabase
          .from("whatsapp_numbers")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", orgId!)
          .eq("status", "connected"),
        supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("organization_id", orgId!)
          .gte("created_at", new Date(Date.now() - 30 * 864e5).toISOString()),
      ]);
      return {
        contacts: contacts.count ?? 0,
        openConversations: conversations.count ?? 0,
        campaigns: campaigns.count ?? 0,
        numbers: numbers.count ?? 0,
        messages30d: messages.count ?? 0,
      };
    },
  });

  const cards = [
    { label: "Contatos", value: stats?.contacts ?? 0, icon: Users },
    { label: "Conversas abertas", value: stats?.openConversations ?? 0, icon: Inbox },
    { label: "Campanhas criadas", value: stats?.campaigns ?? 0, icon: Megaphone },
    { label: "Números conectados", value: stats?.numbers ?? 0, icon: Smartphone },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Olá! Bem-vindo ao {org?.name ?? "SharkZapp"}</h1>
        <p className="mt-1 text-muted-foreground">
          Mensagens nos últimos 30 dias: <strong>{stats?.messages30d ?? 0}</strong>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="border-border/60 bg-surface/60">
            <CardContent className="p-5">
              <c.icon className="h-5 w-5 text-primary" />
              <p className="mt-3 text-3xl font-bold">{c.value}</p>
              <p className="text-sm text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats?.numbers === 0 && (
        <Card className="border-primary/40 bg-surface">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Conecte seu primeiro número</h2>
              <p className="text-sm text-muted-foreground">
                Ligue o WhatsApp da sua empresa pela API oficial da Meta para começar a atender.
              </p>
            </div>
            <Button asChild>
              <Link to="/painel/conexoes">Conectar agora</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { to: "/painel/contatos", title: "Importar contatos", text: "Suba sua lista e organize por etiquetas." },
          { to: "/painel/campanhas", title: "Criar campanha", text: "Envie um modelo aprovado para um público." },
          { to: "/painel/ia", title: "Ligar a IA", text: "Deixe o agente responder sozinho 24h." },
        ].map((a) => (
          <Card key={a.to} className="border-border/60 bg-surface/60">
            <CardContent className="space-y-2 p-5">
              <h3 className="font-semibold">{a.title}</h3>
              <p className="text-sm text-muted-foreground">{a.text}</p>
              <Button asChild variant="outline" size="sm">
                <Link to={a.to}>Abrir</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
