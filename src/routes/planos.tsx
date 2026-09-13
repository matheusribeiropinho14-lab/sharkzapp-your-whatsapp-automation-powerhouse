import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { plans } from "@/lib/site-content";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos e preços do SharkZapp" },
      {
        name: "description",
        content:
          "Planos Start, Pro e Escala do SharkZapp: números conectados, contatos, mensagens mensais e atendentes inclusos. Sem fidelidade.",
      },
      { property: "og:title", content: "Planos e preços do SharkZapp" },
      {
        property: "og:description",
        content: "Start, Pro e Escala — escolha pelo volume de mensagens e tamanho do time.",
      },
    ],
  }),
  component: Planos,
});

function Planos() {
  return (
    <SiteLayout>
      <section className="border-b border-border/60 py-16">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">Escolha pelo tamanho da sua operação</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Todos os planos incluem API oficial da Meta, caixa de entrada compartilhada, campanhas e
            relatórios. Sem fidelidade, cancele quando quiser.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 lg:grid-cols-3">
          {plans.map((p) => (
            <Card
              key={p.id}
              className={
                p.highlight
                  ? "border-primary/60 bg-surface shadow-glow"
                  : "border-border/60 bg-surface/60"
              }
            >
              <CardContent className="flex h-full flex-col gap-5 p-7">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">{p.name}</h2>
                  {p.highlight && <Badge>Mais escolhido</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{p.tagline}</p>
                <p className="text-4xl font-bold">
                  R$ {p.price}
                  <span className="text-base font-normal text-muted-foreground">/mês</span>
                </p>
                <ul className="flex-1 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant={p.highlight ? "default" : "outline"} className="w-full">
                  <Link to="/auth" search={{ modo: "cadastro" }}>
                    Assinar {p.name}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-3xl px-4 text-center text-sm text-muted-foreground">
          Os custos de conversa cobrados pela Meta pela API oficial são faturados diretamente pela
          Meta na sua conta de anúncios e não estão incluídos na assinatura.
        </p>
      </section>
    </SiteLayout>
  );
}
