import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import folderService from "../services/folderService";

import "../styles/home.css";

function Home() {

    const navigate = useNavigate();

    const [folders, setFolders] = useState([]);

    useEffect(() => {

        loadFolders();

    }, []);

    async function loadFolders() {

        const data = await folderService.getFolders(null);

        setFolders(data);

    }

    return (

        <div className="page">

            <h1>

                Storage

            </h1>

            <div className="topBar">

                <button

                    onClick={async () => {

                        const name = prompt(

                            "Folder name"

                        );

                        if (!name) return;

                        await folderService.createFolder(

                            name,

                            null

                        );

                        loadFolders();

                    }}

                >

                    New Folder

                </button>

            </div>

            <div className="fileGrid">

                {

                    folders.map(folder => (

                        <div

                            key={folder.id}

                            className="folderCard"

                            onClick={() => {

                                navigate(

                                    `/folder/${folder.id}`

                                );

                            }}

                        >

                            <div className="folderIcon">

                                📁

                            </div>

                            <h3>

                                {folder.name}

                            </h3>

                        </div>

                    ))

                }

            </div>

        </div>

    );

}

export default Home;