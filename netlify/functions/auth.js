// Netlify Function for Authentication - Works without database
exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST'
      },
      body: ''
    };
  }

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST'
  };

  try {
    if (event.httpMethod === 'POST') {
      return await authenticateUser(event, headers);
    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }
  } catch (error) {
    console.error('Auth Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Authentication failed', details: error.message })
    };
  }
};

// Authenticate admin user (mock)
async function authenticateUser(event, headers) {
  try {
    const body = JSON.parse(event.body);
    const { username, password } = body;

    if (!username || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Username and password are required' })
      };
    }

    // Mock authentication - accept admin/admin123
    if (username === 'admin' && password === 'admin123') {
      const token = 'netlify-jwt-token-' + Date.now();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          message: 'Authentication successful',
          token,
          user: {
            id: 1,
            username: 'admin',
            role: 'admin'
          }
        })
      };
    } else {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid credentials' })
      };
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Authentication failed', details: error.message })
    };
  }
}