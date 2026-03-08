import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Live from './pages/Live';
import AIChat from './components/AIChat';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/live" element={<Live />} />
        </Routes>
        
        {/* Chat IA en bas à droite de toutes les pages */}
        <div className="fixed bottom-6 right-6 z-50">
          <AIChat />
        </div>
      </div>
    </Router>
  );
}

export default App;
