import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, MessageCircle } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Fale com o time do SharkZapp" },
      {
        name: "description",
        content:
          "Tire dúvidas sobre planos, conexão com a API oficial do WhatsApp e migração de outra ferramenta para o SharkZapp.",
      },
      { property: "og:title", content: "Fale com o time do SharkZapp" },
      {
        property: "og:description",
        content: "Dúvidas sobre planos, conexão oficial e migração.",
      },
    ],
  }),
  component: Contato,
});

function Contato() {
  const [sending, setSending] = useState(false);

  return (
    <SiteLayout>
      <section className="mx-auto grid max-w-5xl gap-10 px-4 py-16 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold sm:text-5xl">Vamos conversar</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Conte o tamanho da sua operação e a gente indica o caminho mais curto para colocar o
            SharkZapp para rodar.
          </p>
          <div className="mt-8 space-y-3 text-sm">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> contato@sharkzapp.com.br
            </p>
            <p className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" /> Atendimento em horário comercial
            </p>
          </div>
        </div>

        <Card className="border-border/60 bg-surface/60">
          <CardContent className="p-6">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setSending(true);
                const form = e.currentTarget;
                setTimeout(() => {
                  setSending(false);
                  form.reset();
                  toast.success("Mensagem registrada! Retornamos em breve.");
                }, 600);
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" name="nome" required placeholder="Seu nome" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" name="email" type="email" required placeholder="voce@empresa.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" name="whatsapp" placeholder="(11) 99999-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mensagem">Como podemos ajudar?</Label>
                <Textarea id="mensagem" name="mensagem" rows={4} required />
              </div>
              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? "Enviando..." : "Enviar mensagem"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </SiteLayout>
  );
}
