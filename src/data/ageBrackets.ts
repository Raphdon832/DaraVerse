import type { AgeBracketId } from "../types/models";

type AgeBracketRule = {
  id: AgeBracketId;
  label: string;
  min: number;
  max: number;
};

export const defaultAgeBracket: AgeBracketId = "11_13";

export const ageBracketRules: AgeBracketRule[] = [
  { id: "0_7", label: "0-7", min: 0, max: 7 },
  { id: "8_10", label: "8-10", min: 8, max: 10 },
  { id: "11_13", label: "11-13", min: 11, max: 13 },
  { id: "14_16", label: "14-16", min: 14, max: 16 },
  { id: "17_plus", label: "17+", min: 17, max: 120 },
];

export function getAgeBracketForAge(age: number): AgeBracketId {
  const bracket = ageBracketRules.find((rule) => age >= rule.min && age <= rule.max);
  return bracket?.id ?? defaultAgeBracket;
}

export function getAgeBracketLabel(bracketId: AgeBracketId | null | undefined) {
  if (!bracketId) {
    return ageBracketRules.find((rule) => rule.id === defaultAgeBracket)?.label ?? "11-13";
  }
  return ageBracketRules.find((rule) => rule.id === bracketId)?.label ?? "11-13";
}
