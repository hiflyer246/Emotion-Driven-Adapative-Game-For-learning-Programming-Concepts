from gtts import gTTS
import io

class SpeechService:
    def __init__(self):
        pass

    async def text_to_speech(self, text: str) -> bytes:
        """
        Converts text to audio bytes using gTTS.
        """
        try:
            # Generate audio in memory
            tts = gTTS(text=text, lang='en')
            fp = io.BytesIO()
            tts.write_to_fp(fp)
            fp.seek(0)
            return fp.read()
        except Exception as e:
            print(f"TTS Error: {e}")
            return b""

speech_service = SpeechService()
