import { doc, getDoc, setDoc } from "firebase/firestore";
import db from "../config/firebase";

// Single document: collection "config", doc id "auth_token"
const TOKEN_REF = doc(db, "config", "auth_token");

/**
 * Read the token document from Firestore.
 * Returns { token, expiresIn } or null if not set.
 */
export async function fetchTokenFromFirestore() {
    const snap = await getDoc(TOKEN_REF);
    if (!snap.exists()) return null;
    return snap.data();
}

/**
 * Write (or overwrite) the token document in Firestore.
 */
export async function saveTokenToFirestore(token, expiresIn) {
    await setDoc(TOKEN_REF, {
        token,
        expiresIn,
        savedAt: new Date().toISOString()
    });
}
