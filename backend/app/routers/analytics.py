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
    

class FinancialReportResponse(BaseModel):
    year_month: str
    subscription_income: float
    sponsor_income: float
    total_income: float
    salary_costs: float
    net_profit: float


@router.get("/profit", response_model=ApiResponse)
async def get_financial_report(
    start_date: str = Query(..., description="Data początkowa w formacie YYYY-MM-DD", regex=r"^\d{4}-\d{2}-\d{2}$"),
    end_date: str = Query(..., description="Data końcowa w formacie YYYY-MM-DD", regex=r"^\d{4}-\d{2}-\d{2}$"),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Walidacja kolejności dat
        if datetime.strptime(start_date, "%Y-%m-%d") > datetime.strptime(end_date, "%Y-%m-%d"):
            raise BadRequestError("Data początkowa (start_date) nie może być późniejsza niż data końcowa (end_date)")

        start_date_obj = datetime.strptime(start_date, "%Y-%m-%d").date()
        end_date_obj = datetime.strptime(end_date, "%Y-%m-%d").date()

        # Wywołanie funkcji PostgreSQL z przekazaniem obiektów typu date
        result = await db.execute(
            text("SELECT * FROM public.get_financial_report(:start_date, :end_date)"),
            {"start_date": start_date_obj, "end_date": end_date_obj}
        )

        data = []
        for row in result:
            data.append({
                "year_month": row[0],
                "subscription_income": float(row[1]),
                "sponsor_income": float(row[2]),
                "total_income": float(row[3]),
                "salary_costs": float(row[4]),
                "net_profit": float(row[5])
            })

        return {
            "status": "SUCCEEDED",
            "data": data,
            "message": "Financial report generated successfully"
        }
    except BadRequestError as e:
        return handle_error(e, context="get_financial_report")
    except Exception as e:
        return handle_error(e, context="get_financial_report")