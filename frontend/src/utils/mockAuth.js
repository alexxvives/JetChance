// Mock authentication for demo purposes
const DEMO_USERS = [
  {
    id: '1',
    email: 'customer@gmail.com',
    password: 'password',
    firstName: 'John',
    lastName: 'Doe',
    role: 'customer'
  },
  {
    id: '2',
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    role: 'customer'
  },
  {
    id: '3',
    email: 'operator@example.com',
    password: 'operator123',
    firstName: 'Test',
    lastName: 'Operator',
    role: 'operator'
  }
];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthAPI = {
  // Mock login
  login: async (credentials) => {
    await delay(1000); // Simulate network delay
    
    const user = DEMO_USERS.find(
      u => u.email === credentials.email && u.password === credentials.password
    );
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Generate mock token
    const token = btoa(JSON.stringify({ 
      userId: user.id, 
      email: user.email,
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    }));
    
    // Store in localStorage
    localStorage.setItem('accessToken', token);
    localStorage.setItem('mockUser', JSON.stringify(user));
    
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      tokens: {
        accessToken: token,
        refreshToken: 'mock_refresh_token'
      }
    };
  },

  // Mock register
  register: async (userData) => {
    await delay(1000);
    
    // Check if user already exists
    const existingUser = DEMO_USERS.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Create new mock user
    const newUser = {
      id: (DEMO_USERS.length + 1).toString(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'customer'
    };
    
    // Generate mock token
    const token = btoa(JSON.stringify({ 
      userId: newUser.id, 
      email: newUser.email,
      exp: Date.now() + 24 * 60 * 60 * 1000
    }));
    
    // Store in localStorage
    localStorage.setItem('accessToken', token);
    localStorage.setItem('mockUser', JSON.stringify(newUser));
    
    return {
      user: newUser,
      tokens: {
        accessToken: token,
        refreshToken: 'mock_refresh_token'
      }
    };
  },

  // Mock get profile
  getProfile: async () => {
    await delay(500);
    
    const token = localStorage.getItem('accessToken');
    const mockUser = localStorage.getItem('mockUser');
    
    if (!token || !mockUser) {
      throw new Error('No authentication token found');
    }
    
    try {
      // Check if token is expired
      const tokenData = JSON.parse(atob(token));
      if (Date.now() > tokenData.exp) {
        throw new Error('Token expired');
      }
      
      return JSON.parse(mockUser);
    } catch (error) {
      throw new Error('Invalid token');
    }
  },

  // Mock logout
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('mockUser');
  },

  // Mock update profile
  updateProfile: async (profileData) => {
    await delay(500);
    
    const mockUser = JSON.parse(localStorage.getItem('mockUser') || '{}');
    const updatedUser = { ...mockUser, ...profileData };
    
    localStorage.setItem('mockUser', JSON.stringify(updatedUser));
    
    return { user: updatedUser };
  }
};

// Check if we should use mock auth (when backend is not available)
export const shouldUseMockAuth = () => {
  // Check if explicitly set to use mock auth
  if (import.meta.env.VITE_USE_MOCK_AUTH === 'true') {
    return true;
  }
  
  const apiUrl = import.meta.env.VITE_API_URL;
  
  // Don't use mock auth if we have a proper deployed API URL
  if (apiUrl && !apiUrl.includes('localhost')) {
    return false;
  }
  
  // Use mock auth for localhost development when backend might not be running
  return !apiUrl || apiUrl.includes('localhost');
};