from deepface import DeepFace
import numpy as np
from PIL import Image
import io
import base64

class EmotionService:
    def decode_base64_image(self, base64_string: str) -> np.ndarray:
        """Convert base64 string to numpy array for DeepFace"""
        try:
            # Remove data URL prefix if present
            if ',' in base64_string:
                base64_string = base64_string.split(',')[1]
            
            image_bytes = base64.b64decode(base64_string)
            image = Image.open(io.BytesIO(image_bytes))
            image_array = np.array(image.convert('RGB'))
            return image_array
        except Exception as e:
            print(f"Image Decode Error: {e}")
            return None

    def detect_emotion(self, image_data: str):
        """
        Detects emotion from base64 image string.
        Returns: { emotion: str, confidence: float }
        """
        try:
            img_array = self.decode_base64_image(image_data)
            if img_array is None:
                return {"emotion": "neutral", "confidence": 0.0}

            result = DeepFace.analyze(
                img_path=img_array,
                actions=['emotion'],
                enforce_detection=False,
                detector_backend='opencv', # faster than retinaface
                silent=True
            )
            
            if isinstance(result, list):
                result = result[0]
            
            # Convert numpy types to native Python types
            dominant_emotion = result['dominant_emotion']
            confidence = float(result['emotion'][dominant_emotion])
            all_emotions = {k: float(v) for k, v in result['emotion'].items()}
            
            return {
                "emotion": dominant_emotion,
                "confidence": confidence,
                "all_emotions": all_emotions
            }
        except Exception as e:
            print(f"Emotion Detection Error: {e}")
            return {"emotion": "neutral", "confidence": 0.0}

emotion_service = EmotionService()
