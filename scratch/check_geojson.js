
async function checkGeoJSON() {
  const INDIA_GEOJSON_URL = 'https://raw.githubusercontent.com/HindustanTimesLabs/shapefiles/master/india/states/india_states.json';
  const INDIA_GEOJSON_FALLBACK = 'https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson';

  try {
    console.log('Fetching primary GeoJSON...');
    const res = await fetch(INDIA_GEOJSON_URL);
    console.log('Primary Status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('Primary Features:', data.features?.length);
    } else {
      console.log('Primary failed, fetching fallback...');
      const res2 = await fetch(INDIA_GEOJSON_FALLBACK);
      console.log('Fallback Status:', res2.status);
      if (res2.ok) {
        const data2 = await res2.json();
      console.log('Fallback Features:', data2.features?.length);
      if (data2.features && data2.features.length > 0) {
        console.log('Sample properties:', data2.features[0].properties);
      }
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkGeoJSON();
