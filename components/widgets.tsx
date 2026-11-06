// Node tests compile this file with the classic JSX runtime.
import React from "react";
import { copy } from "@/content/copy";
import {
  classmateStatus,
  classmatesOf,
  cohortBeat,
  cohortHeading,
  cohortNote,
  HOUSING_LABEL,
  LEAN_LABEL,
  lineupClosing,
  lineupHeading,
  lineupOrder,
  MOI_LABEL,
  youLabel,
} from "@/content/classmates";
import { quoteWrap, REFLECTION_PROMPTS, reflectionHeading, writtenReflections } from "@/content/reflections";
import { pathwayRows } from "@/lib/cohort";
import { axisValues, endingShape, normalizedAxes, SHAPE_AXIS, SHAPE_SENTENCE } from "@/lib/shape";
import { happiestYear, yearCaption } from "@/lib/year";
import {
  abilityBand,
  abilityBandLabel,
  abilityDeltaLine,
  CORE_SUBJECTS,
  ELECTIVES,
  subjectName,
} from "@/content/subjects";
import { currentStep, progress, statFeedbackLine } from "@/lib/engine";
import { lifePoint } from "@/lib/gates";
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

export function StatFeedback({
  effects,
  stats,
  lang,
}: {
  effects: Partial<Stats> | null | undefined;
  stats: Stats;
  lang: Lang;
}) {
  const text = statFeedbackLine(effects, stats, lang);
  if (!text) return null;
  const shown = lang === "zh" ? `「${text}」` : text;
  return (
    <p className="stat-feedback" data-testid="stat-feedback">
      {shown}
    </p>
  );
}

function AbilityCell({
  id,
  abilities,
  picked,
  recommended,
  lang,
}: {
  id: SubjectId;
  abilities: Abilities;
  picked: boolean;
  recommended: boolean;
  lang: Lang;
}) {
  const score = abilities[id];
  const band = abilityBand(score);
  const name = subjectName(id, lang, "name");
  return (
    <div
      className={`ability-cell ${band}${picked ? " picked" : ""}${recommended ? " recommended" : ""}`}
      data-testid={`ability-${id}`}
      data-score={score}
      data-recommended={recommended ? "yes" : "no"}
    >
      <div className="ability-top">
        <strong>
          {name}
          {recommended ? <span className="recommend-badge">{tx(lang, copy.suggestedBadge)}</span> : null}
        </strong>
        <span className="score">
          {score}
          <small>/100</small>
        </span>
      </div>
      <span className="ability-band">{abilityBandLabel(score, lang)}</span>
      <div className="pips" aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => (
          <i key={index} className={index < score / 10 ? "on" : ""} />
        ))}
      </div>
      <span className="sr">
        {name} {score}/100 {abilityBandLabel(score, lang)}
        {picked ? (lang === "zh" ? "，已選" : ", chosen") : ""}
      </span>
    </div>
  );
}

