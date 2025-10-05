import pdfplumber
from PyPDF2 import PdfReader, PdfWriter
from io import BytesIO
import os
from reportlab.pdfgen import canvas


def fill_pdf1(input_path, output_path, name, is_adult=True):
    """Auto-fills the 'Employee' or 'Patient' name field in a medical form PDF.
       Uses hardcoded Yes/No bubble coordinates."""

    target_context = "employee" if is_adult else "patient"
    found = False
    coords = None
    page_index = 0

    with pdfplumber.open(input_path) as pdf:
        best_line = None
        best_score = -999
        best_page = 0
git 
        # Step 1: Find the most relevant line for the name field
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
            print(f"Detected best match: '{best_line.strip()}' on page {page_index + 1}")

            # Step 2: Find coordinates near the correct label
            page = pdf.pages[page_index]
            words = page.extract_words()

            # Find y-position of the target context word ("patient" or "employee")
            target_y = None
            for w in words:
                if target_context in w["text"].lower():
                    target_y = w["top"]
                    break

            # Find the 'Name' word closest vertically to that
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

                # Find words on the same line after "Name"
                right_side = [
                    word for word in words
                    if abs(word["top"] - name_y) < 5 and word["x0"] > closest["x1"]
                ]
                if right_side:
                    farthest_right = max(right_side, key=lambda w: w["x1"])
                    name_x = farthest_right["x1"] + 10  # small gap

                coords = (name_x, name_y)

    # Step 3: Write the name and fill Yes/No bubbles
    if found and coords:
        x, y = coords
        label = "Employee Name" if is_adult else "Patient’s Name"
        print(f"Found '{label}' field at ({x:.0f}, {y:.0f})")

        # Get page dimensions
        with pdfplumber.open(input_path) as pdf_temp:
            page_height = pdf_temp.pages[page_index].height
            page_width = pdf_temp.pages[page_index].width

        # Draw overlay
        packet = BytesIO()
        can = canvas.Canvas(packet, pagesize=(page_width, page_height))
        can.setFont("Helvetica", 12)
        can.drawString(x, page_height - y - 10, name)

        # Hardcoded "Yes" and "No" bubble positions (from coordinate finder)
        yes_x, yes_top = 500.0, 401.4
        no_x, no_top = 554.8, 401.4
        yes_y = page_height - yes_top
        no_y = page_height - no_top

        if is_adult:
            can.setFillColorRGB(0, 0, 0)
            can.circle(yes_x - 13, yes_y - 5, 4, stroke=0, fill=1)
            print(f"Marked 'Yes' bubble at ({yes_x - 10}, {yes_y})")
        else:
            can.setFillColorRGB(0, 0, 0)
            can.circle(no_x - 13, no_y - 5, 4, stroke=0, fill=1)
            print(f"Marked 'No' bubble at ({no_x - 10}, {no_y})")

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

        print(f"Name '{name}' inserted in '{label}' field on page {page_index + 1}")
        print(f"Saved to: {output_path}")

    else:
        print("Could not find a suitable 'name' field in this document.")
def fill_pdf2(input_path, output_path, date_answer):
    """Adds the 'Date medical condition...' field on page 2, 20px below label coordinate."""

    if not date_answer:
        print("No date provided — skipping date fill.")
        return

    # Coordinates for the 'Date medical condition...' label
    label_x = 488.2
    label_top = 680.1
    page_index = 1  # page 2 (0-indexed)
    offset_y = 20   # move text down 20 pixels

    # Open PDF to get page dimensions
    with pdfplumber.open(input_path) as pdf:
        page_height = pdf.pages[page_index].height
        page_width = pdf.pages[page_index].width

    # Draw the date answer overlay
    packet = BytesIO()
    can = canvas.Canvas(packet, pagesize=(page_width, page_height))
    can.setFont("Helvetica", 11)
    can.setFillColorRGB(0, 0, 0)

    # Convert coordinate from pdfplumber (top-left) → reportlab (bottom-left)
    date_x = label_x
    date_y = page_height - (label_top + offset_y)

    can.drawString(date_x, date_y, date_answer)
    can.save()
    packet.seek(0)

    # Merge overlay into original PDF
    new_pdf = PdfReader(packet)
    existing_pdf = PdfReader(input_path)
    output = PdfWriter()

    for i, page in enumerate(existing_pdf.pages):
        if i == page_index:
            page.merge_page(new_pdf.pages[0])
        output.add_page(page)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "wb") as f:
        output.write(f)

    print(f"✅ Date '{date_answer}' inserted at ({date_x}, {date_y}) on page {page_index+1}")