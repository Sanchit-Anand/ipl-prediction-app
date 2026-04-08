import type { MatchStatus, PredictionStatus } from "../types";

export const initials = (name?: string | null) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  return (parts[0]?.[0] ?? "U") + (parts[1]?.[0] ?? "");
};

export const statusLabel = (status: MatchStatus) => {
  switch (status) {
    case "live":
      return "Live";
    case "completed":
      return "Completed";
    case "abandoned":
      return "Abandoned";
    case "no_result":
      return "No Result";
    default:
      return "Upcoming";
  }
};

export const predictionLabel = (status: PredictionStatus) => {
  switch (status) {
    case "correct":
      return "Correct";
    case "wrong":
      return "Wrong";
    case "cancelled":
      return "Cancelled";
    case "no_result":
      return "No Result";
    default:
      return "Pending";
  }
};
