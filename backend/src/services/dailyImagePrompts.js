/**
 * Service pour gérer les prompts quotidiens selon le jour de la semaine
 * Contient les thèmes et prompts spécifiques pour chaque jour
 */

const DAILY_PROMPTS = {
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

// Prompts additionnels pour les tournois régionaux et éléments culturels
const SPECIAL_PROMPTS = {
  regional_tournaments: {
    wafu_cup: [
      "WAFU Cup of Nations: {home} vs {away} regional derby, West African flags everywhere, intense rivalry, colorful traditional attire in stands",
      "West African football championship: {home} players displaying skill against {away}, regional pride, stadium packed with passionate fans"
    ],
    ucc: [
      "UCC tournament: {home} representing their community against {away}, local heroes, grassroots football, authentic African atmosphere"
    ]
  },
  
  cultural_elements: {
    dance: [
      "{home} fans doing traditional dance after goal against {away}, vibrant African culture, joy and celebration, colorful traditional clothing",
      "Halftime cultural performance at {home} vs {away} match, traditional dancers, drums, spectacular show"
    ],
    music: [
      "{home} supporters with drums and vuvuzelas creating wall of sound against {away}, musical atmosphere, energy and passion",
      "African brass band playing at {home} vs {away} match, musicians in stands, vibrant colors"
    ],
    food: [
      "Street food vendors outside {stadium} before {home} vs {away}, grilled meats, fans eating and laughing, local cuisine"
    ]
  },
  
  landmarks: {
    dakar: [
      "{home} vs {away} with Monument de la Renaissance in background, iconic Dakar landmark, sunset colors",
      "Stade Léopold Sédar Senghor packed for {home} vs {away}, Dakar skyline visible, evening match"
    ],
    bissau: [
      "{home} vs {away} in Estádio 24 de Setembro, Bissau city atmosphere, Portuguese colonial architecture nearby",
      "Football in Bissau: {home} playing against {away} with Bissau Velho in background, historic setting"
    ],
    abidjan: [
      "{home} vs {away} in Stade Félix Houphouët-Boigny, Abidjan skyline at night, modern Africa",
      "Plateau district view during {home} vs {away} match, urban African football, city lights"
    ]
  },
  
  weather_seasons: {
    dry: [
      "{home} vs {away} under harmattan haze, dusty afternoon match, atmospheric conditions, unique lighting",
      "Dry season football: {home} vs {away} in bright sunshine, clear blue sky, vibrant green pitch contrast"
    ],
    rainy: [
      "{home} vs {away} in tropical rainstorm, players sliding on wet pitch, dramatic weather, powerful imagery",
      "Rainy season match: {home} vs {away} with dramatic clouds, lightning in distance, epic atmosphere"
    ]
  }
};

class DailyImagePrompts {
  /**
   * Récupère le thème et les prompts pour le jour actuel
   * @returns {Object} Objet contenant le thème et les prompts
   */
  getCurrentDayPrompts() {
    const dayOfWeek = new Date().getDay(); // 0 = Dimanche, 1 = Lundi, etc.
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
   * @param {string} day - Nom du jour (monday, tuesday, etc.)
   * @returns {Object|null} Objet contenant le thème et les prompts, ou null si non trouvé
   */
  getDayPrompts(day) {
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
   * @param {string} day - Nom du jour
   * @param {string} type - Type de prompt (match ou social)
   * @returns {string|null} Prompt aléatoire ou null si non trouvé
   */
  getRandomPrompt(day, type) {
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
   * Récupère tous les prompts pour un type spécifique sur toute la semaine
   * @param {string} type - Type de prompt (match ou social)
   * @returns {Array} Tableau de tous les prompts de la semaine
   */
  getAllWeekPrompts(type) {
    const allPrompts = [];
    
    Object.keys(DAILY_PROMPTS).forEach(day => {
      const prompts = type === 'match' 
        ? DAILY_PROMPTS[day].match_prompts 
        : DAILY_PROMPTS[day].social_prompts;
      
      prompts.forEach(prompt => {
        allPrompts.push({
          day: day,
          theme: DAILY_PROMPTS[day].theme,
          prompt: prompt
        });
      });
    });
    
    return allPrompts;
  }

  /**
   * Formate un prompt en remplaçant les placeholders
   * @param {string} prompt - Prompt avec placeholders
   * @param {Object} data - Données à injecter dans les placeholders
   * @returns {string} Prompt formaté
   */
  formatPrompt(prompt, data) {
    if (!prompt || !data) {
      return prompt;
    }

    let formattedPrompt = prompt;
    
    // Remplacer les placeholders standards
    Object.keys(data).forEach(key => {
      const placeholder = `{${key}}`;
      const value = data[key] || '';
      formattedPrompt = formattedPrompt.replace(new RegExp(placeholder, 'g'), value);
    });

    return formattedPrompt;
  }

  /**
   * Récupère le nom du jour à partir de l'index
   * @param {number} dayIndex - Index du jour (0-6)
   * @returns {string} Nom du jour en anglais
   */
  getDayKey(dayIndex) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayIndex];
  }

  /**
   * Récupère le nom complet du jour en français
   * @param {string} dayKey - Clé du jour (monday, tuesday, etc.)
   * @returns {string} Nom complet du jour en français
   */
  getFrenchDayName(dayKey) {
    const frenchDays = {
      monday: 'Lundi',
      tuesday: 'Mardi',
      wednesday: 'Mercredi',
      thursday: 'Jeudi',
      friday: 'Vendredi',
      saturday: 'Samedi',
      sunday: 'Dimanche'
    };
    
    return frenchDays[dayKey] || dayKey;
  }

  /**
   * Génère un prompt complet pour un match spécifique
   * @param {string} day - Nom du jour
   * @param {string} type - Type de prompt (match ou social)
   * @param {Object} matchData - Données du match
   * @returns {string|null} Prompt formaté ou null si erreur
   */
  generateMatchPrompt(day, type, matchData) {
    try {
      const randomPrompt = this.getRandomPrompt(day, type);
      if (!randomPrompt) {
        return null;
      }

      const formattedPrompt = this.formatPrompt(randomPrompt, matchData);
      return formattedPrompt;
    } catch (error) {
      console.error('Erreur lors de la génération du prompt:', error);
      return null;
    }
  }

  /**
   * Récupère les statistiques d'utilisation des prompts
   * @returns {Object} Statistiques sur les prompts
   */
  getPromptsStats() {
    const stats = {
      totalDays: Object.keys(DAILY_PROMPTS).length,
      totalMatchPrompts: 0,
      totalSocialPrompts: 0,
      totalPrompts: 0,
      themes: []
    };

    Object.keys(DAILY_PROMPTS).forEach(day => {
      const dayData = DAILY_PROMPTS[day];
      stats.totalMatchPrompts += dayData.match_prompts.length;
      stats.totalSocialPrompts += dayData.social_prompts.length;
      stats.themes.push({
        day: day,
        theme: dayData.theme,
        matchCount: dayData.match_prompts.length,
        socialCount: dayData.social_prompts.length
      });
    });

    stats.totalPrompts = stats.totalMatchPrompts + stats.totalSocialPrompts;

    return stats;
  }

  /**
   * Récupère les prompts spéciaux pour les tournois régionaux
   * @param {string} tournament - Type de tournoi (wafu_cup, ucc)
   * @returns {Array|null} Tableau de prompts ou null
   */
  getRegionalTournamentPrompts(tournament) {
    if (!SPECIAL_PROMPTS.regional_tournaments[tournament]) {
      return null;
    }
    return SPECIAL_PROMPTS.regional_tournaments[tournament];
  }

  /**
   * Récupère les prompts culturels
   * @param {string} type - Type culturel (dance, music, food)
   * @returns {Array|null} Tableau de prompts ou null
   */
  getCulturalPrompts(type) {
    if (!SPECIAL_PROMPTS.cultural_elements[type]) {
      return null;
    }
    return SPECIAL_PROMPTS.cultural_elements[type];
  }

  /**
   * Récupère les prompts de landmarks
   * @param {string} city - Ville (dakar, bissau, abidjan)
   * @returns {Array|null} Tableau de prompts ou null
   */
  getLandmarkPrompts(city) {
    if (!SPECIAL_PROMPTS.landmarks[city]) {
      return null;
    }
    return SPECIAL_PROMPTS.landmarks[city];
  }

  /**
   * Récupère les prompts météo/saison
   * @param {string} season - Saison (dry, rainy)
   * @returns {Array|null} Tableau de prompts ou null
   */
  getWeatherPrompts(season) {
    if (!SPECIAL_PROMPTS.weather_seasons[season]) {
      return null;
    }
    return SPECIAL_PROMPTS.weather_seasons[season];
  }

  /**
   * Formate un prompt spécial avec les données du match
   * @param {string} prompt - Prompt à formater
   * @param {Object} matchData - Données du match
   * @returns {string} Prompt formaté
   */
  formatSpecialPrompt(prompt, matchData) {
    return this.formatPrompt(prompt, matchData);
  }
}

// Exporter une instance unique
module.exports = new DailyImagePrompts();