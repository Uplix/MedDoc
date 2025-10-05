import boto3
import json
import os
from dotenv import load_dotenv
from polly import text_to_speech_and_play, record_and_transcribe

load_dotenv()

class SimpleAIAgent:
    def __init__(self):
        self.bedrock = boto3.client(
            'bedrock-runtime',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_DEFAULT_REGION')
        )
        self.conversation_history = []
    
    def speak_response(self, text):
        """Convert text to speech and play it"""
        text_to_speech_and_play(text)
    
    def listen_for_input(self, duration=5):
        """Record audio and convert to text"""
        return record_and_transcribe(duration)
    
    def chat(self, user_input):
        # Add user message to history
        self.conversation_history.append({"role": "user", "content": user_input})
        
        # Build conversation text for Titan
        conversation_text = "You are a helpful AI assistant for FoodHero, a food delivery app.\n\n"
        for msg in self.conversation_history:
            if msg["role"] == "user":
                conversation_text += f"Human: {msg['content']}\n"
            else:
                conversation_text += f"Assistant: {msg['content']}\n"
        conversation_text += "Assistant:"
        
        # Prepare request body for Titan
        body = json.dumps({
            "inputText": conversation_text,
            "textGenerationConfig": {
                "maxTokenCount": 1000,
                "temperature": 0.7,
                "topP": 0.9
            }
        })
        
        # Call Bedrock with Titan model
        response = self.bedrock.invoke_model(
            body=body,
            modelId='amazon.titan-text-express-v1',
            accept='application/json',
            contentType='application/json'
        )
        
        # Parse Titan response
        response_body = json.loads(response.get('body').read())
        assistant_message = response_body['results'][0]['outputText'].strip()
        
        # Add assistant response to history
        self.conversation_history.append({"role": "assistant", "content": assistant_message})
        
        return assistant_message
    
    def voice_chat(self, duration=5):
        """Voice-enabled chat: listen, process, and speak response"""
        print("Listening...")
        user_input = self.listen_for_input(duration)
        print(f"You said: {user_input}")
        
        response = self.chat(user_input)
        print(f"Agent: {response}")
        
        self.speak_response(response)
        return response

if __name__ == "__main__":
    agent = SimpleAIAgent()
    
    agent.speak_response("FoodHero AI Agent ready. Start speaking!")
    
    while True:
        try:
            user_input = agent.listen_for_input()
            
            if "quit" in user_input.lower() or "exit" in user_input.lower():
                agent.speak_response("Goodbye!")
                break
            
            response = agent.chat(user_input)
            agent.speak_response(response)
            
        except KeyboardInterrupt:
            agent.speak_response("Goodbye!")
            break
        except Exception as e:
            agent.speak_response("Sorry, I didn't catch that. Please try again.")