/**
 * COVID-19 Location Tracker
 * Modern JavaScript with Dracula Theme
 * @version 2.0.0
 * @author Jason M. Hempstead (Casjay)
 */

// Configuration
const CONFIG = {
  // Use disease.sh API which has working data
  COUNTRIES_API: 'https://disease.sh/v3/covid-19/countries',
  STATES_API: 'https://disease.sh/v3/covid-19/states', 
  CACHE_DURATION_MS: 1000 * 60 * 60, // 1 hour
  VERSION: '2.0.0',
  GEOLOCATION_TIMEOUT: 10000
};

// Clear cache if version changed
if (localStorage.version !== CONFIG.VERSION) {
  console.log('Version updated, clearing cache...');
  localStorage.clear();
  localStorage.version = CONFIG.VERSION;
}

const elements = {
  yourLocation: document.querySelector('#your-location'),
  closestLocation: document.querySelector('#closest-location'),
  distance: document.querySelector("#distance"),
  confirmed: document.querySelector("#confirmed"),
  deaths: document.querySelector("#deaths"),
  recovered: document.querySelector("#recovered"),
  updated: document.querySelector('#updated'),
  locationButton: document.querySelector('#locationButton'),
  refreshButton: document.querySelector('#refreshButton'),
  lastDataRequest: document.querySelector('#lastDataRequest'),
  locationError: document.querySelector('#locationError'),
  casesError: document.querySelector('#casesError'),
  active: document.querySelector('#active'),
};

async function getData() {
  try {
    const cacheDiff = Date.now() - localStorage.cacheTime;
    const lastRequestTime = localStorage.cacheTime ? new Date(+localStorage.cacheTime).toLocaleString() : 'Never';
    elements.lastDataRequest.textContent = lastRequestTime;
    
    // Return cached data if fresh
    if (localStorage.cacheTime && cacheDiff < CONFIG.CACHE_DURATION_MS && localStorage.cacheData) {
      console.log('Using cached COVID data');
      return JSON.parse(localStorage.cacheData);
    }
    
    console.log('Fetching fresh COVID data from disease.sh...');
    
    // Fetch both countries and US states data
    const [countriesResponse, statesResponse] = await Promise.all([
      fetch(CONFIG.COUNTRIES_API),
      fetch(CONFIG.STATES_API)
    ]);
    
    if (!countriesResponse.ok || !statesResponse.ok) {
      throw new Error(`HTTP error! Countries: ${countriesResponse.status}, States: ${statesResponse.status}`);
    }
    
    const [countries, states] = await Promise.all([
      countriesResponse.json(),
      statesResponse.json()
    ]);
    
    // Transform data to match expected format
    const transformedData = [
      ...countries.map(country => ({
        Country_Region: country.country,
        Province_State: null,
        Lat: country.countryInfo.lat,
        Long_: country.countryInfo.long,
        Confirmed: country.cases,
        Deaths: country.deaths,
        Recovered: country.recovered,
        Active: country.active,
        Last_Update: new Date(country.updated).toISOString()
      })),
      ...states.map(state => ({
        Country_Region: 'US',
        Province_State: state.state,
        Lat: 39.8283, // US center lat for states (approximate)
        Long_: -98.5795, // US center long for states (approximate)
        Confirmed: state.cases,
        Deaths: state.deaths,
        Recovered: state.recovered || 0,
        Active: state.cases - state.deaths - (state.recovered || 0),
        Last_Update: new Date(state.updated).toISOString()
      }))
    ].filter(item => item.Confirmed > 0);
    
    // Cache the transformed data
    localStorage.cacheData = JSON.stringify(transformedData);
    localStorage.cacheTime = Date.now();
    elements.lastDataRequest.textContent = new Date().toLocaleString();
    
    console.log(`Fetched ${transformedData.length} COVID data points`);
    return transformedData;
    
  } catch (error) {
    console.error('Error fetching COVID data:', error);
    elements.lastDataRequest.textContent = 'Error fetching data';
    return [];
  }
}

function getDistances([features, location]) {
  console.log(`Processing ${features.length} COVID data points for location:`, location);
  
  const distances = features
    .filter(item => item.Confirmed > 0 && item.Lat && item.Long_)
    .map(item => {
      const distance_kms = getDistance(location.latitude, location.longitude, item.Lat, item.Long_);
      return {
        ...item,
        distance_kms,
        distance_miles: distance_kms * 0.6213712
      };
    })
    .sort((a, b) => a.distance_kms - b.distance_kms);
  
  console.log(`Found ${distances.length} locations with data, closest:`, distances[0]?.Country_Region);
  
  return {
    location,
    closest: distances[0],
  };
}

