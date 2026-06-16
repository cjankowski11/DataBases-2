import pytest
from httpx import AsyncClient
from app.models import Address


@pytest.mark.integration
@pytest.mark.asyncio
async def test_smoke(async_client: AsyncClient):
    response = await async_client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Gym API is running"}



@pytest.mark.integration
@pytest.mark.asyncio
async def test_get_clients_empty_or_all(async_client: AsyncClient):
    response = await async_client.get("/clients/")
    assert response.status_code == 200
    json_resp = response.json()
    assert json_resp["status"] == "SUCCEEDED"
    assert isinstance(json_resp["data"], list)

@pytest.mark.integration
@pytest.mark.asyncio
async def test_create_client(async_client: AsyncClient):
    payload = {
        "name": "Integration",
        "surname": "Tester",
        "email": "integration@tester.com",
        "phone": "987654321"
    }
    response = await async_client.post("/clients/", json=payload)
    assert response.status_code == 201
    data = response.json()["data"]
    assert data["name"] == "Integration"
    assert "client_id" in data

    client_id = data["client_id"]

    # Test GET by ID
    get_response = await async_client.get(f"/clients/{client_id}")
    assert get_response.status_code == 200
    assert get_response.json()["data"]["name"] == "Integration"

    # Test Delete
    del_res = await async_client.delete(f"/clients/{client_id}")
    assert del_res.status_code == 200

@pytest.mark.integration
@pytest.mark.asyncio
async def test_update_client(async_client: AsyncClient):
    payload = {
        "name": "Update",
        "surname": "Tester",
        "email": "update@tester.com",
        "phone": "123123123"
    }
    create_res = await async_client.post("/clients/", json=payload)
    client_id = create_res.json()["data"]["client_id"]

    update_res = await async_client.patch(f"/clients/{client_id}", json={"name": "UpdatedName"})
    assert update_res.status_code == 200
    assert update_res.json()["data"]["name"] == "UpdatedName"

    # Clean up
    await async_client.delete(f"/clients/{client_id}")

@pytest.mark.integration
@pytest.mark.asyncio
async def test_get_nonexistent_client(async_client: AsyncClient):
    response = await async_client.get("/clients/999999")
    assert response.status_code == 404
    assert response.json()["status"] == "FAILED"



@pytest.mark.integration
@pytest.mark.asyncio
async def test_get_gyms(async_client: AsyncClient):
    response = await async_client.get("/gyms/")
    assert response.status_code == 200
    json_resp = response.json()
    assert json_resp["status"] == "SUCCEEDED"
    assert isinstance(json_resp["data"], list)

@pytest.mark.integration
@pytest.mark.asyncio
async def test_create_and_delete_gym(async_client: AsyncClient, db_session):
    new_addr = Address(
        city="Pruszkow",
        street="Test St",
        building_number=1,
        postal_code="00-000"
    )
    db_session.add(new_addr)
    await db_session.commit()
    await db_session.refresh(new_addr)

    # Create gym using the API
    payload = {
        "name": "Integration Gym",
        "established": "2024-01-01",
        "address_id": new_addr.address_id
    }
    response = await async_client.post("/gyms/", json=payload)

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["name"] == "Integration Gym"
    assert data["address"]["city"] == "Pruszkow"
    gym_id = data["gym_id"]

    # Get gym by id
    get_response = await async_client.get(f"/gyms/{gym_id}")
    assert get_response.status_code == 200
    assert get_response.json()["data"]["name"] == "Integration Gym"

    # Delete the gym via API
    del_response = await async_client.delete(f"/gyms/{gym_id}")
    assert del_response.status_code == 200

    # Clean up address manually
    await db_session.delete(new_addr)
    await db_session.commit()

@pytest.mark.integration
@pytest.mark.asyncio
async def test_get_nonexistent_gym(async_client: AsyncClient):
    response = await async_client.get("/gyms/999999")
    assert response.status_code == 404
    assert response.json()["status"] == "FAILED"

@pytest.mark.integration
@pytest.mark.asyncio
async def test_update_gym(async_client: AsyncClient, db_session):
    new_addr = Address(
        city="Update City",
        street="Update St",
        building_number=2,
        postal_code="11-111"
    )
    db_session.add(new_addr)
    await db_session.commit()
    await db_session.refresh(new_addr)

    payload = {
        "name": "To Update Gym",
        "established": "2024-01-01",
        "address_id": new_addr.address_id
    }
    create_res = await async_client.post("/gyms/", json=payload)
    gym_id = create_res.json()["data"]["gym_id"]

    update_payload = {"name": "Updated Gym Name"}
    patch_res = await async_client.patch(f"/gyms/{gym_id}", json=update_payload)

    assert patch_res.status_code == 200
    assert patch_res.json()["data"]["name"] == "Updated Gym Name"

    # Clean up
    await async_client.delete(f"/gyms/{gym_id}")
    await db_session.delete(new_addr)
    await db_session.commit()


