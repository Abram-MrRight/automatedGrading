// import { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Grades from "../pages/Grades";
import Feedback from "../pages/Feedback";
import Review from "../pages/Review";
import Rubrics from "../pages/Rubrics";
import Reports from "../pages/Reports";
import NotFound from "../pages/NotFound";
import ManageExams from "../pages/ManageExams";
import Students from "../components/educator/StudentList"
import Student from "../pages/Student";
import EducatorDashboard from "../pages/EducatorDashboard";
import StudentDashboard from "../pages/StudentDashboard";
import AnalysticsDashboard from "../components/educator/AnalysticsDashboard";
import CourseDashboard from "../components/educator/courseDashboard";
import GradingScreen from "../components/educator/GradingScreen";
import Submission from "../components/educator/SUbmissionScreen"
import Exam from "../components/educator/ExamScreen"

const AppRoutes = () => {

  return (
    <Router>
      <Routes>
          <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/manage-exams" element={<ManageExams />} />
            <Route path="/grades" element={<Grades />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/review" element={<Review />} />
            <Route path="/rubrics" element={<Rubrics />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/students" element={<Student />} />

            {/* educator */}
            <Route path="/educator-dashboard" element={<EducatorDashboard />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path= "/course" element={<CourseDashboard />} />
            <Route path="/grading" element={<GradingScreen />} />
            <Route path="/submission" element={<Submission />} />
            <Route path="/analytics" element={<AnalysticsDashboard />} />
            <Route path= "/student" element={<Students />} />
            <Route path ="/exam" element={<Exam />} />

            {/* student */}

          <Route path="*" element={<NotFound />} />
        </Routes>
    </Router>
  );
};

export default AppRoutes;
