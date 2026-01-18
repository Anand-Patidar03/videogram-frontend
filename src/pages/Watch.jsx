import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import VideoCard from '../components/VideoCard';
import AppNavbar from '../components/AppNavbar';
import api from '../api/axios';
import { formatTimeAgo } from "../utils/timeAgo";

const Watch = () => {
    const { videoId } = useParams();
    const navigate = useNavigate();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const lastIncrementedVideoId = useRef(null);


    const [comments, setComments] = useState([]);
    const [suggestedVideos, setSuggestedVideos] = useState([]);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedContent, setEditedContent] = useState("");


    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                setCurrentUser(JSON.parse(userStr));
            } catch (e) {
                console.error("Failed to parse user from local storage");
            }
        }
    }, []);




    useEffect(() => {
        const fetchVideoDetails = async () => {
            try {
                setLoading(true);
                setError(null);


                const videoRes = await api.get(`/videos/${videoId}`);
                const videoData = videoRes.data.data;
                setVideo(videoData);


                setLikeCount(videoData.likesCount || 0);
                setIsLiked(videoData.isLiked || false);
                setIsSubscribed(videoData.isSubscribed || false);


                try {
                    const commentsRes = await api.get(`/comments/${videoId}`);
                    const val = commentsRes.data?.data;
                    const fetchedComments = Array.isArray(val) ? val : (Array.isArray(val?.docs) ? val.docs : []);
                    setComments(fetchedComments);
                } catch (err) {
                    console.error("Failed to fetch comments", err);
                    setComments([]);
                }


                fetchSuggestions(1);
            } catch (err) {
                console.error("Error fetching video:", err);
                setError("Failed to load video. It may not exist or is private.");
            } finally {
                setLoading(false);
            }
        };

        if (videoId) {
            fetchVideoDetails();
        }
    }, [videoId]);


    useEffect(() => {
        if (videoId && lastIncrementedVideoId.current !== videoId) {
            const incrementView = async () => {
                try {
                    await api.patch(`/videos/${videoId}/view`);
                } catch (err) {
                    console.error("Failed to increment view", err);
                }
            };
            incrementView();
            lastIncrementedVideoId.current = videoId;
        }
    }, [videoId]);


    const [suggestionPage, setSuggestionPage] = useState(1);
    const [hasMoreSuggestions, setHasMoreSuggestions] = useState(true);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);

    const fetchSuggestions = async (pageNum = 1) => {
        try {
            setLoadingSuggestions(true);
            const suggestionsRes = await api.get(`/videos?page=${pageNum}&limit=5`);
            const val = suggestionsRes.data?.data;
            const newVideos = Array.isArray(val) ? val : (Array.isArray(val?.docs) ? val.docs : []);


            const filteredNewVideos = newVideos.filter(v => v._id !== videoId);

            setSuggestedVideos(prev => pageNum === 1 ? filteredNewVideos : [...prev, ...filteredNewVideos]);
            setHasMoreSuggestions(val?.hasNextPage || false);
        } catch (err) {
            console.error("Failed to fetch suggestions", err);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleLoadMoreSuggestions = () => {
        if (hasMoreSuggestions && !loadingSuggestions) {
            setSuggestionPage(prev => {
                const nextPage = prev + 1;
                fetchSuggestions(nextPage);
                return nextPage;
            });
        }
    };


    const handleToggleLike = async () => {
        try {

            setIsLiked((prev) => !prev);
            setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

            await api.post(`/likes/toggle/v/${videoId}`);
        } catch (err) {
            console.error("Failed to toggle like", err);

            setIsLiked((prev) => !prev);
            setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
        }
    };

    const handleSubscribe = async () => {
        if (!video?.owner?._id) return;
        try {

            setIsSubscribed((prev) => !prev);
            await api.post(`/subscriptions/c/${video.owner._id}`);
        } catch (err) {
            console.error("Failed to subscribe", err);
            setIsSubscribed((prev) => !prev);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const res = await api.post(`/comments/${videoId}`, { content: newComment });
            const addedComment = res.data.data;


            if ((!addedComment.owner || typeof addedComment.owner === 'string') && currentUser) {
                addedComment.owner = currentUser;
            }

            setComments((prev) => [addedComment, ...prev]);
            setNewComment("");
        } catch (err) {
            console.error("Failed to add comment", err);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await api.delete(`/comments/c/${commentId}`);
            setComments((prev) => prev.filter(c => c._id !== commentId));
        } catch (err) {
            console.error("Failed to delete comment", err);
        }
    };

    const handleEditClick = (comment) => {
        setEditingCommentId(comment._id);
        setEditedContent(comment.content);
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditedContent("");
    };

    const handleSaveEdit = async (commentId) => {
        if (!editedContent.trim()) return;
        try {
            await api.patch(`/comments/c/${commentId}`, { content: editedContent });
            setComments((prev) => prev.map(c => c._id === commentId ? { ...c, content: editedContent } : c));
            setEditingCommentId(null);
            setEditedContent("");
        } catch (err) {
            console.error("Failed to update comment", err);
        }
    };

    const handleToggleCommentLike = async (commentId) => {
        try {
            await api.post(`/likes/toggle/c/${commentId}`);
            setComments(prevVideos => prevVideos.map(c => {
                if (c._id === commentId) {
                    const wasLiked = c.isLiked;
                    return {
                        ...c,
                        isLiked: !wasLiked,
                        likesCount: wasLiked ? (c.likesCount - 1) : (c.likesCount + 1)
                    };
                }
                return c;
            }));
        } catch (err) {
            console.error("Failed to toggle comment like", err);
        }
    };


    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [updateTitle, setUpdateTitle] = useState("");
    const [updateDescription, setUpdateDescription] = useState("");
    const [updateThumbnail, setUpdateThumbnail] = useState(null);


    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    const shareLinks = [
        { name: "WhatsApp", icon: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg", url: `https://wa.me/?text=${encodeURIComponent(window.location.href)}` },
        { name: "Twitter", icon: "https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg", url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(video?.title)}` },
        { name: "Facebook", icon: "https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}` },
        { name: "LinkedIn", icon: "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png", url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}` },
    ];

    const openEditModal = () => {
        setUpdateTitle(video.title);
        setUpdateDescription(video.description);
        setUpdateThumbnail(null);
        setIsEditModalOpen(true);
    };

    const handleUpdateVideo = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("title", updateTitle);
            formData.append("description", updateDescription);
            if (updateThumbnail) {
                formData.append("thumbnail", updateThumbnail);
            }

            const res = await api.patch(`/videos/${videoId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const updatedVideo = res.data.data;
            setVideo((prev) => ({
                ...prev,
                title: updatedVideo.title,
                description: updatedVideo.description,
                thumbnail: updatedVideo.thumbnail
            }));

            setIsEditModalOpen(false);
        } catch (err) {
            console.error("Failed to update video", err);
            alert("Failed to update video");
        }
    };

    const handleTogglePublish = async () => {
        try {
            const res = await api.patch(`/videos/toggle/publish/${videoId}`);
            const updatedStatus = res.data.data.isPublished;
            setVideo((prev) => ({ ...prev, isPublished: updatedStatus }));
        } catch (err) {
            console.error("Failed to toggle publish status", err);
        }
    };


    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [fetchingPlaylists, setFetchingPlaylists] = useState(false);

    const openSaveModal = async () => {
        if (!currentUser) {
            alert("Please login to save to playlist");
            return;
        }
        setIsSaveModalOpen(true);
        if (userPlaylists.length === 0) {
            fetchUserPlaylists();
        }
    };

    const fetchUserPlaylists = async () => {
        try {
            setFetchingPlaylists(true);
            const res = await api.get(`/playlists/user/${currentUser._id}`);
            setUserPlaylists(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch playlists", err);
        } finally {
            setFetchingPlaylists(false);
        }
    };

    const handleTogglePlaylist = async (playlist) => {
        const isAdded = playlist.videos.some(v => v._id === video._id || v === video._id);
        try {
            if (isAdded) {
                await api.patch(`/playlists/remove/${videoId}/${playlist._id}`);
            } else {
                await api.patch(`/playlists/add/${videoId}/${playlist._id}`);
            }

            fetchUserPlaylists();
        } catch (err) {
            console.error("Failed to update playlist", err);
        }
    };


    const handleCreatePlaylistQuick = async () => {
        const name = prompt("Enter playlist name:");
        if (!name) return;
        try {
            await api.post("/playlists", { name, description: "Created from video page" });
            fetchUserPlaylists();
        } catch (err) {
            console.error("Failed to create playlist", err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error || !video) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
                <h1 className="text-2xl">{error || "Video not found."}</h1>
            </div>
        );
    }

    const isOwner = currentUser && video.owner && currentUser._id === video.owner._id;

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-purple-500 selection:text-white">
            <AppNavbar />
            <div className="pt-20 pb-10 px-4 md:px-8 max-w-[1800px] mx-auto">

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">


                    <div className="lg:col-span-2 space-y-6">


                        <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.6)] border border-gray-800" aria-label="Video Player">
                            <video
                                src={video.videoFile}
                                poster={video.thumbnail}
                                controls
                                className="w-full h-full object-contain"
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>


                        <div>
                            <div className="flex justify-between items-start gap-4">
                                <h1 className="text-xl md:text-2xl font-bold leading-tight flex-1">{video.title}</h1>
                                {isOwner && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={openEditModal}
                                            className="px-3 py-1 text-xs font-bold rounded uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/50 hover:bg-blue-500/30 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={handleTogglePublish}
                                            className={`px-3 py-1 text-xs font-bold rounded uppercase tracking-wider ${video.isPublished ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'}`}
                                        >
                                            {video.isPublished ? "Published" : "Unpublished"}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between mt-4 pb-4 border-b border-gray-800 gap-4">
                                <div className="text-sm text-gray-400">
                                    {video?.views || 0} views • {formatTimeAgo(video?.createdAt)}
                                </div>

                                <div className="flex items-center gap-2 md:gap-4">
                                    <button
                                        onClick={handleToggleLike}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${isLiked ? 'bg-white text-black' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                                    >
                                        <svg className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'fill-none text-white'}`} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                                        {likeCount}
                                    </button>
                                    <button
                                        onClick={openSaveModal}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 text-white font-medium hover:bg-gray-700 transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setIsShareModalOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 text-white font-medium hover:bg-gray-700 transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                                        Share
                                    </button>
                                </div>
                            </div>
                        </div>


                        <div className="bg-gray-800/20 rounded-2xl p-4 md:p-6 backdrop-blur-sm border border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <Link to={`/channel/${video?.owner?.username || "unknown"}`} className="flex items-center gap-4 group">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[2px]">
                                        {video?.owner?.avatar ? (
                                            <img src={video.owner.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-lg font-bold">
                                                {video?.owner?.username?.charAt(0).toUpperCase() || "?"}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors">{video?.owner?.username || "Unknown"}</h3>
                                    </div>
                                </Link>
                                {!isOwner && (
                                    <button
                                        onClick={handleSubscribe}
                                        className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${isSubscribed
                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            : 'bg-white text-black hover:scale-105'
                                            }`}
                                    >
                                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                                    </button>
                                )}
                            </div>

                            <div className="pl-0 md:pl-[64px]">
                                <p className={`text-sm text-gray-300 whitespace-pre-line leading-relaxed ${isDescriptionExpanded ? '' : 'line-clamp-2'}`}>
                                    {video?.description || "No description available."}
                                </p>
                                <button
                                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                    className="mt-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
                                >
                                    {isDescriptionExpanded ? 'Show less' : '...more'}
                                </button>
                            </div>
                        </div>


                        <div className="pt-4">
                            <h3 className="text-xl font-bold mb-6">{comments.length} Comments</h3>


                            <form onSubmit={handleAddComment} className="flex gap-4 mb-8">
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                                    {currentUser?.avatar ? (
                                        <img src={currentUser.avatar} alt="User" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500"></div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="w-full bg-transparent border-b border-gray-700 pb-2 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-500"
                                    />
                                    <div className="flex justify-end mt-2">
                                        <button
                                            type="submit"
                                            disabled={!newComment.trim()}
                                            className="px-4 py-2 bg-purple-600 rounded-full text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition"
                                        >
                                            Comment
                                        </button>
                                    </div>
                                </div>
                            </form>


                            <div className="space-y-6">
                                {comments.map((comment) => (
                                    <div key={comment._id} className="flex gap-4 group">
                                        <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                                            {comment.owner?.avatar ? (
                                                <img src={comment.owner.avatar} alt={comment.owner.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-xs font-bold">
                                                    {comment.owner?.username?.charAt(0).toUpperCase() || "?"}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-sm text-white">{comment.owner?.username || "Unknown"}</span>
                                                <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
                                            </div>

                                            {editingCommentId === comment._id ? (
                                                <div className="mt-1">
                                                    <input
                                                        type="text"
                                                        value={editedContent}
                                                        onChange={(e) => setEditedContent(e.target.value)}
                                                        className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            onClick={() => handleSaveEdit(comment._id)}
                                                            className="px-3 py-1 bg-purple-600 rounded text-xs font-bold hover:bg-purple-700 transition"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="px-3 py-1 bg-gray-700 rounded text-xs font-bold hover:bg-gray-600 transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-300 leading-relaxed">{comment.content}</p>
                                            )}


                                            <div className="flex items-center gap-4 mt-2">
                                                <button
                                                    onClick={() => handleToggleCommentLike(comment._id)}
                                                    className={`flex items-center gap-1 text-xs transition-colors ${comment.isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-white'}`}
                                                >
                                                    {comment.isLiked ? (
                                                        <svg className="w-4 h-4 text-pink-500 fill-current" viewBox="0 0 24 24"><path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>
                                                    )}
                                                    {comment.likesCount || 0}
                                                </button>


                                                {currentUser && comment.owner && currentUser._id === comment.owner._id && !editingCommentId && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEditClick(comment)}
                                                            className="text-xs text-gray-500 hover:text-purple-400 font-bold transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteComment(comment._id)}
                                                            className="text-xs text-red-500/50 hover:text-red-500 font-bold transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>


                    </div>


                    <div className="lg:col-span-1">
                        <h3 className="text-xl font-bold mb-6">Up Next</h3>

                        <div className="flex flex-col gap-6 mt-4">
                            {suggestedVideos && suggestedVideos.length > 0 ? (
                                suggestedVideos.map((video) => (
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
                                        duration={video.duration ? `${Math.floor(video.duration / 60)}:${String(Math.floor(video.duration % 60)).padStart(2, '0')}` : "00:00"}
                                        type="horizontal"
                                    />
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">No other videos found.</p>
                            )}


                            {hasMoreSuggestions && (
                                <div className="text-center pt-2">
                                    <button
                                        onClick={handleLoadMoreSuggestions}
                                        className="text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors"
                                        disabled={loadingSuggestions}
                                    >
                                        {loadingSuggestions ? "Loading..." : "Load More"}
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>

                </div >
            </div>


            {
                isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl w-full max-w-lg shadow-2xl relative">
                            <h2 className="text-2xl font-bold mb-4">Edit Video</h2>
                            <form onSubmit={handleUpdateVideo} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={updateTitle}
                                        onChange={(e) => setUpdateTitle(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-1">Description</label>
                                    <textarea
                                        value={updateDescription}
                                        onChange={(e) => setUpdateDescription(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 h-24 resize-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-1">Thumbnail (Optional)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setUpdateThumbnail(e.target.files[0])}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-4 py-2 rounded-lg font-bold text-gray-300 hover:text-white hover:bg-gray-800 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-purple-600 rounded-lg font-bold text-white hover:bg-purple-700 transition shadow-lg shadow-purple-500/20"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }


            {isSaveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Save to Playlist</h2>
                            <button onClick={() => setIsSaveModalOpen(false)} className="text-gray-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        {fetchingPlaylists ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {userPlaylists.length > 0 ? (
                                    userPlaylists.map(playlist => {
                                        const isAdded = playlist.videos.some(v => v._id === video._id || v === video._id);
                                        return (
                                            <button
                                                key={playlist._id}
                                                onClick={() => handleTogglePlaylist(playlist)}
                                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors text-left group"
                                            >
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isAdded ? 'bg-purple-600 border-purple-600' : 'border-gray-500 group-hover:border-white'}`}>
                                                    {isAdded && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                                </div>
                                                <span className={`font-medium ${isAdded ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>{playlist.name}</span>
                                                {playlist.isPrivate && <span className="ml-auto text-xs text-gray-500">🔒</span>}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-400 text-sm text-center py-4">No playlists found.</p>
                                )}
                            </div>
                        )}

                        <div className="mt-6 pt-4 border-t border-gray-800">
                            <button
                                onClick={handleCreatePlaylistQuick}
                                className="flex items-center gap-2 text-purple-400 hover:text-purple-300 font-bold text-sm transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                Create new playlist
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {isShareModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl w-full max-w-md shadow-2xl relative">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Share Video</h2>
                            <button onClick={() => setIsShareModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>


                        <div className="flex justify-around gap-4 mb-8">
                            {shareLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-gray-700 transition-colors border border-gray-700">
                                        <img src={link.icon} alt={link.name} className="w-8 h-8 object-contain filter " />
                                    </div>
                                    <span className="text-xs text-gray-400 group-hover:text-white">{link.name}</span>
                                </a>
                            ))}
                        </div>


                        <div className="bg-black/50 rounded-xl p-2 flex items-center gap-2 border border-gray-800">
                            <input
                                type="text"
                                value={window.location.href}
                                readOnly
                                className="bg-transparent text-sm text-gray-400 flex-1 px-2 focus:outline-none"
                            />
                            <button
                                onClick={handleCopyLink}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${copySuccess ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                            >
                                {copySuccess ? "Copied!" : "Copy"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Watch;
