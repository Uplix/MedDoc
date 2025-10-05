import streamlit as st
import pdfplumber

st.set_page_config(page_title="PDF Word Coordinate Searcher", layout="wide")
st.title("🔍 PDF Word Coordinate Searcher with Context")

PDF_PATH = "medical_form.pdf"

try:
    with pdfplumber.open(PDF_PATH) as pdf:
        all_words = []
        all_text = []

        # extract words from all pages
        for page_num, page in enumerate(pdf.pages):
            words = page.extract_words()
            for w in words:
                w["page_num"] = page_num + 1
                all_words.append(w)

        st.sidebar.header("Search Controls")
        search_term = st.sidebar.text_input("Search term (case-insensitive):", "").strip().lower()

        if search_term:
            results = []
            for i, w in enumerate(all_words):
                if search_term in w["text"].lower():
                    # add 5 words before/after for context
                    start = max(0, i - 5)
                    end = min(len(all_words), i + 6)
                    context = " ".join([all_words[j]["text"] for j in range(start, end)])
                    results.append((i, w, context))

            if results:
                st.write(f"### Found {len(results)} matches for '{search_term}'")
                for idx, (i, w, context) in enumerate(results):
                    st.write(
                        f"[{idx}] **{w['text']}** — Page {w['page_num']} "
                        f"(x0={w['x0']:.1f}, top={w['top']:.1f})"
                    )
                    st.caption(context)

                selection = st.number_input(
                    "Select index to view full coordinates:",
                    min_value=0,
                    max_value=len(results) - 1,
                    step=1,
                )

                if st.button("Show Coordinates"):
                    _, w, context = results[selection]
                    st.write(f"### Selected Index {selection}")
                    st.json(w)
                    st.info(
                        f"Use in code:\n\n"
                        f"x = {w['x1'] + 15:.1f}  # a bit to the right of label\n"
                        f"y = page_height - {w['top'] + 5:.1f}  # aligned with box"
                    )
                    st.caption(f"Context: {context}")
            else:
                st.warning(f"No matches found for '{search_term}'")
        else:
            st.write("### Full Extracted Text (No search term entered)")
            for page_num, page in enumerate(pdf.pages, start=1):
                text = page.extract_text() or ""
                st.write(f"#### Page {page_num}")
                st.code(text if text else "[No text found on this page]")

except FileNotFoundError:
    st.error(f"File '{PDF_PATH}' not found. Make sure it's in the same directory.")
