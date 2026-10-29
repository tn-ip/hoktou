"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { copy } from "@/content/copy";
import { endingView, offerView, pathLine } from "@/content/endings";
import { programmeById, PROGRAMMES } from "@/content/programmes";
import {
  comboNote,
  ELECTIVES,
  electiveDilemmas,
  electiveIntro,
  joinElectives,
  MATHS,
  mathLabel,
  PRESETS,
  type Dilemma,
} from "@/content/subjects";
import {
  advancePhase,
  applyChoice,
  confirmElectives,
  confirmRanking,
  createRun,
  outlookOf,
  programmeScore,
  rankTarget,
  sceneView,
  setElectiveDraft,
  setRanking,
} from "@/lib/engine";
import { clearRun, loadLang, loadRun, saveLang, saveRun } from "@/lib/storage";
import { tx } from "@/lib/text";
import type { ElectiveId, Lang, MathModule, Pace, RunState } from "@/lib/types";
import { AbilityBoard, AbilityEcho, continueBlurb, EffectLine, LangToggle, StatMeters, Stepper, TideArt } from "@/components/widgets";

export function GameApp() {
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState<RunState | null>(null);
  const [run, setRun] = useState<RunState | null>(null);
  const [titleLang, setTitleLang] = useState<Lang>("zh");
  const [pace, setPace] = useState<Pace>("standard");
  const [confirmNew, setConfirmNew] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [dilemmas, setDilemmas] = useState<Dilemma[] | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const lang = run?.lang ?? titleLang;

  useEffect(() => {
    const storedLang = loadLang();
    const storedRun = loadRun();
    if (storedLang) setTitleLang(storedLang);
    if (storedRun) {
      setSaved(storedRun);
      setTitleLang(storedRun.lang);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveLang(lang);
    if (run) saveRun(run);
    else if (saved) saveRun({ ...saved, lang });
    document.documentElement.lang = lang === "zh" ? "zh-Hant-HK" : "en";
    document.title = lang === "zh" ? "學途" : "Hoktou";
  }, [ready, run, saved, lang]);

  const focusKey = `${run?.phase ?? "title"}:${run?.sceneId ?? ""}:${run?.log.length ?? 0}`;
  useEffect(() => {
    if (!ready) return;
    headingRef.current?.focus();
  }, [ready, focusKey]);

  function changeLang(next: Lang) {
    setTitleLang(next);
    setRun((current) => (current ? { ...current, lang: next } : current));
    setSaved((current) => (current ? { ...current, lang: next } : current));
  }

  function start() {
    const next = createRun(pace, lang);
    setRun(next);
    setSaved(next);
    setConfirmNew(false);
    setConfirmRestart(false);
    setBlocked(false);
    setDilemmas(null);
  }

  function restart() {
    clearRun();
    setRun(null);
    setSaved(null);
    setConfirmRestart(false);
    setConfirmNew(false);
    setBlocked(false);
    setDilemmas(null);
  }

  function clearDilemmas() {
    setDilemmas(null);
  }

  function requestElectives() {
    if (!run || run.electives.length !== 3) return;
    const found = electiveDilemmas(run.abilities, run.electives);
    if (found.length === 0) {
      setDilemmas(null);
      setRun(confirmElectives(run, run.electives, run.mathModule));
      return;
    }
    setDilemmas(found);
  }

  function insistElectives() {
    if (!run || run.electives.length !== 3) return;
    setDilemmas(null);
    setRun(confirmElectives(run, run.electives, run.mathModule));
  }

  if (!ready) {
    return (
      <div className="app" data-ready="no">
        <div className="shell center-splash">
          <p className="brand">學途</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app" data-ready="yes">
      <div className="shell">
        {run ? (
          <div className="play" data-testid="phase" data-phase={run.phase}>
            <aside className="side">
              <div className="brandrow">
                <div>
                  <p className="brand">學途</p>
                  <p className="school">{tx(lang, copy.school)}</p>
                </div>
                <LangToggle lang={lang} onChange={changeLang} />
              </div>
              <Stepper run={run} lang={lang} />
              <StatMeters stats={run.stats} delta={run.lastEffects} lang={lang} />
            </aside>
            <main className="stage">
              {run.phase === "scene" ? <SceneCard run={run} lang={lang} headingRef={headingRef} onChoose={(id) => setRun(applyChoice(run, id))} /> : null}
              {run.phase === "electives" ? (
                <ElectiveCard
                  run={run}
                  lang={lang}
                  blocked={blocked}
                  headingRef={headingRef}
                  dilemmas={dilemmas}
                  onToggle={(id) => {
                    clearDilemmas();
                    if (run.electives.includes(id)) {
                      setBlocked(false);
                      setRun(setElectiveDraft(run, run.electives.filter((item) => item !== id), run.mathModule));
                      return;
                    }
                    if (run.electives.length >= 3) {
                      setBlocked(true);
                      return;
                    }
                    setBlocked(false);
                    setRun(setElectiveDraft(run, [...run.electives, id], run.mathModule));
                  }}
                  onPreset={(ids, math) => {
                    clearDilemmas();
                    setBlocked(false);
                    setRun(setElectiveDraft(run, [...ids], math));
                  }}
                  onMath={(math) => {
                    clearDilemmas();
                    setRun(setElectiveDraft(run, run.electives, math));
                  }}
                  onConfirm={requestElectives}
                  onInsist={insistElectives}
                  onRevise={clearDilemmas}
                />
              ) : null}
              {run.phase === "ranking" ? (
                <RankingCard
                  run={run}
                  lang={lang}
                  headingRef={headingRef}
                  onRanking={(ranking) => setRun(setRanking(run, ranking))}
                  onConfirm={() => setRun(confirmRanking(run, run.ranking))}
                />
              ) : null}
              {run.phase === "offer" ? (
                <OfferCard run={run} lang={lang} headingRef={headingRef} onNext={() => setRun(advancePhase(run))} />
              ) : null}
              {run.phase === "epilogue" ? (
                <EpilogueCard run={run} lang={lang} headingRef={headingRef} onNext={() => setRun(advancePhase(run))} />
              ) : null}
              {run.phase === "summary" ? (
                <SummaryCard
                  run={run}
                  lang={lang}
                  headingRef={headingRef}
                  confirmRestart={confirmRestart}
                  onAsk={() => setConfirmRestart(true)}
                  onCancel={() => setConfirmRestart(false)}
                  onRestart={restart}
                />
              ) : null}
            </main>
          </div>
        ) : (
          <TitleScreen
            lang={lang}
            pace={pace}
            saved={saved}
            confirmNew={confirmNew}
            headingRef={headingRef}
            onLang={changeLang}
            onPace={setPace}
            onContinue={() => saved && setRun(saved)}
            onAskNew={() => setConfirmNew(true)}
            onCancelNew={() => setConfirmNew(false)}
            onStart={start}
          />
        )}
        <footer className="fineprint">{tx(lang, copy.disclaimer)}</footer>
      </div>
    </div>
  );
}

function TitleScreen({
  lang,
  pace,
  saved,
  confirmNew,
  headingRef,
  onLang,
  onPace,
  onContinue,
  onAskNew,
  onCancelNew,
  onStart,
}: {
  lang: Lang;
  pace: Pace;
  saved: RunState | null;
  confirmNew: boolean;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onLang: (lang: Lang) => void;
  onPace: (pace: Pace) => void;
  onContinue: () => void;
  onAskNew: () => void;
  onCancelNew: () => void;
  onStart: () => void;
}) {
  return (
    <section className="title" data-testid="phase" data-phase="title">
      <div className="title-top">
        <p className="eyebrow">{tx(lang, copy.school)}</p>
        <LangToggle lang={lang} onChange={onLang} />
      </div>
      <TideArt />
      <div className="seal" aria-hidden="true">
        潮
      </div>
      <h1 ref={headingRef} tabIndex={-1}>
        學途
      </h1>
      <p className="romaji">Hoktou</p>
      <p className="tagline">{tx(lang, copy.tagline)}</p>
      <p className="lede">{tx(lang, copy.subtitle)}</p>
      <p className="motto">{tx(lang, copy.motto)}</p>
      {saved ? (
        <button type="button" className="primary" data-testid="continue" onClick={onContinue}>
          {tx(lang, copy.continue)}
          <span>{continueBlurb(saved, lang)}</span>
        </button>
      ) : null}
      <fieldset>
        <legend>{tx(lang, copy.length)}</legend>
        <div className="segmented">
          <button type="button" aria-pressed={pace === "standard"} data-testid="pace-standard" onClick={() => onPace("standard")}>
            <strong>{tx(lang, copy.paceStandard)}</strong>
            <span>{tx(lang, copy.paceStandardHint)}</span>
          </button>
          <button type="button" aria-pressed={pace === "fast"} data-testid="pace-fast" onClick={() => onPace("fast")}>
            <strong>{tx(lang, copy.paceFast)}</strong>
            <span>{tx(lang, copy.paceFastHint)}</span>
          </button>
        </div>
      </fieldset>
      {confirmNew ? (
        <div className="confirm">
          <p>{tx(lang, copy.confirmNew)}</p>
          <button type="button" className="primary" data-testid="confirm-new" onClick={onStart}>
            {tx(lang, copy.yes)}
          </button>
          <button type="button" className="ghost" onClick={onCancelNew}>
            {tx(lang, copy.cancel)}
          </button>
        </div>
      ) : (
        <button type="button" className={saved ? "ghost" : "primary"} data-testid="start" onClick={saved ? onAskNew : onStart}>
          {saved ? tx(lang, copy.newGame) : tx(lang, copy.start)}
        </button>
      )}
      <h2>{tx(lang, copy.howTitle)}</h2>
      <ol className="how">
        <li>{tx(lang, copy.how1)}</li>
        <li>{tx(lang, copy.how2)}</li>
        <li>{tx(lang, copy.how3)}</li>
      </ol>
      <ul className="legend">
        {(
          [
            ["academic", "學業", "Study"],
            ["curiosity", "好奇", "Curiosity"],
            ["wellbeing", "身心", "Wellbeing"],
            ["social", "人際", "Bonds"],
          ] as const
        ).map(([key, zh, en]) => (
          <li key={key}>
            <strong>{lang === "zh" ? zh : en}</strong>
            <span>{tx(lang, copy.statHelp[key])}</span>
          </li>
        ))}
      </ul>
      <p className="same">{tx(lang, copy.sameChoices)}</p>
    </section>
  );
}

function SceneCard({
  run,
  lang,
  headingRef,
  onChoose,
}: {
  run: RunState;
  lang: Lang;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onChoose: (id: string) => void;
}) {
  const view = sceneView(run);
  if (!view) {
    return (
      <article className="card">
        <h1 ref={headingRef} tabIndex={-1}>
          {tx(lang, copy.broken)}
        </h1>
      </article>
    );
  }
  return (
    <article className="card" aria-live="polite">
      <p className="kicker">{tx(lang, view.kicker)}</p>
      <h1 ref={headingRef} tabIndex={-1} data-testid="card-title">
        {tx(lang, view.title)}
      </h1>
      <p className="focus">
        {tx(lang, copy.focusLabel)} · {tx(lang, view.focus)}
      </p>
      {run.lastEcho ? <p className="echo">{tx(lang, copy.lastChoice)}{tx(lang, run.lastEcho)}</p> : null}
      <AbilityEcho delta={run.lastAbilities} lang={lang} banner />
      {run.log.length === 0 ? <p className="hint">{tx(lang, copy.firstHint)}</p> : null}
      <p className="prose">{tx(lang, view.body)}</p>
      <div className="choices">
        {view.choices.map((choice) => (
          <button key={choice.id} type="button" className="choice" data-testid={`choice-${choice.id}`} onClick={() => onChoose(choice.id)}>
            <span className="label">{tx(lang, choice.label)}</span>
            <span className="detail">{tx(lang, choice.detail)}</span>
            <AbilityEcho delta={choice.ability} lang={lang} />
            <EffectLine effects={choice.effects} lang={lang} />
          </button>
        ))}
      </div>
    </article>
  );
}

function ElectiveCard({
  run,
  lang,
  blocked,
  headingRef,
  dilemmas,
  onToggle,
  onPreset,
  onMath,
  onConfirm,
  onInsist,
  onRevise,
}: {
  run: RunState;
  lang: Lang;
  blocked: boolean;
  headingRef: RefObject<HTMLHeadingElement | null>;
  dilemmas: Dilemma[] | null;
  onToggle: (id: ElectiveId) => void;
  onPreset: (ids: ElectiveId[], math: MathModule) => void;
  onMath: (math: MathModule) => void;
  onConfirm: () => void;
  onInsist: () => void;
  onRevise: () => void;
}) {
  const note = comboNote(run.electives, run.mathModule, lang);
  const dilemmaRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (dilemmas && dilemmas.length > 0) dilemmaRef.current?.focus();
  }, [dilemmas]);
  return (
    <article className="card">
      <p className="kicker">{tx(lang, copy.electiveKicker)}</p>
      <h1 ref={headingRef} tabIndex={-1} data-testid="card-title">
        {tx(lang, copy.electiveTitle)}
      </h1>
      <p className="focus">
        {tx(lang, copy.focusLabel)} · {tx(lang, copy.electiveFocus)}
      </p>
      {run.lastEcho ? <p className="echo">{tx(lang, copy.lastChoice)}{tx(lang, run.lastEcho)}</p> : null}
      <AbilityEcho delta={run.lastAbilities} lang={lang} banner />
      <p className="prose">{electiveIntro(run.flags, lang)}</p>
      <div className="elective-layout">
        <div className="ability-board-wrap">
          <h2>{tx(lang, copy.abilityBoard)}</h2>
          <p className="note">{tx(lang, copy.abilityScale)}</p>
          <AbilityBoard abilities={run.abilities} picked={run.electives} lang={lang} />
          <p className="note">{tx(lang, copy.abilityLegend)}</p>
        </div>
        <div>
          <h2>{tx(lang, copy.presets)}</h2>
          <div className="presets">
            {PRESETS.map((preset) => (
              <button key={preset.id} type="button" className="preset" onClick={() => onPreset(preset.electives, preset.math)}>
                {tx(lang, preset.label)}
              </button>
            ))}
          </div>
          <h2>
            {tx(lang, copy.selected)} {run.electives.length}/3
          </h2>
          <div className="subjects">
            {ELECTIVES.map((item) => {
              const selected = run.electives.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  className="subject"
                  aria-pressed={selected}
                  data-testid={`elective-${item.id}`}
                  onClick={() => onToggle(item.id)}
                >
                  <strong>{tx(lang, item.name)}</strong>
                  <small>
                    {tx(lang, copy.abilityOf)} {run.abilities[item.id]}/10 · {tx(lang, item.hint)}
                  </small>
                </button>
              );
            })}
          </div>
          {blocked ? <p className="note">{tx(lang, copy.electiveFull)}</p> : null}
          {run.electives.length > 0 && run.electives.length < 3 ? <p className="note">{tx(lang, copy.needThree)}</p> : null}
          {note ? <p className="note">{note}</p> : null}
          <h2>{tx(lang, copy.mathLegend)}</h2>
          <div className="maths" role="radiogroup" aria-label={tx(lang, copy.mathLegend)}>
            {MATHS.map((item) => (
              <label key={item.id}>
                <input
                  type="radio"
                  name="math"
                  checked={run.mathModule === item.id}
                  onChange={() => onMath(item.id)}
                />
                <span>{tx(lang, item.short)}</span>
              </label>
            ))}
          </div>
          {dilemmas && dilemmas.length > 0 ? (
            <div className="confirm dilemmas" data-testid="dilemmas" role="region" aria-label={tx(lang, copy.dilemmaTitle)}>
              <h2 ref={dilemmaRef} tabIndex={-1}>
                {tx(lang, copy.dilemmaTitle)}
              </h2>
              <p className="note">{tx(lang, copy.dilemmaNote)}</p>
              {dilemmas.map((item) => (
                <p key={item.id} className="dilemma" data-testid={`dilemma-${item.id}`}>
                  {tx(lang, item.text)}
                </p>
              ))}
              <button type="button" className="primary" data-testid="insist-electives" onClick={onInsist}>
                {tx(lang, copy.insistElectives)}
              </button>
              <button type="button" className="ghost" data-testid="revise-electives" onClick={onRevise}>
                {tx(lang, copy.reviseElectives)}
              </button>
            </div>
          ) : (
            <button type="button" className="primary" data-testid="confirm-electives" disabled={run.electives.length !== 3} onClick={onConfirm}>
              {tx(lang, copy.confirmElectives)}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function RankingCard({
  run,
  lang,
  headingRef,
  onRanking,
  onConfirm,
}: {
  run: RunState;
  lang: Lang;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onRanking: (ranking: string[]) => void;
  onConfirm: () => void;
}) {
  const need = rankTarget(run.pace);
  const full = run.ranking.length >= need;
  function move(index: number, direction: -1 | 1) {
    const next = run.ranking.slice();
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onRanking(next);
  }
  const groups: { institution: string; ids: string[] }[] = [];
  for (const programme of PROGRAMMES) {
    const name = tx(lang, programme.institution);
    const group = groups.find((item) => item.institution === name);
    if (group) group.ids.push(programme.id);
    else groups.push({ institution: name, ids: [programme.id] });
  }
  return (
    <article className="card">
      <p className="kicker">{tx(lang, copy.rankKicker)}</p>
      <h1 ref={headingRef} tabIndex={-1} data-testid="card-title">
        {tx(lang, copy.rankTitle)}
      </h1>
      <p className="prose">{tx(lang, copy.rankBody)}</p>
      <p className="note">
        {tx(lang, copy.selected)} {run.ranking.length}/{need}
        {" · "}
        {lang === "zh" ? "選修" : "Electives"}：{joinElectives(run.electives, lang)}
        {" · "}
        {mathLabel(run.mathModule, lang, "short")}
        {" · "}
        {tx(lang, copy.notExam)}
      </p>
      <p className="note">{tx(lang, copy.abilityIndex)}</p>
      <h2>{tx(lang, copy.yourList)}</h2>
      {run.ranking.length === 0 ? <p className="note">{tx(lang, copy.emptyList)}</p> : null}
      <ol className="rank">
        {run.ranking.map((id, index) => {
          const programme = programmeById(id);
          if (!programme) return null;
          return (
            <li key={id}>
              <span className="num">{index + 1}</span>
              <div>
                <strong>{tx(lang, programme.name)}</strong>
                <small>{tx(lang, programme.institution)}</small>
              </div>
              <div className="rank-actions">
                <button type="button" className="mini" aria-label={tx(lang, copy.up)} disabled={index === 0} onClick={() => move(index, -1)}>
                  {tx(lang, copy.up)}
                </button>
                <button type="button" className="mini" aria-label={tx(lang, copy.down)} disabled={index === run.ranking.length - 1} onClick={() => move(index, 1)}>
                  {tx(lang, copy.down)}
                </button>
                <button type="button" className="mini" onClick={() => onRanking(run.ranking.filter((item) => item !== id))}>
                  {tx(lang, copy.remove)}
                </button>
              </div>
            </li>
          );
        })}
      </ol>
      <h2>{tx(lang, copy.catalogue)}</h2>
      {groups.map((group) => (
        <section key={group.institution}>
          <h3>{group.institution}</h3>
          <div className="catalogue">
            {group.ids.map((id) => {
              const programme = programmeById(id);
              if (!programme) return null;
              const added = run.ranking.includes(id);
              const outlook = outlookOf(run, programme);
              const score = programmeScore(run, programme);
              return (
                <button
                  key={id}
                  type="button"
                  className="prog"
                  data-testid={`programme-${id}`}
                  disabled={added || full}
                  onClick={() => onRanking([...run.ranking, id])}
                >
                  <strong>{tx(lang, programme.name)}</strong>
                  <small>{tx(lang, programme.blurb)}</small>
                  <small>
                    <span className={`pill ${outlook}`}>{tx(lang, copy.outlook[outlook])}</span>
                    {" · "}
                    {tx(lang, copy.requirement)}：{tx(lang, programme.requirement)}
                  </small>
                  <small>
                    {tx(lang, copy.gameIndex)} {score} / {tx(lang, copy.threshold)} {programme.threshold}
                  </small>
                </button>
              );
            })}
          </div>
        </section>
      ))}
      {run.ranking.length !== need ? <p className="note">{tx(lang, copy.needRank)}</p> : null}
      <button type="button" className="primary" data-testid="confirm-ranking" disabled={run.ranking.length !== need} onClick={onConfirm}>
        {tx(lang, copy.confirmRank)}
      </button>
    </article>
  );
}

function OfferCard({
  run,
  lang,
  headingRef,
  onNext,
}: {
  run: RunState;
  lang: Lang;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onNext: () => void;
}) {
  const view = offerView(run, lang);
  return (
    <article className="card letter">
      <p className="kicker">{view.kicker}</p>
      <h1 ref={headingRef} tabIndex={-1} data-testid="card-title">
        {view.headline}
      </h1>
      {view.paragraphs.map((paragraph) => (
        <p key={paragraph} className="prose">
          {paragraph}
        </p>
      ))}
      <ol className="rank">
        {view.ranked.map((item, index) => (
          <li key={item.id}>
            <span className="num">{index + 1}</span>
            <div>
              <strong>{item.name}</strong>
              <small>{item.note}</small>
            </div>
          </li>
        ))}
      </ol>
      <button type="button" className="primary" data-testid="to-epilogue" onClick={onNext}>
        {tx(lang, copy.toEpilogue)}
      </button>
    </article>
  );
}

function EpilogueCard({
  run,
  lang,
  headingRef,
  onNext,
}: {
  run: RunState;
  lang: Lang;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onNext: () => void;
}) {
  const view = endingView(run, lang);
  return (
    <article className="card">
      <p className="kicker">{view.kicker}</p>
      <h1 ref={headingRef} tabIndex={-1} data-testid="card-title">
        {view.workTitle}
      </h1>
      <h2>{lang === "zh" ? "工作" : "Work"}</h2>
      <p className="prose">{view.work}</p>
      <h2>{view.lifeTitle}</h2>
      <p className="prose">{view.life}</p>
      <button type="button" className="primary" data-testid="to-summary" onClick={onNext}>
        {tx(lang, copy.toSummary)}
      </button>
    </article>
  );
}

function SummaryCard({
  run,
  lang,
  headingRef,
  confirmRestart,
  onAsk,
  onCancel,
  onRestart,
}: {
  run: RunState;
  lang: Lang;
  headingRef: RefObject<HTMLHeadingElement | null>;
  confirmRestart: boolean;
  onAsk: () => void;
  onCancel: () => void;
  onRestart: () => void;
}) {
  const offer = offerView(run, lang);
  const ending = endingView(run, lang);
  return (
    <article className="card">
      <p className="kicker">{tx(lang, copy.summaryKicker)}</p>
      <h1 ref={headingRef} tabIndex={-1} data-testid="card-title">
        {tx(lang, copy.summaryTitle)}
      </h1>
      <p className="note">
        {tx(lang, copy.paceLabel)}：{tx(lang, run.pace === "fast" ? copy.fastWord : copy.standardWord)}
        {" · "}
        {tx(lang, copy.school)}
      </p>
      <h2>{tx(lang, copy.electivesHeading)}</h2>
      <p>
        {joinElectives(run.electives, lang)}
        {" · "}
        {mathLabel(run.mathModule, lang)}
      </p>
      <p className="note">{tx(lang, copy.coreReminder)}</p>
      <h2>{tx(lang, copy.abilityBoard)}</h2>
      <AbilityBoard abilities={run.abilities} picked={run.electives} lang={lang} />
      <h2>{tx(lang, copy.outcomeHeading)}</h2>
      <p>{offer.headline}</p>
      <h2>{tx(lang, copy.pathHeading)}</h2>
      <p>{pathLine(run, lang)}</p>
      <p className="prose">{ending.work}</p>
      <p className="prose">{ending.life}</p>
      <h2>{tx(lang, copy.statsLabel)}</h2>
      <StatMeters stats={run.stats} delta={null} lang={lang} />
      <h2>{tx(lang, copy.timelineHeading)}</h2>
      <ol className="timeline">
        {run.log.map((entry, index) => (
          <li key={`${entry.sceneId}-${index}`}>
            <div className="year">
              {tx(lang, copy.steps[entry.year === "life" ? "out" : entry.year === "S3" && entry.sceneId === "electives" ? "pick" : entry.year])}
              {" · "}
              {tx(lang, entry.title)}
            </div>
            <div>{tx(lang, entry.choice)}</div>
          </li>
        ))}
      </ol>
      {confirmRestart ? (
        <div className="confirm">
          <p>{tx(lang, copy.confirmRestart)}</p>
          <button type="button" className="primary" data-testid="restart" onClick={onRestart}>
            {tx(lang, copy.restart)}
          </button>
          <button type="button" className="ghost" onClick={onCancel}>
            {tx(lang, copy.cancel)}
          </button>
        </div>
      ) : (
        <button type="button" className="primary" data-testid="ask-restart" onClick={onAsk}>
          {tx(lang, copy.restart)}
        </button>
      )}
    </article>
  );
}
