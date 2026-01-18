import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

const TweetFeed = () => {
    const [tweetContent, setTweetContent] = useState('');
    const [tweets, setTweets] = useState([
        {
            id: 1,
            author: "CyberCreator_99",
            avatar: "C",
            content: "Just finished rendering the new intro sequence! It's going to be insane. 🚀 #3D #MotionDesign",
            likes: 124,
            replies: 12,
            time: "2 hours ago",
            isLiked: false
        },
        {
            id: 2,
            author: "TechReviewer",
            avatar: "T",
            content: "What do you guys think about the new AI tools? Are they helpful or just hype? Let's discuss below.",
            likes: 89,
            replies: 45,
            time: "5 hours ago",
            isLiked: true
        },
        {
            id: 3,
            author: "GamingPro",
            avatar: "G",
            content: "Live stream starting in 30 mins! We are playing the new Cyberpunk DLC. Don't miss it!",
            likes: 456,
            replies: 23,
            time: "1 day ago",
            isLiked: false
        }
    ]);

    const handlePost = (e) => {
        e.preventDefault();
        if (!tweetContent.trim()) return;

        const newTweet = {
            id: Date.now(),
            author: "You",
            avatar: "Y",
            content: tweetContent,
            likes: 0,
            replies: 0,
            time: "Just now",
            isLiked: false
        };

        setTweets([newTweet, ...tweets]);
        setTweetContent('');
    };

    const toggleLike = (id) => {
        setTweets(tweets.map(t => {
            if (t.id === id) {
                return {
                    ...t,
                    isLiked: !t.isLiked,
                    likes: t.isLiked ? t.likes - 1 : t.likes + 1
                };
            }
            return t;
        }));
    };

    return (
        <div className="min-h-screen bg-gray-900 pt-24 px-4 pb-20">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Community</h1>
                    <p className="text-gray-400">Join the conversation with creators and fans.</p>
                </div>


                <div className="bg-gray-800/40 border border-white/5 rounded-2xl p-4 mb-8 backdrop-blur-sm">
                    <form onSubmit={handlePost}>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[2px] flex-shrink-0">
                                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center font-bold text-xs text-white">Y</div>
                            </div>
                            <div className="flex-1">
                                <textarea
                                    value={tweetContent}
                                    onChange={(e) => setTweetContent(e.target.value)}
                                    placeholder="What's on your mind?"
                                    className="w-full bg-transparent text-white placeholder-gray-500 text-lg resize-none focus:outline-none min-h-[100px]"
                                ></textarea>
                                <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-3">
                                    <div className="flex gap-2 text-purple-400">
                                        <button type="button" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        </button>
                                        <button type="button" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        </button>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!tweetContent.trim()}
                                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full font-bold text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                                    >
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>


                <div className="space-y-4">
                    {tweets.map((tweet) => (
                        <div key={tweet.id} className="bg-gray-800/20 border border-white/5 rounded-2xl p-6 hover:bg-gray-800/40 transition-colors">
                            <div className="flex gap-4">
                                <Link to={`/c/${tweet.author}`} className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[2px]">
                                        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center font-bold text-sm text-white">{tweet.avatar}</div>
                                    </div>
                                </Link>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Link to={`/c/${tweet.author}`} className="font-bold text-white hover:underline decoration-purple-500">{tweet.author}</Link>
                                            <span className="text-gray-500 text-sm ml-2">@{tweet.author.toLowerCase()} • {tweet.time}</span>
                                        </div>
                                        <button className="text-gray-500 hover:text-white">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                                        </button>
                                    </div>

                                    <p className="text-gray-200 mt-2 mb-4 whitespace-pre-wrap leading-relaxed">
                                        {tweet.content}
                                    </p>

                                    <div className="flex items-center gap-6 text-gray-500 text-sm font-medium">
                                        <button
                                            onClick={() => toggleLike(tweet.id)}
                                            className={`flex items-center gap-2 group transition-colors ${tweet.isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}
                                        >
                                            <div className="p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
                                                <svg className={`w-5 h-5 ${tweet.isLiked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                                            </div>
                                            {tweet.likes}
                                        </button>

                                        <button className="flex items-center gap-2 group hover:text-blue-400 transition-colors">
                                            <div className="p-2 rounded-full group-hover:bg-blue-400/10 transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                            </div>
                                            {tweet.replies}
                                        </button>

                                        <button className="flex items-center gap-2 group hover:text-green-400 transition-colors">
                                            <div className="p-2 rounded-full group-hover:bg-green-400/10 transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TweetFeed;
