import { useState } from 'react';
import { Activity, ArrowLeft, Clock, Radio, Shield, RotateCcw } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

export default function Header({ 
  currentTime, 
  selectedState, 
  onBack, 
  showAlerts, 
  onToggleAlerts, 
  onToggleLayers, 
  onScrollToLive,
  alertCount = 0
}) {
  const [showResetModal, setShowResetModal] = useState(false);
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
    <header className="h-11 flex items-center justify-between px-4 bg-black border-b border-dark-500 flex-shrink-0 z-50">
      {/* Left */}
      <div className="flex items-center gap-3">
        {selectedState && (
          <button 
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-accent transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline uppercase tracking-widest font-mono text-[10px]">Back</span>
          </button>
        )}
        
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-sm bg-accent animate-pulse" />
          <h1 className="text-sm font-bold tracking-[3px] text-white flex items-baseline gap-1">
            <span className="text-gray-400 font-light uppercase">Observe</span>
            <span className="text-accent font-houljoe normal-case tracking-normal text-[1.35rem] leading-none">India</span>
          </h1>
        </div>

        {selectedState && (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 font-mono tracking-widest uppercase">
            <span>//</span>
            <span className="text-gray-300">{selectedState.name}</span>
          </div>
        )}
      </div>

      {/* Center */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-black border border-dark-500">
          <Clock size={12} className="text-gray-500" />
          <span className="text-[11px] font-mono text-gray-300 tracking-wider">{timeStr}</span>
          <span className="text-[9px] text-gray-600 tracking-widest uppercase">IST</span>
        </div>
        
        <div className="text-[10px] text-gray-500 tracking-widest font-mono uppercase">
          {dateStr}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono tracking-widest uppercase border ${
          isMarketOpen 
            ? 'bg-transparent text-up border-up' 
            : 'bg-transparent text-down border-down'
        }`}>
          <Radio size={8} className={isMarketOpen ? 'text-up' : 'text-down'} />
          {isMarketOpen ? 'MARKET OPEN' : 'MARKET CLOSED'}
        </div>

        <button 
          onClick={onScrollToLive}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 bg-black border border-dark-500 hover:border-accent hover:text-white transition-all cursor-pointer group"
        >
          <Activity size={10} className="text-accent group-hover:animate-pulse" />
          <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase group-hover:text-white">LIVE</span>
        </button>

        <button 
          onClick={onToggleAlerts}
          className={`hidden xl:flex items-center gap-1.5 px-2.5 py-0.5 bg-black border transition-all cursor-pointer ${
            showAlerts ? 'border-accent text-white shadow-[0_0_10px_rgba(255,0,51,0.3)]' : 'border-amber-500 text-amber-500 hover:border-amber-400'
          }`}
        >
          <Shield size={10} className={showAlerts ? 'text-accent' : 'text-amber-500'} />
          <span className="text-[10px] font-mono tracking-widest uppercase">
            {showAlerts ? 'CLOSE' : `ALERT ${alertCount}`}
          </span>
        </button>

        <button 
          onClick={() => setShowResetModal(true)}
          className="flex items-center gap-1 px-2.5 py-0.5 bg-black border border-dark-600 hover:border-white hover:text-white text-gray-500 transition-all cursor-pointer group"
          title="Reset All Layouts"
        >
          <RotateCcw size={10} className="group-hover:rotate-[-180deg] transition-transform duration-500" />
          <span className="text-[10px] font-mono tracking-widest uppercase">RESET</span>
        </button>

      </div>

      <ConfirmationModal 
        isOpen={showResetModal}
        title="SYSTEM RESET"
        message="Are you sure you want to reset all dashboard and state monitoring layouts to factory defaults? This action will reload the system."
        onConfirm={() => {
          localStorage.removeItem('india-monitor-layout');
          localStorage.removeItem('india-monitor-state-layout');
          window.location.reload();
        }}
        onCancel={() => setShowResetModal(false)}
        confirmText="INITIATE RESET"
        cancelText="ABORT"
      />
    </header>
  );
}

