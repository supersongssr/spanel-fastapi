"""
Response Schemas

This module defines standard response schemas compatible with the original PHP project.
All responses follow the format: {ret: 0/1, msg: "...", data: {...}}
"""

from typing import Optional, Any, Generic, TypeVar
from pydantic import BaseModel, Field

DataT = TypeVar('DataT')


class ResponseModel(BaseModel, Generic[DataT]):
    """
    Standard API Response Model

    Compatible with the original PHP project's response format.

    Attributes:
        ret: Status code (1=success, 0=failure)
        msg: Message string
        data: Optional data payload
    """

    ret: int = Field(
        ...,
        description="Status code: 1 for success, 0 for failure",
        example=1
    )
    msg: str = Field(
        ...,
        description="Response message",
        example="ok"
    )
    data: Optional[DataT] = Field(
        None,
        description="Optional data payload"
    )

    class Config:
        json_schema_extra = {
            "examples": [
                {
                    "ret": 1,
                    "msg": "ok",
                    "data": {"user_id": 123}
                },
                {
                    "ret": 0,
                    "msg": "Invalid credentials",
                    "data": None
                }
            ]
        }


def success_response(
    msg: str = "ok",
    data: Optional[Any] = None
) -> dict:
    """
    Create a success response

    Args:
        msg: Success message
        data: Optional data payload

    Returns:
        Dictionary formatted as success response
    """
    return {
        "ret": 1,
        "msg": msg,
        "data": data
    }


def error_response(
    msg: str,
    data: Optional[Any] = None
) -> dict:
    """
    Create an error response

    Args:
        msg: Error message
        data: Optional data payload

    Returns:
        Dictionary formatted as error response
    """
    return {
        "ret": 0,
        "msg": msg,
        "data": data
    }


# Common response models
class HealthCheckResponse(BaseModel):
    """Health check response model"""

    database: str = Field(..., description="Database connection status")
    redis: str = Field(..., description="Redis connection status")
    version: str = Field(..., description="API version")


class MessageResponse(BaseModel):
    """Simple message response"""

    ret: int = Field(..., description="Status code")
    msg: str = Field(..., description="Message")
