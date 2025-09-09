export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="backdrop-blur-lg bg-white/10 border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">VerifAI Trading</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <a 
              href="/auth/signin"
              className="px-4 py-2 text-white/80 hover:text-white transition-colors"
            >
              Sign In
            </a>
            <a 
              href="/auth/signin"
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Glassmorphic Container */}
          <div className="backdrop-blur-lg bg-white/10 rounded-3xl border border-white/20 p-12 shadow-2xl">
            {/* Logo/Brand */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2.05v2.02c4.39.54 7.5 4.53 6.96 8.92-.46 3.64-3.32 6.5-6.96 6.96v2.02c5.5-.55 9.5-5.43 8.95-10.93C21.45 6.37 17.63 2.55 13 2.05z"/>
                  <path d="M11 2.05C6.5 2.6 2.5 7.48 3.05 12.98c.5 4.67 4.28 8.49 8.95 8.99v-2.02c-3.64-.46-6.5-3.32-6.96-6.96C4.5 8.58 7.61 4.59 12 4.05V2.05h-1z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
                VerifAI Trading
              </h1>
              <p className="text-xl text-blue-200 font-medium">
                AI-Powered Stock Swing Trading Platform
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="backdrop-blur-sm bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-blue-500 mb-4 mx-auto flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">AI Analysis</h3>
                <p className="text-blue-200 text-sm">Advanced OpenAI-powered stock analysis and recommendations</p>
              </div>

              <div className="backdrop-blur-sm bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 mb-4 mx-auto flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Real-Time Data</h3>
                <p className="text-blue-200 text-sm">Live market data and TradingView chart integration</p>
              </div>

              <div className="backdrop-blur-sm bg-white/5 rounded-xl p-6 border border-white/10">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 mb-4 mx-auto flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Smart Alerts</h3>
                <p className="text-blue-200 text-sm">Intelligent email notifications for trading opportunities</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a 
                href="/auth/signin"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                Get Started
              </a>
              <a 
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
              >
                View Dashboard
              </a>
            </div>

            {/* Status */}
            <div className="text-center">
              <p className="text-blue-200 text-sm mb-2">System Status: <span className="text-green-400 font-medium">Online</span></p>
              <p className="text-blue-300 text-xs">Market Data: Real-time via Finnhub API</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-blue-300 text-sm">
        <p>&copy; 2024 VerifAI Trading. Powered by OpenAI, Supabase, and TradingView.</p>
      </footer>
    </div>
  )
}
