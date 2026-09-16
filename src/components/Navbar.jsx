import { NavLink } from "react-router-dom";
import "../styles/navbar.css";

function Navbar() {
    return (
        <nav className="navbar" aria-label="Main navigation">
            <NavLink to="/" className="logo" aria-label="Cloud Storage home">
                Cloud Storage
            </NavLink>

            <div className="links">
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) => isActive ? "nav-link nav-link-active" : "nav-link"}
                >
                    Home
                </NavLink>

                <NavLink
                    to="/upload"
                    className={({ isActive }) => isActive ? "nav-link nav-link-active" : "nav-link"}
                >
                    Upload
                </NavLink>
            </div>
        </nav>
    );
}

export default Navbar;
