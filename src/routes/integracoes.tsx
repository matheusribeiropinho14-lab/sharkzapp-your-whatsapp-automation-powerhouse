import { createFileRoute } from "@tanstack/react-router";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { integrations } from "@/lib/site-content";

export const Route = createFileRoute("/integracoes")({
  head: () => ({
    meta: [
      { title: "Integrações do SharkZapp" },
      {
        name: "description",
        content:
          "Conecte o SharkZapp à API oficial do WhatsApp, webhooks, planilhas, checkouts, plataformas de curso e agenda.",
      },
      { property: "og:title", content: "Integrações do SharkZapp" },
      {
        property: "og:description",
        content: "WhatsApp Cloud API, webhooks, CSV, checkouts e agenda.",
      },
    ],
  }),
  component: Integracoes,
});

function Integracoes() {
  return (
    <SiteLayout>
      <section className="border-b border-border/60 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-4xl font-bold sm:text-5xl">Integrações</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            O SharkZapp conversa com o resto da sua operação por webhooks e importação de dados.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((i) => (
            <Card key={i.name} className="border-border/60 bg-surface/60">
              <CardContent className="space-y-2 p-6">
                <h2 className="text-lg font-semibold">{i.name}</h2>
                <p className="text-sm text-muted-foreground">{i.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
