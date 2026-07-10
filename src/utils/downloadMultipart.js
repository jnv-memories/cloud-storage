import { downloadQueue } from "./downloadQueue";

export async function downloadMultipart(

    file,

    signal,

    onProgress = () => {}

) {

    const blobs = await downloadQueue(

        file.parts,

        signal,

        4,

        onProgress

    );

    const merged = new Blob(

        blobs,

        {

            type: file.type

        }

    );

    const url = URL.createObjectURL(

        merged

    );

    const a = document.createElement("a");

    a.href = url;

    a.download = file.name;

    a.click();

    URL.revokeObjectURL(url);

}