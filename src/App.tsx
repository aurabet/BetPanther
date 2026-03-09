import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import './App.css';

// Page d'accueil simplifiée
function HomePage() {
  return (
    <div>
      <Header />
      <main className="container mx-auto p-4">
        <div className="bg-blue-600 text-white p-4 mb-4 rounded">
          <h2 className="text-xl font-bold">Thème du jour: Football Africain</h2>
          <p className="text-blue-100">Découvrez les meilleurs matchs et pronostics</p>
        </div>
        
        <h1 className="text-2xl text-white font-bold mb-6">
          Matchs du jour
        </h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-white font-bold mb-2">Sporting Bissau vs Benfica Bissau</h3>
            <p className="text-gray-400 text-sm mb-2">Championnat Guinée-Bissau</p>
            <div className="flex justify-between text-sm">
              <span className="text-green-400">1.85</span>
              <span className="text-yellow-400">3.40</span>
              <span className="text-red-400">4.20</span>
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-white font-bold mb-2">Dakar SC vs AS Douanes</h3>
            <p className="text-gray-400 text-sm mb-2">Ligue 1 Sénégal</p>
            <div className="flex justify-between text-sm">
              <span className="text-green-400">2.10</span>
              <span className="text-yellow-400">3.20</span>
              <span className="text-red-400">3.50</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function AuthPage() {
  return (
    <div>
      <Header />
      <main className="container mx-auto p-4">
        <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl text-white font-bold mb-4">Connexion</h2>
          <p className="text-gray-400 mb-4">Mode démo activé - pas de connexion requise</p>
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
            Continuer en mode démo
          </button>
        </div>
      </main>
    </div>
  );
}

function DashboardPage() {
  return (
    <div>
      <Header />
      <main className="container mx-auto p-4">
        <h1 className="text-2xl text-white font-bold mb-4">Tableau de bord</h1>
        <p className="text-gray-400">Mode démo - fonctionnalités limitées</p>
      </main>
    </div>
  );
}

function LivePage() {
  return (
    <div>
      <Header />
      <main className="container mx-auto p-4">
        <h1 className="text-2xl text-white font-bold mb-4">Matchs en direct</h1>
        <p className="text-gray-400">Mode démo - pas de données en direct</p>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/live" element={<LivePage />} />
        </Routes>
        
        {/* Chat IA en bas à droite de toutes les pages */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-gray-800 p-2 rounded-full">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
