import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import './HeroSection.css'

// Import hero slider images
import alexOtti1 from '../assets/images/alex_otti_1.jpg'
import alexOtti2 from '../assets/images/alex_otti_2.jpg'
import alexOtti3 from '../assets/images/alex_otti_3.jpg'
import alexOtti4 from '../assets/images/alex_otti_4.jpg'
import alexOtti5 from '../assets/images/alex_otti_5.jpg'

const heroImages = [
    alexOtti1,
    alexOtti2,
    alexOtti3,
    alexOtti4,
    alexOtti5,
]

export default function HeroSection() {
    const navigate = useNavigate()
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    // Auto-slide every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    const goToNextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
    }

    const goToPreviousImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? heroImages.length - 1 : prevIndex - 1
        )
    }

    const handleBecomeMemeber = () => {
        navigate('/register')
    }

    return (
        <section className="hero">
            <div className="hero-slider">
                <img
                    src={heroImages[currentImageIndex]}
                    alt={`Abia Arise ${currentImageIndex + 1}`}
                    className="hero-image"
                />
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">ABIA ARISE</h1>
                    <p className="hero-subtitle">Arise for the new Abia is here</p>
                    <button className="btn-primary btn-cta" onClick={handleBecomeMemeber}>
                        Become a Member
                    </button>
                </div>

                {/* Navigation arrows */}
                <button className="slider-btn slider-btn-prev" onClick={goToPreviousImage}>
                    <ChevronLeft size={32} />
                </button>
                <button className="slider-btn slider-btn-next" onClick={goToNextImage}>
                    <ChevronRight size={32} />
                </button>

                {/* Slide indicators */}
                <div className="slide-indicators">
                    {heroImages.map((_, index) => (
                        <button
                            key={index}
                            className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                            onClick={() => setCurrentImageIndex(index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
