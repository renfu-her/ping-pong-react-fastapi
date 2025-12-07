import React, { useEffect, useState } from 'react';
import { GameScreen, PlayerScore } from '../types';

interface LeaderboardProps {
  setScreen: (screen: GameScreen) => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ setScreen }) => {
  const [scores, setScores] = useState<PlayerScore[]>([]);

  useEffect(() => {
    const savedScores = localStorage.getItem('pingpong_scores');
    if (savedScores) {
      try {
        const parsed = JSON.parse(savedScores) as PlayerScore[];
        // Sort by score descending
        const sorted = parsed.sort((a, b) => b.score - a.score).slice(0, 10);
        setScores(sorted);
      } catch (e) {
        console.error("Failed to parse scores", e);
      }
    }
  }, []);

  return (
    <div className="flex flex-col items-center h-full w-full max-w-md mx-auto p-6 bg-gray-900/90 rounded-xl shadow-2xl border border-gray-700">
      <h2 className="text-3xl font-arcade text-yellow-400 mb-8 mt-4 text-center">
        HALL OF FAME
      </h2>

      <div className="w-full flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar">
        {scores.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">No matches recorded yet.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-gray-400 border-b border-gray-700">
              <tr>
                <th className="py-2 pl-2">Rank</th>
                <th className="py-2">Score</th>
                <th className="py-2 text-right pr-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                  <td className="py-3 pl-2 font-mono text-gray-300">
                    {index + 1}.
                  </td>
                  <td className="py-3 font-bold text-white">
                    <span className="text-green-400">{s.score}</span>
                    <span className="text-gray-500 mx-1">-</span>
                    <span className="text-red-400">{s.opponentScore}</span>
                  </td>
                  <td className="py-3 text-right pr-2 text-gray-500 text-xs">
                    {new Date(s.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <button
        onClick={() => setScreen(GameScreen.MENU)}
        className="w-full py-3 font-bold text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors border border-gray-600"
      >
        BACK TO MENU
      </button>
    </div>
  );
};

export default Leaderboard;