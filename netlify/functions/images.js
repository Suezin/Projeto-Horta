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
        'Access-Control-Allow-Methods': 'GET, POST, DELETE'
      },
      body: ''
    };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE'
  };

  try {
    switch (event.httpMethod) {
      case 'GET':
        return await getImage(event, headers);
      case 'POST':
        return await uploadImage(event, headers);
      case 'DELETE':
        return await deleteImage(event, headers);
      default:
        return {
          statusCode: 405,
          headers: {
            ...headers,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Image API Error:', error);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};

// Get image by ID
async function getImage(event, headers) {
  try {
    const { id } = event.queryStringParameters;
    
    if (!id) {
      return {
        statusCode: 400,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Image ID is required' })
      };
    }

    const [image] = await sql`
      SELECT image_data, mime_type, filename
      FROM images 
      WHERE id = ${id}
    `;

    if (!image) {
      return {
        statusCode: 404,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Image not found' })
      };
    }

    // Convert bytea to base64
    const base64Data = Buffer.from(image.image_data).toString('base64');
    const dataUrl = `data:${image.mime_type};base64,${base64Data}`;

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': image.mime_type,
        'Content-Disposition': `inline; filename="${image.filename}"`
      },
      body: dataUrl
    };
  } catch (error) {
    throw new Error(`Failed to get image: ${error.message}`);
  }
}

// Upload new image
async function uploadImage(event, headers) {
  try {
    const body = JSON.parse(event.body);
    const { postId, filename, imageData, mimeType } = body;

    const [newImage] = await sql`
      INSERT INTO images (post_id, filename, image_data, mime_type)
      VALUES (${postId}, ${filename}, ${imageData}, ${mimeType})
      RETURNING id, filename, mime_type, created_at
    `;

    return {
      statusCode: 201,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message: 'Image uploaded successfully',
        image: newImage 
      })
    };
  } catch (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

// Delete image
async function deleteImage(event, headers) {
  try {
    const { id } = event.queryStringParameters;
    
    if (!id) {
      return {
        statusCode: 400,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Image ID is required' })
      };
    }

    await sql`DELETE FROM images WHERE id = ${id}`;

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: 'Image deleted successfully' })
    };
  } catch (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}
