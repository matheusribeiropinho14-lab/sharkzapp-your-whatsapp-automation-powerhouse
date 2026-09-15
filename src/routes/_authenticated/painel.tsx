import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  BarChart3,
  Bot,
  CalendarClock,
  Inbox,
  KanbanSquare,
  LogOut,
  Menu,
  Megaphone,
  Settings,
  Smartphone,
  Users,
  Workflow,
} from "lucide-react";

import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";

export const Route = createFileRoute("/_authenticated/painel")({
  component: PainelLayout,
});

const links = [
  { to: "/painel", label: "Visão geral", icon: BarChart3, exact: true },
  { to: "/painel/conexoes", label: "Conexões", icon: Smartphone },
  { to: "/painel/conversas", label: "Conversas", icon: Inbox },
  { to: "/painel/contatos", label: "Contatos", icon: Users },
  { to: "/painel/campanhas", label: "Campanhas", icon: Megaphone },
  { to: "/painel/funis", label: "Funis", icon: Workflow },
  { to: "/painel/crm", label: "CRM", icon: KanbanSquare },
  { to: "/painel/agenda", label: "Agenda", icon: CalendarClock },
  { to: "/painel/ia", label: "Agente de IA", icon: Bot },
  { to: "/painel/configuracoes", label: "Configurações", icon: Settings },
] as const;

function PainelLayout() {
  const { data: org } = useOrg();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r border-border bg-sidebar p-4 transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link to="/painel" onClick={() => setOpen(false)}>
          <Logo />
        </Link>

        <nav className="mt-6 space-y-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: "exact" in l ? l.exact : false }}
              activeProps={{ className: "bg-primary/15 text-foreground" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="absolute inset-x-4 bottom-4 space-y-3">
          {org && (
            <div className="rounded-lg border border-border bg-surface p-3">
              <p className="truncate text-sm font-medium">{org.name}</p>
              <Badge variant="outline" className="mt-1 capitalize">
                Plano {org.plan}
              </Badge>
            </div>
          )}
          <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-border px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-md border border-border"
            aria-label="Abrir menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <Logo />
        </header>
        <main className="min-w-0 flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