function getDistance(lat1, lon1, lat2, lon2) {
  const p = 0.017453292519943295;
  const c = Math.cos;
  const a = 0.5 - c((lat2 - lat1) * p)/2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))/2;
  return 12742 * Math.asin(Math.sqrt(a));
}

function getIPLocation() {
  const cacheDiff = Date.now() - localStorage.cacheTime;
  if (localStorage.cacheTime && localStorage.cacheLocation && cacheDiff < maxDiffMs) return Promise.resolve(JSON.parse(localStorage.cacheLocation));
  return fetch('https://ipapi.co/json/')
    .then(response => response.json())
    .then(json => {
      localStorage.cacheLocation = JSON.stringify(json);
      localStorage.cacheTime = Date.now();
      return json;
    }).catch(error => {
      delete localStorage.cacheLocation;
      return {
        city: 'Unknown'
      };
    });
}

function getLocationFromCoords(coords) {
  const lookup = `${coords.latitude}, ${coords.longitude}`;
  if (localStorage[lookup]) return Promise.resolve(JSON.parse(localStorage[lookup]));
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`;
  return fetch(url)
    .then(res => res.json())
    .then(json => {
      const location = {
        city: json.address.city,
        region_code: json.address.state,
        country: json.address.country_code.toUpperCase(),
        latitude: coords.latitude,
        longitude: coords.longitude,
      };
      localStorage[lookup] = JSON.stringify(location);
      return location;
    })
    .catch(() => ({
      city: location,
      region_code: '',
      country: '',
      latitude: coords.latitude,
      longitude: coords.longitude,
    }))
}

function getLocation(useFineLocation) {
  if (localStorage.useFineLocation === 'true' || useFineLocation) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition((location) => {
        localStorage.useFineLocation = true;
        elements.locationButton.style.display = 'none';
        resolve(getLocationFromCoords(location.coords));
      }, () => {
        localStorage.useFineLocation = false;
        elements.locationButton.style.display = '';
        resolve(getIPLocation());
      }, {
        timeout: 10000,
      });
    });
  }
  return getIPLocation();
}

function setAllCaseInfo(value) {
  elements.closestLocation.textContent = value;
  elements.distance.textContent = value;
  elements.confirmed.textContent = value;
  elements.deaths.textContent = value;
  elements.recovered.textContent = value;
  elements.active.textContent = value;
  elements.updated.textContent = 'Never';
  elements.lastDataRequest.textContent = 'Never';
}

function showInfo({ location, closest }) {
  console.log('Displaying info for location:', location, 'closest:', closest);
  
  const unknown = 'Unknown';
  const locationDisplay = [location.city, location.region, location.country].filter(i => i).join(', ');
  
  elements.yourLocation.textContent = locationDisplay || unknown;
  
  if (location.city === unknown || !location.city) {
    elements.locationError.style.display = 'block';
    setAllCaseInfo(unknown);
  } else if (!closest) {
    setAllCaseInfo('No data available');
    elements.casesError.style.display = 'block';
  } else {
    elements.locationError.style.display = 'none';
    elements.casesError.style.display = 'none';
    
    // Format numbers with thousands separators
    const formatNumber = (num) => Number(num).toLocaleString();
    
    setTimeout(() => {
      elements.closestLocation.textContent = [closest.Province_State, closest.Country_Region].filter(i => i).join(', ');
      elements.distance.textContent = `${closest.distance_miles.toFixed(1)} miles`;
      elements.confirmed.textContent = formatNumber(closest.Confirmed);
      elements.active.textContent = formatNumber(closest.Active);
      elements.deaths.textContent = formatNumber(closest.Deaths);
      elements.recovered.textContent = formatNumber(closest.Recovered);
      elements.updated.textContent = new Date(closest.Last_Update).toLocaleString();
    }, 100); // Reduced delay
  }
}

function render(useFineLocation) {
  elements.locationError.style.display = 'none';
  elements.casesError.style.display = 'none';
  const loading = 'Loading...';
  elements.yourLocation.textContent = loading;
  setAllCaseInfo(loading);
  Promise.all([
    getData(),
    getLocation(useFineLocation),
  ])
    .then(getDistances)
    .then(showInfo);

  // Auto-refresh every hour
  setTimeout(render, CONFIG.CACHE_DURATION_MS);
}

render(false);

elements.locationButton.addEventListener('click', () => {
  render(true);
  elements.locationButton.style.display = 'none';
});

elements.refreshButton.addEventListener('click', () => {
  delete localStorage.cacheData;
  delete localStorage.cacheTime;
  render();
});
