import { useState, useEffect, useCallback, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header';
import IndiaMap from './components/IndiaMap';
import StateDetailView from './components/StateDetailView';
import DashboardPanels from './components/DashboardPanels';
import AlertsPanel from './components/AlertsPanel';
import { STATES } from './data/constants';
import { fetchNews } from './services/api';

export default function App() {
  const [selectedState, setSelectedState] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // ── Feature states ─────────────────────────────────────────────
  const [showAlerts, setShowAlerts] = useState(false);
  const [showGrid, setShowGrid] = useState(true);   // map grid layer on by default
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const liveStreamRef = useRef(null);               // ref to first live stream panel

  // URL state management
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stateCode = params.get('state');
    if (stateCode) {
      const state = STATES.find(s => s.code === stateCode);
      if (state) setSelectedState(state);
    }
  }, []);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initial data fetch
  useEffect(() => {
    async function loadAlerts() {
      try {
        const data = await fetchNews('general');
        setAlerts(data.slice(0, 12));
      } catch (e) {
        console.error('Failed to fetch initial alerts', e);
      } finally {
        setLoadingAlerts(false);
      }
    }
    loadAlerts();
  }, []);

  // Browser back button
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const stateCode = params.get('state');
      if (stateCode) {
        const state = STATES.find(s => s.code === stateCode);
        setSelectedState(state || null);
      } else {
        setSelectedState(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleStateSelect = useCallback((state) => {
    setIsTransitioning(true);
    setSelectedState(state);
    const url = new URL(window.location);
    url.searchParams.set('state', state.code);
    window.history.pushState({}, '', url);
    setTimeout(() => setIsTransitioning(false), 350);
  }, []);

  const handleBack = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedState(null);
      setIsTransitioning(false);
      const url = new URL(window.location);
      url.searchParams.delete('state');
      window.history.pushState({}, '', url);
    }, 300);
  }, []);

  // ── Header callbacks ────────────────────────────────────────────
  const handleToggleAlerts = useCallback(() => setShowAlerts(v => !v), []);
  const handleToggleLayers = useCallback(() => setShowGrid(v => !v), []);
  const handleScrollToLive = useCallback(() => {
    if (liveStreamRef.current) {
      liveStreamRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Brief highlight flash
      liveStreamRef.current.classList.add('live-flash');
      setTimeout(() => liveStreamRef.current?.classList.remove('live-flash'), 1200);
    }
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-black text-white">
      <Analytics />
      <Header
        currentTime={currentTime}
        selectedState={selectedState}
        onBack={handleBack}
        showAlerts={showAlerts}
        onToggleAlerts={handleToggleAlerts}
        showGrid={showGrid}
        onToggleLayers={handleToggleLayers}
        onScrollToLive={handleScrollToLive}
        alertCount={alerts.length}
      />

      {/* Alerts panel slides in just below the header */}
      {showAlerts && (
        <AlertsPanel 
          alerts={alerts} 
          loading={loadingAlerts} 
          onClose={() => setShowAlerts(false)} 
          onRefresh={async () => {
            setLoadingAlerts(true);
            try {
              const data = await fetchNews('general');
              setAlerts(data.slice(0, 12));
            } finally {
              setLoadingAlerts(false);
            }
          }}
        />
      )}

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* National Dashboard View */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${selectedState ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100'}`}>

          <div className="flex-1 overflow-y-auto" style={{ background: '#000' }}>
            <DashboardPanels 
              liveStreamRef={liveStreamRef} 
              onStateSelect={handleStateSelect}
              selectedState={selectedState}
              showGrid={showGrid}
              onToggleLayers={handleToggleLayers}
            />
          </div>
        </div>


        {/* State Detail View */}
        {selectedState && (
          <div className={`absolute inset-0 z-40 ${isTransitioning ? 'state-detail-enter state-detail-enter-active' : ''}`}>
            <StateDetailView state={selectedState} onBack={handleBack} />
          </div>
        )}
      </main>
    </div>
  );
}
