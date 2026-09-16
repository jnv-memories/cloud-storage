import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";
import Home from "../pages/Home";
import FolderPage from "../pages/FolderPage";
import Upload from "../pages/Upload";
import Auth from "../pages/Auth";

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
                    path="/folder/:folderId/:fileId?"
                    element={<FolderPage />}
                />
                <Route
                    path="/upload"
                    element={<Upload />}
                />
                <Route
                    path="/auth"
                    element={<Auth />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default Router;
