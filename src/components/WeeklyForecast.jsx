import { Calendar, Umbrella } from 'lucide-react'
import { getWeatherInfo } from '../api/weather'
import WeatherIcon from './WeatherIcon'

export default function WeeklyForecast({ daily }) {
  if (!daily || !daily.time) return null

  const daysList = daily.time.map((dateStr, idx) => {
    const dateObj = new Date(dateStr)
    const dayOfWeek = dateObj.toLocaleDateString('ko-KR', { weekday: 'short' })
    const monthDay = `${dateObj.getMonth() + 1}.${dateObj.getDate()}`
    const weatherCode = daily.weather_code[idx]
    const weatherInfo = getWeatherInfo(weatherCode)
    const maxTemp = Math.round(daily.temperature_2m_max[idx])
    const minTemp = Math.round(daily.temperature_2m_min[idx])
    const precipProb = daily.precipitation_probability_max?.[idx] ?? 0

    return {
      dateStr,
      dayLabel: idx === 0 ? '오늘' : idx === 1 ? '내일' : `${dayOfWeek}요일`,
      monthDay,
      weatherCode,
      weatherInfo,
      maxTemp,
      minTemp,
      precipProb,
    }
  })

  // 7일간 전체 최고/최저 기온 계산 (게이지 바 비율 산정용)
  const globalMin = Math.min(...daysList.map((d) => d.minTemp))
  const globalMax = Math.max(...daysList.map((d) => d.maxTemp))
  const range = Math.max(1, globalMax - globalMin)

  return (
    <section className="dashboard-card weekly-card">
      <div className="card-top">
        <div className="city-info">
          <span className="location-tag">
            <Calendar size={14} /> 7일 예보
          </span>
          <h2 className="city-title">주간 날씨 전망</h2>
        </div>
        <span className="time-tag">향후 일주일 기온 및 날씨</span>
      </div>

      <div className="weekly-list">
        {daysList.map((day, idx) => {
          const leftPercent = ((day.minTemp - globalMin) / range) * 100
          const barWidthPercent = Math.max(8, ((day.maxTemp - day.minTemp) / range) * 100)

          return (
            <div
              key={day.dateStr}
              className={`weekly-row ${idx === 0 ? 'today' : ''}`}
            >
              <div className="weekly-day-col">
                <span className="day-name">{day.dayLabel}</span>
                <span className="day-date">{day.monthDay}</span>
              </div>

              <div className="weekly-weather-col">
                <WeatherIcon
                  name={day.weatherInfo.icon}
                  size={24}
                  color={day.weatherInfo.color}
                />
                <span className="weekly-weather-label">{day.weatherInfo.label}</span>
                {day.precipProb > 0 && (
                  <span className="precip-prob">
                    <Umbrella size={12} />
                    {day.precipProb}%
                  </span>
                )}
              </div>

              <div className="weekly-temp-col">
                <span className="temp-min">{day.minTemp}°</span>
                <div className="temp-bar-track">
                  <div
                    className="temp-bar-fill"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${barWidthPercent}%`,
                    }}
                  />
                </div>
                <span className="temp-max">{day.maxTemp}°</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

