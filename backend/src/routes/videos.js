const express = require('express');
const router = express.Router();
const videoService = require('../services/videoGenerationService');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// Récupérer la bande-annonce d'un match
router.get('/trailer/:matchId', auth, async (req, res) => {
    try {
        const { matchId } = req.params;
        
        // Vérifier si la vidéo existe déjà
        const { data: existing } = await supabase
            .from('match_videos')
            .select('*')
            .eq('match_id', matchId)
            .eq('type', 'trailer')
            .order('created_at', { ascending: false })
            .limit(1);

        if (existing && existing.length > 0) {
            return res.json({
                url: existing[0].video_url,
                id: existing[0].id,
                cached: true
            });
        }

        // Récupérer les infos du match
        const { data: match } = await supabase
            .from('matches')
            .select('*')
            .eq('id', matchId)
            .single();

        if (!match) {
            return res.status(404).json({ error: 'Match non trouvé' });
        }

        // Générer la vidéo
        const video = await videoService.generateMatchTrailer(match);
        
        if (!video) {
            return res.status(500).json({ error: 'Erreur génération vidéo' });
        }

        res.json(video);
        
    } catch (error) {
        console.error('Erreur vidéo:', error);
        res.status(500).json({ error: error.message });
    }
});

// Générer une célébration de but
router.post('/celebration', auth, async (req, res) => {
    try {
        const { matchId, scorer } = req.body;
        
        const { data: match } = await supabase
            .from('matches')
            .select('*')
            .eq('id', matchId)
            .single();

        if (!match) {
            return res.status(404).json({ error: 'Match non trouvé' });
        }

        const videoUrl = await videoService.generateGoalCelebration(match, scorer);
        
        res.json({ url: videoUrl });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Générer une vidéo promotionnelle
router.post('/promo', auth, async (req, res) => {
    try {
        const { promoId } = req.body;
        
        const { data: promo } = await supabase
            .from('promotions')
            .select('*')
            .eq('id', promoId)
            .single();

        if (!promo) {
            return res.status(404).json({ error: 'Promotion non trouvée' });
        }

        const videoUrl = await videoService.generatePromoVideo(promo);
        
        res.json({ url: videoUrl });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Générer une story sociale
router.post('/story', auth, async (req, res) => {
    try {
        const { matchId, platform = 'instagram' } = req.body;
        
        const { data: match } = await supabase
            .from('matches')
            .select('*')
            .eq('id', matchId)
            .single();

        if (!match) {
            return res.status(404).json({ error: 'Match non trouvé' });
        }

        const videoUrl = await videoService.generateSocialStory(match, platform);
        
        res.json({ url: videoUrl });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Récupérer les vidéos d'un match
router.get('/match/:matchId', auth, async (req, res) => {
    try {
        const { matchId } = req.params;
        
        const { data: videos } = await supabase
            .from('match_videos')
            .select('*')
            .eq('match_id', matchId)
            .order('created_at', { ascending: false });

        res.json(videos);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

