import firebase_admin
from firebase_admin import credentials, firestore
import pdfscraper as pd

# ---------------------------
# 1. Initialize Firebase Admin
# ---------------------------
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()


# ---------------------------
# 2. Helpers
# ---------------------------
def yes_no_to_bool(value):
    """Convert 'Yes'/'No' (case-insensitive) to boolean."""
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() == "yes"
    return False


def fetch_form_data(doc_id):
    """Fetch Firestore document data by ID."""
    doc_ref = db.collection("forms").document(doc_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise ValueError(f"No document found with ID {doc_id}")
    return doc.to_dict()


# ---------------------------
# 3. Firestore → PDF Mapping
# ---------------------------
def fill_pdf_from_firestore(doc_id):
    data = fetch_form_data(doc_id)
    print(f"📥 Retrieved Firestore data for {doc_id}")

    emp = data.get("employeeInformation", {})
    pat = data.get("patientInformation", {})
    med = data.get("medicalCondition", {})
    work = data.get("workCapacity", {})
    care = data.get("careRequirements", {})

    # --- Map fields ---
    name = emp.get("fullName", "")
    is_self = pat.get("isFamilyMember", "No").strip().lower() == "no"
    date_answer = med.get("dateCommenced", "")
    reason = med.get("probableDuration", "")
    serious_condition = yes_no_to_bool(med.get("isSeriousHealthCondition"))
    work_status = yes_no_to_bool(work.get("employeeAbleToWork"))
    activity = work_status  # same as work
    basic_needs = yes_no_to_bool(care.get("patientRequiresAssistance"))
    need_help = yes_no_to_bool(care.get("needsFurtherHelp"))

    # --- File paths ---
    base_pdf = "medical_form.pdf"
    temp_pdf = "filled_form_temp.pdf"
    final_pdf = "filled_form.pdf"

    # --- Fill PDF ---
    pd.fill_pdf1_2(base_pdf, temp_pdf, name, is_adult=is_self)
    pd.fill_pdf3(temp_pdf, final_pdf, date_answer)
    pd.fill_pdf4(final_pdf, final_pdf, reason)
    pd.mark_yes_no(final_pdf, final_pdf, (500.3, 508.9), (554.9, 508.9), serious_condition)
    pd.mark_yes_no(final_pdf, final_pdf, (500.3, 599.9), (554.9, 599.9), work_status, y_offset=15)
    pd.mark_yes_no(final_pdf, final_pdf, (500.3, 579.9), (554.9, 599.9), activity)
    pd.mark_yes_no(final_pdf, final_pdf, (500.3, 667.9), (554.9, 667.9), basic_needs)
    pd.mark_yes_no(final_pdf, final_pdf, (500.3, 698.9), (554.9, 698.9), need_help)

    print(f"✅ PDF generated successfully: {final_pdf}")
    return final_pdf


# ---------------------------
# 4. Example Run
# ---------------------------
if __name__ == "__main__":
    test_doc_id = "example_doc_id"  # Replace with real Firestore document ID
    fill_pdf_from_firestore(test_doc_id)
