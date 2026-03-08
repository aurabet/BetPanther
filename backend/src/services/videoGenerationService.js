/**
 * Service de génération de vidéos IA pour les bandes-annonces de matchs
 * Utilise Pollinations.ai pour les vidéos
 */

const axios = require('axios');
const { Pool } = require('pg');
const redis = require('./redisService');
const logger = require('../utils/logger');

class VideoGenerationService {
  constructor() {
    this.baseURL = 'https://pollinations.ai';
    this.videoEndpoint = '/video';
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }

  /**
   * Génère une bande-annonce vidéo pour un match
   * @param {Object} match - Données du match
   * @returns {Object} URL de la vidéo générée
   */
  async generateMatchTrailer(match) {
    const cacheKey = `video_trailer:${match.id}`;
    
    // Vérifier le cache
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // Construire le prompt vidéo
    const prompt = this.buildVideoPrompt(match);
    
    try {
      // Générer la vidéo via Pollinations
      const videoUrl = await this.createVideo(prompt, match);
      
      // Sauvegarder en base
      const { data, error } = await this.pool.query(`
        INSERT INTO match_videos (match_id, video_url, prompt, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING id
      `, [match.id, videoUrl, prompt]);

      if (error) throw error;

      // Mettre en cache (24 heures pour les vidéos)
      await redis.set(cacheKey, JSON.stringify({
        url: videoUrl,
        id: data[0].id,
        matchId: match.id
      }), 'EX', 86400);

      return { url: videoUrl, id: data[0].id };

    } catch (error) {
      logger.error('Erreur génération vidéo:', error);
      return this.getFallbackVideo(match);
    }
  }

  /**
   * Construit un prompt optimisé pour les bandes-annonces vidéo
   */
  buildVideoPrompt(match) {
    const homeTeam = match.home_team;
    const awayTeam = match.away_team;
    
    // Prompts variés pour éviter la monotonie
    const prompts = [
      `Cinematic trailer of ${homeTeam} vs ${awayTeam} football match, dramatic stadium atmosphere, crowd cheering, players running, goal celebration, professional sports cinematography, smooth camera movements, 8k`,
      
      `Epic football match preview: ${homeTeam} against ${awayTeam}, intense gameplay, stadium lights, fans with flags, African football energy, cinematic opening sequence, dramatic slow motion highlights`,
      
      `Action-packed football derby: ${homeTeam} vs ${awayTeam}, dramatic lighting, crowd explosions, player skills, spectacular goals, movie trailer style, epic music vibe`
    ];
    
    // Sélectionner un prompt basé sur l'ID du match pour la cohérence
    const promptIndex = (match.id % prompts.length);
    return prompts[promptIndex];
  }

  /**
   * Crée une vidéo via Pollinations.ai
   */
  async createVideo(prompt, match) {
    const encodedPrompt = encodeURIComponent(prompt);
    
    // Paramètres vidéo Pollinations
    const width = 1280;
    const height = 720;
    const seed = match.id;
    const duration = 5; // 5 secondes par défaut
    
    // URL de génération vidéo
    const videoUrl = `${this.baseURL}${this.videoEndpoint}/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&duration=${duration}&nologo=true`;
    
    return videoUrl;
  }

  /**
   * Récupère une vidéo existante pour un match
   */
  async getMatchTrailer(matchId) {
    try {
      const result = await this.pool.query(`
        SELECT * FROM match_videos 
        WHERE match_id = $1 
        ORDER BY created_at DESC 
        LIMIT 1
      `, [matchId]);

      if (result.rows.length > 0) {
        return result.rows[0];
      }
      
      return null;
    } catch (error) {
      logger.error('Erreur récupération vidéo:', error);
      return null;
    }
  }

  /**
   * Génère une vidéo promotionnelle
   */
  async generatePromoVideo(promo) {
    const prompts = {
      'welcome_bonus': `Cinematic 3D animation of welcome bonus celebration, golden coins falling, football stadium background, luxury atmosphere, professional advertising, 8k`,
      
      'free_bet': `Exciting free bet reveal, magical football appearing, sparkles and lights, African stadium backdrop, promotional trailer style`,
      
      'jackpot': `Epic jackpot celebration, confetti explosion, gold and green colors, football players cheering, dramatic sports moment`
    };

    const prompt = prompts[promo.type] || prompts.welcome_bonus;
    const encodedPrompt = encodeURIComponent(prompt);
    
    return `${this.baseURL}${this.videoEndpoint}/${encodedPrompt}?width=1080&height=1920&duration=10&nologo=true`;
  }

  /**
   * Génère une compilation de meilleurs moments
   */
  async generateHighlightsVideo(matches, title = "Weekly Highlights") {
    const prompt = `Exciting football highlights compilation, ${title}, dramatic moments, goals, celebrations, African football, professional sports editing, cinematic transitions`;
    
    const encodedPrompt = encodeURIComponent(prompt);
    
    return `${this.baseURL}${this.videoEndpoint}/${encodedPrompt}?width=1920&height=1080&duration=30&nologo=true`;
  }

  /**
   * Vidéo de secours
   */
  getFallbackVideo(match) {
    return {
      url: null,
      fallback: true,
      message: 'Vidéo non disponible'
    };
  }

  /**
   * Génère une célébration de but
   */
  async generateGoalCelebration(match, scorer) {
    const prompts = [
      `${scorer} scores for ${match.home_team} against ${match.away_team}, dramatic slow motion celebration, crowd eruption, player slides on knees, teammates pile on, cinematic sports drama`,
      `${scorer} scores winning goal against ${match.away_team}, emotional celebration, runs to corner flag, stadium explodes, epic moment`,
      `Hat-trick celebration by ${scorer} for ${match.home_team} against ${match.away_team}, ball boy brings ball, stadium ovation`
    ];

    const prompt = prompts[Math.floor(Math.random() * prompts.length)];
    const encoded = encodeURIComponent(prompt);
    
    return `${this.baseURL}${this.videoEndpoint}/${encoded}?width=1080&height=1920&duration=5&nologo=true`;
  }

  /**
   * Génère une story sociale
   */
  async generateSocialStory(match, platform = 'instagram') {
    const prompts = {
      instagram: `${match.home_team} vs ${match.away_team} story highlights, vertical format, trending music, fast cuts, Instagram story style`,
      tiktok: `${match.home_team} vs ${match.away_team} viral moment, TikTok trending sound, quick edits, dance overlay`,
      facebook: `${match.home_team} vs ${match.away_team} Facebook story, fan reactions, reactions overlay`
    };

    const prompt = prompts[platform] || prompts.instagram;
    const encoded = encodeURIComponent(prompt);
    
    return `${this.baseURL}${this.videoEndpoint}/${encoded}?width=1080&height=1920&duration=15&nologo=true`;
  }

  /**
   * Nettoie les anciennes vidéos
   */
  async cleanupOldVideos() {
    const result = await this.pool.query(`
      DELETE FROM match_videos 
      WHERE created_at < NOW() - INTERVAL '30 days'
      RETURNING id
    `);
    
    logger.info(`${result.rowCount} anciennes vidéos supprimées`);
    return result.rowCount;
  }
}

module.exports = new VideoGenerationService();

