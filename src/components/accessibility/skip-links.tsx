export function SkipLinks() {
  const focusTarget = (selector: string) => {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: false });
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="a11y-skip-links" aria-label="Atalhos de acessibilidade">
      <a
        href="#conteudo"
        onClick={(e) => {
          e.preventDefault();
          focusTarget("#conteudo");
        }}
      >
        Ir para o conteúdo
      </a>
      <a
        href="#menu-principal"
        onClick={(e) => {
          e.preventDefault();
          focusTarget("#menu-principal");
        }}
      >
        Ir para o menu
      </a>
      <a
        href="#busca"
        onClick={(e) => {
          e.preventDefault();
          const el = document.querySelector<HTMLInputElement>("#busca, input[type='search'], [role='search'] input");
          if (el) el.focus();
        }}
      >
        Ir para a busca
      </a>
      <a
        href="#acessibilidade"
        onClick={(e) => {
          e.preventDefault();
          document.querySelector<HTMLButtonElement>("#a11y-toggle")?.click();
        }}
      >
        Acessibilidade
      </a>
    </nav>
  );
}
