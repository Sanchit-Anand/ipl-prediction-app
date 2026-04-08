export type UserRole = "user" | "admin";

export type MatchStatus =
  | "upcoming"
  | "live"
  | "completed"
  | "abandoned"
  | "no_result";

export type ResultType = "normal" | "abandoned" | "no_result" | "tie";

export type PredictionStatus =
  | "pending"
  | "correct"
  | "wrong"
  | "cancelled"
  | "no_result";

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export interface Match {
  id: string;
  external_match_id: string | null;
  season: string | null;
  team1: string;
  team2: string;
  team1_short: string | null;
  team2_short: string | null;
  match_time: string;
  venue: string | null;
  status: MatchStatus;
  lock_time: string;
  winner_team: string | null;
  result_type: ResultType | null;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  selected_team: string;
  predicted_at: string;
  updated_at: string | null;
  points_awarded: number;
  prediction_status: PredictionStatus;
  match?: Match;
}

export interface LeaderboardRow {
  user_id: string;
  full_name: string | null;
  email: string | null;
  total_points: number;
  total_predictions: number;
  correct_predictions: number;
  win_rate: number | null;
  tie_breaker: string | null;
  user_created_at: string;
  rank: number;
}
