import secrets
from datetime import datetime, timedelta
from src.models.user import User
from src.utils.crypto import hash_token
from src.utils.email_service import send_email

# Generate password reset token
def generate_reset_token(user: User):
    token = secrets.token_urlsafe(32)
    hashed_token = hash_token(token)
    user.reset_token = hashed_token
    user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
    user.save()  # Replace with actual DB save
    return token

# Verify password reset token
def verify_reset_token(user: User, token: str):
    if datetime.utcnow() > user.reset_token_expiry:
        return False
    return hash_token(token) == user.reset_token

# Send password reset email
def send_password_reset_email(user: User, token: str):
    reset_link = f"https://example.com/reset-password?token={token}"
    send_email(
        to=user.email,
        subject="Password Reset Request",
        body=f"Click the link to reset your password: {reset_link}"
    )