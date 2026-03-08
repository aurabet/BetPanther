const axios = require('axios');
const supabase = require('../config/supabase');
const redis = require('./redisService');
const logger = require('../utils/logger');

class VideoGenerationService {
    constructor() {
        this.baseURL = 'https://pollinations.ai';
        this.videoEndpoint = '/wan2.6';
        
        // Templates de prompts vidéo par type
        this.templates = {
            match_trailer: this.loadMatchTemplates(),
            goal_celebration: this.loadGoalTemplates(),
            promotion: this.loadPromoTemplates(),
            social_story: this.loadSocialTemplates()
        };
    }

    /**
     * Templates pour bandes-annonces de matchs
     */
    loadMatchTemplates() {
        return {
            epic: [
                "Epic football match trailer, {home} vs {away} at {stadium}, dramatic slow motion, players walking onto pitch, stadium wide shot, cinematic lighting, 4k quality, movie trailer style",
                
                "Intense football showdown preview, {home} and {away} teams facing off, close up on determined players, crowd roaring, dramatic music visual, cinematic color grading",
                
                "Championship match anticipation, {home} vs {away}, sweeping stadium shots, fans waving flags, players warming up, golden hour lighting, epic scale"
            ],
            
            african: [
                "Vibrant African football atmosphere, {home} vs {away} match, traditional drummers in stands, colorful clothing, dancing fans, smoke flares, celebration energy, dynamic camera movement",
                
                "African football derby opening scene, {home} fans with vuvuzelas, {away} supporters with flags, stadium electric atmosphere, cultural dance, vibrant colors, documentary style",
                
                "Football in Africa: {home} vs {away}, drone shot over stadium, fans arriving, local food vendors, match day energy, authentic atmosphere, warm colors"
            ],
            
            dramatic: [
                "Dramatic football match trailer, storm clouds over {stadium}, players determined faces, slow motion rain, intense close-ups, dark and moody cinematography, 8k",
                
                "Last minute decider buildup, {home} vs {away}, tension in the air, clock ticking visual, players preparing for final moments, cinematic thriller style"
            ]
        };
    }

    /**
     * Templates pour célébrations de buts
     */
    loadGoalTemplates() {
        return [
            "Spectacular goal celebration, {home} player scores against {away}, crowd erupts, player slides on knees, teammates pile on, slow motion joy, stadium explosion",
            
            "Winning goal moment, {home} striker celebrates hat-trick against {away}, fans in disbelief, pure emotion, cinematic slow motion, confetti falling",
            
            "Last minute equalizer celebration, {home} fans going wild, player runs to corner flag, dramatic reaction shots, stadium shaking, emotional moment"
        ];
    }

    /**
     * Templates pour promotions
     */
    loadPromoTemplates() {
        return {
            welcome_bonus: [
                "Animated 3d golden welcome bonus 100% rotating, footballs and coins falling, luxurious background, sleek motion graphics, professional advertisement, 4k"
            ],
            free_bet: [
                "Golden free bet ticket floating in magical space, sparkling particles, rotating 3d text 'FREE BET', premium feel, cinematic lighting, smooth animation"
            ],
            cashback: [
                "Golden shield protecting falling coins, cashback 10% text glowing, rotating camera view, luxurious metallic textures, professional 3d animation"
            ]
        };
    }

    /**
     * Templates pour stories sociales
     */
    loadSocialTemplates() {
        return {
            instagram: [
                "Vertical instagram story video, {home} vs {away} match highlights, fast paced edits, trendy transitions, vibrant colors, music visual effect, viral style",
                
                "TikTok style video, {home} fans dancing to celebrate win, popular dance moves, engaging content, bright colors, shareable format"
            ],
            
            tiktok: [
                "TikTok trend video, football celebration challenge, {home} players dancing in locker room, fun atmosphere, engaging content, viral potential"
            ]
        };
    }

    /**
     * Génère une vidéo avec Wan 2.6
     * Format: https://pollinations.ai/wan2.6/{prompt}
     */
    async generateVideo(prompt, options = {}) {
        try {
            const encodedPrompt = encodeURIComponent(prompt);
            let url = `${this.baseURL}${this.videoEndpoint}/${encodedPrompt}`;
            
            // Ajouter des paramètres optionnels
            if (options.duration) {
                url += `?duration=${options.duration}`;
            }
            if (options.seed) {
                url += `${options.duration ? '&' : '?'}seed=${options.seed}`;
            }
            
            // Pour l'instant, Wan 2.6 retourne directement la vidéo
            // Dans une version future, on pourrait avoir besoin de polling
            return url;
            
        } catch (error) {
            logger.error('Erreur génération vidéo:', error);
            return null;
        }
    }

