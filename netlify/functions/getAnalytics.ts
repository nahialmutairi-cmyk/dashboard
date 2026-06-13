import { Handler } from '@netlify/functions';
import { ensureDatabaseSetup } from '../../src/dbService';

export const handler: Handler = async (event, context) => {
  console.log('Netlify Function Triggered: getAnalytics');
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const params = event.queryStringParameters || {};
    const client_id = params.clientId || params.client_id;
    if (!client_id) {
      return {
        statusCode: 400,
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Missing clientId query parameter.' })
      };
    }

    const pool = await ensureDatabaseSetup();

    // 1. Total Visits in visitor_analytics
    const totalVisitsRes = await pool.query(
      `SELECT COUNT(*) as count FROM visitor_analytics WHERE client_id = $1 AND event_type = 'visit'`,
      [client_id]
    );
    const dbVisits = parseInt(totalVisitsRes.rows[0].count, 10);

    // 2. Total clicks
    const totalClicksRes = await pool.query(
      `SELECT COUNT(*) as count FROM visitor_analytics WHERE client_id = $1 AND event_type = 'click'`,
      [client_id]
    );
    const dbClicks = parseInt(totalClicksRes.rows[0].count, 10);

    // 3. Visits by Country
    const countryRes = await pool.query(
      `SELECT country, COUNT(*) as count FROM visitor_analytics WHERE client_id = $1 AND event_type = 'visit' GROUP BY country ORDER BY count DESC LIMIT 8`,
      [client_id]
    );

    // 4. Visits by Device
    const deviceRes = await pool.query(
      `SELECT device_type, COUNT(*) as count FROM visitor_analytics WHERE client_id = $1 AND event_type = 'visit' GROUP BY device_type ORDER BY count DESC`,
      [client_id]
    );

    // 5. Top Referrers
    const referrerRes = await pool.query(
      `SELECT referrer, COUNT(*) as count FROM visitor_analytics WHERE client_id = $1 AND event_type = 'visit' GROUP BY referrer ORDER BY count DESC LIMIT 8`,
      [client_id]
    );

    // 6. Last 7 days visits
    const last7DaysRes = await pool.query(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM-DD') as visit_date, 
        COUNT(*) as count 
      FROM visitor_analytics 
      WHERE client_id = $1 AND event_type = 'visit' AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
      ORDER BY visit_date ASC
    `, [client_id]);

    // 7. Clicked buttons list
    const buttonsRes = await pool.query(
      `SELECT clicked_button, COUNT(*) as count FROM visitor_analytics WHERE client_id = $1 AND event_type = 'click' GROUP BY clicked_button ORDER BY count DESC`,
      [client_id]
    );

    // Pad with gorgeous simulated defaults for the preseed demo profiles
    let padVisits = 0;
    let padClicks = 0;
    let defaultCountries: { country: string; count: number }[] = [];
    let defaultDevices: { device_type: string; count: number }[] = [];
    let defaultReferrers: { referrer: string; count: number }[] = [];
    let defaultDaily: { visit_date: string; count: number }[] = [];
    let defaultButtons: { clicked_button: string; count: number }[] = [];

    if (client_id === 'digital-creator') {
      padVisits = 12160;
      padClicks = 3168;
      defaultCountries = [
        { country: 'United Kingdom', count: 5240 },
        { country: 'United States', count: 3210 },
        { country: 'Germany', count: 1840 },
        { country: 'France', count: 1200 },
        { country: 'Canada', count: 670 }
      ];
      defaultDevices = [
        { device_type: 'mobile', count: 8510 },
        { device_type: 'desktop', count: 2450 },
        { device_type: 'tablet', count: 1200 }
      ];
      defaultReferrers = [
        { referrer: 'instagram', count: 6420 },
        { referrer: 'direct', count: 2100 },
        { referrer: 'whatsapp', count: 1840 },
        { referrer: 'google', count: 1100 },
        { referrer: 'other', count: 700 }
      ];
      defaultButtons = [
        { clicked_button: 'View My Portfolio', count: 1980 },
        { clicked_button: 'Instagram', count: 640 },
        { clicked_button: 'WhatsApp Chat', count: 328 },
        { clicked_button: 'Email Me', count: 112 }
      ];
    } else if (client_id === 'real-estate') {
      padVisits = 45342;
      padClicks = 1089;
      defaultCountries = [
        { country: 'Kuwait', count: 22100 },
        { country: 'Saudi Arabia', count: 12400 },
        { country: 'United Arab Emirates', count: 6200 },
        { country: 'United Kingdom', count: 3100 },
        { country: 'Qatar', count: 1542 }
      ];
      defaultDevices = [
        { device_type: 'mobile', count: 38200 },
        { device_type: 'tablet', count: 4200 },
        { device_type: 'desktop', count: 2942 }
      ];
      defaultReferrers = [
        { referrer: 'whatsapp', count: 24100 },
        { referrer: 'instagram', count: 12400 },
        { referrer: 'direct', count: 5100 },
        { referrer: 'google', count: 2100 },
        { referrer: 'other', count: 1642 }
      ];
      defaultButtons = [
        { clicked_button: 'Browse Autumn Catalog', count: 720 },
        { clicked_button: 'WhatsApp Chat', count: 242 },
        { clicked_button: 'Phone', count: 127 }
      ];
    } else if (client_id === 'tech-startup') {
      padVisits = 2376;
      padClicks = 834;
      defaultCountries = [
        { country: 'United States', count: 1200 },
        { country: 'Germany', count: 430 },
        { country: 'India', count: 340 },
        { country: 'United Kingdom', count: 256 },
        { country: 'Singapore', count: 150 }
      ];
      defaultDevices = [
        { device_type: 'desktop', count: 1890 },
        { device_type: 'mobile', count: 350 },
        { device_type: 'tablet', count: 136 }
      ];
      defaultReferrers = [
        { referrer: 'direct', count: 1100 },
        { referrer: 'google', count: 640 },
        { referrer: 'twitter', count: 320 },
        { referrer: 'whatsapp', count: 190 },
        { referrer: 'other', count: 126 }
      ];
      defaultButtons = [
        { clicked_button: 'Schedule Sandbox Demo', count: 480 },
        { clicked_button: 'Email Me', count: 190 },
        { clicked_button: 'Website', count: 164 }
      ];
    }

    // Generate last 7 days dates dynamically
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      let baseCount = 0;
      if (client_id === 'digital-creator') {
        const seedDay = [240, 290, 310, 270, 340, 420, 390];
        baseCount = seedDay[6 - i] || 300;
      } else if (client_id === 'real-estate') {
        const seedDay = [740, 810, 890, 940, 820, 1100, 1050];
        baseCount = seedDay[6 - i] || 900;
      } else if (client_id === 'tech-startup') {
        const seedDay = [42, 59, 61, 55, 76, 88, 81];
        baseCount = seedDay[6 - i] || 60;
      }
      defaultDaily.push({ visit_date: dateStr, count: baseCount });
    }

    // Merge databases with Defaults
    const totalVisits = dbVisits + padVisits;
    const totalClicks = dbClicks + padClicks;

    // Merge country rows
    const mergedCountries = [...countryRes.rows.map(r => ({ country: r.country, count: parseInt(r.count, 10) }))];
    defaultCountries.forEach(dc => {
      const existing = mergedCountries.find(m => m.country.toLowerCase() === dc.country.toLowerCase());
      if (existing) {
        existing.count += dc.count;
      } else {
        mergedCountries.push(dc);
      }
    });
    mergedCountries.sort((a, b) => b.count - a.count);

    // Merge device rows
    const mergedDevices = [...deviceRes.rows.map(r => ({ device_type: r.device_type, count: parseInt(r.count, 10) }))];
    defaultDevices.forEach(dd => {
      const existing = mergedDevices.find(m => m.device_type.toLowerCase() === dd.device_type.toLowerCase());
      if (existing) {
        existing.count += dd.count;
      } else {
        mergedDevices.push(dd);
      }
    });
    mergedDevices.sort((a, b) => b.count - a.count);

    // Merge referrer rows
    const mergedReferrers = [...referrerRes.rows.map(r => ({ referrer: r.referrer, count: parseInt(r.count, 10) }))];
    defaultReferrers.forEach(dr => {
      const existing = mergedReferrers.find(m => m.referrer.toLowerCase() === dr.referrer.toLowerCase());
      if (existing) {
        existing.count += dr.count;
      } else {
        mergedReferrers.push(dr);
      }
    });
    mergedReferrers.sort((a, b) => b.count - a.count);

    // Merge buttons
    const mergedButtons = [...buttonsRes.rows.map(r => ({ clicked_button: r.clicked_button || 'Unknown', count: parseInt(r.count, 10) }))];
    defaultButtons.forEach(db => {
      const existing = mergedButtons.find(m => m.clicked_button.toLowerCase() === db.clicked_button.toLowerCase());
      if (existing) {
        existing.count += db.count;
      } else {
        mergedButtons.push(db);
      }
    });
    mergedButtons.sort((a, b) => b.count - a.count);

    // Merge 7 days daily trends
    const mergedDaily = defaultDaily.map(dd => {
      const match = last7DaysRes.rows.find(r => r.visit_date === dd.visit_date);
      if (match) {
        return { visit_date: dd.visit_date, count: dd.count + parseInt(match.count, 10) };
      }
      return dd;
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        client_id,
        total_visits: totalVisits,
        total_clicks: totalClicks,
        visits_by_country: mergedCountries.slice(0, 8),
        visits_by_device: mergedDevices,
        top_referrers: mergedReferrers.slice(0, 8),
        button_clicks: mergedButtons,
        last_7_days: mergedDaily
      })
    };

  } catch (err: any) {
    console.error('[NETLIFY ERROR] getAnalytics failed:', err);
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
