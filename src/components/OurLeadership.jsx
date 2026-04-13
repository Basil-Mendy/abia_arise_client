import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ChevronRight } from 'lucide-react'
import './OurLeadership.css'

export default function OurLeadership() {
    const navigate = useNavigate()
    const [leaders, setLeaders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLeaders()
    }, [])

    const fetchLeaders = async () => {
        try {
            const response = await axios.get(
                'http://localhost:8000/api/core/leadership/',
                { params: { level: 'state' } }
            )
            // Get first 10 state-level leaders
            const stateLeaders = Array.isArray(response.data)
                ? response.data.slice(0, 10)
                : (response.data.results || []).slice(0, 10)
            setLeaders(stateLeaders)
        } catch (error) {
            console.error('Error fetching leaders:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <section className="our-leadership">
                <div className="loading">Loading leadership...</div>
            </section>
        )
    }

    return (
        <section className="our-leadership">
            <div className="section-header">
                <h2>Our Leadership</h2>
                <p>Meet the dedicated executives leading Abia ARISE</p>
            </div>

            {leaders.length === 0 ? (
                <div className="no-data">
                    <p>Leadership information will be available soon</p>
                </div>
            ) : (
                <>
                    <div className="leadership-grid">
                        {leaders.map(leader => (
                            <div key={leader.id} className="leadership-card">
                                <div className="card-image">
                                    {leader.picture ? (
                                        <img src={leader.picture} alt={leader.name} />
                                    ) : (
                                        <div className="placeholder">
                                            <span>{leader.name.charAt(0)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="card-content">
                                    <h3>{leader.name}</h3>
                                    <p className="role">{leader.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="view-all-container">
                        <button
                            className="btn-view-all"
                            onClick={() => navigate('/leadership')}
                        >
                            View All Leadership <ChevronRight size={18} />
                        </button>
                    </div>
                </>
            )}
        </section>
    )
}
