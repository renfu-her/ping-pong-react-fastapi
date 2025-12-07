import React, { useState } from 'react';
import { GameScreen } from './types';
import MainMenu from './components/MainMenu';
import GameEngine from './components/GameEngine';
import Leaderboard from './components/Leaderboard';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>(GameScreen.MENU);
  // Default to 11 points
  const [targetScore, setTargetScore] = useState<number>(11);

  return (
    <div className="w-full h-[100dvh] bg-neutral-900 flex flex-col items-center justify-center overflow-hidden">
        {/* CRT Scanline Effect Overlay */}
        <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20"></div>
        
        <div className="w-full h-full max-w-2xl bg-gray-800/20 md:border-x border-gray-800 shadow-2xl relative">
            {currentScreen === GameScreen.MENU && (
              <MainMenu 
                setScreen={setCurrentScreen} 
                setTargetScore={setTargetScore}
                currentTargetScore={targetScore}
              />
            )}
            {currentScreen === GameScreen.PLAYING && (
              <GameEngine 
                setScreen={setCurrentScreen} 
                targetScore={targetScore}
              />
            )}
            {currentScreen === GameScreen.LEADERBOARD && <Leaderboard setScreen={setCurrentScreen} />}
        </div>
    </div>
  );
};

export default App;