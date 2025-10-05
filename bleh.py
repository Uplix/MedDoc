import pdfplumber

with pdfplumber.open("medical_form.pdf") as pdf:
    page = pdf.pages[0]  # change if needed
    print("\n--- Searching for 'Date medical condition' line ---")
    found_any = False

    for w in page.extract_words():
        text = w["text"].lower().strip()
        if "date medical condition" in text:
            print(w)
            found_any = True

    if not found_any:
        print("No matching text found. Try adjusting the phrase or page number.")
    print("--- End ---\n")
