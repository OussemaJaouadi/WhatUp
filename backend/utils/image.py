from PIL import Image
import io
import imghdr
import hashlib

ALLOWED_FORMATS = {"jpeg", "png", "webp"}
MAX_IMAGE_SIZE_MB = 5

class ImageSecurityError(Exception):
    pass

class ImageHandler:
    def __init__(self, allowed_formats=None, max_size_mb=None):
        self.allowed_formats = allowed_formats or ALLOWED_FORMATS
        self.max_size_mb = max_size_mb or MAX_IMAGE_SIZE_MB

    async def calculate_hash(self, image_bytes: bytes) -> str:
        return hashlib.sha256(image_bytes).hexdigest()

    async def verify_image_security(self, image_bytes: bytes) -> None:
        try:
            file_type = imghdr.what(None, h=image_bytes)
            if file_type not in self.allowed_formats:
                print(f"❌ Image Security Error: Unsupported image format: {file_type} ❌")
                raise ImageSecurityError(f"Unsupported image format: {file_type}")
            if len(image_bytes) > self.max_size_mb * 1024 * 1024:
                print("❌ Image Security Error: Image size exceeds limit ❌")
                raise ImageSecurityError("Image size exceeds limit")
            with Image.open(io.BytesIO(image_bytes)) as img:
                img.verify()
        except ImageSecurityError:
            raise
        except Exception as e:
            print(f"❌ Image Security Error: Image file is corrupted or invalid. {e} ❌")
            raise ImageSecurityError("Image file is corrupted or invalid")

    async def compress_image(self, image_bytes: bytes, quality: int = 75) -> bytes:
        try:
            with Image.open(io.BytesIO(image_bytes)) as img:
                if img.mode != "RGB":
                    img = img.convert("RGB")
                output = io.BytesIO()
                img.save(output, format="JPEG", quality=quality, optimize=True)
                return output.getvalue()
        except Exception as e:
            print(f"❌ Image Compression Error: Failed to compress image. {e} ❌")
            raise

    async def process_image(self, image_bytes: bytes, quality: int = 75) -> bytes:
        await self.verify_image_security(image_bytes)
        return await self.compress_image(image_bytes, quality=quality)