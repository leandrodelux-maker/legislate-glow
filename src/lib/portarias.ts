// Portarias da Câmara Municipal de Cachoeira de Goiás.
// Os PDFs foram baixados do portal oficial e hospedados neste site
// (CDN de assets do próprio projeto) — não dependem mais do site antigo.
import type { LegalDocument } from "@/components/document-library";

import p001 from "@/assets/portarias/7383.pdf.asset.json";
import p002 from "@/assets/portarias/7393.pdf.asset.json";
import p003 from "@/assets/portarias/7392.pdf.asset.json";
import p004 from "@/assets/portarias/7390.pdf.asset.json";
import p005 from "@/assets/portarias/7394.pdf.asset.json";
import p006 from "@/assets/portarias/7391.pdf.asset.json";
import p007 from "@/assets/portarias/7387.pdf.asset.json";
import p008 from "@/assets/portarias/7384.pdf.asset.json";
import p009 from "@/assets/portarias/7386.pdf.asset.json";
import p011 from "@/assets/portarias/7396.pdf.asset.json";

type PortariaSource = {
  numero: string;
  ementa: string;
  asset: { url: string; size: number };
};

const SOURCES: PortariaSource[] = [
  { numero: "001", ementa: "Nomeia Tesoureiro(a) e dá outras providências.", asset: p001 },
  { numero: "002", ementa: "Nomeia Chefe de Controle Interno e dá outras providências.", asset: p002 },
  { numero: "003", ementa: "Nomeia Pregoeiro e Equipe de Apoio e dá outras providências.", asset: p003 },
  { numero: "004", ementa: "Nomeia Comissão de Licitação e dá outras providências.", asset: p004 },
  {
    numero: "005",
    ementa:
      "Regulamenta a concessão de diárias a vereadores e servidores a serviço da Câmara.",
    asset: p005,
  },
  { numero: "006", ementa: "Nomeia Chefe do Departamento Pessoal e dá outras providências.", asset: p006 },
  {
    numero: "007",
    ementa: "Nomeia responsável pelo Departamento Contábil e dá outras providências.",
    asset: p007,
  },
  {
    numero: "008",
    ementa: "Nomeia responsável pelo Departamento Jurídico e dá outras providências.",
    asset: p008,
  },
  { numero: "009", ementa: "Nomeia responsável pelo Patrimônio e dá outras providências.", asset: p009 },
  {
    numero: "011",
    ementa: "Dispõe sobre concessão de gratificação a servidora e dá outras providências.",
    asset: p011,
  },
];

function formatSize(bytes: number) {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

/** Documentos das portarias, prontos para o `DocumentLibrary`. */
export const PORTARIAS_DOCUMENTS: LegalDocument[] = SOURCES.map((p) => ({
  title: `Portaria nº ${p.numero}/2025`,
  description: `${p.ementa} (PDF · ${formatSize(p.asset.size)})`,
  downloadUrl: p.asset.url,
  // Arquivo hospedado no próprio site: o navegador renderiza o PDF direto.
  viewerUrl: p.asset.url,
}));
