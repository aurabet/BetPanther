#!/usr/bin/env python3
"""
Générateur automatique quotidien d'images pour bookmaker
Utilise Pollinations.ai (gratuit)
"""

import json
import requests
import psycopg2
import os
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List
import random

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DailyImageGenerator:
    def __init__(self):
        self.pollinations_url = "https://pollinations.ai/p"
        self.db_url = os.getenv('DATABASE_URL')
        self.conn = None
        self.templates = self.load_templates()
        
    def load_templates(self):
        """Charge tous les templates de prompts"""
        templates = {}
        
        # Templates par jour
        with open('prompts/daily_templates.json', 'r') as f:
            templates['daily'] = json.load(f)
            
        # Templates Afrique
        with open('prompts/africa_specific.json', 'r') as f:
            templates['africa'] = json.load(f)
            
        return templates
    
    def get_day_of_week(self):
        """Retourne le jour de la semaine en anglais"""
        jours = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        return jours[datetime.now().weekday()]
    
    def get_season(self):
        """Détermine la saison actuelle en Afrique de l'Ouest"""
        month = datetime.now().month
        if month in [11, 12, 1, 2, 3, 4]:
            return 'dry'  # Saison sèche
        else:
            return 'rainy'  # Saison des pluies
    
    def get_special_event(self):
        """Vérifie s'il y a un événement spécial aujourd'hui"""
        today = datetime.now().strftime('%m-%d')
        
        events = {
            '01-01': 'new_year',
            '05-01': 'labour_day',
            '08-15': 'independence_guinea',
            '09-24': 'independence_guinea_bissau',
            '12-25': 'christmas'
        }
        
        return events.get(today, None)
    
    def fetch_todays_matches(self):
        """Récupère les matchs du jour depuis la base"""
        if not self.conn:
            self.conn = psycopg2.connect(self.db_url)
            
        with self.conn.cursor() as cur:
            cur.execute("""
                SELECT * FROM matches 
                WHERE DATE(start_time) = CURRENT_DATE
                ORDER BY start_time
            """)
            return cur.fetchall()
    
    def generate_match_prompt(self, match):
        """Génère un prompt pour un match spécifique"""
        day = self.get_day_of_week()
        season = self.get_season()
        event = self.get_special_event()
        
        # Template de base selon le jour
        daily_templates = self.templates['daily'][day]['match_prompts']
        base_template = random.choice(daily_templates)
        
        # Ajouter des éléments africains
        african_elements = []
        
        # Ajouter la saison
        if season in self.templates['africa']['weather_seasons']:
            african_elements.append(
                random.choice(self.templates['africa']['weather_seasons'][season])
            )
        
        # Ajouter des éléments culturels aléatoires
        if random.random() > 0.5:
            category = random.choice(['dance', 'music', 'food'])
            african_elements.append(
                random.choice(self.templates['africa']['cultural_elements'][category])
            )
        
        # Événement spécial ?
        if event:
            special = self.get_special_prompt(event, match)
            if special:
                african_elements.append(special)
        
        # Construire le prompt final
        prompt = base_template + " " + " ".join(african_elements)
        
        # Remplacer les variables
        prompt = prompt.replace('{home}', match[3])  # home_team
        prompt = prompt.replace('{away}', match[4])  # away_team
        prompt = prompt.replace('{league}', match[2] or 'Championnat Africain')
        prompt = prompt.replace('{stadium}', self.get_stadium(match))
        prompt = prompt.replace('{country}', self.get_country(match))
        
        return prompt
    
    def generate_image_url(self, prompt, width=1024, height=768, seed=None):
        """Génère l'URL Pollinations pour une image"""
        encoded = requests.utils.quote(prompt)
        url = f"{self.pollinations_url}/{encoded}?width={width}&height={height}"
        
        if seed:
            url += f"&seed={seed}"
            
        return url
    
    def process_daily_matches(self):
        """Traite tous les matchs du jour"""
        matches = self.fetch_todays_matches()
        logger.info(f"Traitement de {len(matches)} matchs pour aujourd'hui")
        
        generated = []
        
        for match in matches:
            try:
                # Générer 3 prompts différents par match
                prompts = []
                for i in range(3):
                    prompt = self.generate_match_prompt(match)
                    prompts.append(prompt)
                
                # Générer les URLs d'images
                for i, prompt in enumerate(prompts):
                    image_url = self.generate_image_url(
                        prompt, 
                        seed=match[0] + i,  # ID match + variation
                        width=1024,
                        height=768
                    )
                    
                    # Sauvegarder en base
                    self.save_match_image(
                        match_id=match[0],
                        image_url=image_url,
                        prompt=prompt,
                        variation=i
                    )
                    
                    generated.append({
                        'match_id': match[0],
                        'prompt': prompt,
                        'url': image_url
                    })
                    
                    logger.info(f"✓ Image {i+1} générée pour {match[3]} vs {match[4]}")
                    time.sleep(1)  # Pause pour éviter rate limits
                    
            except Exception as e:
                logger.error(f"Erreur pour match {match[0]}: {e}")
        
        return generated
    
    def save_match_image(self, match_id, image_url, prompt, variation):
        """Sauvegarde l'image en base"""
        with self.conn.cursor() as cur:
            cur.execute("""
                INSERT INTO match_images 
                (match_id, image_url, prompt, variation, created_at)
                VALUES (%s, %s, %s, %s, %s)
            """, (match_id, image_url, prompt, variation, datetime.now()))
        self.conn.commit()
    
    def generate_daily_promotions(self):
        """Génère les images promotionnelles du jour"""
        day = self.get_day_of_week()
        
        # Templates sociaux du jour
        social_templates = self.templates['daily'][day]['social_prompts']
        
        promotions = []
        
        for i, template in enumerate(social_templates):
            # Ajouter des éléments africains
            if random.random() > 0.3:
                template += " African style, vibrant colors"
            
            # Générer l'image
            image_url = self.generate_image_url(template, width=1080, height=1080)
            
            promotions.append({
                'type': 'social',
                'prompt': template,
                'url': image_url
            })
            
            logger.info(f"✓ Image promotion {i+1} générée")
            time.sleep(1)
        
        return promotions
    
    def run_daily(self):
        """Exécute la génération quotidienne complète"""
        logger.info("🚀 Démarrage génération quotidienne")
        
        try:
            # 1. Matchs du jour
            matches = self.process_daily_matches()
            logger.info(f"✅ {len(matches)} images matchs générées")
            
            # 2. Promotions du jour
            promotions = self.generate_daily_promotions()
            logger.info(f"✅ {len(promotions)} images promotion générées")
            
            # 3. Sauvegarder le rapport
            report = {
                'date': datetime.now().isoformat(),
                'matches': len(matches),
                'promotions': len(promotions),
                'generated_at': datetime.now().isoformat()
            }
            
            with open(f"reports/daily_{datetime.now().strftime('%Y%m%d')}.json", 'w') as f:
                json.dump(report, f, indent=2)
            
            logger.info("✅ Génération quotidienne terminée avec succès")
            
        except Exception as e:
            logger.error(f"❌ Erreur génération quotidienne: {e}")
        finally:
            if self.conn:
                self.conn.close()

if __name__ == "__main__":
    generator = DailyImageGenerator()
    generator.run_daily()

