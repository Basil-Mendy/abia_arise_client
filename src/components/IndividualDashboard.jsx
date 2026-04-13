import { useState, useEffect } from 'react'
import axios from 'axios'
import { User, MapPin, DollarSign, Lock, Upload, ChevronLeft, Save, AlertCircle, Download, FileText } from 'lucide-react'
import './IndividualDashboard.css'

export default function IndividualDashboard({ memberId, onLogout }) {
    const [member, setMember] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('profile')
    const [pin, setPin] = useState('')
    const [showPinError, setShowPinError] = useState(false)

    // Profile picture update
    const [profilePictureFile, setProfilePictureFile] = useState(null)
    const [updatingProfilePicture, setUpdatingProfilePicture] = useState(false)

    // Residential info update
    const [residentialData, setResidentialData] = useState({})
    const [updatingResidential, setUpdatingResidential] = useState(false)

    // Bank details update
    const [bankData, setBankData] = useState({
        bank_account_number: '',
        bank_name: '',
        bvn: ''
    })
    const [updatingBank, setUpdatingBank] = useState(false)

    // PIN management
    const [pinData, setPinData] = useState({
        nin: '',
        phone_number: '',
        old_pin: '',
        new_pin: '',
        confirm_pin: ''
    })
    const [updatingPin, setUpdatingPin] = useState(false)
    const [pinSuccess, setPinSuccess] = useState(false)

    // ID Card
    const [idCard, setIdCard] = useState(null)
    const [loadingIdCard, setLoadingIdCard] = useState(false)
    const [idCardError, setIdCardError] = useState(null)

    useEffect(() => {
        loadDashboard()
        loadIdCard()
    }, [memberId])

    const loadDashboard = async () => {
        try {
            setLoading(true)
            const response = await axios.get(
                'http://localhost:8000/api/auth/members/dashboard/',
                { params: { member_id: memberId } }
            )
            if (response.data.success) {
                setMember(response.data.data)
                setResidentialData({
                    lga_of_residence: response.data.data.lga_of_residence,
                    state_of_residence: response.data.data.state_of_residence,
                    electoral_ward: response.data.data.electoral_ward,
                    polling_unit: response.data.data.polling_unit,
                })
                setBankData({
                    bank_account_number: response.data.data.bank_account_number || '',
                    bank_name: response.data.data.bank_name || '',
                    bvn: response.data.data.bvn || '',
                })
            }
        } catch (err) {
            setError('Failed to load dashboard. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const loadIdCard = async () => {
        try {
            setLoadingIdCard(true)
            setIdCardError(null)
            console.log(`[ID Card] Loading for member: ${memberId}`)
            const response = await axios.get(
                'http://localhost:8000/api/auth/members/get_id_card/',
                { params: { member_id: memberId } }
            )
            console.log('[ID Card] API Response:', response.data)
            if (response.data.success && response.data.id_card_url) {
                setIdCard(response.data.id_card_url)
                console.log('[ID Card] Successfully loaded:', response.data.id_card_url)
            } else {
                setIdCardError(response.data.message || 'ID card not available')
                console.warn('[ID Card] No card available:', response.data.message)
            }
        } catch (err) {
            console.error('[ID Card] Error:', err.message, err.response?.data)
            setIdCardError(err.response?.data?.message || 'Failed to load ID card. Please try again.')
        } finally {
            setLoadingIdCard(false)
        }
    }

    const downloadIdCard = () => {
        if (idCard) {
            try {
                const fullUrl = `http://localhost:8000${idCard}`
                console.log('[ID Card Download] URL:', fullUrl)
                const link = document.createElement('a')
                link.href = fullUrl
                link.download = `ID_Card_${memberId}.png`
                link.target = '_blank'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                console.log('[ID Card Download] Success')
            } catch (err) {
                console.error('[ID Card Download] Error:', err)
            }
        } else {
            console.warn('[ID Card Download] No card URL available')
        }
    }

    const verifyPin = () => {
        if (!pin || pin !== member.pin) {
            setShowPinError(true)
            setTimeout(() => setShowPinError(false), 3000)
            return false
        }
        return true
    }

    const handleProfilePictureUpload = async () => {
        if (!verifyPin()) return

        try {
            setUpdatingProfilePicture(true)
            const formData = new FormData()
            formData.append('member_id', memberId)
            formData.append('pin', pin)
            formData.append('profile_picture', profilePictureFile)

            const response = await axios.post(
                'http://localhost:8000/api/auth/members/update_profile_picture/',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )

            if (response.data.success) {
                setMember(prev => ({ ...prev, profile_picture: response.data.profile_picture_url }))
                setProfilePictureFile(null)
                setPin('')
                alert('Profile picture updated successfully!')
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update profile picture')
        } finally {
            setUpdatingProfilePicture(false)
        }
    }

    const handleResidentialUpdate = async () => {
        if (!verifyPin()) return

        try {
            setUpdatingResidential(true)
            const response = await axios.post(
                'http://localhost:8000/api/auth/members/update_residential_info/',
                {
                    member_id: memberId,
                    pin: pin,
                    ...residentialData
                }
            )

            if (response.data.success) {
                setMember(prev => ({ ...prev, ...response.data.data }))
                setPin('')
                alert('Residential information updated successfully!')
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update residential information')
        } finally {
            setUpdatingResidential(false)
        }
    }

    const handleBankUpdate = async () => {
        if (!verifyPin()) return

        try {
            setUpdatingBank(true)
            const response = await axios.post(
                'http://localhost:8000/api/auth/members/update_bank_details/',
                {
                    member_id: memberId,
                    pin: pin,
                    ...bankData
                }
            )

            if (response.data.success) {
                setMember(prev => ({ ...prev, ...response.data.data }))
                setPin('')
                alert('Bank details updated successfully!')
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update bank details')
        } finally {
            setUpdatingBank(false)
        }
    }

    const handlePinReset = async () => {
        if (pinData.new_pin !== pinData.confirm_pin) {
            alert('New PIN and confirm PIN do not match')
            return
        }

        try {
            setUpdatingPin(true)
            const response = await axios.post(
                'http://localhost:8000/api/auth/members/update_pin/',
                {
                    member_id: memberId,
                    nin: pinData.nin,
                    phone_number: pinData.phone_number,
                    old_pin: pinData.old_pin,
                    new_pin: pinData.new_pin
                }
            )

            if (response.data.success) {
                setPinSuccess(true)
                setPinData({ nin: '', phone_number: '', old_pin: '', new_pin: '', confirm_pin: '' })
                setTimeout(() => setPinSuccess(false), 3000)
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update PIN')
        } finally {
            setUpdatingPin(false)
        }
    }

    if (loading) return <div className="dashboard-loading">Loading your profile...</div>
    if (error) return <div className="dashboard-error">{error}</div>
    if (!member) return <div className="dashboard-error">No member data found</div>

    return (
        <div className="individual-dashboard">
            <div className="dashboard-header">
                <div className="header-left">
                    <div className="profile-avatar">
                        {member.profile_picture ? (
                            <img src={member.profile_picture} alt="Profile" />
                        ) : (
                            <div className="avatar-initials">{memberInitials}</div>
                        )}
                    </div>
                    <p className="member-id">ID: {member.abia_arise_id}</p>
                </div>
                <div className="header-middle">
                    <h1>Welcome, {member.first_name}!</h1>
                    <p className="email">{member.email}</p>
                </div>
                <button className="btn-logout" onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ChevronLeft size={20} />
                    <span className="logout-text">Logout</span>
                </button>
            </div>

            <div className="dashboard-tabs">
                <button
                    className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <User size={20} /> Profile
                </button>
                <button
                    className={`tab ${activeTab === 'id-card' ? 'active' : ''}`}
                    onClick={() => setActiveTab('id-card')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <FileText size={20} /> ID Card
                </button>
                <button
                    className={`tab ${activeTab === 'residential' ? 'active' : ''}`}
                    onClick={() => setActiveTab('residential')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <MapPin size={20} /> Residential Info
                </button>
                <button
                    className={`tab ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <Lock size={20} /> Security
                </button>
            </div>

            <div className="dashboard-content">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="tab-content">
                        <h2>Profile Information</h2>

                        {/* Bank Details Section */}
                        <div className="update-section">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CreditCard size={20} /> Bank Details
                            </h3>
                            <p className="section-note">Securely store your bank details for future transactions. PIN required.</p>

                            <div className="form-group">
                                <label>Bank Account Number</label>
                                <input
                                    type="text"
                                    placeholder="Enter your bank account number"
                                    value={bankData.bank_account_number}
                                    onChange={(e) => setBankData(prev => ({ ...prev, bank_account_number: e.target.value }))}
                                />
                            </div>

                            <div className="form-group">
                                <label>Bank Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter your bank name"
                                    value={bankData.bank_name}
                                    onChange={(e) => setBankData(prev => ({ ...prev, bank_name: e.target.value }))}
                                />
                            </div>

                            <div className="form-group">
                                <label>BVN (Bank Verification Number)</label>
                                <input
                                    type="text"
                                    placeholder="Enter your BVN"
                                    value={bankData.bvn}
                                    onChange={(e) => setBankData(prev => ({ ...prev, bvn: e.target.value }))}
                                />
                            </div>

                            {showPinError && (
                                <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={18} /> Invalid PIN
                                </div>
                            )}

                            <div className="form-group">
                                <label>Enter PIN</label>
                                <input
                                    type="password"
                                    placeholder="Enter your PIN (default: 0000)"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                />
                            </div>

                            <button
                                className="btn-primary"
                                onClick={handleBankUpdate}
                                disabled={!pin || updatingBank}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Save size={20} /> Save Bank Details
                            </button>
                        </div>

                        <div className="profile-section">
                            <div className="profile-picture-container">
                                {member.profile_picture ? (
                                    <img src={member.profile_picture} alt="Profile" className="profile-picture" />
                                ) : (
                                    <div className="profile-picture-placeholder">
                                        <User size={60} />
                                    </div>
                                )}
                            </div>

                            <div className="profile-details">
                                <div className="info-group">
                                    <label>Full Name</label>
                                    <p>{member.first_name} {member.middle_name} {member.last_name}</p>
                                </div>

                                <div className="info-group">
                                    <label>Email</label>
                                    <p>{member.email}</p>
                                </div>

                                <div className="info-group">
                                    <label>Phone Number</label>
                                    <p>{member.phone_number}</p>
                                </div>

                                <div className="info-group">
                                    <label>Gender</label>
                                    <p>{member.gender}</p>
                                </div>

                                <div className="info-group">
                                    <label>Age</label>
                                    <p>{member.age}</p>
                                </div>

                                <div className="info-group">
                                    <label>Occupation</label>
                                    <p>{member.occupation}</p>
                                </div>
                            </div>
                        </div>

                        {/* Profile Picture Update */}
                        <div className="update-section">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Upload size={20} /> Update Profile Picture
                            </h3>
                            <p className="section-note">Your profile picture can be updated. PIN required.</p>

                            <div className="form-group">
                                <label>Select new profile picture</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setProfilePictureFile(e.target.files?.[0] || null)}
                                />
                                {profilePictureFile && (
                                    <p className="file-name">Selected: {profilePictureFile.name}</p>
                                )}
                            </div>

                            {showPinError && (
                                <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={18} /> Invalid PIN
                                </div>
                            )}

                            <div className="form-group">
                                <label>Enter PIN</label>
                                <input
                                    type="password"
                                    placeholder="Enter your PIN (default: 0000)"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                />
                            </div>

                            <button
                                className="btn-primary"
                                onClick={handleProfilePictureUpload}
                                disabled={!profilePictureFile || !pin || updatingProfilePicture}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Save size={20} /> Update Picture
                            </button>
                        </div>

                        {/* Origin Details - Read Only */}
                        <div className="readonly-section">
                            <h3>Origin Details (Cannot be changed)</h3>
                            <div className="info-group">
                                <label>LGA of Origin</label>
                                <p>{member.lga_of_origin}</p>
                            </div>
                            <div className="info-group">
                                <label>State of Origin</label>
                                <p>{member.state_of_origin}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ID Card Tab */}
                {activeTab === 'id-card' && (
                    <div className="tab-content">
                        <h2>Your ID Card</h2>

                        {loadingIdCard && (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <p>Loading ID card...</p>
                            </div>
                        )}

                        {!loadingIdCard && idCardError && (
                            <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '1rem', borderRadius: '4px' }}>
                                <AlertCircle size={18} /> {idCardError}
                            </div>
                        )}

                        {!loadingIdCard && idCard && (
                            <div className="id-card-container" style={{ padding: '2rem', textAlign: 'center' }}>
                                <div style={{ marginBottom: '1.5rem', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                    <img
                                        src={`http://localhost:8000${idCard}`}
                                        alt="ID Card"
                                        style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                                    />
                                </div>
                                <button
                                    onClick={downloadIdCard}
                                    className="btn-primary"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <Download size={20} /> Download ID Card
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Residential Tab */}
                {activeTab === 'residential' && (
                    <div className="tab-content">
                        <h2>Residential Information</h2>
                        <p className="section-note">You can update your residential information. PIN required for security.</p>

                        <div className="form-group">
                            <label>LGA of Residence</label>
                            <input
                                type="text"
                                value={residentialData.lga_of_residence}
                                onChange={(e) => setResidentialData(prev => ({ ...prev, lga_of_residence: e.target.value }))}
                            />
                        </div>

                        <div className="form-group">
                            <label>State of Residence</label>
                            <input
                                type="text"
                                value={residentialData.state_of_residence}
                                onChange={(e) => setResidentialData(prev => ({ ...prev, state_of_residence: e.target.value }))}
                            />
                        </div>

                        <div className="form-group">
                            <label>Electoral Ward</label>
                            <input
                                type="text"
                                value={residentialData.electoral_ward}
                                onChange={(e) => setResidentialData(prev => ({ ...prev, electoral_ward: e.target.value }))}
                            />
                        </div>

                        <div className="form-group">
                            <label>Polling Unit</label>
                            <input
                                type="text"
                                value={residentialData.polling_unit}
                                onChange={(e) => setResidentialData(prev => ({ ...prev, polling_unit: e.target.value }))}
                            />
                        </div>

                        {showPinError && (
                            <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertCircle size={18} /> Invalid PIN
                            </div>
                        )}

                        <div className="form-group">
                            <label>Enter PIN</label>
                            <input
                                type="password"
                                placeholder="Enter your PIN (default: 0000)"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                            />
                        </div>

                        <button
                            className="btn-primary"
                            onClick={handleResidentialUpdate}
                            disabled={!pin || updatingResidential}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Save size={20} /> Update Residential Info
                        </button>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="tab-content">
                        <h2>Security Settings</h2>

                        <div className="security-section">
                            <h3>Reset PIN</h3>
                            <p className="section-note">Your PIN is required for all dashboard updates. Default PIN is 0000. Reset it to a custom value.</p>

                            {pinSuccess && (
                                <div className="success-message">PIN updated successfully! Use your new PIN for future updates.</div>
                            )}

                            <div className="form-group">
                                <label>National Identification Number (NIN)</label>
                                <input
                                    type="text"
                                    placeholder="Enter your NIN"
                                    value={pinData.nin}
                                    onChange={(e) => setPinData(prev => ({ ...prev, nin: e.target.value }))}
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    placeholder="Enter your phone number"
                                    value={pinData.phone_number}
                                    onChange={(e) => setPinData(prev => ({ ...prev, phone_number: e.target.value }))}
                                />
                            </div>

                            <div className="form-group">
                                <label>Current PIN</label>
                                <input
                                    type="password"
                                    placeholder="Enter your current PIN"
                                    value={pinData.old_pin}
                                    onChange={(e) => setPinData(prev => ({ ...prev, old_pin: e.target.value }))}
                                />
                            </div>

                            <div className="form-group">
                                <label>New PIN</label>
                                <input
                                    type="password"
                                    placeholder="Enter your new PIN (4 digits recommended)"
                                    value={pinData.new_pin}
                                    onChange={(e) => setPinData(prev => ({ ...prev, new_pin: e.target.value }))}
                                />
                            </div>

                            <div className="form-group">
                                <label>Confirm New PIN</label>
                                <input
                                    type="password"
                                    placeholder="Confirm your new PIN"
                                    value={pinData.confirm_pin}
                                    onChange={(e) => setPinData(prev => ({ ...prev, confirm_pin: e.target.value }))}
                                />
                            </div>

                            <button
                                className="btn-primary"
                                onClick={handlePinReset}
                                disabled={!pinData.nin || !pinData.phone_number || !pinData.old_pin || !pinData.new_pin || updatingPin}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Lock size={20} /> Update PIN
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
