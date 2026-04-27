import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, MapPin, Thermometer, Wind, Droplets, Shield, Newspaper, Wheat, Activity, Building, Navigation } from 'lucide-react';
import Panel, { StatValue, NewsItem } from './Panel';
import { fetchStateWeather, fetchNews, fetchDistrictNews, fetchAirQuality, fetchWikipediaSummary, STATE_ECONOMY } from '../services/api';
import { REGION_COLORS, STATES } from '../data/constants';
import { STATE_DISTRICTS, DISTRICT_COORDS } from '../data/districts';

export default function StateDetailView({ state, onBack }) {
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  // Auto-select capital as first district
  useEffect(() => {
    setSelectedDistrict(state.capital);
  }, [state.capital]);

  const activeLocation = selectedDistrict || state.capital;
  const activeCoords = DISTRICT_COORDS[activeLocation] || { lat: state.lat, lng: state.lng };

  return (
    <div className="h-full w-full bg-dark-950 overflow-y-auto animate-fade-in text-gray-200">
      {/* State Header */}
      <div className="sticky top-0 z-20 bg-dark-800/95 backdrop-blur-sm border-b border-dark-500/30">
        <div className="px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-dark-700/50 hover:bg-dark-600/50 text-gray-400 hover:text-white transition-all cursor-pointer group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-[11px]">National</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: REGION_COLORS[state.region] || '#888' }} />
              <div>
                <h2 className="text-base font-semibold text-white leading-tight">{state.name}</h2>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                  <Navigation size={9} className="text-accent" />
                  <span className="text-accent font-medium">Monitoring: {activeLocation}</span>
                  <span className="mx-1 opacity-30">|</span>
                  <MapPin size={9} />
                  <span>{state.capital} (HQ)</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-[10px] text-gray-600 bg-dark-900/50 px-3 py-1.5 rounded-full border border-dark-500/20">
            <div className="flex items-center gap-1">
              <span className="text-gray-500 uppercase tracking-tighter">Lat:</span>
              <span className="font-mono text-gray-400">{activeCoords.lat.toFixed(4)}°</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500 uppercase tracking-tighter">Lng:</span>
              <span className="font-mono text-gray-400">{activeCoords.lng.toFixed(4)}°</span>
            </div>
            <div className="px-2 py-0.5 bg-accent/5 text-accent rounded-sm text-[9px] font-bold">STATE_{state.code}</div>
          </div>
        </div>
      </div>

      {/* State Panels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 p-1">
        <StateDistrictsPanel 
          state={state} 
          selectedDistrict={activeLocation} 
          onDistrictSelect={setSelectedDistrict} 
        />
        <IntelligenceBriefPanel district={activeLocation} state={state} />
        <StateWeatherPanel district={activeLocation} coords={activeCoords} />
        <StateEconomyPanel state={state} />
        <StateAirQualityPanel state={state} district={activeLocation} coords={activeCoords} />
        <StateNewsPanel state={state} district={activeLocation} />
        <StateAgriculturePanel state={state} district={activeLocation} />
        <StateSecurityPanel state={state} />
        <StateDemographicsPanel state={state} />
        <StateInfraPanel state={state} />
      </div>
    </div>
  );
}

// ─── State Districts Panel ────────────────────────────────────
function StateDistrictsPanel({ state, selectedDistrict, onDistrictSelect }) {
  const districts = STATE_DISTRICTS[state.code] || [];
  
  return (
    <Panel title="Region Monitoring Units" icon={Building} badge={`${districts.length} Units`} badgeColor="info" span={2}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
        {districts.map((district, i) => (
          <button 
            key={i} 
            onClick={() => onDistrictSelect(district)}
            className={`flex flex-col items-center justify-center p-2 rounded border transition-all cursor-pointer group ${
              selectedDistrict === district 
                ? "bg-accent/10 border-accent/50 shadow-[0_0_10px_rgba(0,255,136,0.1)]" 
                : "bg-dark-700/30 border-dark-600/20 hover:border-accent/30 hover:bg-dark-700/50"
            }`}
          >
            <div className={`text-[10px] font-semibold text-center transition-colors ${
              selectedDistrict === district ? "text-accent" : "text-gray-400 group-hover:text-gray-200"
            }`}>
              {district}
            </div>
            <div className="text-[8px] text-gray-600 mt-1 uppercase tracking-tighter">Dist. Code {state.code}-{i+1}</div>
          </button>
        ))}
        {districts.length === 0 && (
          <div className="col-span-full py-6 text-center text-[10px] text-gray-600 italic">
            District monitoring node offline or restricted in this territory.
          </div>
        )}
      </div>
    </Panel>
  );
}

// ─── State Weather Panel ──────────────────────────────────────
function StateWeatherPanel({ district, coords }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await fetchStateWeather(coords.lat, coords.lng)); }
    catch { setData(null); }
    setLoading(false);
  }, [coords.lat, coords.lng]);

  useEffect(() => { load(); }, [load]);

  return (
    <Panel title={`Atmospheric Stn: ${district}`} icon={Thermometer} badge="LIVE FEED" badgeColor="live" loading={loading} onRefresh={load}>
      {data?.current && (
        <>
          <div className="text-center mb-3">
            <div className="text-3xl font-bold text-white font-mono">{data.current.temp}°C</div>
            <div className="text-[11px] text-gray-400">{data.current.condition}</div>
            <div className="text-[10px] text-gray-600">Feels like {data.current.feelsLike}°C</div>
          </div>
          <div className="flex justify-around">
            <div className="text-center">
              <Droplets size={12} className="text-blue-400 mx-auto mb-1" />
              <div className="text-[10px] text-gray-400">{data.current.humidity}%</div>
              <div className="text-[9px] text-gray-600">Humidity</div>
            </div>
            <div className="text-center">
              <Wind size={12} className="text-cyan-400 mx-auto mb-1" />
              <div className="text-[10px] text-gray-400">{data.current.windSpeed} km/h</div>
              <div className="text-[9px] text-gray-600">Wind</div>
            </div>
          </div>
          {data.forecast?.length > 0 && (
            <div className="mt-3 pt-2 border-t border-dark-600/20">
              <div className="text-[9px] text-gray-600 uppercase tracking-wider mb-1.5">5-Day Forecast</div>
              <div className="grid grid-cols-5 gap-1">
                {data.forecast.map((f, i) => (
                  <div key={i} className="text-center py-1 bg-dark-700/30 rounded">
                    <div className="text-[9px] text-gray-500">{new Date(f.date).toLocaleDateString('en-IN', { weekday: 'short' })}</div>
                    <div className="text-[10px] font-mono text-gray-300">{f.maxTemp}°</div>
                    <div className="text-[9px] font-mono text-gray-600">{f.minTemp}°</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Panel>
  );
}

// ─── Intelligence Brief Panel ──────────────────────────────────
function IntelligenceBriefPanel({ district, state }) {
  const [intel, setIntel] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    // Determine query: If district is capital, might just query city, else query "District, State"
    const query = district === state.capital ? district : `${district} district, ${state.name}`;
    const data = await fetchWikipediaSummary(query);
    setIntel(data);
    setLoading(false);
  }, [district, state.name, state.capital]);

  useEffect(() => { load(); }, [load]);

  return (
    <Panel title={`Intelligence Brief: ${district}`} icon={Shield} loading={loading} span={2}>
      {intel ? (
        <div className="flex gap-4">
          {intel.thumbnail && (
            <img src={intel.thumbnail} alt={district} className="w-24 h-24 object-cover rounded border border-dark-600/30 opacity-80" />
          )}
          <div className="flex-1">
            <h4 className="text-xs font-semibold text-gray-200 mb-1">{intel.title}</h4>
            <p className="text-[10px] text-gray-400 leading-relaxed max-h-24 overflow-y-auto pr-1">
              {intel.extract}
            </p>
            <div className="mt-2 text-right">
              <a href={intel.url} target="_blank" rel="noreferrer" className="text-[9px] text-accent hover:underline">
                View Full Dossier →
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-[10px] text-gray-500 italic">
          No official briefing available for this monitoring node.
        </div>
      )}
    </Panel>
  );
}

// ─── State Economy Panel ──────────────────────────────────────
function StateEconomyPanel({ state }) {
  const econ = STATE_ECONOMY[state.code] || { gsdp: 'N/A', growth: 0.0, perCapita: 'N/A', industries: ['Agriculture', 'Services'] };

  return (
    <Panel title="State Economy" icon={Activity}>
      <StatValue label="GSDP" value={econ.gsdp} />
      <StatValue label="Growth Rate" value={econ.growth} suffix="%" />
      <StatValue label="Per Capita Income" value={econ.perCapita} />
      <div className="mt-2 pt-2 border-t border-dark-600/20">
        <div className="text-[9px] text-gray-600 uppercase tracking-wider mb-1">Key Industries</div>
        <div className="flex flex-wrap gap-1">
          {econ.industries.map((ind, i) => (
            <span key={i} className="text-[9px] px-2 py-0.5 bg-dark-600/40 rounded-full text-gray-400">{ind}</span>
          ))}
        </div>
      </div>
    </Panel>
  );
}

// ─── State Air Quality Panel ──────────────────────────────────
function StateAirQualityPanel({ state, district, coords }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setData(await fetchAirQuality(coords.lat, coords.lng)); }
    catch { setData({ aqi: 0, pm25: 0, pm10: 0 }); }
    setLoading(false);
  }, [coords.lat, coords.lng]);

  useEffect(() => { load(); }, [load]);

  const aqiColor = data?.aqi <= 50 ? '#00e400' : data?.aqi <= 100 ? '#92d050' : data?.aqi <= 200 ? '#ff7e00' : '#ff0000';
  const aqiCat = data?.aqi <= 50 ? 'Good' : data?.aqi <= 100 ? 'Satisfactory' : data?.aqi <= 200 ? 'Moderate' : 'Poor';

  return (
    <Panel title={`Air Quality: ${district}`} icon={Wind} loading={loading} onRefresh={load}>
      {data && (
        <>
          <div className="flex items-center justify-between py-2 border-b border-dark-600/20">
            <span className="text-[10px] text-gray-400">European AQI</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-bold" style={{ color: aqiColor }}>{data.aqi}</span>
              <span className="text-[9px] text-gray-500">{aqiCat}</span>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-dark-600/20">
            <span className="text-[10px] text-gray-400">PM 2.5</span>
            <span className="text-xs font-mono text-gray-300">{data.pm25} <span className="text-[9px] text-gray-600">µg/m³</span></span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-[10px] text-gray-400">PM 10</span>
            <span className="text-xs font-mono text-gray-300">{data.pm10} <span className="text-[9px] text-gray-600">µg/m³</span></span>
          </div>
        </>
      )}
    </Panel>
  );
}

// ─── State News Panel ─────────────────────────────────────────
function StateNewsPanel({ state, district }) {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchDistrictNews(district);
      setNews(data);
    } catch {
      setNews([]);
    }
    setLoading(false);
  }, [district]);

  useEffect(() => { load(); }, [load]);

  return (
    <Panel title={`News Feed: ${district}`} icon={Newspaper} loading={loading} onRefresh={load}>
      {news?.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-[10px] text-gray-600 italic">No specific news detected for {district} in the last 24h.</p>
          <p className="text-[9px] text-gray-700 mt-1 uppercase tracking-tighter">Monitoring National Feeds Instead</p>
        </div>
      ) : (
        <div className="max-h-68 overflow-y-auto pr-1">
          {news?.map((item, i) => (
            <NewsItem key={i} title={item.title} source={item.source} time={item.timeAgo} url={item.url} />
          ))}
        </div>
      )}
    </Panel>
  );
}

// ─── State Agriculture Panel ──────────────────────────────────
function StateAgriculturePanel({ state, district }) {
  const crops = {
    PB: ['Wheat', 'Rice', 'Cotton'], HR: ['Wheat', 'Mustard', 'Bajra'],
    UP: ['Sugarcane', 'Wheat', 'Rice'], MP: ['Soybean', 'Wheat', 'Pulses'],
    MH: ['Sugarcane', 'Cotton', 'Onion'], KA: ['Coffee', 'Rice', 'Ragi'],
    AP: ['Rice', 'Chilli', 'Cotton'], WB: ['Rice', 'Jute', 'Tea'],
    RJ: ['Mustard', 'Bajra', 'Wheat'], GJ: ['Cotton', 'Groundnut', 'Castor'],
  };

  const stateCrops = crops[state.code] || ['Rice', 'Wheat'];

  return (
    <Panel title={`Agri-Monitor: ${district}`} icon={Wheat}>
      <div className="text-[9px] text-gray-600 uppercase tracking-wider mb-2">Primary Crops - {state.name}</div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {stateCrops.map((crop, i) => (
          <span key={i} className="text-[10px] px-2.5 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
            {crop}
          </span>
        ))}
      </div>
      <div className="text-[9px] text-gray-600 uppercase tracking-wider mb-1.5">{district} Market Rates</div>
      <StatValue label="Wheat" value="2,275" prefix="₹" small />
      <StatValue label="Rice" value="2,300" prefix="₹" small />
    </Panel>
  );
}

// ─── State Security Panel ─────────────────────────────────────
function StateSecurityPanel({ state }) {
  const safeStates = ['KL', 'SK', 'MZ', 'GA', 'HP', 'PY', 'LD', 'AN', 'CH', 'DD'];
  const isSafe = safeStates.includes(state.code);

  return (
    <Panel title="Security Status" icon={Shield}>
      {isSafe ? (
        <div className="text-center py-4">
          <div className="text-green-400 text-sm font-semibold mb-1">Stable</div>
          <p className="text-[10px] text-gray-500">No recent security incidents reported</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-[10px] text-gray-500">Security Level</span>
            <span className="text-[10px] font-semibold text-amber-400">Monitored</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-[10px] text-gray-500">Recent Events</span>
            <span className="text-[10px] text-gray-400">Low activity</span>
          </div>
          <p className="text-[9px] text-gray-600 mt-2">Routine security operations. No elevated threat level.</p>
        </>
      )}
    </Panel>
  );
}

// ─── Demographics Panel ───────────────────────────────────────
function StateDemographicsPanel({ state }) {
  const popData = {
    MH: '12.5 Cr', UP: '24.1 Cr', BR: '12.4 Cr', WB: '10.1 Cr', MP: '8.5 Cr',
    TN: '7.7 Cr', RJ: '8.1 Cr', KA: '6.7 Cr', GJ: '7.0 Cr', AP: '5.3 Cr',
    TS: '3.9 Cr', KL: '3.5 Cr', DL: '2.0 Cr', PB: '3.0 Cr', HR: '2.8 Cr',
  };
  const litData = {
    KL: '96.2%', MZ: '91.6%', GA: '88.7%', HP: '83.8%', TN: '80.3%',
    MH: '82.3%', DL: '86.2%', KA: '75.4%', GJ: '78.0%', WB: '76.3%',
  };

  return (
    <Panel title="Demographics" icon={Activity}>
      <StatValue label="Population (est.)" value={popData[state.code] || 'N/A'} small />
      <StatValue label="Literacy" value={litData[state.code] || 'N/A'} small />
      <StatValue label="Region" value={state.region} small />
      <StatValue label="Status" value={state.type} small />
    </Panel>
  );
}

// ─── State Infra Panel ────────────────────────────────────────
function StateInfraPanel({ state }) {
  return (
    <Panel title="Infrastructure" icon={Activity}>
      <div className="text-center py-3">
        <div className="text-[11px] text-gray-500">
          Infrastructure data for <span className="text-gray-300">{state.name}</span>
        </div>
        <p className="text-[10px] text-gray-600 mt-1.5">
          Road networks, power connectivity, digital infrastructure metrics available via state government portals.
        </p>
      </div>
    </Panel>
  );
}
