import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Navbar from "../components/Navbar";

import Home from "../pages/Home";
import Upload from "../pages/Upload";

function Router() {

    return (

        <BrowserRouter>

            <Navbar />

            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/upload"
                    element={<Upload />}
                />

            </Routes>

        </BrowserRouter>

    );

}

export default Router;