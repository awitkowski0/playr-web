import type * as Party from "partykit/server";

type GameState = "lobby" | "question" | "result" | "leaderboard";

interface Player {
    id: string;
    name: string;
    score: number;
    hasAnswered?: boolean;
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

    onClose(conn: Party.Connection) {
        if (conn.id === this.hostId) {
            this.hostId = null;
            this.room.broadcast(JSON.stringify({ type: "game_terminated" }));
            // Optionally reset game state
            this.clearTimer();
            this.data = {
                state: "lobby",
                players: [],
                currentQuestionIndex: 0,
                questions: [],
                timeLeft: 0,
            };
        } else {
            this.data.players = this.data.players.filter(p => p.id !== conn.id);
            this.broadcastState();
        }
    }

    hostId: string | null = null;

    onMessage(message: string, sender: Party.Connection) {
        const msg = JSON.parse(message);

        if (msg.type === "identify_host") {
            this.hostId = sender.id;
        } else if (msg.type === "join") {
            const newPlayer: Player = { id: sender.id, name: msg.name, score: 0 };
            this.data.players.push(newPlayer);
            this.broadcastState();
        } else if (msg.type === "start_game") {
            this.data.questions = msg.questions;
            this.data.state = "question";
            this.data.currentQuestionIndex = 0;
            this.data.players.forEach(p => p.hasAnswered = false);
            this.startTimer(30);
            this.broadcastState();
        } else if (msg.type === "answer") {
            const player = this.data.players.find((p) => p.id === sender.id);
            if (player && this.data.state === "question" && !player.hasAnswered) {
                player.hasAnswered = true;
                const question = this.data.questions[this.data.currentQuestionIndex];
                if (question && msg.answerIndex === question.correctAnswer) {
                    player.score += 100; // Simple scoring
                }

                // Check if all players answered
                if (this.data.players.every(p => p.hasAnswered)) {
                    this.clearTimer();
                    this.data.state = "result";
                    this.startTimer(5);
                    this.broadcastState();
                } else {
                    this.broadcastState();
                }
            }
        } else if (msg.type === "next_question") {
            this.nextQuestion();
        } else if (msg.type === "show_results") {
            this.clearTimer();
            this.data.state = "result";
            this.startTimer(5);
            this.broadcastState();
        } else if (msg.type === "restart") {
            this.clearTimer();
            this.data.state = "lobby";
            this.data.currentQuestionIndex = 0;
            this.data.questions = [];
            this.data.players.forEach(p => p.score = 0);
            this.broadcastState();
        }
    }

    timer: NodeJS.Timeout | null = null;

    nextQuestion() {
        if (this.data.currentQuestionIndex < this.data.questions.length - 1) {
            this.data.currentQuestionIndex++;
            this.data.state = "question";
            this.data.players.forEach(p => p.hasAnswered = false);
            this.startTimer(30);
        } else {
            this.clearTimer();
            this.data.state = "leaderboard";
        }
        this.broadcastState();
    }

    startTimer(duration: number) {
        this.clearTimer();
        this.data.timeLeft = duration;
        this.timer = setInterval(() => {
            if (this.data.timeLeft > 0) {
                this.data.timeLeft--;
                this.broadcastState();
            } else {
                this.clearTimer();
                if (this.data.state === "question") {
                    this.data.state = "result";
                    this.startTimer(5); // Auto-advance from result after 5s
                    this.broadcastState();
                } else if (this.data.state === "result") {
                    this.nextQuestion();
                }
            }
        }, 1000);
    }

    clearTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    broadcastState() {
        this.room.broadcast(JSON.stringify({ type: "sync", data: this.data }));
    }
}

Server satisfies Party.Worker;
