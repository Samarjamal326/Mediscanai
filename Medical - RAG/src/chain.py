import os
import sys
import urllib.request
import urllib.error
import json
from dotenv import load_dotenv

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.retriever import retrieve

load_dotenv()

# ─────────────────────────────────────────────────────────────
# Source name map: rename raw filenames to human-readable names
# ─────────────────────────────────────────────────────────────
SOURCE_NAME_MAP = {
    "train.csv":          "Disease Prediction Database",
    "medquad.csv":        "NIH Medical Q&A Registry",
    "Combined Data.csv":  "Integrated Medical Literature",
    "A_Z_medicines_dataset_of_India.csv": "Pharmacopoeia Drug Reference",
    "Cardiovascular diseases.pdf": "Cardiovascular Clinical Guidelines",
    "Diabetes - NIDDK.pdf": "NIDDK Diabetes Guidelines",
    "daily_food_nutrition_dataset.csv": "Clinical Nutrition Database",
    "healthy_eating_dataset.csv": "Dietary Guidelines Database",
}

def friendly_source(raw_name: str) -> str:
    """Convert raw filename to a clean, human-readable source name."""
    for key, label in SOURCE_NAME_MAP.items():
        if key.lower() in raw_name.lower():
            return label
    # Fallback: strip extension and title-case
    return raw_name.replace("_", " ").replace(".csv", "").replace(".pdf", "").title()


# ─────────────────────────────────────────────────────────────
# Query type classifier — decides which prompt template to use
# ─────────────────────────────────────────────────────────────
def classify_query(question: str) -> str:
    """Detect the intent of the user's query."""
    q = question.lower()

    diet_keywords   = ["diet", "food", "eat", "meal", "nutrition", "what to eat", "avoid eating", "diet plan"]
    drug_keywords   = ["medicine", "medication", "drug", "tablet", "capsule", "dosage", "prescription", "painkiller", "antibiotic"]
    symptom_keywords = ["i have", "i am feeling", "i feel", "suffering", "symptoms", "pain", "ache", "fever", "cough", "nausea"]
    quick_keywords  = ["what is", "define", "explain", "tell me about", "overview of"]

    if any(k in q for k in diet_keywords):
        return "diet"
    if any(k in q for k in drug_keywords):
        return "drug"
    if any(k in q for k in symptom_keywords):
        return "symptom"
    if any(k in q for k in quick_keywords):
        return "quick"
    return "general"


# ─────────────────────────────────────────────────────────────
# Prompt templates — one per query type
# ─────────────────────────────────────────────────────────────
def build_prompt(question: str, context: str, history_text: str, sources_list: str, query_type: str) -> str:
    """Build a query-type-specific prompt for Gemini."""

    base_rules = f"""
MEDICAL GUARDRAIL: If the question is clearly unrelated to health, medicine, biology, diet, or fitness, reply ONLY with:
"I am a medical AI assistant and can only answer health-related questions."

CONTEXT FROM MEDICAL DATABASE:
{context}

PREVIOUS CONVERSATION:
{history_text if history_text else "None."}

SOURCES USED: {sources_list}
User Question: {question}
"""

    if query_type == "diet":
        return f"""You are MediBot, an expert clinical nutritionist.

TASK: Provide a comprehensive, well-formatted diet plan or nutritional advice.

FORMAT RULES:
- Use a clean Markdown table for daily meal plans (e.g., Meal | Food Items | Nutritional Benefit).
- Use standard Markdown bullets (-) for lists of foods to eat or avoid.
- Do NOT use *** or ### for styling. Use standard **bold** for emphasis.
- You may use your general medical and nutritional knowledge to create a complete plan, even if the provided database context is small.
- Do NOT cite sources inline on every sentence.
- List the sources at the very end under a "**References:**" heading.
- End with: "*This information is for educational purposes only. Please consult a registered dietitian for personalized advice.*"

{base_rules}
Answer:"""

    elif query_type == "drug":
        return f"""You are MediBot, a clinical pharmacist AI assistant.

TASK: Suggest or explain medications based on the user's query.

FORMAT RULES:
- Provide a clear, natural explanation without rigid "Overview" or "Key Information" headers.
- If suggesting medicine for common ailments (like a headache), suggest safe over-the-counter (OTC) options using your general medical intelligence.
- Use standard bullet points (-) for Dosage, Side Effects, and Precautions.
- Do NOT use *** or ### for styling. Use standard **bold** for emphasis.
- Do NOT cite sources inline on every sentence.
- List the sources at the very end under a "**References:**" heading.
- End with: "*This information is for educational purposes only. Always consult a licensed pharmacist or physician before taking any medication.*"

{base_rules}
Answer:"""

    elif query_type == "symptom":
        return f"""You are MediBot, an AI medical triage assistant.

TASK: Help the user understand their symptoms and suggest home care or next steps.

FORMAT RULES:
- Acknowledge their symptoms naturally. Do not use rigid "Overview" headers.
- Use your general medical intelligence to provide common causes and home remedies.
- Use standard bullet points (-) for listing possible causes or remedies.
- Do NOT use *** or ### for styling. Use standard **bold** for emphasis.
- Do NOT cite sources inline on every sentence.
- List the sources at the very end under a "**References:**" heading.
- End with: "*This information is for educational purposes only. If symptoms persist or worsen, please consult a qualified healthcare professional immediately.*"

{base_rules}
Answer:"""

    elif query_type == "quick":
        return f"""You are MediBot, a concise medical encyclopedia.

TASK: Answer the user's health question directly and naturally.

FORMAT RULES:
- Answer naturally in a short paragraph. No rigid headers like "Overview".
- Do NOT use *** or ### for styling. Use standard **bold** for emphasis.
- Do NOT cite sources inline on every sentence.
- List the sources at the very end under a "**References:**" heading.
- End with: "*This information is for educational purposes only.*"

{base_rules}
Answer:"""

    else:  # general
        return f"""You are MediBot, an expert medical AI assistant.

TASK: Answer the user's health question in a clear, helpful, and natural way.

FORMAT RULES:
- Write naturally using paragraphs and standard bullet points (-).
- Do NOT use rigid templates like "## Overview" and "## Key Information".
- Use your general medical intelligence to provide a complete answer if the context is limited.
- Do NOT use *** or ### for styling. Use standard **bold** for emphasis.
- Do NOT cite sources inline on every sentence (e.g., avoid [Source: ...]).
- Only list the sources ONCE at the very end under a "**References:**" heading.
- End with: "*This information is for educational purposes only. Please consult a qualified healthcare professional for personal medical advice.*"

{base_rules}
Answer:"""


