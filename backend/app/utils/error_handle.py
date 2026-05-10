# utils/errors.py
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from sqlalchemy.exc import SQLAlchemyError
import logging
from ..schemas import ApiResponse


class NotFoundError(Exception):
    def __init__(self, resource: str, id: int):
        self.message = f"{resource} with id {id} not found."
        super().__init__(self.message)


def handle_error(e: Exception, context: str = "") -> JSONResponse:
    prefix = f"[{context}] " if context else ""
    logger = logging.getLogger(__name__)

    if isinstance(e, NotFoundError):
        logger.warning("%s%s", prefix, e.message)
        return JSONResponse(
            status_code=404,
            content=ApiResponse(
                status="FAILED",
                message=e.message
            ).model_dump()
        )
    elif isinstance(e, ValidationError):
        logger.warning("%sValidation error: %s", prefix, str(e))
        return JSONResponse(
            status_code=422,
            content=ApiResponse(
                status="FAILED",
                message="Data validation error: one or more records are malformed."
            ).model_dump()
        )
    elif isinstance(e, SQLAlchemyError):
        logger.error("%sDatabase error: %s", prefix, str(e))
        return JSONResponse(
            status_code=503,
            content=ApiResponse(
                status="FAILED",
                message="Database error: unable to complete the request. Please try again later."
            ).model_dump()
        )
    else:
        logger.exception("%sUnexpected error: %s", prefix, str(e))
        return JSONResponse(
            status_code=500,
            content=ApiResponse(
                status="FAILED",
                message="An unexpected error occurred. Please contact support if the issue persists."
            ).model_dump()
        )