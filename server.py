from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore
from real import fill_pdf_from_firestore  # reuse your function
from firebase_admin import firestore

db = firestore.client()

# --- Flask app ---
app = Flask(__name__)

@app.route("/fill-pdf", methods=["POST"])
def fill_pdf():
    body = request.get_json()
    doc_id = body.get("docId")
    if not doc_id:
        return jsonify({"error": "Missing docId"}), 400

    try:
        pdf_path = fill_pdf_from_firestore(doc_id)
        return jsonify({"message": "PDF generated", "file": pdf_path})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5001, debug=True)
