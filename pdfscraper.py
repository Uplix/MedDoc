import pdfplumber
from PyPDF2 import PdfReader, PdfWriter
from io import BytesIO
import os
from reportlab.pdfgen import canvas


def fill_pdf1_2(input_path, output_path, name, is_adult=True):
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
def fill_pdf3(input_path, output_path, date_answer):
    """Adds the 'Date medical condition...' field on the correct page, visibly placed."""
    if not date_answer:
        print("No date provided — skipping date fill.")
        return

    # Try to locate the "Date medical condition" label dynamically
    found_page = 1
    label_x, label_top = None, None

    with pdfplumber.open(input_path) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            if "date medical condition" in text.lower():
                found_page = i
                print(f"Found target phrase on page {i + 1}")
                for w in page.extract_words():
                    if "date" in w["text"].lower():
                        label_x = w["x0"]
                        label_top = w["top"]
                        break
                break

        if label_x is None:
            # fallback coordinates if text not found
            label_x, label_top = 488.2, 680.1
            print("⚠️ Default coordinates used (couldn't find text layer).")

        page_height = pdf.pages[found_page].height
        page_width = pdf.pages[found_page].width

    # Adjust coordinates
    offset_y = 30  # Move text 20 pixels lower
    date_x = label_x
    date_y = page_height - (label_top + offset_y)

    print(f"🖊 Writing '{date_answer}' at ({date_x:.1f}, {date_y:.1f}) on page {found_page + 1}")

    # Draw overlay
    packet = BytesIO()
    can = canvas.Canvas(packet, pagesize=(page_width, page_height))
    can.setFont("Helvetica", 11)
    can.setFillColorRGB(0, 0, 0)
    can.drawString(date_x, date_y, date_answer)
    can.save()
    packet.seek(0)

    # Merge overlay
    new_pdf = PdfReader(packet)
    existing_pdf = PdfReader(input_path)
    output = PdfWriter()

    for i, page in enumerate(existing_pdf.pages):
        if i == found_page:
            page.merge_page(new_pdf.pages[0])
        output.add_page(page)

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "wb") as f:
        output.write(f)

    print(f"✅ Date '{date_answer}' inserted at ({date_x}, {date_y}) on page {found_page + 1}")

from PyPDF2 import PdfReader, PdfWriter
from io import BytesIO
from reportlab.pdfgen import canvas
import pdfplumber
import os

def fill_pdf4(input_path, output_path, treatment_answer):
    """
    Writes the 'treatment' field answer next to 'treatment:' on page 1.
    Label coordinates: (x0=278.4, top=486.9)
    """
    if not treatment_answer:
        print("⚠️ No treatment answer provided — skipping.")
        return

    # Coordinates for the label
    label_x = 278.4
    label_top = 486.9
    page_index = 0  # Page 1
    offset_x = 70   # Move text 20px to the right
    offset_y = -12

    # Open the PDF to get its dimensions
    with pdfplumber.open(input_path) as pdf:
        page_height = pdf.pages[page_index].height
        page_width = pdf.pages[page_index].width

    # Convert pdfplumber coords (top-left origin) → ReportLab (bottom-left)
    treatment_x = label_x + offset_x
    treatment_y = page_height - label_top + offset_y

    # Create the overlay
    packet = BytesIO()
    can = canvas.Canvas(packet, pagesize=(page_width, page_height))
    can.setFont("Helvetica", 11)
    can.setFillColorRGB(0, 0, 0)

    can.drawString(treatment_x, treatment_y, treatment_answer)
    print(f"✅ Wrote treatment '{treatment_answer}' at ({treatment_x}, {treatment_y}) on page {page_index + 1}")

    can.save()
    packet.seek(0)

    # Merge overlay
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

    print(f"✅ Treatment answer saved to: {output_path}")


def mark_yes_no(input_path, output_path, yes_coord, no_coord, value, page_index=0, x_offset=-13, y_offset=-5):
    """
    Generic helper to mark a Yes/No bubble.

    yes_coord / no_coord: tuples (x0, top) using pdfplumber coordinates (top origin)
    value: True => mark Yes, False => mark No
    page_index: zero-based page index to apply to
    x_offset/y_offset: adjustments applied before drawing the filled circle
    """
    yes_x, yes_top = yes_coord
    no_x, no_top = no_coord

    with pdfplumber.open(input_path) as pdf:
        page_height = pdf.pages[page_index].height
        page_width = pdf.pages[page_index].width

    yes_y = page_height - yes_top
    no_y = page_height - no_top

    packet = BytesIO()
    can = canvas.Canvas(packet, pagesize=(page_width, page_height))
    can.setFillColorRGB(0, 0, 0)

    if value:
        can.circle(yes_x + x_offset, yes_y + y_offset, 4, stroke=0, fill=1)
        print(f"✅ Marked 'Yes' bubble at ({yes_x + x_offset}, {yes_y + y_offset}) on page {page_index + 1}")
    else:
        can.circle(no_x + x_offset, no_y + y_offset, 4, stroke=0, fill=1)
        print(f"✅ Marked 'No' bubble at ({no_x + x_offset}, {no_y + y_offset}) on page {page_index + 1}")

    can.save()
    packet.seek(0)

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

    print(f"✅ Bubble update saved to: {output_path}")

