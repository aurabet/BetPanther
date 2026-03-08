const axios = require('axios');
const supabase = require('../config/supabase');
const redis = require('./redisService');
const logger = require('../utils/logger');
const dailyPrompts = require('./dailyImagePrompts');

class PollinationsService {
    constructor() {
        this.baseURL = 'https://pollinations.ai';
        this.textURL = 'https://text.pollinations.ai';
    }

    /**
     * Génère une image pour un match avec Pollinations.ai
     * Format d'URL: https://pollinations.ai/p/{prompt}
     */
    async generateMatchImage(match) {
        const cacheKey = `pollinations_match:${match.id}`;
        
        // Vérifier le cache
        const cached = await redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        // Construire le prompt pour une image sportive
        const prompt = this.buildMatchPrompt(match);
        
        try {
            // Encoder le prompt pour l'URL
            const encodedPrompt = encodeURIComponent(prompt);
            
            // Ajouter des paramètres optionnels
            const width = 1024;
            const height = 768;
            const seed = match.id; // Pour avoir des images cohérentes pour le même match
            
            // URL de génération Pollinations.ai
            const imageUrl = `${this.baseURL}/p/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
            
            // Sauvegarder dans Supabase
            const { data, error } = await supabase
                .from('match_images')
                .insert({
                    match_id: match.id,
                    image_url: imageUrl,
                    prompt: prompt,
                    model: 'pollinations',
                    created_at: new Date()
                })
                .select();

            if (error) throw error;

            // Mettre en cache (30 jours)
            await redis.set(cacheKey, JSON.stringify({
                url: imageUrl,
                id: data[0].id
            }), 'EX', 2592000);

            return { url: imageUrl, id: data[0].id };

        } catch (error) {
            logger.error('Erreur Pollinations:', error);
            return this.getFallbackImage(match);
        }
    }

    /**
     * Construit un prompt optimisé pour les matchs africains
     */
    buildMatchPrompt(match) {
        const homeTeam = match.home_team;
        const awayTeam = match.away_team;
        
        // Prompts variés pour éviter la monotonie
        const prompts = [
            `Professional sports photography of ${homeTeam} vs ${awayTeam} in an African football stadium, dramatic lighting, full crowd, national flags, 8k resolution, cinematic composition`,
            
            `Football match between ${homeTeam} and ${awayTeam} in Guinea-Bissau, vibrant African atmosphere, golden hour lighting, smoke flares in crowd, ultra realistic`,
            
            `Epic African football derby: ${homeTeam} against ${awayTeam}, packed stadium, colorful supporters, national geographic style photography`
        ];
        
        // Sélectionner un prompt basé sur l'ID du match pour la cohérence
        const promptIndex = (match.id % prompts.length);
        return prompts[promptIndex];
    }

    /**
     * Génère une description de match avec l'API texte
     * Utilise: https://text.pollinations.ai/{prompt}
     */
    async generateMatchDescription(match) {
        try {
            const prompt = `Write a short, exciting preview for the football match between ${match.home_team} and ${match.away_team} in the African championship. Include key players and what's at stake. Keep it under 100 words.`;
            
            const response = await axios.get(`${this.textURL}/${encodeURIComponent(prompt)}`);
            
            return response.data;
        } catch (error) {
            logger.error('Erreur génération description:', error);
            return `Match passionnant entre ${match.home_team} et ${match.away_team}!`;
        }
    }

    /**
     * Génère une image de promotion
     */
    async generatePromoImage(promo) {
        const prompts = {
            'welcome_bonus': `3D render golden welcome bonus 100% for African betting site, football theme, vibrant colors, professional advertising, 8k`,
            
            'free_bet': `Golden free bet ticket floating in air, magical sparkles, African football stadium background, cinematic lighting`,
            
            'cashback': `Golden shield protecting coins with "CASHBACK 10%" text, African sports theme, 3d render, luxurious`
        };

        const prompt = prompts[promo.type] || prompts.welcome_bonus;
        const encodedPrompt = encodeURIComponent(prompt);
        
        return `${this.baseURL}/p/${encodedPrompt}?width=1200&height=630&nologo=true`;
    }

