import HeroSection from '../components/HeroSection'
import GreetingsSection from '../components/GreetingsSection'
import OurLeadership from '../components/OurLeadership'
import AchievementsSection from '../components/AchievementsSection'
import MissionVisionSection from '../components/MissionVisionSection'
import NewsSection from '../components/NewsSection'
import './HomePage.css'

export default function HomePage() {
    return (
        <div className="home-page">
            <HeroSection />
            <GreetingsSection />
            <OurLeadership />
            <AchievementsSection />
            <MissionVisionSection />
            <NewsSection />
        </div>
    )
}
