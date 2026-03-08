Exemples de Prompts Générés
Match du matin (Lundi 8h) :
text
Monday morning football freshness: Sporting Bissau vs Benfica Bissau, new week energy, morning sunlight streaming into stadium, players warming up with focus, professional sports photography, f/2.8, canon r5, National geographic style, African football atmosphere
Match en soirée (Samedi 20h) :
text
Saturday night lights: Horoya vs Djoliba, full stadium explosion, floodlights creating dramatic shadows, confetti and smoke, fans with traditional drums, vibrant African celebration, sports illustrated cover style, 8k resolution, cinematic composition
Promotion spéciale (Vendredi) :
text
Friday feeling: Golden welcome bonus 100%, African football fans celebrating, treasure chest overflowing with coins and footballs, 3d render, luxurious atmosphere, vibrant colors, trending on behance
Réseaux sociaux (Mercredi) :
text
Hump day celebration: ASEC Mimosas fans dancing after victory, joyful African supporters, colorful traditional attire, Instagram story style, vertical format, bright and shareable content
📈 Planning de Génération Hebdomadaire
Jour	Matchs	Promos	Social	Total Images
Lundi	10 × 3 = 30	5	3	38
Mardi	8 × 3 = 24	5	3	32
Mercredi	12 × 3 = 36	5	3	44
Jeudi	10 × 3 = 30	5	3	38
Vendredi	15 × 3 = 45	10	5	60
Samedi	20 × 3 = 60	10	5	75
Dimanche	15 × 3 = 45	5	3	53
Semaine	270	45	25	340
/**
 * Cron: Génération des images pour les matchs du soir
 * Exécuté à 18h00 chaque jour
 */

const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const POLLINATIONS_URL = 'https://pollinations.ai/p';

const DAILY_TEMPLATES = require('../../prompts/daily_templates.json');
const AFRICA_SPECIFIC = require('../../prompts/africa_specific.json');

function getDayOfWeek() {
  const jours = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return jours[new Date().getDay()];
}

function getSeason() {
  const month = new Date().getMonth() + 1;
  return [11, 12, 1, 2, 3, 4].includes(month) ? 'dry' : 'rainy';
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function fetchEveningMatches() {
  const result = await pool.query(`
    SELECT * FROM matches 
    WHERE DATE(start_time) = CURRENT_DATE 
    AND EXTRACT(HOUR FROM start_time) >= 18
    ORDER BY start_time
  `);
  return result.rows;
}

async function generateMatchImage(match) {
  const day = getDayOfWeek();
  const season = getSeason();
  
  // Template avec accent sur le soir (lights, atmosphere)
  let prompt = getRandomElement(DAILY_TEMPLATES[day].match_prompts);
  
  // Ajouter élément de soirée
  prompt += ', stadium floodlights, evening atmosphere, dramatic lighting';
  
  // Ajouter élément culturel
  const culturalTypes = ['dance', 'music'];
  const culturalType = getRandomElement(culturalTypes);
  if (AFRICA_SPECIFIC.cultural_elements[culturalType]) {
    prompt += ', ' + getRandomElement(AFRICA_SPECIFIC.cultural_elements[culturalType]);
  }
  
  // Remplacer variables
  prompt = prompt.replace(/{home}/g, match.home_team)
                 .replace(/{away}/g, match.away_team)
                 .replace(/{stadium}/g, match.stadium || 'Stade Africain');
  
  const encoded = encodeURIComponent(prompt);
  const imageUrl = `${POLLINATIONS_URL}/${encoded}?width=1024&height=768&seed=${match.id + 200}`;
  
  // Sauvegarder en base
  await pool.query(`
    INSERT INTO daily_generations (match_id, image_url, prompt, category, variation)
    VALUES ($1, $2, $3, 'match', 2)
    ON CONFLICT (match_id, variation, generation_date) DO NOTHING
  `, [match.id, imageUrl, prompt]);
  
  return imageUrl;
}

async function run() {
  console.log('🌙 Génération des images du soir...');
  
  const matches = await fetchEveningMatches();
  console.log(`📊 ${matches.length} matchs du soir trouvés`);
  
  for (const match of matches) {
    await generateMatchImage(match);
    console.log(`✅ Image générée: ${match.home_team} vs ${match.away_team}`);
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('✅ Terminé!');
  await pool.end();
}

run().catch(console.error);

