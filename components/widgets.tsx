import { copy } from "@/content/copy";
import {
  abilityBand,
  abilityBandLabel,
  abilityDeltaLine,
  CORE_SUBJECTS,
  ELECTIVES,
  subjectName,
} from "@/content/subjects";
import { currentStep, progress } from "@/lib/engine";
import { statLabel, tx } from "@/lib/text";
import type { Abilities, ElectiveId, Lang, LocaleText, RunState, StatKey, Stats, SubjectId } from "@/lib/types";
import { STAT_KEYS } from "@/lib/types";

export function LangToggle({ lang, onChange }: { lang: Lang; onChange: (lang: Lang) => void }) {
  return (
    <div className="lang" role="group" aria-label={tx(lang, copy.langLabel)}>
      <button type="button" aria-pressed={lang === "zh"} data-testid="lang-zh" onClick={() => onChange("zh")}>
        中文
      </button>
      <button type="button" aria-pressed={lang === "en"} data-testid="lang-en" onClick={() => onChange("en")}>
        EN
      </button>
    </div>
  );
}

export function AbilityEcho({
  delta,
  lang,
  banner = false,
}: {
  delta: Partial<Abilities> | null | undefined;
  lang: Lang;
  banner?: boolean;
}) {
  const text = abilityDeltaLine(delta, lang);
  if (!text) return null;
  const shown = lang === "zh" ? `「${text}」` : text;
  if (banner) {
    return (
      <p className="ability-feedback" data-testid="ability-feedback">
        {shown}
      </p>
    );
  }
  return <span className="ability-echo">{shown}</span>;
}

function AbilityCell({
  id,
  abilities,
  picked,
  lang,
}: {
  id: SubjectId;
  abilities: Abilities;
  picked: boolean;
  lang: Lang;
}) {
  const score = abilities[id];
  const band = abilityBand(score);
  const name = subjectName(id, lang, "name");
  const short = subjectName(id, lang, "short");
  return (
    <div
      className={`ability-cell ${band}${picked ? " picked" : ""}`}
      data-testid={`ability-${id}`}
      data-score={score}
    >
      <div className="ability-top">
        <strong>{short}</strong>
        <span className="score">
          {score}
          <small>/10</small>
        </span>
      </div>
      {name !== short ? <span className="ability-full">{name}</span> : null}
      <span className="ability-band">{abilityBandLabel(score, lang)}</span>
      <div className="pips" aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => (
          <i key={index} className={index < score ? "on" : ""} />
        ))}
      </div>
      <span className="sr">
        {name} {score}/10 {abilityBandLabel(score, lang)}
        {picked ? (lang === "zh" ? "，已選" : ", chosen") : ""}
      </span>
    </div>
  );
}

export function AbilityBoard({
  abilities,
  picked,
  lang,
}: {
  abilities: Abilities;
  picked: ElectiveId[];
  lang: Lang;
}) {
  return (
    <div className="ability-board" data-testid="ability-board">
      <h3>{tx(lang, copy.abilityCore)}</h3>
      <div className="ability-grid">
        {CORE_SUBJECTS.map((item) => (
          <AbilityCell key={item.id} id={item.id} abilities={abilities} picked={false} lang={lang} />
        ))}
      </div>
      <h3>{tx(lang, copy.abilityElective)}</h3>
      <div className="ability-grid">
        {ELECTIVES.map((item) => (
          <AbilityCell key={item.id} id={item.id} abilities={abilities} picked={picked.includes(item.id)} lang={lang} />
        ))}
      </div>
    </div>
  );
}

export function EffectLine({ effects, lang }: { effects: Partial<Stats>; lang: Lang }) {
  const parts = STAT_KEYS.filter((key) => typeof effects[key] === "number" && effects[key] !== 0);
  if (parts.length === 0) return null;
  return (
    <span className="fx">
      {parts.map((key, index) => {
        const value = effects[key] ?? 0;
        return (
          <span key={key}>
            {index > 0 ? " · " : null}
            {statLabel(key, lang)}{" "}
            <b className={value > 0 ? "up" : "down"}>{value > 0 ? `+${value}` : value}</b>
          </span>
        );
      })}
    </span>
  );
}

const STAT_COLOR: Record<StatKey, string> = {
  academic: "var(--academic)",
  curiosity: "var(--curiosity)",
  wellbeing: "var(--wellbeing)",
  social: "var(--social)",
};

export function StatMeters({
  stats,
  delta,
  lang,
}: {
  stats: Stats;
  delta: Partial<Stats> | null;
  lang: Lang;
}) {
  return (
    <section className="stats" aria-label={tx(lang, copy.statsLabel)}>
      {STAT_KEYS.map((key) => {
        const change = delta?.[key];
        return (
          <div key={key} className="stat">
            <div className="stat-top">
              <span>{statLabel(key, lang)}</span>
              <span className="stat-num">
                {stats[key]}
                {typeof change === "number" && change !== 0 ? (
                  <b className={change > 0 ? "up" : "down"}>{change > 0 ? `+${change}` : change}</b>
                ) : null}
              </span>
            </div>
            <div className="bar" aria-hidden="true">
              <span style={{ width: `${stats[key]}%`, background: STAT_COLOR[key] }} />
            </div>
            <span className="sr">{tx(lang, copy.statHelp[key])}</span>
          </div>
        );
      })}
    </section>
  );
}

export function Stepper({ run, lang }: { run: RunState; lang: Lang }) {
  const steps = progress(run);
  return (
    <ol className="steps" aria-label={tx(lang, copy.progressLabel)}>
      {steps.map((step) => (
        <li key={step.id} className={`step ${step.status}`} aria-current={step.status === "now" ? "step" : undefined}>
          {tx(lang, copy.steps[step.id])}
        </li>
      ))}
    </ol>
  );
}

export function continueBlurb(run: RunState, lang: Lang): string {
  const pace = run.pace === "fast" ? copy.fastWord : copy.standardWord;
  return `${tx(lang, pace)} · ${tx(lang, copy.steps[currentStep(run)])}`;
}

export function TideArt() {
  return (
    <svg className="tide" viewBox="0 0 640 200" role="img" aria-hidden="true">
      <path d="M0 150c40 18 70-20 120-8s70 28 120 8 80-36 130-12 70 24 110 8 70-20 160-8v62H0z" fill="#d5ebe4" />
      <path d="M0 168c50 10 80-16 140-4s90 20 140 4 70-18 130-2 90 16 230 0v34H0z" fill="#8ec9c2" />
      <circle cx="470" cy="48" r="26" fill="#f0b89a" />
      <rect x="250" y="78" width="86" height="62" rx="2" fill="#1b3a36" />
      <rect x="262" y="90" width="16" height="14" fill="#f7f1e4" />
      <rect x="286" y="90" width="16" height="14" fill="#f7f1e4" />
      <rect x="310" y="90" width="16" height="14" fill="#f7f1e4" />
      <rect x="280" y="112" width="18" height="28" fill="#f4efe4" />
      <path d="M292 78h4l18-16h-4z" fill="#e07a5f" />
    </svg>
  );
}

export function textOf(lang: Lang, value: LocaleText): string {
  return tx(lang, value);
}
