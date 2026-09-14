import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

type Search = { modo?: "entrar" | "cadastro" };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    modo: search["modo"] === "cadastro" ? "cadastro" : "entrar",
  }),
  head: () => ({
    meta: [
      { title: "Entrar no SharkZapp" },
      {
        name: "description",
        content: "Acesse sua conta SharkZapp ou crie uma para automatizar suas vendas no WhatsApp.",
      },
      { property: "og:title", content: "Entrar no SharkZapp" },
      { property: "og:description", content: "Acesse o painel da sua operação de WhatsApp." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { modo } = Route.useSearch();
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(modo === "cadastro");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/painel", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/painel`,
            data: { full_name: name, company_name: company },
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Entrando...");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) navigate({ to: "/painel", replace: true });
      else toast.info("Confirme seu e-mail para continuar.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível continuar.";
      toast.error(
        message.includes("Invalid login credentials")
          ? "E-mail ou senha incorretos."
          : message.includes("already registered")
            ? "Este e-mail já tem conta. Faça login."
            : message,
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Não foi possível entrar com o Google.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/painel", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-abyss">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <Link to="/" className="mx-auto">
          <Logo />
        </Link>

        <Card className="mt-8 border-border/60 bg-surface/70 shadow-deep">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold">
              {isSignup ? "Criar sua conta" : "Entrar no painel"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isSignup
                ? "Leva menos de um minuto."
                : "Bem-vindo de volta. Suas conversas esperam por você."}
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {isSignup && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Seu nome</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Nome da empresa</Label>
                    <Input
                      id="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Aguarde..." : isSignup ? "Criar conta" : "Entrar"}
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
            </div>

            <Button variant="outline" className="w-full" onClick={handleGoogle} type="button">
              Continuar com o Google
            </Button>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {isSignup ? "Já tem conta?" : "Ainda não tem conta?"}{" "}
              <button
                type="button"
                className="font-medium text-primary hover:underline"
                onClick={() => setIsSignup((v) => !v)}
              >
                {isSignup ? "Entrar" : "Criar agora"}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
