import React from "react";

export interface Game {
    id: string;
    name: string;
    description: string;
    HostComponent: React.ComponentType;
    ClientComponent: React.ComponentType;
    EditorComponent: React.ComponentType;
}

import TriviaHost from "./trivia/host";
import TriviaClient from "./trivia/client";
import TriviaEditor from "./trivia/editor";

export const GAMES: Game[] = [
    {
        id: "trivia",
        name: "Trivia",
        description: "A Kahoot-like trivia game.",
        HostComponent: TriviaHost,
        ClientComponent: TriviaClient,
        EditorComponent: TriviaEditor,
    },
];

export const getGame = (id: string) => GAMES.find((g) => g.id === id);
