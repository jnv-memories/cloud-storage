export async function downloadQueue(
    parts,
    signal,
    concurrency = 2,
    onProgress = () => {},
    onChunkStream = async () => {}
) {
    let nextDownload = 0;
    let downloadedBytes = 0;
    
    const totalBytes = parts.reduce((sum, part) => sum + part.size, 0);
    const started = Date.now();
    const completed = new Map();

    let resolveNewPartAdded = () => {};
    let newPartSignal = new Promise(r => resolveNewPartAdded = r);

    function updateProgress(size) {
        downloadedBytes += size;
        const elapsed = Math.max((Date.now() - started) / 1000, 0.001);
        const speed = downloadedBytes / elapsed;
        
        onProgress({
            percent: Math.round((downloadedBytes / totalBytes) * 100),
            speed: (speed / 1024 / 1024).toFixed(2) + " MB/s",
            eta: Math.round((totalBytes - downloadedBytes) / speed) + " sec"
        });
    }

    async function writerLoop() {
        let nextWrite = 0;
        while (nextWrite < parts.length) {
            if (!completed.has(nextWrite)) {
                await newPartSignal;
                continue;
            }

            const responseStream = completed.get(nextWrite);
            // REMOVED: completed.delete(nextWrite) from here

            const progressTracker = new TransformStream({
                transform(chunk, controller) {
                    updateProgress(chunk.byteLength);
                    controller.enqueue(chunk);
                }
            });

            const trackedStream = responseStream.pipeThrough(progressTracker, { signal });
            
            // Wait for the stream to be completely written to storage/RAM
            await onChunkStream(nextWrite, trackedStream);
            
            // MOVED HERE: Only clear it once it's completely finished processing
            completed.delete(nextWrite);
            nextWrite++;
        }
    }

    async function downloadWorker() {
        while (true) {
            const index = nextDownload++;
            if (index >= parts.length) return;

            const response = await fetch(parts[index].url, { signal });
            if (!response.ok) throw new Error("Download failed");

            completed.set(index, response.body);
            
            resolveNewPartAdded();
            newPartSignal = new Promise(r => resolveNewPartAdded = r);

            // This loop will now accurately hold the worker back 
            // until the stream is completely consumed by writerLoop
            while (completed.has(index) && !signal.aborted) {
                await new Promise(r => setTimeout(r, 50));
            }
        }
    }

    await Promise.all([
        writerLoop(),
        ...Array.from(
            { length: Math.min(concurrency, parts.length) },
            () => downloadWorker()
        )
    ]);
}