    /**
     * Génère un avatar utilisateur stylisé
     */
    async generateUserAvatar(username, style = 'abstract') {
        const prompt = `Abstract colorful avatar for football fan named ${username}, vibrant colors, geometric shapes, digital art`;
        const encodedPrompt = encodeURIComponent(prompt);
        
        return `${this.baseURL}/p/${encodedPrompt}?width=256&height=256&seed=${username.length}&nologo=true`;
    }

    getFallbackImage(match) {
        return {
            url: `https://ui-avatars.com/api/?name=${match.home_team}+${match.away_team}&background=22c55e&color=fff&size=512`,
            fallback: true
        };
    }

    /**
     * Génère une image avec le prompt du jour (utilise dailyImagePrompts)
     * @param {Object} match - Données du match
     * @param {string} type - Type de prompt ('match' ou 'social')
     * @returns {Object} URL de l'image générée
     */
    async generateDailyMatchImage(match, type = 'match') {
        const cacheKey = `daily_pollinations:${match.id}:${type}`;
        
        // Vérifier le cache
        const cached = await redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        // Obtenir les prompts du jour actuel
        const dailyData = dailyPrompts.getCurrentDayPrompts();
        const prompt = dailyPrompts.generateMatchPrompt(dailyData.day, type, {
            home: match.home_team,
            away: match.away_team,
            stadium: match.stadium || 'African Stadium'
        });

        try {
            const encodedPrompt = encodeURIComponent(prompt);
            const width = 1024;
            const height = 768;
            const seed = match.id + dailyData.day.length; // Variation par jour
            
            const imageUrl = `${this.baseURL}/p/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
            
            // Sauvegarder dans Supabase
            const { data, error } = await supabase
                .from('match_images')
                .insert({
                    match_id: match.id,
                    image_url: imageUrl,
                    prompt: prompt,
                    model: 'pollinations_daily',
                    created_at: new Date()
                })
                .select();

            if (error) throw error;

            // Mettre en cache (1 jour pour les prompts quotidiens)
            await redis.set(cacheKey, JSON.stringify({
                url: imageUrl,
                id: data[0].id,
                theme: dailyData.theme,
                day: dailyData.day
            }), 'EX', 86400);

            return { 
                url: imageUrl, 
                id: data[0].id,
                theme: dailyData.theme,
                day: dailyData.day
            };

        } catch (error) {
            logger.error('Erreur Pollinations Daily:', error);
            return this.getFallbackImage(match);
        }
    }

    /**
     * Génère une image pour un jour spécifique de la semaine
     * @param {Object} match - Données du match
     * @param {string} day - Jour de la semaine (monday, tuesday, etc.)
     * @param {string} type - Type de prompt ('match' ou 'social')
     * @returns {Object} URL de l'image générée
     */
    async generateMatchImageForDay(match, day, type = 'match') {
        const cacheKey = `day_pollinations:${match.id}:${day}:${type}`;
        
        const cached = await redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        const dayData = dailyPrompts.getDayPrompts(day);
        if (!dayData) {
            return this.getFallbackImage(match);
        }

        const prompt = dailyPrompts.generateMatchPrompt(day, type, {
            home: match.home_team,
            away: match.away_team,
            stadium: match.stadium || 'African Stadium'
        });

        try {
            const encodedPrompt = encodeURIComponent(prompt);
            const width = 1024;
            const height = 768;
            const seed = match.id + day.length;
            
            const imageUrl = `${this.baseURL}/p/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
            
            const { data, error } = await supabase
                .from('match_images')
                .insert({
                    match_id: match.id,
                    image_url: imageUrl,
                    prompt: prompt,
                    model: 'pollinations_day',
                    created_at: new Date()
                })
                .select();

            if (error) throw error;

            await redis.set(cacheKey, JSON.stringify({
                url: imageUrl,
                id: data[0].id,
                theme: dayData.theme,
                day: day
            }), 'EX', 86400);

            return { 
                url: imageUrl, 
                id: data[0].id,
                theme: dayData.theme,
                day: day
            };

        } catch (error) {
            logger.error('Erreur Pollinations Day:', error);
            return this.getFallbackImage(match);
        }
    }

    /**
     * Obtient les informations du jour actuel
     * @returns {Object} Données du jour actuel
     */
    getCurrentDayInfo() {
        return dailyPrompts.getCurrentDayPrompts();
    }
}

module.exports = new PollinationsService();
