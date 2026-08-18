// Helpers para os documentos oficiais publicados no portal institucional
// (WP File Download). Centralizado para que a mudança de host/plugin
// atualize todas as páginas de Atos Legislativos de uma só vez.

const WPFD_BASE =
  "https://camaradeadelandia.go.gov.br/wp-admin/admin-ajax.php?juwpfisadmin=false&action=wpfd&task=file.download";

/** URL de download direto do arquivo. */
export function WPFD_DOWNLOAD(categoryId: number, fileId: number) {
  return `${WPFD_BASE}&wpfd_category_id=${categoryId}&wpfd_file_id=${fileId}&token=`;
}

/** URL de pré-visualização (inline) do arquivo. */
export function WPFD_PREVIEW(categoryId: number, fileId: number) {
  return `${WPFD_DOWNLOAD(categoryId, fileId)}&preview=1`;
}

/** Visualizador embutido de PDF via Google Docs Viewer. */
export function buildGoogleViewer(fileUrl: string) {
  return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
}
