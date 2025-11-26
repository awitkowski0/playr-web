import { useState } from "react";
// import { motion } from "motion/react"; 
import type { Question } from "../../types";
import clsx from "clsx";

export default function Editor() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
        text: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
    });

    const handleAddQuestion = () => {
        if (currentQuestion.text && currentQuestion.options?.every((o) => o)) {
            setQuestions([
                ...questions,
                {
                    id: Math.random().toString(36).substr(2, 9),
                    text: currentQuestion.text,
                    options: currentQuestion.options as string[],
                    correctAnswer: currentQuestion.correctAnswer || 0,
                },
            ]);
            setCurrentQuestion({
                text: "",
                options: ["", "", "", ""],
                correctAnswer: 0,
            });
        }
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...(currentQuestion.options || [])];
        newOptions[index] = value;
        setCurrentQuestion({ ...currentQuestion, options: newOptions });
    };

    return (
        <div className="flex h-screen bg-bg text-text overflow-hidden">
            {/* Sidebar - Question List */}
            <div className="w-64 bg-surface border-r border-surface-hover p-4 flex flex-col overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Questions</h2>
                <div className="space-y-2">
                    {questions.map((q, idx) => (
                        <div key={q.id} className="p-3 bg-neutral-700 rounded hover:bg-neutral-600 cursor-pointer">
                            <div className="font-bold text-sm mb-1">Question {idx + 1}</div>
                            <div className="text-xs truncate text-gray-400">{q.text}</div>
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => { }} // Just clears selection effectively
                    className="mt-4 w-full py-2 bg-primary rounded font-bold hover:bg-primary-hover"
                >
                    Add Question
                </button>
            </div>

            {/* Main Area - Editor */}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Create Quiz</h1>

                    <div className="bg-surface p-6 rounded-xl shadow-lg mb-8">
                        <label className="block text-text-muted mb-2">Question Text</label>
                        <input
                            type="text"
                            className="w-full bg-bg border border-surface-hover rounded p-3 text-lg mb-6 focus:border-primary focus:outline-none"
                            placeholder="Start typing your question"
                            value={currentQuestion.text}
                            onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                        />

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {[0, 1, 2, 3].map((idx) => (
                                <div key={idx} className="relative">
                                    <div className={clsx(
                                        "absolute left-3 top-3 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold",
                                        idx === 0 && "bg-red-500",
                                        idx === 1 && "bg-blue-500",
                                        idx === 2 && "bg-yellow-500",
                                        idx === 3 && "bg-green-500"
                                    )}>
                                        {["▲", "◆", "●", "■"][idx]}
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-bg rounded text-lg border border-surface-hover focus:border-primary focus:outline-none"
                                        placeholder={`Option ${idx + 1}`}
                                        value={currentQuestion.options?.[idx] || ""}
                                        onChange={(e) => updateOption(idx, e.target.value)}
                                    />
                                    <button
                                        onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: idx })}
                                        className={clsx(
                                            "absolute right-3 top-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                            currentQuestion.correctAnswer === idx ? "bg-success border-success" : "bg-surface border-surface-hover"
                                        )}
                                    >
                                        {currentQuestion.correctAnswer === idx && "✓"}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleAddQuestion}
                            className="w-full py-3 bg-primary rounded-lg font-bold text-lg hover:bg-primary-hover transition"
                        >
                            Add to Quiz
                        </button>
                    </div>

                    {/* JSON Output for now */}
                    {questions.length > 0 && (
                        <div className="bg-surface p-6 rounded-xl">
                            <h3 className="text-xl font-bold mb-4">Quiz JSON</h3>
                            <pre className="bg-bg p-4 rounded text-sm text-text-muted overflow-auto">
                                {JSON.stringify(questions, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}