import { useQuery } from "@tanstack/react-query";
import { Link } from "@/lib/roteador-transparencia";
import { motion } from "framer-motion";
import { Monitor, Scale, ShieldCheck, Network, Accessibility, FileText, ExternalLink, Radar } from "lucide-react";
import TransparencyLayout from "@/components/transparency/TransparencyLayout";
import usePageSEO from "@/hooks/usePageSEO";
import { useInstitutionalData } from "@/hooks/useInstitutionalData";
import { supabase } from "@/integrations/transparencia/client";

const principios = [
  { icon: Monitor, title: "Serviços digitais", text: "Oferta preferencial de serviços públicos por meios digitais, acessíveis pela internet e dispositivos móveis." },
  { icon: Network, title: "Interoperabilidade", text: "Integração e compartilhamento de dados entre órgãos, evitando que o cidadão apresente documentos já existentes." },
  { icon: ShieldCheck, title: "Segurança e privacidade", text: "Proteção de dados pessoais conforme a LGPD (Lei 13.709/2018) e segurança da informação." },
  { icon: Accessibility, title: "Acessibilidade", text: "Serviços e informações acessíveis a todas as pessoas, inclusive com deficiência." },
  { icon: FileText, title: "Dados abertos", text: "Publicação de dados em formato aberto e legível por máquina, promovendo a transparência ativa." },
  { icon: Scale, title: "Simplificação", text: "Desburocratização, uso de assinatura eletrônica e redução de exigências desnecessárias." },
];

const GovernoDigitalPage = () => {
  const { data: inst } = useInstitutionalData();
  const municipio = inst?.municipio || "o Município";

  usePageSEO({
    title: "Governo Digital - Lei 14.129/2021",
    description: `Regulamentação e ações de Governo Digital de ${municipio} conforme a Lei Federal nº 14.129/2021.`,
    ogType: "article",
  });

  const { data: atos = [] } = useQuery({
    queryKey: ["governo-digital-atos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("diario_oficial")
        .select("id, numero, titulo, tipo, data_publicacao, arquivo_url")
        .eq("ativo", true)
        .or("titulo.ilike.%14.129%,titulo.ilike.%governo digital%,descricao.ilike.%14.129%")
        .order("data_publicacao", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <TransparencyLayout
      title="Governo Digital"
      description="Regulamentação municipal da Lei Federal nº 14.129/2021 (Lei do Governo Digital)."
      breadcrumbs={[
        { label: "Início", href: "/" },
        { label: "Transparência", href: "/transparencia" },
        { label: "Governo Digital" },
      ]}
    >
      <div className="space-y-8">
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-primary/20 rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">O que é a Lei do Governo Digital?</h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            A <strong>Lei Federal nº 14.129, de 29 de março de 2021</strong>, estabelece princípios, regras e instrumentos
            para o aumento da eficiência da administração pública, especialmente por meio da desburocratização, da inovação,
            da transformação digital e da participação do cidadão. Sua aplicação aos municípios depende de ato normativo
            próprio, conforme o art. 2º, inciso III da referida lei.
          </p>
          <a href="https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2021/lei/l14129.htm" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-primary hover:underline">
            Ler a Lei 14.129/2021 na íntegra <ExternalLink className="h-4 w-4" />
          </a>
        </motion.section>

        <section>
          <h2 className="text-lg md:text-xl font-bold text-foreground mb-4">Princípios adotados</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {principios.map((p) => (
              <div key={p.title} className="bg-card border border-border rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <p.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl p-6 md:p-8">
          <h2 className="text-lg md:text-xl font-bold text-foreground mb-2">Ato de regulamentação municipal</h2>
          {atos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              O decreto municipal de regulamentação será disponibilizado aqui assim que publicado no Diário Oficial.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {atos.map((a) => (
                <li key={a.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{a.tipo} nº {a.numero} — {a.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      Publicado em {new Date(a.data_publicacao + "T12:00:00").toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  {a.arquivo_url && (
                    <a href={a.arquivo_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                      Abrir documento <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <Link to="/transparencia/atricon" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          <Radar className="h-4 w-4" /> Voltar ao Radar ATRICON
        </Link>
      </div>
    </TransparencyLayout>
  );
};

export default GovernoDigitalPage;
