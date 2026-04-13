import { ArrowRight } from 'lucide-react'
import './NewsSection.css'

const news = [
    {
        id: 1,
        title: 'New Development Initiative Launched',
        excerpt: 'The administration has launched a new initiative focusing on community development and grassroots support.',
        image: 'https://via.placeholder.com/500x300?text=News+1',
        date: 'April 5, 2026',
        category: 'Development'
    },
    {
        id: 2,
        title: 'Governor Commissions School Building',
        excerpt: 'A newly built secondary school was commissioned in Umuahia with state-of-the-art facilities.',
        image: 'https://via.placeholder.com/500x300?text=News+2',
        date: 'April 3, 2026',
        category: 'Education'
    },
    {
        id: 3,
        title: 'Healthcare Expansion Program Announced',
        excerpt: 'The state government has announced plans to expand healthcare facilities to all local government areas.',
        image: 'https://via.placeholder.com/500x300?text=News+3',
        date: 'April 1, 2026',
        category: 'Healthcare'
    }
]

export default function NewsSection() {
    return (
        <section className="news">
            <div className="container">
                <h2>Latest News</h2>
                <p className="section-subtitle">Stay updated with recent developments</p>

                <div className="news-grid">
                    {news.map((item) => (
                        <article key={item.id} className="news-card">
                            <div className="news-image">
                                <img src={item.image} alt={item.title} />
                                <span className="news-category">{item.category}</span>
                            </div>
                            <div className="news-content">
                                <h3>{item.title}</h3>
                                <p className="news-date">{item.date}</p>
                                <p className="news-excerpt">{item.excerpt}</p>
                                <button className="btn-secondary btn-read-more" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    Read More <ArrowRight size={16} />
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
