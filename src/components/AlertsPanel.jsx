import { useState, useEffect } from 'react';
import { X, Shield, ExternalLink, RefreshCw, Zap } from 'lucide-react';
import { fetchNews } from '../services/api';

// Severity label assigned heuristically by keyword scan
function getSeverity(title = '') {
  const t = title.toLowerCase();
  if (/attack|blast|flood|earthquake|riot|terror|war|strike|casualties|emergency|crisis|cyclone|fire/.test(t))
    return 'CRITICAL';
  if (/election|protest|resign|arrest|crash|accident|ban|sanction|border/.test(t))
    return 'HIGH';
  if (/growth|gdp|trade|market|invest|launch|policy|budget|reform/.test(t))
    return 'MEDIUM';
  return 'LOW';
}

const SEVERITY_STYLE = {
  CRITICAL: { bar: 'bg-accent', label: 'text-accent', dot: 'bg-accent animate-pulse' },
  HIGH:     { bar: 'bg-amber-500', label: 'text-amber-400', dot: 'bg-amber-500' },
  MEDIUM:   { bar: 'bg-gray-500', label: 'text-gray-400', dot: 'bg-gray-500' },
  LOW:      { bar: 'bg-dark-400', label: 'text-gray-600', dot: 'bg-dark-400' },
};

export default function AlertsPanel({ onClose, alerts = [], loading = false, onRefresh }) {

  return (
    <div
      className="absolute left-0 right-0 z-50 animate-slide-down"
      style={{
        top: '44px', // header height
        background: 'rgba(5,5,5,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,0,51,0.25)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
        maxHeight: '360px',
        overflowY: 'auto',
      }}
    >
      {/* Header bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5"
        style={{ background: 'rgba(0,0,0,0.9)', borderBottom: '1px solid rgba(255,0,51,0.15)' }}>
        <div className="flex items-center gap-3">
          <Shield size={12} className="text-accent" />
          <span className="text-[10px] font-mono tracking-[3px] text-gray-300 uppercase">Intelligence Alerts</span>
          <span className="text-[9px] font-mono text-gray-600 tracking-widest">— LIVE FEED</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 text-[9px] font-mono text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
          >
            <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
            <span className="tracking-widest uppercase">Refresh</span>
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Alert list */}
      <div className="px-4 py-2">
        {loading ? (
          <div className="flex flex-col gap-2 py-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-0.5 h-8 skeleton-shimmer flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-3 w-3/4 skeleton-shimmer mb-1.5" />
                  <div className="h-2 w-1/4 skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="py-8 text-center text-[10px] font-mono text-gray-600 tracking-widest uppercase">
            No alerts available
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-dark-700">
            {alerts.map((item, idx) => {
              const sev = getSeverity(item.title);
              const style = SEVERITY_STYLE[sev];
              return (
                <a
                  key={idx}
                  href={item.url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 py-2.5 group hover:bg-dark-800 transition-colors -mx-4 px-4"
                >
                  {/* Severity bar */}
                  <div className={`w-0.5 self-stretch flex-shrink-0 ${style.bar} opacity-80`} />

                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] text-gray-300 leading-snug group-hover:text-white transition-colors line-clamp-2 font-mono">
                        {item.title}
                      </p>
                      <ExternalLink size={10} className="text-gray-700 group-hover:text-gray-400 flex-shrink-0 mt-0.5 transition-colors" />
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
                      <span className={`text-[9px] font-mono tracking-widest uppercase ${style.label}`}>{sev}</span>
                      <span className="text-[9px] text-gray-600">·</span>
                      <span className="text-[9px] font-mono text-gray-600 tracking-widest uppercase">{item.source}</span>
                      {item.timeAgo && (
                        <>
                          <span className="text-[9px] text-gray-700">·</span>
                          <span className="text-[9px] font-mono text-gray-700">{item.timeAgo}</span>
                        </>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer glow line */}
      <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,0,51,0.3), transparent)' }} />
    </div>
  );
}
