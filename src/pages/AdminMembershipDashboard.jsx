import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminMembershipDashboard.css';

import { getFullURL } from '../utils/apiConfig';

const API_BASE_URL = getFullURL('');

const AdminMembershipDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview'); // overview, users, groups, audit
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [duplicates, setDuplicates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filters
    const [userStatusFilter, setUserStatusFilter] = useState('all');
    const [userSourceFilter, setUserSourceFilter] = useState('all');
    const [userSearch, setUserSearch] = useState('');

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        setError('');

        try {
            if (activeTab === 'overview') {
                const response = await axios.get(`${API_BASE_URL}/admin/dashboard/stats/`);
                setStats(response.data.stats);
            } else if (activeTab === 'users') {
                loadUsers();
            } else if (activeTab === 'groups') {
                loadGroups();
            } else if (activeTab === 'audit') {
                loadAudit();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const params = new URLSearchParams();
            if (userStatusFilter !== 'all') params.append('status', userStatusFilter);
            if (userSourceFilter !== 'all') params.append('source', userSourceFilter);
            if (userSearch) params.append('search', userSearch);

            const response = await axios.get(
                `${API_BASE_URL}/admin/dashboard/users/?${params.toString()}`
            );
            setUsers(response.data.users);
        } catch (err) {
            setError('Failed to load users');
        }
    };

    const loadGroups = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/admin/dashboard/groups/`);
            setGroups(response.data.groups);
        } catch (err) {
            setError('Failed to load groups');
        }
    };

    const loadAudit = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/admin/dashboard/audit_duplicates/`);
            setDuplicates(response.data.duplicates);
        } catch (err) {
            setError('Failed to load audit data');
        }
    };

    return (
        <div className="admin-membership-dashboard">
            <div className="dashboard-header">
                <h1>System Administration</h1>
                <p>Manage users, groups, and monitor system activity</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <button
                    className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 Overview
                </button>
                <button
                    className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    👥 Users
                </button>
                <button
                    className={`tab-btn ${activeTab === 'groups' ? 'active' : ''}`}
                    onClick={() => setActiveTab('groups')}
                >
                    👨‍👩‍👧‍👦 Groups
                </button>
                <button
                    className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
                    onClick={() => setActiveTab('audit')}
                >
                    🔍 Audit
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="overview-tab">
                        {loading ? (
                            <div className="loading">Loading overview...</div>
                        ) : stats ? (
                            <div className="overview-grid">
                                {/* Users Stats */}
                                <div className="stats-section">
                                    <h2>Users</h2>
                                    <div className="metrics">
                                        <div className="metric">
                                            <div className="metric-label">Total Users</div>
                                            <div className="metric-value">{stats.users.total}</div>
                                        </div>
                                        <div className="metric success">
                                            <div className="metric-label">Fully Registered</div>
                                            <div className="metric-value">{stats.users.complete}</div>
                                        </div>
                                        <div className="metric warning">
                                            <div className="metric-label">Pending Registration</div>
                                            <div className="metric-value">{stats.users.partial}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Groups Stats */}
                                <div className="stats-section">
                                    <h2>Groups</h2>
                                    <div className="metrics">
                                        <div className="metric">
                                            <div className="metric-label">Total Groups</div>
                                            <div className="metric-value">{stats.groups.total}</div>
                                        </div>
                                        <div className="metric">
                                            <div className="metric-label">Total Memberships</div>
                                            <div className="metric-value">{stats.groups.total_memberships}</div>
                                        </div>
                                        <div className="metric">
                                            <div className="metric-label">Avg Members per Group</div>
                                            <div className="metric-value">{stats.groups.avg_members_per_group}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Audit Stats */}
                                <div className="stats-section">
                                    <h2>Security & Audit</h2>
                                    <div className="metrics">
                                        <div className="metric">
                                            <div className="metric-label">Duplicate NIN Attempts</div>
                                            <div className="metric-value">{stats.audit.duplicate_nin_attempts}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="users-tab">
                        <div className="filter-bar">
                            <input
                                type="text"
                                placeholder="Search by name or NIN..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="search-input"
                            />
                            <select
                                value={userStatusFilter}
                                onChange={(e) => setUserStatusFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Status</option>
                                <option value="complete">Fully Registered</option>
                                <option value="partial">Pending Registration</option>
                            </select>
                            <select
                                value={userSourceFilter}
                                onChange={(e) => setUserSourceFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Sources</option>
                                <option value="self_signup">Self Sign-up</option>
                                <option value="group_import">Group Import</option>
                            </select>
                            <button
                                className="btn btn-primary"
                                onClick={loadUsers}
                                disabled={loading}
                            >
                                {loading ? 'Loading...' : 'Apply Filters'}
                            </button>
                        </div>

                        {loading ? (
                            <div className="loading">Loading users...</div>
                        ) : (
                            <div>
                                <div className="result-count">Found {users.length} user(s)</div>
                                <div className="users-table-wrapper">
                                    <table className="users-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>NIN</th>
                                                <th>Phone</th>
                                                <th>Email</th>
                                                <th>Status</th>
                                                <th>Source</th>
                                                <th>Registered</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user.id}>
                                                    <td className="name">{user.full_name}</td>
                                                    <td className="nin">{user.nin}</td>
                                                    <td className="phone">{user.phone}</td>
                                                    <td className="email">{user.email || '-'}</td>
                                                    <td className="status">
                                                        <span className={`badge ${user.registration_status}`}>
                                                            {user.registration_status === 'complete' ? '✓ Complete' : '⏱ Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="source">
                                                        <span className={`badge-source ${user.source}`}>
                                                            {user.source === 'self_signup' ? 'Self' : 'Import'}
                                                        </span>
                                                    </td>
                                                    <td className="date">
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Groups Tab */}
                {activeTab === 'groups' && (
                    <div className="groups-tab">
                        {loading ? (
                            <div className="loading">Loading groups...</div>
                        ) : (
                            <div className="groups-grid">
                                {groups.map((group) => (
                                    <div key={group.id} className="group-card">
                                        <div className="group-header">
                                            <h3>{group.name}</h3>
                                            <span className="group-id">ID: {group.id}</span>
                                        </div>

                                        <p className="group-description">{group.description || 'No description'}</p>

                                        <div className="group-stats">
                                            <div className="stat">
                                                <span className="label">Total Members:</span>
                                                <span className="value">{group.total_members}</span>
                                            </div>
                                            <div className="stat">
                                                <span className="label">Fully Registered:</span>
                                                <span className="value success">{group.complete}</span>
                                            </div>
                                            <div className="stat">
                                                <span className="label">Pending:</span>
                                                <span className="value warning">{group.partial}</span>
                                            </div>
                                        </div>

                                        <div className="group-meta">
                                            <small>Created by: {group.created_by}</small>
                                            <small>Date: {new Date(group.created_at).toLocaleDateString()}</small>
                                        </div>

                                        <button className="btn btn-secondary">View Details</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Audit Tab */}
                {activeTab === 'audit' && (
                    <div className="audit-tab">
                        {loading ? (
                            <div className="loading">Loading audit data...</div>
                        ) : (
                            <div>
                                <h2>Duplicate NIN Attempts</h2>
                                {duplicates.length === 0 ? (
                                    <div className="empty-state">
                                        <p>✓ No duplicate NIN records found</p>
                                    </div>
                                ) : (
                                    <div className="duplicates-list">
                                        {duplicates.map((dup, index) => (
                                            <div key={index} className="duplicate-item">
                                                <div className="duplicate-header">
                                                    <h3>NIN: {dup.nin}</h3>
                                                    <span className="count">×{dup.count} entries</span>
                                                </div>
                                                <div className="duplicate-users">
                                                    {dup.users.map((user, idx) => (
                                                        <div key={idx} className="user-entry">
                                                            <div className="user-name">{user.full_name}</div>
                                                            <div className="user-info">
                                                                <div>Phone: {user.phone}</div>
                                                                <div>Status: {user.registration_status}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMembershipDashboard;
