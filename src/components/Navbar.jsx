import { NavLink } from "react-router-dom";
import tokenStore from "../config/tokenStore";
import "../styles/navbar.css";

function Navbar() {
    const hasToken = tokenStore.hasToken();

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

                <NavLink
                    to="/auth"
                    className={({ isActive }) => isActive ? "nav-link nav-link-active" : "nav-link"}
                    title={hasToken ? "Token active" : "Login required"}
                >
                    {hasToken ? "Auth" : "Auth"}
                </NavLink>
            </div>
        </nav>
    );
}

export default Navbar;
