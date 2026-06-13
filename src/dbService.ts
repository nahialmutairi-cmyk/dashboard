import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;
let pool: pg.Pool | null = null;

if (connectionString) {
  try {
    pool = new pg.Pool({
      connectionString,
      ssl: connectionString.includes('localhost') === false ? { rejectUnauthorized: false } : false
    });
    console.log('PostgreSQL Pool initialized successfully.');
  } catch (err: any) {
    console.error('Failed to initialize PG pool:', err.message);
  }
}

let initDbPromise: Promise<void> | null = null;

export async function ensureDatabaseSetup(): Promise<pg.Pool> {
  if (!pool) {
    throw new Error('DATABASE_URL is not configured or PostgreSQL Pool could not be initialized.');
  }

  if (!initDbPromise) {
    initDbPromise = (async () => {
      console.log('Verifying databases/tables existence and creating if missing...');
      const client = await pool!.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS clients (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE NOT NULL,
            category VARCHAR(255),
            bio TEXT,
            profile_image_url TEXT,
            banner_image_url TEXT,
            phone VARCHAR(255),
            whatsapp VARCHAR(255),
            email VARCHAR(255),
            website VARCHAR(255),
            google_maps TEXT,
            instagram VARCHAR(255),
            twitter VARCHAR(255),
            tiktok VARCHAR(255),
            snapchat VARCHAR(255),
            youtube VARCHAR(255),
            linkedin VARCHAR(255),
            facebook VARCHAR(255),
            telegram VARCHAR(255),
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS client_links (
            id VARCHAR(255) PRIMARY KEY,
            client_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            url TEXT NOT NULL,
            icon VARCHAR(255),
            is_active BOOLEAN DEFAULT TRUE,
            sort_order INT DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS analytics (
            id VARCHAR(255) PRIMARY KEY,
            client_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE,
            link_type VARCHAR(255),
            link_id VARCHAR(255),
            action VARCHAR(255) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS visitor_analytics (
            id VARCHAR(255) PRIMARY KEY,
            client_id VARCHAR(255) REFERENCES clients(id) ON DELETE CASCADE,
            event_type VARCHAR(255) NOT NULL,
            country VARCHAR(255),
            city VARCHAR(255),
            device_type VARCHAR(255),
            browser VARCHAR(255),
            os VARCHAR(255),
            referrer VARCHAR(255),
            anonymized_ip VARCHAR(255),
            clicked_button VARCHAR(255),
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);
        console.log('Database tables successfully verified/created.');

        // Run migrations for separate phone number fields
        await client.query(`
          ALTER TABLE clients ADD COLUMN IF NOT EXISTS country_code VARCHAR(10) DEFAULT '+965';
          ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone_number VARCHAR(30);
        `);

        // Migrate existing phone strings into digits-only phone_number
        await client.query(`
          UPDATE clients 
          SET phone_number = REGEXP_REPLACE(phone, '[^0-9]', '', 'g'),
              country_code = '+965'
          WHERE (phone_number IS NULL OR phone_number = '') 
            AND phone IS NOT NULL 
            AND phone <> '';
        `);
        
        // Let's seed demo profiles if empty
        const countRes = await client.query('SELECT COUNT(*) FROM clients');
        const dbClientCount = parseInt(countRes.rows[0].count, 10);
        if (dbClientCount === 0) {
          console.log('Database empty inside helper. Pre-seeding initial campaign profiles...');
          await client.query(`
            INSERT INTO clients (id, slug, name, category, bio, profile_image_url, banner_image_url, is_active)
            VALUES (
              'digital-creator', 'digital-creator', 'Sarah Jenkins', 'Creative Director & Content Strategist',
              'Creative Director & Content Strategist based in London. Helping brands reach 500k+ tech enthusiasts daily.',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuCIbOnk56LrPDV-NKv8XDwTyRjJfnAkqy5pi89eQyx_J6Pb_2uH433axYLNLKJsoPHr_0NVYRhnYo6Bb__UzHcDV9wJ2SUf_CIk7rjJvqKDAciiLyEIsuPJ5ZK5qJkYQYa9Dqfqh6HJZEurkxph9EegmcwLdwR7RZ2nIoQAnHFktfRkMTpOL-x9Zgz7fT1W8JSD0SBWr2Nnr63sfF9mVG_LBK6D5IplINp6YQLNYVvSgW_sQ85RfGTouA',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuC9RoVBXm6p0HFwdSKeKnoIgHWSaRBVLnpIh_9xy1hm316pGeoHmeFRRH5SRVDoO8w9iHf8gv5pXlavJOyOm1iJzfA8IHWYNMIiTN_35GqlG3TIN0Nynsagpu7pZ-jOOYxO9DFTFL6NyeErUizKaPqlgDhWjNux3aU5503JAkrGRP24awBC7xBt8wagm37ShISxEK_iAz7K7kiNzG3XprsXgUtd7-EN1AYD6TcoILhQXzJ5ZQ97c_90HQ',
              true
            ) ON CONFLICT DO NOTHING;

            INSERT INTO clients (id, slug, name, category, bio, profile_image_url, banner_image_url, is_active)
            VALUES (
              'real-estate', 'real-estate', 'Real Estate Pro', 'Luxury Property Showcase',
              'Bespoke real estate consultancy specializing in architectural masterpieces and luxury estates in Belgravia and Mayfair.',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuAXGp70BwjH6_lgkMxZ22ERRodnm_8d_RiKbdcVqyc3leRzAcTx61bG4tER24-t4hCdLEUiAkLf87zk2il31Wfa9uknQZXThlv5YzInkT_atcUjLGVs1NLqmSJA-UxqKXti0qXIlLuBcUevHTN8HK_Vhz7Domea2vf23M-JaSjhZABFYSaBuKXUPT3InELOSbEYl-74PxlQhGBrJ7FnBgplK9qvSSCzHRk76S0j-L3Z7NszBRoPDrJPRw',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuCxww0eb3hQIuZZI3IgZr_5ajTNe92Ut7rR-bN89q8n-vAVD9fL_gcAIf9OPkkNf6L9v_E6GI6emHZbFz7mU3CBxENCI6KBvYgaMtSnJ7xTvYrr9HXMEMBZhAR2fdZNl_bM7vPPCH2GQU9XzTNr5OkddzqW_cfGirD54UpTWQP-8bh69j5c-4k-cBsp7gtygCUAL1Mc9lG8yGQstK5TTxqmryp8wCmrrUA8waxAwIVZhgQbzP3xLB3ipg',
              true
            ) ON CONFLICT DO NOTHING;

            INSERT INTO clients (id, slug, name, category, bio, profile_image_url, banner_image_url, is_active)
            VALUES (
              'tech-startup', 'tech-startup', 'Tech Startup', 'SaaS Launch Pad',
              'Next-generation developers building AI-assisted developer environments and high-performance server runtimes.',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuCk2SoEyLfAXaRDWoSIXV5hyi5Sgb0CgMzbpt3nNUZY2MlYWZf9evgJtAJc9IO3nuVBvOwI0VVAXrkyMtpdtY3oD2fpU_8WfJH9iSO7MV5P4YCsj_jwvA6EGt1x6KO2NJMwklAYyynH4IGQFNImKI32aTLMYxweLcSqiz6ZPPBoI5ukLLyyjLrFdw5VBgL89-zGO_PTnnafVJ5tThIvvDkOxNcXwXQdYgLCM2n3V53D94j1gd1EWV-AhA',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuBEILQGGgmpQSr7F1MNBjU7HLOpeXuhiBZrza9DzBsENZMdEBmy-EShaMSRhBgD-7x3tVr90axlnljb6dKRLfBs5oL-EDvxHCMIFsbiOtYuf3BMnzIqDQ0dUAv_p4qpFCMqsmNo3Vhd2wY-n9MPFPOlyMYhcjXh_fDtXB_gDNXMNjsXMG-5OcxUxqqwjZ76FzNdIwPmKsHbdi4CyH2XgP3d1bFuFen86SLnwT5UQHxt1EysCgmztSCcDg',
              true
            ) ON CONFLICT DO NOTHING;

            INSERT INTO client_links (id, client_id, title, url, icon, is_active, sort_order)
            VALUES ('p1', 'digital-creator', 'View My Portfolio', 'https://sarahjenkins.design', 'link', true, 0) ON CONFLICT DO NOTHING;

            INSERT INTO client_links (id, client_id, title, url, icon, is_active, sort_order)
            VALUES ('re1', 'real-estate', 'Browse Autumn Catalog', 'https://luxurymayfair.realestate', 'link', true, 0) ON CONFLICT DO NOTHING;

            INSERT INTO client_links (id, client_id, title, url, icon, is_active, sort_order)
            VALUES ('ts1', 'tech-startup', 'Schedule Sandbox Demo', 'https://techstartup.io/demo', 'link', true, 0) ON CONFLICT DO NOTHING;
          `);
          console.log('Seeded database with standard starter profiles.');
        }

      } catch (err: any) {
        console.error('Error establishing database tables:', err.message);
        throw err;
      } finally {
        client.release();
      }
    })();
  }
  await initDbPromise;
  return pool!;
}

export function mapPlatforms(item: any): any[] {
  const combinedPhone = item.phone_number ? `${item.country_code || '+965'}${item.phone_number}` : (item.phone || '');
  return [
    { id: 'phone', name: 'Phone', icon: 'Phone', placeholder: 'Direct mobile number', enabled: !!item.phone_number || !!item.phone, value: combinedPhone },
    { id: 'whatsapp', name: 'WhatsApp', icon: 'MessageCircle', placeholder: 'WhatsApp number or link', enabled: !!item.whatsapp, value: item.whatsapp || '' },
    { id: 'email', name: 'Email', icon: 'Mail', placeholder: 'Contact email address', enabled: !!item.email, value: item.email || '' },
    { id: 'website', name: 'Website', icon: 'Globe', placeholder: 'Official website address', enabled: !!item.website, value: item.website || '' },
    { id: 'maps', name: 'Google Maps', icon: 'MapPin', placeholder: 'Location or Google Maps URL', enabled: !!item.google_maps, value: item.google_maps || '' },
    { id: 'instagram', name: 'Instagram', icon: 'Instagram', placeholder: 'Username or profile URL', enabled: !!item.instagram, value: item.instagram || '' },
    { id: 'twitter', name: 'Twitter / X', icon: 'Twitter', placeholder: 'Twitter/X handle or URL', enabled: !!item.twitter, value: item.twitter || '' },
    { id: 'tiktok', name: 'TikTok', icon: 'Music2', placeholder: '@username or URL', enabled: !!item.tiktok, value: item.tiktok || '' },
    { id: 'snapchat', name: 'Snapchat', icon: 'Ghost', placeholder: 'Snapchat username', enabled: !!item.snapchat, value: item.snapchat || '' },
    { id: 'youtube', name: 'YouTube', icon: 'Youtube', placeholder: 'Channel URL', enabled: !!item.youtube, value: item.youtube || '' },
    { id: 'linkedin', name: 'LinkedIn', icon: 'Linkedin', placeholder: 'Profile URL', enabled: !!item.linkedin, value: item.linkedin || '' },
    { id: 'facebook', name: 'Facebook', icon: 'Facebook', placeholder: 'Facebook page URL', enabled: !!item.facebook, value: item.facebook || '' },
    { id: 'telegram', name: 'Telegram', icon: 'Send', placeholder: 'Telegram link or username', enabled: !!item.telegram, value: item.telegram || '' }
  ];
}
