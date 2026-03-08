/**
 * Cron: Nettoyage des anciennes images
 * Exécuté à 1h00 chaque jour
 * Garde les images des 7 derniers jours
 */

const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function cleanupOldImages() {
  // Supprimer les images de plus de 7 jours
  const result = await pool.query(`
    DELETE FROM daily_generations 
    WHERE generation_date < CURRENT_DATE - INTERVAL '7 days'
    RETURNING id
  `);
  
  console.log(`🗑️ ${result.rowCount} anciennes images supprimées`);
  
  // Optimiser les images peu utilisées (>30 jours)
  const optimized = await pool.query(`
    DELETE FROM daily_generations 
    WHERE generation_date < CURRENT_DATE - INTERVAL '30 days'
    AND used_count = 0
    RETURNING id
  `);
  
  console.log(`📉 ${optimized.rowCount} images non utilisées supprimées`);
  
  // Mettre à jour les compteurs weekly
  await pool.query(`
    UPDATE daily_generations 
    SET used_count = used_count / 2
    WHERE generation_date >= CURRENT_DATE - INTERVAL '7 days'
  `);
  
  console.log('✅ Compteurs réinitialisés pour la semaine');
  
  return { deleted: result.rowCount, optimized: optimized.rowCount };
}

async function run() {
  console.log('🧹 Démarrage du nettoyage...');
  
  const result = await cleanupOldImages();
  
  console.log(`✅ Nettoyage terminé!`);
  console.log(`   - Images supprimées: ${result.deleted}`);
  console.log(`   - Images optimisées: ${result.optimized}`);
  
  await pool.end();
}

run().catch(console.error);

