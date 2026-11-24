import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import { getWeatherInfo } from '../api/weather'
import WeatherIcon from './WeatherIcon'

export default function HourlyChart({ hourly, currentHourIso }) {
  const chartData = useMemo(() => {
    if (!hourly || !hourly.time || !hourly.temperature_2m) return null

    let startIndex = 0
    if (currentHourIso) {
      const idx = hourly.time.findIndex((t) => t >= currentHourIso)
      if (idx !== -1 && idx + 24 <= hourly.time.length) {
        startIndex = idx
      }
    }

    const hoursData = hourly.time.slice(startIndex, startIndex + 24).map((timeStr, idx) => {
      const originalIndex = startIndex + idx
      const dateObj = new Date(timeStr)
      const hour = dateObj.getHours()
      const temp = Math.round(hourly.temperature_2m[originalIndex])
      const weatherCode = hourly.weather_code?.[originalIndex] ?? 0
      return {
        timeStr,
        displayTime: idx === 0 ? '지금' : `${hour}시`,
        temp,
        weatherCode,
        weatherInfo: getWeatherInfo(weatherCode),
      }
    })

    const temps = hoursData.map((d) => d.temp)
    const minTemp = Math.min(...temps)
    const maxTemp = Math.max(...temps)
    const tempRange = Math.max(1, maxTemp - minTemp)

    const width = 800
    const height = 140
    const paddingX = 30
    const paddingTop = 25
    const paddingBottom = 25
    const usableWidth = width - paddingX * 2
    const usableHeight = height - paddingTop - paddingBottom

    const points = hoursData.map((d, i) => {
      const x = paddingX + (i / (hoursData.length - 1)) * usableWidth
      const y = paddingTop + usableHeight - ((d.temp - minTemp) / tempRange) * usableHeight
      return { x, y, ...d }
    })

    const polylinePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    const areaPath = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)} ` +
      points.map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') +
      ` L ${points[points.length - 1].x.toFixed(1)},${height} L ${points[0].x.toFixed(1)},${height} Z`

    return {
      hoursData,
      points,
      polylinePoints,
      areaPath,
      minTemp,
      maxTemp,
      width,
      height,
    }
  }, [hourly, currentHourIso])

  if (!chartData) return null

  const {
    hoursData,
    points,
    polylinePoints,
    areaPath,
    minTemp,
    maxTemp,
    width,
    height,
  } = chartData

  return (
    <section className="dashboard-card hourly-card">
      <div className="card-top">
        <div className="city-info">
          <span className="location-tag">
            <Clock size={14} /> 24시간 예보
          </span>
          <h2 className="city-title">시간대별 기온 변화</h2>
        </div>
        <div className="hourly-summary-tag">
          최저 <strong className="min-temp">{minTemp}°</strong> / 최고 <strong className="max-temp">{maxTemp}°</strong>
        </div>
      </div>

      {/* SVG 꺾은선 차트 시각화 */}
      <div className="svg-chart-container">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="hourly-svg-chart"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 그라데이션 면적 */}
          <path d={areaPath} fill="url(#tempGradient)" />

          {/* 꺾은선 */}
          <polyline
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylinePoints}
          />

          {/* 주요 포인트 원 및 온도 텍스트 */}
          {points.map((p, idx) => (
            <g key={p.timeStr}>
              <circle
                cx={p.x}
                cy={p.y}
                r={idx === 0 ? 5 : 3.5}
                fill={idx === 0 ? '#ef4444' : '#2563eb'}
                stroke="#ffffff"
                strokeWidth="2"
              />
              {/* 3시간 단위 또는 첫/끝 지점 기온 라벨 표시 */}
              {(idx % 3 === 0 || idx === 0 || idx === points.length - 1) && (
                <text
                  x={p.x}
                  y={p.y - 10}
                  textAnchor="middle"
                  className="chart-temp-label"
                >
                  {p.temp}°
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* 가로 스크롤 가능한 24시간 타임라인 바 */}
      <div className="hourly-timeline-scroll">
        {hoursData.map((item, idx) => (
          <div
            key={item.timeStr}
            className={`hourly-time-item ${idx === 0 ? 'current' : ''}`}
          >
            <span className="hourly-time">{item.displayTime}</span>
            <div className="hourly-icon">
              <WeatherIcon
                name={item.weatherInfo.icon}
                size={22}
                color={item.weatherInfo.color}
              />
            </div>
            <span className="hourly-temp">{item.temp}°</span>
          </div>
        ))}
      </div>
    </section>
  )
}
