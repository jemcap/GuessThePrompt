export interface OutcomeProps {
  outcome: string;
  outcomeType: "text" | "code";
  difficulty: number;
  isLoading?: boolean;
}
