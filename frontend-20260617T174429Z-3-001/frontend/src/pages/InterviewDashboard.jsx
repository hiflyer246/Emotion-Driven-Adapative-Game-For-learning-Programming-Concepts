import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewApi } from '../services/interviewApi';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Mic, Calendar, Clock, ArrowRight, Play, FileText, ArrowLeft } from 'lucide-react';

export const InterviewDashboard = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await interviewApi.getHistory();
            setHistory(data);
        } catch (error) {
            console.error("Failed to load history:", error);
        } finally {
            setLoading(false);
        }
    };

    const startNewInterview = () => {
        navigate('/interview');
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/')}
                            className="mb-4 text-gray-400 hover:text-white"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Button>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Mic className="w-8 h-8 text-blue-500" />
                            Interview Dashboard
                        </h1>
                        <p className="text-gray-400 mt-2">
                            Track your progress and practice technical interviews.
                        </p>
                    </div>
                    <Button
                        onClick={startNewInterview}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition-transform"
                    >
                        <Play className="w-5 h-5 mr-2" />
                        Start New Interview
                    </Button>
                </div>

                {/* content */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Stats / Start Card */}
                    <div className="lg:col-span-3">
                        <Card className="bg-gray-800 border border-gray-700 p-6">
                            <h2 className="text-xl font-semibold mb-4">Your Recent Sessions</h2>

                            {loading ? (
                                <p className="text-center text-gray-500 py-8">Loading history...</p>
                            ) : history.length === 0 ? (
                                <div className="text-center py-10 space-y-4">
                                    <div className="p-4 bg-gray-700/50 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                                        <FileText className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-400">No interview sessions found.</p>
                                    <Button variant="outline" onClick={startNewInterview}>Start your first one!</Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {history.map((session) => (
                                        <div
                                            key={session.session_id}
                                            className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors border border-gray-700 hover:border-blue-500/30 cursor-pointer"
                                            onClick={() => navigate(`/report/${session.session_id}`)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-blue-500/10 rounded-lg">
                                                    <Calendar className="w-6 h-6 text-blue-400" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-lg">{session.topic}</h3>
                                                    <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                                                        <span className="capitalize px-2 py-0.5 bg-gray-700 rounded text-xs">{session.difficulty}</span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(session.start_time).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-sm font-medium text-gray-300">{session.turns_count} Questions</p>
                                                    <p className="text-xs text-green-400">Completed</p>
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-gray-500" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};
