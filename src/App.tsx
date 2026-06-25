import { useState } from 'react'
import './App.css'

function App() {
  const [result, setResult] = useState<BatteryHealthResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function checkHealth() {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const data = await window.batteryAPI.getHealth()
      setResult(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not read battery health on this device.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app">
      <section className="panel">
        <p className="eyebrow">LOCAL BATTERY DIAGNOSTIC</p>
        <h1>Battery Health</h1>
        <p className="subtitle">
          Checks your battery capacity locally. No account, no cloud, no weird upload.
        </p>

        <button className="check-button" onClick={checkHealth} disabled={loading}>
          {loading ? 'Checking battery...' : 'Check battery health'}
        </button>

        {result && (
          <div className="result">
            <div className="health-number">{result.healthPercent}%</div>
            <p className="health-label">Estimated battery health</p>

            <div className="metrics">
              <div className="metric">
                <span>Full charge capacity</span>
                <strong>{result.fullChargeCapacityMWh.toLocaleString()} mWh</strong>
              </div>

              <div className="metric">
                <span>Design capacity</span>
                <strong>{result.designCapacityMWh.toLocaleString()} mWh</strong>
              </div>
            </div>
          </div>
        )}

        {error && <p className="error">{error}</p>}
      </section>
    </main>
  )
}

export default App