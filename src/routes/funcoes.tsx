import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { differentiators, features } from "@/lib/site-content";

export const Route = createFileRoute("/funcoes")({
  head: () => ({
    meta: [
      { title: "Funções do SharkZapp — IA, disparos, funis e CRM" },
      {
        name: "description",
        content:
          "Conheça todas as funções do SharkZapp: agente de IA, disparo em massa, funis visuais, CRM, inbox compartilhada, agendamentos e relatórios.",
      },
      { property: "og:title", content: "Funções do SharkZapp" },
      {
        property: "og:description",
        content: "IA, disparos, funis, CRM, inbox, agendamentos e relatórios no WhatsApp.",
      },
    ],
  }),
  component: Funcoes,
});

function Funcoes() {
  return (
    <SiteLayout>
      <section className="border-b border-border/60 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="max-w-3xl text-4xl font-bold sm:text-5xl">
            Cada função foi feita para uma coisa só: vender mais no WhatsApp
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Nada de módulos soltos. Contato, conversa, funil, venda e relatório vivem no mesmo lugar.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="border-border/60 bg-surface/60">
              <CardContent className="space-y-3 p-6">
                <f.icon className="h-6 w-6 text-primary" />
                <h2 className="text-lg font-semibold">{f.title}</h2>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-border/60 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-3">
          {differentiators.map((d) => (
            <div key={d.title} className="space-y-3">
              <d.icon className="h-7 w-7 text-primary" />
              <h2 className="text-xl font-semibold">{d.title}</h2>
              <p className="text-muted-foreground">{d.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border/60 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold">Quer ver funcionando na sua operação?</h2>
          <Button asChild size="lg" className="mt-6 shadow-glow">
            <Link to="/auth" search={{ modo: "cadastro" }}>
              Criar conta
            </Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
