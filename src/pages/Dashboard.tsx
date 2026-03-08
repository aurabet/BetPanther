import DailyThemeBanner from '../components/DailyThemeBanner';
import DailyMatchCard from '../components/DailyMatchCard';
import DailySocialCard from '../components/DailySocialCard';
import dailyPromptsService from '../services/dailyPromptsService';

// Données de exemple pour les matchs
const sampleMatches = [
  {
    id: 1,
    home_team: 'Horoya AC',
    away_team: 'AS Mandji',
    start_time: new Date().toISOString(),
    league: 'Championnat National',
    odds_home: 1.75,
    odds_draw: 3.20,
    odds_away: 4.50,
    stadium: 'Stade du 28 Septembre'
  },
  {
    id: 2,
    home_team: 'CI Kamsar',
    away_team: 'Fello Star',
    start_time: new Date(Date.now() + 86400000).toISOString(),
    league: 'Championnat National',
    odds_home: 2.10,
    odds_draw: 2.90,
    odds_away: 3.40,
    stadium: 'Stade de Kamsar'
  }
];

export default function Dashboard() {
  const dailyData = dailyPromptsService.getCurrentDayPrompts();
  const allDays = dailyPromptsService.getAllDays();

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Banner avec le thème du jour */}
      <DailyThemeBanner variant="full" showMatchPrompts={true} />
      
      {/* Résumé du jour */}
      <div className="mb-8">
        <h2 className="text-white text-xl font-bold mb-4">Matchs du {dailyPromptsService.getFrenchDayName()}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleMatches.map(match => (
            <DailyMatchCard 
              key={match.id} 
              match={match} 
              useDailyImage={true}
              showDailyTheme={true}
            />
          ))}
        </div>
      </div>

      {/* Carte sociale avec le thème du jour */}
      <div className="mb-8">
        <h2 className="text-white text-xl font-bold mb-4">Contenu réseaux sociaux</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DailySocialCard 
            match={sampleMatches[0]}
            promoType="daily_theme"
            title="Partage ce moment"
          />
          <DailySocialCard 
            promoType="welcome_bonus"
            title="Bonus de Bienvenue"
          />
          <DailySocialCard 
            promoType="free_bet"
            title="Paris Gratuit"
          />
        </div>
      </div>

      {/* Semaine complète */}
      <div className="mb-8">
        <h2 className="text-white text-xl font-bold mb-4">Thèmes de la semaine</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {allDays.map((day) => (
            <div 
              key={day.day}
              className={`p-3 rounded-lg text-center ${
                day.day === dailyData.day 
                  ? 'bg-green-600 ring-2 ring-green-400' 
                  : 'bg-gray-800'
              }`}
            >
              <div className="text-white font-bold text-sm">{day.frenchName}</div>
              <div className="text-gray-300 text-xs mt-1">{day.theme}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-white text-xl font-bold mb-4">Statistiques des prompts</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-green-400 text-2xl font-bold">{dailyPromptsService.getStats().totalDays}</div>
            <div className="text-gray-400 text-sm">Jours</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-green-400 text-2xl font-bold">{dailyPromptsService.getStats().totalMatchPrompts}</div>
            <div className="text-gray-400 text-sm">Prompts Match</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-green-400 text-2xl font-bold">{dailyPromptsService.getStats().totalSocialPrompts}</div>
            <div className="text-gray-400 text-sm">Prompts Social</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-green-400 text-2xl font-bold">
              {dailyPromptsService.getStats().totalMatchPrompts + dailyPromptsService.getStats().totalSocialPrompts}
            </div>
            <div className="text-gray-400 text-sm">Total Prompts</div>
          </div>
        </div>
      </div>
    </div>
  );
}
