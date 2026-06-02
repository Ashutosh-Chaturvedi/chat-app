"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "../lib/api";
import { getToken, clearTokens, isAuthenticated } from "../lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomName, setRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchRooms();
  }, []);

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

  const createRoom = async (e) => {
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
      fetchRooms();
    } catch (err) {
      setError("Failed to create room");
    }
  };

  const joinRoom = async (e) => {
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
      fetchRooms();
    } catch (err) {
      setError("Failed to join room");
    }
  };

  const logout = () => {
    clearTokens();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-violet-400">Chat System</h1>
        <button
          onClick={logout}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left — actions */}
        <div className="space-y-6">
          {/* Create room */}
          <div className="bg-gray-900 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase mb-3">
              Create Room
            </h2>
            <form onSubmit={createRoom} className="space-y-3">
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Room name"
                className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Create
              </button>
            </form>
          </div>

          {/* Join room */}
          <div className="bg-gray-900 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase mb-3">
              Join Room
            </h2>
            <form onSubmit={joinRoom} className="space-y-3">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter room code"
                className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                type="submit"
                className="w-full bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Right — rooms list */}
        <div className="md:col-span-2">
          <h2 className="text-sm font-semibold text-gray-400 uppercase mb-3">
            Your Rooms
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {rooms.length === 0 ? (
            <div className="bg-gray-900 rounded-xl p-8 text-center text-gray-500">
              No rooms yet. Create or join one.
            </div>
          ) : (
            <div className="space-y-3">
              {rooms.map((room: any) => (
                <div
                  key={room.id}
                  onClick={() => router.push(`/chat/${room.id}`)}
                  className="bg-gray-900 hover:bg-gray-800 rounded-xl p-4 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-white">
                      {room.is_direct ? "DM" : room.name}
                    </p>
                    {!room.is_direct && (
                      <p className="text-xs text-gray-500 mt-1">
                        Code: {room.code}
                      </p>
                    )}
                  </div>
                  <span className="text-gray-600 text-sm">→</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}