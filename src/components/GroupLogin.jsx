import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { LogIn } from 'lucide-react'

export default function GroupLogin() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        group_license_number: '',
        phone_last_four: '', // Last 4 digits of chairman or secretary phone
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
                'http://localhost:8000/api/auth/groups/login/',
                {
                    group_license_number: formData.group_license_number,
                    password: formData.phone_last_four, // API expects password field (last 4 digits)
                }
            )

            // Store token and user data
            localStorage.setItem('authToken', response.data.token)
            localStorage.setItem('user', JSON.stringify(response.data.user))
            localStorage.setItem('userType', 'group')
            localStorage.setItem('userRole', response.data.user.role)

            setMessage({
                type: 'success',
                text: 'Login successful! Redirecting...'
            })

            // Redirect to group dashboard
            setTimeout(() => {
                navigate('/group-dashboard')
            }, 1500)
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
                Pro-Group Login
            </h3>

            {message && (
                <div className={`form-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="form-group">
                <label className="form-label">Group License Number</label>
                <input
                    type="text"
                    name="group_license_number"
                    value={formData.group_license_number}
                    onChange={handleChange}
                    placeholder="e.g., GL12345678"
                    className="form-input"
                    disabled={loading}
                    required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                    Your group's unique license number (starts with 'GL')
                </small>
            </div>

            <div className="form-group">
                <label className="form-label">Last 4 Digits of Group Admin Phone</label>
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
                    Last 4 digits of your chairman or secretary phone number
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
                💡 Tip: Only group chairman/secretary can log in. Use the credentials you registered with.
            </p>
        </form>
    )
}
