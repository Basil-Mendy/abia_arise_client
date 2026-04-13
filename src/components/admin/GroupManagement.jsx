import { useState, useEffect } from 'react'
import axios from 'axios'
import { X, Shield, Trash2, Plus } from 'lucide-react'
import './GroupManagement.css'

export default function GroupManagement() {
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [showRoleModal, setShowRoleModal] = useState(false)
    const [selectedMember, setSelectedMember] = useState(null)
    const [newRole, setNewRole] = useState('')
    const admin = JSON.parse(localStorage.getItem('admin') || '{}')

    useEffect(() => {
        fetchGroups()
    }, [])

    const fetchGroups = async () => {
        try {
            setLoading(true)
            const response = await axios.get('http://localhost:8000/api/auth/groups/', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`
                }
            })
            // Handle both paginated responses (object with .results) and plain arrays
            const data = Array.isArray(response.data) ? response.data : (response.data.results || [])
            setGroups(data)
            setError(null)
        } catch (err) {
            console.error('Error fetching groups:', err)
            setError('Failed to load groups')
        } finally {
            setLoading(false)
        }
    }

    const handleViewDetails = (group) => {
        setSelectedGroup(group)
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setSelectedGroup(null)
    }

    const handleAssignRole = (member) => {
        setSelectedMember(member)
        setNewRole(member.role || '')
        setShowRoleModal(true)
    }

    const handleSaveRole = async () => {
        if (!admin.is_superuser) {
            alert('Only superusers can assign roles')
            return
        }

        try {
            await axios.patch(
                `http://localhost:8000/api/auth/group-members/${selectedMember.id}/`,
                { role: newRole },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`
                    }
                }
            )
            fetchGroups()
            setShowRoleModal(false)
        } catch (err) {
            console.error('Error assigning role:', err)
            alert('Failed to assign role')
        }
    }

    const handleRemoveMember = async (memberId) => {
        if (!window.confirm('Remove this member from the group?')) return

        try {
            await axios.delete(
                `http://localhost:8000/api/auth/group-members/${memberId}/`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`
                    }
                }
            )
            if (selectedGroup) {
                setSelectedGroup(prev => ({
                    ...prev,
                    members: prev.members.filter(m => m.id !== memberId)
                }))
            }
            fetchGroups()
        } catch (err) {
            console.error('Error removing member:', err)
            alert('Failed to remove member')
        }
    }

    if (loading) return <div className="management-loading">Loading groups...</div>

    return (
        <div className="group-management">
            <div className="management-header">
                <h2>👨‍👩‍👧‍👦 Group Management</h2>
                <p className="group-count">Total Groups: {groups.length}</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Groups Grid */}
            <div className="groups-grid">
                {groups.length === 0 ? (
                    <div className="no-data">No groups found</div>
                ) : (
                    groups.map(group => (
                        <div key={group.id} className="group-card">
                            <div className="group-card-header">
                                <h3>{group.name}</h3>
                                <span className="group-id">GL: {group.group_license_number}</span>
                            </div>
                            <div className="group-card-body">
                                <p><strong>Chairman:</strong> {group.chairman_name}</p>
                                <p><strong>Secretary:</strong> {group.secretary_name}</p>
                                <p><strong>Members:</strong> {group.total_members || 0}</p>
                                <p><strong>LGA:</strong> {group.lga}</p>
                            </div>
                            <button
                                className="btn-view-details"
                                onClick={() => handleViewDetails(group)}
                            >
                                View Details
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Detail Modal */}
            {showModal && selectedGroup && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto', maxWidth: '800px' }}>
                        <button className="modal-close" onClick={handleCloseModal}>
                            <X size={24} />
                        </button>

                        {/* Group Logo */}
                        {selectedGroup.logo && (
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <img
                                    src={selectedGroup.logo}
                                    alt={selectedGroup.name}
                                    style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '8px', border: '2px solid #0066CC' }}
                                />
                            </div>
                        )}

                        <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>{selectedGroup.name}</h3>

                        <div className="modal-tabs">
                            <div className="modal-section">
                                <h4>Group Information</h4>
                                <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px', marginBottom: '20px' }}>
                                    <div>
                                        <strong>License Number:</strong>
                                        <p>{selectedGroup.group_license_number}</p>
                                    </div>
                                    <div>
                                        <strong>LGA:</strong>
                                        <p>{selectedGroup.lga}</p>
                                    </div>
                                    <div>
                                        <strong>Total Members:</strong>
                                        <p>{selectedGroup.total_members || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <strong>Registration Date:</strong>
                                        <p>{new Date(selectedGroup.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <strong>Address:</strong>
                                        <p>{selectedGroup.address || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-section" style={{ borderTop: '2px solid #e0e0e0', paddingTop: '20px' }}>
                                <h4>Chairman Details</h4>
                                <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px', marginBottom: '20px' }}>
                                    <div>
                                        <strong>Name:</strong>
                                        <p>{selectedGroup.chairman_name}</p>
                                    </div>
                                    <div>
                                        <strong>Phone:</strong>
                                        <p>{selectedGroup.chairman_phone}</p>
                                    </div>
                                    <div>
                                        <strong>Email:</strong>
                                        <p>{selectedGroup.chairman_email}</p>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <strong>Residential Address:</strong>
                                        <p>{selectedGroup.chairman_residential_address || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-section" style={{ borderTop: '2px solid #e0e0e0', paddingTop: '20px' }}>
                                <h4>Secretary Details</h4>
                                <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px', marginBottom: '20px' }}>
                                    <div>
                                        <strong>Name:</strong>
                                        <p>{selectedGroup.secretary_name}</p>
                                    </div>
                                    <div>
                                        <strong>Phone:</strong>
                                        <p>{selectedGroup.secretary_phone}</p>
                                    </div>
                                    <div>
                                        <strong>Email:</strong>
                                        <p>{selectedGroup.secretary_email}</p>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <strong>Residential Address:</strong>
                                        <p>{selectedGroup.secretary_residential_address || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-section" style={{ borderTop: '2px solid #e0e0e0', paddingTop: '20px' }}>
                                <h4>Members ({selectedGroup.members ? selectedGroup.members.length : 0})</h4>
                                <div className="members-list">
                                    {!selectedGroup.members || selectedGroup.members.length === 0 ? (
                                        <p className="no-members">No members in this group</p>
                                    ) : (
                                        selectedGroup.members.map(member => (
                                            <div key={member.id} className="member-item" style={{ padding: '10px', borderBottom: '1px solid #e0e0e0' }}>
                                                <div className="member-info">
                                                    <span className="member-name" style={{ fontWeight: 'bold' }}>{member.member_name}</span>
                                                    {member.role && <span className="role-badge" style={{ marginLeft: '10px', padding: '4px 8px', backgroundColor: '#0066CC', color: 'white', borderRadius: '4px', fontSize: '12px' }}>{member.role}</span>}
                                                </div>
                                                <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>{member.member || 'ID: N/A'}</p>
                                                <div className="member-actions" style={{ marginTop: '8px' }}>
                                                    {admin.is_superuser && (
                                                        <>
                                                            <button
                                                                className="btn-assign-role"
                                                                onClick={() => handleAssignRole(member)}
                                                                title="Assign role"
                                                                style={{ marginRight: '8px' }}
                                                            >
                                                                <Shield size={18} />
                                                            </button>
                                                            <button
                                                                className="btn-remove-member"
                                                                onClick={() => handleRemoveMember(member.id)}
                                                                title="Remove member"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Assignment Modal */}
            {showRoleModal && selectedMember && (
                <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowRoleModal(false)}>
                            <X size={24} />
                        </button>
                        <h3>Assign Role to {selectedMember.member_name}</h3>
                        <div className="role-form">
                            <label>
                                <strong>Select Role:</strong>
                                <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                                    <option value="">No Role</option>
                                    <option value="chairman">Chairman</option>
                                    <option value="secretary">Secretary</option>
                                </select>
                            </label>
                            <div className="form-actions">
                                <button className="btn-save" onClick={handleSaveRole}>
                                    Save Role
                                </button>
                                <button className="btn-cancel" onClick={() => setShowRoleModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
