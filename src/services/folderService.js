import {
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp
} from "firebase/firestore";

import db from "../config/firebase";

const COLLECTION = "folders";

const getFolders = async(parentId = null)=>{

    const q = query(

        collection(db,COLLECTION),

        where("parentId","==",parentId)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc=>({

        id:doc.id,

        ...doc.data()

    }));

};

const getFolder=async(id)=>{

    const snapshot=await getDoc(

        doc(

            db,

            COLLECTION,

            id

        )

    );

    if(!snapshot.exists()){

        return null;

    }

    return{

        id:snapshot.id,

        ...snapshot.data()

    };

};

const createFolder = async(name,parentId=null)=>{

    const ref = await addDoc(

        collection(db,COLLECTION),

        {

            name,

            parentId,

            createdAt:serverTimestamp()

        }

    );

    return ref.id;

};

export default{

    getFolders,
    getFolder,

    createFolder

};