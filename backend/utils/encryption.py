from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives import serialization

class EncryptionUtil:
    @staticmethod
    def generate_key_pair():
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        public_key = private_key.public_key()

        pem_private = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        ).decode('utf-8')

        pem_public = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode('utf-8')

        return pem_private, pem_public

    @staticmethod
    def encrypt_message(public_key_pem: str, message: str) -> bytes:
        public_key = serialization.load_pem_public_key(public_key_pem.encode('utf-8'))
        encrypted_message = public_key.encrypt(
            message.encode('utf-8'),
            padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None)
        )
        return encrypted_message

    @staticmethod
    def decrypt_message(private_key_pem: str, encrypted_message: bytes) -> str:
        private_key = serialization.load_pem_private_key(private_key_pem.encode('utf-8'), password=None)
        decrypted_message = private_key.decrypt(
            encrypted_message,
            padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None)
        )
        return decrypted_message.decode('utf-8')
