import re
import speech_recognition as sr
import os
import pdfscraper as pd

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
        print(f" API Error: {e}")
        return "no"


if __name__ == "__main__":
    input_pdf = "medical_form.pdf"
    output_pdf = "filled_form.pdf"

    # 🧹 Delete old output if it exists
    if os.path.exists(output_pdf):
        try:
            os.remove(output_pdf)
            print(f"Removed existing '{output_pdf}' to create a new one.")
        except Exception as e:
            print(f" Could not delete old file: {e}")

    # Ask for the name by voice
    name_text = record("Please say the full name to fill in:", timeout=6)
    if not name_text:
        exit(" No name detected, exiting.")

    # Ask if adult or not
    status_text = record("Is this form for you or someone else?", timeout=4)
    is_adult = "me" in status_text.lower()

    # Fill the form
    pd.fill_pdf1(input_pdf, output_pdf, name=name_text, is_adult=is_adult)
