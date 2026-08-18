import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ContrastMode = "off" | "high" | "dark" | "light";

export type A11ySettings = {
  fontScale: number; // 0.85 - 1.6
  contrast: ContrastMode;
  grayscale: boolean;
  highlightLinks: boolean;
  dyslexiaFont: boolean;
  lineSpacing: boolean;
  letterSpacing: boolean;
  pauseAnimations: boolean;
  bigCursor: boolean;
  readingGuide: boolean;
  readingMask: boolean;
  keyboardNav: boolean;
};

const DEFAULT_SETTINGS: A11ySettings = {
  fontScale: 1,
  contrast: "off",
  grayscale: false,
  highlightLinks: false,
  dyslexiaFont: false,
  lineSpacing: false,
  letterSpacing: false,
  pauseAnimations: false,
  bigCursor: false,
  readingGuide: false,
  readingMask: false,
  keyboardNav: false,
};

const STORAGE_KEY = "a11y-settings-v1";

type Ctx = {
  settings: A11ySettings;
  update: <K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) => void;
  reset: () => void;
  speakSelection: () => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
};

const A11yContext = createContext<Ctx | null>(null);

export function useA11y() {
  const ctx = useContext(A11yContext);
  if (!ctx) throw new Error("useA11y must be used within AccessibilityProvider");
  return ctx;
}

function applySettings(s: A11ySettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--a11y-font-scale", String(s.fontScale));
  root.classList.toggle("a11y-line-spacing", s.lineSpacing);
  root.classList.toggle("a11y-letter-spacing", s.letterSpacing);
  root.classList.toggle("a11y-dyslexia", s.dyslexiaFont);
  root.classList.toggle("a11y-highlight-links", s.highlightLinks);
  root.classList.toggle("a11y-pause-animations", s.pauseAnimations);
  root.classList.toggle("a11y-grayscale", s.grayscale);
  root.classList.toggle("a11y-big-cursor", s.bigCursor);
  root.classList.toggle("a11y-keyboard-nav", s.keyboardNav);
  root.classList.toggle("a11y-contrast-high", s.contrast === "high");
  root.classList.toggle("a11y-contrast-dark", s.contrast === "dark");
  root.classList.toggle("a11y-contrast-light", s.contrast === "light");
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<A11ySettings>(DEFAULT_SETTINGS);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const guideRef = useRef<HTMLDivElement | null>(null);
  const maskTopRef = useRef<HTMLDivElement | null>(null);
  const maskBottomRef = useRef<HTMLDivElement | null>(null);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (e) { if (typeof console !== "undefined") console.warn("[storage]", e); }
  }, []);

  // apply + persist
  useEffect(() => {
    applySettings(settings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) { if (typeof console !== "undefined") console.warn("[storage]", e); }
  }, [settings]);

  // reading guide / mask follow the cursor
  useEffect(() => {
    if (!settings.readingGuide && !settings.readingMask) return;

    const ensureEl = (
      ref: React.MutableRefObject<HTMLDivElement | null>,
      className: string,
    ) => {
      if (!ref.current) {
        const el = document.createElement("div");
        el.className = className;
        document.body.appendChild(el);
        ref.current = el;
      }
      return ref.current;
    };

    if (settings.readingGuide) ensureEl(guideRef, "a11y-reading-guide");
    if (settings.readingMask) {
      ensureEl(maskTopRef, "a11y-reading-mask-top");
      ensureEl(maskBottomRef, "a11y-reading-mask-bottom");
    }

    const onMove = (event: MouseEvent) => {
      const y = event.clientY;
      if (settings.readingGuide && guideRef.current) {
        guideRef.current.style.top = `${y}px`;
      }
      if (settings.readingMask && maskTopRef.current && maskBottomRef.current) {
        const band = 110;
        maskTopRef.current.style.top = "0";
        maskTopRef.current.style.height = `${Math.max(0, y - band / 2)}px`;
        maskBottomRef.current.style.top = `${y + band / 2}px`;
        maskBottomRef.current.style.bottom = "0";
        maskBottomRef.current.style.height = "auto";
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (!settings.readingGuide && guideRef.current) {
        guideRef.current.remove();
        guideRef.current = null;
      }
      if (!settings.readingMask) {
        maskTopRef.current?.remove();
        maskBottomRef.current?.remove();
        maskTopRef.current = null;
        maskBottomRef.current = null;
      }
    };
  }, [settings.readingGuide, settings.readingMask]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      guideRef.current?.remove();
      maskTopRef.current?.remove();
      maskBottomRef.current?.remove();
    };
  }, []);

  const update = useCallback<Ctx["update"]>((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) { if (typeof console !== "undefined") console.warn("[storage]", e); }
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const speakSelection = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const selection = window.getSelection?.()?.toString().trim();
    const text =
      selection ||
      document.querySelector("main")?.innerText?.slice(0, 4000) ||
      document.body.innerText.slice(0, 4000);
    if (!text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "pt-BR";
    utter.rate = 1;
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utter);
  }, []);

  const value = useMemo<Ctx>(
    () => ({ settings, update, reset, speakSelection, stopSpeaking, isSpeaking }),
    [settings, update, reset, speakSelection, stopSpeaking, isSpeaking],
  );

  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>;
}
