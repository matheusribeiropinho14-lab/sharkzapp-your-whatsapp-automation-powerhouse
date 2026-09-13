import { createFileRoute } from "@tanstack/react-router";

import { SiteLayout } from "@/components/site/SiteLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faq } from "@/lib/site-content";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Perguntas frequentes — SharkZapp" },
      {
        name: "description",
        content:
          "Dúvidas sobre API oficial da Meta, disparo em massa, funis, atendentes, dados e cancelamento no SharkZapp.",
      },
      { property: "og:title", content: "Perguntas frequentes — SharkZapp" },
      {
        property: "og:description",
        content: "Tudo sobre API oficial, disparos, funis, equipe e cancelamento.",
      },
    ],
  }),
  component: Faq,
});

function Faq() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-bold sm:text-5xl">Perguntas frequentes</h1>
        <Accordion type="single" collapsible className="mt-8">
          {faq.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </SiteLayout>
  );
}
