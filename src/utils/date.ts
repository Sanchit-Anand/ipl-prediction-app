import { format, formatDistanceToNowStrict, isBefore, parseISO } from "date-fns";

export const formatMatchTime = (iso: string) => {
  try {
    return format(parseISO(iso), "MMM d, yyyy • h:mm a");
  } catch {
    return iso;
  }
};

export const formatShortTime = (iso: string) => {
  try {
    return format(parseISO(iso), "MMM d • h:mm a");
  } catch {
    return iso;
  }
};

export const getCountdown = (iso: string) => {
  try {
    return formatDistanceToNowStrict(parseISO(iso), { addSuffix: true });
  } catch {
    return "soon";
  }
};

export const isLocked = (lockTime: string) => {
  try {
    return isBefore(parseISO(lockTime), new Date()) || lockTime === null;
  } catch {
    return false;
  }
};

export const isMatchDayInIndia = (matchTime: string) => {
  try {
    const matchDate = new Date(matchTime).toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata"
    });
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata"
    });
    return matchDate === today;
  } catch {
    return false;
  }
};
