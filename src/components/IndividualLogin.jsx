import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { LogIn } from 'lucide-react'
import { setAuthToken, debugAuthStorage } from '../utils/authUtils'
import { getFullURL } from '../utils/apiConfig'

export default function IndividualLogin() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        abia_arise_id: '',
        phone_last_four: '', // Last 4 digits of phone
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
            // Call login API endpoint
            const response = await axios.post(
                getFullURL('/api/auth/members/login/'),
                {
                    abia_arise_id: formData.abia_arise_id,
                    password: formData.phone_last_four, // API expects password field
                }
            )

            console.log('📨 Backend response:', {
                status: response.status,
                hasToken: !!response.data.token,
                token: response.data.token,
                tokenType: typeof response.data.token,
                hasUser: !!response.data.user,
                fullResponse: response.data
            })

            // Store token and user data
            setAuthToken(response.data.token)
            localStorage.setItem('user', JSON.stringify(response.data.user))
            localStorage.setItem('userType', 'individual')

            // Debug logging
            console.log('✅ Login successful, auth data stored')
            debugAuthStorage()

            // Navigate immediately to member dashboard
            navigate('/member-dashboard')
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || error.response?.data?.detail || 'Login failed. Please check your credentials.'
            })
            console.error('Login error:', error.response?.data)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="login-form">
            <h3 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--primary-color)' }}>
                Individual Member Login
            </h3>

            {message && (
                <div className={`form-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="form-group">
                <label className="form-label">Abia Arise ID</label>
                <input
                    type="text"
                    name="abia_arise_id"
                    value={formData.abia_arise_id}
                    onChange={handleChange}
                    placeholder="e.g., AA12345678"
                    className="form-input"
                    disabled={loading}
                    required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                    Your unique Abia Arise ID (starts with 'AB')
                </small>
            </div>

            <div className="form-group">
                <label className="form-label">Last 4 Digits of Phone</label>
                <input
                    type="text"
                    name="phone_last_four"
                    value={formData.phone_last_four}
                    onChange={handleChange}
                    placeholder="e.g., 1234"
                    maxLength="4"
                    className="form-input"
                    disabled={loading}
                    required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                    The last 4 digits of your registered phone number
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
                💡 Tip: Your login credentials are your Abia Arise ID and the last 4 digits of your phone number
            </p>
        </form>
    )
}
