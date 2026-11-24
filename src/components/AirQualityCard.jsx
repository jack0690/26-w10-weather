import { Activity } from 'lucide-react'
import { getAirQualityStatus } from '../api/weather'

export default function AirQualityCard({ current, city }) {
  if (!current) return null

  const pm10 = Math.round(current.pm10 ?? 0)
  const pm25 = Math.round(current.pm2_5 ?? 0)
  const { status, badgeColor } = getAirQualityStatus(pm10, pm25)

  return (
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
            backgroundColor: badgeColor,
            boxShadow: `0 4px 12px ${badgeColor}40`,
          }}
        >
          {status}
        </div>
      </div>

      <div className="air-quality-gauges">
        <div className="gauge-item">
          <div className="gauge-header">
            <span className="gauge-name">미세먼지 (PM10)</span>
            <span className="gauge-value">
              <strong>{pm10}</strong> µg/m³
            </span>
          </div>
          <div className="gauge-bar-bg">
            <div
              className="gauge-bar-fill"
              style={{
                width: `${Math.min(100, (pm10 / 160) * 100)}%`,
                backgroundColor: badgeColor,
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
              <strong>{pm25}</strong> µg/m³
            </span>
          </div>
          <div className="gauge-bar-bg">
            <div
              className="gauge-bar-fill"
              style={{
                width: `${Math.min(100, (pm25 / 80) * 100)}%`,
                backgroundColor: badgeColor,
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
          현재 <strong>{city.name}</strong>의 대기 상태는{' '}
          <strong style={{ color: badgeColor }}>{status}</strong>입니다.{' '}
          {status === '좋음' && '야외 활동을 하기에 아주 좋은 공기입니다! 😊'}
          {status === '보통' && '무난한 공기질입니다. 일상 활동에 무리가 없습니다. 🌤️'}
          {status === '나쁨' && '호흡기 민감군은 장시간 무리한 실외 활동을 자제하세요. 😷'}
          {status === '매우 나쁨' && '가급적 외출을 삼가고 마스크를 반드시 착용하세요! ⚠️'}
        </p>
      </div>
    </section>
  )
}

