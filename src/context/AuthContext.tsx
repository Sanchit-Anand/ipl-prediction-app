import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import type { UserProfile } from "../types";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: {
    fullName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (activeUser: User | null) => {
    try {
      if (!activeUser) {
        setProfile(null);
        return;
      }
      const { data, error } = await supabase
        .from("users_profile")
        .select("*")
        .eq("id", activeUser.id)
        .single();

      if (error && error.code === "PGRST116") {
        const { data: insertData } = await supabase
          .from("users_profile")
          .insert({
            id: activeUser.id,
            full_name: activeUser.user_metadata?.full_name ?? null,
            email: activeUser.email ?? null,
            role: "user"
          })
          .select()
          .single();
        setProfile(insertData ?? null);
        return;
      }

      if (!error) {
        setProfile(data);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("Profile load failed", error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const safetyTimer = setTimeout(() => {
      if (active) {
        setLoading(false);
      }
    }, 2500);

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
        await loadProfile(data.session?.user ?? null);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Auth init failed", error);
      } finally {
        clearTimeout(safetyTimer);
        setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        try {
          setSession(nextSession);
          setUser(nextSession?.user ?? null);
          await loadProfile(nextSession?.user ?? null);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Auth change failed", error);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      active = false;
      clearTimeout(safetyTimer);
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
  }, []);

  const signUp = useCallback(
    async ({
      fullName,
      email,
      password
    }: {
      fullName: string;
      email: string;
      password: string;
    }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      if (error) throw error;

      if (data.user) {
        await supabase.from("users_profile").upsert({
          id: data.user.id,
          full_name: fullName,
          email,
          role: "user"
        });
      }

      if (!data.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) throw signInError;
      }
    },
    []
  );

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      loading,
      isAdmin: profile?.role === "admin",
      signIn,
      signUp,
      signInWithGoogle,
      signOut
    }),
    [user, session, profile, loading, signIn, signUp, signInWithGoogle, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
