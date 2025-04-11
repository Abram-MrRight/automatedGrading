import re
import pickle
import docling  # Import docling
import nltk
from nltk.corpus import stopwords
from docx import Document as DocxDocument
import os
import fitz  # PyMuPDF
import spacy
from nltk.tokenize import word_tokenize, sent_tokenize
from word2number import w2n  # Converts numbers in words to digits
from contractions import fix  # Expands contractions
import docx  # For DOCX files
import easyocr


# Ensure NLTK resources are available
nltk.download("punkt")
nltk.download("stopwords")

# Load spaCy English model for lemmatization and Named Entity Recognition (NER)
nlp = spacy.load("en_core_web_sm")


def extract_text_from_file(file_path):
    """Extract text from a file (txt, pdf, docx, etc.)."""
    try:
        file_extension = os.path.splitext(file_path)[1].lower()
        
        if file_extension == '.txt':
            return extract_text_from_txt(file_path)
        elif file_extension == '.pdf':
            return extract_text_from_pdf(file_path)  
        elif file_extension == '.docx':
            return extract_text_from_docx(file_path) 
        elif file_extension in ['.png', '.jpg', '.jpeg', '.tiff']:
            return extract_text_from_image(file_path)  # Image OCR
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")
    except Exception as e:
        return f"Error extracting text: {str(e)}"

def extract_text_from_txt(file_path):
    """Extract text from a TXT file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read().strip()
    except Exception as e:
        return f"Error extracting text from TXT: {e}"

def extract_text_from_pdf(file_path):
    """Extract text from a PDF file using PyMuPDF."""
    try:
        doc = fitz.open(file_path)  # Open PDF
        text = "\n".join([page.get_text("text") for page in doc])  # Extract text
        return text.strip() if text else "No text found in PDF."
    except Exception as e:
        return f"Error extracting text from PDF: {e}"

def extract_text_from_docx(file_path):
    """Extract text from a DOCX file."""
    try:
        doc = docx.Document(file_path)
        full_text = []
        for para in doc.paragraphs:
            full_text.append(para.text)
        return "\n".join(full_text).strip() or "No text found in DOCX."
    except docx.opc.exceptions.PackageNotFoundError:
        return "DOCX file is corrupted or not a valid DOCX."
    except Exception as e:
        return f"Error extracting text from DOCX: {e}"

def extract_text_from_image(file_path):
    """Extract text from an image file using EasyOCR."""
    try:
        reader = easyocr.Reader(['en'])  # Specify the language(s) you want to use
        result = reader.readtext(file_path)

        # Extract and join text from the result
        text = ' '.join([item[1] for item in result])
        
        return text.strip() or "No text found in Image."
    except Exception as e:
        return f"Error extracting text from Image: {e}"

def preprocess_text(text):
    """Preprocess extracted text for AI analysis"""
    if not text or not isinstance(text, str):
        return ""
    
    # 1. Expand contractions (e.g., "don't" -> "do not")
    text = fix(text)

    # 2. Convert to lowercase
    text = text.lower()
    
    # 3. Sentence tokenization to preserve structure
    sentences = sent_tokenize(text)
    
    # 4. Named Entity Recognition (NER) to preserve important names, places, etc.
    doc = nlp(text)
    named_entities = {ent.text for ent in doc.ents}  # Keep original case for entities
    
    # 5. Remove special characters but preserve numbers and named entities
    text = re.sub(r"[^\w\s]", "", text)  # Remove punctuation but keep words and numbers
    
    # 6. Tokenization
    tokens = word_tokenize(text)
    
    # 7. Convert numbers written in words to digits (e.g., "twenty-five" -> "25")
    tokens = [str(w2n.word_to_num(word)) if word.isalpha() and word in w2n.american_number_system else word for word in tokens]
    
    # 8. Remove stopwords while keeping named entities
    stop_words = set(stopwords.words("english"))
    tokens = [word for word in tokens if word not in stop_words or word in named_entities]
    
    # 9. Lemmatization (better than stemming for retaining meaning)
    tokens = [token.lemma_ for token in nlp(" ".join(tokens))]

    # 10. Reconstruct text
    processed_text = " ".join(tokens)

    return processed_text

def serialize_embeddings(embeddings):
    """Convert vector embeddings into binary format for storage."""
    try:
        return pickle.dumps(embeddings)
    except Exception as e:
        return f"Error serializing embeddings: {e}"

def deserialize_embeddings(binary_data):
    """Convert stored binary embeddings back into usable format."""
    try:
        return pickle.loads(binary_data) if binary_data else None
    except Exception as e:
        return f"Error deserializing embeddings: {e}"
