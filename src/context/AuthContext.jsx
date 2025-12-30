import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { autoRegisterInChat } from '../utils/autoRegisterChat';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      // The API returns { user: {...}, profile: {...} }
      // We need to extract just the user object
      const userData = response.data.user || response.data;
      setUser(userData);
      
      // Auto-register in Chat for ALL users immediately
      // This ensures all users can chat right away
      if (userData?.id && !sessionStorage.getItem(`chat_reg_${userData.id}`)) {
        // Mark that we've attempted registration for this session
        sessionStorage.setItem(`chat_reg_${userData.id}`, 'true');
        
        // Auto-register immediately in background
        setTimeout(async () => {
          try {
            // Get appKey and register - this also marks user as chat-ready in backend
            const chatTokenResponse = await axios.post('/api/agora/chat-token', {
              userId: userData.id.toString(),
            });
            if (chatTokenResponse.data?.appKey) {
              console.log('🔄 Auto-registering user in Chat:', userData.id);
              const registered = await autoRegisterInChat(userData.id, chatTokenResponse.data.appKey);
              if (registered) {
                console.log('✅ User successfully auto-registered in Chat');
              } else {
                // Even if registration didn't complete, user is marked as chat-ready in backend
                console.log('✅ User marked as chat-ready (will be registered when they open chat)');
              }
            }
          } catch (regError) {
            // Non-critical, just log it
            console.log('⚠️ Auto-registration attempt:', regError.message);
            // Remove session flag on error so it can retry next time
            sessionStorage.removeItem(`chat_reg_${userData.id}`);
          }
        }, 500); // Reduced delay - register immediately
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setUser(userData);
      
      // Automatically register user in Agora Chat immediately on login
      if (userData?.id) {
        // Register in background (don't block login)
        setTimeout(async () => {
          try {
            const chatTokenResponse = await axios.post('/api/agora/chat-token', {
              userId: userData.id.toString(),
            });
            if (chatTokenResponse.data?.appKey) {
              console.log('🔄 Auto-registering user in Chat on login:', userData.id);
              const registered = await autoRegisterInChat(userData.id, chatTokenResponse.data.appKey);
              if (registered) {
                console.log('✅ User successfully registered in Chat on login');
              } else {
                console.log('⚠️ Chat registration may not have completed, but user can still open chat manually');
              }
            }
          } catch (chatError) {
            console.log('⚠️ Could not auto-register in chat (non-critical):', chatError.message);
            console.log('User can still open chat manually to register');
          }
        }, 500); // Small delay to not block login UI
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setUser(newUser);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

