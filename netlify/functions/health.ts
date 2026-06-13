import { Handler } from '@netlify/functions';
import { ensureDatabaseSetup } from '../../src/dbService';

export const handler: Handler = async (event, context) => {
  console.log('Netlify Function Triggered: health check');
  try {
    const pool = await ensureDatabaseSetup();
    await pool.query('SELECT 1');
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ database: "connected" })
    };
  } catch (err: any) {
    console.error('[NETLIFY ERROR] health check database query failed:', err);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: err.message || 'Database connection error' })
    };
  }
};
