const { neon } = require('@netlify/neon');

// Initialize database connection
let sql;
try {
  sql = neon(process.env.NETLIFY_DATABASE_URL);
} catch (error) {
  console.error('Database connection error:', error);
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Create tables if they don't exist
    await sql`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        plant_type VARCHAR(100) NOT NULL,
        plant_age VARCHAR(50),
        planting_date VARCHAR(50),
        height VARCHAR(50),
        weather VARCHAR(100),
        temperature VARCHAR(50),
        watering VARCHAR(100),
        fertilizer VARCHAR(100),
        pest_problems VARCHAR(100),
        notes TEXT,
        expected_harvest VARCHAR(50),
        growth_rate INTEGER DEFAULT 0,
        health_score INTEGER DEFAULT 0,
        leaf_count INTEGER DEFAULT 0,
        color_intensity INTEGER DEFAULT 0,
        author VARCHAR(100) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        filename VARCHAR(255) NOT NULL,
        image_data BYTEA NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert default admin user if not exists
    await sql`
      INSERT INTO admin_users (username, password_hash) 
      VALUES ('admin', '$2b$10$rQZ8K9mN2pL3sT4uV5wX6yA7bC8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8xY9zA')
      ON CONFLICT (username) DO NOTHING
    `;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: JSON.stringify({ 
        message: 'Database tables created successfully',
        tables: ['posts', 'images', 'admin_users']
      })
    };

  } catch (error) {
    console.error('Database setup error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Database setup failed', details: error.message })
    };
  }
};
