import httpx
from src.config.env import settings
from typing import Optional, Any
from src.utils.logger import logger

class SupabaseAuth:
    def __init__(self, url: str, key: str):
        self.url = f"{url}/auth/v1"
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }
        self.client = httpx.AsyncClient(timeout=10.0)

    async def get_user(self, access_token: str) -> Any:
        try:
            response = await self.client.get(
                f"{self.url}/user",
                headers={**self.headers, "Authorization": f"Bearer {access_token}"}
            )
            if response.status_code == 200:
                data = response.json()
                return type('User', (), {
                    'id': data.get('id'),
                    'email': data.get('email'),
                    'created_at': data.get('created_at'),
                    'user_metadata': data.get('user_metadata', {})
                })()
            return None
        except Exception as e:
            logger.error(f"Supabase user fetch failed: {e}")
            return None

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
                    'user': type('User', (), {
                        'id': data['user']['id'],
                        'email': data['user']['email'],
                        'user_metadata': data['user'].get('user_metadata', {})
                    })(),
                    'session': type('Session', (), {
                        'access_token': data['access_token'],
                        'refresh_token': data['refresh_token']
                    })()
                })()
            
            # Extract error message
            error_msg = response.text
            try:
                error_json = response.json()
                error_msg = error_json.get("error_description") or error_json.get("msg") or error_json.get("error") or response.text
            except:
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
                     return type('AuthResponse', (), {'user': None})()
                
                # Check for error in 200 OK (some APIs do this, though GoTrue usually uses 4xx)
                if "error" in data:
                     raise Exception(data["error"])

                user_data = data if "id" in data else data.get("user") # Handle top-level user or {user: ...}
                if not user_data:
                     # This happens if email confirmation is required and implicit login is disabled?
                     # Sometimes just returns { "id": "...", ... }
                     user_data = data

                return type('AuthResponse', (), {
                    'user': type('User', (), {
                        'id': user_data.get('id'),
                        'email': user_data.get('email', params.get('email')),
                        'created_at': user_data.get('created_at', str(datetime.utcnow())),
                        'user_metadata': user_data.get('user_metadata', {})
                    })()
                })()
            
            # Handle Errors
            error_msg = response.text
            try:
                error_json = response.json()
                error_msg = error_json.get("msg") or error_json.get("error_description") or error_json.get("error") or response.text
            except:
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
                    'session': type('Session', (), {
                        'access_token': data['access_token'],
                        'refresh_token': data['refresh_token']
                    })()
                })()
            raise Exception("Invalid refresh token")
        except Exception as e:
             logger.error(f"Refresh failed: {e}")
             raise e
             
    async def sign_out(self):
        # Statless, nothing to do backend side usually unless revoking
        pass

    async def reset_password_email(self, email: str):
        await self.client.post(
             f"{self.url}/recover",
             json={"email": email},
             headers=self.headers
        )

# Singleton instance
supabase = SupabaseAuth(settings.SUPABASE_URL, settings.SUPABASE_KEY)
