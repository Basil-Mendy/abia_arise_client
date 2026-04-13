import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import './AchievementsSection.css'

const achievements = [
    {
        id: 1,
        title: 'Infrastructure Development',
        description: 'Major roads and bridges constructed across the state',
        image: 'https://via.placeholder.com/300x200?text=Infrastructure'
    },
    {
        id: 2,
        title: 'Education Excellence',
        description: 'Enhanced learning facilities and teacher development programs',
        image: 'https://via.placeholder.com/300x200?text=Education'
    },
    {
        id: 3,
        title: 'Healthcare Improvement',
        description: 'Upgraded hospitals and healthcare centers across LGAs',
        image: 'https://via.placeholder.com/300x200?text=Healthcare'
    },
    {
        id: 4,
        title: 'Economic Growth',
        description: 'Support for small and medium enterprises',
        image: 'https://via.placeholder.com/300x200?text=Economy'
    },
    {
        id: 5,
        title: 'Community Development',
        description: 'Water projects and community facilities',
        image: 'https://via.placeholder.com/300x200?text=Community'
    },
    {
        id: 6,
        title: 'Good Governance',
        description: 'Transparency and accountability in administration',
        image: 'https://via.placeholder.com/300x200?text=Governance'
    }
]

export default function AchievementsSection() {
    const [showAll, setShowAll] = useState(false)

    const displayedAchievements = showAll ? achievements : achievements.slice(0, 3)

    return (
        <section className="achievements">
            <div className="container">
                <h2>Our Achievements</h2>
                <p className="section-subtitle">Progress and development by the present administration</p>

                <div className="achievements-grid">
                    {displayedAchievements.map((achievement) => (
                        <div key={achievement.id} className="achievement-card">
                            <img src={achievement.image} alt={achievement.title} />
                            <h3>{achievement.title}</h3>
                            <p>{achievement.description}</p>
                        </div>
                    ))}
                </div>

                <div className="view-all-container">
                    <button
                        className="btn-primary"
                        onClick={() => setShowAll(!showAll)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        {showAll ? 'Show Less' : 'View All Achievements'}
                        {showAll ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>
            </div>
        </section>
    )
}