export function AbilityBoard({
  abilities,
  picked,
  lang,
  recommended = [],
}: {
  abilities: Abilities;
  picked: ElectiveId[];
  lang: Lang;
  recommended?: ElectiveId[];
}) {
  return (
    <div className="ability-board" data-testid="ability-board">
      <h3>{tx(lang, copy.abilityCore)}</h3>
      <div className="ability-grid">
        {CORE_SUBJECTS.map((item) => (
          <AbilityCell key={item.id} id={item.id} abilities={abilities} picked={false} recommended={false} lang={lang} />
        ))}
      </div>
      <h3>{tx(lang, copy.abilityElective)}</h3>
      <div className="ability-grid">
        {ELECTIVES.map((item) => (
          <AbilityCell
            key={item.id}
            id={item.id}
            abilities={abilities}
            picked={picked.includes(item.id)}
            recommended={recommended.includes(item.id)}
            lang={lang}
          />
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
              <span className="stat-num" data-testid={`life-${key}`}>
                {lifePoint(stats[key])}
                <small>/10</small>
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
      <p className="life-scale">{tx(lang, copy.lifeScale)}</p>
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
  const who = run.nickname ? `${run.nickname} · ` : "";
  return `${who}${tx(lang, pace)} · ${tx(lang, copy.steps[currentStep(run)])}`;
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

export function CohortMargin({ run, lang }: { run: RunState; lang: Lang }) {
  const mates = classmatesOf(run.classmates);
  if (mates.length === 0) return null;
  const beat = cohortBeat(run);
  return (
    <section className="cohort" aria-label={tx(lang, cohortHeading)} data-testid="classmates" data-beat={beat}>
      <h2>{tx(lang, cohortHeading)}</h2>
      <p className="cohort-note">{tx(lang, cohortNote)}</p>
      <ol>
        {mates.map((mate) => (
          <li key={mate.id} data-testid={`mate-${mate.id}`}>
            <span className="mate-name">{tx(lang, mate.name)}</span>
            <span className="mate-meta">
              {tx(lang, HOUSING_LABEL[mate.housing])}
              {" · "}
              {tx(lang, MOI_LABEL[mate.moi])}
              {" · "}
              {tx(lang, LEAN_LABEL[mate.lean])}
            </span>
            <span className="mate-status" data-testid={`mate-status-${mate.id}`}>
              {tx(lang, classmateStatus(mate, beat))}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function PathwayLineup({ run, lang, closing = false }: { run: RunState; lang: Lang; closing?: boolean }) {
  const rows = pathwayRows(run, lang);
  return (
    <section className="lineup-block" data-testid="pathway-lineup">
      <h2>{tx(lang, lineupHeading)}</h2>
      <p className="note">{tx(lang, lineupOrder)}</p>
      <ol className="lineup">
        {rows.map((row) => (
          <li key={row.key} className={row.you ? "you" : undefined} data-testid={row.you ? "lineup-you" : `lineup-${row.key}`} data-band={row.band}>
            <div className="lineup-name">
              <strong>{row.name}</strong>
              {row.you ? <span className="you-chip">{tx(lang, youLabel)}</span> : null}
            </div>
            <p className="mate-status">{row.meta}</p>
            <p>{row.detail}</p>
          </li>
        ))}
      </ol>
      {closing ? <p className="prose lineup-close">{tx(lang, lineupClosing)}</p> : null}
    </section>
  );
}

export function ReflectionQuotes({ run, lang }: { run: Pick<RunState, "reflections">; lang: Lang }) {
  const quotes = writtenReflections(run.reflections ?? []);
  if (quotes.length === 0) return null;
  return (
    <section className="kept-lines" data-testid="reflection-quotes">
      <h2>{tx(lang, reflectionHeading)}</h2>
      <ul className="quote-list">
        {quotes.map((item) => (
          <li key={item.id} data-testid={`quote-${item.id}`}>
            <blockquote>
              <p>{quoteWrap(item.text, lang)}</p>
            </blockquote>
            <p className="quote-by">{tx(lang, REFLECTION_PROMPTS[item.id].label)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ShapeReading({ run, lang }: { run: RunState; lang: Lang }) {
  const axes = axisValues(run);
  const shape = endingShape(axes);
  const values = normalizedAxes(axes);
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 64;
  const angleOf = (index: number) => (Math.PI * 2 * index) / 4 - Math.PI / 2;
  const points = SHAPE_AXIS.map((_, index) => {
    const value = values[_.id];
    const r = Math.abs(value) * radius;
    const a = angleOf(index);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });

  return (
    <section className="shape-reading" data-testid="shape-reading">
      <svg className="shape-radar" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={tx(lang, shape.label)}>
        <polygon
          points={points.map((p) => p.join(",")).join(" ")}
          fill="rgba(15, 110, 106, 0.18)"
          stroke="var(--teal)"
          strokeWidth={2}
        />
        {SHAPE_AXIS.map((_, index) => {
          const a = angleOf(index);
          const x = cx + radius * Math.cos(a);
          const y = cy + radius * Math.sin(a);
          return <line key={_.id} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--line)" />;
        })}
      </svg>
      <ol className="shape-axes" aria-label={tx(lang, copy.shapeAxesLabel)}>
        {SHAPE_AXIS.map((axis) => (
          <li key={axis.id} data-axis={axis.id} data-lean={values[axis.id] >= 0 ? "left" : "right"}>
            <span>{tx(lang, axis.left)}</span>
            <span className="shape-axis-bar" aria-hidden="true">
              <i style={{ width: `${Math.round(Math.abs(values[axis.id]) * 100)}%`, marginLeft: values[axis.id] >= 0 ? "auto" : undefined }} />
            </span>
            <span>{tx(lang, axis.right)}</span>
          </li>
        ))}
      </ol>
      <p className="shape-name" data-testid="shape-name">
        {tx(lang, shape.label)}
      </p>
      <p className="shape-sentence" data-testid="shape-sentence">
        {tx(lang, SHAPE_SENTENCE)}
      </p>
    </section>
  );
}

export function HappiestYear({ run, lang }: { run: RunState; lang: Lang }) {
  const happy = happiestYear(run);
  if (!happy) return null;
  const caption = yearCaption(happy.year, run.flags);
  return (
    <p className="happiest-year" data-testid="happiest-year">
      {tx(lang, copy.happiestYearHeading)}{" "}
      {tx(lang, caption)}
      {" · "}
      {Math.round(happy.value / 10)}/10
    </p>
  );
}
