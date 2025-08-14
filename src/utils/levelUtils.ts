export interface LevelInfo {
  level: number;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressToNextLevel: number;
}

export interface RankInfo {
  rank: string;
  rankNumber: number;
  color: string;
}

// XP required for each level (exponential growth)
export const calculateXPForLevel = (level: number): number => {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(1.5, level - 2));
};

// Calculate total XP required to reach a specific level
export const calculateTotalXPForLevel = (level: number): number => {
  let totalXP = 0;
  for (let i = 1; i < level; i++) {
    totalXP += calculateXPForLevel(i + 1);
  }
  return totalXP;
};

// Calculate level info from total score/XP
export const calculateLevelFromXP = (totalXP: number): LevelInfo => {
  let level = 1;
  let accumulatedXP = 0;

  // Find the current level
  while (accumulatedXP + calculateXPForLevel(level + 1) <= totalXP) {
    accumulatedXP += calculateXPForLevel(level + 1);
    level++;
  }

  const xpForCurrentLevel = calculateXPForLevel(level);
  const xpForNextLevel = calculateXPForLevel(level + 1);
  const currentXP = totalXP - accumulatedXP;
  const progressToNextLevel = level === 1 
    ? (currentXP / xpForNextLevel) * 100 
    : (currentXP / xpForNextLevel) * 100;

  return {
    level,
    currentXP,
    xpForCurrentLevel,
    xpForNextLevel,
    progressToNextLevel: Math.min(progressToNextLevel, 100),
  };
};

// Rank tiers based on level
export const calculateRankFromLevel = (level: number): RankInfo => {
  const ranks = [
    { min: 1, max: 5, name: "Rookie Prompter", color: "text-gray-400" },
    { min: 6, max: 10, name: "Novice Prompter", color: "text-green-400" },
    { min: 11, max: 20, name: "Adept Prompter", color: "text-blue-400" },
    { min: 21, max: 35, name: "Expert Prompter", color: "text-purple-400" },
    { min: 36, max: 50, name: "Master Prompter", color: "text-orange-400" },
    { min: 51, max: 75, name: "Grandmaster Prompter", color: "text-red-400" },
    { min: 76, max: 100, name: "Legend Prompter", color: "text-yellow-400" },
    { min: 101, max: Infinity, name: "Mythic Prompter", color: "text-pink-400" },
  ];

  const rank = ranks.find(r => level >= r.min && level <= r.max) || ranks[0];
  
  return {
    rank: rank.name,
    rankNumber: level,
    color: rank.color,
  };
};

// Calculate rank emoji based on level
export const getRankEmoji = (level: number): string => {
  if (level >= 101) return "🏆"; // Mythic
  if (level >= 76) return "⭐"; // Legend  
  if (level >= 51) return "💎"; // Grandmaster
  if (level >= 36) return "🔥"; // Master
  if (level >= 21) return "⚡"; // Expert
  if (level >= 11) return "🎯"; // Adept
  if (level >= 6) return "🌟"; // Apprentice
  return "📚"; // Novice
};