const Live = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Live Betting</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Live Matches</h2>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">AC Milan vs Inter</span>
                <span className="text-sm text-gray-600">Live</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-sm text-gray-600">AC Milan</p>
                  <p className="font-bold text-green-600">2.10</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Draw</p>
                  <p className="font-bold text-blue-600">3.20</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Inter</p>
                  <p className="font-bold text-purple-600">2.80</p>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Score: 1-1 | Time: 75'
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Liverpool vs Man United</span>
                <span className="text-sm text-gray-600">Live</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-sm text-gray-600">Liverpool</p>
                  <p className="font-bold text-green-600">1.90</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Draw</p>
                  <p className="font-bold text-blue-600">3.50</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Man United</p>
                  <p className="font-bold text-purple-600">4.20</p>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Score: 2-0 | Time: 62'
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Bet</h2>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <p className="font-semibold mb-2">AC Milan vs Inter</p>
              <div className="grid grid-cols-3 gap-2">
                <button className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700">
                  AC Milan 2.10
                </button>
                <button className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700">
                  Draw 3.20
                </button>
                <button className="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700">
                  Inter 2.80
                </button>
              </div>
              <div className="mt-4 flex items-center space-x-4">
                <input 
                  type="number" 
                  placeholder="Bet amount" 
                  className="flex-1 px-3 py-2 border rounded-lg"
                />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Place Bet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Live