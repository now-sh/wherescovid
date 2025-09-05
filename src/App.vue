<template>
  <div class="app-container">
    <!-- Skip to Content Link for Screen Readers -->
    <a href="#main-content" class="visually-hidden-focusable skip-link">
      Skip to main content
    </a>
    
    <header role="banner" class="app-header">
      <nav class="navbar navbar-expand-lg" role="navigation" aria-label="Main navigation">
        <div class="container">
          <!-- Brand/Logo -->
          <a href="/" class="navbar-brand" aria-label="COVID-19 Location Tracker Home">
            <span class="brand-icon" aria-hidden="true">📍</span>
            <span class="brand-text">Location Tracker</span>
          </a>

          <!-- Mobile Menu Toggle -->
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#main-nav"
            aria-controls="main-nav"
            aria-expanded="false"
            aria-label="Toggle navigation menu"
          >
            <span class="navbar-toggler-icon"></span>
          </button>

          <!-- Navigation Menu -->
          <div class="collapse navbar-collapse" id="main-nav">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0" role="menubar">
              <li class="nav-item" role="none">
                <a href="/" class="nav-link" role="menuitem" aria-label="Location tracker">
                  <span class="nav-icon" aria-hidden="true">📍</span>
                  <span class="nav-text">Location</span>
                </a>
              </li>
            </ul>
            
            <!-- App Actions -->
            <ul class="navbar-nav ms-auto mb-2 mb-lg-0" role="menubar" aria-label="App actions">
              <li class="nav-item" role="none">
                <button
                  @click="useGPS" 
                  class="nav-link btn btn-link"
                  role="menuitem"
                  aria-label="Use precise GPS location"
                >
                  <span class="nav-icon" aria-hidden="true">📍</span>
                  <span class="nav-text">Precise Location</span>
                </button>
              </li>
              <li class="nav-item" role="none">
                <button
                  @click="loadData"
                  class="nav-link btn btn-link"
                  role="menuitem"
                  aria-label="Refresh COVID data"
                >
                  <span class="nav-icon" aria-hidden="true">🔄</span>
                  <span class="nav-text">Refresh</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main Content Area -->
    <main id="main-content" class="main-content" role="main" tabindex="-1">
      <div class="container">
        <!-- App Header -->
        <header class="text-center app-title">
          <h1 class="display-4">
            <span role="img" aria-label="Medical symbols">😷 🏥 🦠 🧫</span>
          </h1>
          <h2 class="h3">COVID-19 Location Tracker</h2>
          <p class="lead">Find nearest country with COVID-19 data</p>
          
          <div class="alert alert-warning text-center mb-4">
            <h5 class="alert-heading">📊 About This Data</h5>
            <p class="mb-2">
              <strong>Granular COVID tracking ended in 2023.</strong> This app now shows the 
              closest <strong>country</strong> with current COVID data to your location.
            </p>
            <p class="mb-0">
              <small>For local/state data, use the specialized dashboards linked above.</small>
            </p>
          </div>
        </header>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container" role="status" aria-live="polite">
          <div class="spinner-container">
            <div class="spinner-border" role="status" aria-label="Loading COVID-19 location data">
              <span class="visually-hidden">Loading...</span>
            </div>
            <h3 class="loading-text">Finding your location...</h3>
            <p class="loading-subtitle">Fetching COVID-19 data for your area</p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container" role="alert" aria-live="assertive">
          <div class="alert alert-danger">
            <h3 id="error-heading">Error Loading Data</h3>
            <p>{{ error }}</p>
            <button @click="loadData" class="btn btn-outline-danger" aria-describedby="error-heading">
              <span aria-hidden="true">🔄</span> Retry
            </button>
          </div>
        </div>

        <!-- Data Display -->
        <div v-else class="data-container">
          <!-- User Location Section -->
          <section class="location-card" role="region" aria-labelledby="location-heading">
            <h3 id="location-heading" class="card-title">Your Location</h3>
            
            <div class="info-item">
              <span class="label">Your Location:</span>
              <span class="value" :class="locationDisplay || 'text-muted'">
                {{ locationDisplay || 'Detecting...' }}
              </span>
            </div>
            
            <div v-if="locationError" class="alert alert-warning" role="alert">
              Unable to automatically determine your location. 
              <button @click="useGPS" class="btn btn-sm btn-outline-warning ms-2">
                <span aria-hidden="true">📍</span> Use GPS
              </button>
            </div>
          </section>

          <!-- COVID Data Section -->
          <section class="location-card" role="region" aria-labelledby="covid-heading">
            <h3 id="covid-heading" class="card-title">Nearest COVID-19 Data</h3>
            

            <div v-if="covidData" class="covid-stats">
              <!-- Location Header -->
              <div class="location-header mb-3">
                <h4 class="mb-2">
                  {{ covidData.DataType === 'region' ? '📍 Regional Data' : 
                      covidData.isUserCountry ? '🏠 Your Country' : '🌍 Nearest Location' }}
                </h4>
                <div class="location-badge">
                  <span class="badge" :class="getBadgeClass(covidData)">
                    {{ getLocationDescription(covidData) }}
                  </span>
                </div>
              </div>

              <!-- Core Stats -->
              <div class="stats-grid">
                <div class="row g-3">
                  <div class="col-6">
                    <div class="stat-mini">
                      <div class="stat-label">Location</div>
                      <div class="stat-value">{{ closestLocationText }}</div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="stat-mini">
                      <div class="stat-label">Distance</div>
                      <div class="stat-value">{{ distanceText }}</div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="stat-mini">
                      <div class="stat-label">Total Cases</div>
                      <div class="stat-value confirmed">{{ formatNumber(covidData.Confirmed) }}</div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="stat-mini">
                      <div class="stat-label">Deaths</div>
                      <div class="stat-value deaths">{{ formatNumber(covidData.Deaths) }}</div>
                    </div>
                  </div>
                  <div class="col-6" v-if="covidData.Population">
                    <div class="stat-mini">
                      <div class="stat-label">Population</div>
                      <div class="stat-value">{{ formatNumber(covidData.Population) }}</div>
                    </div>
                  </div>
                  <div class="col-6" v-if="covidData.CasesPerMillion">
                    <div class="stat-mini">
                      <div class="stat-label">Cases per Million</div>
                      <div class="stat-value">{{ formatNumber(covidData.CasesPerMillion) }}</div>
                    </div>
                  </div>
                  <div class="col-12" v-if="covidData.StateCount">
                    <div class="stat-mini">
                      <div class="stat-label">States in Region</div>
                      <div class="stat-value">{{ covidData.StateCount }} states</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- User's Local Data (State for US, Country for others) -->
              <div v-if="userStateData" class="local-data-section mt-4">
                <h4 class="text-center mb-3">🏛️ Your State: {{ userStateData.stateName }}</h4>
                
                <div class="local-stats-grid">
                  <div class="row g-3">
                    <div class="col-6 col-md-3">
                      <div class="local-stat-card">
                        <div class="local-stat-icon">🦠</div>
                        <div class="local-stat-label">Total Cases</div>
                        <div class="local-stat-value">{{ formatNumber(userStateData.cases) }}</div>
                      </div>
                    </div>
                    <div class="col-6 col-md-3">
                      <div class="local-stat-card">
                        <div class="local-stat-icon">💀</div>
                        <div class="local-stat-label">Deaths</div>
                        <div class="local-stat-value">{{ formatNumber(userStateData.deaths) }}</div>
                      </div>
                    </div>
                    <div class="col-6 col-md-3">
                      <div class="local-stat-card">
                        <div class="local-stat-icon">👥</div>
                        <div class="local-stat-label">Population</div>
                        <div class="local-stat-value">{{ formatNumber(userStateData.population) }}</div>
                      </div>
                    </div>
                    <div class="col-6 col-md-3">
                      <div class="local-stat-card">
                        <div class="local-stat-icon">📊</div>
                        <div class="local-stat-label">Cases per Million</div>
                        <div class="local-stat-value">{{ formatNumber(userStateData.casesPerMillion) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="local-context mt-3 text-center">
                  <small class="text-muted">
                    Updated: {{ formatDate(userStateData.lastUpdated) }}
                  </small>
                </div>
              </div>

              <!-- User's Country Data (for non-US users) -->
              <div v-else-if="userCountryData" class="local-data-section mt-4">
                <h4 class="text-center mb-3">🏠 Your Country: {{ userCountryData.countryName }}</h4>
                
                <div class="local-stats-grid">
                  <div class="row g-3">
                    <div class="col-6 col-md-3">
                      <div class="local-stat-card">
                        <div class="local-stat-icon">🦠</div>
                        <div class="local-stat-label">Total Cases</div>
                        <div class="local-stat-value">{{ formatNumber(userCountryData.Confirmed) }}</div>
                      </div>
                    </div>
                    <div class="col-6 col-md-3">
                      <div class="local-stat-card">
                        <div class="local-stat-icon">💀</div>
                        <div class="local-stat-label">Deaths</div>
                        <div class="local-stat-value">{{ formatNumber(userCountryData.Deaths) }}</div>
                      </div>
                    </div>
                    <div class="col-6 col-md-3">
                      <div class="local-stat-card">
                        <div class="local-stat-icon">👥</div>
                        <div class="local-stat-label">Population</div>
                        <div class="local-stat-value">{{ formatNumber(userCountryData.Population) }}</div>
                      </div>
                    </div>
                    <div class="col-6 col-md-3">
                      <div class="local-stat-card">
                        <div class="local-stat-icon">📊</div>
                        <div class="local-stat-label">Cases per Million</div>
                        <div class="local-stat-value">{{ formatNumber(userCountryData.CasesPerMillion) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="local-context mt-3 text-center">
                  <small class="text-muted">
                    Updated: {{ formatDate(userCountryData.Last_Update) }}
                  </small>
                </div>
              </div>

              <!-- Risk Assessment (Below Local Data) -->
              <div v-if="riskAssessment" class="risk-assessment mt-4">
                <h5 class="text-center mb-3">🎯 Location-Based Risk Assessment</h5>
                <div class="risk-grid">
                  <div class="row g-3">
                    <div class="col-md-4">
                      <div class="risk-card" :class="riskAssessment.riskLevel">
                        <div class="risk-icon">{{ riskAssessment.icon }}</div>
                        <div class="risk-label">Risk Level</div>
                        <div class="risk-value">{{ riskAssessment.level }}</div>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="risk-card info">
                        <div class="risk-icon">📊</div>
                        <div class="risk-label">Cases per 100K</div>
                        <div class="risk-value">{{ riskAssessment.casesPer100k }}</div>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="risk-card trend" :class="riskAssessment.trendClass">
                        <div class="risk-icon">{{ riskAssessment.trendIcon }}</div>
                        <div class="risk-label">Trend</div>
                        <div class="risk-value">{{ riskAssessment.trend }}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="risk-explanation mt-3 text-center">
                  <small class="text-muted">
                    {{ riskAssessment.explanation }}
                  </small>
                </div>
              </div>

              <!-- Additional Context -->
              <div class="mt-4 small text-muted text-center">
                Data updated: {{ formatDate(covidData.Last_Update) }} • 
                Refreshed: {{ lastDataRequest }}
              </div>
            </div>
            
            <div v-else-if="!loading" class="alert alert-info">
              No COVID-19 data found for your area.
              <button @click="loadData" class="btn btn-sm btn-outline-info ms-2">
                <span aria-hidden="true">🔄</span> Refresh
              </button>
            </div>

            <div class="note alert alert-info mt-3">
              <strong>How this works:</strong>
              <ul class="text-start mb-0">
                <li>Detects your location (IP-based or GPS)</li>
                <li>Finds the closest country with COVID data</li>
                <li>Shows distance and current country-level statistics</li>
                <li>Uses real-time data from disease.sh API</li>
              </ul>
            </div>
            
            <div class="text-center mt-3">
              <button @click="loadData" class="btn btn-outline-primary me-2">
                <span aria-hidden="true">🔄</span> Refresh Data
              </button>
              <button v-if="!usesPreciseLocation" @click="useGPS" class="btn btn-outline-success">
                <span aria-hidden="true">📍</span> Use GPS
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="app-footer" role="contentinfo">
      <div class="container">
        <!-- Developer Info -->
        <section class="footer-section" aria-labelledby="developer-heading">
          <h2 id="developer-heading" class="visually-hidden">Developer Information</h2>
          <p class="developer-info">
            <span class="heart-icons" aria-label="Made with love">💜💜💜</span>
            <br />
            <span>Developed by </span>
            <a
              href="https://github.com/casjay"
              target="_blank"
              rel="noopener noreferrer"
              class="developer-link"
              aria-label="Jason M. Hempstead GitHub profile (opens in new tab)"
            >
              Jason M. Hempstead (Casjay)
            </a>
          </p>
        </section>

        <!-- Open Source Info -->
        <section class="footer-section" aria-labelledby="opensource-heading">
          <h2 id="opensource-heading" class="visually-hidden">Open Source Information</h2>
          <p class="opensource-info">
            <span>Open source project</span>
            <br />
            <a
              href="https://github.com/now-sh/wherescovid"
              target="_blank"
              rel="noopener noreferrer"
              class="source-link"
              aria-label="View source code on GitHub (opens in new tab)"
            >
              View Source Code
              <span aria-hidden="true">↗</span>
            </a>
          </p>
        </section>

        <!-- Data Sources -->
        <section class="footer-section data-sources" aria-labelledby="data-sources-heading">
          <h2 id="data-sources-heading" class="section-title">Data Sources</h2>
          <div class="sources-info text-center">
            <p class="mb-2">
              <strong>COVID Data:</strong> disease.sh API
            </p>
            <p class="mb-2">
              <strong>Location:</strong> IP geolocation + GPS (optional)
            </p>
            <p class="mb-0">
              <strong>Privacy:</strong> No personal data stored
            </p>
          </div>
        </section>

        <!-- Copyright -->
        <div class="footer-bottom">
          <p class="copyright">
            <small>
              © {{ currentYear }} COVID-19 Location Tracker. 
              Data accuracy subject to reporting limitations.
            </small>
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'

const CONFIG = {
  COUNTRIES_API: 'https://disease.sh/v3/covid-19/countries',
  STATES_API: 'https://disease.sh/v3/covid-19/states', 
  CACHE_DURATION_MS: 1000 * 60 * 60, // 1 hour
  VERSION: '2.0.0',
  GEOLOCATION_TIMEOUT: 10000
}

export default {
  name: 'LocationTracker',
  setup() {
    const loading = ref(true)
    const error = ref('')
    const userLocation = ref(null)
    const covidData = ref(null)
    const locationError = ref(false)
    const usesPreciseLocation = ref(false)
    const lastDataRequest = ref('Never')
    const riskAssessment = ref(null)
    const userStateData = ref(null)
    const userCountryData = ref(null)
    const currentYear = computed(() => new Date().getFullYear())

    const formatNumber = (num) => {
      if (!num) return 'N/A'
      return Number(num).toLocaleString()
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return 'N/A'
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const locationDisplay = computed(() => {
      if (!userLocation.value) return ''
      const loc = userLocation.value
      return [loc.city, loc.region, loc.country].filter(i => i).join(', ')
    })

    const closestLocationText = computed(() => {
      if (!covidData.value) return 'N/A'
      const parts = [covidData.value.Province_State, covidData.value.Country_Region].filter(i => i)
      return parts.join(', ')
    })

    const distanceText = computed(() => {
      if (!covidData.value?.distance_miles) return 'N/A'
      return `${covidData.value.distance_miles.toFixed(1)} miles`
    })

    const userStateLink = computed(() => {
      if (!userLocation.value?.region || userLocation.value?.country !== 'US') {
        return null
      }
      
      const state = userLocation.value.region
      
      // Map of states to their specific COVID dashboards/links
      const stateLinks = {
        'New York': { url: 'https://nys.covid.casjay.coffee/', text: 'New York State Data' },
        'South Carolina': { url: 'https://covid.casjay.coffee/states', text: 'South Carolina Data' },
        // For states without specific dashboards, link to the general states page with anchor
        default: { url: 'https://covid.casjay.coffee/states', text: `${state} Data` }
      }
      
      return stateLinks[state] || { 
        url: `https://covid.casjay.coffee/states`,
        text: `${state} Data`
      }
    })

    const getDistance = (lat1, lon1, lat2, lon2) => {
      const p = 0.017453292519943295
      const c = Math.cos
      const a = 0.5 - c((lat2 - lat1) * p)/2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))/2
      return 12742 * Math.asin(Math.sqrt(a))
    }

    const fetchCovidData = async () => {
      try {
        console.log('Fetching multi-source COVID data...')
        
        // Fetch both countries and states for maximum coverage
        const [countriesResponse, statesResponse] = await Promise.all([
          fetch(CONFIG.COUNTRIES_API),
          fetch(CONFIG.STATES_API)
        ])
        
        if (!countriesResponse.ok) {
          throw new Error(`Countries API error: ${countriesResponse.status}`)
        }
        
        const countries = await countriesResponse.json()
        let states = []
        
        // Try to get states data, but don't fail if it's unavailable
        if (statesResponse.ok) {
          states = await statesResponse.json()
          console.log(`Fetched ${states.length} US states`)
        }
        
        // Transform and combine data intelligently
        const transformedData = []
        
        // Add countries with coordinates
        countries.forEach(country => {
          if (country.cases > 0 && country.countryInfo.lat && country.countryInfo.long) {
            transformedData.push({
              Country_Region: country.country,
              Province_State: null,
              Lat: country.countryInfo.lat,
              Long_: country.countryInfo.long,
              Confirmed: country.cases,
              Deaths: country.deaths,
              Recovered: country.recovered,
              Active: country.active,
              Population: country.population,
              CasesPerMillion: country.casesPerOneMillion,
              DeathsPerMillion: country.deathsPerOneMillion,
              Last_Update: new Date(country.updated).toISOString(),
              DataType: 'country'
            })
          }
        })
        
        // For US users, create regional clusters using state data
        if (states.length > 0) {
          // Define US regional clusters with approximate centers
          const regions = {
            'Northeast': { lat: 42.0, lng: -75.0, states: ['New York', 'Pennsylvania', 'New Jersey', 'Connecticut', 'Massachusetts', 'Rhode Island', 'Vermont', 'New Hampshire', 'Maine'] },
            'Southeast': { lat: 33.5, lng: -82.0, states: ['Florida', 'Georgia', 'South Carolina', 'North Carolina', 'Virginia', 'Tennessee', 'Kentucky', 'Alabama', 'Mississippi', 'Louisiana', 'Arkansas'] },
            'Midwest': { lat: 41.5, lng: -89.0, states: ['Illinois', 'Indiana', 'Ohio', 'Michigan', 'Wisconsin', 'Minnesota', 'Iowa', 'Missouri', 'Kansas', 'Nebraska', 'North Dakota', 'South Dakota'] },
            'Southwest': { lat: 32.0, lng: -101.0, states: ['Texas', 'Oklahoma', 'New Mexico', 'Arizona'] },
            'West': { lat: 40.0, lng: -119.0, states: ['California', 'Nevada', 'Oregon', 'Washington', 'Idaho', 'Montana', 'Wyoming', 'Colorado', 'Utah'] },
            'Other': { lat: 39.0, lng: -98.0, states: ['Alaska', 'Hawaii', 'Delaware', 'Maryland', 'West Virginia', 'Washington DC'] }
          }
          
          // Create regional aggregations
          Object.entries(regions).forEach(([regionName, region]) => {
            const regionStates = states.filter(state => region.states.includes(state.state))
            
            if (regionStates.length > 0) {
              const totalCases = regionStates.reduce((sum, state) => sum + state.cases, 0)
              const totalDeaths = regionStates.reduce((sum, state) => sum + state.deaths, 0)
              const totalPopulation = regionStates.reduce((sum, state) => sum + state.population, 0)
              
              transformedData.push({
                Country_Region: 'US',
                Province_State: `${regionName} Region`,
                Lat: region.lat,
                Long_: region.lng,
                Confirmed: totalCases,
                Deaths: totalDeaths,
                Recovered: 0, // Not available for states
                Active: totalCases - totalDeaths,
                Population: totalPopulation,
                CasesPerMillion: Math.round((totalCases / totalPopulation) * 1000000),
                DeathsPerMillion: Math.round((totalDeaths / totalPopulation) * 1000000),
                Last_Update: new Date().toISOString(),
                DataType: 'region',
                StateCount: regionStates.length
              })
            }
          })
        }
        
        console.log(`Created ${transformedData.length} data points (${countries.length} countries + US regions)`)
        lastDataRequest.value = new Date().toLocaleString()
        return transformedData
        
      } catch (err) {
        console.error('Error fetching COVID data:', err)
        throw new Error(`Failed to fetch COVID data: ${err.message}`)
      }
    }

    const fetchLocation = async (usePreciseLocation = false) => {
      try {
        if (usePreciseLocation && navigator.geolocation) {
          console.log('Using precise GPS location...')
          return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                usesPreciseLocation.value = true
                locationError.value = false
                const coords = position.coords
                
                // Get address from coordinates
                try {
                  const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
                  )
                  const json = await response.json()
                  resolve({
                    city: json.address?.city || json.address?.town || 'Unknown',
                    region: json.address?.state,
                    country: json.address?.country_code?.toUpperCase(),
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                  })
                } catch {
                  resolve({
                    city: 'GPS Location',
                    region: '',
                    country: '',
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                  })
                }
              },
              async () => {
                // GPS denied or unavailable - fallback to IP location
                console.log('GPS access denied or unavailable, falling back to IP location')
                locationError.value = true
                usesPreciseLocation.value = false
                
                try {
                  const response = await fetch('https://ipapi.co/json/')
                  const data = await response.json()
                  resolve({
                    city: data.city,
                    region: data.region,
                    country: data.country,
                    latitude: data.latitude,
                    longitude: data.longitude,
                  })
                } catch {
                  resolve({
                    city: 'Unknown',
                    region: '',
                    country: '',
                    latitude: 0,
                    longitude: 0,
                  })
                }
              },
              { 
                timeout: CONFIG.GEOLOCATION_TIMEOUT,
                enableHighAccuracy: false,
                maximumAge: 300000 // 5 minutes
              }
            )
          })
        } else {
          console.log('Using IP-based location...')
          const response = await fetch('https://ipapi.co/json/')
          const data = await response.json()
          return {
            city: data.city,
            region: data.region,
            country: data.country,
            latitude: data.latitude,
            longitude: data.longitude,
          }
        }
      } catch (err) {
        console.error('Error getting location:', err)
        locationError.value = true
        // Always fallback to IP location
        try {
          const response = await fetch('https://ipapi.co/json/')
          const data = await response.json()
          return {
            city: data.city,
            region: data.region,
            country: data.country,
            latitude: data.latitude,
            longitude: data.longitude,
          }
        } catch {
          return {
            city: 'Unknown',
            region: '',
            country: '',
            latitude: 0,
            longitude: 0,
          }
        }
      }
    }

    const findClosestCovidData = (covidDataArray, location) => {
      if (!covidDataArray.length || !location.latitude || !location.longitude) {
        return null
      }

      console.log('Finding closest location for:', location)
      console.log('Total data points:', covidDataArray.length)

      // Calculate distances to all countries
      const withDistances = covidDataArray.map(item => ({
        ...item,
        distance_kms: getDistance(location.latitude, location.longitude, item.Lat, item.Long_),
      }))

      withDistances.forEach(item => {
        item.distance_miles = item.distance_kms * 0.6213712
      })

      withDistances.sort((a, b) => a.distance_kms - b.distance_kms)
      
      // Smart filtering: If user is in a specific country, prioritize that country's data
      const userCountryData = withDistances.find(item => 
        item.Country_Region.toLowerCase() === location.country?.toLowerCase() ||
        (location.country === 'US' && item.Country_Region === 'US') ||
        (location.country === 'United States' && item.Country_Region === 'US')
      )
      
      console.log('User location:', location.city, location.region, location.country)
      console.log('User country match found:', userCountryData ? 'Yes' : 'No')
      console.log('Top 5 closest locations:')
      withDistances.slice(0, 5).forEach((item, i) => {
        console.log(`  ${i+1}. ${item.Country_Region}: ${item.distance_miles.toFixed(1)} miles`)
      })
      
      // If user is in their home country and it has COVID data, prioritize it
      // Otherwise, show the genuinely closest location
      let result
      if (userCountryData && userCountryData.distance_miles < 2000) {
        result = { ...userCountryData, isUserCountry: true }
        console.log('Using user country data:', result.Country_Region)
      } else {
        result = { ...withDistances[0], isUserCountry: false }
        console.log('Using closest country data:', result.Country_Region)
      }
      
      console.log('Selected result:', result?.Country_Region, `(${result?.distance_miles.toFixed(1)} miles)`)
      
      return result
    }

    const loadData = async () => {
      loading.value = true
      error.value = ''
      locationError.value = false
      
      try {
        const [covidDataArray, location] = await Promise.all([
          fetchCovidData(),
          fetchLocation(usesPreciseLocation.value)
        ])
        
        userLocation.value = location
        
        // Fetch user's specific regional data
        if (location?.country === 'US') {
          userStateData.value = await fetchUserStateData(location)
          userCountryData.value = null // US users get state data instead
        } else {
          userStateData.value = null
          userCountryData.value = await fetchUserCountryData(location, covidDataArray)
        }
        
        
        const closest = findClosestCovidData(covidDataArray, location)
        covidData.value = closest
        
        if (!closest) {
          error.value = 'No COVID-19 data found for your area'
          riskAssessment.value = null
        } else {
          // Calculate personalized risk assessment
          riskAssessment.value = calculateRiskAssessment(closest, location)
          console.log('Risk assessment calculated:', riskAssessment.value)
        }
        
      } catch (err) {
        console.error('Error in loadData:', err)
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    const useGPS = async () => {
      usesPreciseLocation.value = true
      locationError.value = false
      await loadData()
    }

    const getBadgeClass = (data) => {
      if (data.DataType === 'region') return 'bg-info text-dark'
      if (data.isUserCountry) return 'bg-success text-dark'
      return 'bg-warning text-dark'
    }

    const getLocationDescription = (data) => {
      if (data.DataType === 'region') {
        return `${data.StateCount} states aggregated`
      }
      if (data.isUserCountry) {
        return 'Your country data'
      }
      return 'Nearest available data'
    }

    const calculateRiskAssessment = (covidData, userLocation) => {
      if (!covidData || !covidData.Population) return null

      // Calculate cases per 100k population
      const casesPer100k = Math.round((covidData.Confirmed / covidData.Population) * 100000)
      
      // Calculate death rate
      const deathRate = ((covidData.Deaths / covidData.Confirmed) * 100).toFixed(2)
      
      // Distance-based risk modification
      const distance = covidData.distance_miles || 0
      const distanceModifier = distance > 500 ? 0.5 : distance > 200 ? 0.7 : 1.0
      
      // Risk scoring algorithm
      let riskScore = 0
      
      // Cases per 100k scoring
      if (casesPer100k > 20000) riskScore += 3
      else if (casesPer100k > 10000) riskScore += 2  
      else if (casesPer100k > 5000) riskScore += 1
      
      // Death rate scoring
      if (deathRate > 3) riskScore += 2
      else if (deathRate > 1.5) riskScore += 1
      
      // Apply distance modifier
      riskScore *= distanceModifier
      
      // Determine risk level and messaging
      let level, icon, riskClass, explanation, trend, trendIcon, trendClass
      
      if (riskScore >= 4) {
        level = 'High'
        icon = '🔴'
        riskClass = 'high-risk'
        explanation = 'High case density in your region. Consider extra precautions.'
        trend = 'Monitor'
        trendIcon = '⚠️'
        trendClass = 'warning'
      } else if (riskScore >= 2) {
        level = 'Moderate'
        icon = '🟡'
        riskClass = 'moderate-risk'
        explanation = 'Moderate case levels in your area. Stay informed of local guidelines.'
        trend = 'Stable'
        trendIcon = '📊'
        trendClass = 'stable'
      } else {
        level = 'Lower'
        icon = '🟢'
        riskClass = 'low-risk'
        explanation = 'Lower case density in your region relative to global averages.'
        trend = 'Improving'
        trendIcon = '📈'
        trendClass = 'success'
      }
      
      // Add location-specific context
      if (distance > 500) {
        explanation += ` Note: Data is from ${distance.toFixed(0)} miles away.`
      }
      
      if (covidData.DataType === 'region') {
        explanation += ` Regional data covers ${covidData.StateCount} states in your area.`
      }

      return {
        level,
        icon,
        riskLevel: riskClass,
        explanation,
        casesPer100k: casesPer100k.toLocaleString(),
        deathRate,
        trend,
        trendIcon,
        trendClass,
        distance: distance.toFixed(1)
      }
    }

    const fetchUserStateData = async (userLocation) => {
      if (!userLocation?.region || userLocation?.country !== 'US') {
        return null
      }

      try {
        const stateName = userLocation.region
        console.log(`Fetching ${stateName} state data...`)
        
        const statesResponse = await fetch(CONFIG.STATES_API)
        if (!statesResponse.ok) {
          throw new Error(`States API error: ${statesResponse.status}`)
        }
        
        const states = await statesResponse.json()
        const stateData = states.find(state => 
          state.state.toLowerCase() === stateName.toLowerCase()
        )
        
        if (stateData) {
          console.log(`Found ${stateName} data:`, stateData.cases, 'cases')
          return {
            ...stateData,
            stateName: stateName,
            casesPerMillion: stateData.casesPerOneMillion,
            deathsPerMillion: stateData.deathsPerOneMillion,
            lastUpdated: new Date(stateData.updated).toISOString()
          }
        }
        
        return null
      } catch (err) {
        console.error('Error fetching state data:', err)
        return null
      }
    }

    const fetchUserCountryData = async (userLocation, allCountries) => {
      if (!userLocation?.country || !allCountries) {
        return null
      }

      try {
        const userCountry = userLocation.country
        console.log(`Finding ${userCountry} country data...`)
        
        // Map common country name variations
        const countryMapping = {
          'US': 'USA',
          'United States': 'USA',
          'UK': 'United Kingdom',
          'United Kingdom': 'UK'
        }
        
        const searchNames = [
          userCountry,
          countryMapping[userCountry],
          userCountry.toUpperCase(),
          userCountry.toLowerCase()
        ].filter(Boolean)
        
        const countryData = allCountries.find(country => 
          searchNames.some(name => 
            country.Country_Region.toLowerCase() === name.toLowerCase()
          )
        )
        
        if (countryData) {
          console.log(`Found ${userCountry} data:`, countryData.Confirmed, 'cases')
          return {
            ...countryData,
            countryName: countryData.Country_Region,
            isUserCountry: true
          }
        }
        
        return null
      } catch (err) {
        console.error('Error finding country data:', err)
        return null
      }
    }


    onMounted(() => {
      loadData()
      // Auto-refresh every hour
      setInterval(loadData, CONFIG.CACHE_DURATION_MS)
    })

    return {
      loading,
      error,
      userLocation,
      covidData,
      locationError,
      usesPreciseLocation,
      lastDataRequest,
      riskAssessment,
      userStateData,
      userCountryData,
      currentYear,
      locationDisplay,
      closestLocationText,
      distanceText,
      formatNumber,
      formatDate,
      loadData,
      useGPS,
      getBadgeClass,
      getLocationDescription
    }
  }
}
</script>

