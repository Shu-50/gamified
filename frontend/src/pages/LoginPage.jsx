
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [studentId, setStudentId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch('/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ studentId, roomId, password }),
//       });
      
//       if (response.ok) {
//         navigate(`/classroom/${roomId}`)
         
//       if (response.ok) {
//         navigate(`/classroom/${roomId}`,{
//           state:{
//             studentId,
//             roomId,
//             },
//         })
//         };
//       } else {
//         alert('Login failed. Please check your credentials.');
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//     }
//     // After successful login and getting response
// localStorage.setItem("studentInfo", JSON.stringify({
//     id: response.data.studentId,
//     name: response.data.name
//   }));
  
//   };
const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, roomId, password }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Store user info locally
        localStorage.setItem("studentInfo", JSON.stringify({
          id: data.studentId,
          name: data.name
        }));
  
        // Navigate to classroom with state
        navigate(`/classroom/${roomId}`, {
          state: {
            studentId: data.studentId,
            roomId: roomId,
          },
        });
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };
  
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-indigo-600">Virtual Classroom</h1>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Student ID</label>
            <input
              id="studentId"
              name="studentId"
              type="text"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">Room ID</label>
            <input
              id="roomId"
              name="roomId"
              type="text"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Enter Classroom
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
