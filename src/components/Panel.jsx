import { useState } from 'react';
import { RefreshCw, ChevronDown, ChevronUp, AlertCircle, GripVertical } from 'lucide-react';


export default function Panel({ title, icon: Icon, children, className = '', badge, badgeColor = 'accent', onRefresh, loading, error, span = 1, bodyClassName }) {
  const [collapsed, setCollapsed] = useState(false);

  const badgeColors = {
    accent: 'bg-transparent text-accent border-accent',
    warning: 'bg-transparent text-amber-500 border-amber-500',
    danger: 'bg-transparent text-red-500 border-red-500',
    info: 'bg-transparent text-blue-400 border-blue-400',
    live: 'bg-transparent text-up border-up',
  };

  const colSpanClass = span === 2 ? 'col-span-1 md:col-span-2' : span === 3 ? 'col-span-1 md:col-span-3' : '';

  return (
    <div className={`bg-black border border-dark-500 rounded-none overflow-hidden animate-slide-up flex flex-col transition-all duration-300 ${collapsed ? 'h-auto max-h-[34px]' : 'h-full'} ${className}`}>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-dark-500 bg-black/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 min-w-0">
          <div className="drag-handle cursor-grab active:cursor-grabbing p-1 -ml-1 hover:text-gray-400 transition-colors">
            <GripVertical size={12} className="text-gray-600" />
          </div>
          {Icon && <Icon size={13} className={`${collapsed ? 'text-accent' : 'text-gray-500'} flex-shrink-0`} />}

          <h3 className={`text-[11px] font-mono tracking-widest uppercase truncate ${collapsed ? 'text-accent font-bold' : 'text-gray-300'}`}>{title}</h3>
          {badge && !collapsed && (
            <span className={`text-[9px] font-mono tracking-widest uppercase px-1.5 py-0.5 border ${badgeColors[badgeColor]}`}>
              {badge}
            </span>
          )}
          {collapsed && (
            <div className="flex items-center gap-1 ml-2">
              <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
              <span className="text-[8px] font-mono text-gray-600 uppercase tracking-tighter">Monitoring</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {onRefresh && (
            <button onClick={onRefresh} className="p-1 rounded hover:bg-dark-600 transition-colors text-gray-600 hover:text-gray-400 cursor-pointer" title="Refresh">
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            </button>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded hover:bg-dark-600 transition-colors text-gray-600 hover:text-gray-400 cursor-pointer" title={collapsed ? 'Expand' : 'Collapse'}>
            {collapsed ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 min-h-0 transition-all duration-300 ${collapsed ? 'opacity-0 h-0 p-0 pointer-events-none overflow-hidden' : 'opacity-100'} ${bodyClassName ?? 'p-3 overflow-auto'}`}>

          {loading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton-shimmer h-4" style={{ width: `${75 - i * 10}%` }} />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <AlertCircle size={20} className="text-gray-600" />
              <p className="text-[11px] text-gray-500">Data temporarily unavailable</p>
              {onRefresh && (
                <button onClick={onRefresh} className="text-[10px] text-accent hover:text-accent-dim transition-colors cursor-pointer">
                  Retry
                </button>
              )}
            </div>
          ) : (
            children
          )}
        </div>
    </div>
  );
}

// Stat display sub-component
export function StatValue({ label, value, change, prefix = '', suffix = '', small = false }) {
  const changeColor = change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-500';
  const changePrefix = change > 0 ? '+' : '';

  return (
    <div className="flex items-center justify-between py-1">
      <span className={`${small ? 'text-[10px]' : 'text-[11px]'} text-gray-500`}>{label}</span>
      <div className="flex items-center gap-2">
        <span className={`${small ? 'text-[11px]' : 'text-xs'} font-mono font-medium text-gray-200`}>
          {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}
        </span>
        {change !== undefined && change !== null && (
          <span className={`text-[10px] font-mono ${changeColor}`}>
            {changePrefix}{typeof change === 'number' ? change.toFixed(2) : change}%
          </span>
        )}
      </div>
    </div>
  );
}

// Mini bar chart 
export function MiniBar({ value, max, color = '#00ff88', label }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-2 py-0.5">
      {label && <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 w-16 truncate">{label}</span>}
      <div className="flex-1 h-1.5 bg-dark-600 rounded-none overflow-hidden border border-dark-500">
        <div className="h-full rounded-none transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-mono text-gray-400 w-8 text-right">{Math.round(pct)}%</span>
    </div>
  );
}

// News item component
export function NewsItem({ title, source, time, url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block py-2 border-b border-dark-500 last:border-0 hover:bg-dark-600 -mx-1 px-1 rounded-none transition-colors"
    >
      <p className="text-[11px] text-gray-300 leading-relaxed line-clamp-2 font-mono uppercase">{title}</p>
      <div className="flex items-center gap-2 mt-1">
        {source && <span className="text-[9px] text-accent font-mono tracking-widest uppercase">{source}</span>}
        {time && <span className="text-[9px] text-gray-600 font-mono uppercase tracking-widest">{time}</span>}
      </div>
    </a>
  );
}
