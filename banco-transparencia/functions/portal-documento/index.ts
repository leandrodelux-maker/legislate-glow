import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

// Entrega ao cidadão um arquivo anexado no Portal da Transparência (edital, contrato, planilha...).
// O portal Megasoft só libera o arquivo com o token público que ele mesmo distribui a todo visitante
// (/api/configuracao/carregamento-inicial); esta função faz a mesma chamada que o botão "BAIXAR" do portal
// e devolve o arquivo com o nome original, para o link funcionar direto no site.
//
// Uso: GET /functions/v1/portal-documento?codigo=123&nome=Contrato.pdf
//      Leis citadas nas páginas, como o portal as busca (resposta 404 quando a lei não foi publicada):
//      ?tela=Estrutura de Remuneração        → documento da tela (botão "Lei de Regulamentação")
//      ?local=1&tipo=12                       → documento por local e tipo (botão "Legislação Diárias")
//      Leis do orçamento e anexos (tipos de relatório: 7 PPA, 8 LDO, 9 LOA, 3 Metas Fiscais):
//      ?lrf-indice=7                          → JSON com os anos publicados, a lei e os anexos de cada ano
//      ?lrf=7&ano=2025                        → arquivo da lei do ano (PDF ou ZIP)
//      ?anexo=77&tipo=7&ano=2025[&mes=4]      → PDF do anexo, gerado pelo MegaAdmWeb
//      Relatórios periódicos da LRF (tipos 1 RREO bimestral, 2 RGF quadrimestral):
//      ?lrf-periodos=1                        → JSON com os anexos publicados em cada período dos últimos anos

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEFAULT_BASE = Deno.env.get('PORTAL_BASE_URL') ?? '';
const TIPOS: Record<string, string> = {
  pdf: 'application/pdf',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  odt: 'application/vnd.oasis.opendocument.text',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  csv: 'text/csv',
  txt: 'text/plain',
  zip: 'application/zip',
  rar: 'application/vnd.rar',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

// O portal entrega dois tokens públicos: o dele e o do MegaAdmWeb (anexos da LRF e das leis do orçamento).
type Portal = { base: string; token: string; adm: string; tokenAdm: string; validoAte: number };
let cache: Portal | null = null;

async function portal(): Promise<Portal> {
  if (cache && cache.validoAte > Date.now()) return cache;
  let base = DEFAULT_BASE;
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data } = await supabase.from('configuracoes').select('valor').eq('chave', 'transparencia_urls').maybeSingle();
    base = ((data?.valor as any)?.base_url || DEFAULT_BASE).replace(/\/$/, '');
  } catch (e) { console.error('Falha ao ler a configuração, usando o portal padrão:', e); }
  if (!base) throw new Error('Defina o secret PORTAL_BASE_URL com o link do portal');
  const r = await fetch(`${base}/api/configuracao/carregamento-inicial`, { headers: { Referer: `${base}/` } });
  if (!r.ok) throw new Error(`Portal indisponível (${r.status})`);
  const cfg = await r.json();
  if (!cfg?.tokenPortal) throw new Error('O portal não informou o token de acesso');
  cache = { base, token: cfg.tokenPortal, adm: String(cfg.urlDoMegaAdmWeb || ''), tokenAdm: String(cfg.tokenMegaAdmWeb || ''), validoAte: Date.now() + 30 * 60 * 1000 };
  return cache;
}

// Arquivo devolvido pelo portal como JSON { bytes (base64), extensao }; corpo vazio = nada publicado.
async function documentoEmBase64(caminho: string): Promise<{ dados: Uint8Array; extensao: string } | null> {
  const { base, token } = await portal();
  const r = await fetch(`${base}/api/gestao-eletronica-de-documentos/${caminho}`, {
    headers: { Authorization: `Bearer ${token}`, 'cliente-integrado': 'megasoft-portal-da-transparencia', Referer: `${base}/` },
  });
  if (r.status === 401 || r.status === 403) { cache = null; throw new Error('Token recusado pelo portal'); }
  const texto = r.ok ? await r.text() : '';
  if (!texto.trim()) return null;
  const json = JSON.parse(texto);
  if (!json?.bytes) return null;
  const bin = atob(json.bytes);
  const dados = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) dados[i] = bin.charCodeAt(i);
  return { dados, extensao: String(json.extensao || '.pdf').replace(/^\./, '').toLowerCase() };
}

