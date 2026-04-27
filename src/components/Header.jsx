import { Activity, ArrowLeft, Clock, Radio, Shield } from 'lucide-react';

export default function Header({ currentTime, selectedState, onBack }) {
  const timeStr = currentTime.toLocaleTimeString('en-IN', { 
    timeZone: 'Asia/Kolkata', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  });
  
  const dateStr = currentTime.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();

  const isMarketOpen = (() => {
    const now = new Date(currentTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const day = now.getDay();
    const hr = now.getHours();
    const min = now.getMinutes();
    const mins = hr * 60 + min;
    return day >= 1 && day <= 5 && mins >= 555 && mins <= 930; // 9:15-15:30
  })();

  return (
    <header className="h-11 flex items-center justify-between px-4 bg-dark-800/90 border-b border-dark-500/50 flex-shrink-0 backdrop-blur-sm z-50">
      {/* Left */}
      <div className="flex items-center gap-3">
        {selectedState && (
          <button 
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-accent transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(0,255,136,0.4)]" />
          <h1 className="text-sm font-bold tracking-[3px] text-white">
            <span className="text-accent">INDIA</span>
            <span className="text-gray-300 font-light ml-1">MONITOR</span>
          </h1>
        </div>

        {selectedState && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
            <span>›</span>
            <span className="text-gray-300">{selectedState.name}</span>
          </div>
        )}
      </div>

      {/* Center */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-dark-700/60 border border-dark-500/30">
          <Clock size={12} className="text-gray-500" />
          <span className="text-[11px] font-mono text-gray-300 tracking-wide">{timeStr}</span>
          <span className="text-[9px] text-gray-600 tracking-wider">IST</span>
        </div>
        
        <div className="text-[10px] text-gray-500 tracking-wider font-mono">
          {dateStr}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider ${
          isMarketOpen 
            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          <Radio size={8} className={isMarketOpen ? 'text-green-400' : 'text-red-400'} />
          {isMarketOpen ? 'MARKET OPEN' : 'MARKET CLOSED'}
        </div>

        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-dark-700/60 border border-dark-500/30">
          <Activity size={10} className="text-accent" />
          <span className="text-[10px] text-gray-400 tracking-wider">LIVE</span>
        </div>

        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
          <Shield size={10} className="text-amber-400" />
          <span className="text-[10px] text-amber-400 font-semibold tracking-wider">ALERT 3</span>
        </div>
      </div>
    </header>
  );
}
