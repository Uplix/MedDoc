import streamlit as st
import pdfscraper as pd
import base64
import os

# -------------------------------
# Streamlit UI Setup
# -------------------------------
st.set_page_config(page_title="PDF Auto-Filler", page_icon="🩺", layout="centered")
st.title(" Medical Form Auto-Filler")
st.caption("Fill and preview your form instantly.")

# -------------------------------
# User Input
# -------------------------------
name = st.text_input("Full Name")
is_self = st.radio("Is this form for you?", ["Yes", "No"])
date_answer = st.text_input("Date medical condition or treatment commenced:")

# -------------------------------
# Fill PDF Button
# -------------------------------
if st.button("🪄 Fill and Update PDF"):
    if not name.strip():
        st.warning("Please enter a name first.")
    else:
        # Input & Output PDF Paths
        base_pdf = "medical_form.pdf"
        temp_pdf = "filled_form_temp.pdf"
        final_pdf = "filled_form.pdf"

        # Step 1 — Fill name and Yes/No bubble
        pd.fill_pdf1(base_pdf, temp_pdf, name, is_adult=(is_self == "Yes"))

        # Step 2 — Fill date field
        pd.fill_pdf2(temp_pdf, final_pdf, date_answer)

        # Success message
        st.success(" PDF successfully filled and updated!")

        # -------------------------------
        # Inline PDF Viewer
        # -------------------------------
        if os.path.exists(final_pdf):
            with open(final_pdf, "rb") as f:
                pdf_bytes = f.read()
                b64_pdf = base64.b64encode(pdf_bytes).decode("utf-8")
                pdf_display = f"""
                <iframe 
                    src="data:application/pdf;base64,{b64_pdf}" 
                    width="700" height="900" type="application/pdf">
                </iframe>
                """

            st.markdown("### 📄 Updated PDF Preview")
            st.markdown(pdf_display, unsafe_allow_html=True)

            # -------------------------------
            # Download Button
            # -------------------------------
            with open(final_pdf, "rb") as f:
                st.download_button(
                    label=" Download Updated PDF",
                    data=f,
                    file_name="filled_form.pdf",
                    mime="application/pdf",
                )
        else:
            st.error(" Something went wrong — no output PDF was generated.")