const cabecalhos = (token: string, base: string) => ({ Authorization: `Bearer ${token}`, 'cliente-integrado': 'megasoft-portal-da-transparencia', Referer: `${base}/` });

// Índice das leis do orçamento de um tipo: anos com lei ou anexos publicados (os 10 mais recentes).
const indices = new Map<number, { dados: unknown; validoAte: number }>();
async function indiceLrf(tipo: number) {
  const guardado = indices.get(tipo);
  if (guardado && guardado.validoAte > Date.now()) return guardado.dados;
  const p = await portal();
  const adm = async (caminho: string) => {
    const r = await fetch(`${p.adm}${caminho}`, { headers: cabecalhos(p.tokenAdm, p.base) });
    if (!r.ok) return null;
    const t = await r.text();
    return t.trim() ? JSON.parse(t) : null;
  };
  const anexos: { codigo: number; descricao: string }[] = (await adm(`responsabilidadefiscal/anexos-por-tipo-relatorio/${tipo}`)) ?? [];
  const ultimo = Number(await adm(`responsabilidadefiscal/ultimo-ano-publicado-por-tipo-relatorio/${tipo}`)) || new Date().getFullYear();
  const anos = await Promise.all(Array.from({ length: 10 }, (_, i) => ultimo + 1 - i).map(async (ano) => {
    const q = new URLSearchParams({ codigoDoOrgao: '', ano: String(ano), mes: '1', codigoDoRelatorio: String(anexos[0]?.codigo ?? ''), tipoDoRelatorio: String(tipo), baixarLei: 'true', extensao: 'pdf' });
    const publicados: { codigo: number }[] = (await adm(`responsabilidadefiscal/anexos-publicados-por-tipo-relatorio?${q}`)) ?? [];
    const r = await fetch(`${p.base}/api/gestao-eletronica-de-documentos/baixar-nome-lrf?tipo=${tipo}&ano=${ano}`, { headers: cabecalhos(p.token, p.base) });
    const lei = r.ok ? (await r.text()).trim() || null : null;
    return { ano, lei, anexos: [...new Set(publicados.map((a) => a.codigo))] };
  }));
  const dados = { tipo, anexos: anexos.map(({ codigo, descricao }) => ({ codigo, descricao })), anos: anos.filter((a) => a.lei || a.anexos.length) };
  indices.set(tipo, { dados, validoAte: Date.now() + 60 * 60 * 1000 });
  return dados;
}

// Índice dos relatórios periódicos (RREO, RGF): para cada ano, os anexos publicados em cada mês de
// fechamento de período (bimestre 2, 4... ou quadrimestre 4, 8, 12). Seis anos, do mais recente.
const periodicos = new Map<number, { dados: unknown; validoAte: number }>();
async function indicePeriodos(tipo: number) {
  const guardado = periodicos.get(tipo);
  if (guardado && guardado.validoAte > Date.now()) return guardado.dados;
  const p = await portal();
  const adm = async (caminho: string) => {
    const r = await fetch(`${p.adm}${caminho}`, { headers: cabecalhos(p.tokenAdm, p.base) });
    if (!r.ok) return null;
    const t = await r.text();
    return t.trim() ? JSON.parse(t) : null;
  };
  const anexos: { codigo: number; descricao: string; periodo?: { descricao?: string; meses?: number[] } }[] =
    (await adm(`responsabilidadefiscal/anexos-por-tipo-relatorio/${tipo}`)) ?? [];
  const meses = [...new Set(anexos.flatMap((a) => a.periodo?.meses ?? []))].sort((a, b) => a - b);
  const ultimo = Number(await adm(`responsabilidadefiscal/ultimo-ano-publicado-por-tipo-relatorio/${tipo}`)) || new Date().getFullYear();
  const atualizado = await adm(`responsabilidadefiscal/data-de-atualizacao?tipoDeRelatorio=${tipo}`);
  const anos = [];
  for (let ano = Math.max(ultimo, new Date().getFullYear()); ano > ultimo - 6; ano--) {
    const periodos = await Promise.all(meses.map(async (mes) => {
      const q = new URLSearchParams({ codigoDoOrgao: '', ano: String(ano), mes: String(mes), codigoDoRelatorio: String(anexos[0]?.codigo ?? ''), tipoDoRelatorio: String(tipo), extensao: 'pdf' });
      const publicados: { codigo: number }[] = (await adm(`responsabilidadefiscal/anexos-publicados-por-tipo-relatorio?${q}`)) ?? [];
      return { mes, anexos: [...new Set(publicados.map((a) => a.codigo))] };
    }));
    anos.push({ ano, periodos });
  }
  const dados = {
    tipo, meses, atualizadoEm: typeof atualizado === 'string' ? atualizado : null,
    periodicidade: anexos[0]?.periodo?.descricao ?? null,
    anexos: anexos.map((a) => ({ codigo: a.codigo, descricao: a.descricao, meses: a.periodo?.meses ?? [] })),
    anos: anos.filter((a, i) => i === 0 || a.periodos.some((x) => x.anexos.length)),
  };
  periodicos.set(tipo, { dados, validoAte: Date.now() + 60 * 60 * 1000 });
  return dados;
}