<style scoped>
/* App Container */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--body-bg);
  color: var(--text-primary);
}

/* Skip Link for Accessibility */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary-color);
  color: var(--text-primary);
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 1000;
  font-size: 0.875rem;
  font-weight: 600;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 6px;
}

/* Header */
.app-header {
  background-color: var(--navbar-bg);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--box-shadow);
}

/* Brand */
.navbar-brand {
  color: var(--primary-color) !important;
  font-weight: 700;
  font-size: 1.25rem;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.navbar-brand:hover {
  color: var(--secondary-color) !important;
  transform: scale(1.05);
}

.brand-icon {
  font-size: 1.5rem;
}

.brand-text {
  display: none;
}

@media (min-width: 576px) {
  .brand-text {
    display: inline;
  }
  
  .navbar-brand {
    font-size: 1.5rem;
  }
}

/* Navigation */
.navbar-toggler {
  border: 1px solid var(--border-color);
  padding: 0.5rem;
  background: transparent;
  border-radius: 0.375rem;
}

.navbar-toggler:focus {
  box-shadow: 0 0 0 0.2rem rgba(189, 147, 249, 0.25);
}

.navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28248, 248, 242, 0.75%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
}

/* Nav Links */
.nav-link {
  color: var(--text-primary) !important;
  font-weight: 500;
  padding: 0.75rem 1rem !important;
  border-radius: 0.375rem;
  margin: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  text-decoration: none;
  font-size: 0.875rem;
}

