import { useState, useEffect } from 'react'
import './App.css'
import api from './services/api'

function App() {
  const [count, setCount] = useState(0)
  const [status, setStatus] = useState('Checking API connection...')

  useEffect(() => {
    // Test API connection
    api.get('/health/')
      .then(() => setStatus('Connected to backend'))
      .catch(err => setStatus('Backend connection failed: ' + err.message))
  }, [])

  return (
    <div className="App">
      <header>
        <h1>Swaraj Setu</h1>
        <p className="subtitle">Civic Grievance Redressal Platform</p>
      </header>
      
      <main>
        <section className="welcome">
          <h2>Welcome to Swaraj Setu</h2>
          <p>A transparent bridge between citizens and government for efficient grievance redressal.</p>
        </section>

        <section className="api-status">
          <h3>API Status</h3>
          <p>{status}</p>
        </section>

        <section className="counter">
          <h3>Counter: {count}</h3>
          <button onClick={() => setCount(count + 1)}>
            Increment
          </button>
        </section>
      </main>
    </div>
  )
}

export default App
