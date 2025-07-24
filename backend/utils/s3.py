import aioboto3
from core.config import settings

class S3Handler:
    def __init__(self):
        self.endpoint_url = settings.MINIO_ENDPOINT
        self.aws_access_key_id = settings.MINIO_ACCESS_KEY
        self.aws_secret_access_key = settings.MINIO_SECRET_KEY
        self.region_name = settings.MINIO_REGION
        self.bucket = settings.MINIO_BUCKET
        self.use_ssl = settings.MINIO_SECURE

    async def connect(self):
        return aioboto3.Session().client(
            's3',
            endpoint_url=self.endpoint_url,
            aws_access_key_id=self.aws_access_key_id,
            aws_secret_access_key=self.aws_secret_access_key,
            region_name=self.region_name,
            use_ssl=self.use_ssl
        )

    async def upload_image(self, key: str, image_bytes: bytes, content_type: str = "image/jpeg") -> str:
        try:
            async with await self.connect() as client:
                await client.put_object(Bucket=self.bucket, Key=key, Body=image_bytes, ContentType=content_type)
            return f"{self.bucket}/{key}"
        except Exception as e:
            print(f"❌ S3 Upload Error: Failed to upload {key}. {e} ❌")
            raise 

    async def get_image(self, key: str) -> bytes:
        try:
            async with await self.connect() as client:
                response = await client.get_object(Bucket=self.bucket, Key=key)
                async with response['Body'] as stream:
                    return await stream.read()
        except Exception as e:
            print(f"❌ S3 Get Error: Failed to get {key}. {e} ❌")
            raise

    async def delete_image(self, key: str) -> None:
        try:
            async with await self.connect() as client:
                await client.delete_object(Bucket=self.bucket, Key=key)
        except Exception as e:
            print(f"❌ S3 Delete Error: Failed to delete {key}. {e} ❌")
            raise

    async def delete_folder(self, prefix: str) -> None:
        try:
            async with await self.connect() as client:
                paginator = client.get_paginator('list_objects_v2')
                pages = paginator.paginate(Bucket=self.bucket, Prefix=prefix)
                async for page in pages:
                    if "Contents" in page:
                        delete_keys = [{'Key': obj['Key']} for obj in page['Contents']]
                        await client.delete_objects(Bucket=self.bucket, Delete={'Objects': delete_keys})
        except Exception as e:
            print(f"❌ S3 Delete Folder Error: Failed to delete folder {prefix}. {e} ❌")
            raise