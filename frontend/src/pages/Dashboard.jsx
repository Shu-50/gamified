// import { useState } from "react";
// import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
// import { useLocation } from "react-router-dom";


// const Dashboard = ({studentId}) => {
//   const location = useLocation();
//   const { studentId, roomId } = location.state || {}; // safely access


//   const [student, setStudent] = useState({
//     name: studentId || "Unknown",
//     standard: "",
//     division: "",
//     email: "",
//   });

//   const marks = [
//     { test: "Unit Test 1", score: 75 },
//     { test: "Unit Test 2", score: 82 },
//     { test: "Mid Sem", score: 70 },
//     { test: "Final", score: 90 },
//   ];

//   const handleUpdate = (updatedData) => {
//     setStudent(updatedData);
//   };

//   const profileFields = ["name", "standard", "division", "email"];
//   const completed = profileFields.filter((f) => student[f]);
//   const progress = (completed.length / profileFields.length) * 100;


// return (
//   <div className="bg-white shadow-xl rounded-xl p-4 w-[320px] max-h-[90vh] overflow-y-auto">
//     {/* Profile Card */}
//     <div className="mb-4">
//       <h2 className="text-lg font-bold mb-2">Student Profile</h2>
//       <p><strong>Name:</strong> {student.name}</p>
//       <p><strong>Standard:</strong> {student.standard}</p>
//       <p><strong>Division:</strong> {student.division}</p>
//       <p><strong>Email:</strong> {student.email}</p>
//       <div className="mt-3">
//         <div className="h-2 w-full bg-gray-200 rounded">
//           <div
//             className="h-2 bg-green-500 rounded"
//             style={{ width: `${progress}%` }}
//           ></div>
//         </div>
//         <p className="text-xs mt-1">Profile Completion: {Math.round(progress)}%</p>
//       </div>
//     </div>

//     {/* Edit Form */}
//     <form
//       onSubmit={(e) => {
//         e.preventDefault();
//         handleUpdate(student);
//       }}
//       className="mb-4"
//     >
//       <h3 className="text-md font-semibold mb-2">Edit Profile</h3>
//       {profileFields.map((field) => (
//         <input
//           key={field}
//           type="text"
//           name={field}
//           placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
//           value={student[field]}
//           onChange={(e) =>
//             setStudent({ ...student, [field]: e.target.value })
//           }
//           className="w-full p-1 border mt-1 rounded text-sm"
//         />
//       ))}
//       <button className="mt-3 bg-blue-500 text-white px-3 py-1 rounded text-sm">
//         Update
//       </button>
//     </form>

//     {/* Performance Chart */}
//     <div>
//       <h3 className="text-md font-semibold mb-2">Marks Performance</h3>
//       <ResponsiveContainer width="100%" height={150}>
//         <LineChart data={marks}>
//           <XAxis dataKey="test" />
//           <YAxis />
//           <Tooltip />
//           <Line type="monotone" dataKey="score" stroke="#3b82f6" />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   </div>
// );
// }

// export default Dashboard;
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useLocation } from "react-router-dom";

const Dashboard = () => {
  const location = useLocation();
  const { studentId = "", roomId = "" } = location.state || {};

  const [student, setStudent] = useState({
    name: "",
    standard: "",
    division: "",
    email: "",
  });

  const profileFields = ["name", "standard", "division", "email"];
  const completed = profileFields.filter((f) => student[f]);
  const progress = (completed.length / profileFields.length) * 100;

  const marks = [
    { test: "Unit Test 1", score: 75 },
    { test: "Unit Test 2", score: 82 },
    { test: "Mid Sem", score: 70 },
    { test: "Final", score: 90 },
  ];

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (!studentId) return;
      try {
        const res = await fetch(`/api/student/${studentId}`);
        const data = await res.json();
        setStudent(data);
      } catch (err) {
        console.error("Error fetching student details:", err);
      }
    };

    fetchStudentDetails();
  }, [studentId]);

  const handleUpdate = (e) => {
    e.preventDefault();
    // Optional: POST update to server here
    console.log("Updated student info:", student);
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-5 w-full max-w-sm mx-auto max-h-[90vh] overflow-y-auto text-sm">
      {/* Profile Card */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-indigo-600">Student Profile</h2>
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
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-2">
          Update
        </button>
      </form>

      {/* Performance Chart */}
      <div>
        <h3 className="text-md font-semibold mb-2">Marks Performance</h3>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={marks}>
            <XAxis dataKey="test" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
