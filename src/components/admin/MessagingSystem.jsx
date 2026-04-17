import { useState, useEffect } from 'react'
import axios from 'axios'
import { Mail, Send } from 'lucide-react'
import { getFullURL } from '../../utils/apiConfig'
import './MessagingSystem.css'

export default function MessagingSystem() {
    const [recipientType, setRecipientType] = useState('all') // 'all', 'members', 'groups', 'specific'
    const [members, setMembers] = useState([])
    const [groups, setGroups] = useState([])
    const [selectedMembers, setSelectedMembers] = useState([])
    const [selectedGroups, setSelectedGroups] = useState([])
    const [filters, setFilters] = useState({
        lga: '',
        ward: ''
    })
    const [messageData, setMessageData] = useState({
        subject: '',
        message: ''
    })
    const [loading, setLoading] = useState(false)
    const [fetchLoading, setFetchLoading] = useState(true)
    const [successMessage, setSuccessMessage] = useState(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setFetchLoading(true)
            const token = localStorage.getItem('authToken')
            const headers = { Authorization: `Bearer ${token}` }

            const [membersRes, groupsRes] = await Promise.all([
                axios.get(getFullURL('/api/auth/members/'), { headers }),
                axios.get(getFullURL('/api/auth/groups/'), { headers })
            ])

            // Handle both paginated responses (object with .results) and plain arrays
            const memberData = Array.isArray(membersRes.data) ? membersRes.data : (membersRes.data.results || [])
            const groupData = Array.isArray(groupsRes.data) ? groupsRes.data : (groupsRes.data.results || [])

            setMembers(memberData)
            setGroups(groupData)
        } catch (err) {
            console.error('Error fetching data:', err)
        } finally {
            setFetchLoading(false)
        }
    }

    const handleMessageChange = (e) => {
        const { name, value } = e.target
        setMessageData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleMemberToggle = (memberId) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        )
    }

    const handleGroupToggle = (groupId) => {
        setSelectedGroups(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        )
    }

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const getFilteredMembers = () => {
        let filtered = members
        if (filters.lga) {
            filtered = filtered.filter(m => m.lga === filters.lga)
        }
        if (filters.ward) {
            filtered = filtered.filter(m => m.ward === filters.ward)
        }
        return filtered
    }

    const getRecipientEmails = () => {
        const emails = []

        if (recipientType === 'all') {
            members.forEach(m => {
                if (m.email) emails.push(m.email)
            })
            groups.forEach(g => {
                if (g.chairman_email) emails.push(g.chairman_email)
                if (g.secretary_email && g.secretary_email !== g.chairman_email) {
                    emails.push(g.secretary_email)
                }
            })
        } else if (recipientType === 'members') {
            members.forEach(m => {
                if (m.email) emails.push(m.email)
            })
        } else if (recipientType === 'groups') {
            selectedGroups.forEach(groupId => {
                const group = groups.find(g => g.id === groupId)
                if (group) {
                    if (group.chairman_email) emails.push(group.chairman_email)
                    if (group.secretary_email && group.secretary_email !== group.chairman_email) {
                        emails.push(group.secretary_email)
                    }
                }
            })
        } else if (recipientType === 'specific') {
            selectedMembers.forEach(memberId => {
                const member = members.find(m => m.id === memberId)
                if (member && member.email) emails.push(member.email)
            })
        }

        return [...new Set(emails)] // Remove duplicates
    }

    const handleSendEmail = async (e) => {
        e.preventDefault()

        if (!messageData.subject.trim()) {
            alert('Please enter a subject')
            return
        }

        if (!messageData.message.trim()) {
            alert('Please enter a message')
            return
        }

        const recipients = getRecipientEmails()
        if (recipients.length === 0) {
            alert(`No recipients selected for ${recipientType} messaging`)
            return
        }

        try {
            setLoading(true)

            await axios.post(
                getFullURL('/messaging/send-email/'),
                {
                    recipients: recipients,
                    subject: messageData.subject,
                    message: messageData.message,
                    recipient_type: recipientType
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`
                    }
                }
            )

            setSuccessMessage(`Email sent to ${recipients.length} recipient(s)!`)
            setMessageData({ subject: '', message: '' })
            setSelectedMembers([])
            setSelectedGroups([])

            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err) {
            console.error('Error sending email:', err)
            alert('Failed to send email. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (fetchLoading) {
        return <div className="management-loading">Loading messaging system...</div>
    }

    return (
        <div className="messaging-system">
            <div className="management-header">
                <h2>✉️ Messaging System</h2>
                <p className="subtitle">Send emails to members and group leaders</p>
            </div>

            {successMessage && (
                <div className="success-message">{successMessage}</div>
            )}

            <div className="messaging-container">
                <form onSubmit={handleSendEmail} className="messaging-form">
                    {/* Recipient Type Selector */}
                    <div className="section">
                        <h3>Who do you want to message?</h3>
                        <div className="recipient-types">
                            <label className="recipient-option">
                                <input
                                    type="radio"
                                    name="recipientType"
                                    value="all"
                                    checked={recipientType === 'all'}
                                    onChange={(e) => setRecipientType(e.target.value)}
                                />
                                <span>All Members & Group Leaders</span>
                            </label>
                            <label className="recipient-option">
                                <input
                                    type="radio"
                                    name="recipientType"
                                    value="members"
                                    checked={recipientType === 'members'}
                                    onChange={(e) => setRecipientType(e.target.value)}
                                />
                                <span>All Members Only</span>
                            </label>
                            <label className="recipient-option">
                                <input
                                    type="radio"
                                    name="recipientType"
                                    value="groups"
                                    checked={recipientType === 'groups'}
                                    onChange={(e) => setRecipientType(e.target.value)}
                                />
                                <span>Specific Groups</span>
                            </label>
                            <label className="recipient-option">
                                <input
                                    type="radio"
                                    name="recipientType"
                                    value="specific"
                                    checked={recipientType === 'specific'}
                                    onChange={(e) => setRecipientType(e.target.value)}
                                />
                                <span>Specific Members</span>
                            </label>
                        </div>
                    </div>

                    {/* Group Selection */}
                    {recipientType === 'groups' && (
                        <div className="section">
                            <h3>Select Groups</h3>
                            <div className="selection-list">
                                {groups.map(group => (
                                    <label key={group.id} className="selection-item">
                                        <input
                                            type="checkbox"
                                            checked={selectedGroups.includes(group.id)}
                                            onChange={() => handleGroupToggle(group.id)}
                                        />
                                        <span>{group.group_name}</span>
                                    </label>
                                ))}
                            </div>
                            <p className="selection-count">Selected: {selectedGroups.length} group(s)</p>
                        </div>
                    )}

                    {/* Member Selection */}
                    {recipientType === 'specific' && (
                        <div className="section">
                            <h3>Select Members</h3>
                            <div className="member-filters">
                                <input
                                    type="text"
                                    placeholder="Filter by LGA"
                                    value={filters.lga}
                                    onChange={(e) => handleFilterChange('lga', e.target.value)}
                                    className="filter-input"
                                />
                                <input
                                    type="text"
                                    placeholder="Filter by Ward"
                                    value={filters.ward}
                                    onChange={(e) => handleFilterChange('ward', e.target.value)}
                                    className="filter-input"
                                />
                            </div>
                            <div className="selection-list">
                                {getFilteredMembers().map(member => (
                                    <label key={member.id} className="selection-item">
                                        <input
                                            type="checkbox"
                                            checked={selectedMembers.includes(member.id)}
                                            onChange={() => handleMemberToggle(member.id)}
                                        />
                                        <span>{member.full_name} ({member.email})</span>
                                    </label>
                                ))}
                            </div>
                            <p className="selection-count">Selected: {selectedMembers.length} member(s)</p>
                        </div>
                    )}

                    {/* Email Compose */}
                    <div className="section">
                        <h3>Compose Message</h3>
                        <div className="form-group">
                            <label htmlFor="subject">
                                <strong>Subject</strong>
                                <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={messageData.subject}
                                onChange={handleMessageChange}
                                placeholder="Enter email subject..."
                                maxLength="100"
                            />
                            <span className="char-count">{messageData.subject.length}/100</span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">
                                <strong>Message</strong>
                                <span className="required">*</span>
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={messageData.message}
                                onChange={handleMessageChange}
                                placeholder="Enter your message..."
                                rows="8"
                                maxLength="5000"
                            />
                            <span className="char-count">{messageData.message.length}/5000</span>
                        </div>
                    </div>

                    {/* Send Button */}
                    <div className="send-actions">
                        <button type="submit" className="btn-send" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                            <Send size={20} />
                            {loading ? 'Sending...' : `Send Email (${getRecipientEmails().length} recipients)`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
