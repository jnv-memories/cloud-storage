import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy,
    setDoc,
    getDoc,
    where
} from "firebase/firestore";

import db from "../config/firebase";

const FILE_COLLECTION="uploadedFiles";
const SESSION_COLLECTION="uploadSessions";

const getFiles=async(folderId)=>{

    const q=query(
        collection(db,FILE_COLLECTION),
        where("folderId","==",folderId),
       // orderBy("createdAt","desc")
    );

    const snapshot=await getDocs(q);

    return snapshot.docs.map(doc=>({
        firestoreId:doc.id,
        ...doc.data()
    }));

};

const addFile=async(file)=>{

    await addDoc(
        collection(db,FILE_COLLECTION),
        file
    );

    return file;

};

const addFiles=async(files)=>{

    for(const file of files){

        await addFile(file);

    }

    return files;

};

const deleteFile=async(id)=>{

    await deleteDoc(
        doc(db,FILE_COLLECTION,id)
    );

};



/* ---------- Upload Sessions ---------- */

const createUploadSession=async(session)=>{

    await setDoc(

        doc(
            db,
            SESSION_COLLECTION,
            session.sessionId
        ),

        session

    );

};

const updateUploadSession=async(sessionId,data)=>{

    const ref=doc(
        db,
        SESSION_COLLECTION,
        sessionId
    );

    const snap=await getDoc(ref);

    if(!snap.exists()) return;

    await setDoc(

        ref,

        {

            ...snap.data(),

            ...data

        }

    );

};

const getUploadSession=async(sessionId)=>{

    const snap=await getDoc(

        doc(
            db,
            SESSION_COLLECTION,
            sessionId
        )

    );

    if(!snap.exists()){

        return null;

    }

    return snap.data();

};

const deleteUploadSession=async(sessionId)=>{

    await deleteDoc(

        doc(
            db,
            SESSION_COLLECTION,
            sessionId
        )

    );

};
const getUploadSessions=async()=>{

    const snapshot=await getDocs(

        collection(

            db,

            SESSION_COLLECTION

        )

    );

    return snapshot.docs.map(doc=>doc.data());

};

const deleteUploadSessions=async(sessionId)=>{

    await deleteDoc(

        doc(

            db,

            SESSION_COLLECTION,

            sessionId

        )

    );

};

export default{

    getFiles,
    addFile,
    addFiles,
    deleteFile,

    createUploadSession,
    updateUploadSession,
    getUploadSession,
    deleteUploadSession,

    getUploadSessions,
    deleteUploadSessions
};