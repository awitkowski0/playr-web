import { Link, useLocation } from "wouter";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { useState } from "react";
import clsx from "clsx";

export default function Landing() {
    const [name, setName] = useState("");
    const [gameId, setGameId] = useState("");
    const [, setLocation] = useLocation();

    // Load nickname from local storage
    useState(() => {
        const savedName = localStorage.getItem("playr_nickname");
        if (savedName) {
            setName(savedName);
        }
    });

    const handleJoin = () => {
        if (name && gameId) {
            localStorage.setItem("playr_nickname", name);
            setLocation(`/game?room=${gameId}&name=${encodeURIComponent(name)}`);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-bg text-text relative">
            <div className="absolute top-4 left-4">
                <SignedIn>
                    <UserButton />
                </SignedIn>
                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="px-4 py-2 bg-surface rounded hover:bg-surface-hover transition">
                            Sign In
                        </button>
                    </SignInButton>
                </SignedOut>
            </div>

            <h1 className="text-6xl font-bold mb-8 text-text">
                Playr Trivia
            </h1>

            <div className="flex flex-col gap-4 w-full max-w-xs mb-8">
                <input
                    type="text"
                    placeholder="Enter Name"
                    className="px-4 py-3 rounded bg-surface border border-surface-hover focus:border-primary focus:outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Game ID"
                    className="px-4 py-3 rounded bg-surface border border-surface-hover focus:border-primary focus:outline-none"
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value)}
                />
            </div>

            <div className="flex gap-4">
                <button
                    onClick={handleJoin}
                    disabled={!name || !gameId}
                    className={clsx(
                        "px-6 py-3 rounded-lg font-bold transition",
                        name && gameId
                            ? "bg-primary hover:bg-primary-hover text-text"
                            : "bg-surface text-text-muted cursor-not-allowed"
                    )}
                >
                    Join Game
                </button>

                <Link href="/host">
                    <button
                        disabled={!!gameId}
                        className={clsx(
                            "px-6 py-3 rounded-lg font-bold transition",
                            !gameId
                                ? "bg-surface-hover hover:bg-surface text-text"
                                : "bg-surface text-text-muted cursor-not-allowed"
                        )}
                    >
                        Host Game
                    </button>
                </Link>
            </div>
        </div>
    );
}
