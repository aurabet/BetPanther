/**
 * Service pour gérer les prompts quotidiens côté frontend
 * Gère les thèmes et prompts pour chaque jour de la semaine
 */

export interface DailyPromptData {
  day: string;
  theme: string;
  matchPrompts: string[];
  socialPrompts: string[];
}

export interface MatchData {
  id: number;
  home_team: string;
  away_team: string;
  stadium?: string;
  [key: string]: any;
}

const DAILY_PROMPTS: Record<string, {
  theme: string;
  match_prompts: string[];
  social_prompts: string[];
}> = {
  monday: {
    theme: "Nouvelle semaine, nouveaux défis",
    match_prompts: [
      "Monday night football intensity between {home} and {away}, players focused, new week new challenge, dramatic lighting",
      "Start of week match {home} vs {away}, fresh energy, morning light, determination on players faces",
      "Monday motivation: {home} team huddle before match against {away}, inspirational moment, team spirit"
    ],
    social_prompts: [
      "Motivational Monday football quote over {home} vs {away} action shot, inspirational typography",
      "Start your week with football: {home} fans celebrating, positive energy, vibrant colors"
    ]
  },
  
  tuesday: {
    theme: "Action et progression",
    match_prompts: [
      "Tuesday night under the lights: {home} vs {away}, stadium floodlights creating dramatic shadows, intense action",
      "Mid-week progression: {home} attacking against {away}, dynamic movement, blur effect showing speed",
      "Technical Tuesday: {home} midfielder controlling the game vs {away}, skill and precision, artistic photography"
    ],
    social_prompts: [
      "Tuesday skills showcase: best moments {home} vs {away}, technical highlights, split action collage",
      "Training ground Tuesday: {home} players practicing before {away} match, preparation and focus"
    ]
  },
  
  wednesday: {
    theme: "Milieu de semaine décisif",
    match_prompts: [
      "Wednesday decisive moment: {home} scoring against {away}, crowd eruption, freeze frame celebration",
      "Mid-week showdown: {home} vs {away} battle for supremacy, intense tackles, dramatic sports photography",
      "Wednesday night football atmosphere, {stadium} packed, {home} fans creating wall of noise"
    ],
    social_prompts: [
      "Hump day celebration: {home} victory dance, fun and joy, shareable football moment",
      "Wednesday wisdom: football tactics explained with {home} vs {away} formation, educational content"
    ]
  },
  
  thursday: {
    theme: "Préparation weekend",
    match_prompts: [
      "Thursday night football fever: {home} vs {away}, anticipation building, stadium lights against twilight sky",
      "Almost weekend energy: {home} attacking with flair against {away}, creative play, vibrant colors",
      "Thursday showdown: {home} captain leading team against {away}, leadership and determination"
    ],
    social_prompts: [
      "Throwback Thursday: classic {home} vs {away} match moment, vintage style filter, nostalgic",
      "Thursday predictions: {home} vs {away} preview graphics, statistical overlay, modern design"
    ]
  },
  
  friday: {
    theme: "Weekend de football",
    match_prompts: [
      "Friday night lights: {home} vs {away} season opener, spectacular opening ceremony, fireworks over stadium",
      "Weekend kickoff: {home} fans arriving at {stadium}, party atmosphere, drums and dancing",
      "Friday football festival: {home} vs {away} celebration of African football, colorful, joyful"
    ],
    social_prompts: [
      "Friday feeling: {home} supporters ready for weekend, happy faces, party atmosphere",
      "Weekend preview: all matches this weekend graphic, calendar style, organized layout"
    ]
  },
  
  saturday: {
    theme: "Grand jour de match",
    match_prompts: [
      "Saturday football madness: {home} vs {away} full stadium, incredible atmosphere, confetti, smoke, 8k resolution",
      "Matchday Saturday: {home} scoring winner against {away}, dramatic moment, tears of joy, sports illustrated cover",
      "African football Saturday: {home} vs {away} cultural celebration, traditional dancers at halftime, vibrant"
    ],
    social_prompts: [
      "Matchday live: {home} vs {away} action shots, real-time updates style, social media banner",
      "Saturday celebrations: {home} fans partying after win, joyful moments, shareable content"
    ]
  },
  
  sunday: {
    theme: "Dimanche football et famille",
    match_prompts: [
      "Sunday family football: {home} vs {away} families in stands, parents and children, heartwarming moments",
      "Sunday showdown: {home} vs {away} deciding match, dramatic sunset, climactic atmosphere",
      "Sunday league passion: {home} amateurs vs {away}, pure love of football, documentary style"
    ],
    social_prompts: [
      "Sunday reflection: best of the weekend moments, {home} highlights, cinematic compilation",
      "Sunday funday: {home} mascot entertaining kids, fun and games, family friendly content"
    ]
  }
};

