import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { LogIn } from 'lucide-react'
import { setAuthToken, debugAuthStorage } from '../utils/authUtils'
import { getFullURL } from '../utils/apiConfig'

export default function AdminLogin() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
    const [message, setMessage] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            console.log('Attempting admin login...')
            // Call admin login API endpoint
            const response = await axios.post(
                getFullURL('/api/auth/admin/login/'),
                {
                    email: formData.email,
                    password: formData.password,
                }
            )

            console.log('📨 Backend response:', {
                status: response.status,
                hasToken: !!response.data.token,
                token: response.data.token,
                tokenType: typeof response.data.token,
                hasAdmin: !!response.data.admin,
                fullResponse: response.data
            })

            console.log('Login successful:', response.data)

            // Store token and admin info
            setAuthToken(response.data.token)
            localStorage.setItem('admin', JSON.stringify(response.data.admin))
            localStorage.setItem('userType', 'admin')

            // Debug logging
            console.log('✅ Admin login successful, auth data stored')
            debugAuthStorage()

            // Navigate immediately to admin dashboard
            navigate('/admin-dashboard')
        } catch (error) {
            // Log the full error for debugging
            console.error('Admin login error:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            })

            setMessage({
                type: 'error',
                text: error.response?.data?.detail || error.message || 'Login failed. Please check your email and password.'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="login-form">
            <h3 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--primary-color)' }}>
                Administrator Login
            </h3>

            {message && (
                <div className={`form-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="form-input"
                    disabled={loading}
                    required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                    Your admin email address
                </small>
            </div>

            <div className="form-group">
                <label className="form-label">Password</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="form-input"
                    disabled={loading}
                    required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                    Your secure admin password
                </small>
            </div>

            <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
                <LogIn size={20} />
                {loading ? 'Logging in...' : 'Login'}
            </button>

            <p style={{ marginTop: '15px', fontSize: '13px', color: '#666', textAlign: 'center' }}>
                💡 Tip: This login is for superusers and admins only. Contact the main administrator if you don't have credentials.
            </p>
        </form>
    )
}
