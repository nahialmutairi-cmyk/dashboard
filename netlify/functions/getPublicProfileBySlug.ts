import { Handler } from '@netlify/functions';
import { ensureDatabaseSetup, mapPlatforms } from '../../src/dbService';

export const handler: Handler = async (event, context) => {
  console.log('Netlify Function Triggered: getPublicProfileBySlug');
  try {
    const pool = await ensureDatabaseSetup();
    
    // Support retrieving the slug parameter from query params or path segment
    let slug = event.queryStringParameters?.slug;
    
    if (!slug && event.path) {
      // If requested as /api/getPublicProfileBySlug/slug-name
      const parts = event.path.split('/');
      const lastSegment = parts[parts.length - 1];
      if (lastSegment && lastSegment !== 'getPublicProfileBySlug') {
        slug = lastSegment;
      }
    }

    if (!slug) {
      console.warn('[NETLIFY WARNING] Missing slug param value in request');
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing slug parameter' })
      };
    }

    console.log(`Searching database profile for slug: ${slug}`);
    const clientRes = await pool.query('SELECT * FROM clients WHERE slug = $1', [slug]);
    if (clientRes.rows.length === 0) {
      console.warn(`[NETLIFY WARNING] Campaign profile for slug "${slug}" not found in system.`);
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Client profile campaign not found' })
      };
    }

    const client = clientRes.rows[0];
    const linksRes = await pool.query('SELECT * FROM client_links WHERE client_id = $1 AND is_active = TRUE ORDER BY sort_order ASC, created_at ASC', [client.id]);

    const visitsRes = await pool.query('SELECT COUNT(*) FROM analytics WHERE client_id = $1 AND action = \'visit\'', [client.id]);
    const clicksRes = await pool.query('SELECT COUNT(*) FROM analytics WHERE client_id = $1 AND action = \'click\'', [client.id]);

    const visits = parseInt(visitsRes.rows[0].count, 10) + (client.id === 'digital-creator' ? 12400-240 : client.id === 'real-estate' ? 45800-458 : client.id === 'tech-startup' ? 2400-24 : 0);
    const clicks = parseInt(clicksRes.rows[0].count, 10) + (client.id === 'digital-creator' ? 3200-32 : client.id === 'real-estate' ? 1100-11 : client.id === 'tech-startup' ? 842-8 : 0);

    const customLinks = linksRes.rows.map(l => ({ id: l.id, title: l.title, url: l.url }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        id: client.id,
        slug: client.slug || '',
        name: client.name,
        category: client.category || '',
        bio: client.bio || '',
        avatar: client.profile_image_url || '',
        banner: client.banner_image_url || '',
        visits,
        clicks,
        status: client.is_active ? 'active' : 'inactive',
        platforms: mapPlatforms(client),
        customLinks,
        isPublicIndexed: true
      })
    };
  } catch (err: any) {
    console.error('[NETLIFY ERROR] getPublicProfileBySlug failure:', err);
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
