import { LEVELS, THEMATIC_NOTES, WORKLOAD_WARNING, PRIORITY_RULE_NOTE } from "../data/questions.js";

// answers: an array of 7 scores (0–3), one per question, in question order 1..7.
export function computeResult(answers) {
  const total = answers.reduce((s, v) => s + v, 0);
  const level = LEVELS.find(l => total >= l.min && total <= l.max) || LEVELS[LEVELS.length - 1];

  // Tie-break order when scores are equal: question 7 first (index 6),
  // then question 1 (index 0), then the rest in ascending order.
  const tieOrder = i => (i === 6 ? 0 : i === 0 ? 1 : i + 2);
  const order = [...answers.keys()].sort(
    (a, b) => answers[a] - answers[b] || tieOrder(a) - tieOrder(b)
  );

  const recommendations = [];
  const usedIndexes = new Set();

  if (answers[6] <= 1) {
    recommendations.push(WORKLOAD_WARNING);
    usedIndexes.add(6);
  }

  for (const i of order) {
    if (recommendations.length >= 3) break;
    if (usedIndexes.has(i)) continue;
    if (answers[i] <= 1) {
      recommendations.push(THEMATIC_NOTES[i]);
      usedIndexes.add(i);
    }
  }

  // If there aren't enough weak spots (scores 0–1), fill the rest with
  // areas answered "B" (score 2) — matching the top-tier advice to make
  // those answers "more consistent." Areas with the best answer "A"
  // (score 3) never make the recommendations — there's no issue there
  // worth naming.
  if (recommendations.length < 2) {
    for (const i of order) {
      if (recommendations.length >= 3) break;
      if (usedIndexes.has(i)) continue;
      if (answers[i] === 2) {
        recommendations.push(THEMATIC_NOTES[i]);
        usedIndexes.add(i);
      }
    }
  }

  const hasZero = answers.some(a => a === 0);

  return {
    total,
    level,
    recommendations,
    priorityNote: hasZero ? PRIORITY_RULE_NOTE : null,
  };
}
