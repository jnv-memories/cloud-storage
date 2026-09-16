import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import storageService from "../services/storageService";
import folderService from "../services/folderService";
import { addFileFromUrl } from "../utils/addFromUrl";
import FileCard from "../components/FileCard";
import "../styles/home.css";

function FolderPage() {
    const { folderId, fileId } = useParams();
    const navigate = useNavigate();

    const [currentFolder, setCurrentFolder] = useState(null);
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [folderName, setFolderName] = useState("");

    const [showUrlModal, setShowUrlModal] = useState(false);
    const [fileUrl, setFileUrl] = useState("");
    const [isSubmittingUrl, setIsSubmittingUrl] = useState(false);

    // Speed-dial FAB state
    const [fabOpen, setFabOpen] = useState(false);

    useEffect(() => {
        load();
    }, [folderId]);

    // Close speed-dial when clicking outside
    useEffect(() => {
        if (!fabOpen) return;
        const handler = () => setFabOpen(false);
        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, [fabOpen]);

    async function load() {
        const [folder, childFolders, folderFiles] = await Promise.all([
            folderService.getFolder(folderId),
            folderService.getFolders(folderId),
            storageService.getFiles(folderId),
        ]);
        setCurrentFolder(folder);
        setFolders(childFolders);
        setFiles(folderFiles);
    }

    function handleBack() {
        // Navigate to parent folder if we know it, otherwise home
        if (currentFolder?.parentId) {
            navigate(`/folder/${currentFolder.parentId}`);
        } else {
            navigate("/");
        }
    }

    async function handleCreateFolder(e) {
        e.preventDefault();
        if (!folderName.trim()) return;
        await folderService.createFolder(folderName.trim(), folderId);
        setFolderName("");
        setShowModal(false);
        load();
    }

    async function handleAddFromUrl(e) {
        e.preventDefault();
        if (!fileUrl.trim()) return;

        setIsSubmittingUrl(true);

        try {
            await addFileFromUrl(fileUrl.trim(), folderId);
            setFileUrl("");
            setShowUrlModal(false);
            load();
        } catch (error) {
            console.error("Failed to add from URL", error);
            alert("Failed to add file from URL. Please try again.");
        } finally {
            setIsSubmittingUrl(false);
        }
    }

    return (
        <div className="page">
            {/* HEADER */}
            <div className="page-header">
                <button
                    className="back-btn"
                    onClick={handleBack}
                    title="Go Back"
                    aria-label="Go back"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                </button>
                <h2 className="page-header-title">
                    {currentFolder ? currentFolder.name : "…"}
                </h2>
            </div>

            {/* SUB-FOLDERS */}
            {folders.length > 0 && (
                <div className="fileGrid" style={{ marginBottom: "30px" }}>
                    {folders.map(folder => (
                        <div
                            key={folder.id}
                            className="folderCard"
                            onClick={() => navigate(`/folder/${folder.id}`)}
                        >
                            <div className="folderCard-content">
                                <div className="folderIcon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                    </svg>
                                </div>
                                <h3>{folder.name}</h3>
                            </div>
                            <div className="folder-arrow">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* FILES */}
            <h2>Files</h2>

            {files.length === 0 ? (
                <p style={{ color: "#6c757d", marginTop: "12px" }}>No files uploaded yet.</p>
            ) : (
                <div className="fileGrid">
                    {files.map(file => (
                        <FileCard
                            key={file.id}
                            file={file}
                            files={files}
                            folderId={folderId}
                            openFromLink={file.id === fileId}
                        />
                    ))}
                </div>
            )}

            {/* SPEED-DIAL FAB */}
            <div
                className={`fab-container${fabOpen ? " fab-open" : ""}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Secondary actions — only visible when open */}
                <div className="fab-actions">
                    <button
                        className="fab-button secondary"
                        onClick={() => { setFabOpen(false); setShowUrlModal(true); }}
                        title="Add from URL"
                        tabIndex={fabOpen ? 0 : -1}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                        </svg>
                        <span className="fab-label">Add URL</span>
                    </button>

                    <button
                        className="fab-button secondary"
                        onClick={() => { setFabOpen(false); setShowModal(true); }}
                        title="New Folder"
                        tabIndex={fabOpen ? 0 : -1}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                            <line x1="12" y1="11" x2="12" y2="17" />
                            <line x1="9" y1="14" x2="15" y2="14" />
                        </svg>
                        <span className="fab-label">New Folder</span>
                    </button>

                    <button
                        className="fab-button secondary"
                        onClick={() => { setFabOpen(false); navigate(`/upload?folder=${folderId}`); }}
                        title="Upload File"
                        tabIndex={fabOpen ? 0 : -1}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span className="fab-label">Upload</span>
                    </button>
                </div>

                {/* Main trigger button */}
                <button
                    className={`fab-button fab-trigger${fabOpen ? " fab-trigger-active" : ""}`}
                    onClick={() => setFabOpen(prev => !prev)}
                    aria-label="Actions"
                    aria-expanded={fabOpen}
                >
                    <svg
                        className="fab-trigger-icon"
                        width="20" height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span className="fab-trigger-label">Actions</span>
                </button>
            </div>

            {/* CREATE FOLDER MODAL */}
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
                                    onClick={() => { setShowModal(false); setFolderName(""); }}
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

            {/* ADD FROM URL MODAL */}
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
                                    onClick={() => { setShowUrlModal(false); setFileUrl(""); }}
                                    disabled={isSubmittingUrl}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-create" disabled={isSubmittingUrl}>
                                    {isSubmittingUrl ? "Adding…" : "Add"}
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
