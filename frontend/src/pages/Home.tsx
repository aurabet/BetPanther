import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="text-center">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to BookMaker Africa
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your premier destination for sports betting in Africa
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-800 mb-2">Live Betting</h3>
            <p className="text-blue-600">Bet on live matches with real-time odds</p>
            <Link 
              to="/live" 
              className="block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Betting
            </Link>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-green-800 mb-2">Dashboard</h3>
            <p className="text-green-600">Track your bets and manage your account</p>
            <Link 
              to="/dashboard" 
              className="block mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              View Dashboard
            </Link>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-purple-800 mb-2">Best Odds</h3>
            <p className="text-purple-600">Competitive odds across all major sports</p>
            <button className="block mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              View Odds
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Today's Matches</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-semibold">AC Milan vs Inter</p>
                <p className="text-sm text-gray-600">Serie A - 20:45</p>
              </div>
              <div className="text-right">
                <p className="text-green-600 font-semibold">1.85</p>
                <button className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                  Bet
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <p className="font-semibold">Liverpool vs Man United</p>
                <p className="text-sm text-gray-600">Premier League - 21:00</p>
              </div>
              <div className="text-right">
                <p className="text-green-600 font-semibold">2.10</p>
                <button className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                  Bet
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">1,234</p>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">€2.5M</p>
              <p className="text-sm text-gray-600">Total Bets</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">98%</p>
              <p className="text-sm text-gray-600">Payout Rate</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">24/7</p>
              <p className="text-sm text-gray-600">Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home