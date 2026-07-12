import { downloadQueue } from "./downloadQueue";
import { OrderedWriter } from "./orderedWriter";

export async function downloadMultipart(
    file,
    signal,
    onProgress = () => {},
    fileHandle = null
) {
    /*
        Streaming download (Direct to SSD)
        Chrome / Edge / Brave
    */
    if (fileHandle) {
        const writable = await fileHandle.createWritable();
        const writer = new OrderedWriter(writable);

        try {
            await downloadQueue(
                file.parts,
                signal,
                2,
                onProgress,
                (index, stream) => writer.add(index, stream)
            );
            await writable.close();
        } catch (error) {
            try {
                await writable.abort();
            } catch {}
            throw error;
        }
        return;
    }

    /*
        Fallback (Buffered in RAM)
        Firefox / Safari
    */
    const blobs = [];
    await downloadQueue(
        file.parts,
        signal,
        2,
        onProgress,
        async (index, stream) => {
            // Natively consume the stream directly into a blob without manual while loops
            const response = new Response(stream);
            blobs[index] = await response.blob();
        }
    );

    const blob = new Blob(blobs, { type: file.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
}