.nav-link:hover {
  color: var(--primary-color) !important;
  background-color: rgba(189, 147, 249, 0.1);
  transform: translateY(-1px);
}

.nav-link:focus {
  box-shadow: 0 0 0 0.2rem rgba(189, 147, 249, 0.25);
}

.nav-link.btn.btn-link {
  color: var(--text-primary) !important;
  border: none;
  background: none;
  text-decoration: none;
  padding: 0.75rem 1rem !important;
}

.nav-link.btn.btn-link:hover {
  color: var(--primary-color) !important;
  background-color: rgba(189, 147, 249, 0.1);
}

/* Nav Icons */
.nav-icon {
  font-size: 1rem;
  display: none;
}

.nav-text {
  font-size: 0.875rem;
}

@media (max-width: 991.98px) {
  .nav-icon {
    display: inline;
  }
}

/* External Links */
.external-link {
  position: relative;
}

.external-icon {
  font-size: 0.75rem;
  margin-left: 0.25rem;
  opacity: 0.7;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 2rem 0;
}

@media (max-width: 575.98px) {
  .main-content {
    padding: 1rem 0;
  }
}

/* App Title */
.app-title h1 {
  color: var(--primary-color);
  font-size: clamp(2rem, 6vw, 3rem);
  margin-bottom: 1rem;
}

