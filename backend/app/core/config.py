"""
Core Configuration for SS-Panel FastAPI

This module manages all environment variables and configuration settings,
ensuring compatibility with the original PHP project's configuration structure.
"""

from typing import Optional, List
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    """
    Application Settings

    All configuration values are loaded from environment variables or .env file.
    These settings mirror the original PHP project's config structure.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # ========== Application Basic Settings ==========
    app_name: str = "SS-Panel FastAPI"
    app_version: str = "1.0.0"
    debug: bool = False
    base_url: str = "http://localhost:8000"

    # ========== Security Settings ==========
    secret_key: str = "your-secret-key-change-in-production"
    jwt_secret_key: str = "your-jwt-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    # Mu Key for Node Communication (comma-separated for multiple keys)
    mu_key: str = "default-mu-key-please-change"

    # ========== Database Settings ==========
    db_host: str = "127.0.0.1"
    db_port: int = 3306
    db_user: str = "root"
    db_password: str = ""
    db_name: str = "test-spanel-fastapi"  # MUST match the requirement

    @property
    def database_url(self) -> str:
        """Generate async MySQL database URL"""
        return f"mysql+aiomysql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"

    # ========== Redis Settings ==========
    redis_host: str = "127.0.0.1"
    redis_port: int = 6379
    redis_password: Optional[str] = None
    redis_db: int = 0
    redis_decode_responses: bool = True

    @property
    def redis_url(self) -> str:
        """Generate Redis URL"""
        if self.redis_password:
            return f"redis://:{self.redis_password}@{self.redis_host}:{self.redis_port}/{self.redis_db}"
        return f"redis://{self.redis_host}:{self.redis_port}/{self.redis_db}"

    # ========== Email Settings ==========
    mail_host: str = "smtp.gmail.com"
    mail_port: int = 587
    mail_user: str = ""
    mail_pass: str = ""
    mail_from: str = "noreply@example.com"
    mail_encription: str = "tls"  # tls or ssl

    # ========== Payment Gateway Settings ==========
    payment_gateway: str = "alipay"  # alipay, yft, chenPay, etc.
    alipay_id: Optional[str] = None
    alipay_key: Optional[str] = None
    alipay_gateway_url: str = "https://openapi.alipay.com/gateway.do"

    # ClonePay Settings (comma-separated websites)
    clonepay_webs: str = ""  # "web1,web2,web3"
    clonepay_apis: Optional[dict] = None  # Will be parsed in code

    # ========== Registration & User Settings ==========
    register_method: str = "aes-256-gcm"
    default_traffic: int = 100  # GB
    user_expire_in_default: int = 30  # days
    register_node_group: int = 0

    # ========== Check-in Settings ==========
    enable_checkin_captcha: bool = False
    captcha_provider: str = "recaptcha"  # recaptcha, geetest
    checkin_min: int = 50  # MB
    checkin_max: int = 100  # MB

    # ========== Login Settings ==========
    enable_login_captcha: bool = False
    recaptcha_sitekey: Optional[str] = None
    recaptcha_secret: Optional[str] = None

    # ========== Referral System Settings ==========
    ref_fee: float = 20.0  # Percentage
    invite_price: float = 5.0
    enable_account_reset: bool = False
    account_reset_money: float = 10.0
    account_reset_traffic: int = 100  # GB

    # ========== Feature Toggles ==========
    enable_donate: bool = False
    enable_telegram: bool = False
    enable_auto_renew: bool = False
    enable_account_delete: bool = False
    enable_email_verify: bool = False

    # ========== Traffic & Node Settings ==========
    merge_sub: bool = False
    sub_url: Optional[str] = None
    subcon_url: Optional[str] = None
    display_ios_class: bool = False
    ios_account: Optional[str] = None
    ios_password: Optional[str] = None

    # ========== Speed Test Duration ==========
    speedtest_duration: int = 24  # hours

    # ========== Pagination ==========
    default_page_size: int = 20
    max_page_size: int = 100

    # ========== CORS Settings ==========
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    cors_allow_credentials: bool = True
    cors_allow_methods: List[str] = ["*"]
    cors_allow_headers: List[str] = ["*"]

    # ========== Forbidden China IP Access ==========
    is_forbidden_china: bool = False

    # ========== Subscription Settings ==========
    sub_update_time: int = 1  # hours
    sub_limit: int = 16  # Default subscription node limit

    # ========== Auto Reset Traffic ==========
    auto_reset_bandwidth: int = 100  # GB
    auto_reset_day: int = 1  # day of month

    # ========== Payback (Referral Commission) Settings ==========
    payback_count: int = 3  # How many levels of referral
    payback_money: float = 0.2  # 20% per level

    # ========== Session Settings ==========
    session_expire: int = 7  # days
    session_key: str = "sspannel_session"

    # ========== File Upload Settings ==========
    upload_dir: str = "uploads"
    max_upload_size: int = 5 * 1024 * 1024  # 5MB

    # ========== Telegram Settings ==========
    telegram_bot_token: Optional[str] = None
    telegram_group_id: Optional[str] = None

    # ========== Geetest Settings ==========
    geetest_id: Optional[str] = None
    geetest_key: Optional[str] = None


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance

    This function uses lru_cache to ensure settings are loaded only once.
    Subsequent calls will return the cached instance.

    Returns:
        Settings: The application settings instance
    """
    return Settings()
