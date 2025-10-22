import Postgrator from 'postgrator';
import pg from 'pg';
import path from "node:path"
import fs from "node:fs"

async function migrate() {
    const client = new pg.Client({
        host: 'db',
        port: 5432,
        database: process.env.PGDB,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
    });

    console.log(" ENV vars: ", process.env.PGDB, process.env.PGUSER, process.env.PGPASSWORD);

    try {
        await client.connect();

        const postgrator = new Postgrator({
            migrationPattern: path.join(__dirname, './migrations/*.sql'),
            driver: 'pg',
            database: (process.env.PGDB as string),
            schemaTable: 'migrations',
            currentSchema: 'public',
            execQuery: (query) => client.query(query),
        });

        // Migrate to specific version
        postgrator
            .migrate('001')
            .then((appliedMigrations) => console.log("My migrations" + appliedMigrations))
        .catch((error) => {
            console.log(error)
            // Because migrations prior to the migration with error would have run
            // error object is decorated with appliedMigrations
            console.log(error.appliedMigrations) // array of migration objects
        })

        // Migrate to max version (optionally can provide 'max')
        // postgrator
        // .migrate()
        // .then((appliedMigrations) => console.log(appliedMigrations))
        // .catch((error) => console.log(error))

        process.exitCode = 0
    } catch(err) {
        console.error(err)
        process.exitCode = 1
    }

    await client.end();
}

migrate();