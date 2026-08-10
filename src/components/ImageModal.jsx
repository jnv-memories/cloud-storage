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
        <div className="modal" onClick={close}>
            <div
                className="modal-nav-zone modal-nav-left"
                onClick={e => {
                    e.stopPropagation();
                    onPrevious();
                }}
                aria-label="Previous file"
            >
                <span className="modal-nav-arrow">
                    ‹
                </span>
            </div>

            <div
                className="modal-media-container"
                onClick={e => e.stopPropagation()}
            >
                {image && (
                    <img
                        src={mediaUrl}
                        className="modal-media"
                        draggable="false"
                        alt={currentFile.name}
                    />
                )}

                {video && (
                    <video
                        src={mediaUrl}
                        className="modal-media modal-video"
                        controls
                        autoPlay
                        playsInline
                    />
                )}
            </div>

            <div
                className="modal-nav-zone modal-nav-right"
                onClick={e => {
                    e.stopPropagation();
                    onNext();
                }}
                aria-label="Next file"
            >
                <span className="modal-nav-arrow">
                    ›
                </span>
            </div>

            <div
                className="modal-file-info"
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-file-name">
                    {currentFile.name}
                </div>

                <div className="modal-file-position">
                    {currentIndex + 1} / {files.length}
                </div>
            </div>
        </div>
    );
}

export default ImageModal;