import type * as Party from "partykit/server";

type GameState = "lobby" | "question" | "result" | "leaderboard";

interface Player {
    id: string;
    name: string;
    score: number;
}

interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
}

interface GameData {
    state: GameState;
    players: Player[];
    currentQuestionIndex: number;
    questions: Question[];
    timeLeft: number;
}

export default class Server implements Party.Server {
    data: GameData;

    constructor(readonly room: Party.Room) {
        this.data = {
            state: "lobby",
            players: [],
            currentQuestionIndex: 0,
            questions: [],
            timeLeft: 0,
        };
    }

    onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
        // Send current state to new connection
        this.broadcastState();
    }

    onMessage(message: string, sender: Party.Connection) {
        const msg = JSON.parse(message);

        if (msg.type === "join") {
            const newPlayer: Player = { id: sender.id, name: msg.name, score: 0 };
            this.data.players.push(newPlayer);
            this.broadcastState();
        } else if (msg.type === "start_game") {
            this.data.questions = msg.questions;
            this.data.state = "question";
            this.data.currentQuestionIndex = 0;
            this.data.timeLeft = 30; // 30 seconds per question
            this.broadcastState();
        } else if (msg.type === "answer") {
            const player = this.data.players.find((p) => p.id === sender.id);
            if (player && this.data.state === "question") {
                const question = this.data.questions[this.data.currentQuestionIndex];
                if (question && msg.answerIndex === question.correctAnswer) {
                    player.score += 100; // Simple scoring
                }
            }
        } else if (msg.type === "next_question") {
            if (this.data.currentQuestionIndex < this.data.questions.length - 1) {
                this.data.currentQuestionIndex++;
                this.data.state = "question";
                this.data.timeLeft = 30;
            } else {
                this.data.state = "leaderboard";
            }
            this.broadcastState();
        } else if (msg.type === "show_results") {
            this.data.state = "result";
            this.broadcastState();
        } else if (msg.type === "restart") {
            this.data.state = "lobby";
            this.data.currentQuestionIndex = 0;
            this.data.questions = [];
            this.data.players.forEach(p => p.score = 0);
            this.broadcastState();
        }
    }

    broadcastState() {
        this.room.broadcast(JSON.stringify({ type: "sync", data: this.data }));
    }
}

Server satisfies Party.Worker;
