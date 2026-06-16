import pytest
import json
from datetime import date, timedelta
from unittest.mock import AsyncMock, MagicMock
from fastapi import HTTPException
from pydantic import ValidationError, BaseModel
from sqlalchemy.exc import SQLAlchemyError

from app.schemas import EmployeeCreate, ClientSchema
from app.utils.error_handle import handle_error, NotFoundError, BadRequestError



@pytest.mark.unit
def test_employee_create_empty_birth_date():
    employee = EmployeeCreate(
        name="Jan",
        surname="Kowalski",
        gender="M",
        date_employed=date.today(),
        employee_type="employee",
        birth_date=""
    )
    assert employee.birth_date is None

@pytest.mark.unit
def test_employee_create_valid_birth_date():
    valid_date = date.today() - timedelta(days=365*20)
    employee = EmployeeCreate(
        name="Jan",
        surname="Kowalski",
        gender="M",
        date_employed=date.today(),
        employee_type="employee",
        birth_date=valid_date
    )
    assert employee.birth_date == valid_date

# Error Handler Tests

@pytest.mark.unit
def test_handle_error_not_found():
    exception = NotFoundError(resource="Client", id=999)
    response = handle_error(exception, context="test")

    assert response.status_code == 404
    body = json.loads(response.body)
    assert body["status"] == "FAILED"
    assert "Client with id 999 not found" in body["message"]

@pytest.mark.unit
def test_handle_error_bad_request():
    exception = BadRequestError(message="Invalid parameters")
    response = handle_error(exception, context="test")

    assert response.status_code == 400
    body = json.loads(response.body)
    assert body["status"] == "FAILED"
    assert "Invalid parameters" in body["message"]

@pytest.mark.unit
def test_handle_error_http_exception():
    exception = HTTPException(status_code=418, detail="I'm a teapot")
    response = handle_error(exception, context="test")

    assert response.status_code == 418
    body = json.loads(response.body)
    assert body["status"] == "FAILED"
    assert "I'm a teapot" in body["message"]

@pytest.mark.unit
def test_handle_error_validation_error():
    class DummyModel(BaseModel):
        num: int

    try:
        DummyModel(num="not-a-number")
    except ValidationError as e:
        response = handle_error(e, context="test")

    assert response.status_code == 422
    body = json.loads(response.body)
    assert body["status"] == "FAILED"
    assert "Data validation error" in body["message"]

@pytest.mark.unit
def test_handle_error_sqlalchemy_class_registration_fk():
    # Mocking orig which contains the specific db error string
    mock_orig = MagicMock()
    mock_orig.__str__.return_value = "violates foreign key constraint on table class_registration"

    exception = SQLAlchemyError(None, None, mock_orig)
    exception.orig = mock_orig

    response = handle_error(exception, context="test")
    assert response.status_code == 409
    body = json.loads(response.body)
    assert "active client registrations" in body["message"]

@pytest.mark.unit
def test_handle_error_sqlalchemy_generic_fk():
    mock_orig = MagicMock()
    mock_orig.__str__.return_value = "violates foreign key constraint"

    exception = SQLAlchemyError(None, None, mock_orig)
    exception.orig = mock_orig

    response = handle_error(exception, context="test")
    assert response.status_code == 409
    body = json.loads(response.body)
    assert "referenced by other data" in body["message"]

@pytest.mark.unit
def test_handle_error_sqlalchemy_class_full():
    mock_orig = MagicMock()
    mock_orig.__str__.return_value = "Trigger error: Class is full!"

    exception = SQLAlchemyError(None, None, mock_orig)
    exception.orig = mock_orig

    response = handle_error(exception, context="test")
    assert response.status_code == 409
    body = json.loads(response.body)
    assert "maximum capacity" in body["message"]

@pytest.mark.unit
def test_handle_error_sqlalchemy_no_subscription():
    mock_orig = MagicMock()
    mock_orig.__str__.return_value = "Client has no active paid subscription"

    exception = SQLAlchemyError(None, None, mock_orig)
    exception.orig = mock_orig

    response = handle_error(exception, context="test")
    assert response.status_code == 403
    body = json.loads(response.body)
    assert "active paid subscription" in body["message"]

@pytest.mark.unit
def test_handle_error_sqlalchemy_gym_closed():
    mock_orig = MagicMock()
    mock_orig.__str__.return_value = "Entry is outside gym opening hours"

    exception = SQLAlchemyError(None, None, mock_orig)
    exception.orig = mock_orig

    response = handle_error(exception, context="test")
    assert response.status_code == 403
    body = json.loads(response.body)
    assert "closed during these hours" in body["message"]

@pytest.mark.unit
def test_handle_error_sqlalchemy_generic():
    mock_orig = MagicMock()
    mock_orig.__str__.return_value = "Some unknown database explosion"

    exception = SQLAlchemyError(None, None, mock_orig)
    exception.orig = mock_orig

    response = handle_error(exception, context="test")
    assert response.status_code == 503
    body = json.loads(response.body)
    assert "Database error" in body["message"]

@pytest.mark.unit
def test_handle_error_unexpected_exception():
    exception = Exception("Division by zero or something")
    response = handle_error(exception, context="test")

    assert response.status_code == 500
    body = json.loads(response.body)
    assert "unexpected error" in body["message"]

# Endpoint logic mock testing

@pytest.mark.asyncio
@pytest.mark.unit
async def test_mock_db_fixture(mock_db):
    mock_db.get.return_value = "Mocked Object"

    result = await mock_db.get()
    assert result == "Mocked Object"
    mock_db.get.assert_called_once()

@pytest.mark.asyncio
@pytest.mark.unit
async def test_get_clients_mocked_db(mock_db):
    from app.routers.clients import get_clients
    from app.models import Client

    # Create a dummy client object
    mock_client = Client(
        client_id=1,
        name="Test",
        surname="Mock",
        email="test@mock.com",
        phone="123456789",
        birth_date=None
    )

    # Setup mock chain for SQLAlchemy: db.execute(query).scalars().all()
    mock_scalars = MagicMock()
    mock_scalars.all.return_value = [mock_client]

    mock_result = MagicMock()
    mock_result.scalars.return_value = mock_scalars

    # Tell mock_db to return our mock result when execute is called
    mock_db.execute = AsyncMock(return_value=mock_result)

    # Call the router function directly
    response = await get_clients(db=mock_db, name=None, surname=None, email=None)

    assert response["status"] == "SUCCEEDED"
    assert response["message"] == "Clients retrieved successfully"
    assert len(response["data"]) == 1
    assert response["data"][0].name == "Test"
    assert response["data"][0].email == "test@mock.com"

    mock_db.execute.assert_called_once()