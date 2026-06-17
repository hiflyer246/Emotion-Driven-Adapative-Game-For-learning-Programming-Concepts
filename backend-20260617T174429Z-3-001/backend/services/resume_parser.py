import io
import pypdf
from fastapi import UploadFile

class ResumeParserService:
    async def extract_text_from_file(self, file: UploadFile) -> str:
        """
        Extracts text content from an uploaded file (PDF or TXT).
        """
        filename = file.filename.lower()
        content = await file.read()
        
        # Reset cursor for safety if needed, though usually read() consumes it
        # await file.seek(0) 

        text = ""

        if filename.endswith(".pdf"):
            try:
                pdf_file = io.BytesIO(content)
                reader = pypdf.PdfReader(pdf_file)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
            except Exception as e:
                print(f"Error reading PDF: {e}")
                return ""
        
        elif filename.endswith(".txt"):
            try:
                text = content.decode("utf-8")
            except Exception as e:
                print(f"Error reading TXT: {e}")
                return ""
        
        else:
             # Basic fallback or empty for unsupported
             return ""

        return text.strip()

resume_parser = ResumeParserService()
