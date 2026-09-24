import type { Session } from '@supabase/supabase-js';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
        setLoading(false);
      }
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession);
      }
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      configured: isSupabaseConfigured,
      async signIn(email, password) {
        if (!supabase) {
          throw new Error('Supabase is not configured');
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw new Error(error.message);
        }
      },
      async signUp(email, password) {
        if (!supabase) {
          throw new Error('Supabase is not configured');
        }
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          throw new Error(error.message);
        }
        return data.session == null;
      },
      async signOut() {
        if (!supabase) {
          return;
        }
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw new Error(error.message);
        }
      },
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}