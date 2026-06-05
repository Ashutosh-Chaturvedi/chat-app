"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_URL, WS_URL } from "../../lib/api";
import { getToken, isAuthenticated } from "../../lib/auth";

type Message = {
  id: string;
  sender_id: string;
  sender_username: string;
  content: string;
  created_at: string;
};

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
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





  return (
    <div className="flex h-screen bg-stone-50">
      {/* Main Chat */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="border-b border-stone-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-sm text-stone-500 transition hover:text-stone-900"
              >
                ← Back
              </button>

              <div>
                <h1 className="font-semibold text-stone-900">
                  {roomName || "Loading..."}
                </h1>

                <div className="mt-1 flex items-center gap-2 text-sm text-stone-500">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      connected
                        ? "bg-green-500"
                        : "bg-stone-400"
                    }`}
                  />

                  <span>
                    {connected
                      ? "Connected"
                      : "Disconnected"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {messages.length === 0 ? (
            <div className="mt-20 text-center">
              <h2 className="text-lg font-medium text-stone-800">
                No messages yet
              </h2>

              <p className="mt-2 text-stone-500">
                Start the conversation.
              </p>
            </div>
          ) : (
            <div className="mx-auto max-w-4xl space-y-4">
              {messages.map((msg) => {
                const isMe =
                  currentUser &&
                  msg.sender_id === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      isMe
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div className="max-w-[75%]">
                      {!isMe && (
                        <p className="mb-1 ml-1 text-xs font-medium text-violet-600">
                          {msg.sender_username}
                        </p>
                      )}

                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          isMe
                            ? "rounded-br-md bg-violet-600 text-white"
                            : "rounded-bl-md border border-stone-200 bg-white text-stone-900"
                        }`}
                      >
                        <p className="break-words text-sm leading-relaxed">
                          {msg.content}
                        </p>
                      </div>

                      <p
                        className={`mt-1 text-xs ${
                          isMe
                            ? "text-right text-stone-400"
                            : "ml-1 text-stone-400"
                        }`}
                      >
                        {new Date(
                          msg.created_at
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <div className="border-t border-stone-200 bg-white p-4">
          <form
            onSubmit={sendMessage}
            className="mx-auto flex max-w-4xl gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              placeholder="Type a message..."
              className="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />

            <button
              type="submit"
              disabled={!connected}
              className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}