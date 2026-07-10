export async function downloadQueue(

    parts,

    signal,

    concurrency = 4,

    onProgress = () => {}

) {

    const blobs = new Array(parts.length);

    let completedBytes = 0;

    let current = 0;

    const totalBytes = parts.reduce(

        (sum, part) => sum + part.size,

        0

    );

    const started = Date.now();

    async function worker() {

        while (true) {

            if (signal.aborted) {

                throw new DOMException(

                    "Cancelled",

                    "AbortError"

                );

            }

            const index = current++;

            if (index >= parts.length) {

                return;

            }

            const response = await fetch(

                parts[index].url,

                {

                    signal

                }

            );

            if (!response.ok) {

                throw new Error(

                    "Download failed"

                );

            }

            const blob = await response.blob();

            blobs[index] = blob;

            completedBytes += blob.size;

            const elapsed =

                (Date.now() - started) /

                1000;

            const speed =

                completedBytes /

                elapsed;

            const eta =

                (totalBytes - completedBytes) /

                speed;

            onProgress({

                percent: Math.round(

                    completedBytes /

                    totalBytes *

                    100

                ),

                speed:

                    (

                        speed /

                        1024 /

                        1024

                    ).toFixed(2)

                    + " MB/s",

                eta:

                    Math.round(eta)

                    + " sec"

            });

        }

    }

    await Promise.all(

        Array.from(

            {

                length: Math.min(

                    concurrency,

                    parts.length

                )

            },

            worker

        )

    );

    return blobs;

}