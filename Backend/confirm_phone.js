require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function confirmPhone() {
  const phone = '8421358609'; // In auth.users it might be stored without + sometimes or with it
  const phoneFull = '+918421358609';
  
  try {
    console.log('Confirming phone in Supabase auth.users...');
    const userId = '0768e64a-7e19-4f98-b67d-3fd8a116885f';
    const result = await pool.query(
      `UPDATE auth.users 
       SET phone_confirmed_at = NOW()
       WHERE id = $1`,
      [userId]
    );
    
    if (result.rowCount > 0) {
      console.log(`Successfully confirmed phone for ${result.rowCount} user(s).`);
    } else {
      console.log('No user found with that phone number in auth.users.');
    }
  } catch (error) {
    console.error('Error confirming phone:', error);
  } finally {
    await pool.end();
  }
}

confirmPhone();
