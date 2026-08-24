import { useEffect } from "react";
import { isImage, isVideo } from "../utils/fileType";
import "../styles/modal.css";

function ImageModal({
    files,
    currentIndex,
    close,
    onPrevious,
    onNext,
    getMediaUrl
}) {
    const currentFile = files[currentIndex];

    useEffect(() => {
        const handleKeyDown = e => {
            if (e.key === "Escape") {
                e.preventDefault();
                close();
                return;
            }

            if (e.key === "ArrowLeft") {
                e.preventDefault();
                onPrevious();
                return;
            }

            if (e.key === "ArrowRight") {
                e.preventDefault();
                onNext();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [close, onPrevious, onNext]);

    if (!currentFile) {
        return null;
    }

    const mediaUrl = getMediaUrl(currentFile);
    const image = isImage(currentFile.type);
    const video = isVideo(currentFile.type);

    return (
        <div className="media-viewer" onClick={close}>
            <button
                className="media-viewer-close"
                onClick={e => {
                    e.stopPropagation();
                    close();
                }}
                aria-label="Close viewer"
                title="Close"
            >
                ×
            </button>

            <div
                className="media-viewer-nav media-viewer-nav-left"
                onClick={e => {
                    e.stopPropagation();
                    onPrevious();
                }}
                aria-label="Previous file"
            >
                <span className="media-viewer-arrow">‹</span>
            </div>

            <div
                className="media-viewer-content"
                onClick={e => e.stopPropagation()}
            >
                {image && (
                    <img
                        src={mediaUrl}
                        className="media-viewer-media"
                        draggable="false"
                        alt={currentFile.name}
                    />
                )}

                {video && (
                    <video
                        src={mediaUrl}
                        className="media-viewer-media media-viewer-video"
                        controls
                        autoPlay
                        playsInline
                    />
                )}
            </div>

            <div
                className="media-viewer-nav media-viewer-nav-right"
                onClick={e => {
                    e.stopPropagation();
                    onNext();
                }}
                aria-label="Next file"
            >
                <span className="media-viewer-arrow">›</span>
            </div>

            <div
                className="media-viewer-info"
                onClick={e => e.stopPropagation()}
            >
                <span className="media-viewer-name">
                    {currentFile.name}
                </span>

                <span className="media-viewer-position">
                    {currentIndex + 1} / {files.length}
                </span>
            </div>
        </div>
    );
}

export default ImageModal;