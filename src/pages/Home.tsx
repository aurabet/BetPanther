import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import MatchCard from '../components/MatchCard';
import DailyThemeBanner from '../components/DailyThemeBanner';
import DailyMatchCard from '../components/DailyMatchCard';

// Composant de secours pour éviter les erreurs
const SafeDailyThemeBanner = (props: any) => {
  try {
    return <DailyThemeBanner {...props} />;
  } catch (error) {
    return <div className="bg-blue-600 text-white p-4 mb-4 rounded">
      Thème du jour: Football Africain
    </div>;
  }
};

interface Match {
  id: number;
  home_team: string;
  away_team: string;
  start_time: string;
  league: string;
  odds_home: number;
  odds_draw: number;
  odds_away: number;
}

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    // Pour le MVP, nous utilisons des données fictives
    // Plus tard, nous connecterons une API réelle
    const mockMatches = [
      {
        id: 1,
        home_team: 'Sporting Bissau',
        away_team: 'Benfica Bissau',
        start_time: new Date().toISOString(),
        league: 'Championnat Guinée-Bissau',
        odds_home: 1.85,
        odds_draw: 3.40,
        odds_away: 4.20
      },
      {
        id: 2,
        home_team: 'Dakar SC',
        away_team: 'AS Douanes',
        start_time: new Date().toISOString(),
        league: 'Ligue 1 Sénégal',
        odds_home: 2.10,
        odds_draw: 3.20,
        odds_away: 3.50
      }
    ];

    setMatches(mockMatches);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="container mx-auto p-4">
        {/* Banner avec le thème du jour */}
        <DailyThemeBanner variant="compact" showMatchPrompts={false} />
        
        <h1 className="text-2xl text-white font-bold mb-6">
          Matchs du jour
        </h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </main>
    </div>
  );
}
