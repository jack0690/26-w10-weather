import { useState, useEffect } from 'react'
import {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  Droplets,
  Wind,
  Thermometer,
  RefreshCw,
  AlertCircle,
  MapPin,
  Activity,
  Calendar
} from 'lucide-react'
import {
  DEFAULT_CITIES,
  getWeatherInfo,
  getAirQualityStatus,
  fetchWeatherData,
  fetchAirQualityData
} from './api/weather'
import './App.css'

// 날씨 코드에 따른 Lucide 아이콘 매핑 헬퍼 컴포넌트
function WeatherIcon({ name, size = 48, color = '#f59e0b', className = '' }) {
  const iconMap = {
    Sun,
    SunDim,
    CloudSun,
    Cloud,
    CloudFog,
    CloudDrizzle,
    CloudRain,
    Snowflake,
    CloudLightning,
  }

  const IconComponent = iconMap[name] || Cloud
  return <IconComponent size={size} color={color} className={className} />
}

function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weatherData, setWeatherData] = useState(null)
  const [airQualityData, setAirQualityData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState('')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const [weatherRes, airRes] = await Promise.all([
          fetchWeatherData(selectedCity.lat, selectedCity.lon),
          fetchAirQualityData(selectedCity.lat, selectedCity.lon),
        ])

        if (!ignore) {
          setWeatherData(weatherRes)
          setAirQualityData(airRes)
          const now = new Date()
          setLastUpdated(
            now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
          )
        }
      } catch (err) {
        if (!ignore) {
          console.error('데이터 로드 실패:', err)
          setError(
            err.message ||
              '날씨 정보를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
          )
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [selectedCity, refreshTrigger])

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const currentWeather = weatherData?.current
  const currentAir = airQualityData?.current
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weather_code) : null
  const airQualityStatus = currentAir ? getAirQualityStatus(currentAir.pm10, currentAir.pm2_5) : null

  return (
    <div className="dashboard-container">
      {/* 헤더 섹션 */}
      <header className="dashboard-header">
        <div className="header-title-wrap">
          <div className="app-badge">실시간 기상 대시보드</div>
          <h1>대한민국 날씨 & 미세먼지</h1>
          <p className="sub-desc">Open-Meteo 공개 API를 활용한 실시간 기상 관측 데이터</p>
        </div>
        <button
          type="button"
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={loading}
          title="데이터 새로고침"
        >
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          <span>새로고침</span>
        </button>
      </header>

      {/* 도시 빠른 선택 버튼 목록 */}
      <nav className="city-nav-section" aria-label="주요 도시 선택">
        <div className="city-nav-label">
          <MapPin size={16} />
          <span>주요 도시 빠른 선택</span>
        </div>
        <div className="city-btn-group">
          {DEFAULT_CITIES.map((city) => (
            <button
              key={city.name}
              type="button"
              className={`city-btn ${selectedCity.name === city.name ? 'active' : ''}`}
              onClick={() => setSelectedCity(city)}
            >
              {city.name}
            </button>
          ))}
        </div>
      </nav>

      {/* 로딩 표시 */}
      {loading && (
        <div className="status-banner loading-banner">
          <RefreshCw size={24} className="spinning" />
          <p>
            <strong>{selectedCity.name}</strong>의 최신 날씨 및 미세먼지 정보를 불러오는 중입니다...
          </p>
        </div>
      )}

      {/* 오류 발생 시 안내 */}
      {error && !loading && (
        <div className="status-banner error-banner">
          <AlertCircle size={28} className="error-icon" />
          <div className="error-content">
            <h4>기상 정보를 가져오지 못했습니다</h4>
            <p>{error}</p>
            <button
              type="button"
              className="retry-btn"
              onClick={handleRefresh}
            >
              다시 시도
            </button>
          </div>
        </div>
      )}

      {/* 정상 데이터 표시 영역 */}
      {!loading && !error && currentWeather && currentAir && (
        <main className="cards-grid">
          {/* 1. 현재 날씨 카드 */}
          <section className="dashboard-card weather-card">
            <div className="card-top">
              <div className="city-info">
                <span className="location-tag">
                  <MapPin size={14} /> 현재 위치
                </span>
                <h2 className="city-title">{selectedCity.name}</h2>
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
                  {Math.round(currentWeather.temperature_2m)}
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
                  {Math.round(currentWeather.apparent_temperature)}°C
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <Droplets size={16} className="detail-icon humidity-icon" />
                  <span>습도</span>
                </div>
                <div className="detail-val">
                  {currentWeather.relative_humidity_2m}%
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-label">
                  <Wind size={16} className="detail-icon wind-icon" />
                  <span>풍속</span>
                </div>
                <div className="detail-val">
                  {currentWeather.wind_speed_10m} m/s
                </div>
              </div>
            </div>
          </section>

          {/* 2. 미세먼지 카드 */}
          <section className="dashboard-card air-quality-card">
            <div className="card-top">
              <div className="city-info">
                <span className="location-tag">
                  <Activity size={14} /> 대기질 지수
                </span>
                <h2 className="city-title">미세먼지 현황</h2>
                <span className="time-tag">한국 환경부 기준</span>
              </div>
              <div
                className="air-status-badge"
                style={{
                  backgroundColor: airQualityStatus.badgeColor,
                  boxShadow: `0 4px 12px ${airQualityStatus.badgeColor}40`,
                }}
              >
                {airQualityStatus.status}
              </div>
            </div>

            <div className="air-quality-gauges">
              <div className="gauge-item">
                <div className="gauge-header">
                  <span className="gauge-name">미세먼지 (PM10)</span>
                  <span className="gauge-value">
                    <strong>{Math.round(currentAir.pm10 ?? 0)}</strong> µg/m³
                  </span>
                </div>
                <div className="gauge-bar-bg">
                  <div
                    className="gauge-bar-fill"
                    style={{
                      width: `${Math.min(100, ((currentAir.pm10 ?? 0) / 160) * 100)}%`,
                      backgroundColor: airQualityStatus.badgeColor,
                    }}
                  />
                </div>
                <div className="gauge-scale">
                  <span>0</span>
                  <span>좋음(30)</span>
                  <span>보통(80)</span>
                  <span>나쁨(150)</span>
                </div>
              </div>

              <div className="gauge-item">
                <div className="gauge-header">
                  <span className="gauge-name">초미세먼지 (PM2.5)</span>
                  <span className="gauge-value">
                    <strong>{Math.round(currentAir.pm2_5 ?? 0)}</strong> µg/m³
                  </span>
                </div>
                <div className="gauge-bar-bg">
                  <div
                    className="gauge-bar-fill"
                    style={{
                      width: `${Math.min(100, ((currentAir.pm2_5 ?? 0) / 80) * 100)}%`,
                      backgroundColor: airQualityStatus.badgeColor,
                    }}
                  />
                </div>
                <div className="gauge-scale">
                  <span>0</span>
                  <span>좋음(15)</span>
                  <span>보통(35)</span>
                  <span>나쁨(75)</span>
                </div>
              </div>
            </div>

            <div className="air-summary-box">
              <p>
                현재 <strong>{selectedCity.name}</strong>의 대기 상태는{' '}
                <strong style={{ color: airQualityStatus.badgeColor }}>
                  {airQualityStatus.status}
                </strong>
                입니다.{' '}
                {airQualityStatus.status === '좋음' && '야외 활동을 하기에 아주 좋은 공기입니다! 😊'}
                {airQualityStatus.status === '보통' && '무난한 공기질입니다. 일상 활동에 무리가 없습니다. 🌤️'}
                {airQualityStatus.status === '나쁨' && '호흡기 민감군은 장시간 무리한 실외 활동을 자제하세요. 😷'}
                {airQualityStatus.status === '매우 나쁨' && '가급적 외출을 삼가고 마스크를 반드시 착용하세요! ⚠️'}
              </p>
            </div>
          </section>
        </main>
      )}

      {/* 푸터 영역 */}
      <footer className="dashboard-footer">
        <p>
          데이터 제공:{' '}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo API
          </a>{' '}
          (WMO 기상 데이터 & CAMS 공기질 데이터)
        </p>
        <p className="copyright">한국폴리텍대학 강서캠퍼스 사이버보안과 웹콘텐츠 제작 10주차 실습</p>
      </footer>
    </div>
  )
}

export default App
