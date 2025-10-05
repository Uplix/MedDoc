import streamlit as st
import pdfscraper as pd
import base64
import os


# Streamlit UI Setup
st.set_page_config(page_title="PDF Auto-Filler", page_icon="🩺", layout="centered")
st.title("Medical Form Auto-Filler")
st.caption("Fill and preview your form instantly.")


# User Input
name = st.text_input("Full Name")
is_self = st.radio("Is this form for you?", ["Yes", "No"]) == "Yes"
date_answer = st.text_input("Date medical condition or treatment commenced:")
reason = st.text_input("Reasoning")
serious_condition = st.radio("Is it Serious?", ["Yes", "No"]) == "Yes"
work = st.radio("Work?", ["Yes", "No"]) == "Yes"
activity = st.radio("Activity?", ["Yes", "No"]) == "Yes"
basic_needs = st.radio("Basic_Needs?", ["Yes", "No"]) == "Yes"
need_help = st.radio("NeedFurtherHelp?", ["Yes", "No"]) == "Yes"


def preview_pdf(file_path):
    if not os.path.exists(file_path):
        st.error("Something went wrong — no output PDF was generated.")
        return

    with open(file_path, "rb") as f:
        pdf_bytes = f.read()
        b64_pdf = base64.b64encode(pdf_bytes).decode("utf-8")
        pdf_display = f'<iframe src="data:application/pdf;base64,{b64_pdf}" width="700" height="900" type="application/pdf"></iframe>'

    st.markdown("### 📄 Updated PDF Preview")
    st.markdown(pdf_display, unsafe_allow_html=True)
    with open(file_path, "rb") as f:
        st.download_button(label="Download Updated PDF", data=f, file_name="filled_form.pdf", mime="application/pdf")


if st.button("🪄 Fill and Update PDF"):
    if not name.strip():
        st.warning("Please enter a name first.")
    else:
        base_pdf = "medical_form.pdf"
        temp_pdf = "filled_form_temp.pdf"
        final_pdf = "filled_form.pdf"

        # Keep the existing heuristics for finding name & other fields
        pd.fill_pdf1_2(base_pdf, temp_pdf, name, is_adult=is_self)
        pd.fill_pdf3(temp_pdf, final_pdf, date_answer)
        pd.fill_pdf4(final_pdf, final_pdf, reason)

        # Use the generic bubble marker for subsequent Yes/No fields by passing coords
        # Coordinates were gathered previously — reusing same values here.
        pd.mark_yes_no(final_pdf, final_pdf, yes_coord=(500.3, 508.9), no_coord=(554.9, 508.9), value=serious_condition)
        pd.mark_yes_no(final_pdf, final_pdf, yes_coord=(500.3, 599.9), no_coord=(554.9, 599.9), value=work, y_offset=15)
        pd.mark_yes_no(final_pdf, final_pdf, yes_coord=(500.3, 579.9), no_coord=(554.9, 599.9), value=activity)
        pd.mark_yes_no(final_pdf, final_pdf, yes_coord=(500.3, 667.9), no_coord=(554.9, 667.9), value=basic_needs)
        pd.mark_yes_no(final_pdf, final_pdf, yes_coord=(500.3, 698.9), no_coord=(554.9, 698.9), value=need_help)

        st.success("PDF successfully filled and updated!")

        preview_pdf(final_pdf)
