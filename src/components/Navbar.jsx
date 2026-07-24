import { Link } from "react-router-dom";

import "../styles/navbar.css";

function Navbar() {

    return (

        <nav className="navbar">

            <div className="logo">
                Cloud Storage
            </div>

            <div className="links">

                <Link to="/">
                    Home
                </Link>

                <Link to="/upload">
                    Upload
                </Link>

            </div>

        </nav>

    );

}

export default Navbar;