import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, ShieldCheck, Star, X } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { comparison, differentiators, features, plans } from "@/lib/site-content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SharkZapp — IA que vende no WhatsApp 24h por dia" },
      {
        name: "description",
        content:
          "Automatize vendas e atendimento no WhatsApp com IA, disparos em massa, funis, CRM e caixa de entrada compartilhada. API oficial da Meta.",
      },
      { property: "og:title", content: "SharkZapp — IA que vende no WhatsApp 24h por dia" },
      {
        property: "og:description",
        content:
          "IA, disparos, funis, CRM e inbox compartilhada em uma só plataforma, pela API oficial da Meta.",
      },
    ],
  }),
  component: Home,
});

function ChatPreview() {
  const messages = [
    { from: "cliente", text: "Oi, ainda tem o plano anual com desconto?" },
    { from: "ia", text: "Tenho sim, Ana! O anual sai por 12x de R$ 197 — 20% abaixo do mensal." },
    { from: "cliente", text: "E instala rápido?" },
    { from: "ia", text: "Em 10 minutos você já está atendendo. Quer que eu gere seu link agora?" },
    { from: "cliente", text: "Pode gerar 🙌" },
  ];

  return (
    <div className="surface-panel rounded-2xl p-4 shadow-deep">
      <div className="flex items-center gap-3 border-b border-border/60 pb-3">
        <div className="h-9 w-9 rounded-full bg-shark" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold">Ana Duarte</p>
          <p className="text-xs text-primary">respondida em 4 segundos pela IA</p>
        </div>
      </div>
      <div className="space-y-2 pt-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
              m.from === "ia"
                ? "ml-auto bg-primary/15 text-foreground"
                : "bg-surface-strong text-foreground"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function Home() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-sonar opacity-60" aria-hidden="true" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div>
            <Badge variant="outline" className="border-primary/40 text-primary">
              <ShieldCheck className="mr-1 h-3.5 w-3.5" /> API oficial da Meta
            </Badge>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              A IA que caça vendas no seu <span className="text-shark">WhatsApp</span> enquanto você dorme
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Funis, disparos, CRM e caixa de entrada compartilhada em uma só plataforma. O SharkZapp
              atende, qualifica e fecha — e devolve para o seu time só o que importa.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="shadow-glow">
                <Link to="/auth" search={{ modo: "cadastro" }}>
                  Criar minha conta <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/planos">Ver planos</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" /> Sem fidelidade
              </span>
              <span>Configuração em minutos</span>
              <span>Suporte em português</span>
            </div>
          </div>
          <ChatPreview />
        </div>
      </section>

      {/* Funções */}
      <section className="border-t border-border/60 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="max-w-2xl text-3xl font-bold sm:text-4xl">
            Tudo que sua operação de WhatsApp precisa, sem remendar ferramentas
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="border-border/60 bg-surface/60">
                <CardContent className="space-y-3 p-6">
                  <f.icon className="h-6 w-6 text-primary" />
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="border-t border-border/60 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-3">
          {differentiators.map((d) => (
            <div key={d.title} className="space-y-3">
              <d.icon className="h-7 w-7 text-primary" />
              <h3 className="text-xl font-semibold">{d.title}</h3>
              <p className="text-muted-foreground">{d.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparativo */}
      <section className="border-t border-border/60 py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="text-3xl font-bold sm:text-4xl">Por que trocar a ferramenta atual</h2>
          <div className="mt-8 overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-strong">
                <tr>
                  <th className="px-4 py-3 font-medium">Recurso</th>
                  <th className="px-4 py-3 font-medium text-primary">SharkZapp</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Concorrentes</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.label} className="border-t border-border/60">
                    <td className="px-4 py-3">{row.label}</td>
                    <td className="px-4 py-3">
                      {row.shark ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.others}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Planos resumidos */}
      <section className="border-t border-border/60 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold sm:text-4xl">Planos diretos ao ponto</h2>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {plans.map((p) => (
              <Card
                key={p.id}
                className={p.highlight ? "border-primary/60 bg-surface shadow-glow" : "border-border/60 bg-surface/60"}
              >
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{p.name}</h3>
                    {p.highlight && <Badge>Mais escolhido</Badge>}
                  </div>
                  <p className="text-3xl font-bold">
                    R$ {p.price}
                    <span className="text-base font-normal text-muted-foreground">/mês</span>
                  </p>
                  <p className="text-sm text-muted-foreground">{p.tagline}</p>
                  <Button asChild className="w-full" variant={p.highlight ? "default" : "outline"}>
                    <Link to="/planos">Ver detalhes</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-border/60 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Seu WhatsApp pode vender hoje à noite</h2>
          <p className="mt-4 text-muted-foreground">
            Crie sua conta, conecte o número e coloque a IA para trabalhar no seu lugar.
          </p>
          <Button asChild size="lg" className="mt-8 shadow-glow">
            <Link to="/auth" search={{ modo: "cadastro" }}>
              Começar agora <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
