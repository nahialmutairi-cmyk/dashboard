import { Handler } from '@netlify/functions';
import { ensureDatabaseSetup } from '../../src/dbService';

export const handler: Handler = async (event, context) => {
  console.log('Netlify Function Triggered: deleteClient');
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'DELETE, POST, GET, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const pool = await ensureDatabaseSetup();
    
    // Support getting id from query parameters or POST body
    let id = event.queryStringParameters?.id || event.queryStringParameters?.clientId;
    
    if (!id && event.body) {
      try {
        const bodyParsed = JSON.parse(event.body);
        id = bodyParsed.id || bodyParsed.clientId;
      } catch (e) {
        // Safe to ignore if not JSON
      }
    }

    if (!id && event.path) {
      const parts = event.path.split('/');
      const lastSegment = parts[parts.length - 1];
      if (lastSegment && lastSegment !== 'deleteClient') {
        id = lastSegment;
      }
    }

    if (!id) {
      console.warn('[NETLIFY WARNING] Missing id parameter in delete request');
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing client id parameter' })
      };
    }

    console.log(`[NETLIFY INFO] Deleting client with id: ${id}`);
    await pool.query('DELETE FROM clients WHERE id = $1', [id]);
    
    console.log(`[NETLIFY SUCCESS] Client with id: ${id} successfully deleted.`);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: true })
    };
    
  } catch (err: any) {
    console.error('[NETLIFY ERROR] deleteClient function failed:', err);
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
