import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Manage from './pages/Manage';
import EditCourse from './pages/EditCourse';
import ManageCategories from './pages/ManageCategories';
import { CourseProvider } from './context/CourseContext';
import { CategoryProvider } from './context/CategoryContext';

function App() {
  return (
    <CategoryProvider>
      <CourseProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/manage" element={<Manage />} />
              <Route path="/edit/:id" element={<EditCourse />} />
              <Route path="/categories" element={<ManageCategories />} />
            </Routes>
          </div>
        </Router>
      </CourseProvider>
    </CategoryProvider>
  );
}

export default App;