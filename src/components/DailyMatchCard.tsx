import { useState, useEffect } from 'react';
import dailyPromptsService, { MatchData } from '../services/dailyPromptsService';

interface DailyMatchCardProps {
  match: {
    id: number;
    home_team: string;
    away_team: string;
    start_time: string;
    league: string;
    odds_home: number;
    odds_draw: number;
    odds_away: number;
    stadium?: string;
  };
  useDailyImage?: boolean;
  showDailyTheme?: boolean;
}

export default function DailyMatchCard({ 
  match, 
  useDailyImage = true,
  showDailyTheme = true 
}: DailyMatchCardProps) {
  const [selectedOdds, setSelectedOdds] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [dailyTheme, setDailyTheme] = useState<string>('');

  useEffect(() => {
    if (useDailyImage) {
      // Générer l'image avec le prompt du jour
      const matchData: MatchData = {
        id: match.id,
        home_team: match.home_team,
        away_team: match.away_team,
        stadium: match.stadium
      };
      
      const url = dailyPromptsService.generateDailyImageUrl(matchData, 'match');
      setImageUrl(url);
      
      if (showDailyTheme) {
        const daily = dailyPromptsService.getCurrentDayPrompts();
        setDailyTheme(daily.theme);
      }
    }
  }, [match, useDailyImage, showDailyTheme]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition shadow-lg">
      {/* Image avec le thème du jour */}
      {useDailyImage && imageUrl && (
        <div className="relative h-40 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={`${match.home_team} vs ${match.away_team}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Image de secours en cas d'erreur
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${match.home_team}+${match.away_team}&background=22c55e&color=fff&size=512`;
            }}
          />
          {showDailyTheme && dailyTheme && (
            <div className="absolute top-2 left-2 bg-green-600/90 text-white text-xs px-2 py-1 rounded">
              {dailyTheme}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent" />
        </div>
      )}
      
      <div className="p-4">
        <div className="text-gray-400 text-sm mb-2">{match.league}</div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-white font-semibold">{match.home_team}</span>
          <span className="text-gray-400">VS</span>
          <span className="text-white font-semibold">{match.away_team}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          <button
            onClick={() => setSelectedOdds('home')}
            className={`p-2 rounded text-center transition ${
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
            className={`p-2 rounded text-center transition ${
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
            className={`p-2 rounded text-center transition ${
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
            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition">
              Parier
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

