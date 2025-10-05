import re
import pdfplumber
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from io import BytesIO
import speech_recognition as sr
import os

# ------------------------
# 🎤 SPEECH CAPTURE
# ------------------------
def record(prompt, timeout=5):
    """Capture one short phrase from mic."""
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print(f"\n {prompt}")
        r.adjust_for_ambient_noise(source, duration=0.5)
        print("Listening...")
        audio = r.listen(source, timeout=timeout, phrase_time_limit=timeout)
    try:
        text = r.recognize_google(audio)
        print(f" You said: {text}\n")
        return text
    except sr.UnknownValueError:
        print(" Didn't catch that.")
        return ""
    except sr.RequestError as e:
        print(f"⚠️ API Error: {e}")
        return ""

# ------------------------
# ✏️ PDF FILLING LOGIC
# ------------------------
def fill_pdf(input_path, output_path, name, is_adult=True):
    """Auto-fills the 'Employee' or 'Patient' name field in a medical form PDF."""

    target_context = "employee" if is_adult else "patient"
    found = False
    coords = None
    page_index = 0

    with pdfplumber.open(input_path) as pdf:
        best_line = None
        best_score = -999
        best_page = 0

        # STEP 1: Find the most relevant line of text
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if not text:
                continue

            for line in text.split("\n"):
                score = 0
                lline = line.lower()

                if "name" not in lline:
                    continue

                # Positive weights
                if target_context in lline:
                    score += 3
                if "name" in lline:
                    score += 1

                # Negative weights
                if target_context == "employee" and "patient" in lline:
                    score -= 2
                if target_context == "patient" and "employee" in lline:
                    score -= 2

                if any(x in lline for x in ["provider", "doctor", "health", "care"]):
                    score -= 3

                if score > best_score:
                    best_score = score
                    best_line = line
                    best_page = i

        if best_line:
            found = True
            page_index = best_page
            print(f" Detected best match: '{best_line.strip()}' on page {page_index+1}")

            # STEP 2: Find coordinates near the correct label
            page = pdf.pages[page_index]
            words = page.extract_words()

            # find y-position of the target context word ("patient" or "employee")
            target_y = None
            for w in words:
                if target_context in w["text"].lower():
                    target_y = w["top"]
                    break

            # find the 'Name' word closest vertically to that
            closest = None
            min_diff = 9999
            for w in words:
                if "name" in w["text"].lower() and target_y:
                    diff = abs(w["top"] - target_y)
                    if diff < min_diff:
                        min_diff = diff
                        closest = w

            if closest:
                name_x = closest["x1"]
                name_y = closest["top"]

                # find words on same line after "Name"
                right_side = [
                    word for word in words
                    if abs(word["top"] - name_y) < 5 and word["x0"] > closest["x1"]
                ]
                if right_side:
                    farthest_right = max(right_side, key=lambda w: w["x1"])
                    name_x = farthest_right["x1"] + 10  # small gap

                coords = (name_x, name_y)

    # STEP 3: Place name at detected coordinates
    if found and coords:
        x, y = coords
        label = "Employee Name" if is_adult else "Patient’s Name"
        print(f" Found '{label}' field at ({x:.0f}, {y:.0f})")

        with pdfplumber.open(input_path) as pdf_temp:
            page_height = pdf_temp.pages[page_index].height
            page_width = pdf_temp.pages[page_index].width

        # Draw overlay
        packet = BytesIO()
        can = canvas.Canvas(packet, pagesize=(page_width, page_height))
        can.setFont("Helvetica", 12)
        can.drawString(x, page_height - y - 10, name)
        can.save()
        packet.seek(0)

        # Merge overlay
        new_pdf = PdfReader(packet)
        existing_pdf = PdfReader(input_path)
        output = PdfWriter()

        for i in range(len(existing_pdf.pages)):
            page = existing_pdf.pages[i]
            if i == page_index:
                page.merge_page(new_pdf.pages[0])
            output.add_page(page)

        os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
        with open(output_path, "wb") as f:
            output.write(f)

        print(f" Name '{name}' inserted in '{label}' field on page {page_index+1}")
        print(f" Saved to: {output_path}")

    else:
        print("⚠️ Could not find a suitable 'name' field in this document.")


# ------------------------
# 🚀 MAIN
# ------------------------
if __name__ == "__main__":
    input_pdf = "medical_form.pdf"
    output_pdf = "filled_form.pdf"

    # Ask for the name by voice
    name_text = record("Please say the full name to fill in:", timeout=6)
    if not name_text:
        exit(" No name detected, exiting.")

    # Ask if adult or not
    status_text = record("Is this for an adult? Say yes or no:", timeout=4)
    is_adult = "yes" in status_text.lower()

    # Fill the form
    fill_pdf(input_pdf, output_pdf, name=name_text, is_adult=is_adult)
