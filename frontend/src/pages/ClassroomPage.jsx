import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function ClassroomPage() {
  const { roomId } = useParams();
  const [student, setStudent] = useState(null);
  const [position, setPosition] = useState({ x: 100, y: 100 });

  useEffect(() => {
    // Fetch student data
    fetchStudentData();

    // Set up keyboard listeners for movement
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const fetchStudentData = async () => {
    try {
      const response = await fetch('/api/student/profile');
      if (response.ok) {
        const data = await response.json();
        setStudent(data);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const handleKeyPress = (e) => {
    switch (e.key) {
      case 'ArrowUp':
        setPosition(prev => ({ ...prev, y: Math.max(0, prev.y - 10) }));
        break;
      case 'ArrowDown':
        setPosition(prev => ({ ...prev, y: Math.min(400, prev.y + 10) }));
        break;
      case 'ArrowLeft':
        setPosition(prev => ({ ...prev, x: Math.max(0, prev.x - 10) }));
        break;
      case 'ArrowRight':
        setPosition(prev => ({ ...prev, x: Math.min(800, prev.x + 10) }));
        break;
      default:
        break;
    }
  };

  if (!student) return <div className="p-8 text-center">Loading classroom...</div>;

  return (
    <div className="relative w-full h-screen bg-gray-200 overflow-hidden">
      {/* Top left student info */}
      <div className="absolute top-4 left-4 bg-white p-3 rounded-md shadow-md">
        Room: {roomId} | Student: {student.name || student.studentId}
      </div>

      {/* Classroom area */}
      <div className="absolute inset-0 bg-amber-50 mx-16 my-12 border-8 border-amber-700">
        {/* Teacher's desk */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-amber-700 w-40 h-12"></div>
      </div>

      {/* Student character */}
      <div
        className="absolute w-12 h-12 transition-all duration-100"
        style={{ left: position.x, top: position.y }}
      >
        <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center text-white">
          {(student.name || student.studentId).charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
  );
}

export default ClassroomPage;
