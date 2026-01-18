import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import api from "../api/axios";

const Subscriptions = () => {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalSubscriptions, setTotalSubscriptions] = useState(0);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const userStr = localStorage.getItem("user");
            if (!userStr) return;
            const user = JSON.parse(userStr);

            const res = await api.get(`/subscriptions/u/${user._id}`);
            setChannels(res.data.data.subscribedChannel || []);
            setTotalSubscriptions(res.data.data.totalSubscribedChannel || 0);
        } catch (err) {
            console.error("Failed to fetch subscriptions", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnsubscribe = async (channelId) => {
        if (!window.confirm("Are you sure you want to unsubscribe?")) return;
        try {
            await api.post(`/subscriptions/c/${channelId}`);
            setChannels(prev => prev.filter(item => item.channel?._id !== channelId));
            setTotalSubscriptions(prev => prev - 1);
        } catch (err) {
            console.error("Failed to unsubscribe", err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-purple-500 selection:text-white pb-20">
            <AppNavbar />


            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-900/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-blue-900/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 brightness-100 contrast-150"></div>
            </div>

            <div className="relative z-10 pt-24 px-6 max-w-7xl mx-auto">

                <div className="flex items-end gap-4 mb-12 border-b border-gray-800 pb-6">
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Subscriptions
                    </h1>
                    <span className="text-gray-500 text-lg font-medium mb-1">
                        {totalSubscriptions} channels
                    </span>
                </div>


                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : channels.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {channels.map((item) => (
                            <div
                                key={item._id}
                                className="group relative bg-gray-800/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:bg-gray-800/50 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="flex flex-col items-center text-center">

                                    <Link to={`/channel/${item.channel?.username}`} className="relative mb-4 inline-block">
                                        <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-blue-500 to-purple-500 group-hover:scale-105 transition-transform duration-300 shadow-lg">
                                            <div className="w-full h-full rounded-full bg-gray-900 p-[2px]">
                                                <img
                                                    src={item.channel?.avatar}
                                                    alt={item.channel?.username}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            </div>
                                        </div>
                                    </Link>


                                    <Link to={`/channel/${item.channel?.username}`} className="mb-1">
                                        <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors truncate max-w-[200px]">
                                            {item.channel?.fullName || "Unknown Token"}
                                        </h3>
                                    </Link>
                                    <p className="text-sm text-gray-500 mb-6 font-medium">@{item.channel?.username}</p>


                                    <div className="flex items-center gap-3 w-full">
                                        <Link
                                            to={`/channel/${item.channel?.username}`}
                                            className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition-colors"
                                        >
                                            View Channel
                                        </Link>
                                        <button
                                            onClick={() => handleUnsubscribe(item.channel?._id)}
                                            className="py-2 px-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                            title="Unsubscribe"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">No subscriptions yet</h2>
                        <p className="text-gray-400 mb-6 max-w-md">Like a ghost town here. Discover amazing creators and subscribe to see them here.</p>
                        <Link to="/" className="px-6 py-3 bg-purple-600 rounded-full font-bold text-white hover:bg-purple-700 transition">
                            Explore Channels
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Subscriptions;
