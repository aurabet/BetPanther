const cron = require('node-cron');
const supabase = require('../config/supabase');
const videoService = require('../services/videoGenerationService');
const logger = require('../utils/logger');

// Génération des bandes-annonces à 5h du matin
cron.schedule('0 5 * * *', async () => {
    logger.info('Démarrage génération vidéos quotidiennes');
    
    try {
        // Récupérer les matchs du jour
        const { data: matches } = await supabase
            .from('matches')
            .select('*')
            .gte('start_time', new Date().toISOString())
            .lt('start_time', new Date(Date.now() + 24*60*60*1000).toISOString())
            .eq('status', 'scheduled');

        logger.info(`Génération vidéos pour ${matches.length} matchs`);

        for (const match of matches) {
            try {
                // Générer 3 types de vidéos par match
                
                // 1. Bande-annonce principale
                await videoService.generateMatchTrailer(match);
                await new Promise(r => setTimeout(r, 2000));
                
                // 2. Story Instagram
                await videoService.generateSocialStory(match, 'instagram');
                await new Promise(r => setTimeout(r, 2000));
                
                // 3. Version TikTok
                await videoService.generateSocialStory(match, 'tiktok');
                await new Promise(r => setTimeout(r, 2000));
                
                logger.info(`✓ Vidéos générées pour ${match.home_team} vs ${match.away_team}`);
                
            } catch (err) {
                logger.error(`Erreur pour match ${match.id}:`, err);
            }
        }
        
        logger.info('Génération vidéos terminée');
        
    } catch (error) {
        logger.error('Erreur cron vidéos:', error);
    }
});

// Génération vidéos promotionnelles à 8h
cron.schedule('0 8 * * *', async () => {
    try {
        const { data: promotions } = await supabase
            .from('promotions')
            .select('*')
            .eq('status', 'active')
            .is('video_url', null);

        for (const promo of promotions || []) {
            await videoService.generatePromoVideo(promo);
            await new Promise(r => setTimeout(r, 3000));
        }
    } catch (error) {
        logger.error('Erreur vidéos promo:', error);
    }
});

// Génération célébrations pour les buts (toutes les 15 min pendant les matchs)
cron.schedule('*/15 * * * *', async () => {
    try {
        // Récupérer les matchs en direct avec des buts récents
        const { data: liveMatches } = await supabase
            .from('matches')
            .select('*')
            .eq('status', 'live');

        for (const match of liveMatches || []) {
            // Vérifier s'il y a eu un but dans les 15 dernières minutes
            // Logique à implémenter selon votre système
        }
    } catch (error) {
        logger.error('Erreur célébrations:', error);
    }
});