import base64
from email.mime import image
import httpx
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from io import BytesIO
from PIL import Image
from langdetect import detect, LangDetectException


app = FastAPI(title="Study Model API", description="API for processing images and text data.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "gemma4:e4b"  

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
    
@app.post("/explain_content", response_model=Response)
async def explain_image(
    file: UploadFile = File(...),
    user_prompt: str = Form(""),       # Optional custom focus prompt (e.g., "Focus on the graph")
    lang: str = Form("en")):
    """
    This endpoint accepts an image file and a text string, processes the image, and sends both to the OLLAMA model for explanation. The response from the model is returned as JSON.
    This function is everything. That's why it's the GOAT!!! THE GOAT!!!!
    """

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="No file uploaded.")
    content_type = file.content_type
    payload_data = {
        "model": MODEL_NAME,
        "stream": False
    }

    # Setup the localized system context
    if lang.lower() == "sw":
        system_prompt = (
            "Wewe ni mwalimu msaidizi anayesaidia kurahisisha dhana, picha, na maandishi. "
            "Eleza kile kilichowasilishwa kwa lugha rahisi sana ya Kiswahili, "
            "ukilenga kumsaidia mtu anayejifunza kuelewa kwa haraka."
        )
        fallback_prompt = "Tafadhali eleza maudhui haya kwa Kiswahili rahisi."
    else:
        system_prompt = (
            "You are an assistant teacher specializing in making complex charts, diagrams, or notes simple. "
            "Break down the provided material in highly simplified, plain English designed for absolute beginners."
        )
        fallback_prompt = "Please explain this content in simple English."

    # Assemble the prompts
    instructions = f"{user_prompt}\n\n{fallback_prompt}".strip()
    payload_data["system"] = system_prompt

    # CASE A: Processing an Image
    if content_type.startswith("image/"):
        base64_image = optimize_image_and_base64(file_bytes)
        payload_data["prompt"] = instructions
        payload_data["images"] = [base64_image]  # Gemma 3 vision-mode trigger

    # CASE B: Processing a Text File (like .txt notes, source files, or logs)
    elif content_type.startswith("text/") or file.filename.endswith((".txt", ".md", ".json")):
        try:
            raw_text = file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="Unable to decode file content as UTF-8 text.")
            
        # We append the document context straight to the model's text prompt window
        payload_data["prompt"] = f"{instructions}\n\n=== SOURCE DOCUMENT ===\n{raw_text}"
    
    # CASE C: Catch-all fallback or block unsupported formats
    else:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file format: {content_type}. Please upload an image or a text file."
        )

    # Call Ollama
    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            response = await client.post(OLLAMA_API_URL, json=payload_data)
            response.raise_for_status()
            result = response.json()
            return {"explanation": result.get("response", "").strip()}
            
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"Local Ollama generation error: {str(e)}")

@app.post("/quiz")
async def generate_quiz(payload: QuizRequest):
    """
    Ingests text explanation payloads and returns a structured list of 3 to 5 questions.
    Uses JSON output structuring constraints inside Ollama's generate payload.
    """
    # System prompt enforcing strict structured JSON outputs
    system_prompt = (
        "You are an educational parser. Based on the provided explanation text, generate a list of "
        "3 to 5 multiple-choice questions (MCQs) to check understanding. "
        "You must return ONLY a raw JSON array matching this exact schema layout, with absolutely no markdown wrapping, "
        "no conversational text, and no backticks: "
        '[{"question": "String containing the question", "options": ["Option A", "Option B", "Option C", "Option D"], "correct_answer": "The exact matching correct string option"}]'
    )

    user_prompt = f"Explanation Text to transform: {payload.explanation}"

    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            response = await client.post(
                OLLAMA_API_URL,
                json={
                    "model": MODEL_NAME,
                    "prompt": user_prompt,
                    "system": system_prompt,
                    "stream": False,
                    "format": "json"  # Instructs Ollama to force structural JSON parsing format
                }
            )
            response.raise_for_status()
            raw_response = response.json().get("response", "").strip()
            
            # Return raw string to let Python process it as native JSON
            import json
            parsed_quiz = json.loads(raw_response)
            return {"quiz": parsed_quiz}
            
        except json.JSONDecodeError:
            return {"quiz": [], "raw_output": raw_response, "error": "Model failed to return valid JSON format."}
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"Local Ollama generation error: {str(e)}")
    