const API_BASE_URL = 'http://localhost:8000';

// Helper function to handle API requests
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      window.location.reload();
      throw new Error('Authentication failed');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Auth API calls
export const authAPI = {
  login: (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    return apiRequest('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
  },
  
  register: (userData) => {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  getCurrentUser: () => {
    return apiRequest('/api/auth/me');
  },
};

// Resume API calls
export const resumeAPI = {
  getAll: () => {
    return apiRequest('/api/resumes/');
  },
  get: (id) => { 
    return fetch(`/api/resumes/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(response => response.json());
  },  
  getById: (id) => {
    return apiRequest(`/api/resumes/${id}`);
  },
  
  create: (resumeData) => {
    return apiRequest('/api/resumes/', {
      method: 'POST',
      body: JSON.stringify(resumeData),
    });
  },
  
  update: (id, resumeData) => {
    return apiRequest(`/api/resumes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(resumeData),
    });
  },
  
  delete: (id) => {
    return apiRequest(`/api/resumes/${id}`, {
      method: 'DELETE',
    });
  },
  
  download: async (id) => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE_URL}/api/resumes/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.status === 401) {
      localStorage.removeItem('access_token');
      window.location.reload();
      throw new Error('Authentication failed');
    }
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }
    
    return response;
  },
  
  getActivities: (limit = 10) => {
    return apiRequest(`/api/resumes/activities/recent?limit=${limit}`);
  },
};

// User API calls
export const userAPI = {
  getById: (id) => {
    return apiRequest(`/api/users/${id}`);
  },
  
  update: (id, userData) => {
    return apiRequest(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
};