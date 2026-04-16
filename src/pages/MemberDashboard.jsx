import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './MemberDashboard.css'
import { Download, Edit2, Lock, CreditCard, LogOut, Eye, EyeOff, Users } from 'lucide-react'
import { getAuthHeader, getAuthToken, hasAuthToken, debugAuthStorage, clearAuthToken } from '../utils/authUtils'

export default function MemberDashboard() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('profile')
    const [memberData, setMemberData] = useState(null)
    const [idCard, setIdCard] = useState(null)
    const [groups, setGroups] = useState([])
    const [groupsLoading, setGroupsLoading] = useState(false)
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState(null)
    const [editMode, setEditMode] = useState(false)
    const [showPINForm, setShowPINForm] = useState(false)
    const [showBankForm, setShowBankForm] = useState(false)
    const [showResidentialForm, setShowResidentialForm] = useState(false)
    const [showPassword, setShowPassword] = useState({})

    // Form states
    const [pinForm, setPinForm] = useState({
        old_pin: '',
        new_pin: '',
        confirm_pin: ''
    })

    // PIN Reset with OTP states
    const [showResetPinWithOTP, setShowResetPinWithOTP] = useState(false)
    const [resetPinStep, setResetPinStep] = useState('password') // 'password', 'desired', 'otp'
    const [resetPinPassword, setResetPinPassword] = useState('')
    const [resetPinDesired, setResetPinDesired] = useState('')
    const [resetPinOTP, setResetPinOTP] = useState('')
    const [resetPinLoading, setResetPinLoading] = useState(false)
    const [resetPinOtpSent, setResetPinOtpSent] = useState(false)

    const [bankForm, setBankForm] = useState({
        bank_account_number: '',
        bank_name: '',
        bvn: ''
    })
    const [residentialForm, setResidentialForm] = useState({
        lga_of_residence: '',
        state_of_residence: '',
        electoral_ward: '',
        polling_unit: ''
    })
    const [profilePictureFile, setProfilePictureFile] = useState(null)
    const [profilePicturePreview, setProfilePicturePreview] = useState(null)

    // Get member data from localStorage
    const memberId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).abia_arise_id : null
    const memberInitials = localStorage.getItem('user') ? `${JSON.parse(localStorage.getItem('user')).first_name[0]}${JSON.parse(localStorage.getItem('user')).last_name[0]}` : ''

    useEffect(() => {
        debugAuthStorage()

        if (!hasAuthToken()) {
            console.warn('⚠️ No valid auth token found, redirecting to login')
            navigate('/login')
            return
        }
        fetchMemberData()
        fetchIDCard()
        fetchMemberGroups()
    }, [])

    const fetchMemberData = async () => {
        try {
            const response = await axios.get(
                'http://localhost:8000/api/auth/members/dashboard/',
                { params: { member_id: memberId } }
            )
            if (response.data.success) {
                setMemberData(response.data.data)
                // Initialize forms with current data
                setResidentialForm({
                    lga_of_residence: response.data.data.lga_of_residence || '',
                    state_of_residence: response.data.data.state_of_residence || '',
                    electoral_ward: response.data.data.electoral_ward || '',
                    polling_unit: response.data.data.polling_unit || ''
                })
                setBankForm({
                    bank_account_number: response.data.data.bank_account_number || '',
                    bank_name: response.data.data.bank_name || '',
                    bvn: response.data.data.bvn || ''
                })
            }
        } catch (error) {
            console.error('Error fetching member data:', error)
            setMessage({ type: 'error', text: 'Failed to load member details' })
        } finally {
            setLoading(false)
        }
    }

    const fetchIDCard = async () => {
        try {
            const response = await axios.get(
                'http://localhost:8000/api/auth/members/get_id_card/',
                { params: { member_id: memberId } }
            )
            if (response.data.success && response.data.id_card_url) {
                setIdCard(response.data.id_card_url)
            }
        } catch (error) {
            console.error('Error fetching ID card:', error.message, error.response?.data)
        }
    }

    const fetchMemberGroups = async () => {
        try {
            setGroupsLoading(true)
            const token = localStorage.getItem('authToken')

            if (!token) {
                console.warn('No auth token found - groups will not be fetched')
                setGroupsLoading(false)
                return
            }

            const response = await axios.get(
                'http://localhost:8000/api/auth/groups/',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            )
            const allGroups = Array.isArray(response.data) ? response.data : (response.data.results || [])

            // Filter groups where this member is a member
            const userData = JSON.parse(localStorage.getItem('user') || '{}')
            const memberGroups = allGroups.filter(group =>
                group.members && group.members.some(m => m.member_id === userData.id)
            )

            setGroups(memberGroups)
        } catch (error) {
            console.error('Error fetching groups:', error)
            // Don't set groups to empty array on error - keep existing data
        } finally {
            setGroupsLoading(false)
        }
    }

    const handleLogout = () => {
        clearAuthToken()
        navigate('/login')
    }

    const handleUpdateResidential = async (e) => {
        e.preventDefault()
        try {
            const userData = JSON.parse(localStorage.getItem('user'))
            const response = await axios.post(
                'http://localhost:8000/api/auth/members/update_residential_info/',
                {
                    member_id: memberId,
                    pin: userData.pin || '0000',
                    ...residentialForm
                }
            )
            if (response.data.success) {
                setMessage({ type: 'success', text: 'Residential information updated successfully' })
                setShowResidentialForm(false)
                fetchMemberData()
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update residential information' })
        }
    }

    const handleUpdateBankDetails = async (e) => {
        e.preventDefault()
        try {
            const userData = JSON.parse(localStorage.getItem('user'))
            const response = await axios.post(
                'http://localhost:8000/api/auth/members/update_bank_details/',
                {
                    member_id: memberId,
                    pin: userData.pin || '0000',
                    ...bankForm
                }
            )
            if (response.data.success) {
                setMessage({ type: 'success', text: 'Bank details updated successfully' })
                setShowBankForm(false)
                fetchMemberData()
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update bank details' })
        }
    }

    const handleUpdatePIN = async (e) => {
        e.preventDefault()
        if (pinForm.new_pin !== pinForm.confirm_pin) {
            setMessage({ type: 'error', text: 'New PINs do not match' })
            return
        }
        try {
            const userData = JSON.parse(localStorage.getItem('user'))
            const response = await axios.post(
                'http://localhost:8000/api/auth/members/update_pin/',
                {
                    member_id: memberId,
                    nin: userData.nin,
                    phone_number: userData.phone_number,
                    old_pin: pinForm.old_pin,
                    new_pin: pinForm.new_pin
                }
            )
            if (response.data.success) {
                setMessage({ type: 'success', text: 'PIN updated successfully' })
                setShowPINForm(false)
                setPinForm({ old_pin: '', new_pin: '', confirm_pin: '' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update PIN' })
        }
    }

    const handleGenerateResetPinOTP = async (e) => {
        e.preventDefault()
        if (!resetPinPassword) {
            setMessage({ type: 'error', text: 'Please enter your password (last 4 digits of phone)' })
            return
        }
        if (!resetPinDesired || resetPinDesired.length !== 6 || !/^\d+$/.test(resetPinDesired)) {
            setMessage({ type: 'error', text: 'New PIN must be exactly 6 digits' })
            return
        }

        setResetPinLoading(true)
        try {
            const response = await axios.post(
                'http://localhost:8000/api/auth/members/generate_reset_pin/',
                {
                    member_id: memberId,
                    password: resetPinPassword,
                    desired_pin: resetPinDesired
                }
            )
            if (response.data.success) {
                setMessage({ type: 'success', text: 'OTP sent to your email. Check your inbox.' })
                setResetPinOtpSent(true)
                setResetPinStep('otp')
                // For development, if OTP is included in response
                if (response.data.otp) {
                    console.log(`📧 Development Mode - OTP: ${response.data.otp}`)
                }
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to send OTP' })
            console.error('Generate OTP error:', error)
        } finally {
            setResetPinLoading(false)
        }
    }

    const handleVerifyResetPinOTP = async (e) => {
        e.preventDefault()
        if (!resetPinOTP || resetPinOTP.length !== 6 || !/^\d+$/.test(resetPinOTP)) {
            setMessage({ type: 'error', text: 'OTP must be exactly 6 digits' })
            return
        }

        setResetPinLoading(true)
        try {
            const response = await axios.post(
                'http://localhost:8000/api/auth/members/verify_reset_pin_otp/',
                {
                    member_id: memberId,
                    otp: resetPinOTP
                }
            )
            if (response.data.success) {
                setMessage({ type: 'success', text: 'PIN has been reset successfully!' })
                setShowResetPinWithOTP(false)
                setResetPinStep('password')
                setResetPinPassword('')
                setResetPinDesired('')
                setResetPinOTP('')
                setResetPinOtpSent(false)
                // Refresh member data
                setTimeout(() => fetchMemberData(), 1000)
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to verify OTP' })
            console.error('Verify OTP error:', error)
        } finally {
            setResetPinLoading(false)
        }
    }

    const handleResetPinCancel = () => {
        setShowResetPinWithOTP(false)
        setResetPinStep('password')
        setResetPinPassword('')
        setResetPinDesired('')
        setResetPinOTP('')
        setResetPinOtpSent(false)
    }

    const handleUpdateProfilePicture = async (e) => {
        e.preventDefault()
        if (!profilePictureFile) {
            setMessage({ type: 'error', text: 'Please select a profile picture' })
            return
        }

        try {
            const formData = new FormData()
            formData.append('member_id', memberId)
            formData.append('pin', JSON.parse(localStorage.getItem('user')).pin || '0000')
            formData.append('profile_picture', profilePictureFile)

            const response = await axios.post(
                'http://localhost:8000/api/auth/members/update_profile_picture/',
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            )
            if (response.data.success) {
                setMessage({ type: 'success', text: 'Profile picture updated successfully' })
                setProfilePictureFile(null)
                setProfilePicturePreview(null)
                fetchMemberData()
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile picture' })
        }
    }

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setProfilePictureFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setProfilePicturePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const downloadIDCard = () => {
        if (idCard) {
            const token = localStorage.getItem('authToken')
            const link = document.createElement('a')
            link.href = `http://localhost:8000${idCard}`
            link.download = `ID_Card_${memberId}.png`
            link.setAttribute('Authorization', `Bearer ${token}`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    if (loading) {
        return <div className="member-dashboard loading">Loading...</div>
    }

    if (!memberData) {
        return <div className="member-dashboard error">Error loading member data</div>
    }

    return (
        <div className="member-dashboard">
            {message && (
                <div className={`alert alert-${message.type}`}>
                    {message.text}
                    <button onClick={() => setMessage(null)}>&times;</button>
                </div>
            )}

            <div className="dashboard-header">
                <div className="header-left">
                    <div className="profile-avatar">
                        {memberData.profile_picture ? (
                            <img src={memberData.profile_picture} alt="Profile" />
                        ) : (
                            <div className="avatar-initials">{memberInitials}</div>
                        )}
                    </div>
                </div>
                <div className="header-middle">
                    <h1>{memberData.first_name} {memberData.middle_name} {memberData.last_name}</h1>
                    <p className="email">{memberData.email}</p>
                    <p className="member-id">{memberId}</p>
                </div>
                <div className="header-actions">
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span className="action-text">Logout</span>
                    </button>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="tabs">
                    <button
                        className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'groups' ? 'active' : ''}`}
                        onClick={() => setActiveTab('groups')}
                    >
                        <Users size={16} /> My Groups
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'idcard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('idcard')}
                    >
                        ID Card
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'banking' ? 'active' : ''}`}
                        onClick={() => setActiveTab('banking')}
                    >
                        Banking
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        Security
                    </button>
                </div>

                <div className="tab-content">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="profile-tab">
                            <div className="profile-card">
                                <h2>Your Information</h2>
                                <div className="info-grid">
                                    <div className="info-group">
                                        <label>First Name</label>
                                        <p>{memberData.first_name}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Middle Name</label>
                                        <p>{memberData.middle_name || '-'}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Last Name</label>
                                        <p>{memberData.last_name}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Email</label>
                                        <p>{memberData.email}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Phone Number</label>
                                        <p>{memberData.phone_number}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Age</label>
                                        <p>{memberData.age}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Gender</label>
                                        <p>{memberData.gender}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Occupation</label>
                                        <p>{memberData.occupation}</p>
                                    </div>
                                    <div className="info-group full-width">
                                        <label>Membership Purpose</label>
                                        <p>{memberData.membership_purpose}</p>
                                    </div>
                                </div>

                                <div className="section-divider"></div>

                                <h3>Origin Details (Read-Only)</h3>
                                <div className="info-grid">
                                    <div className="info-group">
                                        <label>State of Origin</label>
                                        <p>{memberData.state_of_origin}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>LGA of Origin</label>
                                        <p>{memberData.lga_of_origin}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>Country of Origin</label>
                                        <p>{memberData.country_of_origin}</p>
                                    </div>
                                </div>

                                <div className="section-divider"></div>

                                <div className="section-header">
                                    <h3>Residential Details</h3>
                                    <button
                                        className="edit-btn"
                                        onClick={() => setShowResidentialForm(!showResidentialForm)}
                                    >
                                        <Edit2 size={16} /> Edit Address
                                    </button>
                                </div>

                                {showResidentialForm && (
                                    <form onSubmit={handleUpdateResidential} className="edit-form">
                                        <div className="form-group">
                                            <label>State of Residence</label>
                                            <input
                                                type="text"
                                                value={residentialForm.state_of_residence}
                                                onChange={(e) => setResidentialForm({
                                                    ...residentialForm,
                                                    state_of_residence: e.target.value
                                                })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>LGA of Residence</label>
                                            <input
                                                type="text"
                                                value={residentialForm.lga_of_residence}
                                                onChange={(e) => setResidentialForm({
                                                    ...residentialForm,
                                                    lga_of_residence: e.target.value
                                                })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Electoral Ward</label>
                                            <input
                                                type="text"
                                                value={residentialForm.electoral_ward}
                                                onChange={(e) => setResidentialForm({
                                                    ...residentialForm,
                                                    electoral_ward: e.target.value
                                                })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Polling Unit</label>
                                            <input
                                                type="text"
                                                value={residentialForm.polling_unit}
                                                onChange={(e) => setResidentialForm({
                                                    ...residentialForm,
                                                    polling_unit: e.target.value
                                                })}
                                            />
                                        </div>
                                        <div className="form-actions">
                                            <button type="submit" className="btn-primary">Save Changes</button>
                                            <button
                                                type="button"
                                                className="btn-secondary"
                                                onClick={() => setShowResidentialForm(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {!showResidentialForm && (
                                    <div className="info-grid">
                                        <div className="info-group">
                                            <label>State of Residence</label>
                                            <p>{memberData.state_of_residence}</p>
                                        </div>
                                        <div className="info-group">
                                            <label>LGA of Residence</label>
                                            <p>{memberData.lga_of_residence}</p>
                                        </div>
                                        <div className="info-group">
                                            <label>Electoral Ward</label>
                                            <p>{memberData.electoral_ward}</p>
                                        </div>
                                        <div className="info-group">
                                            <label>Polling Unit</label>
                                            <p>{memberData.polling_unit}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Profile Picture Update */}
                            <div className="profile-card">
                                <h3>Profile Picture</h3>
                                <div className="profile-picture-section">
                                    <div className="current-picture">
                                        {memberData.profile_picture ? (
                                            <img src={memberData.profile_picture} alt="Current Profile" />
                                        ) : (
                                            <div className="no-picture">No profile picture</div>
                                        )}
                                    </div>
                                    <form onSubmit={handleUpdateProfilePicture} className="picture-form">
                                        <div className="form-group">
                                            <label htmlFor="profile-picture">Upload New Picture</label>
                                            <input
                                                id="profile-picture"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleProfilePictureChange}
                                            />
                                        </div>
                                        {profilePicturePreview && (
                                            <div className="preview">
                                                <img src={profilePicturePreview} alt="Preview" />
                                            </div>
                                        )}
                                        {profilePictureFile && (
                                            <button type="submit" className="btn-primary">Upload Picture</button>
                                        )}
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* My Groups Tab */}
                    {activeTab === 'groups' && (
                        <div className="groups-tab">
                            <div className="profile-card">
                                <h2>My Pro-Groups</h2>
                                {groupsLoading ? (
                                    <div className="loading">Loading groups...</div>
                                ) : groups.length === 0 ? (
                                    <div className="empty-state">
                                        <p>You are not a member of any pro-groups yet.</p>
                                    </div>
                                ) : (
                                    <div className="groups-grid">
                                        {groups.map(group => (
                                            <div key={group.id} className="group-card">
                                                {group.logo && (
                                                    <div className="group-logo">
                                                        <img src={group.logo} alt={group.name} />
                                                    </div>
                                                )}
                                                <div className="group-info">
                                                    <h3>{group.group_name || group.name}</h3>
                                                    <p className="license">License: {group.group_license_number}</p>
                                                    <p className="member-count">Members: {group.members ? group.members.length : 0}</p>
                                                    <p className="chairman">Chairman: {group.chairman_name}</p>
                                                    <p className="lga">LGA: {group.lga || group.lga_name}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ID Card Tab */}
                    {activeTab === 'idcard' && (
                        <div className="idcard-tab">
                            <div className="profile-card">
                                <h2>Generated ID Card</h2>
                                <div className="id-card-container">
                                    {idCard ? (
                                        <>
                                            <img src={`http://localhost:8000${idCard}`} alt="ID Card" className="id-card-image" />
                                            <div className="id-card-actions">
                                                <button className="btn-primary" onClick={downloadIDCard}>
                                                    <Download size={20} /> Download ID Card
                                                </button>
                                                <button
                                                    className="btn-secondary"
                                                    onClick={() => window.print()}
                                                >
                                                    Print ID Card
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="no-id-card">ID Card not available. Please contact support.</div>
                                    )}
                                </div>
                                <div className="id-info">
                                    <h4>ID Card Information</h4>
                                    <p><strong>Member ID:</strong> {memberId}</p>
                                    <p><strong>Full Name:</strong> {memberData.first_name} {memberData.middle_name} {memberData.last_name}</p>
                                    <p><strong>Generated on:</strong> {new Date().toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Banking Tab */}
                    {activeTab === 'banking' && (
                        <div className="banking-tab">
                            <div className="profile-card">
                                <div className="section-header">
                                    <h2>Bank Details</h2>
                                    <button
                                        className="edit-btn"
                                        onClick={() => setShowBankForm(!showBankForm)}
                                    >
                                        <CreditCard size={16} /> {showBankForm ? 'Hide' : 'Edit'} Bank Details
                                    </button>
                                </div>

                                {showBankForm && (
                                    <form onSubmit={handleUpdateBankDetails} className="edit-form">
                                        <div className="form-group">
                                            <label>Bank Name</label>
                                            <input
                                                type="text"
                                                placeholder="Enter bank name"
                                                value={bankForm.bank_name}
                                                onChange={(e) => setBankForm({
                                                    ...bankForm,
                                                    bank_name: e.target.value
                                                })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Account Number</label>
                                            <input
                                                type="text"
                                                placeholder="Enter account number"
                                                value={bankForm.bank_account_number}
                                                onChange={(e) => setBankForm({
                                                    ...bankForm,
                                                    bank_account_number: e.target.value
                                                })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>BVN</label>
                                            <input
                                                type="text"
                                                placeholder="Enter BVN"
                                                value={bankForm.bvn}
                                                onChange={(e) => setBankForm({
                                                    ...bankForm,
                                                    bvn: e.target.value
                                                })}
                                            />
                                        </div>
                                        <div className="form-actions">
                                            <button type="submit" className="btn-primary">Save Bank Details</button>
                                            <button
                                                type="button"
                                                className="btn-secondary"
                                                onClick={() => setShowBankForm(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {!showBankForm && (
                                    <div className="bank-info">
                                        <div className="info-item">
                                            <label>Bank Name</label>
                                            <p>{memberData.bank_name || 'Not provided'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>Account Number</label>
                                            <p>{memberData.bank_account_number ? `****${memberData.bank_account_number.slice(-4)}` : 'Not provided'}</p>
                                        </div>
                                        <div className="info-item">
                                            <label>BVN</label>
                                            <p>{memberData.bvn ? `****${memberData.bvn.slice(-4)}` : 'Not provided'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="security-tab">
                            <div className="profile-card">
                                <div className="section-header">
                                    <h2>Security Settings</h2>
                                </div>

                                <div className="security-section">
                                    <h3>Reset Your PIN (With Email Verification)</h3>
                                    <p className="hint">Secure way to reset your PIN using OTP sent to your email.</p>

                                    {!showResetPinWithOTP ? (
                                        <button
                                            className="btn-primary"
                                            onClick={() => setShowResetPinWithOTP(true)}
                                        >
                                            <Lock size={16} /> Reset PIN with OTP
                                        </button>
                                    ) : (
                                        <form onSubmit={resetPinStep === 'otp' ? handleVerifyResetPinOTP : handleGenerateResetPinOTP} className="edit-form">
                                            {resetPinStep === 'password' && (
                                                <>
                                                    <div className="form-group">
                                                        <label>Enter Your Password (Last 4 Digits of Phone) *</label>
                                                        <input
                                                            type="password"
                                                            placeholder="Enter password"
                                                            value={resetPinPassword}
                                                            onChange={(e) => setResetPinPassword(e.target.value)}
                                                            required
                                                            disabled={resetPinLoading}
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Enter Your New 6-Digit PIN *</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Enter 6 digits (e.g., 654321)"
                                                            value={resetPinDesired}
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                                                                setResetPinDesired(val)
                                                            }}
                                                            maxLength="6"
                                                            required
                                                            pattern="\d{6}"
                                                            disabled={resetPinLoading}
                                                        />
                                                        {resetPinDesired && resetPinDesired.length !== 6 && (
                                                            <span style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                                                ⚠️ PIN must be exactly 6 digits ({resetPinDesired.length}/6)
                                                            </span>
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                            {resetPinStep === 'otp' && (
                                                <>
                                                    <div className="form-group">
                                                        <label>Enter OTP Sent to Your Email *</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Enter 6-digit OTP"
                                                            value={resetPinOTP}
                                                            onChange={(e) => {
                                                                const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                                                                setResetPinOTP(val)
                                                            }}
                                                            maxLength="6"
                                                            autoFocus
                                                            required
                                                            pattern="\d{6}"
                                                            disabled={resetPinLoading}
                                                        />
                                                        {resetPinOTP && resetPinOTP.length !== 6 && (
                                                            <span style={{ color: '#e74c3c', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                                                ⚠️ OTP must be exactly 6 digits ({resetPinOTP.length}/6)
                                                            </span>
                                                        )}
                                                        <small style={{ color: '#7f8c8d', marginTop: '8px', display: 'block' }}>
                                                            ℹ️ Check your registered email for the OTP. Valid for 10 minutes.
                                                        </small>
                                                    </div>
                                                </>
                                            )}

                                            <div className="form-actions">
                                                <button
                                                    type="submit"
                                                    className="btn-primary"
                                                    disabled={resetPinLoading}
                                                >
                                                    {resetPinLoading ? 'Processing...' : (resetPinStep === 'otp' ? 'Verify OTP & Reset PIN' : 'Continue')}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-secondary"
                                                    onClick={handleResetPinCancel}
                                                    disabled={resetPinLoading}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>

                                <div className="section-divider"></div>

                                <div className="security-section">
                                    <h3>Update PIN (Traditional Method)</h3>
                                    <p className="hint">Your PIN is required to update sensitive information.</p>

                                    {!showPINForm ? (
                                        <button
                                            className="btn-primary"
                                            onClick={() => setShowPINForm(true)}
                                        >
                                            <Lock size={16} /> Update PIN
                                        </button>
                                    ) : (
                                        <form onSubmit={handleUpdatePIN} className="edit-form">
                                            <div className="form-group">
                                                <label>Old PIN</label>
                                                <div className="password-input">
                                                    <input
                                                        type={showPassword.old ? 'text' : 'password'}
                                                        placeholder="Enter old PIN"
                                                        value={pinForm.old_pin}
                                                        onChange={(e) => setPinForm({
                                                            ...pinForm,
                                                            old_pin: e.target.value
                                                        })}
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword({
                                                            ...showPassword,
                                                            old: !showPassword.old
                                                        })}
                                                    >
                                                        {showPassword.old ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>New PIN</label>
                                                <div className="password-input">
                                                    <input
                                                        type={showPassword.new ? 'text' : 'password'}
                                                        placeholder="Enter new PIN"
                                                        value={pinForm.new_pin}
                                                        onChange={(e) => setPinForm({
                                                            ...pinForm,
                                                            new_pin: e.target.value
                                                        })}
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword({
                                                            ...showPassword,
                                                            new: !showPassword.new
                                                        })}
                                                    >
                                                        {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Confirm New PIN</label>
                                                <div className="password-input">
                                                    <input
                                                        type={showPassword.confirm ? 'text' : 'password'}
                                                        placeholder="Confirm new PIN"
                                                        value={pinForm.confirm_pin}
                                                        onChange={(e) => setPinForm({
                                                            ...pinForm,
                                                            confirm_pin: e.target.value
                                                        })}
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword({
                                                            ...showPassword,
                                                            confirm: !showPassword.confirm
                                                        })}
                                                    >
                                                        {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="form-actions">
                                                <button type="submit" className="btn-primary">Update PIN</button>
                                                <button
                                                    type="button"
                                                    className="btn-secondary"
                                                    onClick={() => {
                                                        setShowPINForm(false)
                                                        setPinForm({ old_pin: '', new_pin: '', confirm_pin: '' })
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>

                                <div className="section-divider"></div>

                                <div className="security-section">
                                    <h3>Important Information</h3>
                                    <ul className="info-list">
                                        <li>Your PIN is used to protect your sensitive information</li>
                                        <li>Default PIN is the last 4 digits of your phone number</li>
                                        <li>PIN is required for: updating bank information, residential address, downloading ID cards, and group member management</li>
                                        <li>Keep your PIN confidential</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
