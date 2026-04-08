import { supabase } from "./supabaseClient";
import type { LeaderboardRow, Match, Prediction } from "../types";

export const fetchMatches = async (statusFilter?: string[]) => {
  let query = supabase.from("matches").select("*");
  if (statusFilter && statusFilter.length > 0) {
    query = query.in("status", statusFilter);
  }
  const { data, error } = await query.order("match_time", { ascending: true });
  if (error) throw error;
  return data as Match[];
};

export const fetchMatchById = async (id: string) => {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Match;
};

export const fetchUserPredictions = async (userId: string) => {
  const { data, error } = await supabase
    .from("predictions")
    .select("*, match:matches(*)")
    .eq("user_id", userId)
    .order("predicted_at", { ascending: false });
  if (error) throw error;
  return data as Prediction[];
};

export const fetchUserPredictionMap = async (userId: string) => {
  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  const map = new Map<string, Prediction>();
  (data as Prediction[]).forEach((prediction) => {
    map.set(prediction.match_id, prediction);
  });
  return map;
};

export const createPrediction = async (
  matchId: string,
  userId: string,
  selectedTeam: string
) => {
  const { data, error } = await supabase
    .from("predictions")
    .insert({
      match_id: matchId,
      user_id: userId,
      selected_team: selectedTeam,
      prediction_status: "pending",
      points_awarded: 0
    })
    .select()
    .single();
  if (error) throw error;
  return data as Prediction;
};

export const fetchLeaderboard = async () => {
  const { data, error } = await supabase
    .from("leaderboard_view")
    .select("*")
    .order("rank", { ascending: true });
  if (error) throw error;
  return data as LeaderboardRow[];
};

export const fetchLeaderboardRow = async (userId: string) => {
  const { data, error } = await supabase
    .from("leaderboard_view")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data as LeaderboardRow;
};

export const fetchAdminStats = async () => {
  const [{ count: totalMatches }, { count: liveMatches }, { count: completedMatches }, { count: totalPredictions }, { count: totalUsers }] =
    await Promise.all([
      supabase.from("matches").select("id", { count: "exact", head: true }),
      supabase
        .from("matches")
        .select("id", { count: "exact", head: true })
        .in("status", ["upcoming", "live"]),
      supabase
        .from("matches")
        .select("id", { count: "exact", head: true })
        .eq("status", "completed"),
      supabase
        .from("predictions")
        .select("id", { count: "exact", head: true }),
      supabase.from("users_profile").select("id", { count: "exact", head: true })
    ]);

  return {
    totalMatches: totalMatches ?? 0,
    liveMatches: liveMatches ?? 0,
    completedMatches: completedMatches ?? 0,
    totalPredictions: totalPredictions ?? 0,
    totalUsers: totalUsers ?? 0
  };
};

export const upsertMatch = async (payload: Partial<Match>) => {
  const { data, error } = await supabase
    .from("matches")
    .upsert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Match;
};

export const deleteMatch = async (matchId: string) => {
  const { error } = await supabase.from("matches").delete().eq("id", matchId);
  if (error) throw error;
};

export const setMatchResult = async (payload: {
  matchId: string;
  winnerTeam: string | null;
  resultType: string;
}) => {
  const { error } = await supabase.rpc("set_match_result", {
    p_match_id: payload.matchId,
    p_winner_team: payload.winnerTeam,
    p_result_type: payload.resultType
  });
  if (error) throw error;
};

export const syncMatches = async () => {
  const response = await fetch("/.netlify/functions/sync-matches", {
    method: "POST"
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Sync failed");
  }
  return response.json();
};

export const fetchAdminPredictions = async () => {
  const { data, error } = await supabase
    .from("predictions")
    .select("*, match:matches(*), user:users_profile(full_name,email)")
    .order("predicted_at", { ascending: false });
  if (error) throw error;
  return data as (Prediction & {
    user?: { full_name: string | null; email: string | null };
  })[];
};

export const fetchPublicProfiles = async () => {
  const { data, error } = await supabase
    .from("public_profiles")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    created_at: string;
  }[];
};

export const fetchPublicProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("public_profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data as {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    created_at: string;
  };
};

export const fetchConversation = async (userId: string, otherId: string) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`
    )
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as {
    id: string;
    sender_id: string;
    receiver_id: string;
    body: string;
    created_at: string;
    read_at: string | null;
  }[];
};

export const sendMessage = async (
  senderId: string,
  receiverId: string,
  body: string
) => {
  const { data, error } = await supabase
    .from("messages")
    .insert({ sender_id: senderId, receiver_id: receiverId, body })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const markMessagesRead = async (receiverId: string, senderId: string) => {
  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("receiver_id", receiverId)
    .eq("sender_id", senderId)
    .is("read_at", null);
  if (error) throw error;
};

export const fetchNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as {
    id: string;
    title: string;
    body: string | null;
    type: string;
    created_at: string;
    read_at: string | null;
    meta: any;
  }[];
};

export const markNotificationRead = async (notificationId: string) => {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId);
  if (error) throw error;
};
