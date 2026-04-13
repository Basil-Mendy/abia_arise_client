import './GreetingsSection.css'
import alexChiomaOtti from '../assets/images/alex_chioma_otti.jfif'

export default function GreetingsSection() {
    return (
        <section className="greetings">
            <div className="container">
                <div className="greetings-content">
                    <div className="greetings-image">
                        <img
                            src={alexChiomaOtti}
                            alt="Governor Alex Chioma Otti"
                        />
                    </div>
                    <div className="greetings-text">
                        <h2>A Greeting from the Governor</h2>
                        <p className="governor-title">His Excellency, Governor Alex Chioma Otti</p>
                        <p className="greeting-message">
                            Welcome to Abia Arise, a movement dedicated to supporting the vision and
                            governance of our dear state. The present administration is committed to
                            bringing development, progress, and prosperity to every corner of Abia State.
                            Through this movement, we invite all patriotic citizens to join us in this
                            noble cause of building a new Abia where the welfare and development of our
                            people are paramount.
                        </p>
                        <p className="greeting-message">
                            Together, we rise. Together, we build. Together, we transform Abia into
                            a land of boundless opportunities and growth.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
