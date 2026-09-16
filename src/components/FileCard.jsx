import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageModal from "./ImageModal";
import { isImage, isVideo } from "../utils/fileType";
import { downloadMultipart } from "../utils/downloadMultipart";
import "../styles/home.css";

const STREAM_SERVER = "https://stream-server-y1io.onrender.com/stream/";

function FileCard({
    file,
    files = [],
    folderId,
    openFromLink = false
}) {
    const navigate = useNavigate();

    const [showImage, setShowImage] = useState(false);
    const [viewerIndex, setViewerIndex] = useState(0);
    const [downloadState, setDownloadState] = useState(null);
    const [downloadController, setDownloadController] = useState(null);

    const mediaFiles = files.filter(item =>
        isImage(item.type) || isVideo(item.type)
    );

    const getMediaUrl = item => {
        if (item.multipart) {
            return STREAM_SERVER + item.id;
        }

        return item.url;
    };

    const getShareUrl = () => {
        return `${window.location.origin}/folder/${folderId}/${file.id}`;
    };

    const openViewer = () => {
        const index = mediaFiles.findIndex(
            item => item.id === file.id
        );

        if (index === -1) {
            return;
        }

        setViewerIndex(index);
        setShowImage(true);
    };

    const closeViewer = () => {
        setShowImage(false);

        if (openFromLink) {
            navigate(
                `/folder/${folderId}`,
                { replace: true }
            );
        }
    };

    const showPrevious = () => {
        setViewerIndex(index =>
            index === 0
                ? mediaFiles.length - 1
                : index - 1
        );
    };

    const showNext = () => {
        setViewerIndex(index =>
            index === mediaFiles.length - 1
                ? 0
                : index + 1
        );
    };

    useEffect(() => {
        if (!openFromLink) {
            return;
        }

        const index = mediaFiles.findIndex(
            item => item.id === file.id
        );

        if (index === -1) {
            return;
        }

        setViewerIndex(index);
        setShowImage(true);
    }, [openFromLink, file.id, mediaFiles.length]);

    const copyURL = async () => {
        const shareUrl = getShareUrl();

        try {
            await navigator.clipboard.writeText(
                shareUrl
            );
        } catch (error) {
            console.error(
                "Failed to copy URL",
                error
            );
        }
    };

    const startDownload = async () => {
        const controller =
            new AbortController();

        setDownloadController(controller);

        let fileHandle = null;

        if (window.showSaveFilePicker) {
            try {
                fileHandle =
                    await window.showSaveFilePicker({
                        suggestedName: file.name,
                        types: [
                            {
                                description: "File",
                                accept: {
                                    [
                                        file.type ||
                                        "application/octet-stream"
                                    ]: [
                                        "." +
                                        file.name
                                            .split(".")
                                            .pop()
                                    ]
                                }
                            }
                        ]
                    });
            } catch {
                return;
            }
        }

        setDownloadState({
            status: "Downloading",
            percent: 0,
            speed: "0 MB/s",
            eta: "0 sec"
        });

        try {
            await downloadMultipart(
                file,
                controller.signal,
                progress => {
                    setDownloadState({
                        status: "Downloading",
                        ...progress
                    });
                },
                fileHandle
            );

            setDownloadState({
                status: "Completed",
                percent: 100
            });

            setTimeout(
                () => setDownloadState(null),
                1200
            );
        } catch (error) {
            if (
                error.name ===
                "AbortError"
            ) {
                setDownloadState({
                    status: "Cancelled"
                });
            } else {
                setDownloadState({
                    status: "Failed",
                    error: error.message
                });
            }
        } finally {
            setDownloadController(null);
        }
    };

    const cancelDownload = () => {
        if (downloadController) {
            downloadController.abort();
        }
    };

    return (
        <div className="fileCard">
            {!file.multipart &&
                isImage(file.type) && (
                    <img
                        src={file.url}
                        className="preview"
                        onClick={openViewer}
                        draggable="false"
                        alt={file.name}
                    />
                )}

            {!file.multipart &&
                isVideo(file.type) && (
                    <video
                        src={file.url}
                        className="preview"
                        controls
                        onDoubleClick={openViewer}
                    />
                )}

            {file.multipart &&
                isVideo(file.type) && (
                    <video
                        src={getMediaUrl(file)}
                        className="preview"
                        controls
                        onDoubleClick={openViewer}
                    />
                )}

            {!isImage(file.type) &&
                !isVideo(file.type) && (
                    <div className="fileIcon">
                        FILE
                    </div>
                )}

            <h3>
                {file.name}
            </h3>

            <p>
                ID:
                <br />
                {file.id}
            </p>

            <p>
                Created:
                <br />
                {new Date(
                    file.createdAt
                ).toLocaleString()}
            </p>

            <div className="actions">
                {(isImage(file.type) ||
                    isVideo(file.type)) && (
                    <button
                        onClick={copyURL}
                        title="Copy share link"
                    >
                        Copy URL
                    </button>
                )}

                {!file.multipart && (
                    <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                    >
                        Download
                    </a>
                )}

                {file.multipart && (
                    downloadState?.status ===
                    "Downloading" ? (
                        <button
                            onClick={cancelDownload}
                        >
                            Cancel
                        </button>
                    ) : (
                        <button
                            onClick={startDownload}
                        >
                            {downloadState?.status ===
                            "Failed"
                                ? "Retry Download"
                                : "Download"}
                        </button>
                    )
                )}
            </div>

            {downloadState && (
                <p>
                    {downloadState.status}

                    {downloadState.percent !==
                        undefined && (
                        <>
                            <br />
                            {downloadState.percent}%
                            {" | "}
                            {downloadState.speed}
                            {" ETA: "}
                            {downloadState.eta}
                        </>
                    )}
                </p>
            )}

            {showImage && (
                <ImageModal
                    files={mediaFiles}
                    currentIndex={viewerIndex}
                    close={closeViewer}
                    onPrevious={showPrevious}
                    onNext={showNext}
                    getMediaUrl={getMediaUrl}
                />
            )}
        </div>
    );
}

export default FileCard;