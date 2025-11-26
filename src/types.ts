export type GameState = "lobby" | "question" | "result" | "leaderboard";

export interface Player {
    id: string;
    name: string;
    score: number;
    hasAnswered?: boolean;
}

export interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number; // Index of correct option
}

export interface GameData {
    state: GameState;
    players: Player[];
    currentQuestionIndex: number;
    questions: Question[];
    timeLeft: number;
}

export type ClientMessage =
    | { type: "join"; name: string }
    | { type: "answer"; questionIndex: number; answerIndex: number }
    | { type: "start_game"; questions: Question[] }
    | { type: "next_question" }
    | { type: "show_results" }
    | { type: "identify_host" }
    | { type: "restart" };

export type ServerMessage =
    | { type: "sync"; data: GameData }
    | { type: "error"; message: string }
    | { type: "game_terminated" };
