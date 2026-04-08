import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import {
  fetchConversation,
  fetchPublicProfiles,
  markMessagesRead,
  sendMessage
} from "../lib/api";
import { supabase } from "../lib/supabaseClient";
import EmptyState from "../components/EmptyState";

type PublicProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

const Chat = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const data = await fetchPublicProfiles();
        const others = data.filter((item) => item.id !== user?.id);
        setProfiles(others);
        if (!selectedId && others.length > 0) {
          setSelectedId(others[0].id);
        }
      } catch (error: any) {
        toast.error(error.message ?? "Failed to load users");
      }
    };
    loadProfiles();
  }, [user?.id]);

  const activeProfile = useMemo(
    () => profiles.find((item) => item.id === selectedId) ?? null,
    [profiles, selectedId]
  );

  const loadConversation = async (targetId: string) => {
    if (!user) return;
    try {
      const data = await fetchConversation(user.id, targetId);
      setMessages(data);
      await markMessagesRead(user.id, targetId);
    } catch (error: any) {
      toast.error(error.message ?? "Failed to load messages");
    }
  };

  useEffect(() => {
    if (!selectedId) return;
    loadConversation(selectedId);
  }, [selectedId]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("messages-stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Message;
          if (
            (msg.sender_id === user.id && msg.receiver_id === selectedId) ||
            (msg.sender_id === selectedId && msg.receiver_id === user.id)
          ) {
            setMessages((prev) =>
              prev.some((item) => item.id === msg.id) ? prev : [...prev, msg]
            );
            if (msg.sender_id === selectedId) {
              markMessagesRead(user.id, selectedId).catch(() => null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedId]);

  const handleSend = async () => {
    if (!user || !selectedId) return;
    if (!input.trim()) return;
    const content = input.trim();
    setInput("");
    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      sender_id: user.id,
      receiver_id: selectedId,
      body: content,
      created_at: new Date().toISOString(),
      read_at: null
    };
    setMessages((prev) => [...prev, tempMessage]);
    try {
      const saved = (await sendMessage(user.id, selectedId, content)) as Message;
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? saved : msg))
      );
    } catch (error: any) {
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      toast.error(error.message ?? "Failed to send message");
    }
  };

  if (!profiles.length) {
    return (
      <EmptyState
        title="No users yet"
        description="Once more people sign up, you can chat here."
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="card-sheen rounded-3xl p-4 space-y-3">
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
          People
        </div>
        <div className="space-y-2">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => setSelectedId(profile.id)}
              className={`w-full text-left px-4 py-3 rounded-2xl text-sm ${
                profile.id === selectedId ? "bg-white/10" : "bg-white/5"
              }`}
            >
              {profile.full_name ?? "IPL Fan"}
            </button>
          ))}
        </div>
      </div>

      <div className="card-sheen rounded-3xl p-5 flex flex-col gap-4 min-h-[420px]">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">
            {activeProfile?.full_name ?? "Chat"}
          </div>
          {activeProfile && (
            <Link
              className="text-xs uppercase tracking-[0.2em] text-slate-400"
              to={`/users/${activeProfile.id}`}
            >
              View Profile
            </Link>
          )}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto scrollbar-hide pr-2">
          {messages.length === 0 ? (
            <div className="text-sm text-slate-400">No messages yet.</div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                  msg.sender_id === user?.id
                    ? "ml-auto bg-white/10"
                    : "bg-white/5"
                }`}
              >
                {msg.body}
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <input
            className="flex-1 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm"
            placeholder="Type a message"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSend();
              }
            }}
          />
          <button
            className="px-4 py-2 rounded-2xl bg-accent-gradient text-ink text-xs uppercase tracking-[0.2em]"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
