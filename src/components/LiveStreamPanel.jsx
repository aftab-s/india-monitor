import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Panel from './Panel';
import { Tv, X, Maximize2, ExternalLink } from 'lucide-react';

export default function LiveStreamPanel({
  title,
  youtubeId: rawId,
  icon: Icon = Tv,
  badge = 'LIVE',
  badgeColor = 'live',
  className = '',
  bodyClassName,
  fillHeight = true,
}) {
  const [isEnlarged, setIsEnlarged] = useState(false);

  const getYoutubeId = (idOrUrl) => {
    if (!idOrUrl) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]*).*/;
    const match = idOrUrl.match(regExp);
    return (match && match[2].length === 11) ? match[2] : idOrUrl;
  };

  const youtubeId = getYoutubeId(rawId);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') setIsEnlarged(false); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      <Panel
        title={title}
        icon={Icon}
        badge={badge}
        badgeColor={badgeColor}
        className={`h-full min-h-0 group/stream ${className}`}
        bodyClassName={
          bodyClassName ??
          (fillHeight
            ? 'p-3 overflow-hidden flex flex-col flex-1 min-h-0 gap-2'
            : 'p-3 overflow-hidden flex flex-col gap-2')
        }
      >
        <div
          className={
            fillHeight
              ? 'flex flex-col flex-1 min-h-0 gap-2'
              : 'flex flex-col gap-2'
          }
        >
          <div
            onClick={() => setIsEnlarged(true)}
            className={
              fillHeight
                ? 'relative w-full flex-1 min-h-[180px] bg-black overflow-hidden cursor-zoom-in border border-dark-700/50 group-hover:border-accent/40 transition-colors'
                : 'relative w-full aspect-video bg-black overflow-hidden cursor-zoom-in border border-dark-700/50 group-hover:border-accent/40 transition-colors shrink-0'
            }
          >
            {/* Minimal Preview Video */}
            <div className="absolute inset-0 pointer-events-none grayscale opacity-60 group-hover/stream:opacity-100 group-hover/stream:grayscale-0 transition-all duration-500">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&rel=0&modestbranding=1&controls=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0`}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="scale-[1.1]"
              />
            </div>

            {/* CRT / Monitor Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:3px_3px]" />
              <div className="absolute inset-0 scanline opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>

            {/* Hover UI */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover/stream:opacity-100">
              <div className="bg-black/60 backdrop-blur-md border border-white/10 p-2 rounded-full transform scale-90 group-hover/stream:scale-100 transition-transform">
                <Maximize2 size={16} className="text-white" />
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 px-0.5">
            <div className="h-1 w-1 animate-pulse rounded-full bg-accent" />
            <span className="text-[8px] font-mono tracking-widest text-gray-500 uppercase">
              Signal active
            </span>
          </div>
        </div>
      </Panel>

      {/* Enlarged Modal Portal */}
      {isEnlarged && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-10 animate-fade-in">
          <div className="relative w-full max-w-6xl aspect-video bg-black border border-dark-600 shadow-[0_0_50px_rgba(255,0,51,0.15)]">
            
            {/* Modal Header */}
            <div className="absolute -top-10 left-0 right-0 flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-accent animate-pulse" />
                <span className="text-[11px] font-mono tracking-[4px] text-gray-300 uppercase">{title} — Intel Stream</span>
              </div>
              <div className="flex items-center gap-4">
                <a 
                  href={`https://www.youtube.com/watch?v=${youtubeId}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-[10px] font-mono text-gray-500 hover:text-white transition-colors"
                >
                  <ExternalLink size={12} />
                  <span>YOUTUBE.COM</span>
                </a>
                <button 
                  onClick={() => setIsEnlarged(false)}
                  className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400 hover:text-accent transition-colors"
                >
                  <X size={16} />
                  <span>CLOSE [ESC]</span>
                </button>
              </div>
            </div>

            {/* Main Video (with controls) */}
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="h-full w-full"
            />

            {/* Corner Decorative Elements */}
            <div className="absolute -bottom-2 -right-2 w-10 h-10 border-r border-b border-dark-500" />
            <div className="absolute -top-2 -left-2 w-10 h-10 border-t border-l border-dark-500" />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
