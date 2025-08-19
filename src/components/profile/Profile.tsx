import { useAuth } from "../../contexts/AuthContext";
import {
  calculateLevelFromXP,
  calculateRankFromLevel,
} from "../../utils/levelUtils";
import {
  FaBullseye,
  FaKeyboard,
  FaFire,
  FaStar,
  FaDumbbell,
  FaCoins,
  FaGraduationCap,
  FaRunning,
  FaBolt,
} from "react-icons/fa";
import { MdOutlineGrass } from "react-icons/md";

const Profile = () => {
  const { user, userStats } = useAuth();
  console.log("stats:", userStats);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Please log in to view your profile.
          </h2>
        </div>
      </div>
    );
  }

  const userInitials = user.username
    ? user.username.charAt(0).toUpperCase().trim()
    : "U";

  // Mock data - replace with actual data from your backend
  const totalXP = userStats?.totalXP || 0;

  // Calculate level and rank from XP
  const levelInfo = calculateLevelFromXP(totalXP);
  const rankInfo = calculateRankFromLevel(levelInfo.level);

  const profileData = {
    currentStreak: userStats?.currentStreak || 0,
    longestStreak: userStats?.longestStreak || 0,
    totalSubmissions: userStats?.totalSubmissions || 0,
    totalXP: totalXP,
    level: levelInfo.level,
    rank: rankInfo.rank,
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            {/* Avatar */}
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold border-3 border-yellow-400 shadow-xl">
                {userInitials}
              </div>
              {/* Level badge on avatar */}
              <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-gray-900 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow-lg">
                {userStats?.rankNumber}
              </div>
            </div>

            {/* User Info */}
            <h1 className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {user.username}
            </h1>

            {/* Rank Badge */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/50 border border-gray-700 ${rankInfo.color} mb-4`}
            >
              <span className="text-sm font-semibold">{userStats?.rank}</span>
            </div>
          </div>

          {/* Level Progress Section */}
          <div className="max-w-2xl mx-auto px-4 sm:px-0">
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 sm:p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="text-left">
                  <div className="text-lg sm:text-xl font-bold text-white">
                    Level {userStats?.rankNumber}
                  </div>
                  <div className="text-sm text-gray-400">
                    Progress to Level {userStats?.rankNumber + 1}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-lg sm:text-xl font-bold text-yellow-400">
                    {userStats?.currentXP} XP
                  </div>
                  {/* <div className="text-sm text-gray-400">/ {levelInfo.xpForNextLevel.toLocaleString()} XP</div> */}
                  <div className="text-sm text-gray-400">
                    / {userStats?.xpForNextLevel || 0} XP
                  </div>
                </div>
              </div>

              {/* Enhanced Progress Bar */}
              <div className="relative">
                <div className="w-full bg-gray-700 rounded-full h-3 shadow-inner">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-700 ease-out shadow-lg relative overflow-hidden"
                    style={{ width: `${userStats?.progressToNextLevel}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0 XP</span>
                  <span>{userStats?.xpForNextLevel.toLocaleString()} XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h2 className="text-lg sm:text-xl font-bold text-center mb-4 sm:mb-6 text-gray-200">
          Your Statistics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="group bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-orange-500/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div>
                  <span className="text-gray-400 text-xs font-medium">
                    Total Submissions
                  </span>

                </div>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {profileData.totalSubmissions}
              <span className="text-sm text-gray-400 ml-1">
                {profileData.totalSubmissions < 2
                  ? "submission"
                  : "submissions"}
              </span>
            </div>
          </div>
          {/* Current Streak */}
          <div className="group bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-orange-500/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div>
                  <span className="text-gray-400 text-xs font-medium">
                    Current Streak
                  </span>
                </div>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {profileData.currentStreak}
              <span className="text-sm text-gray-400 ml-1">days</span>
            </div>
          </div>

          {/* Longest Streak */}
          <div className="group bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-red-500/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div>
                  <span className="text-gray-400 text-xs font-medium">
                    Longest Streak
                  </span>
                </div>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {profileData.longestStreak}
              <span className="text-sm text-gray-400 ml-1">days</span>
            </div>
          </div>

          {/* Total XP */}
          <div className="group bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-yellow-500/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div>
                  <span className="text-gray-400 text-xs font-medium">
                    Total Experience
                  </span>
                  <div className={`text-xs ${rankInfo.color}`}>
                    {rankInfo.rank} Rank
                  </div>
                </div>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {totalXP.toLocaleString()}
              <span className="text-lg text-gray-400 ml-1">XP</span>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-lg sm:text-xl font-bold text-center mb-4 sm:mb-6 text-gray-200">
            Achievements
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* 10 MVP-Achievable Achievements */}

            {/* First Steps */}
            <div
              className={`group bg-gradient-to-br from-gray-800 to-gray-900 border rounded-xl p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105 ${
                levelInfo.level >= 1
                  ? "border-green-500/50 hover:border-green-400"
                  : "border-gray-700/50 opacity-50"
              }`}
            >
              <div
                className={`text-2xl mb-2 ${
                  levelInfo.level >= 1 ? "text-green-400" : "text-gray-500"
                }`}
              >
                <FaBullseye className="mx-auto" />
              </div>
              <div
                className={`text-xs font-medium ${
                  levelInfo.level >= 1 ? "text-green-400" : "text-gray-500"
                }`}
              >
                Baby Steps
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Complete first prompt
              </div>
            </div>

            {/* Quick Starter */}
            <div
              className={`group bg-gradient-to-br from-gray-800 to-gray-900 border rounded-xl p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105 ${
                profileData.currentStreak >= 3
                  ? "border-orange-500/50 hover:border-orange-400"
                  : "border-gray-700/50 opacity-50"
              }`}
            >
              <div
                className={`text-2xl mb-2 ${
                  profileData.currentStreak >= 3
                    ? "text-orange-400"
                    : "text-gray-500"
                }`}
              >
                <FaFire className="mx-auto" />
              </div>
              <div
                className={`text-xs font-medium ${
                  profileData.currentStreak >= 3
                    ? "text-orange-400"
                    : "text-gray-500"
                }`}
              >
                Quick Starter
              </div>
              <div className="text-xs text-gray-600 mt-1">3 day streak</div>
            </div>

            {/* Rising Star */}
            <div
              className={`group bg-gradient-to-br from-gray-800 to-gray-900 border rounded-xl p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105 ${
                levelInfo.level >= 5
                  ? "border-blue-500/50 hover:border-blue-400"
                  : "border-gray-700/50 opacity-50"
              }`}
            >
              <div
                className={`text-2xl mb-2 ${
                  levelInfo.level >= 5 ? "text-blue-400" : "text-gray-500"
                }`}
              >
                <FaStar className="mx-auto" />
              </div>
              <div
                className={`text-xs font-medium ${
                  levelInfo.level >= 5 ? "text-blue-400" : "text-gray-500"
                }`}
              >
                We All Start Somewhere
              </div>
              <div className="text-xs text-gray-600 mt-1">Reach Level 5</div>
            </div>

            {/* Week Warrior */}
            <div
              className={`group bg-gradient-to-br from-gray-800 to-gray-900 border rounded-xl p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105 ${
                profileData.currentStreak >= 7
                  ? "border-purple-500/50 hover:border-purple-400"
                  : "border-gray-700/50 opacity-50"
              }`}
            >
              <div
                className={`text-2xl mb-2 ${
                  profileData.currentStreak >= 7
                    ? "text-purple-400"
                    : "text-gray-500"
                }`}
              >
                <FaDumbbell className="mx-auto" />
              </div>
              <div
                className={`text-xs font-medium ${
                  profileData.currentStreak >= 7
                    ? "text-purple-400"
                    : "text-gray-500"
                }`}
              >
                The Grind Don't Stop
              </div>
              <div className="text-xs text-gray-600 mt-1">7 day streak</div>
            </div>

            {/* XP Collector */}
            <div
              className={`group bg-gradient-to-br from-gray-800 to-gray-900 border rounded-xl p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105 ${
                totalXP >= 50000
                  ? "border-yellow-500/50 hover:border-yellow-400"
                  : "border-gray-700/50 opacity-50"
              }`}
            >
              <div
                className={`text-2xl mb-2 ${
                  totalXP >= 50000 ? "text-yellow-400" : "text-gray-500"
                }`}
              >
                <FaCoins className="mx-auto" />
              </div>
              <div
                className={`text-xs font-medium ${
                  totalXP >= 50000 ? "text-yellow-400" : "text-gray-500"
                }`}
              >
                You Might Have A Gift
              </div>
              <div className="text-xs text-gray-600 mt-1">50K XP earned</div>
            </div>

            {/* Skilled Prompter */}
            <div
              className={`group bg-gradient-to-br from-gray-800 to-gray-900 border rounded-xl p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105 ${
                levelInfo.level >= 10
                  ? "border-cyan-500/50 hover:border-cyan-400"
                  : "border-gray-700/50 opacity-50"
              }`}
            >
              <div
                className={`text-2xl mb-2 ${
                  levelInfo.level >= 10 ? "text-cyan-400" : "text-gray-500"
                }`}
              >
                <FaGraduationCap className="mx-auto" />
              </div>
              <div
                className={`text-xs font-medium ${
                  levelInfo.level >= 10 ? "text-cyan-400" : "text-gray-500"
                }`}
              >
                Getting Better And Better
              </div>
              <div className="text-xs text-gray-600 mt-1">Reach Level 10</div>
            </div>

            {/* Dedicated User */}
            <div
              className={`group bg-gradient-to-br from-gray-800 to-gray-900 border rounded-xl p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105 ${
                profileData.currentStreak >= 14
                  ? "border-emerald-500/50 hover:border-emerald-400"
                  : "border-gray-700/50 opacity-50"
              }`}
            >
              <div
                className={`text-2xl mb-2 ${
                  profileData.currentStreak >= 14
                    ? "text-emerald-400"
                    : "text-gray-500"
                }`}
              >
                <FaRunning className="mx-auto" />
              </div>
              <div
                className={`text-xs font-medium ${
                  profileData.currentStreak >= 14
                    ? "text-emerald-400"
                    : "text-gray-500"
                }`}
              >
                Keep The Momentum Going
              </div>
              <div className="text-xs text-gray-600 mt-1">14 day streak</div>
            </div>

            {/* Power User */}
            <div
              className={`group bg-gradient-to-br from-gray-800 to-gray-900 border rounded-xl p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105 ${
                levelInfo.level >= 20
                  ? "border-red-500/50 hover:border-red-400"
                  : "border-gray-700/50 opacity-50"
              }`}
            >
              <div
                className={`text-2xl mb-2 ${
                  levelInfo.level >= 20 ? "text-red-400" : "text-gray-500"
                }`}
              >
                <FaBolt className="mx-auto" />
              </div>
              <div
                className={`text-xs font-medium ${
                  levelInfo.level >= 20 ? "text-red-400" : "text-gray-500"
                }`}
              >
                Reverse Engineer-erer
              </div>
              <div className="text-xs text-gray-600 mt-1">Reach Level 20</div>
            </div>

            {/* Month Master */}
            <div
              className={`group bg-gradient-to-br from-gray-800 to-gray-900 border rounded-xl p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105 ${
                profileData.currentStreak >= 30
                  ? "border-pink-500/50 hover:border-pink-400"
                  : "border-gray-700/50 opacity-50"
              }`}
            >
              <div
                className={`text-2xl mb-2 ${
                  profileData.currentStreak >= 30
                    ? "text-pink-400"
                    : "text-gray-500"
                }`}
              >
                <MdOutlineGrass className="mx-auto" />
              </div>
              <div
                className={`text-xs font-medium ${
                  profileData.currentStreak >= 30
                    ? "text-pink-400"
                    : "text-gray-500"
                }`}
              >
                Touch Some Grass
              </div>
              <div className="text-xs text-gray-600 mt-1">30 day streak</div>
            </div>

            {/* XP Enthusiast */}
            <div
              className={`group bg-gradient-to-br from-gray-800 to-gray-900 border rounded-xl p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105 ${
                totalXP >= 250000
                  ? "border-indigo-500/50 hover:border-indigo-400"
                  : "border-gray-700/50 opacity-50"
              }`}
            >
              <div
                className={`text-2xl mb-2 ${
                  totalXP >= 250000 ? "text-indigo-400" : "text-gray-500"
                }`}
              >
                <FaKeyboard className="mx-auto" />
              </div>
              <div
                className={`text-xs font-medium ${
                  totalXP >= 250000 ? "text-indigo-400" : "text-gray-500"
                }`}
              >
                Keyboard Warrior
              </div>
              <div className="text-xs text-gray-600 mt-1">250K XP earned</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
