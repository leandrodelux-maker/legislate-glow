import { useState } from "react";
import {
  Accessibility,
  Type,
  Minus,
  Plus,
  RotateCcw,
  Contrast,
  Sun,
  Moon,
  Droplet,
  Link as LinkIcon,
  BookOpen,
  AlignJustify,
  Space,
  Pause,
  MousePointer2,
  AlignHorizontalJustifyCenter,
  Eye,
  Volume2,
  Keyboard,
  ArrowDownToLine,
  Menu as MenuIcon,
  Search,
  Square,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useA11y, type ContrastMode } from "./accessibility-provider";

function focusSelector(selector: string, opts?: { click?: boolean }) {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;
  if (opts?.click && "click" in el) (el as HTMLButtonElement).click();
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.focus();
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

type ToggleCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick: () => void;
  ariaPressed?: boolean;
};

function ToggleCard({ icon: Icon, label, active, onClick, ariaPressed }: ToggleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ariaPressed ?? active}
      className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-3 text-center text-xs font-medium transition-colors min-h-[88px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="leading-tight">{label}</span>
    </button>
  );
}

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const { settings, update, reset, speakSelection, stopSpeaking, isSpeaking } = useA11y();

  const setContrast = (mode: ContrastMode) =>
    update("contrast", settings.contrast === mode ? "off" : mode);

  const changeFont = (delta: number) => {
    const next = Math.max(0.85, Math.min(1.6, +(settings.fontScale + delta).toFixed(2)));
    update("fontScale", next);
  };

  return (
    <>
      <button
        id="a11y-toggle"
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir painel de acessibilidade"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed right-3 top-1/2 z-[9999] flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl ring-4 ring-white/60 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 print:hidden"
      >
        <Accessibility className="h-7 w-7" aria-hidden="true" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto bg-white p-0 text-slate-900 sm:max-w-md"
          aria-label="Painel de acessibilidade"
        >
          <SheetHeader className="border-b border-slate-200 bg-primary p-5 text-primary-foreground">
            <SheetTitle className="flex items-center gap-2 text-primary-foreground">
              <Accessibility className="h-5 w-5" /> Acessibilidade
            </SheetTitle>
            <SheetDescription className="text-primary-foreground/85">
              Ajuste a leitura, contraste e navegação. As preferências ficam salvas neste navegador.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 p-5">
            <section aria-labelledby="a11y-fonte">
              <h3 id="a11y-fonte" className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Tamanho da fonte
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <ToggleCard icon={Minus} label="Diminuir" onClick={() => changeFont(-0.1)} />
                <ToggleCard
                  icon={Type}
                  label={`Atual ${(settings.fontScale * 100).toFixed(0)}%`}
                  onClick={() => update("fontScale", 1)}
                />
                <ToggleCard icon={Plus} label="Aumentar" onClick={() => changeFont(0.1)} />
              </div>
            </section>

            <section aria-labelledby="a11y-contraste">
              <h3 id="a11y-contraste" className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Contraste & Cores
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <ToggleCard
                  icon={Contrast}
                  label="Alto contraste"
                  active={settings.contrast === "high"}
                  onClick={() => setContrast("high")}
                />
                <ToggleCard
                  icon={Moon}
                  label="Contraste escuro"
                  active={settings.contrast === "dark"}
                  onClick={() => setContrast("dark")}
                />
                <ToggleCard
                  icon={Sun}
                  label="Contraste claro"
                  active={settings.contrast === "light"}
                  onClick={() => setContrast("light")}
                />
                <ToggleCard
                  icon={Droplet}
                  label="Escala de cinza"
                  active={settings.grayscale}
                  onClick={() => update("grayscale", !settings.grayscale)}
                />
                <ToggleCard
                  icon={LinkIcon}
                  label="Destacar links"
                  active={settings.highlightLinks}
                  onClick={() => update("highlightLinks", !settings.highlightLinks)}
                />
                <ToggleCard
                  icon={BookOpen}
                  label="Fonte p/ dislexia"
                  active={settings.dyslexiaFont}
                  onClick={() => update("dyslexiaFont", !settings.dyslexiaFont)}
                />
              </div>
            </section>

            <section aria-labelledby="a11y-leitura">
              <h3 id="a11y-leitura" className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Leitura & Movimento
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <ToggleCard
                  icon={AlignJustify}
                  label="Espaço entre linhas"
                  active={settings.lineSpacing}
                  onClick={() => update("lineSpacing", !settings.lineSpacing)}
                />
                <ToggleCard
                  icon={Space}
                  label="Espaço entre letras"
                  active={settings.letterSpacing}
                  onClick={() => update("letterSpacing", !settings.letterSpacing)}
                />
                <ToggleCard
                  icon={Pause}
                  label="Pausar animações"
                  active={settings.pauseAnimations}
                  onClick={() => update("pauseAnimations", !settings.pauseAnimations)}
                />
                <ToggleCard
                  icon={MousePointer2}
                  label="Cursor maior"
                  active={settings.bigCursor}
                  onClick={() => update("bigCursor", !settings.bigCursor)}
                />
                <ToggleCard
                  icon={AlignHorizontalJustifyCenter}
                  label="Guia de leitura"
                  active={settings.readingGuide}
                  onClick={() => update("readingGuide", !settings.readingGuide)}
                />
                <ToggleCard
                  icon={Eye}
                  label="Máscara de leitura"
                  active={settings.readingMask}
                  onClick={() => update("readingMask", !settings.readingMask)}
                />
              </div>
            </section>

            <section aria-labelledby="a11y-voz">
              <h3 id="a11y-voz" className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Voz & Teclado
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <ToggleCard
                  icon={isSpeaking ? Square : Volume2}
                  label={isSpeaking ? "Parar leitura" : "Ler em voz alta"}
                  active={isSpeaking}
                  onClick={() => (isSpeaking ? stopSpeaking() : speakSelection())}
                />
                <ToggleCard
                  icon={Keyboard}
                  label="Realçar foco do teclado"
                  active={settings.keyboardNav}
                  onClick={() => update("keyboardNav", !settings.keyboardNav)}
                />
                <ToggleCard
                  icon={ArrowDownToLine}
                  label="Ir ao conteúdo"
                  onClick={() => focusSelector("#conteudo")}
                />
                <ToggleCard
                  icon={MenuIcon}
                  label="Ir ao menu"
                  onClick={() => focusSelector("#menu-principal, nav[aria-label='Principal']")}
                />
                <ToggleCard
                  icon={Search}
                  label="Ir à busca"
                  onClick={() => focusSelector("#busca, input[type='search'], [role='search'] input")}
                />
              </div>
            </section>

            <div className="border-t border-slate-200 pt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={reset}
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Resetar todas as configurações
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
