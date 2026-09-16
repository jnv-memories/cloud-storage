import { useEffect, useRef } from "react";
import { isImage, isVideo } from "../utils/fileType";
import "../styles/modal.css";

// Minimum horizontal swipe distance to trigger prev/next
const SWIPE_THRESHOLD = 50;

function ImageModal({
    files,
    currentIndex,
    close,
    onPrevious,
    onNext,
    getMediaUrl
}) {
    const currentFile = files[currentIndex];

    // Touch tracking refs (no state — no re-renders)
    const touchStartX = useRef(null);
    const touchStartY = useRef(null);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = e => {
            if (e.key === "Escape") { e.preventDefault(); close(); return; }
            if (e.key === "ArrowLeft") { e.preventDefault(); onPrevious(); return; }
            if (e.key === "ArrowRight") { e.preventDefault(); onNext(); }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [close, onPrevious, onNext]);

    // Swipe handlers
    const handleTouchStart = e => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = e => {
        if (touchStartX.current === null) return;

        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const dy = e.changedTouches[0].clientY - touchStartY.current;

        // Only trigger if horizontal swipe dominates (not a scroll)
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) >= SWIPE_THRESHOLD) {
            if (dx < 0) {
                onNext();
            } else {
                onPrevious();
            }
        }

        touchStartX.current = null;
        touchStartY.current = null;
    };

    if (!currentFile) return null;

    const mediaUrl = getMediaUrl(currentFile);
    const image = isImage(currentFile.type);
    const video = isVideo(currentFile.type);

    return (
        <div
            className="media-viewer"
            onClick={close}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Close button */}
            <button
                className="media-viewer-close"
                onClick={e => { e.stopPropagation(); close(); }}
                aria-label="Close viewer"
                title="Close"
            >
                ×
            </button>

            {/* Left nav (hidden on very small screens — swipe instead) */}
            <div
                className="media-viewer-nav media-viewer-nav-left"
                onClick={e => { e.stopPropagation(); onPrevious(); }}
                aria-label="Previous file"
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === "Enter" && onPrevious()}
            >
                <span className="media-viewer-arrow">‹</span>
            </div>

            {/* Media content */}
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

            {/* Right nav */}
            <div
                className="media-viewer-nav media-viewer-nav-right"
                onClick={e => { e.stopPropagation(); onNext(); }}
                aria-label="Next file"
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === "Enter" && onNext()}
            >
                <span className="media-viewer-arrow">›</span>
            </div>

            {/* Info bar */}
            <div
                className="media-viewer-info"
                onClick={e => e.stopPropagation()}
            >
                <span className="media-viewer-name">{currentFile.name}</span>
                <span className="media-viewer-position">
                    {currentIndex + 1} / {files.length}
                </span>
            </div>

            {/* Swipe hint — only on touch devices, fades after first interaction */}
            {files.length > 1 && (
                <div className="media-viewer-swipe-hint" aria-hidden="true">
                    ‹ swipe ›
                </div>
            )}
        </div>
    );
}

export default ImageModal;