.app-title h2 {
  color: var(--secondary-color);
  font-size: clamp(1.5rem, 4vw, 2rem);
  margin-bottom: 1rem;
}

.app-title .lead {
  color: var(--text-muted);
  font-size: clamp(1rem, 3vw, 1.25rem);
}

/* Loading State */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  text-align: center;
}

.spinner-container {
  max-width: 300px;
  padding: 2rem;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.loading-text {
  font-size: 1.25rem;
  color: var(--success-color);
  margin-bottom: 0.5rem;
}

.loading-subtitle {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

/* Error State */
.error-container {
  padding: 2rem 1rem;
  text-align: center;
}

/* Location Cards */
.location-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: var(--box-shadow);
  transition: transform 0.2s ease;
}

.location-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(189, 147, 249, 0.15);
}

@media (max-width: 575.98px) {
  .location-card {
    padding: 1.5rem 1rem;
    margin: 1.5rem 0;
  }
}

.card-title {
  color: var(--warning-color);
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
}

/* Info Items */
.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.75rem 0;
  padding: 0.75rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease;
  min-height: 3rem;
}

.info-item:hover {
  background-color: rgba(189, 147, 249, 0.1);
}

@media (max-width: 575.98px) {
  .info-item {
    flex-direction: column;
    text-align: center;
    margin: 1rem 0;
    padding: 1rem;
  }
}

