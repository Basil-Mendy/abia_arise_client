import { useState, useEffect } from 'react'
import axios from 'axios'
import { Users, Settings, Edit2, Trash2, Plus, Upload, ChevronLeft, Save, X, AlertCircle, FileText, Download } from 'lucide-react'
import { getFullURL, getFileURL } from '../utils/apiConfig'
import './GroupDashboard.css'

export default function GroupDashboard({ groupId, userRole, onLogout }) {
    const [group, setGroup] = useState(null)
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('overview')
    const [showPolicyError, setPolicyError] = useState(false)
    const [password, setPassword] = useState('')

    // Logo update
    const [logoFile, setLogoFile] = useState(null)
    const [updatingLogo, setUpdatingLogo] = useState(false)

    // Address update
    const [addressData, setAddressData] = useState('')
    const [updatingAddress, setUpdatingAddress] = useState(false)

    // Certificate
    const [certificate, setCertificate] = useState(null)
    const [generatingCert, setGeneratingCert] = useState(false)
    const [loadingCert, setLoadingCert] = useState(false)
    const [certError, setCertError] = useState(null)

    // Member edit modal
    const [editingMember, setEditingMember] = useState(null)
    const [editMemberData, setEditMemberData] = useState({})

    const isAdminRole = userRole === 'chairman' || userRole === 'secretary'

    useEffect(() => {
        loadDashboard()
        loadCertificate()
    }, [groupId])

    const loadDashboard = async () => {
        try {
            setLoading(true)
            const response = await axios.get(
                getFullURL('/auth/groups/dashboard/'),
                { params: { group_id: groupId } }
            )
            if (response.data.success) {
                setGroup(response.data.data)
                setMembers(response.data.data.members || [])
                setAddressData(response.data.data.address)
            }
        } catch (err) {
            setError('Failed to load dashboard. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const loadCertificate = async () => {
        try {
            setLoadingCert(true)
            setCertError(null)
            console.log(`[Certificate] Loading for group: ${groupId}`)
            const response = await axios.get(
                getFullURL('/auth/groups/get_certificate/'),
                { params: { group_id: groupId } }
            )
            console.log('[Certificate] API Response:', response.data)
            if (response.data.success && response.data.certificate_url) {
                setCertificate(response.data.certificate_url)
                console.log('[Certificate] Successfully loaded:', response.data.certificate_url)
            } else {
                setCertError(response.data.message || 'Certificate not available')
                console.warn('[Certificate] No certificate available:', response.data.message)
            }
        } catch (err) {
            console.error('[Certificate] Error:', err.message, err.response?.data)
            setCertError(err.response?.data?.message || 'Failed to load certificate. Please try again.')
        } finally {
            setLoadingCert(false)
        }
    }

    const verifyPassword = () => {
        if (!password) {
            setPolicyError(true)
            setTimeout(() => setPolicyError(false), 3000)
            return false
        }
        return true
    }

    const downloadCertificate = () => {
        if (certificate) {
            try {
                const fullUrl = getFileURL(certificate)
                console.log('[Certificate Download] URL:', fullUrl)
                const link = document.createElement('a')
                link.href = fullUrl
                link.download = `Certificate_${groupId}.png`
                link.target = '_blank'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                console.log('[Certificate Download] Success')
            } catch (err) {
                console.error('[Certificate Download] Error:', err)
            }
        } else {
            console.warn('[Certificate Download] No certificate URL available')
        }
    }

    const refreshCertificate = async () => {
        await loadCertificate()
    }

    const handleLogoUpdate = async () => {
        if (!verifyPassword()) return

        try {
            setUpdatingLogo(true)
            const formData = new FormData()
            formData.append('group_id', groupId)
            formData.append('password', password)
            formData.append('logo', logoFile)

            const response = await axios.post(
                getFullURL('/auth/groups/update_logo/'),
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )

            if (response.data.success) {
                setGroup(prev => ({ ...prev, logo: response.data.logo_url }))
                setLogoFile(null)
                setPassword('')
                alert('Logo updated successfully!')
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update logo')
        } finally {
            setUpdatingLogo(false)
        }
    }

    const handleAddressUpdate = async () => {
        if (!verifyPassword()) return

        try {
            setUpdatingAddress(true)
            const response = await axios.post(
                getFullURL('/auth/groups/update_address/'),
                {
                    group_id: groupId,
                    password: password,
                    address: addressData
                }
            )

            if (response.data.success) {
                setGroup(prev => ({ ...prev, address: response.data.address }))
                setPassword('')
                alert('Address updated successfully!')
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update address')
        } finally {
            setUpdatingAddress(false)
        }
    }

    const handleEditMember = (member) => {
        setEditingMember(member.id)
        setEditMemberData(member)
    }

    const handleSaveMember = async () => {
        // TODO: Implement member update API call
        alert('Member update feature coming soon!')
    }

    const handleDeleteMember = async (memberId) => {
        if (!window.confirm('Are you sure you want to remove this member?')) return
        // TODO: Implement member delete API call
        alert('Member delete feature coming soon!')
    }

    if (loading) return <div className="dashboard-loading">Loading group dashboard...</div>
    if (error) return <div className="dashboard-error">{error}</div>
    if (!group) return <div className="dashboard-error">No group data found</div>

    return (
        <div className="group-dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    {group.logo && (
                        <img src={group.logo} alt="Group Logo" className="group-logo-header" />
                    )}
                    <div>
                        <h1>{group.name}</h1>
                        <p className="group-info">License: {group.group_license_number} | LGA: {group.lga}</p>
                    </div>
                </div>
                <button className="btn-logout" onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ChevronLeft size={20} /> Logout
                </button>
            </div>

            <div className="group-stats">
                <div className="stat-card">
                    <Users size={24} />
                    <div>
                        <p className="stat-label">Total Members</p>
                        <p className="stat-value">{group.member_count}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div>
                        <p className="stat-label">Chairman</p>
                        <p className="stat-value">{group.chairman_name}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div>
                        <p className="stat-label">Secretary</p>
                        <p className="stat-value">{group.secretary_name}</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-tabs">
                <button
                    className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`tab ${activeTab === 'members' ? 'active' : ''}`}
                    onClick={() => setActiveTab('members')}
                >
                    Members
                </button>
                <button
                    className={`tab ${activeTab === 'certificate' ? 'active' : ''}`}
                    onClick={() => setActiveTab('certificate')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <FileText size={18} /> Certificate
                </button>
                {isAdminRole && (
                    <button
                        className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Settings size={18} /> Settings
                    </button>
                )}
            </div>

            <div className="dashboard-content">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="tab-content">
                        <h2>Group Overview</h2>

                        <div className="overview-grid">
                            <div className="overview-card">
                                <h3>Group Information</h3>
                                <div className="info-item">
                                    <label>Name</label>
                                    <p>{group.name}</p>
                                </div>
                                <div className="info-item">
                                    <label>License Number</label>
                                    <p>{group.group_license_number}</p>
                                </div>
                                <div className="info-item">
                                    <label>LGA</label>
                                    <p>{group.lga}</p>
                                </div>
                                <div className="info-item">
                                    <label>Total Members</label>
                                    <p>{group.member_count}</p>
                                </div>
                            </div>

                            <div className="overview-card">
                                <h3>Leadership</h3>
                                <div className="info-item">
                                    <label>Chairman</label>
                                    <p>{group.chairman_name}</p>
                                    <small>{group.chairman_email}</small>
                                </div>
                                <div className="info-item">
                                    <label>Secretary</label>
                                    <p>{group.secretary_name}</p>
                                    <small>{group.secretary_email}</small>
                                </div>
                            </div>

                            {group.logo && (
                                <div className="overview-card logo-card">
                                    <h3>Group Logo</h3>
                                    <img src={group.logo} alt="Group Logo" className="group-logo-large" />
                                </div>
                            )}
                        </div>

                        <div className="address-section">
                            <h3>Group Address</h3>
                            <p>{group.address}</p>
                        </div>
                    </div>
                )}

                {/* Members Tab */}
                {activeTab === 'members' && (
                    <div className="tab-content">
                        <h2>Group Members ({group.member_count})</h2>

                        {members.length === 0 ? (
                            <p className="no-members">No members yet</p>
                        ) : (
                            <div className="members-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>LGA</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            {isAdminRole && <th>Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.map(member => (
                                            <tr key={member.id}>
                                                <td className="id-cell">{member.abia_arise_id}</td>
                                                <td>{member.first_name} {member.last_name}</td>
                                                <td>{member.email}</td>
                                                <td>{member.phone_number}</td>
                                                <td>{member.lga_of_origin}</td>
                                                <td>
                                                    <span className={`role-badge ${member.role}`}>
                                                        {member.role}
                                                    </span>
                                                </td>
                                                <td>
                                                    {member.is_group_member ? (
                                                        <span className="status-badge active">Active</span>
                                                    ) : (
                                                        <span className="status-badge inactive">Inactive</span>
                                                    )}
                                                </td>
                                                {isAdminRole && (
                                                    <td className="actions-cell">
                                                        <button
                                                            className="btn-icon-edit"
                                                            onClick={() => handleEditMember(member)}
                                                            title="Edit member"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            className="btn-icon-delete"
                                                            onClick={() => handleDeleteMember(member.id)}
                                                            title="Remove member"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Certificate Tab */}
                {activeTab === 'certificate' && (
                    <div className="tab-content">
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FileText size={24} /> Group Registration Certificate
                        </h2>

                        <div className="certificate-section">
                            <p className="section-note">Your group's registration certificate is automatically generated upon registration and stored securely.</p>

                            {loadingCert && (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <p>Loading certificate...</p>
                                </div>
                            )}

                            {!loadingCert && certError && (
                                <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '1rem', borderRadius: '4px' }}>
                                    <AlertCircle size={18} /> {certError}
                                </div>
                            )}

                            {!loadingCert && certificate && (
                                <div className="certificate-display" style={{ marginTop: '2rem' }}>
                                    <div className="generated-certificate">
                                        <h3>✓ Certificate Available</h3>
                                        <div className="certificate-preview" style={{ marginBottom: '1.5rem', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                            <img
                                                src={getFileURL(certificate)}
                                                alt="Certificate"
                                                style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                                            />
                                        </div>
                                        <button
                                            onClick={downloadCertificate}
                                            className="btn-primary"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginRight: '0.5rem' }}
                                        >
                                            <Download size={18} /> Download Certificate
                                        </button>
                                        <button
                                            onClick={refreshCertificate}
                                            className="btn-secondary"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            ⟳ Refresh
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {isAdminRole && activeTab === 'settings' && (
                    <div className="tab-content">
                        <h2>Group Settings</h2>
                        <p className="section-note">Only group chairman and secretary can modify these settings.</p>

                        {/* Logo Update */}
                        <div className="settings-section">
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Upload size={20} /> Update Group Logo
                            </h3>

                            {group.logo && (
                                <div className="current-logo">
                                    <p>Current Logo:</p>
                                    <img src={group.logo} alt="Current Logo" />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Select new logo</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                                />
                                {logoFile && (
                                    <p className="file-name">Selected: {logoFile.name}</p>
                                )}
                            </div>

                            {showPolicyError && (
                                <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={18} /> Password required
                                </div>
                            )}

                            <div className="form-group">
                                <label>Enter password (last 4 digits of phone)</label>
                                <input
                                    type="password"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <button
                                className="btn-primary"
                                onClick={handleLogoUpdate}
                                disabled={!logoFile || !password || updatingLogo}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Save size={20} /> Update Logo
                            </button>
                        </div>

                        {/* Address Update */}
                        <div className="settings-section">
                            <h3>Update Group Address</h3>

                            <div className="form-group">
                                <label>Group Address</label>
                                <textarea
                                    value={addressData}
                                    onChange={(e) => setAddressData(e.target.value)}
                                    rows="4"
                                />
                            </div>

                            {showPolicyError && (
                                <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={18} /> Password required
                                </div>
                            )}

                            <div className="form-group">
                                <label>Enter password (last 4 digits of phone)</label>
                                <input
                                    type="password"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <button
                                className="btn-primary"
                                onClick={handleAddressUpdate}
                                disabled={!password || updatingAddress}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Save size={20} /> Update Address
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
