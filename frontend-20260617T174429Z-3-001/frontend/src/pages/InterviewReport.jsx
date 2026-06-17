import React, { useEffect, useState } from "react";
import { interviewApi } from "../services/interviewApi";
import { useParams } from "react-router-dom";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const InterviewReport = () => {
    // If not using react-router params, might need to extract from URL manually or props
    // Assuming standard router usage: /report/:sessionId
    const { sessionId } = useParams();
    const [report, setReport] = useState(null);

    useEffect(() => {
        if (sessionId) {
            interviewApi.getReport(sessionId).then(setReport).catch(console.error);
        }
    }, [sessionId]);

    if (!report) return <div className="text-white p-10">Loading Report...</div>;

    // Prepare Chart Data
    // Filter log to get timestamps and confidence of dominant emotion
    // or just plot "Nervousness" over time if we had a specific score.
    // Let's plot "Confidence" of the detected emotion for simplicity.
    const labels = report.emotion_log.map(entry => new Date(entry.timestamp).toLocaleTimeString());
    const dataPoints = report.emotion_log.map(entry => entry.confidence);
    const emotionLabels = report.emotion_log.map(entry => entry.emotion);

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Emotion Confidence',
                data: dataPoints,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.3
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Emotion Confidence Over Time' },
            tooltip: {
                callbacks: {
                    afterLabel: function (context) {
                        return `Emotion: ${emotionLabels[context.dataIndex]}`;
                    }
                }
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Interview Performance Report</h1>
                <button
                    onClick={() => window.location.href = '/interviews'}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                    Back to Dashboard
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Chart Section */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Emotional Timeline</h2>
                    <Line data={chartData} options={options} />
                </div>

                {/* Summary Section */}
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4">Session Summary</h2>
                    <div className="space-y-2">
                        <p><span className="text-gray-400">Topic:</span> {report.topic}</p>
                        <p><span className="text-gray-400">Total Questions:</span> {report.total_turns}</p>
                        <p><span className="text-gray-400">Duration:</span> {report.emotion_log.length * 3} seconds (approx)</p>
                    </div>
                </div>
            </div>

            {/* Q&A Log */}
            <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Transcript & Analysis</h2>
                <div className="space-y-6">
                    {report.history.map((turn, i) => (
                        <div key={i} className="border-b border-gray-700 pb-4 last:border-0">
                            <p className="font-medium text-blue-400">Q: {turn.question.question_text}</p>
                            <p className="mt-1 text-gray-300">A: {turn.answer_text}</p>

                            {turn.analysis && (
                                <div className="mt-2 bg-gray-700/50 p-3 rounded text-sm">
                                    <p className="text-yellow-400">Feedback: {turn.analysis.feedback}</p>
                                    <p className="text-gray-400 mt-1">Rating: {turn.analysis.rating}/10</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InterviewReport;
