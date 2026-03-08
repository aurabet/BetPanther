-- Table pour suivre les générations quotidiennes d'images
CREATE TABLE IF NOT EXISTS daily_generations (
    id SERIAL PRIMARY KEY,
    generation_date DATE NOT NULL,
    match_id BIGINT REFERENCES matches(id),
    image_url TEXT NOT NULL,
    prompt TEXT NOT NULL,
    category VARCHAR(50), -- match, promotion, social, seasonal
    variation INT DEFAULT 0,
    used_count INT DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(match_id, variation, generation_date)
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_daily_generations_date ON daily_generations(generation_date);
CREATE INDEX IF NOT EXISTS idx_daily_generations_match ON daily_generations(match_id);
CREATE INDEX IF NOT EXISTS idx_daily_generations_used ON daily_generations(last_used);

-- Vue pour les images fraîches du jour
CREATE OR REPLACE VIEW fresh_daily_images AS
SELECT * FROM daily_generations
WHERE generation_date = CURRENT_DATE
ORDER BY created_at;

-- Fonction pour mettre à jour le compteur d'utilisation
CREATE OR REPLACE FUNCTION increment_used_count(p_id INT)
RETURNS VOID AS $$
BEGIN
    UPDATE daily_generations 
    SET used_count = used_count + 1, 
        last_used = NOW()
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les images non utilisées récemment
CREATE OR REPLACE FUNCTION get_unused_images(p_limit INT DEFAULT 10)
RETURNS SETOF daily_generations AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM daily_generations
    WHERE used_count = 0 OR last_used < NOW() - INTERVAL '7 days'
    ORDER BY used_count ASC, RANDOM()
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

