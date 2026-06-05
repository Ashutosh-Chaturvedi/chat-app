"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { API_URL, WS_URL } from "../lib/api";
import { getToken, clearTokens, isAuthenticated } from "../lib/auth";

type Room = {
  id: string;
  name: string;
  code: string;
  is_direct: boolean;
  member_count: number;
  last_message?: string | null;
  last_activity?: string | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomName, setRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  // Controls mobile view: "sidebar" | "chat"
  const [mobileView, setMobileView] = useState<"sidebar" | "chat">("sidebar");

  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const selectedRoomRef = useRef<any>(null);

  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchRooms();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openRoom = async (room: any) => {
    setSelectedRoom(room);
    setMobileView("chat");
    await fetchMessages(room.id);
    await fetchMembers(room.id);
    connectWebSocket(room.id);
  };

  const goBackToSidebar = () => {
    setMobileView("sidebar");
  };

  const fetchMembers = async (roomId: string) => {
    try {
      const response = await fetch(`${API_URL}/rooms/${roomId}/members`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      setMembers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCurrentUser = async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await response.json();
    setCurrentUser(data);
  };

  const fetchMessages = async (roomId: string) => {
    try {
      const response = await fetch(`${API_URL}/rooms/${roomId}/messages`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!response.ok) return;
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const connectWebSocket = (roomId: string) => {
    if (wsRef.current) wsRef.current.close();
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);

    const token = getToken();
    const ws = new WebSocket(`${WS_URL}/ws/${roomId}?token=${token}`);

    ws.onopen = () => {
      setConnected(true);
      heartbeatRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send("ping");
      }, 30000);
    };

    ws.onmessage = (event) => {
      if (event.data === "pong") return;
      try {
        const message = JSON.parse(event.data);
        setMessages((prev) => [...prev, message]);

        const activeRoomId = selectedRoomRef.current?.id;
        setRooms((prevRooms) => {
          const updated = prevRooms.map((room) =>
            room.id === activeRoomId
              ? { ...room, last_message: message.content, last_activity: message.created_at }
              : room
          );
          const active = updated.find((room) => room.id === activeRoomId);
          const others = updated.filter((room) => room.id !== activeRoomId);
          return active ? [active, ...others] : updated;
        });
      } catch (err) {
        console.error("Failed to parse message", err);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };

    wsRef.current = ws;
  };

  const sendMessage = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!input.trim() || !wsRef.current) return;
    if (wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(input);
    setInput("");
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${API_URL}/users/me/rooms`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!response.ok) {
        clearTokens();
        router.push("/login");
        return;
      }
      const data = await response.json();
      setRooms(data);
    } catch (err) {
      setError("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    try {
      const response = await fetch(`${API_URL}/rooms/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name: roomName }),
      });
      if (!response.ok) return;
      setRoomName("");
      setShowCreate(false);
      fetchRooms();
    } catch (err) {
      setError("Failed to create room");
    }
  };

  const joinRoom = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    try {
      const response = await fetch(`${API_URL}/rooms/${joinCode}/members`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!response.ok) {
        setError("Room not found");
        return;
      }
      setJoinCode("");
      setShowJoin(false);
      fetchRooms();
    } catch (err) {
      setError("Failed to join room");
    }
  };

  const logout = () => {
    clearTokens();
    router.push("/login");
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSeconds < 60) return "Just now";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  const Sidebar = (
    <aside className="flex flex-col h-full bg-white w-full">
      {/* Header */}
      <div className="border-b border-stone-100 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-stone-900">Convo</h1>
            <p className="mt-0.5 text-sm text-stone-500">Real-time messaging</p>
          </div>
          <button
            onClick={logout}
            className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-2">
        <button
          onClick={() => { setShowCreate(!showCreate); setShowJoin(false); }}
          className="w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-700 active:bg-violet-800"
        >
          New Room
        </button>

        {showCreate && (
          <form
            onSubmit={createRoom}
            className="rounded-xl border border-stone-200 bg-stone-50 p-3"
          >
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Room name"
              className="mb-2 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-violet-600 py-2 text-sm text-white"
            >
              Create
            </button>
          </form>
        )}

        <button
          onClick={() => { setShowJoin(!showJoin); setShowCreate(false); }}
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50 active:bg-stone-100"
        >
          Join Room
        </button>

        {showJoin && (
          <form
            onSubmit={joinRoom}
            className="rounded-xl border border-stone-200 bg-stone-50 p-3"
          >
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Room code"
              className="mb-2 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-stone-900 py-2 text-sm text-white"
            >
              Join
            </button>
          </form>
        )}

        {error && (
          <p className="text-xs text-red-500 px-1">{error}</p>
        )}
      </div>

      {/* Room list label */}
      <div className="border-t border-stone-100 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
          Rooms
        </p>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 && (
          <p className="px-4 py-6 text-sm text-stone-400 text-center">
            No rooms yet. Create or join one.
          </p>
        )}
        {rooms.map((room: any) => (
          <button
            key={room.id}
            onClick={() => openRoom(room)}
            className={`w-full border-b border-stone-100 px-4 py-4 text-left transition
              ${
                selectedRoom?.id === room.id
                  ? "bg-violet-50 border-l-4 border-l-violet-600"
                  : "hover:bg-stone-50 active:bg-stone-100"
              }`}
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-stone-900">
                  {room.is_direct ? "Direct Message" : room.name}
                </p>
                <p className="mt-1 truncate text-sm text-stone-500">
                  {room.last_message || "No messages yet"}
                </p>
                {room.last_activity && (
                  <p className="text-xs text-stone-400 mt-0.5">
                    {formatTimeAgo(room.last_activity)}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-3 text-xs text-stone-400">
                  <span>
                    {room.member_count}{" "}
                    {room.member_count === 1 ? "member" : "members"}
                  </span>
                  {!room.is_direct && <span>Code: {room.code}</span>}
                </div>
              </div>
              <span className="ml-3 text-xs text-stone-400 mt-1">→</span>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );

  const ChatPanel = (
    <main className="flex flex-1 flex-col bg-stone-50 h-full overflow-hidden w-full">
      {!selectedRoom ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center px-6">
            <h2 className="text-2xl font-semibold text-stone-900">
              Select a conversation
            </h2>
            <p className="mt-2 text-stone-500 text-sm">
              Choose a room from the sidebar to start chatting.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Chat header */}
          <div className="border-b border-stone-200 bg-white px-4 py-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Back button — mobile only */}
              <button
                onClick={goBackToSidebar}
                className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-stone-100 transition-colors text-stone-600 flex-shrink-0"
                aria-label="Back to rooms"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-stone-900 truncate">
                  {selectedRoom.name}
                </h2>

                <div className="flex items-center gap-3 mt-0.5">
                  <p
                    className={`text-xs ${
                      connected
                        ? "text-emerald-500"
                        : "text-stone-400"
                    }`}
                  >
                    {connected ? "● Connected" : "○ Disconnected"}
                  </p>

                  <p className="text-xs text-stone-400">
                    {members.length} member
                    {members.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
            <div className="mx-auto w-full max-w-5xl space-y-3">
              {messages.map((msg: any) => {
                const isMe = currentUser && msg.sender_id === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-[80%] sm:max-w-[75%]">
                      {!isMe && (
                        <p className="mb-1 ml-1 text-xs font-medium text-violet-600">
                          {msg.sender_username}
                        </p>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2.5 ${
                          isMe
                            ? "bg-violet-600 text-white rounded-br-md"
                            : "bg-white border border-stone-200 text-stone-900 rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm break-words leading-relaxed">
                          {msg.content}
                        </p>
                      </div>
                      <p
                        className={`mt-1 text-xs text-stone-400 ${
                          isMe ? "text-right" : "ml-1"
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-stone-200 bg-white p-3 flex-shrink-0">
            <form
              onSubmit={sendMessage}
              className="mx-auto flex w-full max-w-5xl gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
              <button
                type="submit"
                disabled={!connected}
                className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700 active:bg-violet-800 disabled:opacity-50 transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </>
      )}
    </main>
  );

  const MembersPanel = (
    <aside className="hidden lg:flex w-[260px] border-l border-stone-200 bg-white flex-col">
      <div className="border-b border-stone-100 p-5">
        <h3 className="font-medium text-stone-900">
          Members
        </h3>

        <p className="mt-1 text-sm text-stone-500">
          {members.length} member
          {members.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!selectedRoom ? (
          <div className="p-6 text-sm text-stone-400">
            Select a room
          </div>
        ) : (
          members.map((member: any) => (
            <div
              key={member.id}
              className="flex items-center gap-3 px-5 py-3 hover:bg-stone-50"
            >
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-medium text-violet-700">
                  {member.username.slice(0, 2).toUpperCase()}
                </div>

                <div
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                    member.online
                      ? "bg-green-500"
                      : "bg-stone-300"
                  }`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-900">
                  {member.username}
                </p>

                <p className="text-xs text-stone-500">
                  {member.online ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );

  return (
    <div className="h-screen bg-stone-50 overflow-hidden">
      <div className="flex h-full">
        {/* Sidebar: full screen on mobile when mobileView==="sidebar", fixed width on desktop */}
        <div
          className={`
            h-full flex-shrink-0
            w-full md:w-[320px] md:border-r md:border-stone-200
            ${mobileView === "sidebar" ? "flex" : "hidden md:flex"}
          `}
        >
          {Sidebar}
        </div>

        {/* Chat panel: full screen on mobile when mobileView==="chat", flex-1 on desktop */}
        <div
          className={`
            h-full flex-1
            ${mobileView === "chat" ? "flex" : "hidden md:flex"}
          `}
        >
          {ChatPanel}
        </div>

        {MembersPanel}
      </div>
    </div>
  );
}