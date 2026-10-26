import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True)

    PROJECT_NAME: str = "Bayora - Adversarial AI Safety Infrastructure"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security & Auth
    SECRET_KEY: str = os.getenv("BAYORA_SECRET_KEY", "bayora-zero-trust-adversarial-secret-key-2026-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./bayora.db")
    
    # Sandbox Isolation Settings
    ISOLATION_MODE: str = os.getenv("BAYORA_ISOLATION_MODE", "virtual")  # "docker" or "virtual"
    RED_TEAM_NETWORK: str = "bayora-red-net"
    BLUE_TEAM_NETWORK: str = "bayora-blue-net"
    LLM_NETWORK: str = "bayora-llm-net"
    
    # Resource Limits for Sandboxes
    MAX_SANDBOX_CPU_PERCENT: float = 85.0
    MAX_SANDBOX_MEMORY_MB: float = 512.0
    EXECUTION_TIMEOUT_SECONDS: int = 15
    
    # Cryptographic Audit Chain
    HASH_CHAIN_DIFFICULTY: int = 0
    SIGNATURE_ALGORITHM: str = "SHA256"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
