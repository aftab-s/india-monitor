import { useState, useEffect, useCallback, useMemo } from 'react';
import { Responsive, useContainerWidth } from 'react-grid-layout';
import useAutoRefresh from '../hooks/useAutoRefresh';

import '/node_modules/react-grid-layout/css/styles.css';
import '/node_modules/react-resizable/css/styles.css';







import Panel, { StatValue, MiniBar, NewsItem } from './Panel';

import {
  TrendingUp, DollarSign, BarChart3, Landmark, Globe, CloudRain, Wind, 
  Flame, ShieldAlert, Swords, Vote, Newspaper, Cpu, Zap, Ship, 
  Building2, Wheat, Droplets, ThermometerSun, Activity, Radio, Podcast,
  CircuitBoard, Factory, Banknote, Scale, Heart, AlertTriangle, ShieldCheck, Film, MapPin, ExternalLink
} from 'lucide-react';

import {
  fetchWeather, fetchEarthquakes, fetchMacroData, fetchTradeData,
  fetchExchangeRates, fetchNews, fetchGdeltIntel, fetchMarketIndices,
  fetchAirQuality, getRbiPolicyRates, getEnergyData,
  WATER_RESERVOIRS, CYBER_THREATS, BORDER_STATUS, CROP_PRICES,
  ELECTION_DATA, UNICORN_DATA, INFRA_TARGETS
} from '../services/api';
import LiveStreamPanel from './LiveStreamPanel';
import IndiaMap from './IndiaMap';


const INITIAL_LAYOUTS = {
  lg: [
    { i: 'map', x: 0, y: 0, w: 2, h: 22 },
    { i: 'weather', x: 3, y: 14, w: 2, h: 8 },
    { i: 'aqi', x: 2, y: 0, w: 1, h: 6 },
    { i: 'news', x: 3, y: 22, w: 2, h: 8 },
    { i: 'stream1', x: 3, y: 6, w: 1, h: 8 },
    { i: 'stream2', x: 4, y: 6, w: 1, h: 8 },
    { i: 'stream3', x: 2, y: 6, w: 1, h: 8 },
    { i: 'markets', x: 3, y: 0, w: 1, h: 6 },
    { i: 'currency', x: 4, y: 0, w: 1, h: 6 },
    { i: 'sectors', x: 2, y: 51, w: 1, h: 9 },
    { i: 'rbi', x: 2, y: 36, w: 1, h: 6 },
    { i: 'intel', x: 0, y: 28, w: 1, h: 5 },
    { i: 'macro', x: 1, y: 22, w: 1, h: 6 },
    { i: 'politics', x: 2, y: 14, w: 1, h: 8 },
    { i: 'security', x: 0, y: 54, w: 2, h: 6 },
    { i: 'infra', x: 0, y: 22, w: 1, h: 6 },
    { i: 'trade', x: 2, y: 22, w: 1, h: 7 },
    { i: 'reservoir', x: 3, y: 36, w: 2, h: 8 },
    { i: 'energy', x: 3, y: 30, w: 2, h: 6 },
    { i: 'renewables', x: 2, y: 29, w: 1, h: 7 },
    { i: 'tech', x: 0, y: 33, w: 1, h: 5 },
    { i: 'unicorn', x: 1, y: 28, w: 1, h: 10 },
    { i: 'movies', x: 0, y: 38, w: 1, h: 7 },
    { i: 'borders', x: 2, y: 42, w: 1, h: 9 },
    { i: 'cyber', x: 3, y: 51, w: 2, h: 9 },
    { i: 'disasters', x: 0, y: 45, w: 2, h: 9 },
    { i: 'mandi', x: 1, y: 38, w: 1, h: 7 },
    { i: 'elections', x: 3, y: 44, w: 2, h: 7 },
    { i: 'system', x: 0, y: 60, w: 5, h: 7 },
  ]
};

