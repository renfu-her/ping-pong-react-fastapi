import React from 'react';
import { GameScreen } from '../types';

interface MainMenuProps {
  setScreen: (screen: GameScreen) => void;
  setTargetScore: (score: number) => void;
  currentTargetScore: number;
}

const MainMenu: React.FC<MainMenuProps> = ({ setScreen, setTargetScore, currentTargetScore }) => {
  
  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value);
    if (isNaN(val)) val = 0;
    // No maximum limit as requested
    setTargetScore(val);
  };

  const handleBlur = () => {
     // Ensure minimum 5 on blur
     if (currentTargetScore < 5) setTargetScore(5);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 animate-fade-in select-none">
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-arcade text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 tracking-tighter drop-shadow-lg">
          SMASH
        </h1>
        <h2 className="text-2xl font-bold text-white tracking-widest uppercase">
          Ping Pong
        </h2>
      </div>

      <div className="flex flex-col space-y-2 w-72">
        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider text-center">
          Rounds to Win
        </label>
        <div className="relative">
             <input 
                type="number" 
                min="5"
                value={currentTargetScore}
                onChange={handleScoreChange}
                onBlur={handleBlur}
                className="w-full bg-gray-900/50 text-white text-center font-arcade text-3xl py-4 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
             />
             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600 text-[10px] font-bold tracking-wider">
                 ROUNDS
             </div>
        </div>
        <p className="text-gray-600 text-[10px] text-center">Min: 5 Rounds | Max: None</p>
      </div>

      <div className="flex flex-col space-y-4 w-64 pt-4">
        <button
          onClick={() => setScreen(GameScreen.PLAYING)}
          className="group relative px-6 py-3 font-bold text-white bg-red-600 rounded-lg shadow-[0_4px_0_rgb(153,27,27)] active:shadow-[0_0px_0_rgb(153,27,27)] active:translate-y-1 transition-all hover:bg-red-500"
        >
          <span className="absolute inset-0 w-full h-full bg-white/20 group-hover:bg-white/30 rounded-lg transition-all" />
          START GAME
        </button>

        <button
          onClick={() => setScreen(GameScreen.LEADERBOARD)}
          className="group relative px-6 py-3 font-bold text-gray-900 bg-yellow-400 rounded-lg shadow-[0_4px_0_rgb(161,98,7)] active:shadow-[0_0px_0_rgb(161,98,7)] active:translate-y-1 transition-all hover:bg-yellow-300"
        >
          LEADERBOARD
        </button>
      </div>
    </div>
  );
};

export default MainMenu;