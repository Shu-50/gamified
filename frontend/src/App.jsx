// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import LoginPage from './pages/LoginPage';
// import ClassroomPage from './pages/ClassroomPage';

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<LoginPage />} />
//         <Route path="/classroom/:roomId" element={<ClassroomPage />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;


// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import GameScenePage from './pages/GameScenePage'; // 👈 new component that initializes Phaser
import Gamepg from './game/GameComponent'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/game" element={<Gamepg />} />
        <Route path="/classroom/:roomId" element={<GameScenePage />} />
        <Route path="/classroom/:roomId/dashboard" element={<Dashboard />} />
        
      </Routes>
    </Router>
  );
}

export default App;
