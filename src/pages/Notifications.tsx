import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { fetchNotifications, markNotificationRead } from "../lib/api";
import { supabase } from "../lib/supabaseClient";
import EmptyState from "../components/EmptyState";

type NotificationItem = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  type: string;
  created_at: string;
  read_at: string | null;
  meta: any;
};

const Notifications = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const data = await fetchNotifications(user.id);
      setItems(data);
    } catch (error: any) {
      toast.error(error.message ?? "Failed to load notifications");
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notifications-stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const notification = payload.new as NotificationItem;
          if (notification.user_id === user.id) {
            setItems((prev) => [notification, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markRead = async (notificationId: string) => {
    try {
      await markNotificationRead(notificationId);
      setItems((prev) =>
        prev.map((item) =>
          item.id === notificationId ? { ...item, read_at: new Date().toISOString() } : item
        )
      );
    } catch (error: any) {
      toast.error(error.message ?? "Could not mark read");
    }
  };

  if (!items.length) {
    return (
      <EmptyState
        title="No notifications"
        description="When results or messages arrive, you will see them here."
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h2 className="text-3xl font-display">Notifications</h2>
        <p className="text-sm text-slate-300 mt-1">Latest updates.</p>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => markRead(item.id)}
            className={`w-full text-left card-sheen rounded-3xl p-4 ${
              item.read_at ? "opacity-70" : ""
            }`}
          >
            <div className="text-sm font-semibold">{item.title}</div>
            {item.body && <div className="text-xs text-slate-300 mt-1">{item.body}</div>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
