import { useEffect, useMemo, useState } from "react";
import {
  AGE_GROUPS,
  QUESTIONS_BY_AGE,
  REFLECTION_QUESTIONS,
  DISCLAIMER,
} from "./data/questions.js";
import { QUOTES } from "./data/quotes.js";
import { computeResult } from "./logic/scoring.js";
import { buildResultEmailHtml } from "./logic/emailTemplate.js";
import { saveSubmission, queueResultEmail } from "./firebase.js";

// Не даёт медленной или недоступной сети держать пользователя на экране
// «Отправляем…» бесконечно — после ms результат всё равно показывается.
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

const C = {
  bg: "#EEF0FA",
  card: "#FFFFFF",
  ink: "#181A22",
  sub: "#5B5F79",
  faint: "#8D91A8",
  border: "rgba(24,26,34,0.10)",
  yellow: "#F5DE4E",
  peach: "#FCDFC2",
  lavender: "#DEDBF7",
  pink: "#FADCEF",
  paleYellow: "#FBEB9E",
  dotOrange: "#F2693F",
  dotBlue: "#3E58DB",
  dotGreen: "#BFD25E",
  dotGold: "#F0C43A",
  teal: "#8BDBDD",
  warnBg: "#FDE7DC",
  warnText: "#95492B",
};

const PASTELS = [C.peach, C.lavender, C.pink, C.paleYellow];
const DOTS = [C.dotOrange, C.dotBlue, C.dotGreen, C.dotGold];

const FONT = `'Nunito', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif`;

// Шаги: start -> age -> instructions -> q0..q6 -> email -> result
function stepsForAge() {
  return ["start", "age", "instructions", ...Array.from({ length: 7 }, (_, i) => `q${i}`), "email", "result"];
}

function hashToStep() {
  const h = window.location.hash.replace("#", "");
  return h || "start";
}

export default function App() {
  const [step, setStep] = useState(hashToStep());
  const [ageId, setAgeId] = useState(null);
  const [answers, setAnswers] = useState({}); // { "4-6": [scores...] } keyed by age for safety on back nav
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onHash = () => setStep(hashToStep());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function goTo(next) {
    window.location.hash = next;
    setStep(next);
  }

  const questions = ageId ? QUESTIONS_BY_AGE[ageId] : null;
  const currentAnswers = ageId ? answers[ageId] || [] : [];

  const order = useMemo(() => stepsForAge(), []);
  const stepIndex = order.indexOf(step);
  const progress = step === "start" ? 0 : Math.min(1, Math.max(0, stepIndex / (order.length - 2)));
  const quote = QUOTES[Math.max(stepIndex, 0) % QUOTES.length];

  function selectAge(id) {
    setAgeId(id);
    setAnswers(prev => ({ ...prev, [id]: prev[id] || Array(7).fill(null) }));
    goTo("instructions");
  }

  function answerQuestion(qIndex, score) {
    setAnswers(prev => {
      const arr = [...(prev[ageId] || Array(7).fill(null))];
      arr[qIndex] = score;
      return { ...prev, [ageId]: arr };
    });
  }

  function nextFromQuestion(qIndex) {
    if (qIndex === 6) goTo("email");
    else goTo(`q${qIndex + 1}`);
  }

  const result = useMemo(() => {
    if (!ageId) return null;
    const arr = answers[ageId];
    if (!arr || arr.some(v => v == null)) return null;
    return computeResult(arr);
  }, [ageId, answers]);

  async function submitEmail(e) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Проверьте, пожалуйста, адрес почты.");
      return;
    }
    setEmailError("");
    setSending(true);
    setSendError("");
    try {
      const ageLabel = AGE_GROUPS.find(g => g.id === ageId)?.label || ageId;
      const r = computeResult(answers[ageId]);
      await withTimeout(
        saveSubmission({
          email: trimmed,
          ageGroup: ageId,
          answers: answers[ageId],
          total: r.total,
          levelTitle: r.level.title,
        }),
        8000
      );
      const html = buildResultEmailHtml({ ageLabel, ...r });
      await withTimeout(
        queueResultEmail({
          to: trimmed,
          subject: "Расшифровка теста: образовательная стратегия вашего ребёнка",
          html,
        }),
        8000
      );
      setSent(true);
    } catch (err) {
      console.warn("Не удалось отправить результат:", err);
      setSendError("Не получилось отправить письмо, но результат уже готов ниже.");
    } finally {
      setSending(false);
      goTo("result");
    }
  }

  function restart() {
    setAgeId(null);
    setAnswers({});
    setEmail("");
    setEmailError("");
    setSendError("");
    setSent(false);
    goTo("start");
  }

  return (
    <div style={{ minHeight: "100%", background: C.bg, fontFamily: FONT, color: C.ink }}>
      {step !== "start" && (
        <div style={{ position: "sticky", top: 0, height: 4, background: C.border, zIndex: 5 }}>
          <div
            style={{
              height: "100%",
              width: `${progress * 100}%`,
              background: C.ink,
              transition: "width .25s ease",
            }}
          />
        </div>
      )}

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px 64px", position: "relative" }}>
        {step === "start" && <StartScreen onStart={() => goTo("age")} quote={quote} />}

        {step === "age" && <AgeScreen onSelect={selectAge} quote={quote} />}

        {step === "instructions" && (
          <InstructionsScreen onNext={() => goTo("q0")} onBack={() => goTo("age")} quote={quote} />
        )}

        {step.startsWith("q") && questions && (
          <QuestionScreen
            index={Number(step.slice(1))}
            total={7}
            question={questions[Number(step.slice(1))]}
            selected={currentAnswers[Number(step.slice(1))]}
            onAnswer={score => answerQuestion(Number(step.slice(1)), score)}
            onNext={() => nextFromQuestion(Number(step.slice(1)))}
            onBack={() => {
              const i = Number(step.slice(1));
              goTo(i === 0 ? "instructions" : `q${i - 1}`);
            }}
            quote={quote}
          />
        )}

        {step === "email" && (
          <EmailScreen
            email={email}
            setEmail={setEmail}
            error={emailError}
            sending={sending}
            onSubmit={submitEmail}
            onBack={() => goTo("q6")}
            quote={quote}
          />
        )}

        {step === "result" && result && (
          <ResultScreen
            ageLabel={AGE_GROUPS.find(g => g.id === ageId)?.label || ""}
            result={result}
            email={email}
            sent={sent}
            sendError={sendError}
            onRestart={restart}
            quote={quote}
          />
        )}
      </div>
    </div>
  );
}

