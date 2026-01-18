import React, { useState } from 'react';
import api from '../api/axios';

const EditProfile = ({ user, onClose, onUpdate }) => {
    const [fullName, setFullName] = useState(user?.fullName || "");
    const [email, setEmail] = useState(user?.email || "");


    const [avatarFile, setAvatarFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);


    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
    const [coverPreview, setCoverPreview] = useState(user?.coverImage || "");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setError("");

        try {

            if (fullName !== user?.fullName || email !== user?.email) {
                await api.patch("/users/account-detail", { fullName, email });
            }


            if (avatarFile) {
                const formData = new FormData();
                formData.append("avatar", avatarFile);

                await api.patch("/users/avatar", formData);
            }


            if (coverFile) {
                const formData = new FormData();
                formData.append("coverImage", coverFile);
                await api.patch("/users/cover-image", formData);
            }

            onUpdate();
            onClose();
        } catch (err) {
            console.error("Failed to update profile", err);
            const errorMessage = err.response?.data?.message || "Failed to update profile. Please try again.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">


                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>


                <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}


                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-gray-300">Cover Image</label>
                        <div className="relative h-48 w-full rounded-xl overflow-hidden group border-2 border-dashed border-gray-700 bg-gray-800">
                            {coverPreview ? (
                                <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    No Cover Image
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <label className="cursor-pointer bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-full font-semibold border border-white/20 transition-all transform hover:scale-105">
                                    Change Cover
                                    <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                                </label>
                            </div>
                        </div>
                    </div>


                    <div className="flex items-center gap-6">
                        <div className="relative h-24 w-24 rounded-full overflow-hidden group border-2 border-gray-700 bg-gray-800 shrink-0">
                            <img src={avatarPreview || "https://via.placeholder.com/150"} alt="Avatar Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <label className="cursor-pointer p-2 bg-black/60 rounded-full hover:bg-black/80 transition-all text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                </label>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-semibold">Profile Picture</h3>
                            <p className="text-gray-400 text-sm mt-1">PNG, JPG or GIF. Max 5MB.</p>
                        </div>
                    </div>


                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-300">Full Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-4 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-300">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-4 pr-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>
                    </div>
                </div>


                <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-8 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-bold shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center gap-2"
                    >
                        {loading && (
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {loading ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
