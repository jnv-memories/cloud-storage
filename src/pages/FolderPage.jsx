import { useEffect,useState } from "react";
import { useNavigate,useParams } from "react-router-dom";
import storageService from "../services/storageService";
import folderService from "../services/folderService";
import FileCard from "../components/FileCard";
import "../styles/home.css";
function FolderPage(){
    const {folderId}=useParams();
    const navigate=useNavigate();
    const [folders,setFolders]=useState([]);
    const [files,setFiles]=useState([]);
    useEffect(()=>{
        load();
    },[folderId]);
    async function load(){
        const childFolders=
            await folderService.getFolders(
                folderId
            );
        const folderFiles=
            await storageService.getFiles(
                folderId
            );
        setFolders(childFolders);
        setFiles(folderFiles);
    }
    return(
        <div className="page">
            <div className="topBar">
                <button
                    onClick={()=>{
                        navigate(
                            `/upload?folder=${folderId}`
                        );
                    }}
                >
                    Upload
                </button>
                <button
                    onClick={()=>{
                        const name=
                            prompt(
                                "Folder name"
                            );
                        if(!name)return;
                        folderService
                        .createFolder(
                            name,
                            folderId
                        )
                        .then(load);
                    }}
                >
                    Create Folder
                </button>
            </div>
            {
            folders.length>0&&
            <>
            <h2>Folders</h2>
            <div className="fileGrid">
                {
                folders.map(folder=>(
                    <div
                        key={folder.id}
                        className="folderCard"
                        onClick={()=>{
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
            </>
            }
            <h2>Files</h2>
            {
            (files.length===0) ? <p>No files.</p> :
            <div className="fileGrid">
                {
                files.map(file=>(
                    <FileCard
                        key={file.id}
                        file={file}
                    />
                ))
                }
            </div>
            }
        </div>
    );
}
export default FolderPage;