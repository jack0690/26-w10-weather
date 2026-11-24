import { useState, useEffect } from 'react'
import { RefreshCw, AlertCircle, MapPin } from 'lucide-react'
import {
  DEFAULT_CITIES,
  fetchWeatherData,
  fetchAirQualityData,
} from './api/weather'
import CurrentWeather from './components/CurrentWeather'
import AirQualityCard from './components/AirQualityCard'
import HourlyChart from './components/HourlyChart'
import WeeklyForecast from './components/WeeklyForecast'
import CitySearch from './components/CitySearch'
import './App.css'

function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weatherData, setWeatherData] = useState(null)
  const [airQualityData, setAirQualityData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState('')
  const [currentHourIso, setCurrentHourIso] = useState('')
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
          setCurrentHourIso(`${now.toISOString().slice(0, 13)}:00`)
        }
      } catch (err) {
        if (!ignore) {
          console.error('기상 데이터 로드 실패:', err)
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

  const handleSelectSearchedCity = (city) => {
    setSelectedCity(city)
  }

  return (
    <div className="dashboard-container">
      {/* 헤더 & 검색 영역 */}
      <header className="dashboard-header">
        <div className="header-top-row">
          <div className="header-title-wrap">
            <div className="app-badge">실시간 기상 대시보드 2.0</div>
            <h1>대한민국 & 전세계 날씨 대시보드</h1>
            <p className="sub-desc">
              Open-Meteo 공개 API를 활용한 24시간 차트, 7일 주간예보 및 대기질 관측
            </p>
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
        </div>

        {/* 400ms 디바운스 적용 도시 검색창 */}
        <div className="search-bar-wrapper">
          <CitySearch onSelectCity={handleSelectSearchedCity} />
        </div>
      </header>

      {/* 주요 도시 빠른 선택 버튼 목록 */}
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

      {/* 대시보드 메인 콘텐츠 그리드 */}
      {!loading && !error && weatherData && airQualityData && (
        <main className="dashboard-content">
          {/* 상단 1열: 현재 날씨 & 미세먼지 카드 */}
          <div className="dashboard-top-grid">
            <CurrentWeather
              current={weatherData.current}
              city={selectedCity}
              lastUpdated={lastUpdated}
            />
            <AirQualityCard
              current={airQualityData.current}
              city={selectedCity}
            />
          </div>

          {/* 중단: 24시간 기온 SVG 차트 */}
          <HourlyChart
            hourly={weatherData.hourly}
            currentHourIso={currentHourIso}
          />

          {/* 하단: 7일간 주간 예보 */}
          <WeeklyForecast daily={weatherData.daily} />
        </main>
      )}

      {/* 푸터 영역 */}
      <footer className="dashboard-footer">
        <p>
          데이터 제공:{' '}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo API
          </a>{' '}
          (WMO 고해상도 기상 예측 모델 & CAMS 글로벌 대기질)
        </p>
        <p className="copyright">한국폴리텍대학 강서캠퍼스 사이버보안과 웹콘텐츠 제작 10주차 실습</p>
      </footer>
    </div>
  )
}

export default App
