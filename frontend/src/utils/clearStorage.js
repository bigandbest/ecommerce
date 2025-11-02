// Utility to clear problematic tokens from localStorage
export const clearAuthToken = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    const userSession = localStorage.getItem('user_session');
    const supabaseToken = localStorage.getItem('customer-supabase-auth-token');
    
    console.log('Current tokens:', { token, userSession: !!userSession, supabaseToken: !!supabaseToken });
    
    let cleared = false;
    
    // Clear token if it's invalid or problematic
    if (token === 'null' || token === 'undefined' || token === '' || token?.includes('Bearer')) {
      localStorage.removeItem('token');
      console.log('Cleared problematic token from localStorage');
      cleared = true;
    }
    
    // Check if user_session has expired or is invalid
    if (userSession) {
      try {
        const session = JSON.parse(userSession);
        const now = Date.now() / 1000;
        if (!session.access_token || session.expires_at <= now) {
          localStorage.removeItem('user_session');
          console.log('Cleared expired user session');
          cleared = true;
        }
      } catch (e) {
        localStorage.removeItem('user_session');
        console.log('Cleared invalid user session');
        cleared = true;
      }
    }
    
    return cleared;
  }
  return false;
};

// Clear all auth-related storage
export const clearAllAuthStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user_session');
    localStorage.removeItem('customer-supabase-auth-token');
    // Clear any Supabase auth keys that might exist
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });
    console.log('Cleared all auth storage');
  }
};