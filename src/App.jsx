import { useEffect } from "react";
import Router from "./router/Router";
import { loadToken } from "./config/config";

function App() {
    useEffect(() => {
        // Fetch the saved auth token from Firestore once on startup.
        // tokenStore is populated, so config.AUTH_TOKEN is ready
        // before any upload is attempted.
        loadToken();
    }, []);

    return <Router />;
}

export default App;