const FRENCH_DAY_NAMES: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche'
};

class DailyPromptsService {
  private baseURL = 'https://pollinations.ai';

  /**
   * Récupère le thème et les prompts pour le jour actuel
   */
  getCurrentDayPrompts(): DailyPromptData {
    const dayOfWeek = new Date().getDay();
    const dayKey = this.getDayKey(dayOfWeek);
    
    return {
      day: dayKey,
      theme: DAILY_PROMPTS[dayKey].theme,
      matchPrompts: DAILY_PROMPTS[dayKey].match_prompts,
      socialPrompts: DAILY_PROMPTS[dayKey].social_prompts
    };
  }

  /**
   * Récupère les prompts pour un jour spécifique
   */
  getDayPrompts(day: string): DailyPromptData | null {
    const dayKey = day.toLowerCase();
    if (!DAILY_PROMPTS[dayKey]) {
      return null;
    }
    
    return {
      day: dayKey,
      theme: DAILY_PROMPTS[dayKey].theme,
      matchPrompts: DAILY_PROMPTS[dayKey].match_prompts,
      socialPrompts: DAILY_PROMPTS[dayKey].social_prompts
    };
  }

  /**
   * Récupère un prompt aléatoire pour un type spécifique
   */
  getRandomPrompt(day: string, type: 'match' | 'social'): string | null {
    const dayPrompts = this.getDayPrompts(day);
    if (!dayPrompts) {
      return null;
    }

    const prompts = type === 'match' ? dayPrompts.matchPrompts : dayPrompts.socialPrompts;
    if (!prompts || prompts.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * prompts.length);
    return prompts[randomIndex];
  }

  /**
   * Formate un prompt en remplaçant les placeholders
   */
  formatPrompt(prompt: string, data: Record<string, string>): string {
    if (!prompt || !data) {
      return prompt;
    }

    let formattedPrompt = prompt;
    
    Object.keys(data).forEach(key => {
      const placeholder = `{${key}}`;
      const value = data[key] || '';
      formattedPrompt = formattedPrompt.replace(new RegExp(placeholder, 'g'), value);
    });

    return formattedPrompt;
  }

  /**
   * Génère un prompt complet pour un match spécifique
   */
  generateMatchPrompt(day: string, type: 'match' | 'social', matchData: MatchData): string | null {
    try {
      const randomPrompt = this.getRandomPrompt(day, type);
      if (!randomPrompt) {
        return null;
      }

      const formattedPrompt = this.formatPrompt(randomPrompt, {
        home: matchData.home_team,
        away: matchData.away_team,
        stadium: matchData.stadium || 'African Stadium'
      });
      
      return formattedPrompt;
    } catch (error) {
      console.error('Erreur lors de la génération du prompt:', error);
      return null;
    }
  }

