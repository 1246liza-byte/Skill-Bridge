import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Public pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Students from './pages/public/Students';
import StudentProfile from './pages/public/StudentProfile';
import Projects from './pages/public/Projects';
import ProjectDetails from './pages/public/ProjectDetails';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';
import Privacy from './pages/public/Privacy';
import Terms from './pages/public/Terms';
import NotFound from './pages/public/NotFound';

// Student panel
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfilePage from './pages/student/StudentProfilePage';
import StudentProjects from './pages/student/StudentProjects';
import StudentProposals from './pages/student/StudentProposals';
import StudentOffers from './pages/student/StudentOffers';
import StudentHires from './pages/student/StudentHires';

// Client panel
import ClientDashboard from './pages/client/ClientDashboard';
import ClientProfilePage from './pages/client/ClientProfilePage';
import ClientProjects from './pages/client/ClientProjects';
import ClientProjectForm from './pages/client/ClientProjectForm';
import ClientProposals from './pages/client/ClientProposals';
import ClientOffers from './pages/client/ClientOffers';
import ClientHires from './pages/client/ClientHires';
import ClientSavedStudents from './pages/client/ClientSavedStudents';

// Admin panel
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProjects from './pages/admin/AdminProjects';
import AdminCategories from './pages/admin/AdminCategories';
import AdminSkills from './pages/admin/AdminSkills';
import AdminBanners from './pages/admin/AdminBanners';
import AdminContent from './pages/admin/AdminContent';
import AdminReports from './pages/admin/AdminReports';
import AdminMessages from './pages/admin/AdminMessages';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

// Shared
import Messages from './pages/shared/Messages';
import Notifications from './pages/shared/Notifications';
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/routing/ProtectedRoute';

function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="app-loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/students" element={<Students />} />
                <Route path="/students/:id" element={<StudentProfile />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetails />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Route>

            {/* Student panel */}
            <Route
                path="/student"
                element={
                    <ProtectedRoute role="student">
                        <DashboardLayout role="student" />
                    </ProtectedRoute>
                }
            >
                <Route index element={<StudentDashboard />} />
                <Route path="profile" element={<StudentProfilePage />} />
                <Route path="projects" element={<StudentProjects />} />
                <Route path="proposals" element={<StudentProposals />} />
                <Route path="offers" element={<StudentOffers />} />
                <Route path="hires" element={<StudentHires />} />
                <Route path="messages" element={<Messages />} />
                <Route path="notifications" element={<Notifications />} />
            </Route>

            {/* Client panel */}
            <Route
                path="/client"
                element={
                    <ProtectedRoute role="client">
                        <DashboardLayout role="client" />
                    </ProtectedRoute>
                }
            >
                <Route index element={<ClientDashboard />} />
                <Route path="profile" element={<ClientProfilePage />} />
                <Route path="projects" element={<ClientProjects />} />
                <Route path="projects/new" element={<ClientProjectForm />} />
                <Route path="projects/:id/edit" element={<ClientProjectForm />} />
                <Route path="proposals" element={<ClientProposals />} />
                <Route path="offers" element={<ClientOffers />} />
                <Route path="hires" element={<ClientHires />} />
                <Route path="saved-students" element={<ClientSavedStudents />} />
                <Route path="messages" element={<Messages />} />
                <Route path="notifications" element={<Notifications />} />
            </Route>

            {/* Admin panel */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute role="admin">
                        <DashboardLayout role="admin" />
                    </ProtectedRoute>
                }
            >
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="skills" element={<AdminSkills />} />
                <Route path="banners" element={<AdminBanners />} />
                <Route path="content" element={<AdminContent />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="audit-logs" element={<AdminAuditLogs />} />
                <Route path="notifications" element={<Notifications />} />
            </Route>

            {/* Fallback: redirect logged-in users to their dashboard */}
            <Route
                path="*"
                element={
                    user ? (
                        <Navigate to={`/${user.role}`} replace />
                    ) : (
                        <NotFound />
                    )
                }
            />
        </Routes>
    );
}

export default App;