import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Cloud, CloudRain, Sun, Wind, Droplets, AlertTriangle, MapPin, Loader, Search, Eye, Gauge } from 'lucide-react'

export default function WeatherPage() {
  const [searchInput, setSearchInput] = useState('')
  const [userLocation, setUserLocation] = useState(null)
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)

  // Get user location on mount
  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        // Set timeout for geolocation request (5 seconds max)
        const timeoutId = setTimeout(() => {
          console.log('Geolocation timeout - user can search manually')
          setError(null)
          setLoading(false)
        }, 5000)

        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(timeoutId)
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              name: 'Your Location'
            })
            setSelectedLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              name: 'Your Location'
            })
            fetchWeatherAndForecast(position.coords.latitude, position.coords.longitude, 'Your Location')
          },
          (err) => {
            clearTimeout(timeoutId)
            console.log('Geolocation error:', err.message)
            // Don't show error, just allow user to search
            setError(null)
            setLoading(false)
          },
          {
            timeout: 5000,
            enableHighAccuracy: false,
            maximumAge: 300000 // Cache location for 5 minutes
          }
        )
      } else {
        console.log('Geolocation not supported')
        setError(null)
        setLoading(false)
      }
    }

    getLocation()
  }, [])

  // Fetch weather and forecast data
  const fetchWeatherAndForecast = async (lat, lon, locationName) => {
    setLoading(true)
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,cloud_cover,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,uv_index_max&hourly=temperature_2m,weather_code,precipitation&timezone=auto`
      )
      const data = await response.json()
      
      setWeather({
        temperature: data.current.temperature_2m,
        condition: getWeatherCondition(data.current.weather_code),
        weatherCode: data.current.weather_code,
        humidity: data.current.relative_humidity_2m,
        apparentTemp: data.current.apparent_temperature,
        rainfall: data.current.precipitation || 0,
        windSpeed: data.current.wind_speed_10m,
        cloudCover: data.current.cloud_cover,
        visibility: data.current.visibility / 1000, // Convert to km
        timezone: data.timezone,
        raining: data.current.precipitation > 0,
        snowing: data.current.weather_code >= 71 && data.current.weather_code <= 77,
      })

      // Format forecast
      const forecastData = []
      for (let i = 0; i < data.daily.time.length; i++) {
        forecastData.push({
          date: data.daily.time[i],
          maxTemp: data.daily.temperature_2m_max[i],
          minTemp: data.daily.temperature_2m_min[i],
          condition: getWeatherCondition(data.daily.weather_code[i]),
          weatherCode: data.daily.weather_code[i],
          precipitation: data.daily.precipitation_sum[i],
          windSpeed: data.daily.wind_speed_10m_max[i],
          uvIndex: data.daily.uv_index_max[i],
        })
      }
      setForecast(forecastData)
      setSelectedLocation({ latitude: lat, longitude: lon, name: locationName })
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      console.error('Weather fetch error:', err)
      setError('Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }

  // Search for locations
  const handleLocationSearch = async (value) => {
    setSearchInput(value)
    
    if (!value || value.length < 2) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(value)}&count=5&language=en&format=json`
      )
      const data = await response.json()
      
      if (data.results) {
        setSearchResults(data.results)
      } else {
        setSearchResults([])
      }
    } catch (err) {
      console.error('Search error:', err)
      setSearchResults([])
    }
  }

  // Select location from search results
  const selectLocation = (result) => {
    const locationName = `${result.name}${result.admin1 ? ', ' + result.admin1 : ''}${result.country ? ', ' + result.country : ''}`
    fetchWeatherAndForecast(result.latitude, result.longitude, locationName)
    setSearchInput('')
    setSearchResults([])
  }

  const handleRefresh = () => {
    if (selectedLocation) {
      fetchWeatherAndForecast(selectedLocation.latitude, selectedLocation.longitude, selectedLocation.name)
    }
  }

  const getWeatherCondition = (code) => {
    // WMO Weather interpretation codes
    if (!code) return 'Unknown'
    if (code === 0) return 'Clear sky'
    if (code === 1 || code === 2) return 'Partly cloudy'
    if (code === 3) return 'Overcast'
    if (code === 45 || code === 48) return 'Foggy'
    if (code >= 51 && code <= 67) return 'Drizzle'
    if (code >= 71 && code <= 77) return 'Snow'
    if (code >= 80 && code <= 82) return 'Rain showers'
    if (code >= 85 && code <= 86) return 'Snow showers'
    if (code >= 80 && code <= 82) return 'Thunderstorm'
    return 'Variable'
  }

  const getWeatherIcon = (code) => {
    if (!code) return '🌍'
    if (code === 0) return '●'
    if (code === 1 || code === 2) return '◐'
    if (code === 3) return '○'
    if (code === 45 || code === 48) return '◤'
    if (code >= 51 && code <= 67) return '◑'
    if (code >= 71 && code <= 77) return '❄'
    if (code >= 80 && code <= 82) return '≈'
    if (code >= 85 && code <= 86) return '※'
    return '◎'
  }

  const getAlertLevel = (code) => {
    if (!code) return 'neutral'
    if (code >= 71 && code <= 77) return 'danger' // Snow
    if (code >= 80 && code <= 82) return 'danger' // Rain showers
    if (code >= 80 && code <= 82) return 'danger' // Thunderstorm
    if (code === 45 || code === 48) return 'warning' // Fog
    if (code === 3) return 'warning' // Overcast
    return 'safe'
  }

  const alertColors = {
    danger: 'from-red-600 to-red-800',
    warning: 'from-yellow-600 to-yellow-800',
    safe: 'from-green-600 to-green-800',
    neutral: 'from-blue-600 to-blue-800'
  }

  const alertLevel = weather ? getAlertLevel(weather.weatherCode) : 'neutral'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:bg-gray-900 dark:text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.hash = '#/dashboard'}
              className="flex items-center justify-center p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0 w-10 h-10"
            >
              <ArrowLeft size={18} />
            </motion.button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-3xl font-semibold text-gray-900 dark:text-white truncate">Weather</h1>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Live forecasts</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={loading}
            className="px-3 md:px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all disabled:opacity-50 font-semibold text-sm md:text-base flex-shrink-0"
          >
            {loading ? '...' : 'Refresh'}
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* Location Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative">
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-500 dark:focus-within:ring-blue-400 transition-all">
              <Search size={18} className="text-blue-600" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleLocationSearch(e.target.value)}
                placeholder="Search for a city or location..."
                className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none"
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden z-50 shadow-lg"
              >
                {searchResults.map((result, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => selectLocation(result)}
                    whileHover={{ backgroundColor: '#f3f4f6' }}
                    className="w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="text-gray-900 dark:text-white font-semibold">
                      <MapPin size={14} className="inline mr-2 text-blue-600" />
                      {result.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                      {result.admin1 && `${result.admin1}, `}{result.country}
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
          {selectedLocation && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">📍 {selectedLocation.name}</p>
          )}
        </motion.div>

        {loading && !weather ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-32"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
              />
              <p className="text-gray-600 dark:text-gray-400 text-lg">Fetching weather data...</p>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-center"
          >
            <AlertTriangle className="mx-auto mb-4 text-red-600 dark:text-red-400" size={40} />
            <p className="text-red-700 dark:text-red-400 text-lg font-semibold">{error}</p>
          </motion.div>
        ) : weather ? (
          <div className="space-y-6">
            {/* Main Weather Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 md:p-8 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-blue-200 dark:border-gray-600"
            >
              <div className="grid grid-cols-1 gap-6 md:gap-8">
                {/* Left - Main Info */}
                <div className="flex flex-col items-center justify-center">
                  <div className="text-6xl md:text-8xl mb-3 md:mb-4">{getWeatherIcon(weather.weatherCode)}</div>
                  <div className="text-center">
                    <div className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-1 md:mb-2">
                      {Math.round(weather.temperature)}°
                    </div>
                    <div className="text-lg md:text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                      {weather.condition}
                    </div>
                    <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                      Feels like {Math.round(weather.apparentTemp)}°C
                    </div>
                  </div>
                </div>

                {/* Right - Detailed Metrics */}
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} className="p-3 md:p-6 rounded-lg bg-white dark:bg-gray-700 border border-blue-100 dark:border-gray-600 text-center">
                    <Droplets className="mx-auto mb-1 md:mb-2 text-blue-600 dark:text-blue-400" size={20} />
                    <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1">{weather.humidity}%</div>
                    <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">Humidity</div>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} className="p-3 md:p-6 rounded-lg bg-white dark:bg-gray-700 border border-blue-100 dark:border-gray-600 text-center">
                    <Wind className="mx-auto mb-1 md:mb-2 text-blue-600 dark:text-blue-400" size={20} />
                    <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1">{Math.round(weather.windSpeed)}</div>
                    <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">Wind</div>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} className="p-3 md:p-6 rounded-lg bg-white dark:bg-gray-700 border border-blue-100 dark:border-gray-600 text-center">
                    <Cloud className="mx-auto mb-1 md:mb-2 text-blue-600 dark:text-blue-400" size={20} />
                    <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1">{weather.cloudCover}%</div>
                    <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">Cloud</div>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.05 }} className="p-3 md:p-6 rounded-lg bg-white dark:bg-gray-700 border border-blue-100 dark:border-gray-600 text-center">
                    <Eye className="mx-auto mb-1 md:mb-2 text-blue-600 dark:text-blue-400" size={20} />
                    <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1">{Math.round(weather.visibility)}</div>
                    <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">Visibility</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Alert if needed */}
            {alertLevel !== 'safe' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-lg border ${
                  alertLevel === 'danger'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                }`}
              >
                <div className="flex items-start gap-4">
                  <AlertTriangle className={alertLevel === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'} size={32} />
                  <div>
                    <h3 className={`text-xl font-bold mb-2 ${alertLevel === 'danger' ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}>
                      Weather Alert
                    </h3>
                    <p className={`text-lg ${alertLevel === 'danger' ? 'text-red-600 dark:text-red-300' : 'text-amber-600 dark:text-amber-300'}`}>
                      {weather.raining && 'Rain detected'}
                      {weather.snowing && 'Snow - Drive carefully'}
                      {weather.cloudCover > 80 && 'Heavy cloud cover'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 7-Day Forecast */}
            {forecast && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 md:p-6 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-6">7-Day Forecast</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                  {forecast.slice(0, 8).map((day, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      className="p-3 md:p-4 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-blue-200 dark:hover:border-blue-500 hover:shadow-md transition-all text-center"
                    >
                      <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1 md:mb-2">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-3xl md:text-4xl mb-2">{getWeatherIcon(day.weatherCode)}</div>
                      <div className="text-xs md:text-sm text-gray-700 dark:text-gray-300 mb-2">{day.condition}</div>
                      <div className="flex justify-center gap-1 md:gap-2 mb-2">
                        <div className="p-1 md:p-2 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800">
                          <div className="text-xs text-gray-600 dark:text-gray-400">H</div>
                          <div className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">{Math.round(day.maxTemp)}°</div>
                        </div>
                        <div className="p-1 md:p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800">
                          <div className="text-xs text-gray-600 dark:text-gray-400">L</div>
                          <div className="text-sm md:text-lg font-bold text-gray-900 dark:text-white">{Math.round(day.minTemp)}°</div>
                        </div>
                      </div>
                      {day.precipitation > 0 && (
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          💧 {Math.round(day.precipitation)}mm
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Update Time */}
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4">
              {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

