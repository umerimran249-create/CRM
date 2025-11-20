import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await fetchUserData(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // User doesn't exist, create one
        const { data: authUser } = await supabase.auth.getUser();
        if (authUser?.user) {
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              id: authUser.user.id,
              email: authUser.user.email,
              name: authUser.user.email?.split('@')[0] || 'User',
              role: 'Team Member',
              permissions: [],
              is_active: true,
            })
            .select()
            .single();

          if (!createError && newUser) {
            setUser(newUser);
          }
        }
      } else if (data) {
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          message: error.message || 'Login failed. Please check your email and password.',
        };
      }

      if (data.user) {
        await fetchUserData(data.user.id);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed',
      };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const hasPermission = (permission) => {
    if (!permission) return true;
    if (!user) return false;
    if (user.role === 'Admin') return true;
    const permissions = user.permissions || [];
    if (permissions.includes('*')) return true;
    return permissions.includes(permission);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    permissions: user?.permissions || [],
    hasPermission,
    supabase, // Export supabase client for direct use if needed
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

