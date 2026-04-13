import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './GroupDashboard.css'
import { Edit2, LogOut, Users, FileText, Download, Upload, Trash2 } from 'lucide-react'

const API_BASE = 'http://localhost:8000/api/auth'

export default function GroupDashboard() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('overview')
    const [groupData, setGroupData] = useState(null)
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState(null)
    const [showEditGroup, setShowEditGroup] = useState(false)

    // Excel file upload states
    const [excelFile, setExcelFile] = useState(null)
    const [excelLoading, setExcelLoading] = useState(false)
    const [showReuploadForm, setShowReuploadForm] = useState(false)
    const [resetPinInput, setResetPinInput] = useState('')
    const [groupCertificate, setGroupCertificate] = useState(null)
    const [certificateLoading, setCertificateLoading] = useState(false)

    // Reset PIN generation states
    const [showGeneratePinForm, setShowGeneratePinForm] = useState(false)
    const [generatePinStep, setGeneratePinStep] = useState('desire') // 'desire' or 'otp'
    const [desiredPin, setDesiredPin] = useState('')
    const [otpInput, setOtpInput] = useState('')
    const [generatePinLoading, setGeneratePinLoading] = useState(false)

    // Form states
    const [groupForm, setGroupForm] = useState({
        name: '',
        address: '',
        total_members: ''
    })

    const userRole = localStorage.getItem('userRole') || 'member'
    const userPassword = localStorage.getItem('userPassword') || ''

    // Get group data from localStorage - handle parsing safely
    let groupId = null
    let groupInitials = ''
    try {
        const userData = localStorage.getItem('user')
        if (userData) {
            const user = JSON.parse(userData)
            groupId = user.group_license_number
            groupInitials = user.name.split(' ').slice(0, 2).map(n => n[0]).join('')
        }
    } catch (e) {
        console.error('Error parsing user data from localStorage:', e)
    }

    useEffect(() => {
        if (!localStorage.getItem('authToken')) {
            navigate('/login')
            return
        }
        if (!groupId) {
            console.error('No group ID found in localStorage')
            setMessage({ type: 'error', text: 'Group ID not found. Please log in again.' })
            setLoading(false)
            return
        }
        fetchGroupData()
    }, [groupId])

    const fetchGroupData = async () => {
        if (!groupId) {
            console.error('fetchGroupData called but groupId is not set')
            setMessage({ type: 'error', text: 'Group ID is missing' })
            setLoading(false)
            return
        }

        try {
            console.log('Fetching group data for groupId:', groupId)
            const response = await axios.get(
                `${API_BASE}/groups/dashboard/`,
                { params: { group_id: groupId } }
            )
            console.log('Group data response:', response.data)

            if (response.data && response.data.data) {
                const group = response.data.data
                setGroupData(group)
                setMembers(group.members || [])
                setGroupForm({
                    name: group.name || '',
                    address: group.address || '',
                    total_members: group.total_members || ''
                })
            } else {
                console.error('Unexpected response structure:', response.data)
                setMessage({ type: 'error', text: 'Unexpected response from server' })
            }
        } catch (error) {
            console.error('Error fetching group data:', error)
            console.error('Error response:', error.response?.data)
            console.error('Error status:', error.response?.status)
            const errorMsg = error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to load group details'
            setMessage({ type: 'error', text: errorMsg })
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        localStorage.removeItem('userType')
        localStorage.removeItem('userRole')
        localStorage.removeItem('userPassword')
        navigate('/login')
    }

    // Excel Upload Handler
    const handleExcelUpload = async (e) => {
        e.preventDefault()
        if (!excelFile) {
            setMessage({ type: 'error', text: 'Please select an Excel file' })
            return
        }
        if (!resetPinInput) {
            setMessage({ type: 'error', text: 'Reset PIN is required' })
            return
        }

        setExcelLoading(true)
        const formData = new FormData()
        formData.append('excel_file', excelFile)
        formData.append('group_id', groupId)
        formData.append('password', resetPinInput)

        try {
            const response = await axios.post(
                `${API_BASE}/groups/upload_members/`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Excel file uploaded and processed successfully!' })
                setExcelFile(null)
                setResetPinInput('')
                setShowReuploadForm(false)
                fetchGroupData()
            } else {
                setMessage({ type: 'error', text: response.data.message || 'Upload failed' })
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to upload Excel file'
            setMessage({ type: 'error', text: errorMsg })
        } finally {
            setExcelLoading(false)
        }
    }

    // Download Certificate Handler
    const handleDownloadCertificate = async () => {
        if (!resetPinInput) {
            setMessage({ type: 'error', text: 'Reset PIN is required to download certificate' })
            return
        }

        setCertificateLoading(true)
        try {
            const response = await axios.post(
                `${API_BASE}/groups/download_certificate/`,
                {
                    group_id: groupId,
                    password: resetPinInput
                },
                { responseType: 'blob' }
            )

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `${groupData.name}_certificate.pdf`)
            document.body.appendChild(link)
            link.click()
            link.parentNode.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to download certificate'
            setMessage({ type: 'error', text: errorMsg })
        } finally {
            setCertificateLoading(false)
        }
    }

    // Delete Excel File Handler
    const handleDeleteExcelFile = async () => {
        if (!window.confirm('Are you sure you want to delete the current members file?')) return

        if (!resetPinInput) {
            setMessage({ type: 'error', text: 'Reset PIN is required to delete the file' })
            return
        }

        try {
            const response = await axios.post(
                `${API_BASE}/groups/delete_excel_file/`,
                {
                    group_id: groupId,
                    password: resetPinInput
                }
            )

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Members file deleted successfully' })
                setResetPinInput('')
                fetchGroupData()
            } else {
                setMessage({ type: 'error', text: response.data.message || 'Failed to delete file' })
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Failed to delete file'
            setMessage({ type: 'error', text: errorMsg })
        }
    }

    // Generate Reset PIN
    const handleGenerateResetPin = async (e) => {
        e.preventDefault()
        if (generatePinStep === 'desire') {
            if (!userPassword) {
                setMessage({ type: 'error', text: 'Please log in first with your chairman/secretary password' })
                return
            }

            if (desiredPin.length !== 6 || !/^\d+$/.test(desiredPin)) {
                setMessage({ type: 'error', text: 'PIN must be 6 digits' })
                return
            }

            setGeneratePinLoading(true)

            try {
                const response = await axios.post(
                    `${API_BASE}/groups/generate_reset_pin/`,
                    {
                        group_id: groupId,
                        password: userPassword,
                        desired_pin: desiredPin
                    }
                )

                if (response.data.success) {
                    setGeneratePinStep('otp')
                    setMessage({ type: 'success', text: 'OTP sent to chairman and secretary emails' })
                } else {
                    setMessage({ type: 'error', text: response.data.message })
                }
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to generate PIN' })
            } finally {
                setGeneratePinLoading(false)
            }
        } else if (generatePinStep === 'otp') {
            if (otpInput.length !== 6 || !/^\d+$/.test(otpInput)) {
                setMessage({ type: 'error', text: 'OTP must be 6 digits' })
                return
            }

            setGeneratePinLoading(true)

            try {
                const response = await axios.post(
                    `${API_BASE}/groups/verify_reset_pin_otp/`,
                    {
                        group_id: groupId,
                        otp: otpInput
                    }
                )

                if (response.data.success) {
                    setMessage({ type: 'success', text: 'Reset PIN generated successfully!' })
                    setShowGeneratePinForm(false)
                    setGeneratePinStep('desire')
                    setDesiredPin('')
                    setOtpInput('')
                } else {
                    setMessage({ type: 'error', text: response.data.message })
                }
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to verify OTP' })
            } finally {
                setGeneratePinLoading(false)
            }
        }
    }

    if (loading) {
        return <div className="group-dashboard loading">Loading...</div>
    }

    if (!groupData) {
        return <div className="group-dashboard error">Error loading group data</div>
    }

    // Calculate member stats
    const totalMembers = members.length

    return (
        <div className="group-dashboard">
            {message && (
                <div className={`alert alert-${message.type}`}>
                    {message.text}
                    <button onClick={() => setMessage(null)}>&times;</button>
                </div>
            )}

            <div className="dashboard-header">
                <div className="header-left">
                    <div className="profile-avatar">
                        {groupData.logo ? (
                            <img src={groupData.logo} alt="Group Logo" />
                        ) : (
                            <div className="avatar-initials">{groupInitials}</div>
                        )}
                    </div>
                </div>
                <div className="header-middle">
                    <h1>{groupData.name}</h1>
                    <p className="location">{groupData.lga}, Abia State</p>
                    <p className="member-id">GL: {groupData.group_license_number}</p>
                </div>
                <div className="header-actions">
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span className="action-text">Logout</span>
                    </button>
                </div>
            </div>

            {/* Edit Group Form */}
            {showEditGroup && userRole === 'chairman' && (
                <div className="edit-group-form-container">
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        // Handle update
                    }} className="edit-group-form">
                        <h3>Edit Group Information</h3>
                        <div className="form-group">
                            <label>Group Name</label>
                            <input
                                type="text"
                                value={groupForm.name}
                                onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Address</label>
                            <textarea
                                value={groupForm.address}
                                onChange={(e) => setGroupForm({ ...groupForm, address: e.target.value })}
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn-primary">Save Changes</button>
                            <button type="button" className="btn-secondary" onClick={() => setShowEditGroup(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="dashboard-content">
                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
                        onClick={() => setActiveTab('members')}
                    >
                        <Users size={18} /> Members ({totalMembers})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'leadership' ? 'active' : ''}`}
                        onClick={() => setActiveTab('leadership')}
                    >
                        Leadership
                    </button>
                </div>

                <div className="tab-content">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="overview-tab">
                            <div className="group-card">
                                <h2>Group Information</h2>
                                <div className="info-grid">
                                    <div className="info-group">
                                        <label>Group Name</label>
                                        <p>{groupData.name}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>License Number</label>
                                        <p>{groupData.group_license_number}</p>
                                    </div>
                                    <div className="info-group">
                                        <label>LGA</label>
                                        <p>{groupData.lga}</p>
                                    </div>
                                    <div className="info-group full-width">
                                        <label>Address</label>
                                        <p>{groupData.address}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-number">{totalMembers}</div>
                                    <div className="stat-label">Total Members</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Registered</div>
                                    <div className="stat-value">{groupData.registered_date}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Members Tab */}
                    {activeTab === 'members' && (
                        <div className="members-tab">
                            <div className="group-card">
                                <h2>Members Management</h2>
                                <p className="subtitle">Upload and manage group members via Excel sheet</p>

                                {/* Excel File Upload Section */}
                                {!showReuploadForm ? (
                                    <div className="excel-upload-section">
                                        <h3><Upload size={20} /> Upload Members from Excel</h3>
                                        <p className="instructions">Excel sheet must include a serial number column (compulsory). The system will read and count total members.</p>

                                        {userRole === 'chairman' && (
                                            <form onSubmit={handleExcelUpload} className="excel-upload-form">
                                                <div className="form-group">
                                                    <label>Excel File *</label>
                                                    <input
                                                        type="file"
                                                        accept=".xlsx,.xls"
                                                        onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Reset PIN (6 digits) *</label>
                                                    <input
                                                        type="password"
                                                        value={resetPinInput}
                                                        onChange={(e) => setResetPinInput(e.target.value.slice(0, 6))}
                                                        placeholder="Required for upload"
                                                        maxLength="6"
                                                        required
                                                    />
                                                </div>
                                                <div className="form-actions">
                                                    <button type="submit" disabled={excelLoading} className="btn-primary">
                                                        {excelLoading ? 'Uploading...' : 'Upload Excel'}
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                ) : null}

                                {/* Excel File Info & Download Section */}
                                {groupData.excel_file_url && (
                                    <div className="excel-file-section">
                                        <h3><FileText size={20} /> Current Members File</h3>
                                        <div className="file-info">
                                            <p><strong>Total Members:</strong> {groupData.total_members || 'Loading...'}</p>
                                            <div className="file-actions">
                                                <a
                                                    href={groupData.excel_file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-secondary"
                                                >
                                                    <Download size={16} /> Download
                                                </a>
                                                {userRole === 'chairman' && (
                                                    <>
                                                        <button
                                                            className="btn-primary"
                                                            onClick={() => setShowReuploadForm(true)}
                                                        >
                                                            <Upload size={16} /> Re-upload File
                                                        </button>
                                                        <button
                                                            className="btn-delete-file"
                                                            onClick={handleDeleteExcelFile}
                                                        >
                                                            <Trash2 size={16} /> Delete File
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        {userRole === 'chairman' && (
                                            <div className="form-group" style={{ marginTop: '16px' }}>
                                                <label>Reset PIN Required (for delete/re-upload)</label>
                                                <input
                                                    type="password"
                                                    value={resetPinInput}
                                                    onChange={(e) => setResetPinInput(e.target.value.slice(0, 6))}
                                                    placeholder="Enter 6-digit PIN"
                                                    maxLength="6"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Re-upload Form */}
                                {showReuploadForm && userRole === 'chairman' && (
                                    <div className="reupload-section">
                                        <h3>Replace Members File</h3>
                                        <form onSubmit={handleExcelUpload} className="excel-upload-form">
                                            <div className="form-group">
                                                <label>New Excel File *</label>
                                                <input
                                                    type="file"
                                                    accept=".xlsx,.xls"
                                                    onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Reset PIN (6 digits) *</label>
                                                <input
                                                    type="password"
                                                    value={resetPinInput}
                                                    onChange={(e) => setResetPinInput(e.target.value.slice(0, 6))}
                                                    placeholder="Required for upload"
                                                    maxLength="6"
                                                    required
                                                />
                                            </div>
                                            <div className="form-actions">
                                                <button type="submit" disabled={excelLoading} className="btn-primary">
                                                    {excelLoading ? 'Uploading...' : 'Replace File'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-secondary"
                                                    onClick={() => {
                                                        setShowReuploadForm(false)
                                                        setExcelFile(null)
                                                        setResetPinInput('')
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Leadership Tab */}
                    {activeTab === 'leadership' && (
                        <div className="leadership-tab">
                            <div className="group-card">
                                <h2>Group Leadership</h2>

                                <div className="leadership-grid">
                                    {/* Chairman */}
                                    <div className="leadership-position">
                                        <h3>Chairman</h3>
                                        <div className="position-details">
                                            <p className="name">{groupData.chairman_name}</p>
                                            <p className="contact">{groupData.chairman_phone}</p>
                                            <p className="email">{groupData.chairman_email}</p>
                                            <p className="address">{groupData.chairman_residential_address}</p>
                                        </div>
                                    </div>

                                    {/* Secretary */}
                                    <div className="leadership-position">
                                        <h3>Secretary</h3>
                                        <div className="position-details">
                                            <p className="name">{groupData.secretary_name}</p>
                                            <p className="contact">{groupData.secretary_phone}</p>
                                            <p className="email">{groupData.secretary_email}</p>
                                            <p className="address">{groupData.secretary_residential_address}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Group Certificate Section */}
                            <div className="group-card certificate-section">
                                <h3><FileText size={20} /> Group Certificate</h3>
                                <p>Download the official group certificate</p>
                                <div className="certificate-actions">
                                    <div className="form-group">
                                        <label>Reset PIN Required *</label>
                                        <input
                                            type="password"
                                            value={resetPinInput}
                                            onChange={(e) => setResetPinInput(e.target.value.slice(0, 6))}
                                            placeholder="Enter 6-digit PIN"
                                            maxLength="6"
                                        />
                                    </div>
                                    <button
                                        className="btn-primary"
                                        onClick={handleDownloadCertificate}
                                        disabled={certificateLoading || !resetPinInput}
                                    >
                                        <Download size={18} /> {certificateLoading ? 'Downloading...' : 'Download Certificate'}
                                    </button>
                                </div>
                            </div>

                            {/* Reset PIN Generation Section */}
                            {userRole === 'chairman' && (
                                <div className="group-card reset-pin-section">
                                    <h3>Reset PIN Management</h3>
                                    <p className="subtitle">Generate a new reset PIN for making changes to group dashboard</p>
                                    {!showGeneratePinForm ? (
                                        <button
                                            className="btn-primary"
                                            onClick={() => setShowGeneratePinForm(true)}
                                        >
                                            Generate Reset PIN
                                        </button>
                                    ) : (
                                        <form onSubmit={handleGenerateResetPin} className="generate-pin-form">
                                            {generatePinStep === 'desire' && (
                                                <>
                                                    <div className="form-group">
                                                        <label>Enter Desired PIN (6 digits)</label>
                                                        <input
                                                            type="password"
                                                            value={desiredPin}
                                                            onChange={(e) => setDesiredPin(e.target.value.slice(0, 6))}
                                                            placeholder="6 digits"
                                                            maxLength="6"
                                                            required
                                                        />
                                                        <p className="help-text">An OTP will be sent to both chairman and secretary emails</p>
                                                    </div>
                                                </>
                                            )}
                                            {generatePinStep === 'otp' && (
                                                <>
                                                    <div className="form-group">
                                                        <label>Enter OTP (check your email)</label>
                                                        <input
                                                            type="text"
                                                            value={otpInput}
                                                            onChange={(e) => setOtpInput(e.target.value.slice(0, 6))}
                                                            placeholder="6 digit OTP"
                                                            maxLength="6"
                                                            required
                                                        />
                                                    </div>
                                                </>
                                            )}
                                            <div className="form-actions">
                                                <button type="submit" disabled={generatePinLoading} className="btn-primary">
                                                    {generatePinLoading ? 'Processing...' : (generatePinStep === 'desire' ? 'Send OTP' : 'Verify OTP')}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-secondary"
                                                    onClick={() => {
                                                        setShowGeneratePinForm(false)
                                                        setGeneratePinStep('desire')
                                                        setDesiredPin('')
                                                        setOtpInput('')
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
