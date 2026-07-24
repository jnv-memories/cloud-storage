import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import storageService from "../services/storageService";
import folderService from "../services/folderService";
import { addFileFromUrl } from "../utils/addFromUrl"; // NEW: Import the utility
import FileCard from "../components/FileCard";
import "../styles/home.css";

function FolderPage() {
    const { folderId } = useParams();
    const navigate = useNavigate();
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);

    // Custom Modal State - Folder
    const [showModal, setShowModal] = useState(false);
    const [folderName, setFolderName] = useState("");

    // Custom Modal State - URL (NEW)
    const [showUrlModal, setShowUrlModal] = useState(false);
    const [fileUrl, setFileUrl] = useState("");
    const [isSubmittingUrl, setIsSubmittingUrl] = useState(false);

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

    // NEW: Handle URL Submission
    async function handleAddFromUrl(e) {
        e.preventDefault();
        if (!fileUrl.trim()) return;
        
        setIsSubmittingUrl(true);
        try {
            await addFileFromUrl(fileUrl.trim(), folderId);
            setFileUrl("");
            setShowUrlModal(false);
            load(); // Reload to show the newly queued/added file if applicable
        } catch (error) {
            console.error("Failed to add from URL", error);
            alert("Failed to add file from URL. Please try again.");
        } finally {
            setIsSubmittingUrl(false);
        }
    }

    return (
        <div className="page">
            
            <div className="page-header">
                <button 
                    className="back-btn" 
                    onClick={() => {
                        if (window.history.state && window.history.state.idx > 0) {
                            navigate(-1);
                        } else {
                            navigate('/', { replace: true });
                        }
                    }}
                    title="Go Back"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                <h2>Directory</h2>
            </div>

            {folders.length > 0 && (
                <div className="fileGrid" style={{ marginBottom: "30px" }}>
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
            )}

            <h2>Files</h2>
            {files.length === 0 ? (
                <p style={{ color: "#6c757d" }}>No files uploaded yet.</p>
            ) : (
                <div className="fileGrid">
                    {files.map(file => (
                        <FileCard key={file.id} file={file} />
                    ))}
                </div>
            )}

            {/* FLOATING ACTION BUTTONS */}
            <div className="fab-container">
                {/* NEW: URL Button */}
                <button
                    className="fab-button secondary"
                    onClick={() => setShowUrlModal(true)}
                    title="Add from URL"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                    Add URL
                </button>

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

            {/* NEW: CUSTOM URL MODAL */}
            {showUrlModal && (
                <div className="modal-overlay" onClick={() => setShowUrlModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h3>Add File from URL</h3>
                        <form onSubmit={handleAddFromUrl}>
                            <input
                                type="url"
                                className="modal-input"
                                placeholder="https://example.com/video.mp4"
                                value={fileUrl}
                                onChange={e => setFileUrl(e.target.value)}
                                autoFocus
                                required
                            />
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => {
                                        setShowUrlModal(false);
                                        setFileUrl("");
                                    }}
                                    disabled={isSubmittingUrl}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-create" disabled={isSubmittingUrl}>
                                    {isSubmittingUrl ? "Adding..." : "Add"}
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