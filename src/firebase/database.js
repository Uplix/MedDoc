import { doc, getDoc, setDoc, serverTimestamp, addDoc, collection } from "firebase/firestore";
import { auth } from "./initialize";

export async function uploadDocument(upload){
    if (!auth.currentUser.email) {
        return {
            type: "error",
            content: "Not signed in"
        }
    }

    try {
        const docRef = await addDoc(collection(db, "Offices", "traneyes", "forms"), upload);
        
    } catch (error) {
        console.error("Error creating user document", error);
        throw error;
    }
    }
    return userRef;
    }