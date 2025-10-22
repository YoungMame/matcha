import Postgrator from 'postgrator';
import pg from 'pg';
import path from "node:path"

async function migrate() {
    const client = new pg.Client({
        host: 'localhost',
        port: 5432,
        database: 'example',
        user: 'example',
        password: 'example',
    });
    client.connect();

  try {
    await client.connect();

    const postgrator = new Postgrator({
      migrationPattern: path.join(__dirname, '/migrations/*'),
      driver: 'pg',
      database: 'example',
      schemaTable: 'migrations',
      currentSchema: 'public',
      execQuery: (query) => client.query(query),
    });

    const result = await postgrator.migrate()

    if (result.length === 0) {
      console.log(
        'No migrations run for schema "public". Already at the latest one.'
      )
    }

    console.log('Migration done.')

    process.exitCode = 0
  } catch(err) {
    console.error(err)
    process.exitCode = 1
  }

  await client.end()
}

migrate();