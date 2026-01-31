import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const checkPostgres = async () => {
    // Try to connect to 'postgres' database first to check if server is up
    const client = new Client({
        connectionString: 'postgres://postgres:postgres@localhost:5432/postgres'
    });

    try {
        await client.connect();
        console.log('SUCCESS: PostgreSQL server is running at localhost:5432');

        // Now check if nepo_smm database exists
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'nepo_smm'");
        if (res.rowCount === 0) {
            console.log('NOTICE: Database "nepo_smm" does not exist. Creating it...');
            // We cannot create database within a transaction or with this connection easily if it's open to 'postgres'
            // but we can try
            try {
                // For CREATE DATABASE we might need a separate connection or ensure no transaction
                await client.query('CREATE DATABASE nepo_smm');
                console.log('SUCCESS: Database "nepo_smm" created.');
            } catch (createErr: any) {
                console.error('ERROR: Could not create database "nepo_smm":', createErr.message);
            }
        } else {
            console.log('SUCCESS: Database "nepo_smm" already exists.');
        }

    } catch (err: any) {
        console.error('ERROR: Could not connect to PostgreSQL server:', err.message);
        console.log('Please ensure PostgreSQL is installed and running on localhost:5432 with username "postgres" and password "postgres".');
    } finally {
        await client.end();
    }
};

checkPostgres();
