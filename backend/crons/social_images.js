/**
 * Cron: Génération des images pour les réseaux sociaux
 * Exécuté toutes les 4 heures
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

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function generateSocialImages() {
  const day = getDayOfWeek();
  const templates = DAILY_TEMPLATES[day].social_prompts;
  
  const generated = [];
  
  for (let i = 0; i < templates.length; i++) {
    let prompt = templates[i];
    
    // Ajouter style africain
    prompt += ', African style, vibrant colors, professional social media design';
    
    const encoded = encodeURIComponent(prompt);
    const imageUrl = `${POLLINATIONS_URL}/${encoded}?width=1080&height=1080&seed=${Date.now() + i}`;
    
    // Sauvegarder en base
    await pool.query(`
      INSERT INTO daily_generations (match_id, image_url, prompt, category)
      VALUES (NULL, $1, $2, 'social')
    `, [imageUrl, prompt]);
    
    generated.push(imageUrl);
    console.log(`✅ Image sociale ${i+1} générée`);
    
    await new Promise(r => setTimeout(r, 1000));
  }
  
  return generated;
}

async function run() {
  console.log('📱 Génération des images pour réseaux sociaux...');
  
  const images = await generateSocialImages();
  console.log(`✅ ${images.length} images sociales générées!`);
  
  await pool.end();
}

run().catch(console.error);