// ---------- decorative bits ----------

function Sunburst({ color, size = 90, rays = 14, style }) {
  const lines = Array.from({ length: rays }, (_, i) => {
    const angle = (360 / rays) * i;
    return (
      <line
        key={i}
        x1="50"
        y1="50"
        x2="50"
        y2="6"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        transform={`rotate(${angle} 50 50)`}
      />
    );
  });
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ position: "absolute", pointerEvents: "none", ...style }}
      aria-hidden="true"
    >
      {lines}
    </svg>
  );
}

function Pill({ children, style }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "7px 16px",
        borderRadius: 999,
        border: `1.5px solid ${C.ink}`,
        background: "#fff",
        fontSize: 13,
        fontWeight: 800,
        letterSpacing: 0.2,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

function Highlight({ children }) {
  return (
    <span
      style={{
        background: C.yellow,
        padding: "0 6px",
        borderRadius: 4,
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
      }}
    >
      {children}
    </span>
  );
}

function Card({ children, style }) {
  return (
    <div
      style={{
        background: C.card,
        borderRadius: 24,
        padding: "28px 24px",
        border: `1.5px solid ${C.border}`,
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "15px 20px",
        borderRadius: 999,
        border: "none",
        background: disabled ? "#C7C9DA" : C.ink,
        color: "#fff",
        fontSize: 16,
        fontWeight: 800,
        cursor: disabled ? "default" : "pointer",
        fontFamily: FONT,
      }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "10px 4px",
        border: "none",
        background: "transparent",
        color: C.sub,
        fontSize: 15,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: FONT,
      }}
    >
      {children}
    </button>
  );
}

// ---------- screens ----------

function StartScreen({ onStart, quote }) {
  return (
    <Card>
      <Sunburst color={C.pink} size={80} style={{ top: 18, right: 18 }} />

      <Pill style={{ marginBottom: 18 }}>ТЕСТ ДЛЯ РОДИТЕЛЕЙ · 4–18 ЛЕТ</Pill>

      <h1
        style={{
          fontSize: 30,
          lineHeight: 1.2,
          fontWeight: 900,
          margin: "0 0 14px",
          textWrap: "balance",
        }}
      >
        Насколько продумана <Highlight>образовательная стратегия</Highlight> вашего ребёнка?
      </h1>

      <p style={{ fontSize: 16, lineHeight: 1.55, color: C.sub, margin: "0 0 22px", fontWeight: 600 }}>
        Пройдите короткий тест и узнайте, соответствует ли она возрасту ребёнка, поддерживает
        самостоятельность и интерес и сохраняет баланс нагрузки.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <Pill style={{ border: `1.5px solid ${C.border}`, fontWeight: 700 }}>📋 7 вопросов</Pill>
        <Pill style={{ border: `1.5px solid ${C.border}`, fontWeight: 700 }}>⏱ 3–5 минут</Pill>
      </div>

      <PrimaryButton onClick={onStart}>Начать тест</PrimaryButton>
      <p style={{ fontSize: 12, color: C.faint, marginTop: 16, lineHeight: 1.5, fontWeight: 600 }}>
        {DISCLAIMER}
      </p>

      <QuoteFrame quote={quote} />
    </Card>
  );
}

