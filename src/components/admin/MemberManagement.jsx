import { useState, useEffect } from 'react'
import axios from 'axios'
import { Eye, Trash2, X, Search } from 'lucide-react'
import './MemberManagement.css'

export default function MemberManagement() {
    const [members, setMembers] = useState([])
    const [filteredMembers, setFilteredMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [filters, setFilters] = useState({
        lga: '',
        ward: '',
        pollingUnit: '',
        groupStatus: '', // 'all', 'member', 'non-member'
        verificationStatus: '' // '', 'pending_activation', 'active'
    })
    const [uniqueLgas, setUniqueLgas] = useState([])
    const [uniqueWards, setUniqueWards] = useState([])
    const [uniquePollingUnits, setUniquePollingUnits] = useState([])
    const [selectedMember, setSelectedMember] = useState(null)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        fetchMembers()
    }, [])

    const fetchMembers = async () => {
        try {
            setLoading(true)
            const response = await axios.get(getFullURL('/api/auth/members/'), {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`
                }
            })
            // Handle both paginated responses (object with .results) and plain arrays
            const data = Array.isArray(response.data) ? response.data : (response.data.results || [])
            setMembers(data)
            setFilteredMembers(data)
            setError(null)

            // Extract unique LGAs, Wards, and Polling Units
            const lgas = [...new Set(data.map(m => m.lga).filter(Boolean))]
            const wards = [...new Set(data.map(m => m.ward).filter(Boolean))]
            const units = [...new Set(data.map(m => m.polling_unit).filter(Boolean))]

            setUniqueLgas(lgas.sort())
            setUniqueWards(wards.sort())
            setUniquePollingUnits(units.sort())
        } catch (err) {
            console.error('Error fetching members:', err)
            setError('Failed to load members')
        } finally {
            setLoading(false)
        }
    }

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        applyFilters(newFilters)
    }

    const applyFilters = (currentFilters) => {
        let result = members

        if (currentFilters.lga) {
            result = result.filter(m => m.lga === currentFilters.lga)
        }
        if (currentFilters.ward) {
            result = result.filter(m => m.ward === currentFilters.ward)
        }
        if (currentFilters.pollingUnit) {
            result = result.filter(m => m.polling_unit === currentFilters.pollingUnit)
        }
        if (currentFilters.groupStatus && currentFilters.groupStatus !== 'all') {
            if (currentFilters.groupStatus === 'member') {
                result = result.filter(m => m.group_id)
            } else if (currentFilters.groupStatus === 'non-member') {
                result = result.filter(m => !m.group_id)
            }
        }
        if (currentFilters.verificationStatus && currentFilters.verificationStatus !== 'all') {
            result = result.filter(m => m.account_status === currentFilters.verificationStatus)
        }

        setFilteredMembers(result)
    }

    const handleRemoveFromGroup = async (memberId) => {
        if (!window.confirm('Remove this member from their group?')) return

        try {
            await axios.patch(
                getFullURL(`/api/auth/members/${memberId}/`),
                { group_id: null },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`
                    }
                }
            )
            fetchMembers()
        } catch (err) {
            console.error('Error removing member from group:', err)
            alert('Failed to remove member from group')
        }
    }

    const handleViewDetails = (member) => {
        setSelectedMember(member)
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setSelectedMember(null)
    }

    if (loading) return <div className="management-loading">Loading members...</div>

    return (
        <div className="member-management">
            <div className="management-header">
                <h2>👥 Member Management</h2>
                <p className="member-count">Total Members: {filteredMembers.length}</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Filters */}
            <div className="filters-section">
                <select
                    value={filters.lga}
                    onChange={(e) => handleFilterChange('lga', e.target.value)}
                    className="filter-select"
                >
                    <option value="">All LGAs</option>
                    {uniqueLgas.map(lga => (
                        <option key={lga} value={lga}>{lga}</option>
                    ))}
                </select>

                <select
                    value={filters.ward}
                    onChange={(e) => handleFilterChange('ward', e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Wards</option>
                    {uniqueWards.map(ward => (
                        <option key={ward} value={ward}>{ward}</option>
                    ))}
                </select>

                <select
                    value={filters.pollingUnit}
                    onChange={(e) => handleFilterChange('pollingUnit', e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Polling Units</option>
                    {uniquePollingUnits.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                    ))}
                </select>

                <select
                    value={filters.groupStatus}
                    onChange={(e) => handleFilterChange('groupStatus', e.target.value)}
                    className="filter-select"
                >
                    <option value="">Group Status: All</option>
                    <option value="member">Group Members</option>
                    <option value="non-member">Non-Members</option>
                </select>

                <select
                    value={filters.verificationStatus}
                    onChange={(e) => handleFilterChange('verificationStatus', e.target.value)}
                    className="filter-select"
                >
                    <option value="">Verification: All</option>
                    <option value="pending_activation">Pending Verification</option>
                    <option value="active">Verified</option>
                </select>
            </div>

            {/* Members Table */}
            <div className="table-container">
                <table className="members-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>LGA</th>
                            <th>Ward</th>
                            <th>Status</th>
                            <th>Group</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="no-data">No members found</td>
                            </tr>
                        ) : (
                            filteredMembers.map(member => (
                                <tr key={member.id}>
                                    <td>{member.abia_arise_id}</td>
                                    <td className="member-name">{member.full_name}</td>
                                    <td>{member.email}</td>
                                    <td>{member.phone_number}</td>
                                    <td>{member.lga}</td>
                                    <td>{member.ward}</td>
                                    <td>
                                        <span className={`status-badge ${member.account_status === 'active' ? 'verified' : 'pending'}`}>
                                            {member.account_status === 'active' ? '✓ Verified' : '⏳ Pending'}
                                        </span>
                                    </td>
                                    <td>{member.group_id ? `Group ${member.group_id}` : '—'}</td>
                                    <td className="actions-cell">
                                        <button
                                            className="btn-details"
                                            onClick={() => handleViewDetails(member)}
                                            title="View member details"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        {member.group_id && (
                                            <button
                                                className="btn-remove"
                                                onClick={() => handleRemoveFromGroup(member.id)}
                                                title="Remove from group"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {showModal && selectedMember && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto', maxWidth: '700px' }}>
                        <button className="modal-close" onClick={handleCloseModal}>
                            <X size={24} />
                        </button>

                        {/* Profile Picture */}
                        {selectedMember.profile_picture && (
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <img
                                    src={selectedMember.profile_picture}
                                    alt={selectedMember.full_name}
                                    style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '8px', border: '2px solid #0066CC' }}
                                />
                            </div>
                        )}

                        <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>{selectedMember.full_name}</h3>

                        <div className="member-details" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '14px' }}>
                            {/* Identification Section */}
                            <div style={{ gridColumn: '1 / -1', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px', marginBottom: '10px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#0066CC' }}>Identification</h4>
                            </div>
                            <p><strong>Abia Arise ID:</strong><br />{selectedMember.abia_arise_id}</p>
                            <p><strong>NIN:</strong><br />{selectedMember.nin || 'N/A'}</p>
                            <p><strong>Voters Card:</strong><br />{selectedMember.voters_card_no || 'N/A'}</p>
                            <p><strong>Email:</strong><br />{selectedMember.email}</p>

                            {/* Personal Information Section */}
                            <div style={{ gridColumn: '1 / -1', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px', marginBottom: '10px', marginTop: '10px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#0066CC' }}>Personal Information</h4>
                            </div>
                            <p><strong>Phone:</strong><br />{selectedMember.phone_number}</p>
                            <p><strong>Age:</strong><br />{selectedMember.age || 'N/A'}</p>
                            <p><strong>Gender:</strong><br />{selectedMember.gender || 'N/A'}</p>
                            <p><strong>Occupation:</strong><br />{selectedMember.occupation || 'N/A'}</p>

                            {/* Origin Details Section */}
                            <div style={{ gridColumn: '1 / -1', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px', marginBottom: '10px', marginTop: '10px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#0066CC' }}>Origin Details</h4>
                            </div>
                            <p><strong>State of Origin:</strong><br />{selectedMember.state_of_origin || 'N/A'}</p>
                            <p><strong>LGA of Origin:</strong><br />{selectedMember.lga_of_origin || 'N/A'}</p>
                            <p><strong>Country of Origin:</strong><br />{selectedMember.country_of_origin || 'N/A'}</p>

                            {/* Residential Details Section */}
                            <div style={{ gridColumn: '1 / -1', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px', marginBottom: '10px', marginTop: '10px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#0066CC' }}>Residential Details</h4>
                            </div>
                            <p><strong>State of Residence:</strong><br />{selectedMember.state_of_residence || 'N/A'}</p>
                            <p><strong>LGA of Residence:</strong><br />{selectedMember.lga_of_residence || 'N/A'}</p>
                            <p><strong>Country of Residence:</strong><br />{selectedMember.country_of_residence || 'N/A'}</p>
                            <p><strong>Electoral Ward:</strong><br />{selectedMember.electoral_ward || 'N/A'}</p>
                            <p><strong>Polling Unit:</strong><br />{selectedMember.polling_unit || 'N/A'}</p>

                            {/* Bank Details Section */}
                            <div style={{ gridColumn: '1 / -1', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px', marginBottom: '10px', marginTop: '10px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#0066CC' }}>Bank Details</h4>
                            </div>
                            <p><strong>Bank Name:</strong><br />{selectedMember.bank_name || 'N/A'}</p>
                            <p><strong>Account Number:</strong><br />{selectedMember.bank_account_number || 'N/A'}</p>
                            <p><strong>BVN:</strong><br />{selectedMember.bvn || 'N/A'}</p>

                            {/* Membership Details Section */}
                            <div style={{ gridColumn: '1 / -1', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px', marginBottom: '10px', marginTop: '10px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#0066CC' }}>Membership Details</h4>
                            </div>
                            <p><strong>Membership Purpose:</strong><br />{selectedMember.membership_purpose || 'N/A'}</p>
                            <p><strong>Group Status:</strong><br />{selectedMember.group_id ? `Assigned to Group ${selectedMember.group_id}` : 'Not in any group'}</p>
                            <p><strong>Date Joined:</strong><br />{new Date(selectedMember.date_joined).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
