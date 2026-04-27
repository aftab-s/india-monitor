import { useState } from 'react';
import { Tv, Maximize2, Minimize2, ExternalLink } from 'lucide-react';

export default function LiveStreamPanel({ title, channelId, className = "" }) {
  const [isMaximized, setIsMaximized] = useState(false);

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  return (
    <div 
      className={`glass-panel rounded-lg overflow-hidden animate-slide-up flex flex-col ${
        isMaximized 
          ? "fixed inset-4 z-50 shadow-2xl" 
          : `col-span-1 md:col-span-2 aspect-video ${className}`
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-dark-500/30 bg-dark-800/50">
        <div className="flex items-center gap-2 min-w-0">
          <Tv size={13} className="text-red-500 animate-pulse" />
          <h3 className="text-[11px] font-semibold tracking-wider text-gray-300 uppercase truncate">
            {title} <span className="text-[9px] text-red-500 ml-1">● LIVE</span>
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleMaximize}
            className="p-1 rounded hover:bg-dark-600 transition-colors text-gray-600 hover:text-gray-400 cursor-pointer"
            title={isMaximized ? "Minimize" : "Maximize"}
          >
            {isMaximized ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
          </button>
          <a 
            href={`https://www.youtube.com/channel/${channelId}/live`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1 rounded hover:bg-dark-600 transition-colors text-gray-600 hover:text-gray-400"
          >
            <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Video Content */}
      <div className="flex-1 bg-black relative flex items-center justify-center">
        <iframe
          className="absolute inset-0 w-full h-full z-10"
          src={`https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=1&controls=1&modestbranding=1&rel=0`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
        {/* Simple fallback message if iframe is blocked by policy */}
        <div className="text-center p-4 absolute inset-0 flex flex-col items-center justify-center z-0">
          <p className="text-[10px] text-gray-500 mb-2">Live stream connection pending...</p>
          <p className="text-[9px] text-gray-600 mb-2">(Some channels block embedded playback)</p>
          <a 
            href={`https://www.youtube.com/channel/${channelId}/live`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] text-accent hover:underline px-3 py-1.5 border border-accent/30 rounded bg-accent/10"
          >
            Watch directly on YouTube →
          </a>
        </div>
      </div>
    </div>
  );
}
