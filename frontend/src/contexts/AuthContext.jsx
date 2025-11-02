// src/contexts/AuthContext.jsx
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import supabase from "../services/supabase";
import { getUserProfile } from "../api/userApi";

// Create context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    
    if (!supabase) {
      console.warn("Supabase client not initialized");
      setLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log("Starting auth session check...");
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
        } else {
          console.log("Session check complete:", !!session?.user);
          setCurrentUser(session?.user || null);

          // Store session for consistency (only on client-side)
          if (session?.user && typeof window !== 'undefined') {
            try {
              localStorage.setItem(
                "user_session",
                JSON.stringify({
                  user: session.user,
                  access_token: session.access_token,
                  expires_at: session.expires_at,
                })
              );
            } catch (storageError) {
              console.warn("localStorage error:", storageError);
            }
          }
        }
      } catch (err) {
        console.warn("Auth initialization error:", err);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        console.log("Auth state change:", event, !!session?.user);
        setCurrentUser(session?.user || null);
        setLoading(false);

        // Update localStorage for session consistency (only on client-side)
        if (typeof window !== 'undefined') {
          if (session?.user) {
            try {
              localStorage.setItem(
                "user_session",
                JSON.stringify({
                  user: session.user,
                  access_token: session.access_token,
                  expires_at: session.expires_at,
                })
              );
              // Fetch user profile data when user is authenticated
              await fetchUserProfile(session.user.id);
            } catch (storageError) {
              console.warn("localStorage error in auth change:", storageError);
            }
          } else {
            try {
              localStorage.removeItem("user_session");
            } catch (storageError) {
              console.warn("localStorage remove error:", storageError);
            }
            setUserProfile(null);
          }
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setLoading(false);
      }
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Authentication functions
  const login = async (email, password) => {
    if (!supabase) {
      const error = "Supabase client not initialized";
      setError(error);
      return { success: false, error };
    }

    try {
      setError(null);
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }
      setCurrentUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    if (!supabase) {
      const error = "Supabase client not initialized";
      setError(error);
      return { success: false, error };
    }

    try {
      setError(null);
      setLoading(true);
      const { email, password, ...metadata } = userData;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }
      setCurrentUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!supabase) {
      const error = "Supabase client not initialized";
      setError(error);
      return { success: false, error };
    }

    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }
      // Clear any locally stored session info for immediate UI update (only on client-side)
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem("user_session");
          // Also remove the supabase stored token key if present
          localStorage.removeItem("customer-supabase-auth-token");
        } catch (storageError) {
          console.warn("localStorage remove error on logout:", storageError);
        }
      }

      setCurrentUser(null);
      setUserProfile(null);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const resetPassword = async (email) => {
    if (!supabase) {
      const error = "Supabase client not initialized";
      setError(error);
      return { success: false, error };
    }

    try {
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Fetch user profile data
  const fetchUserProfile = async (userId) => {
    if (!userId) return;

    try {
      const result = await getUserProfile();
      if (result.success) {
        setUserProfile(result.user);
      } else {
        console.warn("Failed to fetch user profile:", result);
      }
    } catch (error) {
      console.warn("Error fetching user profile:", error);
    }
  };

  // Get access token from current session
  const getAccessToken = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
        return null;
      }
      return session?.access_token || null;
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  };

  // Check if session is valid (only on client-side)
  const isSessionValid = () => {
    if (typeof window === 'undefined') return false;
    
    const storedSession = localStorage.getItem("user_session");
    if (!storedSession) return false;

    try {
      const session = JSON.parse(storedSession);
      const now = Date.now() / 1000;
      return session.expires_at > now;
    } catch {
      return false;
    }
  };

  // Context value
  const value = {
    currentUser,
    userProfile,
    isAuthenticated: !!currentUser,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    getAccessToken,
    isSessionValid,
    setUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
