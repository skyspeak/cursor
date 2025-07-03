import React, { useState } from 'react';
import './App.css';

const API_KEY = '37cc72f74f45956103d97c85ee886da0';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeatherByCity = async (query) => {
    setLoading(true);
    setError('');
    setWeather(null);
    try {
      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${API_KEY}`
      );
      const geoData = await geoRes.json();
      console.log('Geocoding API response:', geoData);
      if (!geoRes.ok || !geoData.length) throw new Error('City not found');
      const { lat, lon } = geoData[0];
      await fetchWeatherByCoords(lat, lon);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError('');
    setWeather(null);
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      console.log('Weather API response:', data);
      if (!res.ok) throw new Error('Location not found');
      setWeather(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCitySubmit = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeatherByCity(city.trim());
    }
  };

  const handleGeoLocate = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setError('Unable to retrieve your location');
        setLoading(false);
      }
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Weather App</h1>
        <form onSubmit={handleCitySubmit} style={{ marginBottom: 16 }}>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name"
            style={{ padding: 8, fontSize: 16 }}
          />
          <button type="submit" style={{ marginLeft: 8, padding: 8, fontSize: 16 }}>
            Get Weather
          </button>
        </form>
        <button onClick={handleGeoLocate} style={{ padding: 8, fontSize: 16 }}>
          Detect My Location
        </button>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {weather && (
          <div style={{ marginTop: 24 }}>
            <h2>{weather.name}, {weather.sys.country}</h2>
            <p style={{ fontSize: 32 }}>{Math.round(weather.main.temp)}°C</p>
            <p>{weather.weather[0].description}</p>
            <p>Humidity: {weather.main.humidity}%</p>
            <p>Wind: {Math.round(weather.wind.speed)} m/s</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
