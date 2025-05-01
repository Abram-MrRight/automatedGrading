// import { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Submission from "../pages/Submission";
import Grades from "../pages/Grades";
import Review from "../pages/Review";
import PrivateRoute from "../components/PrivateRoute";
import NotFound from "../pages/NotFound";
import DashboardLayout from "../components/DashboardLayout";
import ManageExams from "../pages/ManageExams";
import Students from "../pages/Students";
import Student from "../pages/Student";
import Courses from "../pages/Courses";
import Registration from "../pages/Registration";
import Profile from "../pages/Profile";

const AppRoutes = () => {

  return (
    <Router>
      <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route element={<PrivateRoute allowedRoles={['student', 'educator']}><DashboardLayout /></PrivateRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/manage-exams" element={<ManageExams />} />
            <Route path="/submission" element={<Submission />} />
            <Route path="/grades" element={<Grades />} />
            <Route path="/review" element={<Review />} />
            <Route path="/students" element={<Students />} />
            <Route path="/student/:id" element={<Student />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
    </Router>
  );
};

export default AppRoutes;
