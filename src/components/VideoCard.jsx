import React from "react";
import { Link } from "react-router-dom";

const VideoCard = ({
  videoId,
  thumbnail,
  title,
  channelName,
  ownerUsername,
  ownerAvatar,
  views,
  likes,
  uploadedAt,
  duration,
  type = "vertical"
}) => {
  const linkUsername = ownerUsername || channelName;
  if (type === "horizontal") {
    return (
      <div className="group flex flex-row gap-3 bg-gray-800/20 rounded-lg overflow-hidden border border-white/5 hover:border-purple-500/50 transition-all duration-300 hover:bg-gray-800/40">

        <Link to={`/videos/${videoId}`} className="block relative w-40 min-w-[160px] aspect-video overflow-hidden rounded-lg">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300"></div>


          <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 backdrop-blur-sm rounded text-[9px] font-bold text-white">
            {duration}
          </div>
        </Link>


        <div className="flex-1 py-1 pr-2 min-w-0 flex flex-col justify-start">

          <Link to={`/videos/${videoId}`} className="block group/title">
            <h3 className="text-sm font-bold text-white leading-tight group-hover/title:text-purple-400 transition-colors line-clamp-2 mb-1">
              {title}
            </h3>
          </Link>


          <Link to={`/channel/${linkUsername}`} className="text-xs text-gray-400 hover:text-white transition-colors mb-1 truncate block">
            {channelName}
          </Link>


          <div className="flex items-center text-[10px] text-gray-500 gap-2 mt-auto">
            <span>{views} views</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 text-pink-500 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
              {likes}
            </span>
            <span>•</span>
            <span>{uploadedAt}</span>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="group bg-gray-800/40 rounded-xl overflow-hidden border border-white/5 hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:-translate-y-1">

      <Link to={`/videos/${videoId}`} className="block relative aspect-video overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300"></div>


        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 backdrop-blur-sm rounded text-[10px] font-bold text-white">
          {duration}
        </div>


        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
      </Link>


      <div className="p-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">

            <Link to={`/videos/${videoId}`} className="block group/title">
              <h3 className="text-sm font-bold text-white leading-tight group-hover/title:text-purple-400 transition-colors line-clamp-2 mb-1">
                {title}
              </h3>
            </Link>


            <div className="flex items-center gap-2 mb-2">
              <Link to={`/channel/${linkUsername}`} className="block flex-shrink-0">
                <img
                  src={ownerAvatar || "https://ui-avatars.com/api/?name=" + channelName}
                  alt={channelName}
                  className="w-6 h-6 rounded-full object-cover border border-gray-700"
                />
              </Link>
              <Link to={`/channel/${linkUsername}`} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                <span>{channelName}</span>
                <svg className="w-3 h-3 text-blue-500 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
              </Link>
            </div>


            <div className="flex items-center gap-3 text-[10px] font-medium text-gray-500">
              <span>{views} views</span>
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 text-pink-500 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                {likes}
              </span>
              <span>{uploadedAt}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default VideoCard;
