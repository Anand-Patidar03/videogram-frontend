import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import EmptyState from '../components/EmptyState';
import api from '../api/axios';
import { formatTimeAgo } from '../utils/timeAgo';

const PlaylistDetail = () => {
    const { playlistId } = useParams();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);


    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    const fetchPlaylist = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/playlists/${playlistId}`);
            setPlaylist(res.data.data);
            setEditName(res.data.data.name);
            setEditDesc(res.data.data.description);
        } catch (err) {
            console.error("Failed to fetch playlist", err);
            setError("Failed to load playlist.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (playlistId) {
            fetchPlaylist();
        }
    }, [playlistId]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const res = await api.patch(`/playlists/${playlistId}`, {
                name: editName,
                description: editDesc
            });
            setPlaylist(res.data.data);

            setPlaylist(prev => ({ ...prev, name: editName, description: editDesc }));
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to update playlist", err);
        }
    };

    const handleDeletePlaylist = async () => {
        if (!window.confirm("Are you sure you want to delete this playlist?")) return;
        try {
            await api.delete(`/playlists/${playlistId}`);
            navigate(`/channel/${currentUser.username}`);
        } catch (err) {
            console.error("Failed to delete playlist", err);
        }
    };

    const removeVideo = async (videoId) => {
        try {
            await api.patch(`/playlists/remove/${videoId}/${playlistId}`);
            setPlaylist(prev => ({
                ...prev,
                videos: prev.videos.filter(v => v._id !== videoId)
            }));
        } catch (err) {
            console.error("Failed to remove video", err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error || !playlist) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
                <h2 className="text-2xl font-bold mb-4">Playlist not found</h2>
                <p className="text-gray-400">{error || "The requested playlist does not exist."}</p>
                <Link to="/" className="mt-4 px-6 py-2 bg-purple-600 rounded-full font-bold">Go Home</Link>
            </div>
        );
    }

    const isOwner = currentUser?._id === playlist.owner?._id;

    return (
        <div className="min-h-screen bg-gray-900 pt-24 px-4 md:px-8 pb-20 text-white font-sans selection:bg-purple-500 selection:text-white">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">


                <div className="lg:col-span-1">
                    <div className="sticky top-24">

                        <div className="relative group mx-auto max-w-sm lg:mx-0">
                            <div className="absolute top-0 -inset-x-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl h-[98%] blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                            <div className="relative aspect-video bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                                {playlist.videos && playlist.videos.length > 0 && playlist.videos[0].thumbnail ? (
                                    <div className="w-full h-full">
                                        <img
                                            src={playlist.videos[0].thumbnail}
                                            alt={playlist.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-900 to-gray-900 flex items-center justify-center">
                                        <span className="text-6xl">🎵</span>
                                    </div>
                                )}
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="text-sm font-bold bg-white/10 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 inline-flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                                        {playlist.videos?.length || 0} Videos
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            {!isEditing ? (
                                <>
                                    <h1 className="text-3xl font-bold text-white leading-tight break-words">{playlist.name}</h1>

                                    <div className="flex items-center gap-3 justify-between">
                                        <Link to={`/channel/${playlist.owner?.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[2px]">
                                                {playlist.owner?.avatar ? (
                                                    <img src={playlist.owner.avatar} alt={playlist.owner.username} className="w-full h-full rounded-full object-cover border border-gray-900" />
                                                ) : (
                                                    <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center font-bold text-xs">{playlist.owner?.username?.charAt(0) || "?"}</div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{playlist.owner?.fullName || playlist.owner?.username}</p>
                                                <p className="text-xs text-gray-400">Updated {formatTimeAgo(playlist.updatedAt)}</p>
                                            </div>
                                        </Link>
                                    </div>

                                    {playlist.description && (
                                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{playlist.description}</p>
                                    )}


                                    {isOwner && (
                                        <div className="flex gap-2 pt-2">
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                                                title="Edit Playlist"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                            </button>
                                            <button
                                                onClick={handleDeletePlaylist}
                                                className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-800 transition-all"
                                                title="Delete Playlist"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <form onSubmit={handleSave} className="space-y-4 bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                                    <h2 className="text-xl font-bold mb-4">Edit Details</h2>
                                    <div>
                                        <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Description</label>
                                        <textarea
                                            value={editDesc}
                                            onChange={(e) => setEditDesc(e.target.value)}
                                            rows="4"
                                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-purple-600 rounded-lg text-sm font-bold hover:bg-purple-500 transition-colors"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>


                <div className="lg:col-span-2 space-y-4">
                    {playlist.videos && playlist.videos.length > 0 ? (
                        playlist.videos.map((video, idx) => (
                            <div key={video._id} className="group flex flex-col sm:flex-row gap-4 bg-gray-800/20 hover:bg-gray-800/60 p-3 rounded-xl transition-colors border border-transparent hover:border-white/5">

                                <div className="hidden sm:flex w-8 items-center justify-center text-gray-500 text-sm font-mono">
                                    {idx + 1}
                                </div>


                                <Link to={`/videos/${video._id}`} className="relative w-full sm:w-40 aspect-video flex-shrink-0 bg-gray-900 rounded-lg overflow-hidden">
                                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                    <span className="absolute bottom-1 right-1 bg-black/80 px-1 rounded text-[10px] font-bold font-mono text-white">
                                        {video.duration ? `${Math.floor(video.duration / 60)}:${Math.floor(video.duration % 60).toString().padStart(2, '0')}` : "00:00"}
                                    </span>
                                </Link>


                                <div className="flex-1 flex flex-col justify-center min-w-0">
                                    <Link to={`/videos/${video._id}`} className="block">
                                        <h3 className="text-white font-bold leading-tight truncate pr-8 cursor-pointer group-hover:text-purple-400 transition-colors">
                                            {video.title}
                                        </h3>
                                    </Link>

                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                        <span>{video.views} views</span>
                                        <span>•</span>
                                        <span>{formatTimeAgo(video.createdAt)}</span>
                                    </div>
                                </div>


                                {isOwner && (
                                    <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => removeVideo(video._id)}
                                            className="p-2 text-gray-500 hover:text-red-400 transition-colors" title="Remove from playlist"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <EmptyState
                            title="Playlist is Empty"
                            description="Add videos to this playlist to see them here."
                            actionText="Browse Videos"
                            onAction={() => navigate("/")}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlaylistDetail;
