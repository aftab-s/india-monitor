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
            paint: { 'background-color': '#000000' }
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

        // State fill layer — extremely subtle, near-invisible fill
        map.addLayer({
          id: 'state-fill',
          type: 'fill',
          source: 'india-states',
          paint: {
            'fill-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              '#ffffff',
              '#111111',
            ],
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.08,
              0.4,
            ],
          },
        });

        // State border layer — crisp white wireframe lines
        map.addLayer({
          id: 'state-border',
          type: 'line',
          source: 'india-states',
          paint: {
            'line-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              '#ffffff',
              '#333333',
            ],
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              1.5,
              0.6,
            ],
            'line-dasharray': [3, 2],
          },
        });

        // State labels
        map.addLayer({
          id: 'state-labels',
          type: 'symbol',
          source: 'india-states',
          layout: {
            'text-field': ['get', 'stateCode'],
            'text-size': 9,
            'text-font': ['Noto Sans Regular'],
            'text-allow-overlap': false,
            'text-ignore-placement': false,
          },
          paint: {
            'text-color': '#555555',
            'text-halo-color': '#000000',
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

        // Add dense grid lines for technical look
        const gridFeatures = [];
        for (let lng = 60; lng <= 100; lng += 2.5) {
          gridFeatures.push({
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: [[lng, 5], [lng, 40]] }
          });
        }
        for (let lat = 5; lat <= 40; lat += 2.5) {
          gridFeatures.push({
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: [[60, lat], [105, lat]] }
          });
        }

        map.addSource('tech-grid', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: gridFeatures }
        });

        map.addLayer({
          id: 'tech-grid',
          type: 'line',
          source: 'tech-grid',
          paint: {
            'line-color': '#1a1a1a',
            'line-width': 0.5,
            'line-dasharray': [1, 4],
          }
        }, 'state-fill');

        // Major city nodes
        map.addSource('city-nodes', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              { type: 'Feature', geometry: { type: 'Point', coordinates: [77.1025, 28.7041] }, properties: { name: 'DELHI' } },
              { type: 'Feature', geometry: { type: 'Point', coordinates: [72.8777, 19.0760] }, properties: { name: 'MUMBAI' } },
              { type: 'Feature', geometry: { type: 'Point', coordinates: [77.5946, 12.9716] }, properties: { name: 'BENGALURU' } },
              { type: 'Feature', geometry: { type: 'Point', coordinates: [88.3639, 22.5726] }, properties: { name: 'KOLKATA' } },
              { type: 'Feature', geometry: { type: 'Point', coordinates: [80.2707, 13.0827] }, properties: { name: 'CHENNAI' } },
            ]
          }
        });

        map.addLayer({
          id: 'city-nodes',
          type: 'circle',
          source: 'city-nodes',
          paint: {
            'circle-radius': 3,
            'circle-color': '#ffffff',
            'circle-stroke-width': 2,
            'circle-stroke-color': 'rgba(255,255,255,0.1)',
          }
        });

        map.addLayer({
          id: 'city-labels',
          type: 'symbol',
          source: 'city-nodes',
          layout: {
            'text-field': ['get', 'name'],
            'text-font': ['Noto Sans Regular'],
            'text-size': 8,
            'text-offset': [0, 1.5],
            'text-anchor': 'top',
          },
          paint: {
            'text-color': '#888888',
            'text-halo-color': '#000000',
            'text-halo-width': 1,
          }
        });

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
    <div className="relative w-full h-full bg-black">
      {/* Map title bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-2 bg-black border-b border-dark-500">
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
      <div ref={mapContainerRef} className="w-full h-full dot-matrix relative overflow-hidden">
        <div className="scanline" />
      </div>

      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
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
        <div className="absolute bottom-8 left-3 z-10 flex flex-wrap gap-x-3 gap-y-1 px-3 py-2 bg-black border border-dark-500">
          {Object.entries(REGION_COLORS).map(([region, color]) => (
            <div key={region} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-none" style={{ backgroundColor: color }} />
              <span className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">{region}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
