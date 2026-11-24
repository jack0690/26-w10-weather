import { MapPin, Calendar, Thermometer, Droplets, Wind } from 'lucide-react'
import { getWeatherInfo } from '../api/weather'
import WeatherIcon from './WeatherIcon'

export default function CurrentWeather({ current, city, lastUpdated }) {
  if (!current) return null

  const weatherInfo = getWeatherInfo(current.weather_code)

  return (
    <section className="dashboard-card weather-card">
      <div className="card-top">
        <div className="city-info">
          <span className="location-tag">
            <MapPin size={14} /> 현재 위치
          </span>
          <h2 className="city-title">{city.name}</h2>
          {lastUpdated && (
            <span className="time-tag">
              <Calendar size={13} /> {lastUpdated} 기준
            </span>
          )}
        </div>
        <div
          className="weather-badge"
          style={{
            backgroundColor: `${weatherInfo.color}18`,
            color: weatherInfo.color,
            borderColor: `${weatherInfo.color}55`,
          }}
        >
          {weatherInfo.label}
        </div>
      </div>

      <div className="weather-main-row">
        <div
          className="weather-icon-wrap"
          style={{ backgroundColor: `${weatherInfo.color}15` }}
        >
          <WeatherIcon
            name={weatherInfo.icon}
            size={64}
            color={weatherInfo.color}
            className="weather-lucide-icon"
          />
        </div>
        <div className="temperature-wrap">
          <div className="current-temp">
            {Math.round(current.temperature_2m)}
            <span className="unit">°C</span>
          </div>
          <div className="weather-phrase">{weatherInfo.label}</div>
        </div>
      </div>

      <div className="weather-details-grid">
        <div className="detail-item">
          <div className="detail-label">
            <Thermometer size={16} className="detail-icon temp-icon" />
            <span>체감 온도</span>
          </div>
          <div className="detail-val">
            {Math.round(current.apparent_temperature)}°C
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <Droplets size={16} className="detail-icon humidity-icon" />
            <span>습도</span>
          </div>
          <div className="detail-val">{current.relative_humidity_2m}%</div>
        </div>

        <div className="detail-item">
          <div className="detail-label">
            <Wind size={16} className="detail-icon wind-icon" />
            <span>풍속</span>
          </div>
          <div className="detail-val">{current.wind_speed_10m} m/s</div>
        </div>
      </div>
    </section>
  )
}

