from ..database import get_db
from ..schemas import ApiResponse
from ..utils.error_handle import handle_error, BadRequestError
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from sqlalchemy import select, func, text
from pydantic import BaseModel



router = APIRouter(
    prefix="/analytics",
    tags=["analytics"]
)


@router.get("/popular-class-types", response_model=ApiResponse)
async def get_popular_class_types(
    year: int = Query(..., ge=2020, le=datetime.now().year),
    month: int = Query(..., ge=1, le=12),
    limit: int = Query(5, ge=1, le=20),
    db: AsyncSession = Depends(get_db)
):

    try:
        result = await db.execute(
            text("SELECT * FROM get_popular_class_types(:year, :month, :limit)"),
            {"year": year, "month": month, "limit": limit}
        )

        data = []
        for row in result:
            data.append({
                "class_type_name": row[0],
                "total_classes": row[1],
                "total_registrations": row[2],
                "total_capacity": row[3],
                "avg_occupancy_rate": float(row[4]),
                "total_available_spots": row[5]
            })

        return {
            "status": "SUCCEEDED",
            "data": data,
            "message": "Popular class types retrieved successfully"
        }
    except Exception as e:
        return handle_error(e, context="get_popular_class_types")