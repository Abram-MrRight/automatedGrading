import torch
from sentence_transformers import SentenceTransformer, util
from .text_processing import extract_text_from_file, preprocess_text

class PlagiarismChecker:
    def __init__(self, threshold=0.6):
        """Initialize the plagiarism checker with a pre-trained model and similarity threshold."""
        self.model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
        self.threshold = threshold  # ✅ Configurable plagiarism threshold

    def check_plagiarism(self, submissions):
        """
        Compare each submission against others to detect plagiarism.

        :param submissions: List of ExamSubmission instances.
        :return: Dictionary with plagiarism results.
        """
        if not submissions:
            return {"error": "No submissions provided"}

        # 🔍 Debugging: Check what we received
        print(f"📌 Debug: Received submissions = {submissions}")

        # Ensure submissions contain `ExamSubmission` objects
        if not all(hasattr(sub, "file") and hasattr(sub, "id") for sub in submissions):
            raise ValueError("❌ Expected ExamSubmission objects, but received invalid data!")

        results = {}
        submission_texts = []
        submission_ids = []

        # ✅ Extract & preprocess all submission texts
        for sub in submissions:
            try:
                text = extract_text_from_file(sub.file.path)  # Extract text from file
                submission_texts.append(preprocess_text(text))  # Preprocess text
                submission_ids.append(sub.id)  # Store submission ID
            except Exception as e:
                results[f"Error in submission {sub.id}"] = str(e)

        if len(submission_texts) < 2:
            return {"error": "Not enough submissions to compare"}

        # ✅ Convert texts to embeddings
        embeddings = self.model.encode(submission_texts, convert_to_tensor=True)

        # ✅ Compute similarity matrix
        similarity_matrix = util.pytorch_cos_sim(embeddings, embeddings)

        # ✅ Extract upper-triangle values (avoiding redundant comparisons)
        for i in range(len(submission_ids)):
            for j in range(i + 1, len(submission_ids)):  # Only compare unique pairs
                similarity_score = similarity_matrix[i][j].item()

                if similarity_score >= self.threshold:
                    results[f"{submission_ids[i]} vs {submission_ids[j]}"] = round(similarity_score * 100, 2)

        return results
