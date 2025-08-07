import type { StatsProps } from "../../types/stats/StatsProps";

function Stats({ level = 1, score = 0, streak = 0 }: StatsProps) {
  return (
    <div className="flex items-center gap-6 text-sm w-full align-elements justify-end">
      <div className="flex items-center gap-2">
        <span className="text-gray-500">Level</span>
        <span className="font-semibold text-gray-900">{level}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-500">Score</span>
        <span className="font-semibold text-gray-900">{score.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-500">Streak</span>
        <span className="font-semibold text-gray-900">{streak}</span>
        {streak > 0 && <span className="text-orange-500">🔥</span>}
      </div>
    </div>
  );
}

export default Stats;
