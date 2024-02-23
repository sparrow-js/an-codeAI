// db.js
import { createPool, Pool} from '@vercel/postgres';

let globalPool: Pool;

export function getDb() {
  if (!globalPool) {    
    const connectionString = process.env['POSTGRES_SUPBASE_URL'];
    console.log("connectionString", connectionString);

    globalPool = createPool({
      connectionString,
    });
  }

  return globalPool;
}
