import { useSearch } from "wouter";
import { getGame } from "../games/registry";

export default function GameContainer() {
    const search = useSearch();
    const params = new URLSearchParams(search);
    // For now, we assume 'trivia' if no game type is specified, or we could pass it in URL
    // Ideally, the room ID should encode the game type, or we query the server.
    // For this refactor, let's default to trivia or allow a 'type' param.
    const gameId = params.get("type") || "trivia";

    const game = getGame(gameId);

    if (!game) {
        return <div className="text-white flex justify-center items-center h-screen">Game not found</div>;
    }

    const ClientComponent = game.ClientComponent;

    return <ClientComponent />;
}