.label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: clamp(0.875rem, 2.5vw, 1rem);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.value {
  font-weight: 700;
  font-size: clamp(1rem, 3vw, 1.25rem);
  color: var(--text-primary);
  text-align: right;
}

@media (max-width: 575.98px) {
  .label {
    margin-bottom: 0.5rem;
    text-align: center;
  }
  
  .value {
    text-align: center;
    font-size: clamp(1.125rem, 4vw, 1.5rem);
  }
}

/* Color-coded values */
.value.confirmed,
.value.active {
  color: var(--warning-color) !important;
}

.value.deaths {
  color: var(--danger-color) !important;
}

.value.recovered {
  color: var(--success-color) !important;
}

.value.updated {
  color: var(--muted-color) !important;
}

#closest-location {
  color: var(--info-color) !important;
}

#distance {
  color: var(--info-color) !important;
}

/* Stat Mini Cards */
.stat-mini {
  background: rgba(189, 147, 249, 0.1);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
  transition: transform 0.2s ease;
  height: 100%;
}

.stat-mini:hover {
  transform: translateY(-2px);
  background: rgba(189, 147, 249, 0.15);
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-value.confirmed {
  color: var(--warning-color);
}

.stat-value.deaths {
  color: var(--danger-color);
}

/* Location Header */
.location-header {
  text-align: center;
  padding: 1rem;
  background: rgba(139, 233, 253, 0.1);
  border-radius: 0.75rem;
  border: 1px solid var(--info-color);
}

.location-header h4 {
  color: var(--info-color);
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.badge {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
}

/* Mobile optimizations for stat grid */
@media (max-width: 575.98px) {
  .stat-mini {
    padding: 0.75rem 0.5rem;
  }
  
  .stat-label {
    font-size: 0.625rem;
  }
  
  .stat-value {
    font-size: 0.875rem;
  }
}

/* Risk Assessment */
.risk-assessment {
  background: rgba(189, 147, 249, 0.05);
  border: 1px solid var(--primary-color);
  border-radius: 1rem;
  padding: 2rem;
}

.risk-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1.5rem 1rem;
  text-align: center;
  transition: all 0.2s ease;
  height: 100%;
}

.risk-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.risk-card.high-risk {
  border-color: var(--danger-color);
  background: rgba(255, 85, 85, 0.1);
}

.risk-card.moderate-risk {
  border-color: var(--warning-color);
  background: rgba(241, 250, 140, 0.1);
}

.risk-card.low-risk {
  border-color: var(--success-color);
  background: rgba(80, 250, 123, 0.1);
}

.risk-card.info {
  border-color: var(--info-color);
  background: rgba(139, 233, 253, 0.1);
}

.risk-card.warning {
  border-color: var(--warning-color);
  background: rgba(241, 250, 140, 0.1);
}

.risk-card.success {
  border-color: var(--success-color);
  background: rgba(80, 250, 123, 0.1);
}

.risk-card.stable {
  border-color: var(--primary-color);
  background: rgba(189, 147, 249, 0.1);
}

.risk-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

.risk-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.risk-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
}

