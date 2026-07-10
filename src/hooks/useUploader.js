import { useRef, useState } from "react";
import uploadFile from "../services/uploadService";
import storageService from "../services/storageService";

function useUploader(){

    const [queue,setQueue]=useState([]);
    const controllers=useRef({});

    const updateFile=(id,updates)=>{

        setQueue(prev=>

            prev.map(item=>

                item.id===id

                ?{...item,...updates}

                :item

            )

        );

    };

    const addToQueue=(files,resumeSession=null)=>{

        const list=Array.from(files).map(file=>({

            id:crypto.randomUUID(),
            file,
            resumeSession,
            progress:resumeSession
            ?Math.round(
                resumeSession.nextChunk/
                resumeSession.totalChunks*100
            )
            :0,
            speed:"0 MB/s",
            eta:"0 sec",
            status:"Waiting",
            result:null,
            error:null

        }));

        setQueue(prev=>[...prev,...list]);

    };

    const uploadSingle=async(item)=>{

        const controller=new AbortController();

        controllers.current[item.id]=controller;

        updateFile(item.id,{

            status:"Uploading",
            progress:0,
            speed:"0 MB/s",
            eta:"0 sec",
            error:null

        });

        try{

            const result=await uploadFile(

                item.file,

                progress=>{

                    updateFile(item.id,{

                        progress:progress.percent,
                        speed:progress.speed,
                        eta:progress.eta

                    });

                },

                controller.signal,
                item.resumeSession

            );

            storageService.addFile(result);

            updateFile(item.id,{

                status:"Completed",
                progress:100,
                result

            });

        }

        catch(error){

            if(

                error.name==="CanceledError" ||

                error.name==="AbortError"

            ){

                updateFile(item.id,{

                    status:"Cancelled",
                    error:null

                });

            }

            else{

                updateFile(item.id,{

                    status:"Failed",
                    error:error.message

                });

            }

        }

        finally{

            delete controllers.current[item.id];

        }

    };

    const startUpload=async()=>{

        for(const item of queue){

            if(

                item.status==="Waiting" ||

                item.status==="Failed" ||

                item.status==="Cancelled"

            ){

                await uploadSingle(item);

            }

        }

    };

    const retryUpload=(id)=>{

        const item=queue.find(x=>x.id===id);

        if(item){

            uploadSingle(item);

        }

    };

    const cancelUpload=(id)=>{

        const controller=controllers.current[id];

        if(controller){

            controller.abort();

        }

    };

    const removeFromQueue=(id)=>{

        setQueue(prev=>

            prev.filter(item=>item.id!==id)

        );

    };

    return{

        queue,
        addToQueue,
        startUpload,
        retryUpload,
        cancelUpload,
        removeFromQueue

    };

}

export default useUploader;