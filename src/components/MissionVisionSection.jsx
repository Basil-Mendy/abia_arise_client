import './MissionVisionSection.css'

const missionVisions = [
    {
        id: 1,
        title: 'Vision',
        icon: '👁️',
        content: 'To build a new Abia with sustainable development, good governance, and prosperity for all citizens.'
    },
    {
        id: 2,
        title: 'Mission',
        icon: '🎯',
        content: 'To support the present administration in achieving its developmental goals and ensuring the welfare of Abia citizens.'
    },
    {
        id: 3,
        title: 'Core Value 1',
        icon: '⭐',
        content: 'Transparency and accountability in all governmental affairs and public interactions.'
    },
    {
        id: 4,
        title: 'Core Value 2',
        icon: '💪',
        content: 'Grassroots engagement and community participation in nation-building.'
    },
    {
        id: 5,
        title: 'Core Value 3',
        icon: '🤝',
        content: 'Unity in diversity and inclusive governance that respects all citizens.'
    },
    {
        id: 6,
        title: 'Core Value 4',
        icon: '📈',
        content: 'Sustainable and equitable development that benefits all segments of society.'
    }
]

export default function MissionVisionSection() {
    return (
        <section className="mission-vision">
            <div className="container">
                <h2>Mission, Vision & Core Values</h2>
                <p className="section-subtitle">What drives Abia Arise</p>

                <div className="mv-grid">
                    {missionVisions.map((item) => (
                        <div key={item.id} className="mv-card">
                            <div className="mv-icon">{item.icon}</div>
                            <h3>{item.title}</h3>
                            <p>{item.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
