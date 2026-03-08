import numpy as np
import pandas as pd
from sqlalchemy import create_engine
import redis
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import pickle

from ..models import PoissonModel, EloModel, LogisticModel
from ..analytics import BettingStrategy, KellyCriterion
from ..risk import RiskAnalyzer, FraudDetector

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BettingAnalytics:
    def __init__(self, db_url, redis_host='localhost', redis_port=6379):
        """Initialise les connexions et les modèles"""
        self.db_engine = create_engine(db_url)
        self.redis_client = redis.Redis(
            host=redis_host,
            port=redis_port,
            decode_responses=True
        )
        
        # Initialiser les modèles
        self.poisson_model = PoissonModel()
        self.elo_model = EloModel(k_factor=32)
        self.logistic_model = LogisticModel()
        
        # Détecteur de fraude
        self.fraud_detector = FraudDetector()
        
        # Cache pour les features
        self.feature_cache = {}
        
    def load_match_data(self, days_back=30):
        """Charge les données des matchs depuis PostgreSQL"""
        query = f"""
            SELECT 
                m.id as match_id,
                m.start_time,
                m.home_team,
                m.away_team,
                m.home_score,
                m.away_score,
                m.home_penalty,
                m.away_penalty,
                m.statistics,
                o.odds_home,
                o.odds_draw,
                o.odds_away,
                o.volume,
                COUNT(b.id) as total_bets,
                SUM(b.stake) as total_stake,
                AVG(b.odds_at_placement) as avg_odds
            FROM matches m
            LEFT JOIN odds o ON m.id = o.match_id AND o.valid_to IS NULL
            LEFT JOIN bets b ON m.id = b.match_id
            WHERE m.start_time >= NOW() - INTERVAL '{days_back} days'
            GROUP BY m.id, m.start_time, m.home_team, m.away_team, 
                     m.home_score, m.away_score, m.home_penalty, 
                     m.away_penalty, m.statistics,
                     o.odds_home, o.odds_draw, o.odds_away, o.volume
            ORDER BY m.start_time DESC
        """
        
        df = pd.read_sql(query, self.db_engine)
        
        # Nettoyage et préparation
        df['home_score'] = pd.to_numeric(df['home_score'], errors='coerce').fillna(0)
        df['away_score'] = pd.to_numeric(df['away_score'], errors='coerce').fillna(0)
        df['odds_home'] = pd.to_numeric(df['odds_home'], errors='coerce')
        df['odds_draw'] = pd.to_numeric(df['odds_draw'], errors='coerce')
        df['odds_away'] = pd.to_numeric(df['odds_away'], errors='coerce')
        
        # Calculer les probabilités implicites
        df['implied_prob_home'] = 1 / df['odds_home']
        df['implied_prob_draw'] = 1 / df['odds_draw']
        df['implied_prob_away'] = 1 / df['odds_away']
        
        return df
    
    def train_poisson_model(self, match_data):
        """Entraîne un modèle de Poisson pour prédire les scores"""
        logger.info("Entraînement du modèle Poisson...")
        
        # Préparer les données
        home_goals = match_data['home_score'].values
        away_goals = match_data['away_score'].values
        
        # Features pour le modèle
        home_features = self._extract_team_features(match_data, 'home')
        away_features = self._extract_team_features(match_data, 'away')
        
        # Entraîner le modèle
        self.poisson_model.fit(
            home_goals, 
            away_goals,
            home_features=home_features,
            away_features=away_features
        )
        
        logger.info("Modèle Poisson entraîné avec succès")
        return self.poisson_model
    
    def _extract_team_features(self, match_data, team_type):
        """Extrait les features pour une équipe"""
        features = []
        
        for _, match in match_data.iterrows():
            team_stats = {
                'avg_goals_scored': self._calculate_avg_goals(
                    match_data, match[f'{team_type}_team'], team_type
                ),
                'avg_goals_conceded': self._calculate_avg_goals(
                    match_data, match[f'{team_type}_team'], 'opponent'
                ),
                'form': self._calculate_form(
                    match_data, match[f'{team_type}_team'], match['start_time']
                ),
                'days_rest': self._calculate_rest_days(
                    match_data, match[f'{team_type}_team'], match['start_time']
                )
            }
            features.append(team_stats)
        
        return pd.DataFrame(features)
    
    def _calculate_avg_goals(self, data, team, stat_type):
        """Calcule la moyenne de buts pour une équipe"""
        if stat_type == 'home':
            team_matches = data[data['home_team'] == team]
            return team_matches['home_score'].mean() if len(team_matches) > 0 else 1.5
        elif stat_type == 'away':
            team_matches = data[data['away_team'] == team]
            return team_matches['away_score'].mean() if len(team_matches) > 0 else 1.2
        elif stat_type == 'opponent':
            home_matches = data[data['home_team'] == team]
            away_matches = data[data['away_team'] == team]
            conceded = pd.concat([
                home_matches['away_score'],
                away_matches['home_score']
            ])
            return conceded.mean() if len(conceded) > 0 else 1.3
    
    def _calculate_form(self, data, team, current_time):
        """Calcule la forme récente (points des 5 derniers matchs)"""
        recent = data[
            ((data['home_team'] == team) | (data['away_team'] == team)) &
            (data['start_time'] < current_time)
        ].sort_values('start_time', ascending=False).head(5)
        
        points = 0
        for _, match in recent.iterrows():
            if match['home_team'] == team:
                if match['home_score'] > match['away_score']:
                    points += 3
                elif match['home_score'] == match['away_score']:
                    points += 1
            else:
                if match['away_score'] > match['home_score']:
                    points += 3
                elif match['home_score'] == match['away_score']:
                    points += 1
        
        return points / 15.0  # Normalisé entre 0 et 1
    
    def _calculate_rest_days(self, data, team, current_time):
        """Calcule les jours de repos depuis le dernier match"""
        last_match = data[
            ((data['home_team'] == team) | (data['away_team'] == team)) &
            (data['start_time'] < current_time)
        ].sort_values('start_time', ascending=False).head(1)
        
        if len(last_match) > 0:
            last_date = pd.to_datetime(last_match.iloc[0]['start_time'])
            current_date = pd.to_datetime(current_time)
            return (current_date - last_date).days
        return 7  # Valeur par défaut
    
    def predict_match(self, match_id, home_team, away_team):
        """Prédit les probabilités pour un match"""
        logger.info(f"Prédiction pour le match {match_id}: {home_team} vs {away_team}")
        
        # Récupérer les données récentes
        match_data = self.load_match_data(days_back=90)
        
        # Extraire les features
        home_features = self._extract_team_features(
            match_data[match_data['home_team'] == home_team].head(1), 'home'
        ).iloc[0] if len(match_data) > 0 else {}
        
        away_features = self._extract_team_features(
            match_data[match_data['away_team'] == away_team].head(1), 'away'
        ).iloc[0] if len(match_data) > 0 else {}
        
        # Prédiction avec modèle Poisson
        poisson_pred = self.poisson_model.predict(
            home_features=home_features,
            away_features=away_features
        )
        
        # Prédiction avec Elo
        elo_pred = self.elo_model.predict(home_team, away_team)
        
        # Combiner les modèles (ensemble)
        combined_pred = {
            'home_win': 0.4 * poisson_pred['home_win'] + 0.6 * elo_pred['home_win'],
            'draw': 0.4 * poisson_pred['draw'] + 0.6 * elo_pred['draw'],
            'away_win': 0.4 * poisson_pred['away_win'] + 0.6 * elo_pred['away_win'],
            'over_25': poisson_pred['over_25'],
            'btts': poisson_pred['btts'],
            'expected_goals': poisson_pred['expected_goals']
        }
        
        # Calculer la valeur attendue (Expected Value)
        combined_pred['confidence'] = self._calculate_confidence(combined_pred)
        
        return combined_pred
    
    def _calculate_confidence(self, predictions):
        """Calcule un score de confiance pour la prédiction"""
        # Plus la probabilité du résultat le plus probable est élevée, plus la confiance est grande
        max_prob = max(predictions['home_win'], predictions['draw'], predictions['away_win'])
        
        # Écart-type des probabilités (plus c'est dispersé, plus c'est sûr)
        probs = [predictions['home_win'], predictions['draw'], predictions['away_win']]
        std_dev = np.std(probs)
        
        # Score de confiance entre 0 et 1
        confidence = min(1.0, (max_prob * (1 + std_dev)) / 2)
        
        return confidence
    
    def find_value_bets(self, match_id, market_odds):
        """Trouve les paris à valeur (value bets)"""
        # Récupérer la prédiction
        match_data = self.load_match_data().query(f"match_id == {match_id}")
        if len(match_data) == 0:
            return []
        
        match = match_data.iloc[0]
        prediction = self.predict_match(
            match_id,
            match['home_team'],
            match['away_team']
        )
        
        value_bets = []
        
        # Calculer la valeur pour chaque résultat
        for outcome, prob in [
            ('home', prediction['home_win']),
            ('draw', prediction['draw']),
            ('away', prediction['away_win'])
        ].items():
            market_prob = 1 / market_odds[outcome]
            expected_value = (prob * market_odds[outcome]) - 1
            
            if expected_value > 0.05:  # Seulement les value bets > 5%
                kelly = KellyCriterion.calculate_fraction(prob, market_odds[outcome])
                
                value_bets.append({
                    'match_id': match_id,
                    'outcome': outcome,
                    'predicted_prob': prob,
                    'market_odds': market_odds[outcome],
                    'expected_value': expected_value,
                    'kelly_fraction': kelly,
                    'confidence': prediction['confidence']
                })
        
        return value_bets
    
    def detect_anomalies(self, match_id):
        """Détecte les anomalies dans les paris"""
        # Récupérer les paris pour ce match
        query = f"""
            SELECT 
                b.*,
                u.created_at as user_created_at,
                u.is_verified
            FROM bets b
            JOIN users u ON b.user_id = u.id
            WHERE b.match_id = {match_id}
                AND b.placed_at >= NOW() - INTERVAL '1 hour'
        """
        
        bets_df = pd.read_sql(query, self.db_engine)
        
        if len(bets_df) == 0:
            return []
        
        anomalies = []
        
        # 1. Détection des comptes multiples
        ip_groups = bets_df.groupby('ip_address').size()
        suspicious_ips = ip_groups[ip_groups > 3].index.tolist()
        
        for ip in suspicious_ips:
            anomalies.append({
                'type': 'multiple_accounts',
                'ip': ip,
                'count': ip_groups[ip],
                'severity': 'high' if ip_groups[ip] > 5 else 'medium'
            })
        
        # 2. Détection des paris anormaux
        avg_stake = bets_df['stake'].mean()
        std_stake = bets_df['stake'].std()
        
        large_bets = bets_df[bets_df['stake'] > avg_stake + 3 * std_stake]
        for _, bet in large_bets.iterrows():
            anomalies.append({
                'type': 'unusually_large_bet',
                'bet_id': bet['id'],
                'user_id': bet['user_id'],
                'stake': bet['stake'],
                'severity': 'high'
            })
        
        # 3. Détection des patterns de timing
        bets_df['minute'] = pd.to_datetime(bets_df['placed_at']).dt.minute
        minute_groups = bets_df.groupby('minute').size()
        
        if minute_groups.max() > len(bets_df) * 0.3:  # 30% des paris dans la même minute
            anomalies.append({
                'type': 'suspicious_timing',
                'minute': minute_groups.idxmax(),
                'count': minute_groups.max(),
                'severity': 'medium'
            })
        
        return anomalies
    
    def calculate_risk_score(self, user_id):
        """Calcule le score de risque pour un utilisateur"""
        query = f"""
            SELECT 
                b.*,
                EXTRACT(EPOCH FROM (b.placed_at - u.created_at)) / 86400 as days_since_registration
            FROM bets b
            JOIN users u ON b.user_id = u.id
            WHERE b.user_id = '{user_id}'
                AND b.placed_at >= NOW() - INTERVAL '30 days'
        """
        
        bets_df = pd.read_sql(query, self.db_engine)
        
        if len(bets_df) == 0:
            return 0.0
        
        risk_score = 0.0
        
        # 1. Risque basé sur le volume de paris
        total_stake = bets_df['stake'].sum()
        avg_stake = bets_df['stake'].mean()
        
        if total_stake > 10000:  # Plus de 10k pariés
            risk_score += 0.3
        elif total_stake > 5000:
            risk_score += 0.2
        elif total_stake > 1000:
            risk_score += 0.1
        
        # 2. Risque basé sur la fréquence
        bets_per_day = len(bets_df) / 30
        if bets_per_day > 50:
            risk_score += 0.3
        elif bets_per_day > 20:
            risk_score += 0.2
        elif bets_per_day > 10:
            risk_score += 0.1
        
        # 3. Risque basé sur les pertes
        total_won = bets_df[bets_df['status'] == 'won']['actual_win'].sum()
        total_lost = bets_df[bets_df['status'] == 'lost']['stake'].sum()
        net_loss = total_lost - total_won
        
        if net_loss > 5000:
            risk_score += 0.4
        elif net_loss > 2000:
            risk_score += 0.3
        elif net_loss > 500:
            risk_score += 0.2
        
        # 4. Risque basé sur le comportement
        if bets_df['days_since_registration'].min() < 1:  # Compte créé aujourd'hui
            risk_score += 0.5
        
        # 5. Risque basé sur les paris en direct
        live_bets = bets_df[bets_df['placed_at'] > bets_df['start_time']]
        if len(live_bets) > len(bets_df) * 0.5:  # Plus de 50% de paris en live
            risk_score += 0.2
        
        return min(risk_score, 1.0)
    
    def generate_match_report(self, match_id):
        """Génère un rapport complet pour un match"""
        logger.info(f"Génération du rapport pour le match {match_id}")
        
        # Charger les données
        match_data = self.load_match_data()
        match = match_data[match_data['match_id'] == match_id].iloc[0]
        
        # Prédiction
        prediction = self.predict_match(
            match_id,
            match['home_team'],
            match['away_team']
        )
        
        # Value bets
        market_odds = {
            'home': match['odds_home'],
            'draw': match['odds_draw'],
            'away': match['odds_away']
        }
        value_bets = self.find_value_bets(match_id, market_odds)
        
        # Anomalies
        anomalies = self.detect_anomalies(match_id)
        
        # Statistiques du match
        report = {
            'match_id': match_id,
            'teams': {
                'home': match['home_team'],
                'away': match['away_team']
            },
            'start_time': match['start_time'],
            'prediction': prediction,
            'market_odds': market_odds,
            'value_bets': value_bets,
            'anomalies': anomalies,
            'total_bets': match['total_bets'],
            'total_stake': float(match['total_stake']) if pd.notna(match['total_stake']) else 0,
            'generated_at': datetime.now().isoformat()
        }
        
        # Cache le rapport dans Redis
        cache_key = f"match_report:{match_id}"
        self.redis_client.setex(
            cache_key, 
            300,  # 5 minutes TTL
            json.dumps(report, default=str)
        )
        
        return report
    
    def get_user_analytics(self, user_id):
        """Analyse complète du comportement d'un utilisateur"""
        query = f"""
            SELECT 
                b.*,
                m.home_team,
                m.away_team,
                m.start_time,
                m.status as match_status
            FROM bets b
            JOIN matches m ON b.match_id = m.id
            WHERE b.user_id = '{user_id}'
                AND b.placed_at >= NOW() - INTERVAL '90 days'
            ORDER BY b.placed_at DESC
        """
        
        bets_df = pd.read_sql(query, self.db_engine)
        
        if len(bets_df) == 0:
            return {'error': 'No bets found for this user'}
        
        # Calculer les statistiques
        total_bets = len(bets_df)
        total_stake = bets_df['stake'].sum()
        total_won = bets_df[bets_df['status'] == 'won']['actual_win'].sum()
        total_lost = bets_df[bets_df['status'] == 'lost']['stake'].sum()
        
        # Taux de victoire
        wins = len(bets_df[bets_df['status'] == 'won'])
        win_rate = wins / total_bets if total_bets > 0 else 0
        
        # ROI
        roi = ((total_won - total_stake) / total_stake) * 100 if total_stake > 0 else 0
        
        # Analyse par marché
        market_analysis = bets_df.groupby('market_type').agg({
            'stake': 'sum',
            'status': lambda x: (x == 'won').sum() / len(x)
        }).to_dict()
        
        # Analyse temporelle
        bets_df['hour'] = pd.to_datetime(bets_df['placed_at']).dt.hour
        time_analysis = bets_df.groupby('hour').size().to_dict()
        
        # Score de risque
        risk_score = self.calculate_risk_score(user_id)
        
        return {
            'user_id': user_id,
            'total_bets': total_bets,
            'total_stake': float(total_stake),
            'total_won': float(total_won),
            'total_lost': float(total_lost),
            'win_rate': win_rate,
            'roi': roi,
            'market_analysis': market_analysis,
            'time_analysis': time_analysis,
            'risk_score': risk_score,
            'generated_at': datetime.now().isoformat()
        }
    
    def save_model(self, model_path):
        """Sauvegarde les modèles entraînés"""
        models = {
            'poisson': self.poisson_model,
            'elo': self.elo_model,
            'logistic': self.logistic_model
        }
        
        with open(model_path, 'wb') as f:
            pickle.dump(models, f)
        
        logger.info(f"Models saved to {model_path}")
    
    def load_model(self, model_path):
        """Charge les modèles sauvegardés"""
        with open(model_path, 'rb') as f:
            models = pickle.load(f)
        
        self.poisson_model = models['poisson']
        self.elo_model = models['elo']
        self.logistic_model = models['logistic']
        
        logger.info(f"Models loaded from {model_path}")