# ─────────────────────────────────────────────────────────────
# Gemini HTTP caller
# ─────────────────────────────────────────────────────────────
def call_gemini(prompt: str) -> str:
    """Direct HTTP call to Gemini API."""
    api_key = os.environ.get("GEMINI_API_KEY", "")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"

    payload = json.dumps({
        "contents": [{"parts": [{"text": prompt}]}]
    }).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            raw = resp.read().decode("utf-8")
            data = json.loads(raw)
            return data["candidates"][0]["content"]["parts"][0]["text"]
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8")
        err = json.loads(raw)
        status = err.get("error", {}).get("status", "")
        if status == "RESOURCE_EXHAUSTED":
            return "[ERR] Gemini quota exceeded. Try again later."
        return f"[ERR] API Error {e.code}: {err.get('error', {}).get('message', raw)}"
    except Exception as e:
        return f"[ERR] Request failed: {e}"


# ─────────────────────────────────────────────────────────────
# Query rewriter for conversation context
# ─────────────────────────────────────────────────────────────
def rewrite_query(question: str, chat_history: list) -> str:
    """Uses Gemini to rewrite a contextual query into a standalone query."""
    if not chat_history:
        return question

    history_text = ""
    for entry in chat_history[-3:]:
        history_text += f"User: {entry['user']}\nAI: {entry['bot']}\n\n"

    prompt = f"""Given the following conversation history and a follow-up question, rewrite the question as a standalone query for a medical search engine. Return ONLY the rewritten question, nothing else.

Conversation History:
{history_text}

Follow-up Question: {question}

Standalone Question:"""

    print("[*] Rewriting query using context...")
    standalone_query = call_gemini(prompt).strip()
    print(f"[*] Rewritten Query: {standalone_query}")
    return standalone_query


# ─────────────────────────────────────────────────────────────
# Main RAG function
# ─────────────────────────────────────────────────────────────
def ask(question: str, chat_history: list = None) -> str:
    """Core RAG function: retrieve → classify → prompt → respond."""
    print(f"\n[?] Question: {question}")

    if chat_history is None:
        chat_history = []

    # Step 1: Rewrite query if there is chat history
    search_query = rewrite_query(question, chat_history)

    # Step 2: Semantic retrieval — top 4 chunks
    results = retrieve(search_query, top_k=4)

    # Step 3: Build context block — NO inline citations here
    context_parts = []
    unique_sources = []
    for i, res in enumerate(results):
        text = res["text"]
        raw_source = res["source"]
        nice_source = friendly_source(raw_source)
        context_parts.append(f"[Excerpt {i+1}]:\n{text}")
        if nice_source not in unique_sources:
            unique_sources.append(nice_source)

    context = "\n\n---\n\n".join(context_parts)
    sources_list = ", ".join(unique_sources) if unique_sources else "General Medical Knowledge"

    # Step 4: Format conversation history
    history_text = ""
    for entry in chat_history[-3:]:
        history_text += f"User: {entry['user']}\nAI: {entry['bot']}\n\n"

    # Step 5: Classify the query to pick the right prompt template
    query_type = classify_query(question)
    print(f"[*] Query type detected: {query_type}")

    # Step 6: Build the type-specific prompt
    prompt = build_prompt(question, context, history_text, sources_list, query_type)

    # Step 7: Call Gemini
    print("[*] Sending to Gemini (2.5 Flash)...")
    return call_gemini(prompt)
