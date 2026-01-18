import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import api from "../api/axios";

const Upload = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("video/")) {
        setVideo(file);
      } else {
        alert("Please upload a valid video file.");
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setVideo(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!video) {
      alert("Please select a video file");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("videoFile", video);
    if (thumbnail) formData.append("thumbnail", thumbnail);


    try {
      setLoading(true);

      const res = await api.post("/videos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Upload response:", res);
      alert("Video uploaded successfully 🎉");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-purple-500 selection:text-white pb-20">
      <AppNavbar />


      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-purple-900/40 rounded-full mix-blend-screen filter blur-[128px] opacity-30 animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[20%] w-96 h-96 bg-blue-900/40 rounded-full mix-blend-screen filter blur-[128px] opacity-30 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
            Upload Video
          </h1>
          <p className="text-gray-400">Share your creativity with the world</p>
        </div>

        <div className="bg-gray-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">


            <div
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${dragActive ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/30'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="video/*"
                onChange={handleChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="video-upload"
              />

              <div className="pointer-events-none">
                {video ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4 text-2xl">
                      ✅
                    </div>
                    <p className="text-lg font-medium text-white">{video.name}</p>
                    <p className="text-sm text-gray-400 mt-1">{(video.size / (1024 * 1024)).toFixed(2)} MB</p>
                    <p className="text-xs text-purple-400 mt-4">Click or drag to replace</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4 text-3xl">
                      ☁️
                    </div>
                    <p className="text-lg font-medium text-white mb-2">Drag & drop your video here</p>
                    <p className="text-sm text-gray-400">or click to browse</p>
                  </div>
                )}
              </div>
            </div>


            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Video Title</label>
                <input
                  id="title"
                  type="text"
                  placeholder="Give your video a catchy title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 text-white placeholder-gray-600"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Description</label>
                <textarea
                  id="description"
                  rows="4"
                  placeholder="Tell existing viewers about your video..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 text-white placeholder-gray-600 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Thumbnail (Optional)</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center justify-center px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-800 transition-colors group">
                    <span className="text-sm text-gray-300 group-hover:text-white mr-2">📷 Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setThumbnail(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                  {thumbnail && <span className="text-sm text-gray-400 text-ellipsis overflow-hidden whitespace-nowrap max-w-[200px]">{thumbnail.name}</span>}
                </div>
              </div>
            </div>


            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Visibility</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['public', 'unlisted', 'private'].map((option) => (
                  <label
                    key={option}
                    className={`relative flex items-center justify-center p-4 rounded-xl border cursor-pointer transition-all duration-300 ${visibility === option ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-gray-900/30 border-gray-700/50 text-gray-400 hover:bg-gray-800'}`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={option}
                      checked={visibility === option}
                      onChange={(e) => setVisibility(e.target.value)}
                      className="absolute opacity-0 w-full h-full cursor-pointer"
                    />
                    <span className="capitalize font-medium">{option}</span>
                  </label>
                ))}
              </div>
            </div>


            <div className="pt-6 flex flex-col md:flex-row gap-4">
              <button
                type="submit"
                disabled={loading || !video}
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-bold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? "Uploading..." : "Upload Video"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="md:w-auto px-8 py-4 bg-white/5 border border-white/5 rounded-xl font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-300"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;
