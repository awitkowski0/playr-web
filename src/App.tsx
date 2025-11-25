import { Suspense, lazy } from "react";
import { Route, Switch } from "wouter";

const HomePage = lazy(() => import("./pages/Home"));
const HostConsole = lazy(() => import("./pages/HostConsole"));
const MobileController = lazy(() => import("./pages/MobileController"));

export default function App() {
    return (
        <Suspense fallback={<div className="text-white p-10">Loading Playr...</div>}>

            <Switch>
                {/* Landing Page */}
                <Route path="/" component={HomePage} />

                {/* The Host (TV Screen, Main User) */}
                <Route path="/host" component={HostConsole} />

                {/* The Controller (Phone) - Loads the UI library */}
                {/* Captures "playr.gg/join/ABCD" */}
                <Route path="/join/:code">
                    {(params) => <MobileController roomCode={params.code} />}
                </Route>

                {/* 404 Catch-all */}
                <Route>
                    <div className="text-black text-center mt-20">Page Not Found</div>
                </Route>
            </Switch>

        </Suspense>
    );
}