// Одна цитата внутри каждой карточки экрана — не отдельным блоком
// ниже, а частью того же видимого содержимого. Рамка и заливка
// полупрозрачные (жёлтый акцент бренда на пониженной непрозрачности),
// поэтому сквозь них слегка видна белая карточка под ними.
function QuoteFrame({ quote }) {
  return (
    <div
      style={{
        marginTop: 22,
        paddingTop: 18,
        borderTop: `1.5px solid ${C.border}`,
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          borderRadius: 16,
          border: "1.5px solid rgba(245,222,78,0.85)",
          background: "rgba(245,222,78,0.2)",
        }}
      >
        <div style={{ fontSize: 24, lineHeight: 0.6, fontWeight: 900, color: "rgba(24,26,34,0.32)" }}>
          &ldquo;
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.5, fontStyle: "italic", fontWeight: 700, margin: "2px 0 8px", color: C.ink }}>
          {quote.text}
        </p>
        <div style={{ fontSize: 12, fontWeight: 800, color: C.ink }}>
          {quote.author}
          <span style={{ fontWeight: 600, color: C.sub }}> · {quote.role}</span>
        </div>
      </div>
    </div>
  );
}

function AgeScreen({ onSelect, quote }) {
  return (
    <Card>
      <StepLabel>Шаг 1 из 2 · Возраст</StepLabel>
      <h2 style={{ fontSize: 22, fontWeight: 900, margin: "8px 0 18px" }}>Сколько лет вашему ребёнку?</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {AGE_GROUPS.map((g, i) => (
          <button
            key={g.id}
            onClick={() => onSelect(g.id)}
            style={{
              textAlign: "left",
              padding: "16px 18px",
              borderRadius: 16,
              border: "none",
              background: PASTELS[i % PASTELS.length],
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 900 }}>{g.label}</div>
            <div style={{ fontSize: 13, color: C.sub, marginTop: 2, fontWeight: 700 }}>{g.hint}</div>
          </button>
        ))}
      </div>
      <p style={{ fontSize: 13, color: C.faint, marginTop: 16, lineHeight: 1.5, fontWeight: 600 }}>
        Если ребёнок находится на границе диапазонов, выберите блок, который лучше соответствует
        текущему этапу развития.
      </p>

      <QuoteFrame quote={quote} />
    </Card>
  );
}

function InstructionsScreen({ onNext, onBack, quote }) {
  return (
    <Card>
      <StepLabel>Шаг 2 из 2 · Как отвечать</StepLabel>
      <h2 style={{ fontSize: 22, fontWeight: 900, margin: "8px 0 14px" }}>Прежде чем начать</h2>
      <p style={{ fontSize: 16, lineHeight: 1.55, color: C.sub, margin: "0 0 24px", fontWeight: 600 }}>
        Отвечайте, ориентируясь на последние 2–3 месяца, а не на единичные удачные или сложные
        ситуации. Выберите вариант, который точнее всего описывает вашу семейную практику.
      </p>
      <PrimaryButton onClick={onNext}>Дальше</PrimaryButton>
      <div style={{ textAlign: "center", marginTop: 4 }}>
        <GhostButton onClick={onBack}>Назад</GhostButton>
      </div>

      <QuoteFrame quote={quote} />
    </Card>
  );
}

function QuestionScreen({ index, total, question, selected, onAnswer, onNext, onBack, quote }) {
  return (
    <Card>
      <StepLabel>Вопрос {index + 1} из {total}</StepLabel>
      <h2 style={{ fontSize: 21, fontWeight: 900, lineHeight: 1.35, margin: "8px 0 4px" }}>
        {question.title}
      </h2>
      <p style={{ fontSize: 16, lineHeight: 1.5, color: C.sub, margin: "0 0 18px", fontWeight: 600 }}>
        {question.text}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
        {question.options.map((opt, i) => {
          const isSelected = selected === opt.score;
          return (
            <button
              key={opt.letter}
              onClick={() => onAnswer(opt.score)}
              style={{
                textAlign: "left",
                padding: "14px 16px",
                borderRadius: 16,
                border: isSelected ? `2px solid ${C.ink}` : "2px solid transparent",
                background: isSelected ? PASTELS[i % PASTELS.length] : C.bg,
                cursor: "pointer",
                fontFamily: FONT,
                fontSize: 15,
                lineHeight: 1.45,
                fontWeight: isSelected ? 800 : 600,
                color: C.ink,
              }}
            >
              {opt.text}
            </button>
          );
        })}
      </div>
      <PrimaryButton onClick={onNext} disabled={selected == null}>
        {index === total - 1 ? "Завершить" : "Дальше"}
      </PrimaryButton>
      <div style={{ textAlign: "center", marginTop: 4 }}>
        <GhostButton onClick={onBack}>Назад</GhostButton>
      </div>

      <QuoteFrame quote={quote} />
    </Card>
  );
}

