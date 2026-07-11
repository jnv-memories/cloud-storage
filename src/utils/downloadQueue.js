export async function downloadQueue(

    parts,

    signal,

    concurrency = 4,

    onProgress = () => {}

){

    const blobs=new Array(parts.length);

    let current=0;

    let downloadedBytes=0;

    const totalBytes=parts.reduce(

        (sum,part)=>sum+part.size,

        0

    );

    const started=Date.now();

    async function downloadPart(index){

        const response=await fetch(

            parts[index].url,

            {

                signal

            }

        );

        if(!response.ok){

            throw new Error(

                "Download failed"

            );

        }

        const reader=response.body.getReader();

        const chunks=[];

        let received=0;

        while(true){

            if(signal.aborted){

                throw new DOMException(

                    "Cancelled",

                    "AbortError"

                );

            }

            const{

                done,

                value

            }=await reader.read();

            if(done){

                break;

            }

            chunks.push(value);

            received+=value.length;

            downloadedBytes+=value.length;

            const elapsed=Math.max(

                (Date.now()-started)/1000,

                0.001

            );

            const speed=

                downloadedBytes/

                elapsed;

            const eta=

                (

                    totalBytes-

                    downloadedBytes

                )/

                speed;

            onProgress({

                percent:Math.round(

                    downloadedBytes/

                    totalBytes*

                    100

                ),

                downloaded:

                    downloadedBytes,

                total:

                    totalBytes,

                speed:

                    (

                        speed/

                        1024/

                        1024

                    ).toFixed(2)

                    +" MB/s",

                eta:

                    Math.round(eta)

                    +" sec"

            });

        }

        blobs[index]=new Blob(

            chunks

        );

    }

    async function worker(){

        while(true){

            if(signal.aborted){

                throw new DOMException(

                    "Cancelled",

                    "AbortError"

                );

            }

            const index=current++;

            if(index>=parts.length){

                return;

            }

            await downloadPart(index);

        }

    }

    await Promise.all(

        Array.from(

            {

                length:Math.min(

                    concurrency,

                    parts.length

                )

            },

            ()=>worker()

        )

    );

    return blobs;

}