@pytest.mark.integration
@pytest.mark.asyncio
async def test_create_and_delete_article(async_client: AsyncClient):
    payload = {
        "name": "Integration Test Article",
        "price": 10.5,
        "type": "Supplement",
        "stock": 100
    }
    create_res = await async_client.post("/articles/", json=payload)
    assert create_res.status_code == 201

    article_id = create_res.json()["data"]["article_id"]

    del_res = await async_client.delete(f"/articles/{article_id}")
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "SUCCEEDED"

    # Verify deletion
    get_res = await async_client.get(f"/articles/{article_id}")
    assert get_res.status_code == 404

@pytest.mark.integration
@pytest.mark.asyncio
async def test_create_and_delete_class_type(async_client: AsyncClient):
    payload = {
        "name": "Integration Yoga",
        "difficulty": 2
    }
    create_res = await async_client.post("/class_types/", json=payload)
    assert create_res.status_code == 201

    class_type_id = create_res.json()["data"]["class_type_id"]

    del_res = await async_client.delete(f"/class_types/{class_type_id}")
    assert del_res.status_code == 200

    get_res = await async_client.get(f"/class_types/{class_type_id}")
    assert get_res.status_code == 404

@pytest.mark.integration
@pytest.mark.asyncio
async def test_create_and_delete_sponsor(async_client: AsyncClient):
    payload = {
        "name": "Integration Sponsor"
    }
    create_res = await async_client.post("/sponsors/", json=payload)
    assert create_res.status_code == 200

    sponsor_id = create_res.json()["data"]["sponsor_id"]

    del_res = await async_client.delete(f"/sponsors/{sponsor_id}")
    assert del_res.status_code == 200

    get_res = await async_client.get(f"/sponsors/{sponsor_id}")
    assert get_res.status_code == 404

@pytest.mark.integration
@pytest.mark.asyncio
async def test_create_and_delete_subscription(async_client: AsyncClient):
    payload = {
        "name": "Integration Monthly",
        "price": "100.00",
        "duration": 30
    }
    create_res = await async_client.post("/subscriptions/", json=payload)
    assert create_res.status_code == 201

    subscription_id = create_res.json()["data"]["subscription_id"]

    del_res = await async_client.delete(f"/subscriptions/{subscription_id}")
    assert del_res.status_code == 200

    get_res = await async_client.get(f"/subscriptions/{subscription_id}")
    assert get_res.status_code == 404

@pytest.mark.integration
@pytest.mark.asyncio
async def test_create_and_delete_address(async_client: AsyncClient):
    payload = {
        "city": "Integration City",
        "street": "Integration St",
        "building_number": 42,
        "postal_code": "00-000"
    }
    create_res = await async_client.post("/addresses/", json=payload)
    assert create_res.status_code == 200

    address_id = create_res.json()["data"]["address_id"]

    del_res = await async_client.delete(f"/addresses/{address_id}")
    assert del_res.status_code == 200

    get_res = await async_client.get(f"/addresses/{address_id}")
    assert get_res.status_code == 404


DELETE_ENDPOINTS = [
    "/addresses/999999",
    "/articles/999999",
    "/classes/999999",
    "/class_types/999999",
    "/registrations/999999",
    "/contracts/999999",
    "/employees/999999",
    "/entries/999999",
    "/equipment/999999",
    "/personaltrainings/999999",
    "/rooms/999999",
    "/sponsors/999999",
    "/stocktakings/999999",
    "/subscriptions/999999",
    "/subscriptions/client-subscriptions/999999",
    "/transactions/999999",
]

@pytest.mark.integration
@pytest.mark.asyncio
@pytest.mark.parametrize("endpoint", DELETE_ENDPOINTS)
async def test_delete_nonexistent_returns_404(async_client: AsyncClient, endpoint: str):
    """
    Checking DELETE on non existing ID, should return 404
    """
    response = await async_client.delete(endpoint)
    assert response.status_code == 404
    assert response.json()["status"] == "FAILED"

@pytest.mark.integration
@pytest.mark.asyncio
async def test_delete_nonexistent_gym_employment(async_client: AsyncClient):
    response = await async_client.delete("/gym-employments/?gym_id=999999&employee_id=999999")
    assert response.status_code == 404
    assert response.json()["status"] == "FAILED"