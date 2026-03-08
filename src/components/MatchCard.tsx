import { useState } from 'react';

interface MatchCardProps {
  match: {
    id: number;
    home_team: string;
    away_team: string;
    start_time: string;
    league: string;
    odds_home: number;
    odds_draw: number;
    odds_away: number;
  };
}

export default function MatchCard({ match }: MatchCardProps) {
  const [selectedOdds, setSelectedOdds] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition">
      <div className="text-gray-400 text-sm mb-2">{match.league}</div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-white font-semibold">{match.home_team}</span>
        <span className="text-gray-400">VS</span>
        <span className="text-white font-semibold">{match.away_team}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <button
          onClick={() => setSelectedOdds('home')}
          className={`p-2 rounded text-center ${
            selectedOdds === 'home' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <div className="text-xs">1</div>
          <div className="font-bold">{match.odds_home}</div>
        </button>
        <button
          onClick={() => setSelectedOdds('draw')}
          className={`p-2 rounded text-center ${
            selectedOdds === 'draw' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <div className="text-xs">N</div>
          <div className="font-bold">{match.odds_draw}</div>
        </button>
        <button
          onClick={() => setSelectedOdds('away')}
          className={`p-2 rounded text-center ${
            selectedOdds === 'away' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <div className="text-xs">2</div>
          <div className="font-bold">{match.odds_away}</div>
        </button>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400">{formatDate(match.start_time)}</span>
        {selectedOdds && (
          <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
            Parier
          </button>
        )}
      </div>
    </div>
  );
}
