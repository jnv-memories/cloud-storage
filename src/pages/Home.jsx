import { useEffect, useState } from "react";

import storageService from "../services/storageService";

import FileCard from "../components/FileCard";

import "../styles/home.css";


function Home() {


    const [files, setFiles] = useState([]);



    useEffect(() => {


    const loadFiles = async()=>{


        const savedFiles =
            await storageService.getFiles();


        setFiles(savedFiles);


    };


    loadFiles();


}, []);



    return (

        <div className="page">


            <h1>
                Files
            </h1>



            {

                files.length === 0 ?

                (

                    <p>
                        No files uploaded yet.
                    </p>

                )

                :

                (

                    <div className="fileGrid">


                        {

                            files.map(file => (

                                <FileCard

                                    key={file.id}

                                    file={file}

                                />

                            ))

                        }


                    </div>

                )

            }


        </div>

    );

}


export default Home;