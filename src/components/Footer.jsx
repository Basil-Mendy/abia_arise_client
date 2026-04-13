import './Footer.css'

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h3>ABIA ARISE</h3>
                    <p>A political movement supporting good governance in Abia State</p>
                </div>
                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/register">Register</a></li>
                        <li><a href="/login">Login</a></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h4>Contact Us</h4>
                    <p>Email: info@abiaarise.com</p>
                    <p>Phone: +234 (0) 8XX XXX XXXX</p>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2026 Abia Arise. All rights reserved. || Tech Lead: Techrise Consult Limited</p>
            </div>
        </footer>
    )
}
