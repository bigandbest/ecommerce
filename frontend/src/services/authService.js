// src/services/authService.js
// Authentication service using Supabase for customer users

import supabase from "./supabase";

// Login user
export const login = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (error) {
    throw error;
  }
};

// Register user
export const register = async (userData) => {
  try {
    const { email, password, ...metadata } = userData;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata, // Additional user metadata
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (error) {
    throw error;
  }
};

// Logout user
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      throw new Error(error.message);
    }
    return user;
  } catch (error) {
    throw error;
  }
};

// Get current session
export const getCurrentSession = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) {
      throw new Error(error.message);
    }
    return session;
  } catch (error) {
    throw error;
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      throw new Error(error.message);
    }
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Update password
export const updatePassword = async (newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      throw new Error(error.message);
    }
    return { success: true };
  } catch (error) {
    throw error;
  }
};
