import json
import logging
import google.generativeai as genai
from decimal import Decimal
from concurrent.futures import ThreadPoolExecutor, TimeoutError
import re
import os
from dotenv import load_dotenv  # ✅ Import dotenv

# Load environment variables from .env
load_dotenv()


# Set up logging configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class GradingService:
    def __init__(self):
        """Initialize Gemini API with the provided API key."""
        try:
            api_key = os.getenv("GEMINI_API_KEY")  # ✅ Load from .env
            
            if not api_key:
                raise ValueError("❌ GEMINI_API_KEY is missing. Check your .env file.")
        
            genai.configure(api_key=api_key)  
            self.model = genai.GenerativeModel("gemini-1.5-pro", generation_config={"temperature": 0})
        except Exception as e:
            logging.error(f"❌ Error initializing Gemini API: {e}")
            raise

    def grade_submission(self, student_answer, marking_guide_text, timeout=30):
        """Grades a student's answer using Google Gemini AI with semantic comparison."""
        # logging.info(f"🔍 Student Answer: {student_answer}")
        # logging.info(f"🔍 Marking Guide: {marking_guide_text}")

        prompt = f"""
        You are an AI grader that evaluates student answers based on **semantic meaning** rather than exact word-for-word matching.
        
        ## **Marking Guide:**  
        {marking_guide_text}

        ## **Student Answer:**  
        {student_answer}

        ## **Grading Criteria:**
        1. **Award full marks if the meaning is correct, even if wording differs.**  
        2. **Give partial credit for near-correct responses.**  
        3. **If the answer is completely incorrect, assign Grade "F" (Score: 0).**  
        4. **Use this grading scale:**
            - **Exceptional (Fully Correct)** → "A+" (Score: 90-100)
            - **Excellent (Fully Correct)** → "A" (Score: 80 - 89)
            - **Very Good (Partially Correct)** → "B+" (Score: 75 - 79)
            - **Good (Minor Issues)** → "B" (Score: 70 - 74)
            - **Fairly Good (Significant Issues)** → "C+" (Score: 65 - 69)
            - **Fair (Major Issues)** → "C" (Score: 60 - 64)
            - **Pass (Minor Errors)** → "D+" (Score: 55 - 59)
            - **Marginal Pass (Serious Errors)** → "D" (Score: 50 - 54)
            - **Marginal Fail (Very Serious Errors)** → "E" (Score: 45 - 49)
            - **Clear Fail (Unacceptable)** → "E-" (Score: 40 - 44)
            - **Bad Fail (Completely Incorrect)** → "F" (Score: 0 - 39)
           
        
        **Return output ONLY in this JSON format:**
        ```json
        {{
          "score": 84,
          "grade": "A",
          "feedback": "Full paragraph feedback with total marks awarded and breakdown of scores question by question..."
        }}
        ```
        """

        try:
            with ThreadPoolExecutor() as executor:
                future = executor.submit(self.model.generate_content, prompt)
                response = future.result(timeout=timeout)

            if not response or not response.text:
                logging.warning("⚠️ Empty API response. Returning default values.")
                return "F", Decimal(0), "No feedback provided."

            response_text = response.text.strip()
            # print(f"🔍 Raw API Response:\n{response_text}")

            # Extract JSON using regex
            json_match = re.search(r"\{.*\}", response_text, re.DOTALL)

            if json_match:
                json_data = json_match.group(0)
            else:
                logging.warning("⚠️ Could not extract JSON from response. Returning defaults.")
                return "F", Decimal(0), "Failed to generate feedback."

            # Parse the JSON response
            parsed_result = json.loads(json_data)
            # print(f"✅ Parsed JSON: {parsed_result}")

            raw_score = parsed_result.get("score", 0)
            score = Decimal(raw_score)  # numeric use
            
            grade = parsed_result.get("grade", "F")
            feedback = parsed_result.get("feedback", "No feedback provided.")

            # At the end, once you're done with numeric logic:
            # score = f"{score.quantize(Decimal('1.00'))}%"

            # logging.info(f"✅ Grading Successful → Grade: {grade}, Score: {score:.2f}, Feedback: {feedback}")
            return grade, score, feedback

        except json.JSONDecodeError as e:
            logging.warning(f"❌ JSON Parse Error: {e}\nRaw Response: {response_text}")
            return "F", Decimal(0), "Failed to generate feedback."

        except TimeoutError:
            logging.warning("⚠️ API request timed out. Returning default values.")
            return "F", Decimal(0), "Failed to generate feedback."

        except Exception as e:
            logging.error(f"❌ Error during grading: {e}")
            return "F", Decimal(0), "Failed to generate feedback."
        
    
    
    # Add the grading methods (fair, lenient, strict)
    def fair_grading(self, student_answer, marking_guide_text):
        """Fair grading: Evaluates student answers based on correct meaning."""
        grade, score, feedback = self.grade_submission(student_answer, marking_guide_text)
        # Customize feedback for fair grading if needed
        return grade, score, feedback

    def lenient_grading(self, student_answer, marking_guide_text):
        """Lenient grading: More forgiving, may allow for minor errors."""
        grade, score, feedback = self.grade_submission(student_answer, marking_guide_text)
          # Adjust the score for lenient grading only for grades below 'A'
        if grade in ['B', 'C+', 'C', 'D+', 'D', 'E', 'E-', 'F']:
         score += Decimal(0.05)  # Slightly increase score for lenient grading
    
    # Ensure the adjusted score does not exceed 100%
        if score > Decimal(1):  # Cap score at 100%
         score = Decimal(1)
    
    # Reassign grade based on adjusted score (manually)
        if score >= Decimal(0.90):
         grade = "A+"
        elif score >= Decimal(0.80):
         grade = "A"
        elif score >= Decimal(0.75):
         grade = "B+"
        elif score >= Decimal(0.70):
         grade = "B"
        elif score >= Decimal(0.65):
         grade = "C+"
        elif score >= Decimal(0.60):
         grade = "C"
        elif score >= Decimal(0.55):
         grade = "D+"
        elif score >= Decimal(0.50):
         grade = "D"
        elif score >= Decimal(0.45):
         grade = "E"
        elif score >= Decimal(0.40):
         grade = "E-"
        else:
         grade = "F"

        return grade, score, feedback

    def strict_grading(self, student_answer, marking_guide_text):
        """Strict grading: Penalizes even minor errors."""
        grade, score, feedback = self.grade_submission(student_answer, marking_guide_text)
        # Adjust the score/feedback for strict grading
        if grade in ['A+','A', 'B+','B','C+', 'C','D+','D', 'E', 'E-', 'F']:
            score -= Decimal(0.05)  # Slightly decrease score for strict grading
        return grade, score, feedback