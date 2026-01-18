import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import VideoCard from "../components/VideoCard";
import api from "../api/axios";
import { formatTimeAgo } from "../utils/timeAgo";

const SearchChannelCard = ({ user }) => {
  const [isSubscribed, setIsSubscribed] = useState(user.isSubscribed);
  const [subCount, setSubCount] = useState(user.subscriberCount || 0);

  const handleSubscribe = async () => {
    try {
      await api.post(`/subscriptions/c/${user._id}`);
      setIsSubscribed(prev => !prev);
      setSubCount(prev => isSubscribed ? prev - 1 : prev + 1);
    } catch (error) {
      console.error("Failed to toggle subscription", error);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gray-800/40 border border-white/5 rounded-2xl hover:border-blue-500/20 transition-all duration-300 group">
      <Link to={`/channel/${user.username}`} className="flex-shrink-0 relative">
        <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-blue-500 to-purple-500 group-hover:scale-105 transition-transform duration-300">
          <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover border-4 border-gray-900" />
        </div>
      </Link>
      <div className="flex-1 text-center sm:text-left min-w-0">
        <Link to={`/channel/${user.username}`} className="block">
          <h4 className="text-lg font-bold text-white leading-tight group-hover:text-blue-400 transition-colors truncate">{user.fullName}</h4>
        </Link>
        <p className="text-gray-400 text-sm mb-2">@{user.username}</p>
        <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-medium text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="text-white">{subCount}</span>
            <span>Subscribers</span>
          </div>
          <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
          <div className="flex items-center gap-1.5">
            <span className="text-white">{user.videoCount || 0}</span>
            <span>Videos</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <Link
          to={`/channel/${user.username}`}
          className="px-5 py-2 rounded-full text-sm font-bold bg-white text-gray-900 hover:bg-gray-100 transition-colors"
        >
          View Channel
        </Link>
        <button
          className={`px-5 py-2 rounded-full text-sm font-bold border transition-colors ${isSubscribed
            ? "bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            : "bg-blue-600 border-blue-600 text-white hover:bg-blue-500"
            }`}
          onClick={handleSubscribe}
        >
          {isSubscribed ? "Subscribed" : "Subscribe"}
        </button>
      </div>
    </div>
  );
};

const TweetCard = ({ tweet, onDelete, onUpdate }) => {
  const [liked, setLiked] = useState(tweet.isLiked);
  const [likeCount, setLikeCount] = useState(tweet.likesCount || 0);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(tweet.content);


  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [replyContent, setReplyContent] = useState("");
  const [loadingReplies, setLoadingReplies] = useState(false);

  const handleLike = async () => {
    try {
      await api.post(`/likes/toggle/t/${tweet._id}`);
      setLiked(prev => !prev);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (content.trim() !== tweet.content) {
      await onUpdate(tweet._id, content);
    }
    setIsEditing(false);
  };

  const handleToggleReplies = async () => {
    if (!showReplies) {
      setLoadingReplies(true);
      try {
        const res = await api.get(`/comments/t/${tweet._id}`);

        const fetchedReplies = res.data.data.docs || [];
        setReplies(fetchedReplies);
      } catch (err) {
        console.error("Failed to fetch replies", err);
      } finally {
        setLoadingReplies(false);
      }
    }
    setShowReplies(!showReplies);
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    try {
      const res = await api.post(`/comments/t/${tweet._id}`, { content: replyContent });
      const newReply = res.data.data;

      const userStr = localStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : {};

      const optimisticReply = {
        ...newReply,
        owner: currentUser,
        likesCount: 0,
        isLiked: false
      };
      setReplies([optimisticReply, ...replies]);
      setReplyContent("");
    } catch (err) {
      console.error("Failed to add reply", err);
    }
  };

  const isOwner = localStorage.getItem("userId") === tweet.owner?._id;

  return (
    <div className="bg-gray-800/40 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
      <div className="flex gap-4">
        <Link to={`/channel/${tweet.owner?.username}`} className="flex-shrink-0">
          <img src={tweet.owner?.avatar} alt={tweet.owner?.username} className="w-10 h-10 rounded-full object-cover border border-gray-700" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <Link to={`/channel/${tweet.owner?.username}`} className="font-bold text-white hover:underline">
                {tweet.owner?.fullName}
              </Link>
              <span className="text-gray-500 text-sm ml-2">@{tweet.owner?.username}</span>
              <span className="text-gray-600 text-xs ml-2">• {formatTimeAgo(tweet.createdAt)}</span>
            </div>
            {isOwner && (
              <div className="flex items-center gap-2">
                <button onClick={() => setIsEditing(!isEditing)} className="text-gray-500 hover:text-blue-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
                <button onClick={() => onDelete(tweet._id)} className="text-gray-500 hover:text-red-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                rows="3"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-sm text-gray-400 hover:text-white">Cancel</button>
                <button onClick={handleSave} className="px-3 py-1 text-sm bg-blue-600 rounded-full text-white font-bold hover:bg-blue-500">Save</button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-gray-200 whitespace-pre-wrap">{content}</p>
          )}


          <div className="flex items-center gap-6 mt-4 text-gray-500 text-sm">
            <button onClick={handleLike} className={`flex items-center gap-2 group ${liked ? 'text-pink-500' : 'hover:text-pink-500'}`}>
              <svg className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
              <span>{likeCount}</span>
            </button>
            <button onClick={handleToggleReplies} className="flex items-center gap-2 hover:text-blue-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              <span>{loadingReplies ? "Loading..." : (showReplies ? "Hide Replies" : "Reply")}</span>
            </button>
          </div>
        </div>
      </div>


      {showReplies && (
        <div className="mt-6 pt-4 border-t border-gray-700 ml-14">

          <form onSubmit={handleAddReply} className="flex gap-3 mb-6">
            <input
              type="text"
              placeholder="Tweet your reply"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="flex-1 bg-gray-900 border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 rounded-full text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50"
              disabled={!replyContent.trim()}
            >
              Reply
            </button>
          </form>


          <div className="space-y-4">
            {replies.map(reply => (
              <div key={reply._id} className="flex gap-3">
                <Link to={`/channel/${reply.owner?.username}`}>
                  <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                    {reply.owner?.avatar ? (
                      <img src={reply.owner.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold">{reply.owner?.username?.[0] || "?"}</div>
                    )}
                  </div>
                </Link>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link to={`/channel/${reply.owner?.username}`} className="font-bold text-sm text-white hover:underline">{reply.owner?.fullName || reply.owner?.username}</Link>
                    <span className="text-gray-500 text-xs">@{reply.owner?.username}</span>
                    <span className="text-gray-600 text-xs">• {formatTimeAgo(reply.createdAt)}</span>
                  </div>
                  <p className="text-gray-300 text-sm mt-0.5">{reply.content}</p>
                </div>
              </div>
            ))}
            {replies.length === 0 && !loadingReplies && (
              <p className="text-gray-500 text-sm text-center italic">No replies yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CreateTweet = ({ onTweetCreated }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/tweets", { content });
      onTweetCreated(res.data.data);
      setContent("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-gray-800/40 border border-white/5 rounded-2xl p-4">
      <textarea
        placeholder="What's happening?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full bg-transparent text-white text-lg placeholder-gray-500 focus:outline-none resize-none mb-4"
        rows="2"
      />
      <div className="flex justify-between items-center border-t border-white/10 pt-3">
        <div className="text-blue-500">

        </div>
        <button
          type="submit"
          disabled={!content.trim() || loading}
          className="px-6 py-2 bg-blue-600 rounded-full font-bold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Posting..." : "Tweet"}
        </button>
      </div>
    </form>
  );
};

const Home = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query");
  const isAllVideos = location.pathname === "/videos";

  const [videos, setVideos] = useState([]);
  const [foundUsers, setFoundUsers] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [activeTab, setActiveTab] = useState("videos");
  const [totalUsers, setTotalUsers] = useState("10k+");

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const videoSectionRef = useRef(null);

  const fetchTotalUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/stats/total-users");
      if (res.data?.data?.count) {
        setTotalUsers(`${res.data.data.count}+`);
      }
    } catch (err) {
      console.error("Failed to fetch total users", err);
    }
  };

  const handleStartWatching = () => {
    setActiveTab("videos");
    setTimeout(() => {
      videoSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const fetchData = async (pageNum = 1) => {
    try {
      if (pageNum === 1) setLoading(true);


      const res = await api.get(`/videos?page=${pageNum}&limit=12&query=${query || ""}`);
      const newVideos = res.data.data.docs || [];


      if (pageNum === 1 && query) {
        const userRes = await api.get(`/users/search?query=${query}`);
        setFoundUsers(userRes.data.data || []);
      }

      setVideos(prev => pageNum === 1 ? newVideos : [...prev, ...newVideos]);
      setHasMore(res.data.data.hasNextPage);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTweets = async () => {
    try {
      const res = await api.get("/tweets");
      setTweets(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch tweets:", err);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchData(1);
    fetchTotalUsers();
    if (activeTab === 'community') fetchTweets();
  }, [location.search, location.pathname, activeTab]);

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => {
        const nextPage = prev + 1;
        fetchData(nextPage);
        return nextPage;
      });
    }
  };

  const handleTweetCreated = (newTweet) => {
    fetchTweets();
  };

  const handleDeleteTweet = async (tweetId) => {
    try {
      await api.delete(`/tweets/${tweetId}`);
      setTweets(prev => prev.filter(t => t._id !== tweetId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTweet = async (tweetId, content) => {
    try {
      await api.patch(`/tweets/${tweetId}`, { content });
      setTweets(prev => prev.map(t => t._id === tweetId ? { ...t, content } : t));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-purple-500 selection:text-white overflow-x-hidden">
      <AppNavbar />


      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-gray-950">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-blue-900/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] bg-pink-900/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 brightness-100 contrast-150"></div>
      </div>

      <div className="relative z-10">

        {!query && !isAllVideos && (
          <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 px-6 overflow-hidden">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row items-center gap-16">


                <div className="flex-1 text-center lg:text-left z-10 space-y-8">
                  <div className="inline-block px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-md mb-4">
                    <span className="text-purple-300 text-sm font-semibold tracking-wide uppercase">The Future of Streaming</span>
                  </div>

                  <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1]">
                    <span className="block text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">Share Your</span>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400/90 via-purple-500/90 to-pink-500/90 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                      Digital Legacy
                    </span>
                  </h1>

                  <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                    Join the next generation of creators on <span className="text-gray-200 font-semibold">ClipprX</span>.
                    Experience distinctively mesmerizing content with our decentralized video ecosystem.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5 pt-4">
                    <button onClick={handleStartWatching} className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                      <span className="relative z-10 flex items-center gap-2">
                        Start Watching
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </span>
                    </button>
                    <Link to="/upload" className="px-8 py-4 rounded-full font-bold text-lg text-white border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/40 transition-all duration-300 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      Upload Video
                    </Link>
                  </div>


                  <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-gray-500 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-gray-900"></div>
                        <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-gray-900"></div>
                        <div className="w-8 h-8 rounded-full bg-pink-500 border-2 border-gray-900"></div>
                      </div>
                      <span>{totalUsers} Creators</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      <span>Live Now</span>
                    </div>
                  </div>
                </div>


                <div className="lg:w-1/2 relative perspective-1000 group">

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-900/20 via-purple-900/20 to-pink-900/20 rounded-full blur-[60px] group-hover:blur-[80px] transition-all duration-700 pointer-events-none"></div>

                  {/* The 3D Card */}
                  <div className="relative transform lg:rotate-y-[-12deg] lg:rotate-x-[5deg] group-hover:rotate-y-0 group-hover:rotate-x-0 transition-transform duration-700 ease-out preserve-3d">


                    <div className="relative bg-black/60 backdrop-blur-3xl border border-white/5 rounded-3xl p-4 shadow-2xl">

                      <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                        </div>
                        <div className="h-2 w-20 bg-white/10 rounded-full"></div>
                      </div>


                      <div className="relative aspect-video rounded-xl overflow-hidden bg-black/50 border border-white/5 group-hover:border-purple-500/30 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10"></div>


                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>


                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                          <div className="space-y-2">
                            <div className="h-3 w-32 bg-white/20 rounded"></div>
                            <div className="h-2 w-20 bg-white/10 rounded"></div>
                          </div>
                        </div>
                      </div>


                      <div className="absolute -top-6 -right-6 bg-gray-800/80 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-xl animate-float-slow">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🔥</span>
                          <div>
                            <p className="text-xs text-gray-400">Trending</p>
                            <p className="text-sm font-bold text-white">#1 Viral</p>
                          </div>
                        </div>
                      </div>


                      <div className="absolute -bottom-8 -left-8 bg-gray-800/80 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-xl animate-float-delayed flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-orange-500 p-[2px]">
                          <div className="w-full h-full rounded-full bg-gray-900"></div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">New Upload</p>
                          <p className="text-sm font-bold text-white">Cyber_City</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}


        <section ref={videoSectionRef} className={`px-6 ${query || isAllVideos ? 'pt-32 pb-20' : 'pb-20'}`}>
          <div className="max-w-7xl mx-auto">


            {!query && !isAllVideos && (
              <div className="flex gap-8 mb-8 border-b border-gray-800">
                <button
                  onClick={() => setActiveTab("videos")}
                  className={`pb-4 text-xl font-bold transition-all border-b-2 ${activeTab === 'videos' ? 'text-white border-purple-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                >
                  Videos
                </button>
                <button
                  onClick={() => setActiveTab("community")}
                  className={`pb-4 text-xl font-bold transition-all border-b-2 ${activeTab === 'community' ? 'text-white border-blue-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                >
                  Community
                </button>
              </div>
            )}

            {query && (
              <div className="flex flex-col items-center text-center space-y-2 mb-12">
                <h2 className="text-2xl font-bold text-white">Search Results for "{query}"</h2>
                <p className="text-sm text-gray-400 max-w-lg mx-auto">Found videos and profiles matching your search</p>
              </div>
            )}


            {query && foundUsers.length > 0 && (
              <div className="mb-12 max-w-2xl mx-auto">
                <h3 className="text-lg font-bold text-white text-center mb-6">Channels</h3>
                <div className="space-y-3">
                  {foundUsers.map(user => (
                    <SearchChannelCard key={user._id} user={user} />
                  ))}
                </div>
              </div>
            )}


            {activeTab === 'videos' || query ? (
              <>
                {loading && page === 1 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : videos.length > 0 ? (
                  <div className={query ? "max-w-3xl mx-auto" : ""}>
                    {query && <h3 className="text-lg font-bold text-white mb-6 text-center">Videos</h3>}
                    <div className={query ? "flex flex-col gap-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"}>
                      {videos.map((video) => (
                        <VideoCard
                          key={video._id}
                          videoId={video._id}
                          thumbnail={video.thumbnail}
                          title={video.title}
                          channelName={video.owner?.fullName || video.owner?.username || "Unknown"}
                          ownerUsername={video.owner?.username}
                          ownerAvatar={video.owner?.avatar}
                          views={video.views}
                          likes={video.likesCount || 0}
                          uploadedAt={formatTimeAgo(video.createdAt)}
                          duration={video.duration ? `${Math.floor(video.duration / 60)}:${Math.floor(video.duration % 60).toString().padStart(2, '0')}` : "00:00"}
                          type={query ? "horizontal" : "vertical"}
                        />
                      ))}
                    </div>
                    {hasMore && (
                      <div className="mt-12 text-center">
                        <button onClick={handleLoadMore} className="px-8 py-3 bg-gray-800 text-white rounded-full font-bold">Load More</button>
                      </div>
                    )}
                  </div>
                ) : (
                  !loading && <div className="text-center py-20 text-gray-500">No videos found.</div>
                )}
              </>
            ) : (

              <div className="max-w-2xl mx-auto">
                <CreateTweet onTweetCreated={handleTweetCreated} />
                <div className="space-y-4">
                  {tweets.map(tweet => (
                    <TweetCard
                      key={tweet._id}
                      tweet={tweet}
                      onDelete={handleDeleteTweet}
                      onUpdate={handleUpdateTweet}
                    />
                  ))}
                  {tweets.length === 0 && (
                    <div className="text-center py-10 text-gray-500">No tweets yet. Be the first to say something!</div>
                  )}
                </div>
              </div>
            )}

          </div>
        </section>




        <section className="py-20 px-6 bg-black/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4 py-2">Why ClipprX?</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Experience the next generation of video sharing with features built for creators and viewers alike.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Upload & Share", icon: "🚀", desc: "Lightning fast creation tools." },
                { title: "Engage", icon: "💬", desc: "Like, comment, and build your tribe." },
                { title: "Profiles", icon: "👤", desc: "Showcase your portfolio in style." },
                { title: "Secure Stream", icon: "🔒", desc: "Encrypted, high-quality playback." }
              ].map((feature, idx) => (
                <div key={idx} className="p-8 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/10 transition-all duration-300 text-center group">
                  <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="py-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} ClipprX. All rights reserved.
        </footer>


      </div>
    </div>
  );
};

export default Home;
