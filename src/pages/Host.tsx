import { Link } from "wouter";
import { UserButton } from "@clerk/clerk-react";
import { GAMES } from "../games/registry";

export default function GameLibrary() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-bg text-text p-8 relative">
            <div className="absolute top-4 left-4 flex items-center gap-4">
                <Link href="~/">
                    <button className="px-4 py-2 bg-surface rounded hover:bg-surface-hover transition font-bold">
                        ← Home
                    </button>
                </Link>
                <UserButton />
            </div>

            <h1 className="text-6xl font-bold mb-12">Game Library</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {GAMES.map((game) => (
                    <div key={game.id} className="bg-surface p-8 rounded-xl shadow-lg hover:bg-surface-hover transition border border-surface-hover">
                        <h2 className="text-3xl font-bold mb-4">{game.name}</h2>
                        <p className="text-text-muted mb-8">{game.description}</p>
                        <div className="flex gap-4">
                            <Link href={`~/host/${game.id}`}>
                                <button className="px-6 py-3 bg-primary rounded-lg font-bold hover:bg-primary-hover transition">
                                    Host
                                </button>
                            </Link>
                            <Link href={`~/editor/${game.id}`}>
                                <button className="px-6 py-3 bg-surface-hover rounded-lg font-bold hover:bg-surface transition border border-surface-hover">
                                    Edit
                                </button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
