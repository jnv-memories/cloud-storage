import axios from "axios";

import config from "../config/config";
import storageService from "./storageService";
import { splitFile } from "../utils/splitFile";
import { getSessionId } from "../utils/sessionId";


async function uploadSingle(file, onProgress, signal) {

    const formData = new FormData();
    formData.append(
        config.FILE_FIELD_NAME,
        file
    );

    const startTime = Date.now();

    const response = await axios.post(

        config.API_BASE_URL + config.UPLOAD_ENDPOINT,

        formData,
        {
            headers: {
                Authorization: config.AUTH_TOKEN,
                "Content-Type": "multipart/form-data",
                "client-type": "web",
                "X-SDK-Version": "0.0.13-alpha.10",
                "client-id": "5eb393ee95fab7468a79d189"
            },
            signal,
            timeout: config.REQUEST_TIMEOUT,

            onUploadProgress: (event) => {

                const elapsed =
                    (Date.now() - startTime) / 1000;

                const loaded = event.loaded;

                const total =
                    event.total || file.size;

                const percent =
                    Math.round(
                        (loaded / total) * 100
                    );

                const speed =
                    elapsed > 0
                        ? loaded / elapsed
                        : 0;

                const eta =
                    speed > 0
                        ? (total - loaded) / speed
                        : 0;

                onProgress({

                    loaded,

                    total,

                    percent,

                    speed:
                        (speed / 1024 / 1024).toFixed(2) +
                        " MB/s",

                    eta:
                        Math.round(eta) + " sec"

                });

            }

        }

    );

    const data = response.data.data;

    return {
        _id: data._id,
        url: data.baseUrl + data.key,
        createdAt: data.createdAt
    };
}

async function uploadFile(file, onProgress = () => { }, signal, folderId, resumeSession = null) {
    if (file.size <= config.MULTIPART_LIMIT) {
        const sessionId = getSessionId(file);
        let session = resumeSession || await storageService.getUploadSession(sessionId);
        if (!session) {
            session = {
                sessionId,
                multipart: false,
                status: "uploading",
                uploaded: false,
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
                createdAt: new Date().toISOString()
            };
            await storageService.createUploadSession(session);
        }
        const result = await uploadSingle(
            file,
            onProgress,
            signal
        );

        const finalFile = {
            id: result._id,
            multipart: false,
            _id: result._id,
            folderId,
            name: file.name,
            url: result.url,
            createdAt: result.createdAt,
            size: file.size,
            type: file.type
        };
        //await storageService.addFile(finalFile);
        await storageService.deleteUploadSession(sessionId);
        return finalFile;
    }

    const chunks = splitFile(
        file,
        config.CHUNK_SIZE
    );

    const sessionId = getSessionId(file);

    let session = resumeSession || await storageService.getUploadSession(sessionId);

    if (!session) {

        session = {
            sessionId,
            status: "uploading",
            multipart: true,
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified,
            chunkSize: config.CHUNK_SIZE,
            totalChunks: chunks.length,
            createdAt: new Date().toISOString(),
            nextChunk: 0,
            parts: []
        };

        await storageService.createUploadSession(session);

    }

    const parts = [...session.parts];

    let uploadedBytes = parts.reduce(
        (t, p) => t + p.size,
        0
    );
    onProgress({

        percent: Math.round(

            uploadedBytes /

            file.size * 100

        ),

        speed: "0 MB/s",

        eta: "Calculating..."

    });
    const uploadStarted = Date.now();


    for (let i = session.nextChunk; i < chunks.length; i++) {
        const chunk = chunks[i];
        let retry = 0;
        while (true) {
            try {
                const result = await uploadSingle(

                    chunk.file,

                    progress => {

                        const totalUploaded =
                            uploadedBytes +
                            progress.loaded;

                        const percent = Math.round(
                            totalUploaded /
                            file.size *
                            100
                        );

                        const elapsed =
                            (Date.now() - uploadStarted) / 1000;

                        const speedBytes =
                            elapsed > 0
                                ? totalUploaded / elapsed
                                : 0;

                        const eta =
                            speedBytes > 0
                                ? (file.size - totalUploaded) / speedBytes
                                : 0;

                        onProgress({

                            percent,

                            speed:
                                (
                                    speedBytes /
                                    1024 /
                                    1024
                                ).toFixed(2)
                                + " MB/s",

                            eta:
                                Math.round(eta)
                                + " sec"

                        });

                    },

                    signal

                );

                uploadedBytes += chunk.size;

                parts.push({

                    index: i,

                    _id: result._id,

                    url: result.url,

                    size: chunk.size

                });

                await storageService.updateUploadSession(

                    sessionId,

                    {

                        nextChunk: i + 1,

                        parts

                    }

                );

                break;

            }

            catch (err) {

                retry++;

                if (

                    retry >

                    config.UPLOAD_RETRY_COUNT

                ) {

                    throw err;

                }

            }

        }

    }

    const finalFile = {

        id: "virtual-" + crypto.randomUUID(),

        multipart: true,
        folderId,
        name: file.name,

        type: file.type,

        size: file.size,

        createdAt: new Date().toISOString(),

        parts

    };

    //await storageService.addFile(finalFile);

    await storageService.deleteUploadSession(sessionId);

    return finalFile;
}

export default uploadFile;