.risk-explanation {
  background: rgba(139, 233, 253, 0.1);
  border: 1px solid var(--info-color);
  border-radius: 0.5rem;
  padding: 1rem;
  color: var(--info-color);
}

/* Mobile risk cards */
@media (max-width: 767.98px) {
  .risk-assessment {
    padding: 1.5rem 1rem;
  }
  
  .risk-card {
    margin-bottom: 1rem;
    padding: 1rem;
  }
  
  .risk-icon {
    font-size: 1.5rem;
  }
  
  .risk-value {
    font-size: 1rem;
  }
}

/* Local Data Section (State/Country) */
.local-data-section {
  background: rgba(80, 250, 123, 0.05);
  border: 1px solid var(--success-color);
  border-radius: 1rem;
  padding: 2rem;
}

.local-data-section h4 {
  color: var(--success-color);
  font-weight: 600;
}

.local-stat-card {
  background: var(--card-bg);
  border: 1px solid var(--success-color);
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
  transition: all 0.2s ease;
  height: 100%;
}

.local-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(80, 250, 123, 0.2);
  border-color: var(--primary-color);
}

.local-stat-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  display: block;
}

.local-stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.local-stat-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--success-color);
  line-height: 1.2;
}

/* Nearby Countries Section */
.nearby-section {
  background: rgba(139, 233, 253, 0.05);
  border: 1px solid var(--info-color);
  border-radius: 1rem;
  padding: 2rem;
}

