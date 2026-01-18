import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import api from '../api/axios';
import { formatTimeAgo } from '../utils/timeAgo';

const PlaylistList = () => {
    const navigate = useNavigate();
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [newPlaylistDesc, setNewPlaylistDesc] = useState("");

    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

    const fetchPlaylists = async () => {
        if (!currentUser?._id) return;
        try {
            setLoading(true);
            const res = await api.get(`/playlists/user/${currentUser._id}`);
            setPlaylists(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch playlists", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!currentUser?._id) {
            navigate("/login");
            return;
        }
        fetchPlaylists();
    }, []);

    const handleCreatePlaylist = async (e) => {
        e.preventDefault();
        try {
            await api.post("/playlists", {
                name: newPlaylistName,
                description: newPlaylistDesc
            });
            setIsCreateModalOpen(false);
            setNewPlaylistName("");
            setNewPlaylistDesc("");
            fetchPlaylists();
        } catch (err) {
            console.error("Failed to create playlist", err);
        }
    };

    const handleDelete = async (e, id) => {
        e.preventDefault();
        if (!window.confirm("Are you sure you want to delete this playlist?")) return;
        try {
            await api.delete(`/playlists/${id}`);
            setPlaylists(playlists.filter(p => p._id !== id));
        } catch (err) {
            console.error("Failed to delete playlist", err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 pt-24 px-4 md:px-8 pb-12 font-sans text-white">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Your Playlists</h1>
                        <p className="text-gray-400">Organize your favorite videos and collections.</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold hover:shadow-lg hover:shadow-purple-500/20 transition-all transform hover:scale-105"
                    >
                        + New Playlist
                    </button>
                </div>

                {playlists.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {playlists.map((playlist) => (
                            <div key={playlist._id} className="group bg-gray-800/40 rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

                                <Link to={`/playlist/${playlist._id}`} className="block relative aspect-video bg-gray-900 overflow-hidden">
                                    {playlist.videos && playlist.videos.length > 0 && playlist.videos[0].thumbnail ? (
                                        <img
                                            src={playlist.videos[0].thumbnail}
                                            alt={playlist.name}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                            <span className="text-4xl">🎵</span>
                                        </div>
                                    )}


                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
                                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-xs font-medium text-white">
                                            <span>{playlist.videos?.length || 0} Videos</span>

                                        </div>
                                    </div>


                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white fill-current translate-x-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                        </div>
                                    </div>
                                </Link>


                                <div className="p-4">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-bold text-white text-lg leading-tight line-clamp-1 group-hover:text-purple-400 transition-colors">
                                            <Link to={`/playlist/${playlist._id}`}>{playlist.name}</Link>
                                        </h3>

                                    </div>
                                    <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                                        <span>Updated {formatTimeAgo(playlist.updatedAt)}</span>
                                        <button
                                            onClick={(e) => handleDelete(e, playlist._id)}
                                            className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="No Playlists Yet"
                        description="Create your first playlist to start organizing videos."
                        actionText="Create Playlist"
                        onAction={() => setIsCreateModalOpen(true)}
                    />
                )}
            </div>


            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
                        <button
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        <h2 className="text-2xl font-bold mb-1">Create Playlist</h2>
                        <p className="text-gray-400 text-sm mb-6">Give your collection a name and description.</p>

                        <form onSubmit={handleCreatePlaylist} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newPlaylistName}
                                    onChange={(e) => setNewPlaylistName(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    placeholder="e.g. Chill Vibes"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-1">Description (Optional)</label>
                                <textarea
                                    value={newPlaylistDesc}
                                    onChange={(e) => setNewPlaylistDesc(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors h-24 resize-none"
                                    placeholder="What's this playlist about?"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-lg font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-purple-600 rounded-lg font-bold text-white hover:bg-purple-700 transition shadow-lg shadow-purple-500/20"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlaylistList;
