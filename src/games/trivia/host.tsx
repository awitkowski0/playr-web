import { useState } from "react";
import { Link } from "wouter";
import usePartySocket from "partysocket/react";
import { motion, AnimatePresence } from "motion/react";
import { UserButton } from "@clerk/clerk-react";
import type { GameData, ServerMessage, Question } from "../../types";
import clsx from "clsx";

const PARTYKIT_HOST = "localhost:1999";

const MOCK_QUESTIONS: Question[] = [
    {
        id: "q1",
        text: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: 2,
    },
    {
        id: "q2",
        text: "Which planet is known as the Red Planet?",
        options: ["Mars", "Venus", "Jupiter", "Saturn"],
        correctAnswer: 0,
    },
    {
        id: "q3",
        text: "What is the largest mammal?",
        options: ["Elephant", "Blue Whale", "Giraffe", "Hippo"],
        correctAnswer: 1,
    },
];

export default function Host() {
    const [gameData, setGameData] = useState<GameData | null>(null);

    const socket = usePartySocket({
        host: PARTYKIT_HOST,
        room: "my-room",
        party: "trivia",
        onMessage(event) {
            const message = JSON.parse(event.data) as ServerMessage;
            if (message.type === "sync") {
                setGameData(message.data);
            }
        },
    });

    const handleStartGame = () => {
        socket.send(JSON.stringify({ type: "start_game", questions: MOCK_QUESTIONS }));
    };

    const handleNextQuestion = () => {
        socket.send(JSON.stringify({ type: "next_question" }));
    };

    const handleShowResults = () => {
        socket.send(JSON.stringify({ type: "show_results" }));
    };

    if (!gameData) return <div className="text-white flex justify-center items-center h-screen">Connecting...</div>;

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-bg text-text p-8 overflow-hidden relative">
            <div className="absolute top-4 left-4 flex items-center gap-4">
                <Link href="/host">
                    <button className="px-4 py-2 bg-surface rounded hover:bg-surface-hover transition font-bold text-sm">
                        Quit Game
                    </button>
                </Link>
                <UserButton />
            </div>
            <AnimatePresence mode="wait">
                {gameData.state === "lobby" && (
                    <motion.div
                        key="lobby"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="text-center w-full max-w-4xl"
                    >
                        <h1 className="text-6xl font-bold mb-8">Join at <span className="text-accent">playr.trivia</span></h1>
                        <div className="bg-white text-black px-8 py-4 rounded-full text-4xl font-mono mb-12 inline-block">
                            Room: my-room
                        </div>

                        <div className="flex flex-wrap gap-4 justify-center mb-12">
                            {gameData.players.map((player) => (
                                <motion.div
                                    key={player.id}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="bg-surface px-6 py-3 rounded-xl font-bold text-xl animate-bounce"
                                >
                                    {player.name}
                                </motion.div>
                            ))}
                            {gameData.players.length === 0 && <p className="text-text-muted text-xl">Waiting for players...</p>}
                        </div>

                        <button
                            onClick={handleStartGame}
                            disabled={gameData.players.length === 0}
                            className="px-8 py-4 bg-primary rounded-xl text-2xl font-bold hover:bg-primary-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Start Game
                        </button>
                    </motion.div>
                )}

                {gameData.state === "question" && (
                    <motion.div
                        key="question"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="w-full max-w-6xl"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div className="text-2xl text-text-muted">Question {gameData.currentQuestionIndex + 1} / {gameData.questions.length}</div>
                            <div className="text-4xl font-bold text-accent">{gameData.timeLeft}s</div>
                        </div>

                        <h2 className="text-5xl font-bold mb-12 text-center leading-tight">
                            {gameData.questions[gameData.currentQuestionIndex].text}
                        </h2>

                        <div className="grid grid-cols-2 gap-6">
                            {gameData.questions[gameData.currentQuestionIndex].options.map((option, idx) => (
                                <div
                                    key={idx}
                                    className={clsx(
                                        "p-8 rounded-2xl text-3xl font-bold flex items-center shadow-lg",
                                        idx === 0 && "bg-error",
                                        idx === 1 && "bg-info",
                                        idx === 2 && "bg-warning",
                                        idx === 3 && "bg-success"
                                    )}
                                >
                                    <span className="mr-4 opacity-50">{["▲", "◆", "●", "■"][idx]}</span>
                                    {option}
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={handleShowResults}
                                className="px-8 py-3 bg-surface-hover rounded-lg font-bold hover:bg-surface"
                            >
                                Show Results
                            </button>
                        </div>
                    </motion.div>
                )}

                {gameData.state === "result" && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full max-w-6xl text-center"
                    >
                        <h2 className="text-5xl font-bold mb-8">Correct Answer</h2>
                        <div className="text-4xl mb-12 text-success font-bold">
                            {gameData.questions[gameData.currentQuestionIndex].options[gameData.questions[gameData.currentQuestionIndex].correctAnswer]}
                        </div>

                        <button
                            onClick={handleNextQuestion}
                            className="px-8 py-4 bg-primary rounded-xl text-2xl font-bold hover:bg-primary-hover transition"
                        >
                            Next Question
                        </button>
                    </motion.div>
                )}

                {gameData.state === "leaderboard" && (
                    <motion.div
                        key="leaderboard"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-4xl text-center"
                    >
                        <h1 className="text-6xl font-bold mb-12">Final Scores</h1>
                        <div className="space-y-4">
                            {gameData.players
                                .sort((a, b) => b.score - a.score)
                                .map((player, idx) => (
                                    <motion.div
                                        key={player.id}
                                        initial={{ x: -50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={clsx(
                                            "flex justify-between items-center p-6 rounded-xl text-2xl font-bold",
                                            idx === 0 ? "bg-warning text-black scale-110" : "bg-surface"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="opacity-50">#{idx + 1}</span>
                                            <span>{player.name}</span>
                                        </div>
                                        <span>{player.score}</span>
                                    </motion.div>
                                ))}
                        </div>

                        <button
                            onClick={() => socket.send(JSON.stringify({ type: "restart" }))}
                            className="mt-12 px-8 py-3 bg-surface-hover rounded-lg font-bold hover:bg-surface"
                        >
                            Play Again
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
