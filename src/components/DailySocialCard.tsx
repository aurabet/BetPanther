import { useState, useEffect } from 'react';
import dailyPromptsService, { MatchData } from '../services/dailyPromptsService';

interface DailySocialCardProps {
  match?: {
    id: number;
    home_team: string;
    away_team: string;
    stadium?: string;
  };
  promoType?: 'welcome_bonus' | 'free_bet' | 'cashback' | 'daily_theme';
  title?: string;
}

export default function DailySocialCard({ 
  match,
  promoType = 'daily_theme',
  title 
}: DailySocialCardProps) {
  const [dailyData, setDailyData] = useState(dailyPromptsService.getCurrentDayPrompts());
  const [imageUrl, setImageUrl] = useState<string>('');
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');

  useEffect(() => {
    const daily = dailyPromptsService.getCurrentDayPrompts();
    setDailyData(daily);
    
    if (promoType === 'daily_theme') {
      // Utiliser les prompts sociaux du jour
      if (daily.socialPrompts.length > 0) {
        setSelectedPrompt(daily.socialPrompts[0]);
        
        // Si un match est fourni, générer l'image avec le prompt
        if (match) {
          const matchData: MatchData = {
            id: match.id,
            home_team: match.home_team,
            away_team: match.away_team,
            stadium: match.stadium
          };
          const url = dailyPromptsService.generateDailyImageUrl(matchData, 'social');
          setImageUrl(url);
        } else {
          // Sinon utiliser une image de promotion générique
          const url = dailyPromptsService.generatePromoImageUrl(promoType);
          setImageUrl(url);
        }
      }
    } else {
      // Type de promotion prédéfini
      const url = dailyPromptsService.generatePromoImageUrl(promoType);
      setImageUrl(url);
    }
  }, [match, promoType]);

  const frenchDayName = dailyPromptsService.getFrenchDayName(dailyData.day);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition shadow-lg">
      {/* Image de réseaux sociaux */}
      <div className="relative h-48 overflow-hidden">
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt={title || dailyData.theme}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=Bookmaker+Africa&background=22c55e&color=fff&size=512`;
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-800 via-transparent to-transparent" />
        
        {/* Badge du jour */}
        <div className="absolute top-3 right-3 bg-green-600/90 text-white text-xs px-3 py-1 rounded-full font-medium">
          {frenchDayName}
        </div>
      </div>
      
      <div className="p-4">
        {title && (
          <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
        )}
        
        {/* Thème du jour */}
        <div className="mb-3">
          <span className="text-green-400 text-xs uppercase tracking-wider">Thème du jour</span>
          <p className="text-white font-medium">{dailyData.theme}</p>
        </div>
        
        {/* Afficher les prompts sociaux disponibles */}
        {dailyData.socialPrompts.length > 0 && (
          <div className="space-y-2">
            <span className="text-gray-400 text-xs">Publications sociales:</span>
            {dailyData.socialPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPrompt(prompt)}
                className={`block w-full text-left p-2 rounded text-sm transition ${
                  selectedPrompt === prompt 
                    ? 'bg-green-600/20 text-green-300 border border-green-600' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {idx + 1}. {prompt.substring(0, 50)}...
              </button>
            ))}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition">
            Partager
          </button>
          <button 
            onClick={() => {
              if (match) {
                const matchData: MatchData = {
                  id: match.id,
                  home_team: match.home_team,
                  away_team: match.away_team,
                  stadium: match.stadium
                };
                const url = dailyPromptsService.generateDailyImageUrl(matchData, 'social');
                setImageUrl(url);
              } else {
                const url = dailyPromptsService.generatePromoImageUrl(promoType);
                setImageUrl(url);
              }
            }}
            className="bg-gray-700 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition"
          >
            Nouvelle image
          </button>
        </div>
      </div>
    </div>
  );
}

