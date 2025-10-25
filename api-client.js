// API Client for HortaStats Database Integration
class HortaStatsAPI {
  constructor() {
    this.baseURL = '/.netlify/functions';
    this.token = localStorage.getItem('adminToken');
    this.useLocalStorage = true; // Use localStorage with sample data
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('adminToken', token);
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem('adminToken');
  }

  // Get headers for API requests
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Authentication
  async authenticate(username, password) {
    try {
      // Try Netlify Functions first
      const response = await fetch(`${this.baseURL}/auth`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      
      if (response.ok) {
        this.setToken(data.token);
        return { success: true, user: data.user };
      } else {
        throw new Error(data.error || 'API error');
      }
    } catch (error) {
      console.log('Netlify Functions failed, using localStorage auth:', error.message);
      
      // Fallback to localStorage authentication
      if (username === 'admin' && password === 'admin123') {
        const token = 'local-token-' + Date.now();
        this.setToken(token);
        return { 
          success: true, 
          user: { id: 1, username: 'admin', role: 'admin' }
        };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    }
  }

  // Get all posts
  async getPosts() {
    try {
      // Try Netlify Functions first
      const response = await fetch(`${this.baseURL}/posts`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, posts: data.posts };
      } else {
        throw new Error(data.error || 'API error');
      }
    } catch (error) {
      console.log('Netlify Functions failed, using localStorage:', error.message);
      
      // Fallback to localStorage with sample data
      try {
        const savedPosts = localStorage.getItem('hortaPosts');
        if (savedPosts) {
          const posts = JSON.parse(savedPosts);
          return { success: true, posts: posts };
        } else {
          // Load sample data
          const samplePosts = this.getSampleData();
          localStorage.setItem('hortaPosts', JSON.stringify(samplePosts));
          return { success: true, posts: samplePosts };
        }
      } catch (localError) {
        console.error('Error loading posts:', localError);
        return { success: false, error: 'Failed to load posts' };
      }
    }
  }

  // Get sample data - returns empty array to start clean
  getSampleData() {
    return [];
  }

  // Create new post
  async createPost(postData) {
    try {
      // Try Netlify Functions first
      const response = await fetch(`${this.baseURL}/posts`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(postData)
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, post: data.post };
      } else {
        throw new Error(data.error || 'API error');
      }
    } catch (error) {
      console.log('Netlify Functions failed, using localStorage:', error.message);
      
      // Fallback to localStorage
      try {
        const savedPosts = localStorage.getItem('hortaPosts');
        let posts = savedPosts ? JSON.parse(savedPosts) : [];
        
        // Transform frontend data to API format for storage
        const newPost = {
          id: Date.now(),
          plant_type: postData.plantType,
          plant_age: postData.plantAge,
          planting_date: postData.plantingDate,
          height: postData.height,
          weather: postData.weather,
          temperature: postData.temperature,
          watering: postData.watering,
          fertilizer: postData.fertilizer,
          pest_problems: postData.pestProblems,
          notes: postData.notes,
          expected_harvest: postData.expectedHarvest,
          created_at: new Date().toISOString(),
          author: 'admin',
          images: postData.images || []
        };
        
        posts.unshift(newPost);
        localStorage.setItem('hortaPosts', JSON.stringify(posts));
        
        return { success: true, post: newPost };
      } catch (localError) {
        console.error('Error creating post:', localError);
        return { success: false, error: 'Failed to save post' };
      }
    }
  }

  // Update post
  async updatePost(postId, postData) {
    try {
      const response = await fetch(`${this.baseURL}/posts?id=${postId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(postData)
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, post: data.post };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  // Delete post
  async deletePost(postId) {
    // Use localStorage directly
    try {
      const savedPosts = localStorage.getItem('hortaPosts');
      if (savedPosts) {
        let posts = JSON.parse(savedPosts);
        posts = posts.filter(post => post.id != postId);
        localStorage.setItem('hortaPosts', JSON.stringify(posts));
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting post:', error);
      return { success: false, error: 'Failed to delete post' };
    }
  }

  // Get image
  async getImage(imageId) {
    try {
      const response = await fetch(`${this.baseURL}/images?id=${imageId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (response.ok) {
        return { success: true, imageUrl: response.url };
      } else {
        return { success: false, error: 'Image not found' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  // Upload image
  async uploadImage(postId, file) {
    try {
      // Convert file to base64
      const base64 = await this.fileToBase64(file);
      
      const response = await fetch(`${this.baseURL}/images`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          postId,
          filename: file.name,
          imageData: base64,
          mimeType: file.type
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, image: data.image };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  // Convert file to base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }
}

// Global API instance
window.hortaAPI = new HortaStatsAPI();
