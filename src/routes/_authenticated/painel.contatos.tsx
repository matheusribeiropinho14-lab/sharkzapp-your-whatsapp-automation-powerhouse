import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useOrg } from "@/hooks/useOrg";

export const Route = createFileRoute("/_authenticated/painel/contatos")({
  head: () => ({ meta: [{ title: "Contatos — SharkZapp" }, { name: "robots", content: "noindex" }] }),
  component: Contatos,
});

function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}

function Contatos() {
  const { data: org } = useOrg();
  const orgId = org?.organizationId;
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", tags: "" });

  const { data: contacts = [] } = useQuery({
    queryKey: ["contacts", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("contacts").insert({
        organization_id: orgId!,
        name: form.name,
        phone: onlyDigits(form.phone),
        email: form.email || null,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Contato adicionado.");
      setForm({ name: "", phone: "", email: "", tags: "" });
      qc.invalidateQueries({ queryKey: ["contacts", orgId] });
    },
    onError: (e: Error) =>
      toast.error(e.message.includes("duplicate") ? "Esse telefone já está na lista." : e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts", orgId] }),
  });

  async function importCsv(file: File) {
    const text = await file.text();
    const rows = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 2000);
    const payload = rows
      .map((line) => line.split(/[,;]/).map((c) => c.trim().replace(/^"|"$/g, "")))
      .filter((cols) => cols.length >= 2 && onlyDigits(cols[1] ?? "").length >= 10)
      .map((cols) => ({
        organization_id: orgId!,
        name: cols[0] || "Sem nome",
        phone: onlyDigits(cols[1] ?? ""),
        email: cols[2] || null,
        tags: cols[3] ? [cols[3]] : [],
      }));

    if (payload.length === 0) {
      toast.error("Nenhuma linha válida. Use: nome,telefone,email,etiqueta");
      return;
    }
    const { error } = await supabase.from("contacts").upsert(payload, {
      onConflict: "organization_id,phone",
      ignoreDuplicates: true,
    });
    if (error) toast.error(error.message);
    else {
      toast.success(`${payload.length} contatos processados.`);
      qc.invalidateQueries({ queryKey: ["contacts", orgId] });
    }
  }

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(onlyDigits(search)),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contatos</h1>
          <p className="mt-1 text-muted-foreground">{contacts.length} contatos na sua base.</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-surface">
          <Upload className="h-4 w-4" /> Importar CSV
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importCsv(f);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      <Card className="border-border/60 bg-surface/60">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold">Novo contato</h2>
          <form
            className="mt-4 grid gap-4 sm:grid-cols-4"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tel">Telefone (com DDI)</Label>
              <Input
                id="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="5511999990000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mail">E-mail</Label>
              <Input
                id="mail"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Etiquetas</Label>
              <Input
                id="tags"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="lead, vip"
              />
            </div>
            <div className="sm:col-span-4">
              <Button type="submit" disabled={create.isPending}>
                Adicionar contato
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Input
        placeholder="Buscar por nome ou telefone"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-strong">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">Etiquetas</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t border-border/60">
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {c.tags.map((t) => (
                      <Badge key={t} variant="outline">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => remove.mutate(c.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum contato encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
