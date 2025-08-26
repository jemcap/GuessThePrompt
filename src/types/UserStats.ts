export interface UserStats {
  level: number;
  score: number;
  streak: number;
  totalGames?: number;
  correctGuesses?: number;
  lastPlayed?: string;
  highestStreak?: number;
}

export const defaultUserStats: UserStats = {
  level: 1,
  score: 0,
  streak: 0,
  totalGames: 0,
  correctGuesses: 0,
};