import hashlib

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Replace with bcrypt or other secure hashing
    return hash_token(plain_password) == hashed_password