import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import MyUnits from './pages/MyUnits';
import UploadMaterial from './pages/UploadMaterial';

function App() {
  return (
    <Router>
      <Routes>
        {/* The home page (Landing) */}
        <Route path="/" element={<Landing />} />
        
        {/* The dashboard page (My Units) */}
        <Route path="/my-units" element={<MyUnits />} />
        {/* The upload page (Upload Material) */}
        <Route path="/upload-material" element={<UploadMaterial />} />
        
      </Routes>
    </Router>
  );
}

export default App;