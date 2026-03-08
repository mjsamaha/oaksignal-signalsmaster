import { Doc } from "../../_generated/dataModel";

export function getCurrentQuestionIndex(
  questions: Doc<"examQuestions">[]
): number | null {
  const sorted = [...questions].sort((a, b) => a.questionIndex - b.questionIndex);
  const next = sorted.find((question) => question.userAnswer === null);
  return next ? next.questionIndex : null;
}

export function getLastAnsweredAt(
  questions: Doc<"examQuestions">[]
): number | null {
  return questions
    .map((question) => question.answeredAt ?? null)
    .filter((answeredAt): answeredAt is number => answeredAt !== null)
    .sort((a, b) => b - a)[0] ?? null;
}

export function roundToTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getQuestionResponseTimeMs(input: {
  startedAt: number;
  sortedQuestions: Doc<"examQuestions">[];
  index: number;
}): number | undefined {
  const current = input.sortedQuestions[input.index];
  const currentAnsweredAt = current.answeredAt;
  if (!currentAnsweredAt) {
    return undefined;
  }

  const previous = input.sortedQuestions[input.index - 1];
  const baseline = previous?.answeredAt ?? input.startedAt;
  const delta = currentAnsweredAt - baseline;
  return delta >= 0 ? delta : 0;
}
