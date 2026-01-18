import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import api from '../api/axios';
import { formatTimeAgo } from '../utils/timeAgo';
import EditProfile from '../components/EditProfile';

const Profile = () => {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [videos, setVideos] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscribing, setSubscribing] = useState(false);


    const [activeTab, setActiveTab] = useState("videos");
    const [likedVideos, setLikedVideos] = useState([]);
    const [watchHistory, setWatchHistory] = useState([]);


    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);


    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [newPlaylistDesc, setNewPlaylistDesc] = useState("");
    const [creatingPlaylist, setCreatingPlaylist] = useState(false);


    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const isOwner = profile && currentUser?._id === profile?._id;

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                setError(null);


                const profileRes = await api.post(`/users/channel/${username}`);
                const profileData = profileRes.data.data;
                setProfile(profileData);
                setIsSubscribed(profileData.isSubscribed);


                if (profileData._id) {
                    const videosRes = await api.get(`/videos?userId=${profileData._id}`);
                    setVideos(videosRes.data.data.docs || []);
                    fetchPlaylists(profileData._id);


                    if (activeTab === 'liked' || activeTab === 'history') setActiveTab('videos');
                }
            } catch (err) {
                console.error("Failed to fetch profile:", err);
                setError("Failed to load profile. User might not exist.");
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchProfileData();
        }
    }, [username, refreshTrigger]);

    useEffect(() => {
        if (activeTab === 'liked' && isOwner) {
            fetchLikedVideos();
        } else if (activeTab === 'history' && isOwner) {
            fetchWatchHistory();
        }
    }, [activeTab, isOwner]);

    const fetchLikedVideos = async () => {
        try {
            const res = await api.get("/likes/videos");
            setLikedVideos(res.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchWatchHistory = async () => {
        try {
            const res = await api.post("/users/watch-history");
            setWatchHistory(res.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPlaylists = async (userId) => {
        try {
            const res = await api.get(`/playlists/user/${userId}`);
            setPlaylists(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch playlists", err);
        }
    };

    const handleSubscribe = async () => {
        if (!profile?._id || subscribing) return;

        try {
            setSubscribing(true);
            await api.post(`/subscriptions/c/${profile._id}`);
            setIsSubscribed(!isSubscribed);


            setProfile(prev => ({
                ...prev,
                subscriberCount: isSubscribed ? prev.subscriberCount - 1 : prev.subscriberCount + 1
            }));
        } catch (err) {
            console.error("Failed to toggle subscription:", err);
        } finally {
            setSubscribing(false);
        }
    };

    const handleCreatePlaylist = async (e) => {
        e.preventDefault();
        if (!newPlaylistName.trim() || !newPlaylistDesc.trim()) return;

        try {
            setCreatingPlaylist(true);
            const res = await api.post("/playlists", {
                name: newPlaylistName,
                description: newPlaylistDesc
            });
            setPlaylists([res.data.data, ...playlists]);
            setIsCreateModalOpen(false);
            setNewPlaylistName("");
            setNewPlaylistDesc("");
        } catch (err) {
            console.error("Failed to create playlist", err);
        } finally {
            setCreatingPlaylist(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
                <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
                <p className="text-gray-400">{error || "The requested user does not exist."}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-purple-500 selection:text-white pb-20">


            <div className="relative">

                <div className="h-48 md:h-72 w-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90 z-10"></div>
                    <img
                        src={profile.coverImage || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&h=400&fit=crop"}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                </div>


                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-20">
                    <div className="flex flex-col md:flex-row items-center md:items-end md:justify-between gap-6">


                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                            <div className="relative group cursor-pointer" onClick={() => setIsAvatarModalOpen(true)}>
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500">
                                    <img
                                        src={profile.avatar}
                                        alt={profile.username}
                                        className="w-full h-full rounded-full border-4 border-gray-900 object-cover bg-gray-800"
                                    />
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-2">
                                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{profile.fullName}</h1>
                                <p className="text-gray-400 text-sm font-medium">@{profile.username}</p>
                            </div>
                        </div>


                        <div className="flex items-center gap-3 mb-4">
                            {isOwner ? (
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="px-6 py-2.5 rounded-full font-bold text-sm bg-gray-800 border border-gray-700 text-white hover:bg-gray-700 transition-all duration-300"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubscribe}
                                    disabled={subscribing}
                                    className={`px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${isSubscribed
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:shadow-red-500/30'
                                        }`}
                                >
                                    {subscribing ? 'Processing...' : (isSubscribed ? 'Subscribed' : 'Subscribe')}
                                </button>
                            )}
                        </div>
                    </div>


                    <div className="hidden md:flex items-center gap-12 mt-8 py-6 border-y border-gray-800">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-white">{videos.length}</span>
                            <span className="text-sm text-gray-400 uppercase tracking-wider font-medium">Videos</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-white">{profile.subscriberCount}</span>
                            <span className="text-sm text-gray-400 uppercase tracking-wider font-medium">Subscribers</span>
                        </div>
                    </div>
                </div>
            </div>


            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="flex items-center gap-8 border-b border-gray-800 mb-8">
                    <button
                        onClick={() => setActiveTab("videos")}
                        className={`pb-4 text-lg font-bold transition-all border-b-2 ${activeTab === 'videos' ? 'text-white border-purple-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                    >
                        Videos
                    </button>
                    <button
                        onClick={() => setActiveTab("playlists")}
                        className={`pb-4 text-lg font-bold transition-all border-b-2 ${activeTab === 'playlists' ? 'text-white border-blue-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                    >
                        Playlists
                    </button>
                    {isOwner && (
                        <>
                            <button
                                onClick={() => setActiveTab("liked")}
                                className={`pb-4 text-lg font-bold transition-all border-b-2 ${activeTab === 'liked' ? 'text-white border-pink-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                            >
                                Liked Videos
                            </button>
                            <button
                                onClick={() => setActiveTab("history")}
                                className={`pb-4 text-lg font-bold transition-all border-b-2 ${activeTab === 'history' ? 'text-white border-green-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                            >
                                Watch History
                            </button>
                        </>
                    )}
                </div>


                {activeTab === 'videos' && (
                    <>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <span className="w-1 h-8 bg-purple-500 rounded-full display-block"></span>
                                Uploaded Videos
                            </h2>
                        </div>

                        {videos.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {videos.map((video) => (
                                    <VideoCard
                                        key={video._id}
                                        videoId={video._id}
                                        thumbnail={video.thumbnail}
                                        title={video.title}
                                        channelName={profile.fullName}
                                        ownerUsername={profile.username}
                                        ownerAvatar={profile.avatar}
                                        views={video.views}
                                        likes={video.likesCount || 0}
                                        uploadedAt={formatTimeAgo(video.createdAt)}
                                        duration={video.duration ? `${Math.floor(video.duration / 60)}:${Math.floor(video.duration % 60).toString().padStart(2, '0')}` : "00:00"}
                                        isLive={false}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-gray-800/30 rounded-3xl border border-gray-800 border-dashed">
                                <h3 className="text-xl font-medium text-white">No videos yet</h3>
                                <p className="text-gray-400 mt-2">This user hasn't uploaded any content.</p>
                            </div>
                        )}
                    </>
                )}


                {activeTab === 'playlists' && (
                    <>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <span className="w-1 h-8 bg-blue-500 rounded-full display-block"></span>
                                Playlists
                            </h2>
                            {isOwner && (
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-sm transition-colors"
                                >
                                    + Create User Playlist
                                </button>
                            )}
                        </div>

                        {playlists.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {playlists.map((playlist) => (
                                    <a key={playlist._id} href={`/playlist/${playlist._id}`} className="group bg-gray-800/40 rounded-2xl overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl block">

                                        <div className="relative aspect-video bg-gray-900 overflow-hidden">
                                            {playlist.videos && playlist.videos.length > 0 && playlist.videos[0].thumbnail ? (
                                                <img
                                                    src={playlist.videos[0].thumbnail}
                                                    alt={playlist.name}
                                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-4xl">
                                                    🎵
                                                </div>
                                            )}


                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
                                                <div className="absolute bottom-3 right-3 bg-black/60 px-2 py-0.5 rounded text-xs font-bold text-white">
                                                    {playlist.videos?.length || 0} Videos
                                                </div>
                                            </div>

                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-white fill-current translate-x-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <h3 className="font-bold text-white text-lg leading-tight line-clamp-1 group-hover:text-blue-400 transition-colors">
                                                {playlist.name}
                                            </h3>
                                            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{playlist.description}</p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-gray-800/30 rounded-3xl border border-gray-800 border-dashed">
                                <h3 className="text-xl font-medium text-white">No playlists yet</h3>
                                <p className="text-gray-400 mt-2">There are no public playlists to show.</p>
                            </div>
                        )}
                    </>
                )}


                {activeTab === 'liked' && isOwner && (
                    <>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <span className="w-1 h-8 bg-pink-500 rounded-full display-block"></span>
                                Liked Videos
                            </h2>
                        </div>
                        {likedVideos.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {likedVideos.map((item) => (
                                    item.video ? (
                                        <VideoCard
                                            key={item._id}
                                            videoId={item.video._id}
                                            thumbnail={item.video.thumbnail}
                                            title={item.video.title}
                                            channelName={item.video.owner?.fullName || "Unknown"}
                                            ownerUsername={item.video.owner?.username}
                                            ownerAvatar={item.video.owner?.avatar}
                                            views={item.video.views}
                                            likes={item.video.likesCount || 0}
                                            uploadedAt={formatTimeAgo(item.video.createdAt)}
                                            duration={item.video.duration ? `${Math.floor(item.video.duration / 60)}:${Math.floor(item.video.duration % 60).toString().padStart(2, '0')}` : "00:00"}
                                            isLive={false}
                                        />
                                    ) : null
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-500">No liked videos found.</div>
                        )}
                    </>
                )}


                {activeTab === 'history' && isOwner && (
                    <>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <span className="w-1 h-8 bg-green-500 rounded-full display-block"></span>
                                Watch History
                            </h2>
                        </div>
                        {watchHistory.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {watchHistory.map((video) => (
                                    <VideoCard
                                        key={video._id}
                                        videoId={video._id}
                                        thumbnail={video.thumbnail}
                                        title={video.title}
                                        channelName={video.owner?.fullName || "Unknown"}
                                        ownerUsername={video.owner?.username}
                                        ownerAvatar={video.owner?.avatar}
                                        views={video.views}
                                        likes={video.likesCount || 0}
                                        uploadedAt={formatTimeAgo(video.createdAt)}
                                        duration={video.duration ? `${Math.floor(video.duration / 60)}:${Math.floor(video.duration % 60).toString().padStart(2, '0')}` : "00:00"}
                                        isLive={false}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-500">No watch history found.</div>
                        )}
                    </>
                )}
            </div>


            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold mb-4 text-white">Create New Playlist</h2>
                        <form onSubmit={handleCreatePlaylist} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newPlaylistName}
                                    onChange={(e) => setNewPlaylistName(e.target.value)}
                                    placeholder="e.g., My Favorite Songs"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-1">Description</label>
                                <textarea
                                    value={newPlaylistDesc}
                                    onChange={(e) => setNewPlaylistDesc(e.target.value)}
                                    placeholder="What's this playlist about?"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 h-24 resize-none"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-lg font-bold text-gray-300 hover:text-white hover:bg-gray-800 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creatingPlaylist}
                                    className="px-6 py-2 bg-blue-600 rounded-lg font-bold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
                                >
                                    {creatingPlaylist ? "Creating..." : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {isEditModalOpen && (
                <EditProfile
                    user={profile}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={() => setRefreshTrigger(prev => prev + 1)}
                />
            )}


            {isAvatarModalOpen && profile && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 cursor-zoom-out" onClick={() => setIsAvatarModalOpen(false)}>
                    <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
                        <img
                            src={profile.avatar}
                            alt={profile.username}
                            className="max-w-full max-h-full object-contain rounded-full shadow-2xl border-4 border-gray-800"
                        />
                        <button
                            className="absolute top-4 right-4 text-white hover:text-gray-300"
                            onClick={() => setIsAvatarModalOpen(false)}
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Profile;
