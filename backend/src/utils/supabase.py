import httpx
from src.config.env import settings
from typing import Any
from src.utils.logger import logger
from datetime import datetime


class SupabaseAuth:
    def __init__(self, url: str, key: str):
        self.url = f"{url}/auth/v1"
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }
        self.client = httpx.AsyncClient(timeout=10.0)

    def _make_user(self, data: dict):
        return type('User', (), {
            'id': data.get('id'),
            'email': data.get('email'),
            'created_at': data.get('created_at'),
            'user_metadata': data.get('user_metadata', {})
        })()

    def _make_session(self, data: dict):
        return type('Session', (), {
            'access_token': data.get('access_token'),
            'refresh_token': data.get('refresh_token')
        })()

    async def get_user(self, access_token: str) -> Any:
        try:
            response = await self.client.get(
                f"{self.url}/user",
                headers={**self.headers, "Authorization": f"Bearer {access_token}"}
            )
            if response.status_code == 200:
                data = response.json()
                return type('AuthResponse', (), {
                    'user': self._make_user(data)
                })()
            return type('AuthResponse', (), {'user': None})()
        except Exception as e:
            logger.error(f"Supabase user fetch failed: {e}")
            return type('AuthResponse', (), {'user': None})()

    async def sign_in_with_password(self, params: dict) -> Any:
        try:
            response = await self.client.post(
                f"{self.url}/token?grant_type=password",
                json=params,
                headers=self.headers
            )
            if response.status_code == 200:
                data = response.json()
                return type('AuthResponse', (), {
                    'user': self._make_user(data['user']),
                    'session': self._make_session(data)
                })()

            error_msg = response.text
            try:
                error_json = response.json()
                error_msg = (
                    error_json.get("error_description")
                    or error_json.get("msg")
                    or error_json.get("error")
                    or response.text
                )
            except Exception:
                pass

            raise Exception(f"Login failed: {error_msg}")

        except Exception as e:
            logger.error(f"Supabase login failed: {e}")
            raise e

    async def sign_up(self, params: dict) -> Any:
        try:
            payload = params.copy()
            data_meta = payload.get("options", {}).get("data", {})
            if data_meta:
                payload["data"] = data_meta
                del payload["options"]

            response = await self.client.post(
                f"{self.url}/signup",
                json=payload,
                headers=self.headers
            )

            if response.status_code in [200, 201]:
                data = response.json()
                if not data:
                    return type('AuthResponse', (), {'user': None, 'session': None})()

                if "error" in data:
                    raise Exception(data["error"])

                # GoTrue returns user at top-level on signup
                user_data = data if "id" in data else data.get("user", data)

                # Session present when email autoconfirm is enabled
                session_obj = self._make_session(data) if data.get("access_token") else None

                return type('AuthResponse', (), {
                    'user': self._make_user(user_data),
                    'session': session_obj
                })()

            error_msg = response.text
            try:
                error_json = response.json()
                error_msg = (
                    error_json.get("msg")
                    or error_json.get("error_description")
                    or error_json.get("error")
                    or response.text
                )
            except Exception:
                pass

            raise Exception(f"Signup failed: {error_msg}")

        except Exception as e:
            logger.error(f"Supabase signup failed: {e}")
            raise e

    async def refresh_session(self, refresh_token: str) -> Any:
        try:
            response = await self.client.post(
                f"{self.url}/token?grant_type=refresh_token",
                json={"refresh_token": refresh_token},
                headers=self.headers
            )
            if response.status_code == 200:
                data = response.json()
                return type('AuthResponse', (), {
                    'session': self._make_session(data)
                })()
            raise Exception("Invalid refresh token")
        except Exception as e:
            logger.error(f"Refresh failed: {e}")
            raise e

    async def sign_out(self):
        pass  # Client-side token removal is sufficient; GoTrue /logout is optional

    async def reset_password_email(self, email: str):
        await self.client.post(
            f"{self.url}/recover",
            json={"email": email},
            headers=self.headers
        )


# Singleton — uses ANON key for user-facing auth
supabase = SupabaseAuth(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
