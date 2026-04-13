import React, { useState } from 'react';
import axios from 'axios';
import './MembershipRegistration.css';

const API_BASE_URL = 'http://localhost:8000/api';

const MembershipRegistration = () => {
    const [step, setStep] = useState('check'); // check, form, complete
    const [formData, setFormData] = useState({
        nin: '',
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
    });
    const [existingUser, setExistingUser] = useState(null);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Step 1: Check if user exists
    const handleCheckNIN = async () => {
        if (!formData.nin) {
            setError('Please enter your NIN');
            return;
        }

        if (!/^\d{11}$/.test(formData.nin)) {
            setError('NIN must be 11 digits');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_BASE_URL}/membership/users/check_exists/`, {
                nin: formData.nin,
            });

            if (response.data.exists) {
                setExistingUser(response.data);
                setGroups(response.data.groups || []);

                // Pre-fill form with existing data
                setFormData(prev => ({
                    ...prev,
                    first_name: response.data.first_name || '',
                    last_name: response.data.last_name || '',
                    phone: response.data.phone || '',
                    email: response.data.email || '',
                }));

                if (response.data.registration_status === 'complete') {
                    setSuccess(`Welcome back! You're already registered and belong to ${groups.length} group(s).`);
                    setStep('complete');
                } else {
                    setSuccess(`We found your profile! You were added to group(s). Please complete your registration.`);
                    setStep('form');
                }
            } else {
                // New user
                setExistingUser(null);
                setGroups([]);
                setSuccess('NIN not found. Ready for new registration.');
                setStep('form');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error checking NIN');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Register or complete registration
    const handleRegister = async () => {
        if (!formData.first_name || !formData.last_name || !formData.phone) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_BASE_URL}/membership/users/register/`, {
                nin: formData.nin,
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone,
                email: formData.email,
            });

            setSuccess(response.data.message);

            if (response.data.groups) {
                setGroups(response.data.groups);
            }

            setStep('complete');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="membership-registration-container">
            <div className="membership-card">
                <h1>Member Registration</h1>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                {/* Step 1: Check NIN */}
                {step === 'check' && (
                    <div className="registration-step">
                        <h2>Step 1: Verify Your NIN</h2>
                        <p>Enter your National Identification Number (NIN) to check your status.</p>

                        <div className="form-group">
                            <label htmlFor="nin">National Identification Number (NIN)</label>
                            <input
                                type="text"
                                id="nin"
                                name="nin"
                                placeholder="Enter 11-digit NIN"
                                value={formData.nin}
                                onChange={handleInputChange}
                                maxLength="11"
                                disabled={loading}
                            />
                            <small>Must be exactly 11 digits</small>
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={handleCheckNIN}
                            disabled={loading}
                        >
                            {loading ? 'Checking...' : 'Check NIN'}
                        </button>
                    </div>
                )}

                {/* Step 2: Registration Form */}
                {step === 'form' && (
                    <div className="registration-step">
                        <h2>Step 2: Complete Your Registration</h2>

                        <div className="form-group">
                            <label htmlFor="first_name">First Name *</label>
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                placeholder="Your first name"
                                value={formData.first_name}
                                onChange={handleInputChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="last_name">Last Name *</label>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                placeholder="Your last name"
                                value={formData.last_name}
                                onChange={handleInputChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Phone Number *</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                placeholder="Your phone number"
                                value={formData.phone}
                                onChange={handleInputChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Your email address"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={loading}
                            />
                        </div>

                        {existingUser && groups.length > 0 && (
                            <div className="groups-info">
                                <h3>You belong to the following group(s):</h3>
                                <ul>
                                    {groups.map((group, index) => (
                                        <li key={index}>
                                            <strong>{group.group__name}</strong>
                                            <span className="role">{group.role}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="button-group">
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setStep('check');
                                    setFormData({ nin: formData.nin, first_name: '', last_name: '', phone: '', email: '' });
                                }}
                                disabled={loading}
                            >
                                Back
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleRegister}
                                disabled={loading}
                            >
                                {loading ? 'Registering...' : 'Complete Registration'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Completion */}
                {step === 'complete' && (
                    <div className="registration-step completion">
                        <h2>Registration Complete!</h2>
                        <div className="success-icon">✓</div>

                        <p className="welcome-message">
                            Welcome, <strong>{formData.first_name} {formData.last_name}</strong>!
                        </p>

                        {existingUser?.registration_status === 'complete' && (
                            <p>Your registration is now active and you can access all group features.</p>
                        )}

                        {groups.length > 0 && (
                            <div className="groups-summary">
                                <h3>Your Group Memberships:</h3>
                                <ul>
                                    {groups.map((group, index) => (
                                        <li key={index}>
                                            <span className="group-name">{group.group__name}</span>
                                            <span className="group-role">{group.role}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                // Redirect to dashboard or home
                                window.location.href = '/';
                            }}
                        >
                            Go to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MembershipRegistration;