export default function DashboardPanels({ 
  liveStreamRef, 
  onStateSelect, 
  selectedState, 
  showGrid, 
  onToggleLayers 
}) {

  const { containerRef, width } = useContainerWidth({ initialWidth: 1200 });
  
  const [layouts, setLayouts] = useState(() => {
    const saved = localStorage.getItem('india-monitor-layout');
    return saved ? JSON.parse(saved) : INITIAL_LAYOUTS;
  });

  const onLayoutChange = (currentLayout, allLayouts) => {
    setLayouts(allLayouts);
    localStorage.setItem('india-monitor-layout', JSON.stringify(allLayouts));
  };

  const panels = useMemo(() => [
    { id: 'map', component: (
      <Panel title="Geospatial Intelligence (GeoInt)" icon={MapPin} badge="Interactive" badgeColor="info" className="h-full">
        <IndiaMap 
          onStateSelect={onStateSelect} 
          selectedState={selectedState} 
          showGrid={showGrid} 
          onToggleLayers={onToggleLayers}
          isPanelMode={true} // New prop to hide internal title bar
        />
      </Panel>
    )},
    { id: 'weather', component: <WeatherPanel /> },

    { id: 'aqi', component: <AirQualityPanel /> },
    { id: 'news', component: <NewsPanel /> },
    { id: 'stream1', component: <LiveStreamPanel title="NDTV India" youtubeId="https://www.youtube.com/live/p8yZdGjqfxg?si=3DwigqylYb1q5yVp" /> },
    { id: 'stream2', component: <LiveStreamPanel title="India Today" youtubeId="https://www.youtube.com/watch?v=tr9CoMGkqf4" /> },
    { id: 'stream3', component: <LiveStreamPanel title="CNN News18" youtubeId="https://www.youtube.com/watch?v=rfDx1HMvXbQ" /> },
    { id: 'markets', component: <MarketsPanel /> },
    { id: 'currency', component: <CurrencyPanel /> },
    { id: 'sectors', component: <SectorsPanel /> },
    { id: 'rbi', component: <RbiPanel /> },
    { id: 'intel', component: <IntelPanel /> },
    { id: 'macro', component: <MacroPanel /> },
    { id: 'politics', component: <PoliticsPanel /> },
    { id: 'security', component: <SecurityPanel /> },
    { id: 'infra', component: <InfraPanel /> },
    { id: 'trade', component: <TradePanel /> },
    { id: 'reservoir', component: <ReservoirPanel /> },
    { id: 'energy', component: <EnergyPanel /> },
    { id: 'renewables', component: <RenewablesPanel /> },
    { id: 'tech', component: <TechPanel /> },
    { id: 'unicorn', component: <UnicornPanel /> },
    { id: 'movies', component: <MoviesPanel /> },
    { id: 'borders', component: <BordersPanel /> },
    { id: 'cyber', component: <CyberSecurityPanel /> },
    { id: 'disasters', component: <DisastersPanel /> },
    { id: 'mandi', component: <MandiPanel /> },
    { id: 'elections', component: <ElectionsPanel /> },
    { id: 'system', component: <SystemInfoPanel /> },
  ], []);

  return (
    <div ref={containerRef} className="px-6 md:px-12 py-4">

      <Responsive
        className="layout"
        layouts={layouts}
        width={width}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 5, md: 4, sm: 2, xs: 1, xxs: 1 }}
        rowHeight={30}
        onLayoutChange={onLayoutChange}
        dragConfig={{ handle: ".drag-handle", enabled: true }}
        margin={[4, 4]}
      >
        {panels.map(panel => (
          <div key={panel.id} ref={panel.id === 'stream1' ? liveStreamRef : null}>
            {panel.component}
          </div>
        ))}
      </Responsive>
    </div>
  );
}




