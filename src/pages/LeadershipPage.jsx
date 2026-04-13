import { useState, useEffect } from 'react'
import axios from 'axios'
import { ChevronDown } from 'lucide-react'
import './LeadershipPage.css'

export default function LeadershipPage() {
    const [leaders, setLeaders] = useState({})
    const [loading, setLoading] = useState(true)
    const [expandedLevel, setExpandedLevel] = useState('state')

    useEffect(() => {
        fetchAllLeaders()
    }, [])

    const fetchAllLeaders = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/core/leadership/')

            // Organize leaders by level
            const organized = {
                state: [],
                local_government: [],
                ward: []
            }

            const leadersList = Array.isArray(response.data) ? response.data : (response.data.results || [])
            leadersList.forEach(leader => {
                if (organized[leader.leadership_level]) {
                    organized[leader.leadership_level].push(leader)
                }
            })

            setLeaders(organized)
        } catch (error) {
            console.error('Error fetching leaders:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="leadership-page loading-page">Loading leadership...</div>
    }

    const getLevelLabel = (level) => {
        const labels = {
            'state': 'State Level',
            'local_government': 'Local Government Level',
            'ward': 'Ward Level'
        }
        return labels[level] || level
    }

    const getLevelCardStyle = (level) => {
        const styles = {
            'state': 'leadership-card state-level',
            'local_government': 'leadership-card lg-level',
            'ward': 'leadership-card ward-level'
        }
        return styles[level] || 'leadership-card'
    }

    return (
        <div className="leadership-page">
            <div className="leadership-header">
                <h1>Abia ARISE Leadership</h1>
                <p>Our dedicated team of executives at various levels</p>
            </div>

            <div className="leadership-container">
                {Object.entries(leaders).map(([level, leadersList]) => (
                    <div key={level} className="leadership-section">
                        <button
                            className="section-toggle"
                            onClick={() => setExpandedLevel(expandedLevel === level ? null : level)}
                        >
                            <h2>{getLevelLabel(level)}</h2>
                            <span className="toggle-icon">
                                <ChevronDown
                                    size={24}
                                    style={{
                                        transform: expandedLevel === level ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.3s'
                                    }}
                                />
                            </span>
                        </button>

                        {expandedLevel === level && (
                            <div className={`leaders-grid ${level}`}>
                                {leadersList.length === 0 ? (
                                    <div className="no-leaders">No leaders at this level yet</div>
                                ) : (
                                    leadersList.map(leader => (
                                        <div key={leader.id} className={getLevelCardStyle(level)}>
                                            <div className="card-image">
                                                {leader.picture ? (
                                                    <img src={leader.picture} alt={leader.name} />
                                                ) : (
                                                    <div className="placeholder">
                                                        {leader.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="card-body">
                                                <h3>{leader.name}</h3>
                                                <p className="role">{leader.role}</p>
                                                {leader.lga && <p className="location">📍 {leader.lga}</p>}
                                                {leader.ward && <p className="ward">Ward: {leader.ward}</p>}
                                                {leader.bio && <p className="bio">{leader.bio}</p>}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
