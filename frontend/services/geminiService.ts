import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

try {
  if (process.env.API_KEY) {
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
} catch (error) {
  console.error("Failed to initialize Gemini Client:", error);
}

export const getMatchCommentary = async (
  playerScore: number,
  aiScore: number,
  lastEvent: 'player_point' | 'ai_point' | 'game_start' | 'game_over' | 'deuce',
  streak: number
): Promise<string> => {
  if (!genAI) return "Gemini API Key missing. Enjoy the silence.";

  const prompt = `
    You are a high-energy, slightly sarcastic table tennis commentator.
    Generate a VERY SHORT (max 15 words) comment for the current match situation.

    Context:
    - Player Score: ${playerScore}
    - AI Opponent Score: ${aiScore}
    - Last Event: ${lastEvent}
    - Player Streak: ${streak}

    Tone: Witty, fast-paced, arcade style.
    If it's game start: "Ready? Serve!"
    If player is winning: Cheer them on.
    If AI is winning: Be slightly ominous or tease the player.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini commentary error:", error);
    return "";
  }
};