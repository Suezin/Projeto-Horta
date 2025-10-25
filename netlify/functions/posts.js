// Netlify Function for Posts - Works without database
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

// Get all posts - returns empty array to start clean
async function getPosts(event, headers) {
  try {
    // Return empty array - no pre-loaded data
    const posts = [];

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

// Create new post (mock)
async function createPost(event, headers) {
  try {
    const body = JSON.parse(event.body);
    
    // Mock response
    const newPost = {
      id: Date.now(),
      ...body,
      created_at: new Date().toISOString(),
      author: 'admin'
    };

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ 
        message: 'Post created successfully',
        post: newPost 
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

// Update post (mock)
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

    // Mock response
    const updatedPost = {
      id: parseInt(id),
      ...body,
      updated_at: new Date().toISOString()
    };

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

// Delete post (mock)
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