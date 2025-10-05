import streamlit as st
import speech_recognition as sr
import tempfile
import os

st.title("🎤 Speech to Text (Google)")

if 'transcript' not in st.session_state:
    st.session_state['transcript'] = ""

def record_and_transcribe(duration=5):
    r = sr.Recognizer()
    m = sr.Microphone()
    
    with m as source:
        r.adjust_for_ambient_noise(source)
    
    st.info(f"Recording for {duration} seconds... Speak now!")
    
    with m as source:
        audio = r.listen(source, timeout=duration, phrase_time_limit=duration)
    
    try:
        text = r.recognize_google(audio)
        return text
    except sr.UnknownValueError:
        return "Could not understand audio"
    except sr.RequestError as e:
        return f"Error: {e}"

duration = st.slider("Recording duration (seconds)", 1, 10, 5)

if st.button("🎤 Record & Transcribe"):
    with st.spinner("Listening..."):
        text = record_and_transcribe(duration)
    
    st.session_state['transcript'] += text + " "
    st.success("Done!")

if st.button("🗑️ Clear"):
    st.session_state['transcript'] = ""
    st.rerun()

st.write("**Transcript:**")
st.write(st.session_state['transcript'] or "*Nothing yet...*")

if st.session_state['transcript']:
    st.download_button("Download", st.session_state['transcript'], "transcript.txt")