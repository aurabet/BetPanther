import { useState, useEffect } from 'react';
import dailyPromptsService from '../services/dailyPromptsService';

interface DailyThemeBannerProps {
  variant?: 'full' | 'compact';
  showMatchPrompts?: boolean;
}

export default function DailyThemeBanner({ 
  variant = 'full', 
  showMatchPrompts = true 
}: DailyThemeBannerProps) {
  const [dailyData, setDailyData] = useState(dailyPromptsService.getCurrentDayPrompts());
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  useEffect(() => {
    // Rafraîchir les données quotidiennement
    const interval = setInterval(() => {
      setDailyData(dailyPromptsService.getCurrentDayPrompts());
    }, 60000); // Toutes les minutes pour vérifier le jour

    return () => clearInterval(interval);
  }, []);

  const frenchDayName = dailyPromptsService.getFrenchDayName(dailyData.day);

  if (variant === 'compact') {
    return (
      <div className="bg-gradient-to-r from-green-800 to-green-600 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-lg">{frenchDayName}</span>
            <span className="text-green-200">•</span>
            <span className="text-green-100 text-sm">{dailyData.theme}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-900 via-green-700 to-green-500 rounded-xl p-6 mb-6 shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
              {frenchDayName}
            </span>
            <span className="text-green-100 text-sm">Thème du jour</span>
          </div>
          <h2 className="text-white text-2xl md:text-3xl font-bold">
            {dailyData.theme}
          </h2>
        </div>
        
        {showMatchPrompts && dailyData.matchPrompts.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md">
            <p className="text-green-50 text-sm italic">
              "{dailyData.matchPrompts[currentPromptIndex]}"
            </p>
            <div className="flex gap-1 mt-2 justify-center">
              {dailyData.matchPrompts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPromptIndex(idx)}
                  className={`w-2 h-2 rounded-full transition ${
                    idx === currentPromptIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

