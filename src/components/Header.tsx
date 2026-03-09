import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', user.id)
          .single();
        setBalance(data?.balance || 0);
      }
    } catch (error) {
      console.log('Supabase non configuré, mode démo activé');
      // Mode démo pour le développement local
      setUser({ id: 'demo', email: 'demo@example.com' });
      setBalance(1000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  return (
    <header className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl text-white font-bold">
          BetAfrica
        </Link>
        <nav className="flex items-center space-x-4">
          <Link to="/" className="text-gray-300 hover:text-white">
            Accueil
          </Link>
          <Link to="/live" className="text-gray-300 hover:text-white">
            Live
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-gray-300 hover:text-white">
                Dashboard
              </Link>
              <span className="text-green-500 font-bold">
                {balance.toFixed(2)} FCFA
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Connexion
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
