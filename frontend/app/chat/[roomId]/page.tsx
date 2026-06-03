"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_URL } from "../../lib/api";
import { getToken, isAuthenticated } from "../../lib/auth";

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchHistory();
    connectWebSocket();
    fetchCurrentUser();
    fetchRoomName();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  const fetchRoomName = async () => {
    const response = await fetch(`${API_URL}/users/me/rooms`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    const rooms = await response.json();
    const room = rooms.find((r: any) => r.id === roomId);
    if (room) setRoomName(room.is_direct ? "Direct Message" : room.name);
  };


  const fetchCurrentUser = async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await response.json();
    setCurrentUser(data);
  };

  const fetchHistory = async () => {
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

  const connectWebSocket = () => {
    const token = getToken();
    const wsUrl = `ws://localhost:8000/ws/${roomId}?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnected(true);
      // heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send("ping");
        }
      }, 30000);
      heartbeatRef.current = heartbeat; 
    };

    ws.onmessage = (event) => {
      if (event.data === "pong") return;
      try {
        const message = JSON.parse(event.data);
        setMessages((prev) => [...prev, message]);
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

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !wsRef.current) return;
    if (wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(input);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-sm font-medium text-white">{roomName || "Loading..."}</h1>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              connected ? "bg-green-400" : "bg-gray-600"
            }`}
          />
          <span className="text-sm text-gray-400">
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-gray-600 mt-8">
            No messages yet. Say something.
          </p>
        ) : (
          messages.map((msg: any) => {
            const isMe = currentUser && msg.sender_id === currentUser.id;
            return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`rounded-xl px-4 py-3 max-w-lg ${isMe ? "bg-violet-600" : "bg-gray-900"}`}>
                    <p className="text-xs text-yellow-300 mb-1">{msg.sender_username}</p>
                    <p className="text-white text-sm">{msg.content}</p>
                    <p className="text-xs text-white/50 mt-1">
                    {new Date(msg.created_at).toLocaleTimeString()}
                    </p>
                </div>
                </div>
            );
            })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 px-6 py-4">
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-900 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 text-sm"
          />
          <button
            type="submit"
            disabled={!connected}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}