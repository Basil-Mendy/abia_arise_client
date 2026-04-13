import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GroupMembershipDashboard.css';

const API_BASE_URL = 'http://localhost:8000/api';

const GroupMembershipDashboard = ({ groupId }) => {
    const [members, setMembers] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all'); // all, complete, partial
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAddMember, setShowAddMember] = useState(false);
    const [newMemberNIN, setNewMemberNIN] = useState('');
    const [stats, setStats] = useState({ total: 0, complete: 0, partial: 0 });

    useEffect(() => {
        loadMembers();
    }, [groupId, filterStatus]);

    const loadMembers = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.get(
                `${API_BASE_URL}/membership/groups/${groupId}/members/`,
                { params: { status: filterStatus } }
            );

            setMembers(response.data.members);
            setStats({
                total: response.data.members.length,
                complete: response.data.members.filter(m => m.user_details.registration_status === 'complete').length,
                partial: response.data.members.filter(m => m.user_details.registration_status === 'partial').length,
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async () => {
        if (!newMemberNIN) {
            setError('Please enter a NIN');
            return;
        }

        if (!/^\d{11}$/.test(newMemberNIN)) {
            setError('NIN must be 11 digits');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(
                `${API_BASE_URL}/membership/groups/${groupId}/add_member_by_nin/`,
                { user_nin: newMemberNIN }
            );

            setSuccess(response.data.message);
            setNewMemberNIN('');
            setShowAddMember(false);
            loadMembers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add member');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = async (membershipId, memberName) => {
        if (!window.confirm(`Are you sure you want to remove ${memberName} from the group?`)) {
            return;
        }

        try {
            await axios.post(
                `${API_BASE_URL}/membership/groups/${groupId}/remove_member/`,
                { membership_id: membershipId }
            );

            setSuccess(`${memberName} has been removed from the group`);
            loadMembers();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to remove member');
        }
    };

    return (
        <div className="group-membership-dashboard">
            <div className="dashboard-header">
                <h1>Group Member Management</h1>
                <p>Manage members in your group</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {/* Statistics Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total Members</div>
                </div>
                <div className="stat-card complete">
                    <div className="stat-value">{stats.complete}</div>
                    <div className="stat-label">Fully Registered</div>
                </div>
                <div className="stat-card partial">
                    <div className="stat-value">{stats.partial}</div>
                    <div className="stat-label">Pending Registration</div>
                </div>
            </div>

            {/* Filter and Action Buttons */}
            <div className="dashboard-controls">
                <div className="filter-group">
                    <label htmlFor="status-filter">Filter by Status:</label>
                    <select
                        id="status-filter"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="status-filter"
                    >
                        <option value="all">All Members</option>
                        <option value="complete">Fully Registered</option>
                        <option value="partial">Pending Registration</option>
                    </select>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={() => setShowAddMember(!showAddMember)}
                >
                    {showAddMember ? 'Cancel' : '+ Add Member'}
                </button>
            </div>

            {/* Add Member Form */}
            {showAddMember && (
                <div className="add-member-form">
                    <h3>Add Member by NIN</h3>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Enter member NIN (11 digits)"
                            value={newMemberNIN}
                            onChange={(e) => setNewMemberNIN(e.target.value)}
                            maxLength="11"
                        />
                    </div>
                    <div className="form-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowAddMember(false);
                                setNewMemberNIN('');
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleAddMember}
                            disabled={loading}
                        >
                            {loading ? 'Adding...' : 'Add Member'}
                        </button>
                    </div>
                </div>
            )}

            {/* Members List */}
            <div className="members-section">
                <h2>Members ({members.length})</h2>

                {loading ? (
                    <div className="loading">Loading members...</div>
                ) : members.length === 0 ? (
                    <div className="empty-state">
                        <p>No members found</p>
                    </div>
                ) : (
                    <div className="members-table-wrapper">
                        <table className="members-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>NIN</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Added Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member) => (
                                    <tr key={member.id} className={`status-${member.user_details.registration_status}`}>
                                        <td className="name">
                                            <strong>{member.user_details.full_name}</strong>
                                        </td>
                                        <td className="nin">{member.user_details.nin}</td>
                                        <td className="phone">{member.user_details.phone}</td>
                                        <td className="email">{member.user_details.email || '-'}</td>
                                        <td className="status">
                                            <span className={`status-badge ${member.user_details.registration_status}`}>
                                                {member.user_details.registration_status === 'complete' ? '✓ Complete' : '⏱ Pending'}
                                            </span>
                                        </td>
                                        <td className="date">
                                            {new Date(member.added_at).toLocaleDateString()}
                                        </td>
                                        <td className="actions">
                                            <button
                                                className="btn-remove"
                                                onClick={() => handleRemoveMember(member.id, member.user_details.full_name)}
                                                title="Remove member"
                                            >
                                                × Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupMembershipDashboard;
