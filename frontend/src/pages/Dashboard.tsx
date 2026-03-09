const Dashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Balance</h2>
          <p className="text-3xl font-bold text-green-600">€1,250.00</p>
          <p className="text-sm text-gray-600 mt-2">Available for betting</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Bets</h2>
          <p className="text-3xl font-bold text-blue-600">5</p>
          <p className="text-sm text-gray-600 mt-2">Currently placed</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Win Rate</h2>
          <p className="text-3xl font-bold text-purple-600">68%</p>
          <p className="text-sm text-gray-600 mt-2">Success rate</p>
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 border rounded-lg">
            <div>
              <p className="font-semibold">AC Milan vs Inter</p>
              <p className="text-sm text-gray-600">Won €150.00</p>
            </div>
            <p className="text-green-600 font-semibold">+€150.00</p>
          </div>
          <div className="flex justify-between items-center p-4 border rounded-lg">
            <div>
              <p className="font-semibold">Liverpool vs Man United</p>
              <p className="text-sm text-gray-600">Lost €50.00</p>
            </div>
            <p className="text-red-600 font-semibold">-€50.00</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard