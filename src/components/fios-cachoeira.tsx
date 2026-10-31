// Fios da cachoeira: posição em %, duração e atraso variam para o movimento não parecer repetido.
const FIOS = [
  { x: 8, dur: 4.2, atraso: 0 },
  { x: 20, dur: 5.6, atraso: 1.1 },
  { x: 33, dur: 3.8, atraso: 0.5 },
  { x: 46, dur: 6.1, atraso: 1.9 },
  { x: 58, dur: 4.6, atraso: 0.8 },
  { x: 71, dur: 5.2, atraso: 2.3 },
  { x: 84, dur: 3.9, atraso: 1.4 },
  { x: 94, dur: 5.8, atraso: 0.3 },
];

/** Assinatura visual do site: fios de água caindo, usados no destaque da página inicial e no rodapé. */
export function FiosCachoeira() {
  return (
    <div className="fios-cachoeira hidden md:block" aria-hidden>
      {FIOS.map((f) => (
        <span key={f.x} style={{ left: `${f.x}%`, animationDuration: `${f.dur}s`, animationDelay: `${f.atraso}s` }} />
      ))}
    </div>
  );
}
