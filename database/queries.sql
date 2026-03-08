-- PyBet Analytics Queries for Sports Betting Platform
-- Advanced SQL queries for AI-driven betting analysis and user statistics

-- 1. Récupérer les matchs du jour avec les dernières cotes
WITH latest_odds AS (
    SELECT DISTINCT ON (match_id) 
        match_id,
        odds_home,
        odds_draw,
        odds_away,
        margin
    FROM odds
    WHERE valid_to IS NULL
    ORDER BY match_id, created_at DESC
)
SELECT 
    m.*,
    lo.odds_home,
    lo.odds_draw,
    lo.odds_away,
    lo.margin,
    COALESCE(ba.predicted_home, 0) as ai_pred_home,
    COALESCE(ba.predicted_draw, 0) as ai_pred_draw,
    COALESCE(ba.predicted_away, 0) as ai_pred_away
FROM matches m
LEFT JOIN latest_odds lo ON m.id = lo.match_id
LEFT JOIN betting_analytics ba ON m.id = ba.match_id 
    AND ba.created_at = (
        SELECT MAX(created_at) 
        FROM betting_analytics 
        WHERE match_id = m.id
    )
WHERE m.start_time BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
    AND m.status = 'scheduled'
ORDER BY m.start_time;

-- 2. Calculer les statistiques utilisateur pour PyBet
CREATE OR REPLACE FUNCTION get_user_betting_stats(user_uuid UUID)
RETURNS TABLE (
    total_bets BIGINT,
    total_stake DECIMAL,
    total_won DECIMAL,
    win_rate DECIMAL,
    avg_odds DECIMAL,
    roi DECIMAL,
    favorite_market VARCHAR,
    avg_stake_per_bet DECIMAL,
    biggest_win DECIMAL,
    biggest_loss DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_bets,
        SUM(stake) as total_stake,
        COALESCE(SUM(CASE WHEN status = 'won' THEN actual_win ELSE 0 END), 0) as total_won,
        (COUNT(CASE WHEN status = 'won' THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0)::DECIMAL * 100) as win_rate,
        AVG(odds_at_placement) as avg_odds,
        ((SUM(CASE WHEN status = 'won' THEN actual_win ELSE 0 END) - SUM(stake)) / NULLIF(SUM(stake), 0) * 100) as roi,
        (
            SELECT market_type 
            FROM bets 
            WHERE user_id = user_uuid 
            GROUP BY market_type 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
        ) as favorite_market,
        AVG(stake) as avg_stake_per_bet,
        MAX(CASE WHEN status = 'won' THEN actual_win ELSE 0 END) as biggest_win,
        MAX(CASE WHEN status = 'lost' THEN stake ELSE 0 END) as biggest_loss
    FROM bets
    WHERE user_id = user_uuid
        AND placed_at >= NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 3. Analyse de valeur attendue (Expected Value) pour les paris
CREATE OR REPLACE FUNCTION calculate_expected_value(
    p_odds DECIMAL,
    p_probability DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    RETURN (p_odds * p_probability) - 1;
END;
$$ LANGUAGE plpgsql;

-- 4. Requête pour les paris à valeur positive (Value Bets)
WITH value_bets_analysis AS (
    SELECT 
        b.*,
        ba.predicted_home,
        ba.predicted_draw,
        ba.predicted_away,
        lo.odds_home,
        lo.odds_draw,
        lo.odds_away,
        CASE 
            WHEN b.selection = 'home' THEN calculate_expected_value(lo.odds_home, ba.predicted_home / 100)
            WHEN b.selection = 'draw' THEN calculate_expected_value(lo.odds_draw, ba.predicted_draw / 100)
            WHEN b.selection = 'away' THEN calculate_expected_value(lo.odds_away, ba.predicted_away / 100)
        END as expected_value
    FROM bets b
    JOIN matches m ON b.match_id = m.id
    JOIN latest_odds lo ON m.id = lo.match_id
    JOIN betting_analytics ba ON m.id = ba.match_id
    WHERE b.status = 'pending'
        AND ba.created_at = (
            SELECT MAX(created_at) 
            FROM betting_analytics 
            WHERE match_id = m.id
        )
)
SELECT * FROM value_bets_analysis
WHERE expected_value > 0
ORDER BY expected_value DESC;

-- 5. Analyse de performance des modèles IA
SELECT 
    ba.model_name,
    COUNT(*) as predictions_count,
    AVG(ba.confidence_score) as avg_confidence,
    AVG(
        CASE 
            WHEN m.home_score > m.away_score AND ba.predicted_home > ba.predicted_away THEN 1
            WHEN m.home_score < m.away_score AND ba.predicted_away > ba.predicted_home THEN 1
            WHEN m.home_score = m.away_score AND ba.predicted_draw > GREATEST(ba.predicted_home, ba.predicted_away) THEN 1
            ELSE 0
        END
    ) as accuracy_rate
FROM betting_analytics ba
JOIN matches m ON ba.match_id = m.id
WHERE m.status = 'finished'
    AND m.end_time >= NOW() - INTERVAL '30 days'
GROUP BY ba.model_name
ORDER BY accuracy_rate DESC;

-- 6. Analyse de risque et gestion de bankroll
CREATE OR REPLACE FUNCTION calculate_kelly_criterion(
    p_odds DECIMAL,
    p_probability DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
    IF p_probability = 0 OR p_odds = 0 THEN
        RETURN 0;
    END IF;
    RETURN (p_odds * p_probability - (1 - p_probability)) / p_odds;
END;
$$ LANGUAGE plpgsql;

-- 7. Requête pour les recommandations de mise selon Kelly
WITH kelly_recommendations AS (
    SELECT 
        b.*,
        ba.predicted_home,
        ba.predicted_draw,
        ba.predicted_away,
        lo.odds_home,
        lo.odds_draw,
        lo.odds_away,
        u.balance,
        CASE 
            WHEN b.selection = 'home' THEN calculate_kelly_criterion(lo.odds_home, ba.predicted_home / 100)
            WHEN b.selection = 'draw' THEN calculate_kelly_criterion(lo.odds_draw, ba.predicted_draw / 100)
            WHEN b.selection = 'away' THEN calculate_kelly_criterion(lo.odds_away, ba.predicted_away / 100)
        END as kelly_fraction
    FROM bets b
    JOIN users u ON b.user_id = u.id
    JOIN matches m ON b.match_id = m.id
    JOIN latest_odds lo ON m.id = lo.match_id
    JOIN betting_analytics ba ON m.id = ba.match_id
    WHERE b.status = 'pending'
        AND ba.created_at = (
            SELECT MAX(created_at) 
            FROM betting_analytics 
            WHERE match_id = m.id
        )
)
SELECT 
    *,
    balance * kelly_fraction as recommended_stake,
    CASE 
        WHEN kelly_fraction > 0.1 THEN 'HIGH RISK'
        WHEN kelly_fraction > 0.05 THEN 'MEDIUM RISK'
        WHEN kelly_fraction > 0 THEN 'LOW RISK'
        ELSE 'NO BET'
    END as risk_level
FROM kelly_recommendations
WHERE kelly_fraction > 0
ORDER BY kelly_fraction DESC;

-- 8. Analyse des tendances de paris par utilisateur
SELECT 
    u.username,
    DATE(b.placed_at) as bet_date,
    COUNT(*) as bets_count,
    SUM(b.stake) as total_stake,
    SUM(CASE WHEN b.status = 'won' THEN b.actual_win ELSE 0 END) as total_won,
    AVG(b.odds_at_placement) as avg_odds,
    ((SUM(CASE WHEN b.status = 'won' THEN b.actual_win ELSE 0 END) - SUM(b.stake)) / NULLIF(SUM(b.stake), 0) * 100) as roi
FROM users u
JOIN bets b ON u.id = b.user_id
WHERE b.placed_at >= NOW() - INTERVAL '30 days'
GROUP BY u.username, DATE(b.placed_at)
ORDER BY bet_date DESC, total_stake DESC;

-- 9. Analyse des marchés les plus rentables
SELECT 
    b.market_type,
    COUNT(*) as total_bets,
    SUM(b.stake) as total_staked,
    SUM(CASE WHEN b.status = 'won' THEN b.actual_win ELSE 0 END) as total_won,
    AVG(b.odds_at_placement) as avg_odds,
    ((SUM(CASE WHEN b.status = 'won' THEN b.actual_win ELSE 0 END) - SUM(b.stake)) / NULLIF(SUM(b.stake), 0) * 100) as roi,
    COUNT(CASE WHEN b.status = 'won' THEN 1 END)::DECIMAL / COUNT(*) * 100 as win_rate
FROM bets b
WHERE b.placed_at >= NOW() - INTERVAL '90 days'
GROUP BY b.market_type
HAVING COUNT(*) >= 10
ORDER BY roi DESC;

-- 10. Analyse des paris en direct (Live Betting)
SELECT 
    m.home_team,
    m.away_team,
    m.start_time,
    COUNT(b.id) as live_bets_count,
    SUM(b.stake) as total_live_staked,
    AVG(b.odds_at_placement) as avg_live_odds,
    COUNT(CASE WHEN b.status = 'won' THEN 1 END)::DECIMAL / COUNT(*) * 100 as live_win_rate
FROM matches m
JOIN bets b ON m.id = b.match_id
WHERE m.status IN ('live', 'finished')
    AND b.placed_at >= m.start_time
    AND b.placed_at <= m.end_time
GROUP BY m.id, m.home_team, m.away_team, m.start_time
HAVING COUNT(b.id) > 0
ORDER BY total_live_staked DESC;

-- 11. Analyse de corrélation entre cotes et probabilités IA
SELECT 
    ba.model_name,
    AVG(
        CASE 
            WHEN b.selection = 'home' THEN ABS((ba.predicted_home / 100) - (1 / lo.odds_home))
            WHEN b.selection = 'draw' THEN ABS((ba.predicted_draw / 100) - (1 / lo.odds_draw))
            WHEN b.selection = 'away' THEN ABS((ba.predicted_away / 100) - (1 / lo.odds_away))
        END
    ) as avg_probability_discrepancy,
    COUNT(*) as total_predictions
FROM betting_analytics ba
JOIN matches m ON ba.match_id = m.id
JOIN bets b ON m.id = b.match_id
JOIN latest_odds lo ON m.id = lo.match_id
WHERE m.status = 'finished'
    AND ba.created_at >= NOW() - INTERVAL '30 days'
GROUP BY ba.model_name
ORDER BY avg_probability_discrepancy ASC;

-- 12. Analyse des paris combinés (Accumulators)
SELECT 
    b.bet_slip_id,
    COUNT(*) as selections_count,
    SUM(b.stake) as total_stake,
    SUM(CASE WHEN b.status = 'won' THEN b.actual_win ELSE 0 END) as total_return,
    CASE 
        WHEN COUNT(CASE WHEN b.status = 'won' THEN 1 END) = COUNT(*) THEN 'WON'
        WHEN COUNT(CASE WHEN b.status = 'lost' THEN 1 END) > 0 THEN 'LOST'
        ELSE 'PENDING'
    END as accumulator_status
FROM bets b
WHERE b.bet_slip_id IS NOT NULL
    AND b.placed_at >= NOW() - INTERVAL '7 days'
GROUP BY b.bet_slip_id
HAVING COUNT(*) > 1
ORDER BY total_stake DESC;

-- 13. Analyse de la variance et du risque
SELECT 
    u.username,
    COUNT(*) as total_bets,
    SUM(b.stake) as total_staked,
    SUM(CASE WHEN b.status = 'won' THEN b.actual_win ELSE 0 END) as total_won,
    STDDEV(b.odds_at_placement) as odds_stddev,
    VARIANCE(b.odds_at_placement) as odds_variance,
    MAX(b.risk_score) as max_risk_score,
    AVG(b.risk_score) as avg_risk_score
FROM users u
JOIN bets b ON u.id = b.user_id
WHERE b.placed_at >= NOW() - INTERVAL '30 days'
GROUP BY u.username
HAVING COUNT(*) >= 20
ORDER BY avg_risk_score DESC;

-- 14. Analyse des paris responsables
SELECT 
    u.username,
    COUNT(*) as total_bets_today,
    SUM(b.stake) as total_staked_today,
    COUNT(DISTINCT DATE(b.placed_at)) as betting_days_last_month,
    AVG(EXTRACT(HOUR FROM b.placed_at)) as avg_betting_hour,
    MAX(b.placed_at) - MIN(b.placed_at) as session_duration
FROM users u
JOIN bets b ON u.id = b.user_id
WHERE b.placed_at >= NOW() - INTERVAL '30 days'
GROUP BY u.username, DATE(b.placed_at)
HAVING COUNT(*) > 10
ORDER BY total_staked_today DESC;

-- 15. Analyse des opportunités d'arbitrage
WITH arbitrage_opportunities AS (
    SELECT 
        m.id as match_id,
        m.home_team,
        m.away_team,
        m.start_time,
        MAX(lo.odds_home) as max_home_odds,
        MAX(lo.odds_draw) as max_draw_odds,
        MAX(lo.odds_away) as max_away_odds,
        1/MAX(lo.odds_home) + 1/MAX(lo.odds_draw) + 1/MAX(lo.odds_away) as arbitrage_factor
    FROM matches m
    JOIN latest_odds lo ON m.id = lo.match_id
    WHERE m.start_time BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
        AND m.status = 'scheduled'
    GROUP BY m.id, m.home_team, m.away_team, m.start_time
)
SELECT 
    *,
    CASE 
        WHEN arbitrage_factor < 1 THEN (1 - arbitrage_factor) * 100
        ELSE 0
    END as arbitrage_profit_percentage
FROM arbitrage_opportunities
WHERE arbitrage_factor < 0.98
ORDER BY arbitrage_profit_percentage DESC;