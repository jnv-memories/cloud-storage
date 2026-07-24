import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import folderService from "../services/folderService";
import "../styles/home.css";
import "../styles/modal.css";

function Home() {
    const navigate = useNavigate();
    const [folders, setFolders] = useState([]);
    
    // Custom Modal State
    const [showModal, setShowModal] = useState(false);
    const [folderName, setFolderName] = useState("");

    useEffect(() => {
        loadFolders();
    }, []);

    async function loadFolders() {
        const data = await folderService.getFolders(null);
        setFolders(data);
    }

    async function handleCreateFolder(e) {
        e.preventDefault();
        if (!folderName.trim()) return;
        await folderService.createFolder(folderName.trim(), null);
        setFolderName("");
        setShowModal(false);
        loadFolders();
    }

    return (
        <div className="page">
            <h1>Home</h1>
            
            <div className="fileGrid">
                {folders.map(folder => (
                    <div
                        key={folder.id}
                        className="folderCard"
                        onClick={() => {
                            navigate(`/folder/${folder.id}`);
                        }}
                    >
                        <div className="folderCard-content">
                            <div className="folderIcon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </div>
                            <h3>{folder.name}</h3>
                        </div>
                        <div className="folder-arrow">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </div>
                    </div>
                ))}
            </div>

            {/* FLOATING ACTION BUTTON */}
            <div className="fab-container">
                <button
                    className="fab-button"
                    onClick={() => setShowModal(true)}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    New Folder
                </button>
            </div>

            {/* CUSTOM FOLDER CREATION MODAL */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h3>Create New Folder</h3>
                        <form onSubmit={handleCreateFolder}>
                            <input
                                type="text"
                                className="modal-input"
                                placeholder="Enter folder name..."
                                value={folderName}
                                onChange={e => setFolderName(e.target.value)}
                                autoFocus
                            />
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => {
                                        setShowModal(false);
                                        setFolderName("");
                                    }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-create">
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;