import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import storageService from "../services/storageService";
import folderService from "../services/folderService";
import FileCard from "../components/FileCard";
import "../styles/home.css";

function FolderPage() {
    const { folderId } = useParams();
    const navigate = useNavigate();
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);

    // Custom Modal State
    const [showModal, setShowModal] = useState(false);
    const [folderName, setFolderName] = useState("");

    useEffect(() => {
        load();
    }, [folderId]);

    async function load() {
        const childFolders = await folderService.getFolders(folderId);
        const folderFiles = await storageService.getFiles(folderId);
        setFolders(childFolders);
        setFiles(folderFiles);
    }

    async function handleCreateFolder(e) {
        e.preventDefault();
        if (!folderName.trim()) return;
        await folderService.createFolder(folderName.trim(), folderId);
        setFolderName("");
        setShowModal(false);
        load();
    }

    return (
        <div className="page">
            {folders.length > 0 && (
                <>
                    <h2>Folders</h2>
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
                </>
            )}

            <h2>Files</h2>
            {files.length === 0 ? (
                <p>No files.</p>
            ) : (
                <div className="fileGrid">
                    {files.map(file => (
                        <FileCard key={file.id} file={file} />
                    ))}
                </div>
            )}

            {/* FLOATING ACTION BUTTONS */}
            <div className="fab-container">
                <button
                    className="fab-button secondary"
                    onClick={() => setShowModal(true)}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                        <line x1="12" y1="11" x2="12" y2="17"></line>
                        <line x1="9" y1="14" x2="15" y2="14"></line>
                    </svg>
                    New Folder
                </button>
                
                <button
                    className="fab-button"
                    onClick={() => {
                        navigate(`/upload?folder=${folderId}`);
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    Upload File
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

export default FolderPage;