.nearby-section h4 {
  color: var(--info-color);
  font-weight: 600;
}

.nearby-country-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
}

.nearby-country-card:hover {
  border-color: var(--info-color);
  transform: translateY(-1px);
  box-shadow: 0 2px 10px rgba(139, 233, 253, 0.15);
}

.country-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.country-distance {
  font-size: 0.75rem;
  color: var(--info-color);
  font-weight: 500;
}

.country-stats {
  text-align: right;
  font-size: 0.75rem;
}

/* Mobile optimizations */
@media (max-width: 767.98px) {
  .local-data-section,
  .nearby-section {
    padding: 1.5rem 1rem;
  }
  
  .local-stat-card {
    margin-bottom: 1rem;
    padding: 0.75rem;
  }
  
  .local-stat-icon {
    font-size: 1.25rem;
  }
  
  .local-stat-value {
    font-size: 0.875rem;
  }
  
  .nearby-country-card {
    padding: 0.75rem;
  }
  
  .country-name {
    font-size: 0.875rem;
  }
}

/* Footer */
.app-footer {
  background-color: var(--navbar-bg);
  border-top: 1px solid var(--border-color);
  margin-top: auto;
  padding: 2rem 0 1rem;
}

.footer-section {
  margin-bottom: 1.5rem;
  text-align: center;
}

.footer-section:last-child {
  margin-bottom: 0;
}

.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

.developer-info,
.opensource-info {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.6;
}

.heart-icons {
  font-size: 1.2rem;
  display: inline-block;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.developer-link,
.source-link {
  color: var(--link-color);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.developer-link:hover,
.source-link:hover {
  color: var(--link-hover);
  text-decoration: underline;
}

.data-sources {
  border-top: 1px solid var(--border-color);
  padding-top: 1.5rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.sources-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}

@media (min-width: 576px) {
  .sources-list {
    flex-direction: row;
    justify-content: center;
    gap: 2rem;
  }
}

.footer-bottom {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.copyright {
  color: var(--text-muted);
  margin: 0;
  font-size: 0.75rem;
}

/* High Contrast Support */
@media (prefers-contrast: high) {
  .nav-link:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  .location-card {
    border-width: 2px;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .heart-icons {
    animation: none;
  }
  
  .nav-link,
  .navbar-brand,
  .skip-link,
  .location-card {
    transition: none;
  }
  
  .location-card:hover {
    transform: none;
  }
}
</style>