const arquivo = (corpo: BodyInit, nome: string, tipo: string, ver: boolean) => new Response(corpo, {
  headers: {
    ...corsHeaders,
    'Content-Type': tipo,
    'Content-Disposition': `${ver ? 'inline' : 'attachment'}; filename="${nome.replace(/[^\x20-\x7e]/g, '_')}"; filename*=UTF-8''${encodeURIComponent(nome)}`,
    'Cache-Control': 'public, max-age=3600',
  },
});

const erro = (status: number, mensagem: string) =>
  new Response(JSON.stringify({ success: false, error: mensagem }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'GET') return erro(405, 'Método não permitido');
  const params = new URL(req.url).searchParams;
  const numeroOk = (v: string | null, max = 6) => v != null && new RegExp(`^\\d{1,${max}}$`).test(v);

  // ---------- Leis do orçamento (PPA, LDO, LOA) e anexos ----------
  if (params.has('lrf-indice') || params.has('lrf-periodos') || params.has('lrf') || params.has('anexo')) {
    const tipo = params.get('lrf-indice') ?? params.get('lrf-periodos') ?? params.get('lrf') ?? params.get('tipo');
    if (!numeroOk(tipo, 2)) return erro(400, 'Tipo de relatório inválido');
    try {
      if (params.has('lrf-periodos')) {
        return new Response(JSON.stringify(await indicePeriodos(Number(tipo))), { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' } });
      }
      if (params.has('lrf-indice')) {
        return new Response(JSON.stringify(await indiceLrf(Number(tipo))), { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=3600' } });
      }
      const ano = params.get('ano');
      if (!numeroOk(ano, 4)) return erro(400, 'Ano inválido');
      const p = await portal();
      const ver = params.get('ver') === '1';
      if (params.has('lrf')) {
        const nome = await fetch(`${p.base}/api/gestao-eletronica-de-documentos/baixar-nome-lrf?tipo=${tipo}&ano=${ano}`, { headers: cabecalhos(p.token, p.base) });
        const base = nome.ok ? (await nome.text()).trim() : '';
        if (!base) return erro(404, 'Lei não publicada no Portal da Transparência');
        const r = await fetch(`${p.base}/api/gestao-eletronica-de-documentos/baixar-lrf?tipo=${tipo}&ano=${ano}`, { headers: cabecalhos(p.token, p.base) });
        if (!r.ok || !r.body) return erro(r.status === 404 ? 404 : 502, `O portal não entregou a lei (${r.status})`);
        const zip = (r.headers.get('content-type') || '').includes('zip');
        return arquivo(r.body, `${base}-${ano}.${zip ? 'zip' : 'pdf'}`, zip ? TIPOS.zip : TIPOS.pdf, ver && !zip);
      }
      const anexo = params.get('anexo');
      if (!numeroOk(anexo, 4) || !p.adm) return erro(400, 'Anexo inválido');
      const mes = params.get('mes') ?? '1';
      if (!numeroOk(mes, 2)) return erro(400, 'Mês inválido');
      const q = new URLSearchParams({ codigoDoOrgao: '', ano: String(ano), mes, codigoDoRelatorio: String(anexo), tipoDoRelatorio: String(tipo), extensao: 'pdf' });
      const r = await fetch(`${p.adm}lrf/${anexo}?${q}`, { headers: cabecalhos(p.tokenAdm, p.base) });
      if (!r.ok || !r.body) return erro(r.status === 404 ? 404 : 502, `O portal não entregou o anexo (${r.status})`);
      const nome = (params.get('nome') || `anexo-${anexo}-${ano}`).replace(/[\r\n"\\/]/g, '').slice(0, 120);
      return arquivo(r.body, `${nome}.pdf`, TIPOS.pdf, ver);
    } catch (e) {
      console.error('Erro nas leis do orçamento:', e);
      return erro(502, e instanceof Error ? e.message : 'Falha ao acessar o portal');
    }
  }

  const tela = params.get('tela');
  const local = params.get('local'), tipo = params.get('tipo');
  if (tela != null || local != null || tipo != null) {
    let caminho: string;
    if (tela != null) {
      if (!/^[\p{L}\p{N} .,()-]{2,80}$/u.test(tela)) return erro(400, 'Tela inválida');
      caminho = `baixar?tabela=DOCUMENTO_PORTAL_DA_TRANSPARENCIA&nomeDaTela=${encodeURIComponent(tela)}`;
    } else {
      if (!/^\d{1,4}$/.test(local ?? '') || !/^\d{1,4}$/.test(tipo ?? '')) return erro(400, 'Local ou tipo inválido');
      caminho = `baixar-documentos-portal?localDePublicacao=${local}&tipoDoDocumento=${tipo}`;
    }
    try {
      const doc = await documentoEmBase64(caminho).catch(async (e) => { if (cache === null) return documentoEmBase64(caminho); throw e; });
      if (!doc) return erro(404, 'Documento não publicado no Portal da Transparência');
      const nome = `${(params.get('nome') || tela || 'documento').replace(/[\r\n"\\/]/g, '').slice(0, 120)}.${doc.extensao}`;
      return new Response(new Uint8Array(doc.dados), {
        headers: {
          ...corsHeaders,
          'Content-Type': TIPOS[doc.extensao] || 'application/octet-stream',
          'Content-Disposition': `${params.get('ver') === '1' ? 'inline' : 'attachment'}; filename="${nome.replace(/[^\x20-\x7e]/g, '_')}"; filename*=UTF-8''${encodeURIComponent(nome)}`,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch (e) {
      console.error('Erro ao buscar documento da tela:', e);
      return erro(502, e instanceof Error ? e.message : 'Falha ao acessar o portal');
    }
  }

  const codigo = params.get('codigo') ?? '';
  if (!/^\d{1,12}$/.test(codigo)) return erro(400, 'Código do arquivo inválido');
  const nome = (params.get('nome') || `documento-${codigo}.pdf`).replace(/[\r\n"\\/]/g, '').slice(0, 180);
  const extensao = nome.split('.').pop()?.toLowerCase() ?? '';

  try {
    const baixar = async () => {
      const { base, token } = await portal();
      return fetch(`${base}/api/gestao-eletronica-de-documentos/baixar-documento/${codigo}`, {
        headers: { Authorization: `Bearer ${token}`, 'cliente-integrado': 'megasoft-portal-da-transparencia', Referer: `${base}/` },
      });
    };
    let r = await baixar();
    if (r.status === 401 || r.status === 403) { cache = null; r = await baixar(); } // token renovado pelo portal
    if (!r.ok || !r.body) return erro(r.status === 404 ? 404 : 502, `O portal não entregou o arquivo (${r.status})`);
    const tipo = TIPOS[extensao] || r.headers.get('content-type') || 'application/octet-stream';
    const modo = params.get('ver') === '1' ? 'inline' : 'attachment';
    return new Response(r.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': tipo,
        'Content-Disposition': `${modo}; filename="${nome.replace(/[^\x20-\x7e]/g, '_')}"; filename*=UTF-8''${encodeURIComponent(nome)}`,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (e) {
    console.error('Erro ao baixar documento do portal:', e);
    return erro(502, e instanceof Error ? e.message : 'Falha ao acessar o portal');
  }
});