// ─── Markets Panel ────────────────────────────────────────────
function MarketsPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await fetchMarketIndices()); }
    catch { setData([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useAutoRefresh(load, 60000); // Auto-refresh every 60 seconds


  return (
    <Panel title="Indian Markets" icon={TrendingUp} badge="LIVE" badgeColor="live" loading={loading} onRefresh={load}>
      {data?.map((item, i) => (
        <div key={i} className="flex items-center justify-between py-1.5 border-b border-dark-500 last:border-0">
          <span className="text-[11px] font-mono tracking-widest text-gray-400 uppercase">{item.name}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-gray-200">{item.value.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</span>
            <span className={`text-[10px] font-mono ${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
            </span>
          </div>
        </div>
      ))}
    </Panel>
  );
}

// ─── Currency Panel ───────────────────────────────────────────
function CurrencyPanel() {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const data = await fetchExchangeRates();
      setRates(data);
    } catch { setError(true); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useAutoRefresh(load, 5 * 60000); // Auto-refresh every 5 minutes


  return (
    <Panel title="INR Exchange" icon={DollarSign} loading={loading} error={error} onRefresh={load}>
      {rates && (
        <>
          <StatValue label="USD/INR" value={rates.USD?.toFixed(2)} prefix="₹" />
          <StatValue label="EUR/INR" value={rates.EUR?.toFixed(2)} prefix="₹" />
          <StatValue label="GBP/INR" value={rates.GBP?.toFixed(2)} prefix="₹" />
          <StatValue label="JPY/100 INR" value={rates.JPY?.toFixed(4)} />
        </>
      )}
    </Panel>
  );
}

// ─── Sectors Panel ────────────────────────────────────────────
function SectorsPanel() {
  const sectors = [
    { name: 'IT', change: -0.42, color: '#3b82f6' },
    { name: 'Banking', change: 0.87, color: '#10b981' },
    { name: 'Pharma', change: 1.34, color: '#8b5cf6' },
    { name: 'Auto', change: 0.56, color: '#f59e0b' },
    { name: 'FMCG', change: -0.18, color: '#ec4899' },
    { name: 'Energy', change: 2.15, color: '#ef4444' },
    { name: 'Metal', change: 1.78, color: '#6b7280' },
  ];

  return (
    <Panel title="Sector Heatmap" icon={BarChart3}>
      <div className="grid grid-cols-2 gap-1">
        {sectors.map((s, i) => (
          <div key={i} className={`px-2 py-2 rounded text-center ${s.change >= 0 ? 'bg-transparent' : 'bg-transparent'}`}>
            <div className="text-[10px] text-gray-400 mb-0.5">{s.name}</div>
            <div className={`text-xs font-mono font-semibold ${s.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ─── Movies Panel (OMDB/Entertainment) ────────────────────────
function MoviesPanel() {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setNews(await fetchNews('entertainment')); }
    catch { setNews([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Panel title="Entertainment" icon={Film} loading={loading} onRefresh={load}>
      {news?.length === 0 ? (
        <p className="text-[11px] text-gray-600 text-center py-4">No entertainment updates</p>
      ) : (
        <div className="max-h-48 overflow-y-auto space-y-0">
          {news?.slice(0, 5).map((item, i) => (
            <NewsItem key={i} title={item.title} source={item.source} time={item.timeAgo} url={item.url} />
          ))}
        </div>
      )}
    </Panel>
  );
}

// ─── RBI Policy Panel ─────────────────────────────────────────
function RbiPanel() {
  const rbi = getRbiPolicyRates();
  return (
    <Panel title="RBI Policy Rates" icon={Landmark} badge={rbi.lastUpdated} badgeColor="info">
      <StatValue label="Repo Rate" value={rbi.repoRate} suffix="%" />
      <StatValue label="Reverse Repo" value={rbi.reverseRepoRate} suffix="%" />
      <StatValue label="CRR" value={rbi.crr} suffix="%" />
      <StatValue label="SLR" value={rbi.slr} suffix="%" />
      <StatValue label="Inflation Target" value={rbi.inflationTarget} />
    </Panel>
  );
}

// ─── Macro Panel ──────────────────────────────────────────────
function MacroPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const result = await fetchMacroData();
      setData(result);
    } catch { setError(true); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Panel title="Macro Indicators" icon={Globe} loading={loading} error={error} onRefresh={load}>
      {data && (
        <>
          {data.gdp[0] && <StatValue label={`GDP Growth (${data.gdp[0].year})`} value={data.gdp[0].value?.toFixed(1)} suffix="%" />}
          {data.cpi[0] && <StatValue label={`CPI Inflation (${data.cpi[0].year})`} value={data.cpi[0].value?.toFixed(1)} suffix="%" />}
          {data.debtToGdp[0] && <StatValue label={`Debt/GDP (${data.debtToGdp[0].year})`} value={data.debtToGdp[0].value?.toFixed(1)} suffix="%" />}
          {data.fdi[0] && <StatValue label={`FDI Inflows (${data.fdi[0].year})`} value={`$${(data.fdi[0].value / 1e9).toFixed(1)}B`} />}
        </>
      )}
    </Panel>
  );
}

// ─── Weather Panel ────────────────────────────────────────────
function WeatherPanel() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try { setWeather(await fetchWeather()); }
    catch { setError(true); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Panel title="City Weather" icon={ThermometerSun} badge="LIVE" badgeColor="live" loading={loading} error={error} onRefresh={load} span={2}>
      {weather && (
        <div className="grid grid-cols-2 gap-1">
          {weather.filter(w => !w.error).map((w, i) => (
            <div key={i} className="flex items-center justify-between px-2 py-1.5 bg-dark-900 rounded-none border border-dark-600/30">
              <div>
                <div className="text-[10px] text-gray-500 font-mono uppercase">{w.city}</div>
                <div className="text-[9px] text-gray-600 font-mono uppercase">{w.condition}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-semibold text-gray-200">{Math.round(w.temp)}°C</div>
                <div className="text-[9px] text-gray-600 font-mono">💧{w.humidity}%</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

// ─── Air Quality Panel ────────────────────────────────────────
function AirQualityPanel() {
  const [cities, setCities] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const aqiCities = [
        { name: 'Delhi', lat: 28.7041, lng: 77.1025 },
        { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
        { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
        { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
        { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
      ];
      
      // Use bulk request for AQI
      const lats = aqiCities.map(c => c.lat).join(',');
      const lngs = aqiCities.map(c => c.lng).join(',');
      const data = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lngs}&current=european_aqi`).then(res => res.json());
      
      const results = (Array.isArray(data) ? data : [data]).map((item, i) => {
        const aqi = item.current?.european_aqi || 50;
        const color = aqi <= 50 ? '#00e400' : aqi <= 100 ? '#92d050' : aqi <= 200 ? '#ff7e00' : '#ff0000';
        const category = aqi <= 50 ? 'Good' : aqi <= 100 ? 'Satisfactory' : aqi <= 200 ? 'Moderate' : 'Poor';
        return { city: aqiCities[i].name, aqi, category, color };
      });
      setCities(results);
    } catch {
      setCities([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Panel title="Air Quality" icon={Wind} badge="LIVE" badgeColor="live" loading={loading} onRefresh={load} span={2}>
      <div className="grid grid-cols-2 gap-1">
        {cities?.map((c, i) => (
          <div key={i} className="flex items-center justify-between px-2 py-1.5 bg-dark-900 rounded-none border border-dark-600/30">
            <div>
              <div className="text-[10px] text-gray-500 font-mono uppercase">{c.city}</div>
              <div className="text-[9px] text-gray-600 font-mono uppercase">{c.category}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono font-semibold" style={{ color: c.color }}>{c.aqi}</div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ─── Disasters Panel ──────────────────────────────────────────
function DisastersPanel() {
  const [quakes, setQuakes] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setQuakes(await fetchEarthquakes()); }
    catch { setQuakes([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Panel title="Earthquakes & Disasters" icon={AlertTriangle} badge={quakes?.length || '0'} badgeColor="warning" loading={loading} onRefresh={load}>
      {quakes?.length === 0 ? (
        <p className="text-[11px] text-gray-600 text-center py-4">No recent significant earthquakes</p>
      ) : (
        quakes?.slice(0, 6).map((q, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 border-b border-dark-500 last:border-0">
            <div>
              <div className="text-[10px] text-gray-400 truncate max-w-[180px]">{q.place}</div>
              <div className="text-[9px] text-gray-600">{new Date(q.time).toLocaleDateString('en-IN')}</div>
            </div>
            <div className={`text-sm font-mono font-bold ${q.magnitude >= 5 ? 'text-red-400' : q.magnitude >= 4 ? 'text-amber-400' : 'text-gray-400'}`}>
              M{q.magnitude?.toFixed(1)}
            </div>
          </div>
        ))
      )}
    </Panel>
  );
}

// ─── News Panel ───────────────────────────────────────────────
function NewsPanel() {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setNews(await fetchNews('general')); }
    catch { setNews([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Panel title="Live News" icon={Newspaper} badge="LIVE" badgeColor="live" loading={loading} onRefresh={load} span={2}>
      {news?.length === 0 ? (
        <p className="text-[11px] text-gray-600 text-center py-4">No recent updates</p>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-0">
          {news?.slice(0, 8).map((item, i) => (
            <NewsItem key={i} title={item.title} source={item.source} time={item.timeAgo} url={item.url} />
          ))}
        </div>
      )}
    </Panel>
  );
}

// ─── Politics Panel ───────────────────────────────────────────
function PoliticsPanel() {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setNews(await fetchNews('politics')); }
    catch { setNews([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Panel title="Politics & Gov" icon={Vote} loading={loading} onRefresh={load}>
      {news?.length === 0 ? (
        <p className="text-[11px] text-gray-600 text-center py-4">No recent updates</p>
      ) : (
        <div className="max-h-48 overflow-y-auto space-y-0">
          {news?.slice(0, 5).map((item, i) => (
            <NewsItem key={i} title={item.title} source={item.source} time={item.timeAgo} url={item.link} />
          ))}
        </div>
      )}
    </Panel>
  );
}

// ─── Security Panel ───────────────────────────────────────────
// ─── Security Panel ───────────────────────────────────────────
function SecurityPanel() {
  // Static representation to avoid non-existent APIs that require auth
  const data = {
    lwe: [
      { location: 'Bijapur, CG', type: 'Encounter', date: '4h ago', severity: 'high' },
      { location: 'Sukma, CG', type: 'IED recovery', date: '12h ago', severity: 'medium' },
      { location: 'Latehar, JH', type: 'Patrol', date: '2d ago', severity: 'low' },
    ],
    jk: [
      { location: 'Shopian, JK', type: 'Encounter', date: 'Live', severity: 'high' },
      { location: 'Rajouri, JK', type: 'Infiltration bid', date: '1d ago', severity: 'medium' },
    ]
  };
  const allEvents = [...data.lwe, ...data.jk];

  return (
    <Panel title="Security Events" icon={ShieldAlert} badge={`${allEvents.length}`} badgeColor="danger">
      {allEvents.map((e, i) => (
        <div key={i} className="flex items-center justify-between py-1.5 border-b border-dark-500 last:border-0">
          <div>
            <div className="text-[10px] text-gray-400">{e.location}</div>
            <div className="text-[9px] text-gray-600">{e.type} · {e.date}</div>
          </div>
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
            e.severity === 'high' ? 'bg-transparent text-red-400' :
            e.severity === 'medium' ? 'bg-transparent text-amber-400' :
            'bg-transparent text-green-400'
          }`}>
            {e.severity.toUpperCase()}
          </span>
        </div>
      ))}
    </Panel>
  );
}

// ─── Borders Panel ────────────────────────────────────────────
function BordersPanel() {
  return (
    <Panel title="Border Status" icon={Swords}>
      {BORDER_STATUS.map((b, i) => (
        <div key={i} className="flex items-center justify-between py-1.5 border-b border-dark-500 last:border-0">
          <div>
            <div className="text-[10px] text-gray-400">{b.region}</div>
            <div className="text-[9px] text-gray-600">Last: {b.lastIncident}</div>
          </div>
          <span className={`text-[9px] font-bold ${
            b.alert === 'RED' ? 'text-red-500' : b.alert === 'ORANGE' ? 'text-orange-500' : b.alert === 'YELLOW' ? 'text-amber-400' : 'text-green-500'
          }`}>{b.status}</span>
        </div>
      ))}
    </Panel>
  );
}

// ─── Cyber Security Panel ─────────────────────────────────────
function CyberSecurityPanel() {
  return (
    <Panel title="Cyber Threat Matrix" icon={ShieldCheck}>
      {CYBER_THREATS.map((t, i) => (
        <div key={i} className="flex items-center justify-between py-1.5 border-b border-dark-500 last:border-0">
          <div>
            <div className="text-[10px] text-gray-400">{t.sector}</div>
            <div className="text-[9px] text-gray-600">Threat Intel</div>
          </div>
          <div className="text-right">
            <span className={`text-[9px] font-bold block ${
              t.level === 'CRITICAL' ? 'text-red-500' : t.level === 'HIGH' ? 'text-orange-500' : t.level === 'ELEVATED' ? 'text-amber-400' : 'text-blue-400'
            }`}>{t.level}</span>
            <span className="text-[9px] text-gray-500 font-mono tracking-tighter text-right">{t.incidents} Incidents ({t.trend})</span>
          </div>
        </div>
      ))}
    </Panel>
  );
}

// ─── Water Reservoirs Panel ───────────────────────────────────
function ReservoirPanel() {
  return (
    <Panel title="Major Reservoirs" icon={Droplets}>
      {WATER_RESERVOIRS.map((r, i) => (
        <div key={i} className="flex items-center justify-between py-1.5 border-b border-dark-500 last:border-0">
          <div>
            <div className="text-[10px] text-gray-400 flex items-center gap-1">
              {r.name}
              {r.alert && <AlertTriangle size={8} className="text-red-500" />}
            </div>
            <div className="text-[9px] text-gray-600">{r.state}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-1.5 bg-dark-600 rounded overflow-hidden">
               <div className={`h-full ${parseInt(r.capacity) < 30 ? 'bg-red-500' : parseInt(r.capacity) < 60 ? 'bg-amber-400' : 'bg-blue-500'}`} style={{ width: r.capacity }} />
            </div>
            <span className="text-[10px] font-mono text-gray-300 w-6 text-right">{r.capacity}</span>
          </div>
        </div>
      ))}
    </Panel>
  );
}

// ─── Mandi Prices Panel ──────────────────────────────────────
function MandiPanel() {
  const prices = Object.entries(CROP_PRICES);
  return (
    <Panel title="National Mandi Rates" icon={Wheat} span={2}>
      <div className="max-h-48 overflow-y-auto">
        <table className="w-full">
          <thead>
            <tr className="text-[9px] text-gray-600 uppercase tracking-wider">
              <th className="text-left pb-1.5">Commodity</th>
              <th className="text-right pb-1.5">Price / Quintal</th>
              <th className="text-right pb-1.5">Chg</th>
            </tr>
          </thead>
          <tbody>
            {prices.map(([commodity, data], i) => (
              <tr key={i} className="border-t border-dark-500">
                <td className="text-[10px] text-gray-300 py-1">{commodity}</td>
                <td className="text-[10px] font-mono text-gray-300 text-right py-1">₹{data.price.toLocaleString()}</td>
                <td className={`text-[10px] font-mono text-right py-1 ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {data.change >= 0 ? '+' : ''}{data.change}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

// ─── Energy Panel ─────────────────────────────────────────────
function EnergyPanel() {
  const energy = getEnergyData();
  return (
    <Panel title="Power Generation" icon={Zap} badge={`${energy.gridFrequency} Hz`} badgeColor="info">
      <div className="space-y-1">
        {energy.powerMix.map((s, i) => (
          <MiniBar key={i} label={s.source} value={s.percentage} max={100} color={s.color} />
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-dark-500">
        <StatValue label="Total Capacity" value={`${energy.totalCapacity} GW`} small />
      </div>
    </Panel>
  );
}

// ─── Renewables Panel ─────────────────────────────────────────
function RenewablesPanel() {
  const energy = getEnergyData();
  const progress = (energy.renewableCurrent / energy.renewableTarget) * 100;
  
  return (
    <Panel title="Renewables 2030" icon={Heart}>
      <div className="text-center mb-3">
        <div className="text-2xl font-bold text-accent font-mono">{energy.renewableCurrent} GW</div>
        <div className="text-[10px] text-gray-500">of {energy.renewableTarget} GW target</div>
      </div>
      <div className="w-full h-3 bg-dark-600 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-green-500 to-accent rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
      </div>
      <div className="text-center mt-1.5">
        <span className="text-[11px] font-mono text-accent">{progress.toFixed(1)}%</span>
        <span className="text-[9px] text-gray-600 ml-1">achieved</span>
      </div>
    </Panel>
  );
}

// ─── Tech Panel ───────────────────────────────────────────────
function TechPanel() {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setNews(await fetchNews('tech')); }
    catch { setNews([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Panel title="Tech & Startups" icon={Cpu} loading={loading} onRefresh={load}>
      {news?.length === 0 ? (
        <p className="text-[11px] text-gray-600 text-center py-4">No recent updates</p>
      ) : (
        <div className="max-h-48 overflow-y-auto space-y-0">
          {news?.slice(0, 5).map((item, i) => (
            <NewsItem key={i} title={item.title} source={item.source} time={item.timeAgo} url={item.link} />
          ))}
        </div>
      )}
    </Panel>
  );
}

// ─── Unicorn Panel ────────────────────────────────────────────
function UnicornPanel() {
  return (
    <Panel title="Indian Unicorns" icon={CircuitBoard} badge={`${UNICORN_DATA.length}`} badgeColor="info">
      {UNICORN_DATA.slice(0, 6).map((u, i) => (
        <div key={i} className="flex items-center justify-between py-1.5 border-b border-dark-500 last:border-0">
          <div>
            <div className="text-[10px] text-gray-300">{u.name}</div>
            <div className="text-[9px] text-gray-600">{u.sector}</div>
          </div>
          <span className="text-[10px] font-mono text-accent">${u.valuation}B</span>
        </div>
      ))}
    </Panel>
  );
}

// ─── Trade Panel ──────────────────────────────────────────────
function TradePanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await fetchTradeData()); }
    catch { setData(null); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Panel title="Trade Balance" icon={Ship} loading={loading} onRefresh={load}>
      {data && (
        <>
          {data.exports?.slice(0, 3).map((d, i) => (
            <StatValue key={`e-${i}`} label={`Exports (${d.year})`} value={`$${(d.value / 1e9).toFixed(1)}B`} small />
          ))}
          {data.imports?.slice(0, 3).map((d, i) => (
            <StatValue key={`i-${i}`} label={`Imports (${d.year})`} value={`$${(d.value / 1e9).toFixed(1)}B`} small />
          ))}
        </>
      )}
    </Panel>
  );
}

// ─── Infrastructure Panel ─────────────────────────────────────
function InfraPanel() {
  return (
    <Panel title="Infrastructure" icon={Building2}>
      <StatValue label={`Highways Built (${INFRA_TARGETS.highways.fy})`} value={`${(INFRA_TARGETS.highways.built / 1000).toFixed(1)}K km`} small />
      <MiniBar label="Progress" value={INFRA_TARGETS.highways.built} max={INFRA_TARGETS.highways.target} color="#f59e0b" />
      <div className="mt-2 pt-2 border-t border-dark-500">
        <StatValue label="Railways Electrified" value={`${(INFRA_TARGETS.railways.electrified / 1000).toFixed(0)}K / ${(INFRA_TARGETS.railways.total / 1000).toFixed(0)}K km`} small />
        <StatValue label="Operational Airports" value={INFRA_TARGETS.airports.operational} small />
      </div>
    </Panel>
  );
}

// ─── GDELT Intel Panel ────────────────────────────────────────
function IntelPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await fetchGdeltIntel()); }
    catch { setData([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Panel title="Intelligence Feed" icon={Radio} badge="GDELT" badgeColor="info" loading={loading} onRefresh={load}>
      {data?.length === 0 ? (
        <p className="text-[11px] text-gray-600 text-center py-4">No recent intel</p>
      ) : (
        <div className="max-h-48 overflow-y-auto space-y-0">
          {data?.slice(0, 5).map((item, i) => (
            <NewsItem key={i} title={item.title} source={item.source} url={item.url} />
          ))}
        </div>
      )}
    </Panel>
  );
}

// ─── Elections Panel ──────────────────────────────────────────
function ElectionsPanel() {
  return (
    <Panel title="Elections" icon={Vote}>
      <div className="text-[9px] text-gray-600 uppercase tracking-wider mb-1.5">Upcoming</div>
      {ELECTION_DATA.upcoming.map((e, i) => (
        <div key={i} className="flex items-center justify-between py-1 border-b border-dark-500">
          <div className="text-[10px] text-gray-400">{e.state} — {e.type}</div>
          <span className="text-[9px] text-accent">{e.expected}</span>
        </div>
      ))}
      <div className="text-[9px] text-gray-600 uppercase tracking-wider mt-3 mb-1.5">Recent</div>
      {ELECTION_DATA.recent.map((e, i) => (
        <div key={i} className="flex items-center justify-between py-1 border-b border-dark-500">
          <div className="text-[10px] text-gray-400">{e.state} — {e.type}</div>
          <span className="text-[9px] text-gray-500">{e.winner} · {e.date}</span>
        </div>
      ))}
    </Panel>
  );
}
// ─── Dashboard Footer Panel ──────────────────────────────────
function SystemInfoPanel() {
  return (
    <Panel title="Signal Deck" icon={Cpu} badge="LIVE SURFACE" badgeColor="info" span={2}>
      <div className="grid gap-4 md:grid-cols-[1.3fr_0.9fr_0.8fr] items-stretch">
        <div className="rounded-sm border border-dark-500 bg-white/[0.02] p-4">
          <div className="text-[10px] text-gray-500 uppercase tracking-[0.35em] mb-3">Observe India</div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-semibold text-white">01</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-[0.3em]">Live civic signal layer</span>
          </div>
          <p className="text-[10px] leading-relaxed text-gray-500 max-w-md">
            A compact editorial surface for markets, weather, alerts, and live coverage. Built to stay readable, fast, and low-noise.
          </p>
        </div>

        <div className="rounded-sm border border-dark-500 bg-white/[0.02] p-4">
          <div className="text-[10px] text-gray-500 uppercase tracking-[0.35em] mb-3">Sources</div>
          <div className="grid grid-cols-2 gap-2">
            <StatValue label="Live Feeds" value="12" small />
            <StatValue label="Coverage" value="36 States" small />
            <StatValue label="Update Pace" value="Realtime" small />
            <StatValue label="Layout" value="Modular" small />
          </div>
        </div>

        <div className="rounded-sm border border-dark-500 bg-white/[0.02] p-4 flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] text-gray-500 uppercase tracking-[0.35em] mb-3">Release</div>
              <div className="flex items-center gap-1.5 px-2 py-1.5 border border-dark-500 text-[8px] font-mono text-gray-700 uppercase tracking-tighter w-fit">
                BUILD_2026.05.04_REL_A
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-500 uppercase tracking-[0.35em] mb-3">Collaboration</div>
              <a 
                href="https://what-s-happening-in-kerala.vercel.app/" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 px-2 py-1.5 border border-accent/40 hover:border-accent hover:bg-accent/5 transition-all text-[8px] font-mono tracking-widest text-accent uppercase cursor-pointer group ml-auto w-fit"
              >
                <span>Kerala Monitor</span>
                <ExternalLink size={8} />
              </a>
            </div>
          </div>

          <a 
            href="https://github.com/Aftab-S/India-Monitor" 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center justify-between gap-2 px-2.5 py-2 bg-white/5 border border-status-warning/20 hover:border-status-warning hover:text-status-warning transition-all text-[9px] font-mono tracking-widest text-gray-400 uppercase cursor-pointer group"
          >
            <span>Star on GitHub</span>
            <ExternalLink size={10} className="group-hover:text-status-warning" />
          </a>
          <div className="text-[9px] text-gray-600 uppercase tracking-[0.3em]">
            © 2026 Observe India
          </div>
        </div>
      </div>
    </Panel>
  );
}
