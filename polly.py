import boto3
import os
from dotenv import load_dotenv
import pygame
import tempfile

load_dotenv()
pygame.mixer.init()

def text_to_speech_and_play(text, voice_id='Joanna'):
    polly = boto3.client(
        'polly',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        region_name=os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
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
    text = input("Enter text to convert to speech: ")
    text_to_speech_and_play(text)
    print("Audio playback complete!")
