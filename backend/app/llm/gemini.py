import google.generativeai as genai
import os

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

class Gemini:
    def get_embedding(self, text, model="models/embedding-001"):
        result = genai.embed_content(model=model, content=text)
        return result['embedding']

    def get_chat_completion(self, prompt, model="gemini-1.5-flash"):
        model = genai.GenerativeModel(model)
        response = model.generate_content(prompt)
        return response.text

gemini_client = Gemini()