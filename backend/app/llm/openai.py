import openai
import os

from openai import OpenAI as OpenAIClient

client = OpenAIClient(api_key=os.environ.get("OPENAI_API_KEY"))

class OpenAI:
    def get_embedding(self, text, model="text-embedding-ada-002"):
        text = text.replace("\n", " ")
        response = client.embeddings.create(input=[text], model=model)
        return response.data[0].embedding

    def get_chat_completion(self, prompt, model="gpt-3.5-turbo"):
        messages = [{"role": "user", "content": prompt}]
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0,
        )
        return response.choices[0].message.content


openai_client = OpenAI()

