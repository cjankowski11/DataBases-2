import pytest
import json
from datetime import date, timedelta
from pydantic import ValidationError

from app.schemas import EmployeeCreate
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
    """
    Testing mapping BadRequestError for request JSON 400.
    """
    exception = BadRequestError(message="Invalid parameters")
    response = handle_error(exception, context="test")

    assert response.status_code == 400
    body = json.loads(response.body)
    assert body["status"] == "FAILED"
    assert "Invalid parameters" in body["message"]

@pytest.mark.asyncio
@pytest.mark.unit
async def test_mock_db_fixture(mock_db):

    
    mock_db.get.return_value = "Mocked Object"

    result = await mock_db.get()
    assert result == "Mocked Object"
    mock_db.get.assert_called_once()
