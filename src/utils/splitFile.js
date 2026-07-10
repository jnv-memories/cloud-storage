const DEFAULT_CHUNK_SIZE = 100 * 1024 * 1024;

export function splitFile(
    file,
    chunkSize = DEFAULT_CHUNK_SIZE
) {

    const chunks = [];

    const totalChunks = Math.ceil(
        file.size / chunkSize
    );

    let start = 0;
    let index = 0;

    while (start < file.size) {

        const end = Math.min(
            start + chunkSize,
            file.size
        );

        const blob = file.slice(start, end);

        const partNumber = String(index + 1).padStart(4, "0");

        const totalNumber = String(totalChunks).padStart(4, "0");

        chunks.push({

            index,

            start,

            end,

            size: end - start,

            file: new File(

                [blob],

                `${file.name}.part${partNumber}of${totalNumber}`,

                {

                    type: file.type

                }

            )

        });

        start = end;

        index++;

    }

    return chunks;

}

export { DEFAULT_CHUNK_SIZE };