import streamlit as st
import speech_recognition as sr
import threading
import time

st.title("🎤 Speech to Text")

if 'listening' not in st.session_state:
    st.session_state.listening = False
if 'transcript' not in st.session_state:
    st.session_state.transcript = ""

def listen():
    r = sr.Recognizer()
    m = sr.Microphone()
    
    with m as source:
        r.adjust_for_ambient_noise(source)
    
    while st.session_state.listening:
        try:
            with m as source:
                audio = r.listen(source, timeout=1, phrase_time_limit=5)
            text = r.recognize_google(audio)
            st.session_state.transcript += text + " "
        except:
            pass

col1, col2 = st.columns(2)

with col1:
    if st.button("🎤 Start", disabled=st.session_state.listening):
        st.session_state.listening = True
        st.session_state.transcript = ""
        threading.Thread(target=listen, daemon=True).start()
        st.rerun()

with col2:
    if st.button("⏹️ Stop", disabled=not st.session_state.listening):
        st.session_state.listening = False
        st.rerun()

if st.session_state.listening:
    st.success("🔴 Listening...")
    
st.write("**What you said:**")
st.write(st.session_state.transcript or "*Nothing yet...*")

if st.session_state.listening:
    time.sleep(0.5)
    st.rerun()