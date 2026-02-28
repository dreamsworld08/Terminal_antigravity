"use client";

import { useState, useEffect } from "react";
import { Sparkles, BrainCircuit, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";

export default function ForecastPage() {
    const [forecastData, setForecastData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchForecast(false);
    }, []);

    const fetchForecast = async (refresh = false) => {
        if (refresh) setIsRefreshing(true);
        else setIsLoading(true);

        try {
            const res = await fetch(`/api/ims/forecast${refresh ? '?refresh=true' : ''}`);
            const data = await res.json();
            setForecastData(data);
        } catch (err) {
            console.error("Forecast error", err);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <BrainCircuit className="h-16 w-16 text-indigo-500 animate-pulse mb-4" />
                <h3 className="text-xl font-bold text-gray-900">AI is analyzing your inventory...</h3>
                <p className="text-gray-500 mt-2">Processing sales history, seasonal trends, and current stock.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
                        AI Demand Forecast <Sparkles className="h-5 w-5 ml-2 text-amber-500" />
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">30-day automated predictions powered by Gemini 2.0</p>
                </div>
                <button 
                    onClick={() => fetchForecast(true)}
                    disabled={isRefreshing}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-50"
                >
                    {isRefreshing ? <BrainCircuit className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    {isRefreshing ? "Generating..." : "Generate Fresh Forecast"}
                </button>
            </div>

            {/* AI Summary Block */}
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10">
                    <div className="flex items-center mb-4">
                        <BrainCircuit className="h-6 w-6 text-indigo-300 mr-2" />
                        <h2 className="text-lg font-bold">Executive AI Summary</h2>
                    </div>
                    <p className="text-indigo-100 leading-relaxed text-lg mb-6">{forecastData?.summary}</p>
                    
                    <h3 className="text-sm font-semibold text-indigo-200 uppercase tracking-widest mb-3">Recommendations</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {forecastData?.recommendations?.map((rec: string, i: number) => (
                            <li key={i} className="flex items-start bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                                <Info className="h-5 w-5 text-indigo-300 mr-2 shrink-0 mt-0.5" />
                                <span className="text-sm font-medium">{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Forecast Data Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forecastData?.forecasts?.map((item: any, i: number) => (
                    <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col group hover:border-indigo-200 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{item.productName}</h3>
                                <div className="text-xs text-gray-500 font-mono mt-1">{item.sku}</div>
                            </div>
                            <div className={`p-2 rounded-lg ${
                                item.trend === 'up' ? 'bg-green-100 text-green-600' :
                                item.trend === 'down' ? 'bg-amber-100 text-amber-600' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                                {item.trend === 'up' ? <TrendingUp className="h-4 w-4" /> :
                                 item.trend === 'down' ? <TrendingDown className="h-4 w-4" /> :
                                 <Minus className="h-4 w-4" />}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-50 rounded-xl p-3">
                                <div className="text-xs text-gray-500 font-medium mb-1">Predicted 30d Need</div>
                                <div className="text-2xl font-bold text-gray-900">{item.predictedQty}</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                                <div className="text-xs text-gray-500 font-medium mb-1">AI Confidence</div>
                                <div className="text-2xl font-bold text-gray-900">{Math.round(item.confidence * 100)}%</div>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-100">
                            <div className="text-xs font-semibold text-gray-500 uppercase mb-2">AI Analysis Factors:</div>
                            <p className="text-sm text-gray-600 italic">"{item.factors}"</p>
                            <div className="mt-3 flex gap-2">
                                <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                                    Seasonality: {item.seasonality}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
