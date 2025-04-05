import { useState } from "react";

export default function HomePage() {
  const [studentId, setStudentId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    // call login/register API
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-100">
      <h1 className="text-3xl font-bold mb-4">Gamified Classroom Login</h1>
      <div className="bg-white p-6 rounded shadow-md w-80">
        <input type="text" className="input" placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
        <input type="text" className="input" placeholder="Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} />
        <input type="password" className="input" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="bg-blue-500 text-white p-2 rounded mt-4 w-full" onClick={handleSubmit}>Enter</button>
      </div>
    </div>
  );
}
