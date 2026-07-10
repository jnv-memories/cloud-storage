import { useState } from "react";

import ImageModal from "./ImageModal";

import {
    isImage,
    isVideo
} from "../utils/fileType";

import {
    downloadMultipart
} from "../utils/downloadMultipart";


import "../styles/home.css";


function FileCard({ file }) {


    const [showImage,setShowImage] = useState(false);


    const [downloadState,setDownloadState] = useState(null);


    const [downloadController,setDownloadController] = useState(null);



    const copyURL = ()=>{

        navigator.clipboard.writeText(
            file.url
        );

    };



    const startDownload = async()=>{


        const controller =
            new AbortController();


        setDownloadController(controller);



        setDownloadState({

            status:"Downloading",

            percent:0,

            speed:"0 MB/s",

            eta:"0 sec"

        });



        try{


            await downloadMultipart(

                file,

                controller.signal,

                (progress)=>{


                    setDownloadState({

                        status:"Downloading",

                        ...progress

                    });


                }

            );


            setDownloadState(null);


        }


        catch(error){


            if(error.name === "AbortError"){


                setDownloadState({

                    status:"Cancelled"

                });


            }

            else{


                setDownloadState({

                    status:"Failed",

                    error:error.message

                });


            }


        }


        finally{


            setDownloadController(null);


        }


    };




    const cancelDownload = ()=>{


        if(downloadController){

            downloadController.abort();

        }


    };



    return (

        <div className="fileCard">


            {
                !file.multipart &&
                isImage(file.type) &&


                <img

                    src={file.url}

                    className="preview"

                    onClick={() =>
                        setShowImage(true)
                    }

                />

            }



            {
                !file.multipart &&
                isVideo(file.type) &&


                <video

                    src={file.url}

                    className="preview"

                    controls

                />

            }



            {
                file.multipart &&


                <div className="fileIcon">

                    MULTIPART

                </div>

            }



            {
                !file.multipart &&
                !isImage(file.type) &&
                !isVideo(file.type) &&


                <div className="fileIcon">

                    FILE

                </div>

            }



            <h3>

                {file.name}

            </h3>



            <p>

                ID:

                <br/>

                {file.id}

            </p>



            <p>

                Created:

                <br/>

                {
                    new Date(
                        file.createdAt
                    )
                    .toLocaleString()
                }

            </p>



            <div className="actions">


                {
                    !file.multipart &&

                    <>

                        <button
                            onClick={copyURL}
                        >

                            Copy URL

                        </button>


                        <a

                            href={file.url}

                            target="_blank"

                            rel="noreferrer"

                        >

                            Open

                        </a>

                    </>

                }




                {
                    file.multipart &&


                    (

                    downloadState?.status === "Downloading"

                    ?

                    <button

                        onClick={cancelDownload}

                    >

                        Cancel

                    </button>


                    :

                    <button

                        onClick={startDownload}

                    >

                        {
                            downloadState?.status === "Failed"

                            ?

                            "Retry Download"

                            :

                            "Download"

                        }

                    </button>

                    )

                }


            </div>



            {
                downloadState &&


                <p>

                    {

                    downloadState.status

                    }


                    {
                        downloadState.percent !== undefined &&

                        <>
                        <br/>

                        {downloadState.percent}% |

                        {" "}

                        {downloadState.speed}

                        {" "}

                        ETA:

                        {" "}

                        {downloadState.eta}

                        </>

                    }

                </p>

            }



            {
                showImage &&

                <ImageModal

                    url={file.url}

                    close={() =>
                        setShowImage(false)
                    }

                />

            }



        </div>

    );

}


export default FileCard;