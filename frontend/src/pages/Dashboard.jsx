
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useLocation, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { studentId, roomId } = location.state || {};

  const [student, setStudent] = useState({
    name: "",
    standard: "",
    division: "",
    email: "",
  });

  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const profileFields = ["name", "standard", "division", "email"];
  const completed = profileFields.filter((f) => student[f]);
  const progress = (completed.length / profileFields.length) * 100;

  // Load student info on component mount
  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/auth/profile', {
          method: 'GET',
          credentials: 'include', // Important for session cookies
        });

        if (!response.ok) {
          // If not authenticated, redirect to login
          if (response.status === 401) {
            navigate('/');
            return;
          }
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setStudent({
          name: data.name || "",
          standard: data.standard || "",
          division: data.division || "",
          email: data.email || "",
        });

        if (data.marks && Array.isArray(data.marks)) {
          setMarks(data.marks);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(student),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const data = await response.json();
      alert("Profile updated successfully!");
      
      // Update localStorage
      const storedInfo = localStorage.getItem("studentInfo");
      if (storedInfo) {
        const parsedInfo = JSON.parse(storedInfo);
        localStorage.setItem("studentInfo", JSON.stringify({
          ...parsedInfo,
          name: data.name,
          standard: data.standard,
          division: data.division,
          email: data.email
        }));
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile: " + err.message);
    }
  };

  if (loading) {
    return <div className="text-center p-5">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-5 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white shadow-xl rounded-2xl p-5 w-full max-w-sm mx-auto max-h-[90vh] overflow-y-auto text-sm">
      {/* Profile Card */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-indigo-600">Student Profile</h2>
        <p><strong>Student ID:</strong> {studentId || "N/A"}</p>
        <p><strong>Room ID:</strong> {roomId || "N/A"}</p>
        <p><strong>Name:</strong> {student.name || "N/A"}</p>
        <p><strong>Standard:</strong> {student.standard || "N/A"}</p>
        <p><strong>Division:</strong> {student.division || "N/A"}</p>
        <p><strong>Email:</strong> {student.email || "N/A"}</p>
        <div className="mt-3">
          <div className="h-2 w-full bg-gray-200 rounded">
            <div className="h-2 bg-green-500 rounded" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs mt-1 text-gray-500">
            Profile Completion: {Math.round(progress)}%
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleUpdate} className="mb-6">
        <h3 className="text-md font-semibold mb-2">Edit Profile</h3>
        {profileFields.map((field) => (
          <input
            key={field}
            type="text"
            name={field}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={student[field]}
            onChange={(e) => setStudent({ ...student, [field]: e.target.value })}
            className="w-full p-2 mb-2 border border-gray-300 rounded text-sm"
          />
        ))}
        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-2">
          Update
        </button>
      </form>

      {/* Performance Chart */}
      <div>
        <h3 className="text-md font-semibold mb-2">Marks Performance</h3>
        {marks.length > 0 ? (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={marks}>
              <XAxis dataKey="test" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-4">No marks data available</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;