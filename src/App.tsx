import { ClerkProvider } from "@clerk/clerk-react";
import { Route, Switch } from "wouter";
import Landing from "./pages/Landing";
import GameContainer from "./pages/Game";
import GameLibrary from "./pages/Host";
import ProtectedLayout from "./layouts/ProtectedLayout";
import { getGame } from "./games/registry";

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
    throw new Error("Missing Publishable Key");
}

function GameHost({ params }: { params: { gameId: string } }) {
    const game = getGame(params.gameId);
    if (!game) return <div className="text-white flex justify-center items-center h-screen">Game not found</div>;
    const Component = game.HostComponent;
    return <Component />;
}

function GameEditor({ params }: { params: { gameId: string } }) {
    const game = getGame(params.gameId);
    if (!game) return <div className="text-white flex justify-center items-center h-screen">Game not found</div>;
    const Component = game.EditorComponent;
    return <Component />;
}

function App() {
    return (
        <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <Switch>
                <Route path="/" component={Landing} />
                <Route path="/game" component={GameContainer} />

                {/* Protected Routes */}
                <Route path="/host" nest>
                    <ProtectedLayout>
                        <Switch>
                            <Route path="/" component={GameLibrary} />
                            <Route path="/:gameId" component={GameHost} />
                        </Switch>
                    </ProtectedLayout>
                </Route>

                <Route path="/editor" nest>
                    <ProtectedLayout>
                        <Switch>
                            {/* Editor Library? For now redirect to host or show same library */}
                            <Route path="/" component={GameLibrary} />
                            <Route path="/:gameId" component={GameEditor} />
                        </Switch>
                    </ProtectedLayout>
                </Route>

                {/* Fallback 404 */}
                <Route>
                    <div className="flex items-center justify-center h-screen bg-bg text-text">
                        404: No such page!
                    </div>
                </Route>
            </Switch>
        </ClerkProvider>
    );
}

export default App;