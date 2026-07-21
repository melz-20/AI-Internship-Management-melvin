import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file.")

genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-3.5-flash")


def ask_gemini(prompt: str):

    try:

        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.4,
                "top_p": 0.9,
                "top_k": 40,
                "max_output_tokens": 2048,
            },
        )

        return response.text

    except Exception as e:

        print("Gemini Error:", e)

        return (
            "❌ Sorry, I couldn't generate a response right now. "
            "Please try again."
        )