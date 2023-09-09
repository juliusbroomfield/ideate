import React from 'react'; 
import './App.css';
import LoginPage from "./components/LoginPage";
import VideoRecorder from "./components/video"; // Import the VideoRecorder component

import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VideoRecorder />} /> {/* Make VideoRecorder the default component */}
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
