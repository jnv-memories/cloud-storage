export async function addFileFromUrl(fileUrl, folderId) {
    const post_url = "https://queue-server-wpes.onrender.com/add";
    
    const body = {
        url: fileUrl,
        folderId: folderId
    };

    try {
        const response = await fetch(post_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); // Assuming the server responds with JSON
        return data;
    } catch (error) {
        console.error("Error pushing URL to queue:", error);
        throw error;
    }
}