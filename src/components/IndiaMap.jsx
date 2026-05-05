import { useRef, useEffect, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { STATES, REGION_COLORS } from '../data/constants';
import { Layers, MapPin } from 'lucide-react';

const INDIA_GEOJSON_URL = 'https://raw.githubusercontent.com/datta07/INDIAN-SHAPEFILES/master/INDIA/INDIA_STATES.geojson';
const INDIA_GEOJSON_FALLBACK = 'https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson';

// Map state codes from various GeoJSON sources to our codes
const STATE_NAME_TO_CODE = {};
STATES.forEach(s => {
  STATE_NAME_TO_CODE[s.name.toLowerCase()] = s.code;
  STATE_NAME_TO_CODE[s.name.toLowerCase().replace(/ and /g, ' & ')] = s.code;
  STATE_NAME_TO_CODE[s.name.toLowerCase().replace(/&/g, 'and')] = s.code;
});

// Additional common name mappings
const EXTRA_MAPPINGS = {
  'andaman & nicobar islands': 'AN', 'andaman & nicobar': 'AN', 'a&n islands': 'AN',
  'andhra pradesh': 'AP', 'arunachal pradesh': 'AR', 'assam': 'AS',
  'bihar': 'BR', 'chandigarh': 'CH', 'chhattisgarh': 'CT', 'chattisgarh': 'CT',
  'dadra & nagar haveli': 'DD', 'daman & diu': 'DD', 'dadra and nagar haveli and daman and diu': 'DD',
  'dadra & nagar haveli and daman & diu': 'DD',
  'delhi': 'DL', 'nct of delhi': 'DL', 'goa': 'GA', 'gujarat': 'GJ',
  'haryana': 'HR', 'himachal pradesh': 'HP', 'jammu & kashmir': 'JK',
  'jammu and kashmir': 'JK', 'jharkhand': 'JH', 'karnataka': 'KA',
  'kerala': 'KL', 'ladakh': 'LA', 'lakshadweep': 'LD', 'madhya pradesh': 'MP',
  'maharashtra': 'MH', 'manipur': 'MN', 'meghalaya': 'ML', 'mizoram': 'MZ',
  'nagaland': 'NL', 'odisha': 'OR', 'orissa': 'OR', 'puducherry': 'PY', 'punjab': 'PB',
  'rajasthan': 'RJ', 'sikkim': 'SK', 'tamil nadu': 'TN', 'telangana': 'TS',
  'tripura': 'TR', 'uttar pradesh': 'UP', 'uttarakhand': 'UK', 'uttaranchal': 'UK', 'west bengal': 'WB'
};

function getStateCode(name) {
  if (!name) return null;
  const normalized = name.toLowerCase().trim();
  if (EXTRA_MAPPINGS[normalized]) return EXTRA_MAPPINGS[normalized];
  return STATE_NAME_TO_CODE[normalized] || null;
}

export default function IndiaMap({ 
  onStateSelect, 
  selectedState, 
  isPanelMode = false 
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredState, setHoveredState] = useState(null);


  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {},
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#080808' }
          }
        ]
      },
      center: [78.9629, 22.5937],
      zoom: 3.8,
      attributionControl: false,
      scrollZoom: true,
      dragPan: true,
    });

    mapRef.current = map;

    map.on('load', async () => {
      try {
        let response = await fetch(INDIA_GEOJSON_URL);
        let data;
        
        if (response.ok) {
          data = await response.json();
        }

        // Fallback if primary fails or returns invalid data
        if (!data || !data.features) {
          console.warn('Primary GeoJSON failed, trying fallback...');
          const fallbackRes = await fetch(INDIA_GEOJSON_FALLBACK);
          if (fallbackRes.ok) {
            data = await fallbackRes.json();
          }
        }

        if (!data || !data.features) {
          throw new Error('Could not load map data from any source');
        }

        // Add state codes and colors to features
        data.features = data.features.map((feature, index) => {
          const rawName = feature.properties.STNAME || feature.properties.ST_NM || feature.properties.NAME_1 || feature.properties.name;
          const name = rawName
            ? rawName.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
            : rawName;
          const code = getStateCode(name);
          const stateInfo = STATES.find(s => s.code === code);
          const color = stateInfo ? REGION_COLORS[stateInfo.region] : '#333';
          
          // Use a numeric ID for better feature-state compatibility
          const numericId = code ? (code.charCodeAt(0) * 100 + code.charCodeAt(1)) : (index + 1000);

          return {
            ...feature,
            id: numericId,
            properties: {
              ...feature.properties,
              code,
              name,
              capital: stateInfo?.capital || 'N/A',
              fillColor: color,
              region: stateInfo?.region || 'Unknown'
            }
          };
        });

        // Add Sources
        map.addSource('india-states', { type: 'geojson', data });

        // Add Tech Grid Source (Subtle Dot Matrix)
        const gridFeatures = [];
        for (let lng = 68; lng <= 98; lng += 2) {
          gridFeatures.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[lng, 8], [lng, 38]] } });
        }
        for (let lat = 8; lat <= 38; lat += 2) {
          gridFeatures.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[68, lat], [98, lat]] } });
        }
        
        map.addSource('tech-grid', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: gridFeatures }
        });

        map.addLayer({
          id: 'tech-grid',
          type: 'line',
          source: 'tech-grid',
          layout: {
            visibility: 'visible'
          },
          paint: {
            'line-color': '#2a2a2a',
            'line-width': 0.5,
            'line-dasharray': [2, 6],
          }
        });

        // ── State base fill ────────────────────────────
        map.addLayer({
          id: 'state-fill-base',
          type: 'fill',
          source: 'india-states',
          paint: {
            'fill-color': ['get', 'fillColor'],
            'fill-opacity': 0.75,
          }
        });

        // ── Glow effect on hover ────────────────────────
        map.addLayer({
          id: 'state-glow',
          type: 'fill',
          source: 'india-states',
          paint: {
            'fill-color': '#ff0033',
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.25,
              0
            ]
          }
        });

        // ── State borders ──────────────────────────────
        map.addLayer({
          id: 'state-borders',
          type: 'line',
          source: 'india-states',
          paint: {
            'line-color': '#2a2a2a',
            'line-width': 1,
            'line-opacity': 0.8
          }
        });

        // ── Border highlight on hover ──────────────────
        map.addLayer({
          id: 'state-border-highlight',
          type: 'line',
          source: 'india-states',
          paint: {
            'line-color': '#ff0033',
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              3,
              0
            ],
            'line-opacity': 1,
            'line-blur': 0.5
          }
        });

        // ── Interaction Logic ───────────────────────────
        let hoveredId = null;

        map.on('mousemove', 'state-fill-base', (e) => {
          if (e.features.length > 0) {
            if (hoveredId !== null) {
              map.setFeatureState({ source: 'india-states', id: hoveredId }, { hover: false });
            }
            hoveredId = e.features[0].id;
            map.setFeatureState({ source: 'india-states', id: hoveredId }, { hover: true });
            
            const props = e.features[0].properties;
            setHoveredState({
              name: props.name,
              code: props.code,
              capital: props.capital,
              region: props.region,
              color: props.fillColor
            });
            
            map.getCanvas().style.cursor = 'pointer';
          }
        });

        map.on('mouseleave', 'state-fill-base', () => {
          if (hoveredId !== null) {
            map.setFeatureState({ source: 'india-states', id: hoveredId }, { hover: false });
          }
          hoveredId = null;
          setHoveredState(null);
          map.getCanvas().style.cursor = '';
        });

        map.on('click', 'state-fill-base', (e) => {
          const props = e.features[0].properties;
          if (props.code) {
            const stateObj = STATES.find(s => s.code === props.code);
            if (stateObj) onStateSelect(stateObj);
          }
        });

      } catch (err) {
        console.error('Error during map initialization:', err);
      } finally {
        setMapLoaded(true);
      }
    });

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [onStateSelect]);

  return (
    <div className={`relative w-full overflow-hidden bg-black transition-all duration-300 ${isPanelMode ? 'h-full' : 'h-[45vh] min-h-[280px]'}`}>
      
      {/* ── Glassmorphic floating info bar ────────────────────────────── */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-none pointer-events-auto">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-mono tracking-[2px] text-gray-300 uppercase">
            {isPanelMode ? 'GEOINT FEED' : 'National Overview'}
          </span>
          {hoveredState && (
            <>
              <span className="text-[9px] text-gray-600">·</span>
              <div className="flex items-center gap-1.5 animate-fade-in">
                <div className="w-1.5 h-1.5 rounded-none" style={{ backgroundColor: hoveredState.color }} />
                <span className="text-[10px] font-mono text-white uppercase tracking-widest">{hoveredState.name}</span>
                <span className="text-[9px] text-gray-600">·</span>
                <span className="text-[9px] font-mono text-gray-400 tracking-widest uppercase">HQ: {hoveredState.capital}</span>
                <span className="text-[9px] text-gray-600">·</span>
                <span className="text-[9px] font-mono text-accent tracking-widest">{hoveredState.region}</span>
              </div>
            </>
          )}
        </div>

      </div>

      {/* ── Map container ────────────────────────────────────────────── */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[300px]" />

      {/* ── Glassmorphic vignette overlay ────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 65%, rgba(0,0,0,0.5) 100%)',
        }} />

      {/* ── Loading overlay ───────────────────────────────────────────── */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 border border-accent/20 rounded-full" />
              <div className="absolute inset-0 border border-transparent border-t-accent rounded-full animate-spin" />
              <div className="absolute inset-[5px] border border-accent/10 rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin size={14} className="text-accent" />
              </div>
            </div>
            <span className="text-[9px] font-mono tracking-[4px] text-gray-600 uppercase">Rendering Map Data</span>
          </div>
        </div>
      )}

      {/* ── Region legend (glassmorphic pill) ────────────────────────── */}
      {mapLoaded && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10">
          {Object.entries(REGION_COLORS).map(([region, color]) => (
            <div key={region} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-none flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[8px] font-mono tracking-widest text-gray-500 uppercase">{region}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Bottom border / divider (map → panels) ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none h-[2px]"
        style={{ background: 'linear-gradient(to right, transparent, rgba(255,0,51,0.5) 20%, rgba(255,0,51,0.5) 80%, transparent)' }} />
    </div>
  );
}
