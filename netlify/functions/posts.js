const { neon } = require('@netlify/neon');

// Initialize database connection
let sql;
try {
  sql = neon(process.env.NETLIFY_DATABASE_URL);
} catch (error) {
  console.error('Database connection error:', error);
}

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
      },
      body: ''
    };
  }

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
  };

  try {
    switch (event.httpMethod) {
      case 'GET':
        return await getPosts(event, headers);
      case 'POST':
        return await createPost(event, headers);
      case 'PUT':
        return await updatePost(event, headers);
      case 'DELETE':
        return await deletePost(event, headers);
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};

// Get all posts from database
async function getPosts(event, headers) {
  try {
    if (!sql) {
      console.log('No database connection, returning empty array');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ posts: [] })
      };
    }

    // Get posts from database
    const posts = await sql`
      SELECT 
        p.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', i.id,
              'filename', i.filename,
              'mime_type', i.mime_type,
              'created_at', i.created_at
            )
          ) FILTER (WHERE i.id IS NOT NULL),
          '[]'::json
        ) as images
      FROM posts p
      LEFT JOIN images i ON p.id = i.post_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ posts })
    };
  } catch (error) {
    console.error('Get posts error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch posts', details: error.message })
    };
  }
}

// Create new post in database
async function createPost(event, headers) {
  try {
    const body = JSON.parse(event.body);
    
    if (!sql) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Database not configured' })
      };
    }

    // Insert post into database
    const [newPost] = await sql`
      INSERT INTO posts (
        plant_type, plant_age, planting_date, height, weather, 
        temperature, watering, fertilizer, pest_problems, notes, 
        expected_harvest, author
      ) VALUES (
        ${body.plantType || body.plant_type},
        ${body.plantAge || body.plant_age},
        ${body.plantingDate || body.planting_date},
        ${body.height},
        ${body.weather},
        ${body.temperature},
        ${body.watering},
        ${body.fertilizer},
        ${body.pestProblems || body.pest_problems},
        ${body.notes},
        ${body.expectedHarvest || body.expected_harvest},
        'admin'
      )
      RETURNING *
    `;

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ 
        message: 'Post created successfully',
        post: { ...newPost, images: [] }
      })
    };
  } catch (error) {
    console.error('Create post error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create post', details: error.message })
    };
  }
}

// Update post in database
async function updatePost(event, headers) {
  try {
    const { id } = event.queryStringParameters;
    const body = JSON.parse(event.body);
    
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Post ID is required' })
      };
    }

    if (!sql) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Database not configured' })
      };
    }

    // Update post in database
    const [updatedPost] = await sql`
      UPDATE posts SET
        plant_type = ${body.plantType || body.plant_type},
        plant_age = ${body.plantAge || body.plant_age},
        planting_date = ${body.plantingDate || body.planting_date},
        height = ${body.height},
        weather = ${body.weather},
        temperature = ${body.temperature},
        watering = ${body.watering},
        fertilizer = ${body.fertilizer},
        pest_problems = ${body.pestProblems || body.pest_problems},
        notes = ${body.notes},
        expected_harvest = ${body.expectedHarvest || body.expected_harvest},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (!updatedPost) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Post not found' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        message: 'Post updated successfully',
        post: updatedPost 
      })
    };
  } catch (error) {
    console.error('Update post error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to update post', details: error.message })
    };
  }
}

// Delete post from database
async function deletePost(event, headers) {
  try {
    const { id } = event.queryStringParameters;
    
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Post ID is required' })
      };
    }

    if (!sql) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Database not configured' })
      };
    }

    // Delete post from database (images will be deleted by CASCADE)
    const result = await sql`
      DELETE FROM posts WHERE id = ${id}
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Post deleted successfully' })
    };
  } catch (error) {
    console.error('Delete post error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to delete post', details: error.message })
    };
  }
}