def fill_pdf5(input_path, output_path, serious):
    """
    Marks the Yes/No bubble on page 1 at coordinates:
    Yes — (x0=500.3, top=508.9)
    No  — (x0=554.9, top=508.9)
    """
    # Coordinates from your extraction
    yes_x, yes_top = 500.3, 508.9
    no_x, no_top = 554.9, 508.9
    page_index = 0  # Page 1

    with pdfplumber.open(input_path) as pdf:
        page_height = pdf.pages[page_index].height
        page_width = pdf.pages[page_index].width

    # Convert coordinates to reportlab space (bottom-left origin)
    yes_y = page_height - yes_top
    no_y = page_height - no_top

    # Delegate to generic marker
    yes_coord = (yes_x, yes_top)
    no_coord = (no_x, no_top)
    mark_yes_no(input_path, output_path, yes_coord, no_coord, serious, page_index=page_index)
def fill_pdf6b(input_path, output_path, canactivity):
    """
    Marks the Yes/No bubble for the second question:
    Yes — Page 1 (x0=500.3, top=599.9)
    No  — Page 1 (x0=290.4, top=578.9)
    """
    # Coordinates from pdfplumber
    yes_x, yes_top = 500.3, 599.9
    no_x, no_top = 554.9, 599.9
    page_index = 0  # Page 1 (0-indexed)

    with pdfplumber.open(input_path) as pdf:
        page_height = pdf.pages[page_index].height
        page_width = pdf.pages[page_index].width

    # Convert Y (top → bottom coordinate system)
    yes_y = page_height - yes_top
    no_y = page_height - no_top

    yes_coord = (yes_x, yes_top)
    no_coord = (no_x, no_top)
    mark_yes_no(input_path, output_path, yes_coord, no_coord, canactivity, page_index=page_index)

def fill_pdf6a(input_path, output_path, work):
    """
    Marks the Yes/No bubble for the second question:
    Yes — Page 1 (x0=500.3, top=599.9)
    No  — Page 1 (x0=290.4, top=578.9)
    """
    # Coordinates from pdfplumber
    yes_x, yes_top = 500.3, 599.9
    no_x, no_top = 554.9, 599.9
    page_index = 0  # Page 1 (0-indexed)

    with pdfplumber.open(input_path) as pdf:
        page_height = pdf.pages[page_index].height
        page_width = pdf.pages[page_index].width

    # Convert Y (top → bottom coordinate system)
    yes_y = page_height - yes_top
    no_y = page_height - no_top

    yes_coord = (yes_x, yes_top)
    no_coord = (no_x, no_top)
    # This specific function had a y-offset tweak; pass y_offset=15 to roughly emulate previous behaviour
    mark_yes_no(input_path, output_path, yes_coord, no_coord, work, page_index=page_index, x_offset=-13, y_offset=15)

def fill_pdf7a(input_path, output_path, basic_needs):
    """
    Marks the Yes/No bubble for the third question:
    Yes — Page 1 (x0=500.3, top=667.9)
    No  — Page 1 (x0=554.9, top=667.9)
    """
    yes_x, yes_top = 500.3, 667.9
    no_x, no_top = 554.9, 667.9
    page_index = 0  # Page 1 (0-indexed)

    with pdfplumber.open(input_path) as pdf:
        page_height = pdf.pages[page_index].height
        page_width = pdf.pages[page_index].width

    # Convert Y coordinate (top-left → bottom-left)
    yes_y = page_height - yes_top
    no_y = page_height - no_top

    # Draw overlay
    packet = BytesIO()
    can = canvas.Canvas(packet, pagesize=(page_width, page_height))
    can.setFillColorRGB(0, 0, 0)

    if basic_needs:
        can.circle(yes_x - 13, yes_y - 5, 4, stroke=0, fill=1)
        print(f"✅ Marked 'Yes' bubble at ({yes_x - 13}, {yes_y - 5}) on page {page_index + 1}")
    else:
        can.circle(no_x - 13, no_y - 5, 4, stroke=0, fill=1)
        print(f"✅ Marked 'No' bubble at ({no_x - 13}, {no_y - 5}) on page {page_index + 1}")

    can.save()
    packet.seek(0)

    # Merge overlay into the PDF
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

    print(f"✅ Bubble update (Yes/No #3) saved to: {output_path}")


def fill_pdf7b(input_path, output_path, help):
    """
    Marks the Yes/No bubble for the fourth question:
    Yes — Page 1 (x0=500.3, top=698.9)
    No  — Page 1 (x0=554.9, top=698.9)
    """
    yes_x, yes_top = 500.3, 698.9
    no_x, no_top = 554.9, 698.9
    page_index = 0  # Page 1 (0-indexed)

    with pdfplumber.open(input_path) as pdf:
        page_height = pdf.pages[page_index].height
        page_width = pdf.pages[page_index].width

    # Convert Y (top-left to bottom-left)
    yes_y = page_height - yes_top
    no_y = page_height - no_top

    # Overlay
    packet = BytesIO()
    can = canvas.Canvas(packet, pagesize=(page_width, page_height))
    can.setFillColorRGB(0, 0, 0)

    if help:
        can.circle(yes_x - 13, yes_y - 5, 4, stroke=0, fill=1)
        print(f"✅ Marked 'Yes' bubble at ({yes_x - 13}, {yes_y - 5}) on page {page_index + 1}")
    else:
        can.circle(no_x - 13, no_y - 5, 4, stroke=0, fill=1)
        print(f"✅ Marked 'No' bubble at ({no_x - 13}, {no_y - 5}) on page {page_index + 1}")

    can.save()
    packet.seek(0)

    # Merge with existing PDF
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

    print(f"✅ Bubble update (Yes/No #4) saved to: {output_path}")