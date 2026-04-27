import { useRef, useEffect, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import { STATES, REGION_COLORS } from '../data/constants';
import { Layers, ZoomIn, ZoomOut } from 'lucide-react';

const INDIA_GEOJSON_URL = 'https://raw.githubusercontent.com/civictech-India/INDIA-GEO-JSON-Datasets/master/india_states.json';
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
  'dadra & nagar haveli and daman & diu': 'DD', 'dnhdd': 'DD',
  'delhi': 'DL', 'nct of delhi': 'DL', 'goa': 'GA', 'gujarat': 'GJ',
  'haryana': 'HR', 'himachal pradesh': 'HP', 'jammu & kashmir': 'JK',
  'jammu and kashmir': 'JK', 'jharkhand': 'JH', 'karnataka': 'KA',
  'kerala': 'KL', 'ladakh': 'LA', 'lakshadweep': 'LD',
  'madhya pradesh': 'MP', 'maharashtra': 'MH', 'manipur': 'MN',
  'meghalaya': 'ML', 'mizoram': 'MZ', 'nagaland': 'NL',
  'odisha': 'OR', 'orissa': 'OR', 'puducherry': 'PY', 'pondicherry': 'PY',
  'punjab': 'PB', 'rajasthan': 'RJ', 'sikkim': 'SK',
  'tamil nadu': 'TN', 'telangana': 'TS', 'tripura': 'TR',
  'uttar pradesh': 'UP', 'uttarakhand': 'UK', 'uttaranchal': 'UK',
  'west bengal': 'WB',
};

Object.assign(STATE_NAME_TO_CODE, EXTRA_MAPPINGS);

function getStateCode(props) {
  const name = (props.NAME_1 || props.name || props.st_nm || props.state || '').toLowerCase().trim();
  return STATE_NAME_TO_CODE[name] || null;
}

