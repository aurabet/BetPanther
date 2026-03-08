/**
 * Cron: Génération des images pour les matchs de l'après-midi
 * Exécuté à 12h00 chaque jour
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

async function fetchAfternoonMatches() {
  const result = await pool.query(`
    SELECT * FROM matches 
    WHERE DATE(start_time) = CURRENT_DATE 
    AND EXTRACT(HOUR FROM start_time) BETWEEN 12 AND 17
    ORDER BY start_time
  `);
  return result.rows;
}

async function generateMatchImage(match) {
  const day = getDayOfWeek();
  const season = getSeason();
  
  // Template avec accent sur l'après-midi
  let prompt = getRandomElement(DAILY_TEMPLATES[day].match_prompts);
  
  // Ajouter élément culturel aléatoire
  if (Math.random() > 0.5) {
    const culturalTypes = ['dance', 'music', 'food'];
    const culturalType = getRandomElement(culturalTypes);
    if (AFRICA_SPECIFIC.cultural_elements[culturalType]) {
      prompt += ', ' + getRandomElement(AFRICA_SPECIFIC.cultural_elements[culturalType]);
    }
  }
  
  // Remplacer variables
  prompt = prompt.replace(/{home}/g, match.home_team)
                 .replace(/{away}/g, match.away_team)
                 .replace(/{stadium}/g, match.stadium || 'Stade Africain');
  
  const encoded = encodeURIComponent(prompt);
  const imageUrl = `${POLLINATIONS_URL}/${encoded}?width=1024&height=768&seed=${match.id + 100}`;
  
  // Sauvegarder en base
  await pool.query(`
    INSERT INTO daily_generations (match_id, image_url, prompt, category, variation)
    VALUES ($1, $2, $3, 'match', 1)
    ON CONFLICT (match_id, variation, generation_date) DO NOTHING
  `, [match.id, imageUrl, prompt]);
  
  return imageUrl;
}

async function run() {
  console.log('☀️ Génération des images de l\'après-midi...');
  
  const matches = await fetchAfternoonMatches();
  console.log(`📊 ${matches.length} matchs de l'après-midi trouvés`);
  
  for (const match of matches) {
    await generateMatchImage(match);
    console.log(`✅ Image générée: ${match.home_team} vs ${match.away_team}`);
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('✅ Terminé!');
  await pool.end();
}

run().catch(console.error);

