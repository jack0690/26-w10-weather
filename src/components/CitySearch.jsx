import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, MapPin, X } from 'lucide-react'
import { searchCities } from '../api/weather'

export default function CitySearch({ onSelectCity }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // 400ms 디바운스 적용
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      return
    }

    let active = true
    const handler = setTimeout(async () => {
      setLoading(true)
      try {
        const cities = await searchCities(query)
        if (active) {
          setResults(cities)
          setIsOpen(true)
        }
      } catch (err) {
        console.error('도시 검색 오류:', err)
        if (active) {
          setResults([])
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }, 400) // 400ms 디바운스

    return () => {
      active = false
      clearTimeout(handler)
    }
  }, [query])

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleInputChange = (e) => {
    const val = e.target.value
    setQuery(val)
    if (val.trim().length < 2) {
      setResults([])
      setLoading(false)
      setIsOpen(false)
    }
  }

  const handleSelect = (city) => {
    const formattedName = [city.name, city.admin1, city.country]
      .filter(Boolean)
      .join(', ')

    onSelectCity({
      name: city.name,
      fullName: formattedName,
      lat: city.latitude,
      lon: city.longitude,
    })
    setQuery('')
    setIsOpen(false)
    setResults([])
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setLoading(false)
    setIsOpen(false)
  }

  return (
    <div className="search-container" ref={containerRef}>
      <div className="search-input-wrap">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="도시 검색 (예: Seoul, Busan, Jeju, Tokyo)..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setIsOpen(true)}
        />
        {loading && <Loader2 size={16} className="search-loader spinning" />}
        {query && !loading && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            title="검색어 지우기"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* 검색 결과 드롭다운 */}
      {isOpen && results.length > 0 && (
        <ul className="search-results-dropdown">
          {results.map((item) => (
            <li
              key={`${item.id || item.latitude}-${item.longitude}`}
              className="search-result-item"
              onClick={() => handleSelect(item)}
            >
              <MapPin size={16} className="result-pin" />
              <div className="result-text">
                <span className="result-main-name">{item.name}</span>
                <span className="result-sub-info">
                  {[item.admin1, item.country].filter(Boolean).join(', ')}
                </span>
              </div>
              <span className="result-coords">
                {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
              </span>
            </li>
          ))}
        </ul>
      )}

      {isOpen && query.trim().length >= 2 && !loading && results.length === 0 && (
        <div className="search-no-results">
          검색된 도시가 없습니다. 영문 도시명(예: Seoul, Tokyo)으로 검색해 보세요.
        </div>
      )}
    </div>
  )
}
