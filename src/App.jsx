import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import IndiaMap from './components/IndiaMap';
import StateDetailView from './components/StateDetailView';
import DashboardPanels from './components/DashboardPanels';
import { STATES } from './data/constants';

export default function App() {
  const [selectedState, setSelectedState] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

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

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-black text-white">
      <Header currentTime={currentTime} selectedState={selectedState} onBack={handleBack} />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* National Dashboard View */}
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${selectedState ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100'}`}>
          <div className="flex-shrink-0" style={{ height: '45vh', minHeight: '280px' }}>
            <IndiaMap onStateSelect={handleStateSelect} selectedState={selectedState} />
          </div>
          <div className="flex-1 overflow-y-auto">
            <DashboardPanels />
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