    /**
     * Génère une bande-annonce pour un match
     */
    async generateMatchTrailer(match) {
        const cacheKey = `video_trailer:${match.id}`;
        
        // Vérifier si déjà généré
        const cached = await redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        // Sélectionner le style selon l'heure du match
        const matchHour = new Date(match.start_time).getHours();
        let style = 'epic';
        
        if (matchHour >= 18) {
            style = 'dramatic'; // Soir = dramatique
        } else if (matchHour >= 12) {
            style = 'african'; // Après-midi = ambiance africaine
        }

        // Sélectionner un template aléatoire
        const templates = this.templates.match_trailer[style];
        const template = templates[Math.floor(Math.random() * templates.length)];

        // Remplacer les variables
        const prompt = this.fillTemplate(template, {
            home: match.home_team,
            away: match.away_team,
            stadium: this.getStadiumName(match),
            league: match.league || 'Championnat Africain',
            country: this.getCountry(match)
        });

        // Générer la vidéo
        const videoUrl = await this.generateVideo(prompt, {
            seed: match.id,
            duration: '4s' // Durée actuelle de Wan 2.6
        });

        if (!videoUrl) return null;

        // Sauvegarder en base
        const { data, error } = await supabase
            .from('match_videos')
            .insert({
                match_id: match.id,
                video_url: videoUrl,
                prompt: prompt,
                type: 'trailer',
                duration: 4,
                created_at: new Date()
            })
            .select();

        if (error) {
            logger.error('Erreur sauvegarde vidéo:', error);
            return null;
        }

        // Mettre en cache
        await redis.set(cacheKey, JSON.stringify({
            url: videoUrl,
            id: data[0].id
        }), 'EX', 86400); // 24h

        return { url: videoUrl, id: data[0].id };
    }

    /**
     * Génère une célébration de but
     */
    async generateGoalCelebration(match, scorer) {
        const templates = this.templates.goal_celebration;
        const template = templates[Math.floor(Math.random() * templates.length)];

        const prompt = this.fillTemplate(template, {
            home: match.home_team,
            away: match.away_team,
            scorer: scorer || match.home_team + ' player',
            stadium: this.getStadiumName(match)
        });

        const videoUrl = await this.generateVideo(prompt, {
            seed: match.id * 100 + Date.now()
        });

        return videoUrl;
    }

    /**
     * Génère une vidéo promotionnelle
     */
    async generatePromoVideo(promo) {
        const templates = this.templates.promotion[promo.type] || 
                         this.templates.promotion.welcome_bonus;
        
        const template = templates[Math.floor(Math.random() * templates.length)];
        
        const prompt = this.fillTemplate(template, {
            bonus: promo.value || '100%',
            text: promo.title || 'Special Offer'
        });

        const videoUrl = await this.generateVideo(prompt, {
            seed: promo.id
        });

        return videoUrl;
    }

    /**
     * Génère une story Instagram/TikTok
     */
    async generateSocialStory(match, platform = 'instagram') {
        const templates = this.templates.social_story[platform];
        const template = templates[Math.floor(Math.random() * templates.length)];

        const prompt = this.fillTemplate(template, {
            home: match.home_team,
            away: match.away_team,
            platform: platform
        });

        // Format vertical pour stories
        const videoUrl = await this.generateVideo(prompt, {
            seed: match.id,
            aspect: '9:16' // Si supporté plus tard
        });

        return videoUrl;
    }

    /**
     * Remplit un template avec les variables
     */
    fillTemplate(template, variables) {
        return template.replace(/{(\w+)}/g, (match, key) => {
            return variables[key] || match;
        });
    }

    /**
     * Nom du stade
     */
    getStadiumName(match) {
        const stadiums = {
            'Guinée-Bissau': 'Estádio 24 de Setembro',
            'Sénégal': 'Stade Abdoulaye Wade',
            'Mali': 'Stade du 26 Mars',
            'Côte d\'Ivoire': 'Stade Félix Houphouët-Boigny'
        };
        return stadiums[match.country] || 'National Stadium';
    }

    /**
     * Pays à partir de l'équipe
     */
    getCountry(match) {
        // Logique simplifiée - à adapter
        return 'Guinée-Bissau';
    }
}

module.exports = new VideoGenerationService();