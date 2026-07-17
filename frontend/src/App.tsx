import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import MyUnits from './pages/MyUnits';
import UnitDashboard from './pages/UnitDashboard';
import UploadMaterial from './pages/UploadMaterial';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/my-units" element={<MyUnits />} />
        <Route path="/unit/:id" element={<UnitDashboard />} />
        
        {/* Maps both routes to the upload page so it works everywhere */}
        <Route path="/unit/:id/upload" element={<UploadMaterial />} />
        <Route path="/upload-material" element={<UploadMaterial />} />
        
        {/* SAFEGUARD: If any path doesn't match, auto-redirect back to My Units */}
        <Route path="*" element={<Navigate to="/my-units" replace />} />
      </Routes>
    </Router>
  );
}