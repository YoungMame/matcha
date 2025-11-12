// ...existing code...
import { Client } from 'pg';
import dataset from './dataset.json';

const BATCH_SIZE = 100;

const client = new Client({
  host: process.env.PGHOST || 'db',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || process.env.POSTGRES_USER,
  database: process.env.PGDB || process.env.POSTGRES_DB,
  password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD,
});

type UserEntry = {
  username: string;
  email: string;
  bio: string;
  password_hash: string;
  created_at: number;
  gender: string;
  orientation: string;
  tags: string;
  fame_rate: number;
  location: string; // "lat,lon"
  born_at: string;
};

function parseTags(s: string) {
  return s.split(',').map(t => t.trim()).filter(Boolean);
}

async function waitForDbReady(retries = 60, delayMs = 2000) {
  for (let i = 0; i < retries; i++) {
    const probeClient = new Client({
      host: process.env.PGHOST || 'db',
      port: Number(process.env.PGPORT || 5432),
      user: process.env.PGUSER || process.env.POSTGRES_USER,
      database: process.env.PGDB || process.env.POSTGRES_DB,
      password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD,
      connectionTimeoutMillis: 2000,
    });
    try {
      await probeClient.connect();
      await probeClient.end();
      console.log('DB ready');
      return;
    } catch (err: any) {
      console.log(`DB not ready (${i + 1}/${retries}): ${err.message}`);
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
  throw new Error('DB did not become ready');
}

async function seed() {
    await waitForDbReady();
    console.log("Database is ready, proceeding with seed...");
    await client.connect();
    try {
        for (let i = 0; i < dataset.length; i += BATCH_SIZE) {
            const batch = (dataset as UserEntry[]).slice(i, i + BATCH_SIZE);
            await client.query('BEGIN');

            // 1) Insert users (parametrized multi-row) with ON CONFLICT DO NOTHING
            const values: any[] = [];
            const rows = batch.map((u, idx) => {
                const base = idx * 11; // number of columns per user below
                const pp = `https://randomuser.me/api/portraits/${u.gender}/${Math.floor(Math.random()*100)}.jpg`;
                values.push(
                u.username,
                u.email,
                u.bio,
                u.password_hash,
                u.gender,
                u.orientation,
                parseTags(u.tags),
                Math.floor(u.fame_rate / 1000),
                [pp], // profile_pictures as SQL array
                0, // profile_pictures_index
                new Date(u.born_at).toISOString()
                );
                return `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5},$${base + 6},$${base + 7},$${base + 8},$${base + 9},$${base + 10},$${base + 11})`;
            }).join(',');

            const insertUsersSql = `
                INSERT INTO users
                (username, email, bio, password_hash, gender, orientation, tags, fame_rate, profile_pictures, profile_picture_index, born_at)
                VALUES ${rows}
            `;
            await client.query(insertUsersSql, values);

            // 2) Ensure we have ids for all emails (existing users also)
            const emails = batch.map(u => u.email);
            const res = await client.query('SELECT id, email FROM users WHERE email = ANY($1)', [emails]);
            const idMap = new Map<string, number>();
            res.rows.forEach((r: any) => idMap.set(r.email, r.id));

            // 3) Insert locations using resolved ids
            const locValues: any[] = [];
            const locRows: string[] = [];
            batch.forEach((u, idx) => {
                const id = idMap.get(u.email);
                if (!id) return; // skip if user still missing
                const [lat, lon] = u.location.split(',').map(s => parseFloat(s.trim()));
                const base = locValues.length + 1;
                locValues.push(id, lat, lon, 'Paris', 'Le Havre'); // city and country as '...' for seed
                locRows.push(`($${base}, $${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`);
            });

            if (locRows.length > 0) {
                const insertLocSql = `
                INSERT INTO locations (user_id, latitude, longitude, city, longitude)
                VALUES ${locRows.join(',')}
                `;
                await client.query(insertLocSql, locValues);
            }

            await client.query('COMMIT');
        }
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        await client.end();
    }
}

seed()
.then(() => {
  console.log('Seeding completed.');
  process.exit(0);
})
.catch(e => {
  console.error(e);
  process.exit(1);
});
// ...existing code...