import React, { useState, useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import { interviewApi } from "../services/interviewApi";
// import debounce from "lodash/debounce"; // Optional if we want to throttle

const InterviewMode = () => {
    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [emotion, setEmotion] = useState("neutral");
    const [loading, setLoading] = useState(false);
    const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [lastSpokenTime, setLastSpokenTime] = useState(Date.now());
    const [resumeFile, setResumeFile] = useState(null);
    const [hasIntervened, setHasIntervened] = useState(false);

    const webcamRef = useRef(null);
    const recognitionRef = useRef(null);

    // --- 1. Start Interview ---
    const handleStart = async () => {
        setLoading(true);
        try {
            let data;
            if (resumeFile) {
                const formData = new FormData();
                formData.append("resume", resumeFile);
                formData.append("topic", "Python Basics"); // Could make this dynamic later
                formData.append("difficulty", "medium");
                data = await interviewApi.startInterviewWithResume(formData);
            } else {
                data = await interviewApi.startInterview("user_123", "Python Basics", "medium");
            }

            setSession(data);
            addMessage("bot", data.question.question_text);
            playAudio(data.audio);
        } catch (error) {
            console.error("Failed to start:", error);
            alert("Failed to start interview. Please try again.");
        }
        setLoading(false);
    };

    // --- 2. Audio playback ---
    const playAudio = (audioBase64) => {
        if (!audioBase64) return;
        const audio = new Audio(`data:audio/wav;base64,${audioBase64}`);
        setIsAvatarSpeaking(true);
        audio.play();
        audio.onended = () => setIsAvatarSpeaking(false);
    };

    // --- 3. Message Helper ---
    const addMessage = (sender, text) => {
        setMessages((prev) => [...prev, { sender, text }]);
    };

    // --- 4. Frame Processing (Emotion) ---
    useEffect(() => {
        if (!session) return;

        const interval = setInterval(async () => {
            if (webcamRef.current) {
                const imageSrc = webcamRef.current.getScreenshot();
                if (imageSrc) {
                    try {
                        const res = await interviewApi.processFrame(session.session_id, imageSrc);
                        setEmotion(res.emotion);
                    } catch (e) {
                        console.error("Frame process error", e);
                    }
                }
            }
        }, 3000); // Every 3s

        return () => clearInterval(interval);
    }, [session]);

    // --- 5. Speech Recognition (Browser API) ---
    useEffect(() => {
        if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                let currentTranscript = "";
                for (let i = 0; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setTranscript(currentTranscript);
                setLastSpokenTime(Date.now());
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                // Don't stop automatically on error, just log
            };
        } else {
            console.error("Browser does not support Speech Recognition");
            alert("Your browser does not support Speech Recognition. Please use Chrome.");
        }
    }, []);

    // --- 6. Real-time Encouragement Logic ---
    useEffect(() => {
        if (!isRecording || hasIntervened) return;

        const checkIntervention = setInterval(async () => {
            const timeSinceLastSpoken = Date.now() - lastSpokenTime;

            // If silent for 8 seconds OR (silent for 5s AND negative emotion)
            const isStuck = timeSinceLastSpoken > 8000 ||
                (timeSinceLastSpoken > 5000 && ['fear', 'nervous', 'confused', 'sad'].includes(emotion));

            if (isStuck) {
                setHasIntervened(true);
                clearInterval(checkIntervention);

                // Play encouragement
                const phrases = [
                    "Take your time, there's no rush.",
                    "It's okay to think for a moment.",
                    "You're doing fine, just gather your thoughts.",
                    "Don't worry, just focus on the logic."
                ];
                const phrase = phrases[Math.floor(Math.random() * phrases.length)];

                try {
                    const data = await interviewApi.getAudio(phrase);
                    playAudio(data.audio);
                    // Toast or bubble
                    addMessage("bot", `(Whisper) ${phrase}`);
                } catch (e) {
                    console.error("TTS error", e);
                }
            }
        }, 1000);

        return () => clearInterval(checkIntervention);
    }, [isRecording, lastSpokenTime, emotion, hasIntervened]);

    const startRecording = () => {
        if (recognitionRef.current) {
            setTranscript("");
            setLastSpokenTime(Date.now());
            setHasIntervened(false);
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
            handleSubmitAnswer(transcript);
        }
    };

    const handleSubmitAnswer = async (userText) => {
        if (!userText.trim()) return;
        setLoading(true);
        try {
            // Optimistic update (show "Thinking...")
            const res = await interviewApi.submitResponse(session.session_id, userText);

            addMessage("user", res.user_transcript);
            if (res.feedback && res.feedback.feedback) {
                // Optional: visualize feedback in UI, not just chat
                console.log("Feedback:", res.feedback);
            }

            addMessage("bot", res.next_question.question_text);
            playAudio(res.audio);

        } catch (error) {
            console.error("Submit error:", error);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
            <header className="mb-4 flex justify-between items-center bg-gray-800 p-4 rounded-lg">
                <h1 className="text-xl font-bold">Emotion-Aware Interview</h1>
                <div className="flex gap-4">
                    <span className={`px-3 py-1 rounded ${emotion === 'nervous' ? 'bg-red-500' : 'bg-green-500'}`}>
                        Detected Emotion: {emotion}
                    </span>
                    {session && (
                        <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded" onClick={() => window.location.href = `/report/${session.session_id}`}>
                            End Interview
                        </button>
                    )}
                </div>
            </header>

            <div className="flex flex-1 gap-4 overflow-hidden">
                {/* Left: Avatar/Webcam Area */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* Avatar Placeholder */}
                    <div className={`flex-1 bg-gray-800 rounded-lg flex items-center justify-center border-2 border-gray-700 transition-all duration-300 ${isAvatarSpeaking ? "border-blue-400 shadow-[0_0_20px_rgba(60,130,246,0.5)]" : ""}`}>
                        <div className="text-center">
                            <div className={`text-6xl mb-4 transition-transform duration-200 ${isAvatarSpeaking ? "scale-110 animate-pulse" : ""}`}>🤖</div>
                            <p className="text-gray-400">{isAvatarSpeaking ? "Speaking..." : "AI Interviewer"}</p>
                        </div>
                    </div>

                    {/* Webcam (User) */}
                    <div className="h-68 bg-black rounded-lg overflow-hidden relative border-2 border-blue-500">
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/jpeg"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs">
                            You
                        </div>
                    </div>
                </div>

                {/* Right: Interaction Area */}
                <div className="flex-1 flex flex-col bg-gray-800 rounded-lg p-4">
                    {/* Chat Log */}
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                        {!session && (
                            <div className="flex flex-col items-center justify-center h-full px-8">
                                <div className="w-full max-w-md space-y-6">
                                    <p className="text-xl font-semibold text-center">Ready to test your skills?</p>

                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-gray-300 text-center">Upload Resume (Optional)</label>
                                        <input
                                            type="file"
                                            accept=".pdf,.txt"
                                            onChange={(e) => setResumeFile(e.target.files[0])}
                                            className="block w-full text-sm text-gray-400
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-blue-600 file:text-white
                                                hover:file:bg-blue-700
                                                cursor-pointer"
                                        />
                                        {resumeFile && <p className="text-xs text-green-400 text-center mt-2">✓ Selected: {resumeFile.name}</p>}
                                    </div>

                                    <div className="flex justify-center pt-2">
                                        <button
                                            onClick={handleStart}
                                            disabled={loading}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-all disabled:opacity-50"
                                        >
                                            {loading ? "Initializing..." : "Start Interview"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[80%] p-3 rounded-lg ${msg.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200"
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isRecording && transcript && (
                            <div className="flex justify-end animate-fade-in">
                                <div className="max-w-[80%] p-4 rounded-lg bg-blue-600/50 border border-blue-400 text-white shadow-lg">
                                    <p className="text-xs text-blue-200 mb-1">Live Transcript...</p>
                                    <p className="italic">{transcript}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    {session && (
                        <div className="h-20 flex items-center justify-center border-t border-gray-700 pt-4">
                            {!isRecording ? (
                                <button
                                    onClick={startRecording}
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
                                >
                                    🎤 Start Answer
                                </button>
                            ) : (
                                <button
                                    onClick={stopRecording}
                                    className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg animate-pulse"
                                >
                                    ⏹ Stop & Submit
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InterviewMode;
