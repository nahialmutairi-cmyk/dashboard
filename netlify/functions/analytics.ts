import { Handler } from '@netlify/functions';
import { ensureDatabaseSetup } from '../../src/dbService';

export const handler: Handler = async (event, context) => {
  console.log('Netlify Function Triggered: analytics');
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const pool = await ensureDatabaseSetup();
    if (!event.body) {
      throw new Error('Analytics payload is empty');
    }

    const { client_id, link_type, link_id, action } = JSON.parse(event.body);
    if (!client_id || !action) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing client_id or action parameters' })
      };
    }

    const generatedId = `an-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    console.log(`[NETLIFY INFO] Tracking analytics interaction "${action}" for client: ${client_id}`);

    await pool.query(`
      INSERT INTO analytics (id, client_id, link_type, link_id, action)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      generatedId,
      client_id,
      link_type || null,
      link_id || null,
      action
    ]);

    console.log(`[NETLIFY SUCCESS] Analytics logged for client ${client_id}: ${action}`);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: true })
    };

  } catch (err: any) {
    console.error('[NETLIFY ERROR] analytics tracking failed:', err);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: err.message, stack: err.stack })
    };
  }
};
