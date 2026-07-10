import { useEffect, useState, useRef } from "react";
import useUploader from "../hooks/useUploader";
import UploadProgress from "../components/UploadProgress";
import "../styles/upload.css";
import storageService from "../services/storageService";

function Upload() {
    const resumeInput = useRef();
    const [resumeSession, setResumeSession] = useState(null);

    const [sessions, setSessions] = useState([]);
    useEffect(() => {

        loadSessions();

    }, []);

    const loadSessions = async () => {

        const data =

            await storageService.getUploadSessions();

        setSessions(data);

    };

    const fileInput = useRef();
    const {
        queue,
        addToQueue,
        startUpload,
        removeFromQueue,
        cancelUpload,
        retryUpload
    } = useUploader();

    const handleFiles = (files) => {
        const fileArray = Array.from(files);

        if (fileArray.length > 0) {
            addToQueue(fileArray);
        }
    };
    const chooseFiles = (e) => {
        const selectedFiles = e.target.files;

        if (!selectedFiles || selectedFiles.length === 0) {
            return;
        }
        handleFiles(selectedFiles);
        setTimeout(() => {
            e.target.value = "";
        }, 100);
    };
    const dropFiles = (e) => {
        e.preventDefault();
        handleFiles(
            e.dataTransfer.files
        );
    };

    return (
        <div className="page">
            <h1>Upload Files</h1>
            <input ref={resumeInput}
                hidden
                type="file"
                onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    if (
                        file.name !== resumeSession.name ||
                        file.size !== resumeSession.size ||
                        file.lastModified !== resumeSession.lastModified
                    ) {
                        alert("Wrong file selected.");
                        return;
                    }
                    addToQueue(
                        [file],
                        resumeSession
                    );
                }}
            />
            {
                sessions.length > 0 &&
                <div className="resumeBox">
                    <h2>Incomplete Uploads</h2>
                    {
                        sessions.map(session => (
                            <div
                                key={session.sessionId}
                                className="resumeCard"
                            >
                                <div>
                                    <b>
                                        {session.name}
                                    </b>
                                    <br />
                                    {
                                        Math.round(
                                            session.nextChunk /
                                            session.totalChunks * 100
                                        )
                                    }
                                    %
                                </div>
                                <div>
                                    <button
                                        onClick={()=>{
                                            setResumeSession(session);
                                            resumeInput.current.click();
                                        }}
                                    >Resume
                                    </button>
                                    <button
                                        onClick={async () => {
                                            await storageService.deleteUploadSession(
                                                session.sessionId
                                            );
                                            loadSessions();
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    }
                </div>
            }
            <div
                className="dropZone"
                onDragOver={
                    e => e.preventDefault()
                }
                onDrop={dropFiles}
                onClick={
                    () => fileInput.current.click()
                }
            >
                <h2>Drag & Drop Files</h2>
                <p>or click to select</p>
            </div>
            <input
                ref={fileInput}
                type="file"
                multiple
                hidden
                onChange={chooseFiles}
            />
            <div className="queue">
                {
                    queue.map(item => (
                        <UploadProgress
                            key={item.id}
                            data={{
                                ...item,
                                onCancel: () => cancelUpload(item.id),
                                onRetry: () => retryUpload(item.id)
                            }}
                            onRemove={() =>
                                removeFromQueue(item.id)
                            }
                        />
                    ))
                }
            </div>
            {
                queue.length > 0 &&
                <button
                    className="uploadBtn"
                    onClick={startUpload}
                >Upload All
                </button>
            }
        </div>
    );
}
export default Upload;