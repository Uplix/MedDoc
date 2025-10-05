import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "./initialize";

export async function uploadDocument(upload){
    if (!auth.currentUser || !auth.currentUser.email) {
        return {
            type: "error",
            content: "Not signed in"
        }
    }

    try {
        console.log("Upload data:", upload);
        
        // Ensure upload data is a plain object and doesn't contain undefined values
        const sanitizedUpload = JSON.parse(JSON.stringify(upload));
        
        const docRef = collection(db, "Offices", "traneyes", "forms");
        await addDoc(docRef, sanitizedUpload);
        
        return {
            type: "success",
            content: "Document uploaded successfully",
            docRef: docRef
        };
        
    } catch (error) {
        console.error("Error creating document:", error);
        return {
            type: "error",
            content: error.message
        };
    }
}