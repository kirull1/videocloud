import { DataSource } from 'typeorm';
import databaseConfig from './config/database.config';

async function main() {
  const dataSource = new DataSource(databaseConfig());
  
  try {
    await dataSource.initialize();
    console.log('Data Source has been initialized!');
    
    // Get the columns of the videos table
    const columns = await dataSource.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'videos'
      ORDER BY ordinal_position;
    `);
    
    console.log('Columns in the videos table:');
    console.table(columns);
    
    await dataSource.destroy();
  } catch (error) {
    console.error('Error during Data Source initialization:', error);
  }
}

main().catch(console.error);