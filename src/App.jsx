import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MemberDashboard from './pages/MemberDashboard'
import GroupDashboard from './pages/GroupDashboard'
import AdminDashboard from './pages/AdminDashboard'
import LeadershipPage from './pages/LeadershipPage'

function AppContent() {
    const location = useLocation()
    const isDashboard = ['/member-dashboard', '/group-dashboard', '/admin-dashboard'].includes(location.pathname)

    return (
        <>
            {!isDashboard && <Navbar />}
            <main>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/leadership" element={<LeadershipPage />} />
                    <Route path="/member-dashboard" element={<MemberDashboard />} />
                    <Route path="/group-dashboard" element={<GroupDashboard />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                </Routes>
            </main>
            {!isDashboard && <Footer />}
        </>
    )
}

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppContent />
        </Router>
    )
}

export default App