export default function IndiaMap({ onStateSelect, selectedState }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {},
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#060d0a' }
          }
        ],
        glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf'
      },
      center: [82.5, 22.5],
      zoom: 4.2,
      minZoom: 3,
      maxZoom: 8,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
    });

    mapRef.current = map;

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    map.on('load', async () => {
      try {
        // Try primary GeoJSON source, fallback to alternative
        let geojson = null;
        for (const url of [INDIA_GEOJSON_URL, INDIA_GEOJSON_FALLBACK]) {
          try {
            const res = await fetch(url);
            if (res.ok) {
              geojson = await res.json();
              break;
            }
          } catch (e) {
            console.warn(`Failed to fetch GeoJSON from ${url}:`, e);
          }
        }

        if (!geojson) {
          console.error('Failed to load India GeoJSON');
          setMapLoaded(true);
          return;
        }

        // Enrich features with state codes and region colors
        geojson.features = geojson.features.map(f => {
          const code = getStateCode(f.properties);
          const stateData = code ? STATES.find(s => s.code === code) : null;
          return {
            ...f,
            properties: {
              ...f.properties,
              stateCode: code || 'XX',
              stateName: stateData?.name || f.properties.NAME_1 || f.properties.name || f.properties.st_nm || 'Unknown',
              capital: stateData?.capital || '',
              region: stateData?.region || 'Unknown',
              fillColor: stateData ? (REGION_COLORS[stateData.region] || '#1a3a2a') : '#1a3a2a',
            }
          };
        });

        map.addSource('india-states', {
          type: 'geojson',
          data: geojson,
        });

        // State fill layer
        map.addLayer({
          id: 'state-fill',
          type: 'fill',
          source: 'india-states',
          paint: {
            'fill-color': ['get', 'fillColor'],
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.55,
              0.25,
            ],
          },
        });

        // State border layer
        map.addLayer({
          id: 'state-border',
          type: 'line',
          source: 'india-states',
          paint: {
            'line-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              '#00ff88',
              'rgba(0, 255, 136, 0.2)',
            ],
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              2,
              0.8,
            ],
          },
        });

        // State labels
        map.addLayer({
          id: 'state-labels',
          type: 'symbol',
          source: 'india-states',
          layout: {
            'text-field': ['get', 'stateCode'],
            'text-size': 10,
            'text-font': ['Noto Sans Regular'],
            'text-allow-overlap': false,
            'text-ignore-placement': false,
          },
          paint: {
            'text-color': 'rgba(255,255,255,0.5)',
            'text-halo-color': 'rgba(0,0,0,0.7)',
            'text-halo-width': 1,
          },
          minzoom: 4.5,
        });

        // Hover interactions
        let hoveredId = null;

        map.on('mousemove', 'state-fill', (e) => {
          if (e.features.length === 0) return;
          
          map.getCanvas().style.cursor = 'pointer';
          
          if (hoveredId !== null) {
            map.setFeatureState({ source: 'india-states', id: hoveredId }, { hover: false });
          }
          
          hoveredId = e.features[0].id;
          map.setFeatureState({ source: 'india-states', id: hoveredId }, { hover: true });

          const props = e.features[0].properties;
          const html = `
            <div class="text-center">
              <div class="font-semibold text-white text-sm mb-1">${props.stateName}</div>
              ${props.capital ? `<div class="text-gray-400 text-xs">Capital: ${props.capital}</div>` : ''}
              <div class="text-xs mt-1" style="color: ${props.fillColor}">${props.region}</div>
              <div class="text-[10px] text-gray-500 mt-1.5">Click to explore →</div>
            </div>
          `;

          if (!popupRef.current) {
            popupRef.current = new maplibregl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 15,
            });
          }

          popupRef.current.setLngLat(e.lngLat).setHTML(html).addTo(map);
        });

        map.on('mouseleave', 'state-fill', () => {
          map.getCanvas().style.cursor = '';
          if (hoveredId !== null) {
            map.setFeatureState({ source: 'india-states', id: hoveredId }, { hover: false });
          }
          hoveredId = null;
          popupRef.current?.remove();
        });

        // Click to select state
        map.on('click', 'state-fill', (e) => {
          if (e.features.length === 0) return;
          const code = e.features[0].properties.stateCode;
          const state = STATES.find(s => s.code === code);
          if (state) {
            onStateSelect(state);
          }
        });

        // Add grid lines for futuristic look
        map.addSource('grid-meridians', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: Array.from({ length: 8 }, (_, i) => ({
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: [[65 + i * 5, 5], [65 + i * 5, 40]],
              },
            })),
          },
        });

        map.addSource('grid-parallels', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: Array.from({ length: 8 }, (_, i) => ({
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: [[65, 5 + i * 5], [100, 5 + i * 5]],
              },
            })),
          },
        });

        // Grid must be under state fill
        map.addLayer({
          id: 'grid-meridians',
          type: 'line',
          source: 'grid-meridians',
          paint: { 'line-color': 'rgba(0, 255, 136, 0.04)', 'line-width': 0.5 },
        }, 'state-fill');

        map.addLayer({
          id: 'grid-parallels',
          type: 'line',
          source: 'grid-parallels',
          paint: { 'line-color': 'rgba(0, 255, 136, 0.04)', 'line-width': 0.5 },
        }, 'state-fill');

        // Assign feature IDs for hover state
        const src = map.getSource('india-states');
        if (src && src._data && src._data.features) {
          src._data.features.forEach((f, i) => { f.id = i; });
          src.setData(src._data);
        }
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
    <div className="relative w-full h-full bg-[#060d0a]">
      {/* Map title bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-2 bg-dark-800/80 backdrop-blur-sm border-b border-dark-500/30">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold tracking-[2px] text-gray-400 uppercase">National Overview</span>
          <span className="text-[9px] text-gray-600">·</span>
          <span className="text-[9px] text-gray-600">36 States & UTs</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[9px] text-gray-600">
            <Layers size={10} />
            <span>LAYERS</span>
          </div>
        </div>
      </div>

      {/* Map container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#060d0a]/90 z-20">
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-2 border-accent/20 rounded-full" />
              <div className="absolute inset-0 border-2 border-transparent border-t-accent rounded-full animate-spin" />
              <div className="absolute inset-2 border border-accent/10 rounded-full" />
            </div>
            <span className="text-[10px] tracking-[3px] text-gray-500 uppercase">Loading Map</span>
          </div>
        </div>
      )}

      {/* Legend */}
      {mapLoaded && (
        <div className="absolute bottom-8 left-3 z-10 flex flex-wrap gap-x-3 gap-y-1 px-3 py-2 bg-dark-800/80 backdrop-blur-sm rounded-lg border border-dark-500/30">
          {Object.entries(REGION_COLORS).map(([region, color]) => (
            <div key={region} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, opacity: 0.7 }} />
              <span className="text-[9px] text-gray-500">{region}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
