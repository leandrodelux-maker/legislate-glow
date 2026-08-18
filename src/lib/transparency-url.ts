export function getTransparencyUrl(baseUrl: string, path = "") {
  const base = new URL(baseUrl.trim());
  const cleanPath = path.trim().replace(/^\/+/, "");
  const cleanBase = base.href.replace(/\/+$/, "");
  return cleanPath ? `${cleanBase}/${cleanPath}` : `${cleanBase}/`;
}
