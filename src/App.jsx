import { useState, useEffect } from 'react'

function App() {
  const [healthStatus, setHealthStatus] = useState(null)

  useEffect(() => {
    // Test API connection
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealthStatus(data))
      .catch(err => console.error('API Error:', err))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 text-center">
              Welcome to Dating App
            </h1>
            <p className="text-gray-600 text-center mb-8 text-lg">
              Your modern dating platform is ready to go!
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200">
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                  Frontend
                </h2>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ React 18</li>
                  <li>✓ Tailwind CSS</li>
                  <li>✓ Vite</li>
                  <li>✓ Modern UI Ready</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                  Backend
                </h2>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Node.js</li>
                  <li>✓ Express</li>
                  <li>✓ CORS Enabled</li>
                  <li>✓ API Ready</li>
                </ul>
              </div>
            </div>

            {healthStatus && (
              <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-800 text-center">
                  <span className="font-semibold">API Status:</span> {healthStatus.status} 
                  {healthStatus.timestamp && (
                    <span className="text-sm block mt-1">
                      Connected at {new Date(healthStatus.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

