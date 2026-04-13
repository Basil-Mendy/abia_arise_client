import { useState } from 'react'
import './LoginPage.css'
import IndividualLogin from '../components/IndividualLogin'
import GroupLogin from '../components/GroupLogin'
import AdminLogin from '../components/AdminLogin'

export default function LoginPage() {
    // State to track which login type is selected
    const [loginType, setLoginType] = useState('individual')

    return (
        <div className="login-page">
            <div className="login-container">
                <h1 className="login-title">ABIA ARISE LOGIN</h1>
                <p className="login-subtitle">Access your account</p>

                {/* Login Type Selector */}
                <div className="login-type-selector">
                    <button
                        className={`login-type-btn ${loginType === 'individual' ? 'active' : ''}`}
                        onClick={() => setLoginType('individual')}
                    >
                        Individual Member
                    </button>
                    <button
                        className={`login-type-btn ${loginType === 'group' ? 'active' : ''}`}
                        onClick={() => setLoginType('group')}
                    >
                        Pro-Group
                    </button>
                    <button
                        className={`login-type-btn ${loginType === 'admin' ? 'active' : ''}`}
                        onClick={() => setLoginType('admin')}
                    >
                        Administrator
                    </button>
                </div>

                {/* Conditional Rendering of Login Forms */}
                <div className="login-form-wrapper">
                    {loginType === 'individual' && <IndividualLogin />}
                    {loginType === 'group' && <GroupLogin />}
                    {loginType === 'admin' && <AdminLogin />}
                </div>

                {/* Don't have an account? */}
                <div className="login-footer">
                    <p>Don't have an account? <a href="/register">Register here</a></p>
                </div>
            </div>
        </div>
    )
}
