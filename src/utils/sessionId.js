export function getSessionId(file){
    return [
        file.name,
        file.size,
        file.lastModified
    ].join("_");
}