  /**
   * Génère une URL d'image Pollinations.ai avec le prompt du jour
   */
  generateDailyImageUrl(match: MatchData, type: 'match' | 'social' = 'match'): string {
    const dailyData = this.getCurrentDayPrompts();
    const prompt = this.generateMatchPrompt(dailyData.day, type, match);
    
    if (!prompt) {
      return this.getFallbackImageUrl(match);
    }

    const encodedPrompt = encodeURIComponent(prompt);
    const width = 1024;
    const height = 768;
    const seed = match.id + dailyData.day.length;
    
    return `${this.baseURL}/p/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
  }

  /**
   * Génère une URL d'image pour un jour spécifique
   */
  generateImageUrlForDay(match: MatchData, day: string, type: 'match' | 'social' = 'match'): string {
    const dayData = this.getDayPrompts(day);
    if (!dayData) {
      return this.getFallbackImageUrl(match);
    }

    const prompt = this.generateMatchPrompt(day, type, match);
    
    if (!prompt) {
      return this.getFallbackImageUrl(match);
    }

    const encodedPrompt = encodeURIComponent(prompt);
    const width = 1024;
    const height = 768;
    const seed = match.id + day.length;
    
    return `${this.baseURL}/p/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
  }

  /**
   * Génère une image de promotion avec le thème du jour
   */
  generatePromoImageUrl(promoType: string): string {
    const dailyData = this.getCurrentDayPrompts();
    
    const prompts: Record<string, string> = {
      'welcome_bonus': `3D render golden welcome bonus 100% for African betting site, football theme, vibrant colors, professional advertising, 8k`,
      'free_bet': `Golden free bet ticket floating in air, magical sparkles, African football stadium background, cinematic lighting`,
      'cashback': `Golden shield protecting coins with "CASHBACK 10%" text, African sports theme, 3d render, luxurious`,
      'daily_theme': `Football celebration for ${dailyData.theme}, ${dailyData.day} matchday, African stadium, colorful, professional sports photography`
    };

    const prompt = prompts[promoType] || prompts.daily_theme;
    const encodedPrompt = encodeURIComponent(prompt);
    
    return `${this.baseURL}/p/${encodedPrompt}?width=1200&height=630&nologo=true`;
  }

  /**
   * Image de secours
   */
  private getFallbackImageUrl(match: MatchData): string {
    return `https://ui-avatars.com/api/?name=${match.home_team}+${match.away_team}&background=22c55e&color=fff&size=512`;
  }

  /**
   * Obtient le nom du jour à partir de l'index
   */
  private getDayKey(dayIndex: number): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayIndex];
  }

  /**
   * Obtient le nom complet du jour en français
   */
  getFrenchDayName(dayKey?: string): string {
    const day = dayKey || this.getCurrentDayPrompts().day;
    return FRENCH_DAY_NAMES[day] || day;
  }

  /**
   * Récupère tous les jours de la semaine avec leurs thèmes
   */
  getAllDays(): Array<{ day: string; theme: string; frenchName: string }> {
    return Object.keys(DAILY_PROMPTS).map(day => ({
      day,
      theme: DAILY_PROMPTS[day].theme,
      frenchName: FRENCH_DAY_NAMES[day]
    }));
  }

  /**
   * Récupère les statistiques des prompts
   */
  getStats() {
    const stats = {
      totalDays: Object.keys(DAILY_PROMPTS).length,
      totalMatchPrompts: 0,
      totalSocialPrompts: 0,
      themes: [] as Array<{ day: string; theme: string; matchCount: number; socialCount: number }>
    };

    Object.keys(DAILY_PROMPTS).forEach(day => {
      const dayData = DAILY_PROMPTS[day];
      stats.totalMatchPrompts += dayData.match_prompts.length;
      stats.totalSocialPrompts += dayData.social_prompts.length;
      stats.themes.push({
        day,
        theme: dayData.theme,
        matchCount: dayData.match_prompts.length,
        socialCount: dayData.social_prompts.length
      });
    });

    return stats;
  }
}

// Exporter une instance unique du service
export default new DailyPromptsService();

