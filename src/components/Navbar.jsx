import './Navbar.css'
import { Link } from 'react-router-dom'
import logo from '../assets/images/abia_arise_logo-white.png'

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <img src={logo} alt="Abia Arise Logo" className="navbar-logo-img" />
                </Link>
                <ul className="nav-menu">
                    <li className="nav-item">
                        <Link to="/" className="nav-link">Home</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/register" className="nav-link">Register</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/login" className="nav-link">Login</Link>
                    </li>
                </ul>
            </div>
        </nav>
    )
}
