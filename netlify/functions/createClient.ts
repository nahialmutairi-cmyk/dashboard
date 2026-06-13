import { Handler } from '@netlify/functions';
import { ensureDatabaseSetup } from '../../src/dbService';

export const handler: Handler = async (event, context) => {
  console.log('Netlify Function Triggered: createClient');
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
      throw new Error('Request body is empty');
    }

    const clientData = JSON.parse(event.body);
    if (!clientData.id || !clientData.name) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing client id or name parameters' })
      };
    }

    const slug = (clientData.slug || clientData.id).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!slug || slug === '-') {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Username/slug is required and cannot be empty or only "-".' })
      };
    }

    // Check slug uniqueness across existing client base
    const existingClientWithSlug = await pool.query('SELECT id FROM clients WHERE slug = $1', [slug]);
    if (existingClientWithSlug.rows.length > 0 && existingClientWithSlug.rows[0].id !== clientData.id) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'This username is already used.' })
      };
    }
    const pValues: Record<string, string> = {};
    if (clientData.platforms) {
      clientData.platforms.forEach((p: any) => {
        pValues[p.id] = p.enabled ? p.value : '';
      });
    }

    const isActive = clientData.status === 'active';

    console.log(`[NETLIFY INFO] Creating new campaign profile for client "${clientData.name}" with slug: ${slug}`);

    // Insert or update safely (with ON CONFLICT)
    await pool.query(`
      INSERT INTO clients (
        id, name, slug, category, bio, profile_image_url, banner_image_url,
        phone, whatsapp, email, website, google_maps, instagram, twitter,
        tiktok, snapchat, youtube, linkedin, facebook, telegram, is_active, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21, NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        category = EXCLUDED.category,
        bio = EXCLUDED.bio,
        profile_image_url = EXCLUDED.profile_image_url,
        banner_image_url = EXCLUDED.banner_image_url,
        phone = EXCLUDED.phone,
        whatsapp = EXCLUDED.whatsapp,
        email = EXCLUDED.email,
        website = EXCLUDED.website,
        google_maps = EXCLUDED.google_maps,
        instagram = EXCLUDED.instagram,
        twitter = EXCLUDED.twitter,
        tiktok = EXCLUDED.tiktok,
        snapchat = EXCLUDED.snapchat,
        youtube = EXCLUDED.youtube,
        linkedin = EXCLUDED.linkedin,
        facebook = EXCLUDED.facebook,
        telegram = EXCLUDED.telegram,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()
    `, [
      clientData.id,
      clientData.name,
      slug,
      clientData.category || '',
      clientData.bio || '',
      clientData.avatar || '',
      clientData.banner || '',
      pValues['phone'] || '',
      pValues['whatsapp'] || '',
      pValues['email'] || '',
      pValues['website'] || '',
      pValues['maps'] || '',
      pValues['instagram'] || '',
      pValues['twitter'] || '',
      pValues['tiktok'] || '',
      pValues['snapchat'] || '',
      pValues['youtube'] || '',
      pValues['linkedin'] || '',
      pValues['facebook'] || '',
      pValues['telegram'] || '',
      isActive
    ]);

    // Handle Custom Links
    await pool.query('DELETE FROM client_links WHERE client_id = $1', [clientData.id]);

    if (clientData.customLinks && clientData.customLinks.length > 0) {
      for (let i = 0; i < clientData.customLinks.length; i++) {
        const cl = clientData.customLinks[i];
        const linkId = cl.id || `${clientData.id}-custom-${i}-${Date.now()}`;
        await pool.query(`
          INSERT INTO client_links (id, client_id, title, url, icon, is_active, sort_order)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          linkId,
          clientData.id,
          cl.title,
          cl.url,
          'link',
          true,
          i
        ]);
      }
    }

    console.log(`[NETLIFY SUCCESS] Client profile slug: ${slug} was successfully registered.`);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: true, slug })
    };

  } catch (err: any) {
    console.error('[NETLIFY ERROR] createClient function failed:', err);
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
