import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameScreen, Ball, Paddle, PlayerScore } from '../types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  BALL_RADIUS,
  INITIAL_BALL_SPEED,
  MAX_BALL_SPEED,
  TABLE_COLOR,
  NET_COLOR,
  PADDLE_PLAYER_COLOR,
  PADDLE_AI_COLOR,
  BALL_COLOR
} from '../constants';
import { gameService } from '../services/gameService';

interface GameEngineProps {
  setScreen: (screen: GameScreen) => void;
  targetScore: number;
  playerName: string;
}

const GameEngine: React.FC<GameEngineProps> = ({ setScreen, targetScore, playerName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameResult, setGameResult] = useState<'winner' | 'loser' | null>(null);
  
  // Game State Refs (Mutable for Performance Loop)
  const ballRef = useRef<Ball>({
    pos: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 },
    vel: { x: 0, y: 0 },
    speed: INITIAL_BALL_SPEED,
    radius: BALL_RADIUS,
  });
  
  const playerPaddleRef = useRef<Paddle>({
    pos: { x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2, y: CANVAS_HEIGHT - PADDLE_HEIGHT - 10 },
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
  });

  const aiPaddleRef = useRef<Paddle>({
    pos: { x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2, y: 10 },
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
  });

  const gameStateRef = useRef({
    isPlaying: false,
  });

  // Derived State for Server (Table Tennis Rules)
  // Serve alternates every 2 points.
  // If deuce (>= target-1 each), serve alternates every 1 point.
  const totalPoints = playerScore + aiScore;
  const isDeuce = playerScore >= targetScore - 1 && aiScore >= targetScore - 1;
  let isPlayerServing = true;
  
  if (isDeuce) {
      const pointsInDeuce = totalPoints - ((targetScore - 1) * 2);
      isPlayerServing = pointsInDeuce % 2 === 0;
  } else {
      isPlayerServing = Math.floor(totalPoints / 2) % 2 === 0;
  }

  // Sound effects (Simulated)
  const playSound = (type: 'hit' | 'score' | 'win') => {
     // Placeholder for sound
  };

  const resetBall = useCallback((pScore: number, aScore: number) => {
    // Determine server for the NEXT rally based on score passed in
    const total = pScore + aScore;
    const deuce = pScore >= targetScore - 1 && aScore >= targetScore - 1;
    let nextServerIsPlayer = true;

    if (deuce) {
        const diff = total - ((targetScore - 1) * 2);
        nextServerIsPlayer = diff % 2 === 0;
    } else {
        nextServerIsPlayer = Math.floor(total / 2) % 2 === 0;
    }

    const ball = ballRef.current;
    ball.pos = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
    ball.speed = INITIAL_BALL_SPEED;
    
    // Serve logic: 
    // Player serves -> Ball moves UP (negative Y) simulating a hit from bottom
    // AI serves -> Ball moves DOWN (positive Y) simulating a hit from top
    const directionY = nextServerIsPlayer ? -1 : 1;
    const directionX = (Math.random() - 0.5) * 1.5;

    // Normalize and set velocity
    const len = Math.sqrt(directionX * directionX + directionY * directionY);
    ball.vel = {
      x: (directionX / len) * ball.speed,
      y: (directionY / len) * ball.speed
    };
  }, [targetScore]);

  const saveScore = useCallback(async (pScore: number, aScore: number) => {
    try {
      await gameService.saveGameResult({
        player_name: playerName || "Player 1",
        player_score: pScore,
        cpu_score: aScore,
        target_score: targetScore,
      });
    } catch (error) {
      console.error('Failed to save game result:', error);
    }
  }, [targetScore, playerName]);

  const handleGameOver = useCallback((winner: 'player' | 'ai', finalPlayerScore: number, finalAiScore: number) => {
    // Stop game immediately
    gameStateRef.current.isPlaying = false;
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = undefined;
    }
    
    // Stop ball movement immediately
    ballRef.current.vel.x = 0;
    ballRef.current.vel.y = 0;
    
    // Set game result (winner or loser) - this will stop updateGame and gameLoop
    setGameResult(winner === 'player' ? 'winner' : 'loser');
    
    // Force final state update for UI
    setPlayerScore(finalPlayerScore);
    setAiScore(finalAiScore);

    saveScore(finalPlayerScore, finalAiScore);

    setTimeout(() => {
        setScreen(GameScreen.LEADERBOARD);
    }, 3000);

  }, [saveScore, setScreen]);

  const updateGame = useCallback(() => {
    if (isPaused || !gameStateRef.current.isPlaying || gameResult !== null) return;

    const ball = ballRef.current;
    const player = playerPaddleRef.current;
    const ai = aiPaddleRef.current;

    // Move Ball
    ball.pos.x += ball.vel.x;
    ball.pos.y += ball.vel.y;

    // Wall Collision (Left/Right)
    if (ball.pos.x - ball.radius < 0 || ball.pos.x + ball.radius > CANVAS_WIDTH) {
      ball.vel.x = -ball.vel.x;
      // Keep inside
      if (ball.pos.x < 0) ball.pos.x = ball.radius;
      if (ball.pos.x > CANVAS_WIDTH) ball.pos.x = CANVAS_WIDTH - ball.radius;
    }

    // AI Movement (Simple tracking with delay/error)
    const aiCenter = ai.pos.x + ai.width / 2;
    const dx = ball.pos.x - aiCenter;
    const maxAiSpeed = 5.0; // Slightly faster to handle higher speeds
    if (dx > maxAiSpeed) ai.pos.x += maxAiSpeed;
    else if (dx < -maxAiSpeed) ai.pos.x -= maxAiSpeed;
    else ai.pos.x += dx;

    // Clamp AI paddle
    if (ai.pos.x < 0) ai.pos.x = 0;
    if (ai.pos.x + ai.width > CANVAS_WIDTH) ai.pos.x = CANVAS_WIDTH - ai.width;

    // Paddle Collision - Player
    if (
      ball.pos.y + ball.radius >= player.pos.y && 
      ball.pos.y - ball.radius <= player.pos.y + player.height &&
      ball.vel.y > 0
    ) {
      if (ball.pos.x >= player.pos.x && ball.pos.x <= player.pos.x + player.width) {
        let collidePoint = ball.pos.x - (player.pos.x + player.width / 2);
        // Normalize -1 to 1
        collidePoint = collidePoint / (player.width / 2);
        
        // Calculate angle (max 45 degrees)
        const angleRad = (Math.PI / 4) * collidePoint;

        // Increase speed slightly
        ball.speed = Math.min(ball.speed + 0.5, MAX_BALL_SPEED);

        const direction = -1; // Up
        ball.vel.x = ball.speed * Math.sin(angleRad);
        ball.vel.y = direction * ball.speed * Math.cos(angleRad);
        playSound('hit');
      }
    }

    // Paddle Collision - AI
    if (
      ball.pos.y - ball.radius <= ai.pos.y + ai.height && 
      ball.pos.y + ball.radius >= ai.pos.y &&
      ball.vel.y < 0
    ) {
        if (ball.pos.x >= ai.pos.x && ball.pos.x <= ai.pos.x + ai.width) {
             let collidePoint = ball.pos.x - (ai.pos.x + ai.width / 2);
             collidePoint = collidePoint / (ai.width / 2);
             const angleRad = (Math.PI / 4) * collidePoint;
             
             ball.speed = Math.min(ball.speed + 0.5, MAX_BALL_SPEED);
             const direction = 1; // Down
             ball.vel.x = ball.speed * Math.sin(angleRad);
             ball.vel.y = direction * ball.speed * Math.cos(angleRad);
             playSound('hit');
        }
    }

    // Scoring
    if (ball.pos.y > CANVAS_HEIGHT) {
      // AI Score
      const newScore = aiScore + 1;
      setAiScore(newScore);
      
      // Check if total score equals targetScore
      const totalScore = playerScore + newScore;
      if (totalScore === targetScore) {
        // Game ends when total score equals targetScore
        const winner = newScore > playerScore ? 'ai' : 'player';
        handleGameOver(winner, playerScore, newScore);
      } else {
        resetBall(playerScore, newScore); // Pass NEW scores for serve logic
      }
    } else if (ball.pos.y < 0) {
      // Player Score
      const newScore = playerScore + 1;
      setPlayerScore(newScore);

      // Check if total score equals targetScore
      const totalScore = newScore + aiScore;
      if (totalScore === targetScore) {
        // Game ends when total score equals targetScore
        const winner = newScore > aiScore ? 'player' : 'ai';
        handleGameOver(winner, newScore, aiScore);
      } else {
        resetBall(newScore, aiScore); // Pass NEW scores for serve logic
      }
    }

  }, [isPaused, playerScore, aiScore, handleGameOver, resetBall, targetScore]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = TABLE_COLOR;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Net
    ctx.strokeStyle = NET_COLOR;
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT / 2);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT / 2);
    ctx.stroke();
    ctx.setLineDash([]); // Reset

    // Paddles
    ctx.fillStyle = PADDLE_PLAYER_COLOR;
    const p = playerPaddleRef.current;
    ctx.fillRect(p.pos.x, p.pos.y, p.width, p.height);
    
    ctx.fillStyle = PADDLE_AI_COLOR;
    const a = aiPaddleRef.current;
    ctx.fillRect(a.pos.x, a.pos.y, a.width, a.height);

    // Ball
    ctx.fillStyle = BALL_COLOR;
    const b = ballRef.current;
    ctx.beginPath();
    ctx.arc(b.pos.x, b.pos.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    
    // Shine on ball
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.arc(b.pos.x - 2, b.pos.y - 2, 2, 0, Math.PI * 2);
    ctx.fill();

  }, []);

  const gameLoop = useCallback(() => {
    // Stop immediately if game is over
    if (!gameStateRef.current.isPlaying || gameResult !== null) {
      return;
    }
    updateGame();
    draw();
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [updateGame, draw, gameResult]);

  // Input Handling
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (isPaused || gameResult !== null || !gameStateRef.current.isPlaying) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    // We get the rect of the canvas element itself, so coordinate scaling is always correct
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;

    if ('touches' in e) {
       clientX = e.touches[0].clientX;
    } else {
       clientX = (e as React.MouseEvent).clientX;
    }

    // Scale mouse position to canvas coordinates
    const scaleX = CANVAS_WIDTH / rect.width;
    const relativeX = (clientX - rect.left) * scaleX;

    // Center paddle on mouse
    let newX = relativeX - PADDLE_WIDTH / 2;

    // Clamp
    if (newX < 0) newX = 0;
    if (newX + PADDLE_WIDTH > CANVAS_WIDTH) newX = CANVAS_WIDTH - PADDLE_WIDTH;

    playerPaddleRef.current.pos.x = newX;
  };

  // Init
  useEffect(() => {
    gameStateRef.current.isPlaying = true;
    resetBall(0, 0); // Init
    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      gameStateRef.current.isPlaying = false;
    };
  }, [gameLoop, resetBall]);

  return (
    <div className="flex flex-col h-full w-full p-4 pt-safe items-center justify-between overflow-hidden">
      
      {/* Score Header Block - Fixed height */}
      <div className="w-full max-w-[500px] shrink-0 bg-gray-800 rounded-xl border border-gray-700 p-3 shadow-xl flex justify-between items-center z-10">
        {/* CPU */}
        <div className="flex flex-col items-center w-20">
            <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider mb-1">CPU</span>
            <div className="flex items-center gap-2">
                 {!isPlayerServing && <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(250,204,21,0.8)]" />}
                 <span className="font-arcade text-3xl text-white">{aiScore}</span>
            </div>
        </div>

        {/* Target */}
        <div className="flex flex-col items-center px-2">
             <div className="bg-gray-900/50 px-4 py-2 rounded-lg border border-gray-700">
                <span className="text-[10px] font-mono text-gray-400 font-bold tracking-widest block text-center">ROUNDS</span>
                <span className="text-xl font-arcade text-yellow-400 block text-center leading-none mt-1">{targetScore}</span>
             </div>
        </div>

        {/* Player */}
        <div className="flex flex-col items-center w-20">
            <span className="text-[10px] text-red-300 font-bold uppercase tracking-wider mb-1">YOU</span>
            <div className="flex items-center gap-2">
                <span className="font-arcade text-3xl text-white">{playerScore}</span>
                {isPlayerServing && <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(250,204,21,0.8)]" />}
            </div>
        </div>
      </div>

      {/* Game Canvas Container - Flex Grow to fill space */}
      <div 
        className="flex-1 w-full flex items-center justify-center relative my-4 min-h-0"
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
      >
        <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="max-w-full max-h-full w-auto h-auto object-contain shadow-2xl rounded-lg border-4 border-gray-700 aspect-[2/3] bg-blue-900"
            style={{ touchAction: 'none' }} 
        />
        
        {/* Pause Overlay - Centered in flex area */}
        {isPaused && (
             <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="bg-black/80 backdrop-blur-sm p-6 rounded-lg border-2 border-white shadow-2xl">
                    <div className="text-white font-arcade text-2xl tracking-widest text-center animate-pulse">PAUSED</div>
                </div>
             </div>
        )}
        
        {/* Game Over Overlay */}
        {gameResult && (
             <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                <div className="bg-black/90 backdrop-blur-sm p-8 rounded-lg border-4 shadow-2xl animate-pulse"
                     style={{ borderColor: gameResult === 'winner' ? '#10b981' : '#ef4444' }}>
                    <div className={`font-arcade text-4xl tracking-widest text-center ${
                      gameResult === 'winner' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {gameResult === 'winner' ? 'WINNER!' : 'LOSER!'}
                    </div>
                    <div className="text-white text-center mt-4 text-lg">
                      {playerScore} - {aiScore}
                    </div>
                </div>
             </div>
        )}
      </div>

      {/* Controls - Fixed height at bottom */}
      <div className="w-full max-w-[500px] shrink-0 pb-2 flex gap-4">
         <button 
            onClick={() => setIsPaused(!isPaused)}
            className="flex-1 py-4 bg-gray-700 text-white rounded-lg text-sm font-bold border-b-4 border-gray-900 active:border-b-0 active:translate-y-1 transition-all"
         >
            {isPaused ? "RESUME" : "PAUSE"}
         </button>
         <button 
            onClick={() => setScreen(GameScreen.MENU)}
            className="flex-1 py-4 bg-red-700 text-white rounded-lg text-sm font-bold border-b-4 border-red-900 active:border-b-0 active:translate-y-1 transition-all"
         >
            QUIT
         </button>
      </div>
      
    </div>
  );
};

export default GameEngine;