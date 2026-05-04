import { useState } from 'react';
import Panel from './Panel';
import { Play, Tv, Video } from 'lucide-react';

export default function LiveStreamPanel({ title, youtubeId: rawId, icon: Icon = Tv }) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Helper to extract ID from various YouTube URL formats
  const getYoutubeId = (idOrUrl) => {
    if (!idOrUrl) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]*).*/;
    const match = idOrUrl.match(regExp);
    return (match && match[2].length === 11) ? match[2] : idOrUrl;
  };

  const youtubeId = getYoutubeId(rawId);

  return (
    <Panel 
      title={title} 
      icon={Icon} 
      badge="LIVE" 
      badgeColor="live"
      className="h-[220px]"
    >
      <div className="relative w-full h-full bg-black border border-dark-600/30">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&rel=0&modestbranding=1&controls=0`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="grayscale hover:grayscale-0 transition-all duration-700 pointer-events-auto"
        ></iframe>
      </div>
    </Panel>
  );
}
