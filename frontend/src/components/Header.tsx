import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <header className="bg-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-gray-800">
              BookMaker Africa
            </h1>
            <nav className="hidden md:flex space-x-6">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Home
              </Link>
              <Link 
                to="/dashboard" 
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                to="/live" 
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Live Betting
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Login
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Register
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header