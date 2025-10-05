import boto3
import os
from dotenv import load_dotenv
import pygame
import tempfile
import subprocess
import speech_recognition as sr

load_dotenv()
pygame.mixer.init()

def record_and_transcribe(duration=5):
    # Record audio using system command
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
        print(f"Recording for {duration} seconds...")
        subprocess.run([
            'sox', '-d', '-r', '16000', '-c', '1', tmp_file.name, 
            'trim', '0', str(duration)
        ], check=True)
        
        # Use local speech recognition
        r = sr.Recognizer()
        with sr.AudioFile(tmp_file.name) as source:
            audio = r.record(source)
        
        try:
            transcript = r.recognize_google(audio)
            return transcript
        except sr.UnknownValueError:
            return "Could not understand audio"
        except sr.RequestError as e:
            return f"Error with speech recognition: {e}"

def text_to_speech_and_play(text, voice_id='Joanna'):
    polly = boto3.client(
        'polly',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        region_name=os.getenv('AWS_DEFAULT_REGION')
    )
    
    response = polly.synthesize_speech(
        Text=text,
        OutputFormat='mp3',
        VoiceId=voice_id
    )
    
    audio_data = response['AudioStream'].read()
    
    with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as tmp_file:
        tmp_file.write(audio_data)
        tmp_file.flush()
        
        pygame.mixer.music.load(tmp_file.name)
        pygame.mixer.music.play()
        
        while pygame.mixer.music.get_busy():
            pygame.time.wait(100)

if __name__ == "__main__":
    choice = input("Choose: (1) Text to Speech (2) Speech to Text: ")
    
    if choice == '1':
        text = input("Enter text to convert to speech: ")
        text_to_speech_and_play(text)
        print("Audio playback complete!")
    elif choice == '2':
        duration = int(input("Recording duration in seconds (default 5): ") or 5)
        transcript = record_and_transcribe(duration)
        print(f"Transcribed text: {transcript}")
    else:
        print("Invalid choice")
