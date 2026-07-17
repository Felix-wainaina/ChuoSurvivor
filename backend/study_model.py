import base64
from email.mime import image
import httpx
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from io import BytesIO
from PIL import Image
from pypdf import PdfReader
import docx
from pptx import Presentation
import io
from google import genai
from google.genai import types
import os


app = FastAPI(title="Study Model API", description="API for processing images and text data.")


def load_env_file(env_path: str = ".env") -> None:
    """Load key/value pairs from a local .env file into os.environ."""
    if not os.path.exists(env_path):
        return

    with open(env_path, "r", encoding="utf-8") as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue

            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value


load_env_file()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    api_key = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key) if api_key else genai.Client()
except Exception as e:
    # If key isn't set globally, it can be passed explicitly: genai.Client(api_key="...")
    print(f"Warning: Client initialization failed. Ensure GEMINI_API_KEY is set: {e}")
    client = None

MODEL_NAME = "gemma-4-31b-it"


class QuizRequest(BaseModel):
    text: str

class Response(BaseModel):
    text: str

def optimize_image_as_base64(file_bytes: bytes) -> str:
    """
    Optimize the image for better processing.
    This function can include resizing, converting to grayscale, etc.
    """
    try:
        img = Image.open(BytesIO(file_bytes))
        if img.mode != 'RGB':
            img = img.convert('RGB')
        # Resize the image to a maximum of 800x800 pixels while maintaining aspect ratio
        img.thumbnail((800, 800))
        buffered = BytesIO()
        img.save(buffered, format="JPEG", quality=85)  # Save as JPEG
        optimized_bytes = buffered.getvalue()
        return base64.b64encode(optimized_bytes).decode('utf-8')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file format: {str(e)}")
    
def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts raw text from all pages of a PDF."""
    try:
        pdf_file = io.BytesIO(file_bytes)
        reader = PdfReader(pdf_file)
        text_content = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_content.append(page_text)
        return "\n".join(text_content).strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse PDF document: {str(e)}")


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extracts raw text from paragraphs in a .docx file."""
    try:
        docx_file = io.BytesIO(file_bytes)
        doc = docx.Document(docx_file)
        text_content = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n".join(text_content).strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse Word document: {str(e)}")


def extract_text_from_pptx(file_bytes: bytes) -> str:
    """Extracts raw text from text shapes across all PowerPoint slides."""
    try:
        pptx_file = io.BytesIO(file_bytes)
        presentation = Presentation(pptx_file)
        text_content = []
        for slide_num, slide in enumerate(presentation.slides, 1):
            slide_text = []
            for shape in slide.shapes:
                if hasattr(shape, "text") and shape.text.strip():
                    slide_text.append(shape.text.strip())
            if slide_text:
                text_content.append(f"--- Slide {slide_num} ---\n" + "\n".join(slide_text))
        return "\n\n".join(text_content).strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse PowerPoint presentation: {str(e)}")


# --- THE SUPERCHARGED ENDPOINT ---
@app.post("/explain", response_model=Response)
async def explain_content(
    file: UploadFile = File(...),
    user_prompt: str = Form(""),       # Optional custom focus prompt
    lang: str = Form("en")             # 'en' or 'sw'
):
    """
    Online mirror endpoint using the google-genai SDK.
    Parses inputs and routes them to gemini-3.5-flash with strict schema validation.
    """
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    content_type = file.content_type or ""
    filename = (file.filename or "").lower()

    # 1. Map localization prompts
    if lang.lower() == "sw":
        system_instruction = (
            "Wewe ni mwalimu msaidizi anayesaidia kurahisisha dhana, picha, na maandishi. "
            "Eleza kile kilichowasilishwa kwa lugha rahisi sana ya Kiswahili, "
            "ukilenga kumsaidia mtu anayejifunza kuelewa kwa haraka."
        )
        fallback_prompt = "Tafadhali eleza maudhui haya kwa Kiswahili rahisi."
    else:
        system_instruction = (
            "You are an assistant teacher specializing in making complex charts, diagrams, or notes simple. "
            "Break down the provided material in highly simplified, plain English designed for absolute beginners."
        )
        fallback_prompt = "Please explain this content in simple English."

    final_prompt = f"{user_prompt}\n\n{fallback_prompt}".strip()

    # 2. Build the contents list (No Ollama keys allowed here!)
    contents_payload = []

    if content_type.startswith("image/"):
        # Image pathway
        image_part = types.Part.from_bytes(
            data=file_bytes,
            mime_type=content_type,
        )
        contents_payload.extend([image_part, final_prompt])

    elif content_type == "application/pdf" or filename.endswith(".pdf"):
        extracted_text = extract_text_from_pdf(file_bytes)
        contents_payload.append(f"{final_prompt}\n\n=== SOURCE DOCUMENT ===\n{extracted_text}")

    elif filename.endswith(".docx"):
        extracted_text = extract_text_from_docx(file_bytes)
        contents_payload.append(f"{final_prompt}\n\n=== SOURCE DOCUMENT ===\n{extracted_text}")

    elif filename.endswith(".pptx"):
        extracted_text = extract_text_from_pptx(file_bytes)
        contents_payload.append(f"{final_prompt}\n\n=== SOURCE DOCUMENT ===\n{extracted_text}")

    elif content_type.startswith("text/") or filename.endswith((".txt", ".md", ".json")):
        try:
            extracted_text = file_bytes.decode("utf-8")
            contents_payload.append(f"{final_prompt}\n\n=== SOURCE DOCUMENT ===\n{extracted_text}")
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="Unable to decode text file as UTF-8.")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format.")

    # 3. Call Gemini using correct parameter separations
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=contents_payload,  # Only holds the parts/strings
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,  # System instructions go here!
                temperature=0.4
            )
        )
        return {"text": response.text.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API generation error: {str(e)}")

@app.post("/quiz")
async def generate_quiz(payload: QuizRequest):
    """
    Uses Gemini's built-in structured JSON schema enforcement to guarantee 
    a flawless Quiz structure, skipping regex or parsing worries.
    """
    if not client:
        raise HTTPException(status_code=500, detail="Gemini API client is not configured.")

    system_instruction = (
        "You are an educational parser. Based on the provided explanation text, generate a list of "
        "3 to 5 multiple-choice questions (MCQs) to check understanding."
    )

    user_prompt = f"Explanation Text to transform:\n{payload.explanation}"

    # We outline the exact JSON schema we want returned.
    # The API forces the model to match this exact output footprint.
    quiz_schema = {
        "type": "OBJECT",
        "properties": {
            "quiz": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "question": {"type": "STRING"},
                        "options": {
                            "type": "ARRAY",
                            "items": {"type": "STRING"},
                            "minItems": 4,
                            "maxItems": 4
                        },
                        "correct_answer": {"type": "STRING"}
                    },
                    "required": ["question", "options", "correct_answer"]
                }
            }
        },
        "required": ["quiz"]
    }

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=quiz_schema,
                temperature=0.5
            )
        )
        
        # Load string response natively to output clean JSON arrays
        import json
        return json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compile online quiz: {str(e)}")