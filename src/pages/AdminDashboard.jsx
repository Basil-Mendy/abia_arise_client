import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Users2, FileText, Mail, LogOut } from 'lucide-react'
import './AdminDashboard.css'
import MemberManagement from '../components/admin/MemberManagement'
import GroupManagement from '../components/admin/GroupManagement'
import ContentManagement from '../components/admin/ContentManagement'
import MessagingSystem from '../components/admin/MessagingSystem'

export default function AdminDashboard() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('members')
    const [admin, setAdmin] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check if user is logged in as admin
        const adminData = localStorage.getItem('admin')
        const userType = localStorage.getItem('userType')

        if (!adminData || userType !== 'admin') {
            navigate('/login')
            return
        }

        setAdmin(JSON.parse(adminData))
        setLoading(false)
    }, [navigate])

    const handleLogout = () => {
        localStorage.removeItem('authToken')
        localStorage.removeItem('admin')
        localStorage.removeItem('userType')
        navigate('/login')
    }

    if (loading) {
        return <div className="admin-loading"><p>Loading...</p></div>
    }

    return (
        <div className="admin-dashboard">
            {/* Header */}
            <header className="admin-header">
                <div className="admin-header-content">
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p className="admin-subtitle">Manage members, groups, content and messaging</p>
                    </div>
                    <div className="admin-user-info">
                        <div className="user-details">
                            <span className="user-name">{admin?.first_name || admin?.username || 'Administrator'}</span>
                            <span className="user-role">{admin?.is_superuser ? 'Superuser' : 'Admin'}</span>
                        </div>
                        <button className="btn-logout" onClick={handleLogout}>
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="admin-nav">
                <button
                    className={`admin-tab ${activeTab === 'members' ? 'active' : ''}`}
                    onClick={() => setActiveTab('members')}
                >
                    <Users size={20} /> Members
                </button>
                <button
                    className={`admin-tab ${activeTab === 'groups' ? 'active' : ''}`}
                    onClick={() => setActiveTab('groups')}
                >
                    <Users2 size={20} /> Groups
                </button>
                <button
                    className={`admin-tab ${activeTab === 'content' ? 'active' : ''}`}
                    onClick={() => setActiveTab('content')}
                >
                    <FileText size={20} /> Content
                </button>
                <button
                    className={`admin-tab ${activeTab === 'messaging' ? 'active' : ''}`}
                    onClick={() => setActiveTab('messaging')}
                >
                    <Mail size={20} /> Messaging
                </button>
            </nav>

            {/* Content Section */}
            <main className="admin-content">
                {activeTab === 'members' && <MemberManagement />}
                {activeTab === 'groups' && <GroupManagement />}
                {activeTab === 'content' && <ContentManagement />}
                {activeTab === 'messaging' && <MessagingSystem />}
            </main>
        </div>
    )
}
