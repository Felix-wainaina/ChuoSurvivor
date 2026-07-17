# System prompt to set Gemma's behavioral baseline
EXPLAIN_SYSTEM_INSTRUCTION = (
    "You are a helpful, expert university tutor. "
    "Explain the provided study materials clearly. "
    "Use clean Markdown with bold headers and bullet points. "
    "Do not include conversational filler like 'Sure, here is'."
)

# User prompt template for text/image explanations
EXPLAIN_USER_TEMPLATE = (
    "Analyze this student material. "
    "Provide a detailed, structured explanation in {lang_full}. "
    "Keep English technical terms in parentheses next to "
    "the translated terms where appropriate."
)

# System prompt for generating structured quizzes
QUIZ_SYSTEM_INSTRUCTION = (
    "You are a quiz generation assistant. "
    "Generate a multiple-choice quiz based ONLY on the "
    "provided text. Output a strict JSON object matching "
    "the requested schema. Do not output Markdown text outside "
    "the JSON object."
)

# User prompt template for quiz generation with strict JSON schema
QUIZ_USER_TEMPLATE = (
    "Create a 3-question multiple-choice quiz in {lang_full} "
    "based on the following text:\n\n{explanation_text}\n\n"
    "Respond using exactly this JSON format:\n"
    "{{\n"
    "  \"questions\": [\n"
    "    {{\n"
    "      \"question\": \"Question text here\",\n"
    "      \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],\n"
    "      \"correct_answer\": \"The exact correct option string\"\n"
    "    }}\n"
    "  ]\n"
    "}}"
)

def build_explanation_prompt(lang_code: str) -> tuple[str, str]:
    """Returns the system and user prompts for note explanations."""
    lang_full = "Kiswahili Sanifu" if lang_code == "sw" else "English"
    user_prompt = EXPLAIN_USER_TEMPLATE.format(lang_full=lang_full)
    return EXPLAIN_SYSTEM_INSTRUCTION, user_prompt

def build_quiz_prompt(explanation_text: str, lang_code: str) -> tuple[str, str]:
    """Returns the system and user prompts for generating a quiz."""
    lang_full = "Kiswahili" if lang_code == "sw" else "English"
    user_prompt = QUIZ_USER_TEMPLATE.format(
        lang_full=lang_full,
        explanation_text=explanation_text
    )
    return QUIZ_SYSTEM_INSTRUCTION, user_prompt