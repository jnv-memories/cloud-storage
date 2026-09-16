export function isImage(type){


    return (

        type?.startsWith(
            "image/"
        )

    );


}



export function isVideo(type){


    return (

        type?.startsWith(
            "video/"
        )

    );


}


// MIME types that browsers cannot play natively in <video>
const UNPLAYABLE_VIDEO_TYPES = new Set([
    "video/x-matroska",
    "video/mkv",
    "video/x-mkv",
    "video/avi",
    "video/x-msvideo",
    "video/x-flv",
    "video/x-ms-wmv",
    "video/3gpp2",
]);

// Extension → correct MIME type for formats browsers misreport or blank-out
const EXT_TO_MIME = {
    mkv:  "video/x-matroska",
    avi:  "video/x-msvideo",
    flv:  "video/x-flv",
    wmv:  "video/x-ms-wmv",
    mov:  "video/quicktime",
    m4v:  "video/mp4",
    webm: "video/webm",
    ogv:  "video/ogg",
    mp4:  "video/mp4",
};

/**
 * Returns the correct MIME type for a File object.
 * Falls back to extension-based lookup when the browser
 * reports an empty or wrong type (common with MKV files).
 */
export function resolveMimeType(file) {
    if (file.type && file.type !== "application/octet-stream") {
        return file.type;
    }
    const ext = file.name.split(".").pop()?.toLowerCase();
    return EXT_TO_MIME[ext] || file.type || "application/octet-stream";
}

/**
 * Returns true when the browser's <video> element cannot
 * play this MIME type natively.
 */
export function isUnplayableVideo(type) {
    return UNPLAYABLE_VIDEO_TYPES.has(type?.toLowerCase());
}