import { useState, useEffect } from "react";
import usePartySocket from "partysocket/react";
import { motion, AnimatePresence } from "motion/react";
import type { GameData, ServerMessage } from "../../types";
import clsx from "clsx";
import { useSearch, Link } from "wouter";

const PARTYKIT_HOST = "localhost:1999"; // Default local dev port

export default function Game() {
    const search = useSearch();
    const params = new URLSearchParams(search);
    const room = params.get("room") || "my-room";
    const initialName = params.get("name") || "";

    const [name, setName] = useState(initialName);
    const [joined, setJoined] = useState(false);
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

    const socket = usePartySocket({
        host: PARTYKIT_HOST,
        room: room,
        party: "trivia",
        onMessage(event) {
            const message = JSON.parse(event.data) as ServerMessage;
            if (message.type === "sync") {
                setGameData(message.data);
            }
        },
    });

    const handleJoin = () => {
        if (name.trim()) {
            socket.send(JSON.stringify({ type: "join", name }));
            setJoined(true);
        }
    };

    // Auto-join if name is provided in URL
    useEffect(() => {
        if (initialName && !joined && socket.readyState === WebSocket.OPEN) {
            handleJoin();
        }
    }, [initialName, joined, socket.readyState]);

    const handleAnswer = (index: number) => {
        if (gameData?.state === "question" && selectedAnswer === null) {
            setSelectedAnswer(index);
            socket.send(JSON.stringify({ type: "answer", questionIndex: gameData.currentQuestionIndex, answerIndex: index }));
        }
    };

    // Reset selectedAnswer when index changes
    const currentQIndex = gameData?.currentQuestionIndex;
    useEffect(() => {
        setSelectedAnswer(null);
    }, [currentQIndex]);


    if (!gameData) return <div className="text-white flex justify-center items-center h-screen">Connecting...</div>;

    if (!joined) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-bg text-text p-4">
                <h1 className="text-4xl font-bold mb-8">Join Game</h1>
                <input
                    type="text"
                    placeholder="Enter your nickname"
                    className="px-4 py-2 rounded text-black mb-4 w-full max-w-xs"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button
                    onClick={handleJoin}
                    className="px-6 py-3 bg-primary rounded-lg font-bold hover:bg-primary-hover transition w-full max-w-xs"
                >
                    Join
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-bg text-text p-4 overflow-hidden relative">
            <div className="absolute top-4 left-4">
                <Link href="/">
                    <button className="px-4 py-2 bg-surface rounded hover:bg-surface-hover transition font-bold text-sm">
                        Leave Game
                    </button>
                </Link>
            </div>
            <AnimatePresence mode="wait">
                {gameData.state === "lobby" && (
                    <motion.div
                        key="lobby"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center"
                    >
                        <h2 className="text-3xl font-bold mb-4">You're in!</h2>
                        <p className="text-xl">See your name on screen?</p>
                        <div className="mt-8 text-accent animate-pulse">Waiting for host to start...</div>
                    </motion.div>
                )}

                {gameData.state === "question" && (
                    <motion.div
                        key="question"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full max-w-md"
                    >
                        {/* Player usually just sees shapes/colors, but we'll show text for now or just buttons */}
                        <div className="grid grid-cols-2 gap-4 h-64">
                            {["red", "blue", "yellow", "green"].map((color, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(idx)}
                                    disabled={selectedAnswer !== null}
                                    className={clsx(
                                        "rounded-xl transition-all transform active:scale-95 flex items-center justify-center text-2xl font-bold shadow-lg",
                                        color === "red" && "bg-error",
                                        color === "blue" && "bg-info",
                                        color === "yellow" && "bg-warning",
                                        color === "green" && "bg-success",
                                        selectedAnswer !== null && selectedAnswer !== idx && "opacity-30 grayscale",
                                        selectedAnswer === idx && "ring-4 ring-white scale-105"
                                    )}
                                >
                                    {/* Icon or Shape could go here */}
                                    {["▲", "◆", "●", "■"][idx]}
                                </button>
                            ))}
                        </div>
                        {selectedAnswer !== null && <p className="text-center mt-4 font-bold">Answer Sent!</p>}
                    </motion.div>
                )}

                {(gameData.state === "result" || gameData.state === "leaderboard") && (
                    <motion.div
                        key="result"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center"
                    >
                        {/* We don't know if we were correct locally easily without more logic, 
                    but we can show score or just "Look at the screen" */}
                        <h2 className="text-3xl font-bold mb-4">Time's Up!</h2>
                        <p>Check the host screen for results.</p>
                        <div className="mt-8 p-4 bg-surface rounded-lg">
                            <span className="text-text-muted">Your Score</span>
                            <div className="text-4xl font-bold text-accent">
                                {gameData.players.find(p => p.id === socket.id)?.score || 0}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