function EmailScreen({ email, setEmail, error, sending, onSubmit, onBack, quote }) {
  return (
    <Card>
      <StepLabel>Последний шаг</StepLabel>
      <h2 style={{ fontSize: 22, fontWeight: 900, margin: "8px 0 12px" }}>Куда отправить расшифровку?</h2>
      <p style={{ fontSize: 15, lineHeight: 1.5, color: C.sub, margin: "0 0 20px", fontWeight: 600 }}>
        Укажите почту — мы пришлём туда подробную расшифровку результата и рекомендации.
      </p>
      <form onSubmit={onSubmit}>
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: 16,
            border: `2px solid ${error ? "#D9503A" : C.border}`,
            fontSize: 16,
            fontFamily: FONT,
            fontWeight: 700,
            marginBottom: 8,
            boxSizing: "border-box",
            background: C.bg,
          }}
        />
        {error && <p style={{ color: "#D9503A", fontSize: 13, fontWeight: 700, margin: "0 0 12px" }}>{error}</p>}
        <div style={{ height: error ? 8 : 20 }} />
        <PrimaryButton type="submit" disabled={sending}>
          {sending ? "Отправляем…" : "Получить расшифровку"}
        </PrimaryButton>
      </form>
      <div style={{ textAlign: "center", marginTop: 4 }}>
        <GhostButton onClick={onBack}>Назад</GhostButton>
      </div>

      <QuoteFrame quote={quote} />
    </Card>
  );
}

function ResultScreen({ ageLabel, result, email, sent, sendError, onRestart, quote }) {
  const { total, level, recommendations, priorityNote } = result;
  return (
    <Card>
      <StepLabel>Результат</StepLabel>
      <h2 style={{ fontSize: 23, fontWeight: 900, margin: "8px 0 4px" }}>
        <Highlight>{level.title}</Highlight>
      </h2>
      <p style={{ fontSize: 14, color: C.sub, margin: "10px 0 18px", fontWeight: 700 }}>
        {ageLabel} · {total} из 21 балла
      </p>

      {sendError ? (
        <Banner tone="warn">{sendError}</Banner>
      ) : (
        <Banner tone="ok">Мы отправили полную расшифровку на {email || "вашу почту"}.</Banner>
      )}

      <p style={{ fontSize: 16, lineHeight: 1.55, margin: "18px 0", fontWeight: 600 }}>{level.text}</p>

      {priorityNote && <Banner tone="warn">{priorityNote}</Banner>}

      {recommendations.length > 0 && (
        <>
          <SectionTitle>На что обратить внимание в первую очередь</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
            {recommendations.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: DOTS[i % DOTS.length],
                    marginTop: 6,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 15, lineHeight: 1.5, fontWeight: 600 }}>{r}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <SectionTitle>Вопросы для размышления</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {REFLECTION_QUESTIONS.map((q, i) => (
          <div key={i} style={{ background: PASTELS[i % PASTELS.length], borderRadius: 14, padding: "12px 14px" }}>
            <span style={{ fontSize: 14, lineHeight: 1.5, fontWeight: 700 }}>{q}</span>
          </div>
        ))}
      </div>

      <PrimaryButton onClick={onRestart}>Пройти ещё раз</PrimaryButton>
      <p style={{ fontSize: 12, color: C.faint, marginTop: 18, lineHeight: 1.5, fontWeight: 600 }}>{DISCLAIMER}</p>

      <QuoteFrame quote={quote} />
    </Card>
  );
}

function Banner({ tone, children }) {
  const bg = tone === "warn" ? C.warnBg : C.lavender;
  const color = tone === "warn" ? C.warnText : C.ink;
  return (
    <div style={{ background: bg, color, borderRadius: 14, padding: "12px 14px", fontSize: 14, fontWeight: 700, marginBottom: 12, lineHeight: 1.45 }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 800, color: C.ink, textTransform: "uppercase", letterSpacing: 0.3, margin: "0 0 10px" }}>
      {children}
    </div>
  );
}

function StepLabel({ children }) {
  return <div style={{ fontSize: 12, fontWeight: 800, color: C.faint, letterSpacing: 0.3, textTransform: "uppercase" }}>{children}</div>;
}
