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


# 1. Aplikacje zajęć sportowych
@pytest.mark.integration
@pytest.mark.asyncio
async def test_create_and_delete_class_room_and_registration(async_client: AsyncClient):
    addr_payload = {
        "city": "Class City",
        "street": "Class St",
        "building_number": 1,
        "postal_code": "00-000"
    }
    addr_res = await async_client.post("/addresses/", json=addr_payload)
    assert addr_res.status_code == 200
    address_id = addr_res.json()["data"]["address_id"]

    gym_payload = {
        "name": "Class Gym",
        "established": "2024-01-01",
        "address_id": address_id
    }
    gym_res = await async_client.post("/gyms/", json=gym_payload)
    gym_id = gym_res.json()["data"]["gym_id"]

    room_payload = {
        "name": "Yoga Room",
        "gym_id": gym_id
    }
    room_res = await async_client.post("/rooms/", json=room_payload)
    assert room_res.status_code == 201
    room_id = room_res.json()["data"]["room_id"]

    ct_payload = {
        "name": "Advanced Yoga",
        "difficulty": 3
    }
    ct_res = await async_client.post("/class_types/", json=ct_payload)
    assert ct_res.status_code == 201
    class_type_id = ct_res.json()["data"]["class_type_id"]

    class_payload = {
        "class_date": "2027-01-01",
        "class_type_id": class_type_id,
        "duration": 60,
        "capacity": 20,
        "room_id": room_id
    }
    cls_res = await async_client.post("/classes/", json=class_payload)
    assert cls_res.status_code == 201
    class_id = cls_res.json()["data"]["class_id"]

    client_payload = {
        "name": "Class",
        "surname": "Client",
        "email": "class@client.com",
        "phone": "111222333"
    }
    client_res = await async_client.post("/clients/", json=client_payload)
    client_id = client_res.json()["data"]["client_id"]

    reg_payload = {
        "client_id": client_id,
        "class_id": class_id,
        "registration_date": "2024-12-01"
    }
    reg_res = await async_client.post("/registrations/", json=reg_payload)
    assert reg_res.status_code == 201
    reg_id = reg_res.json()["data"]["class_registration_id"]

    del_reg = await async_client.delete(f"/registrations/{reg_id}")
    assert del_reg.status_code == 200

    del_client = await async_client.delete(f"/clients/{client_id}")
    assert del_client.status_code == 200

    del_cls = await async_client.delete(f"/classes/{class_id}")
    assert del_cls.status_code == 200

    del_ct = await async_client.delete(f"/class_types/{class_type_id}")
    assert del_ct.status_code == 200

    del_room = await async_client.delete(f"/rooms/{room_id}")
    assert del_room.status_code == 200

    del_gym = await async_client.delete(f"/gyms/{gym_id}")
    assert del_gym.status_code == 200

    del_addr = await async_client.delete(f"/addresses/{address_id}")
    assert del_addr.status_code == 200


# 2. Domena Pracowników (Dziedziczenie DB) i GymEmployment
@pytest.mark.integration
@pytest.mark.asyncio
async def test_create_employee_polymorphism_and_employment(async_client: AsyncClient):
    trainer_payload = {
        "name": "John",
        "surname": "Trainer",
        "gender": "M",
        "date_employed": "2024-01-01",
        "specialization": "Bodybuilding",
        "hourly_wage": "50.0"
    }
    trainer_res = await async_client.post("/employees/trainers", json=trainer_payload)
    assert trainer_res.status_code == 200
    trainer_data = trainer_res.json()["data"]
    assert trainer_data["employee_type"] == "trainer"
    assert trainer_data["specialization"] == "Bodybuilding"
    trainer_id = trainer_data["employee_id"]

    rec_payload = {
        "name": "Jane",
        "surname": "Receptionist",
        "gender": "F",
        "date_employed": "2024-01-01",
        "shift": "Morning"
    }
    rec_res = await async_client.post("/employees/receptionists", json=rec_payload)
    assert rec_res.status_code == 200
    rec_data = rec_res.json()["data"]
    assert rec_data["employee_type"] == "receptionist"
    assert rec_data["shift"] == "Morning"
    rec_id = rec_data["employee_id"]

    addr_payload = {
        "city": "Emp City",
        "street": "Emp St",
        "building_number": 2,
        "postal_code": "00-000"
    }
    addr_res = await async_client.post("/addresses/", json=addr_payload)
    address_id = addr_res.json()["data"]["address_id"]

    gym_payload = {
        "name": "Emp Gym",
        "established": "2024-01-01",
        "address_id": address_id
    }
    gym_res = await async_client.post("/gyms/", json=gym_payload)
    gym_id = gym_res.json()["data"]["gym_id"]

    emp1_payload = {
        "gym_id": gym_id,
        "employee_id": trainer_id
    }
    emp1_res = await async_client.post("/gym-employments/", json=emp1_payload)
    assert emp1_res.status_code == 201

    emp2_payload = {
        "gym_id": gym_id,
        "employee_id": rec_id
    }
    emp2_res = await async_client.post("/gym-employments/", json=emp2_payload)
    assert emp2_res.status_code == 201

    get_trainer = await async_client.get(f"/employees/{trainer_id}")
    assert get_trainer.status_code == 200
    assert get_trainer.json()["data"]["specialization"] == "Bodybuilding"

    get_rec = await async_client.get(f"/employees/{rec_id}")
    assert get_rec.status_code == 200
    assert get_rec.json()["data"]["shift"] == "Morning"

    del_emp1 = await async_client.delete(f"/gym-employments/?gym_id={gym_id}&employee_id={trainer_id}")
    assert del_emp1.status_code == 200
    del_emp2 = await async_client.delete(f"/gym-employments/?gym_id={gym_id}&employee_id={rec_id}")
    assert del_emp2.status_code == 200

    del_trainer = await async_client.delete(f"/employees/{trainer_id}")
    assert del_trainer.status_code == 200
    del_rec = await async_client.delete(f"/employees/{rec_id}")
    assert del_rec.status_code == 200

    await async_client.delete(f"/gyms/{gym_id}")
    await async_client.delete(f"/addresses/{address_id}")


# 3. Filtrowanie i Paginacja na GET
@pytest.mark.integration
@pytest.mark.asyncio
async def test_get_clients_filtering(async_client: AsyncClient):
    payload = {
        "name": "Jan",
        "surname": "Kowalski",
        "email": "jan.kowalski@test.com",
        "phone": "555666777"
    }
    res = await async_client.post("/clients/", json=payload)
    client_id = res.json()["data"]["client_id"]

    filter_res = await async_client.get("/clients/?surname=Kowalski")
    assert filter_res.status_code == 200
    data = filter_res.json()["data"]
    assert any(c["surname"] == "Kowalski" for c in data)
    assert all("Kowalski" in c["surname"] for c in data)

    await async_client.delete(f"/clients/{client_id}")

@pytest.mark.integration
@pytest.mark.asyncio
async def test_get_gyms_filtering(async_client: AsyncClient):
    addr_payload = {
        "city": "Filter City",
        "street": "Filter St",
        "building_number": 99,
        "postal_code": "99-999"
    }
    addr_res = await async_client.post("/addresses/", json=addr_payload)
    address_id = addr_res.json()["data"]["address_id"]

    gym_payload = {
        "name": "UniqueFilterGymName",
        "established": "2024-01-01",
        "address_id": address_id
    }
    gym_res = await async_client.post("/gyms/", json=gym_payload)
    gym_id = gym_res.json()["data"]["gym_id"]

    filter_res = await async_client.get("/gyms/?city=Filter%20City")
    assert filter_res.status_code == 200
    data = filter_res.json()["data"]
    assert len(data) >= 1
    assert any(gym["name"] == "UniqueFilterGymName" for gym in data)

    await async_client.delete(f"/gyms/{gym_id}")
    await async_client.delete(f"/addresses/{address_id}")


# 4. Weryfikacja "Read" dla Equipment
@pytest.mark.integration
@pytest.mark.asyncio
async def test_equipment_polymorphism_read(async_client: AsyncClient):
    weight_payload = {
        "serial_number": 11111,
        "producer": "WeightsCo",
        "name": "Dumbbell 20kg",
        "state": "New",
        "date_bought": "2024-01-01",
        "date_produced": "2023-01-01",
        "price": 50.0,
        "equipment_type": "weight",
        "weight": 20.0,
        "type": "Dumbbell",
        "material": "Iron"
    }
    w_res = await async_client.post("/equipment/weights", json=weight_payload)
    assert w_res.status_code == 201
    weight_id = w_res.json()["data"]["equipment_id"]

    machine_payload = {
        "serial_number": 22222,
        "producer": "MachinesCo",
        "name": "Leg Press",
        "state": "Good",
        "date_bought": "2024-01-01",
        "date_produced": "2023-01-01",
        "price": 1500.0,
        "equipment_type": "machine",
        "max_weight": 200,
        "bodypart_target": "Legs"
    }
    m_res = await async_client.post("/equipment/machines", json=machine_payload)
    assert m_res.status_code == 201
    machine_id = m_res.json()["data"]["equipment_id"]

    get_res = await async_client.get("/equipment/")
    assert get_res.status_code == 200
    data = get_res.json()["data"]

    weight_item = next((item for item in data if item["equipment_id"] == weight_id), None)
    machine_item = next((item for item in data if item["equipment_id"] == machine_id), None)

    assert weight_item is not None
    assert weight_item["equipment_type"] == "weight"
    assert float(weight_item["weight"]) == 20.0
    assert weight_item["material"] == "Iron"

    assert machine_item is not None
    assert machine_item["equipment_type"] == "machine"
    assert int(machine_item["max_weight"]) == 200
    assert machine_item["bodypart_target"] == "Legs"

    del_w = await async_client.delete(f"/equipment/{weight_id}")
    assert del_w.status_code == 200
    del_m = await async_client.delete(f"/equipment/{machine_id}")
    assert del_m.status_code == 200

@pytest.mark.integration
@pytest.mark.asyncio
async def test_gym_opening_hours_enforcement(async_client: AsyncClient):
    addr_payload = {
        "city": "Warszawa",
        "street": "Marszałkowska",
        "building_number": 10,
        "postal_code": "00-001"
    }
    addr_res = await async_client.post("/addresses/", json=addr_payload)
    assert addr_res.status_code == 200
    address_id = addr_res.json()["data"]["address_id"]

    gym_payload = {
        "name": "Trigger Test Gym",
        "established": "2026-01-01",
        "email": "gym@test.com",
        "phone": "123456789",
        "area": 500,
        "open_hour": "06:00:00",
        "close_hour": "22:00:00",
        "address_id": address_id
    }
    gym_res = await async_client.post("/gyms/", json=gym_payload)
    assert gym_res.status_code == 200
    gym_id = gym_res.json()["data"]["gym_id"]

    client_res = await async_client.post("/clients/", json={
        "name": "Jan",
        "surname": "Kowalski",
        "email": "jan.hours@example.com",
        "phone": "987654321",
        "birth_date": "1990-01-01"
    })
    client_id = client_res.json()["data"]["client_id"]

    sub_type_res = await async_client.post("/subscriptions/", json={
        "name": "Standard Pass",
        "price": 150.00,
        "duration": 30
    })
    subscription_id = sub_type_res.json()["data"]["subscription_id"]

    sub_payload = {
        "client_id": client_id,
        "subscription_id": subscription_id,
        "transaction_date": "2026-06-18",
        "paid_now": "Y",
        "expiration_date": "2026-07-18"
    }
    await async_client.post("/client-subscriptions/", json=sub_payload)

    entry_payload = {
        "client_id": client_id,
        "gym_id": gym_id,
        "entry_time": "2026-06-18T03:00:00"
    }
    entry_res = await async_client.post("/entries/", json=entry_payload)

    assert entry_res.status_code == 403
    assert entry_res.json()["message"] == "Gym is closed during these hours."


@pytest.mark.integration
@pytest.mark.asyncio
async def test_class_capacity_overbooking(async_client: AsyncClient):
    addr_payload = {
        "city": "Warszawa",
        "street": "Marszałkowska",
        "building_number": 10,
        "postal_code": "00-001"
    }
    addr_res = await async_client.post("/addresses/", json=addr_payload)
    assert addr_res.status_code == 200
    address_id = addr_res.json()["data"]["address_id"]

    gym_payload = {
        "name": "Trigger Test Gym",
        "established": "2026-01-01",
        "address_id": address_id
    }
    gym_res = await async_client.post("/gyms/", json=gym_payload)
    assert gym_res.status_code == 200
    gym_id = gym_res.json()["data"]["gym_id"]

    room_payload = {"gym_id": gym_id, "name": "Room A"}
    room_res = await async_client.post("/rooms/", json=room_payload)
    assert room_res.status_code == 201
    room_id = room_res.json()["data"]["room_id"]

    type_payload = {"name": "Yoga", "difficulty": 2}
    type_res = await async_client.post("/class_types/", json=type_payload)
    assert type_res.status_code == 201
    class_type_id = type_res.json()["data"]["class_type_id"]

    class_payload = {
        "class_date": "2026-06-20",
        "class_type_id": class_type_id,
        "duration": 60,
        "capacity": 2,
        "room_id": room_id
    }
    class_res = await async_client.post("/classes/", json=class_payload)
    assert class_res.status_code == 201
    class_id = class_res.json()["data"]["class_id"]

    client_ids = []
    for i in range(3):
        res = await async_client.post("/clients/", json={
            "name": f"User{i}",
            "surname": "Test",
            "email": f"capacity.{i}@test.com",
            "phone": "000000000"
        })
        client_ids.append(res.json()["data"]["client_id"])

    res1 = await async_client.post("/registrations/", json={
        "client_id": client_ids[0], "class_id": class_id, "registration_date": "2026-06-18"
    })
    assert res1.status_code == 201

    res2 = await async_client.post("/registrations/", json={
        "client_id": client_ids[1], "class_id": class_id, "registration_date": "2026-06-18"
    })
    assert res2.status_code == 201

    res3 = await async_client.post("/registrations/", json={
        "client_id": client_ids[2], "class_id": class_id, "registration_date": "2026-06-18"
    })

    assert res3.status_code == 409
    assert res3.json()["message"] == "Cannot register: The class has already reached its maximum capacity."


@pytest.mark.integration
@pytest.mark.asyncio
async def test_expired_subscription_blocks_entry(async_client: AsyncClient):
    client_res = await async_client.post("/clients/", json={
        "name": "Tomasz",
        "surname": "Bramka",
        "email": "tomasz.expired@example.com",
        "phone": "555666777"
    })
    client_id = client_res.json()["data"]["client_id"]

    sub_type_res = await async_client.post("/subscriptions/", json={
        "name": "Expired Pass Base", "price": 100.00, "duration": 30
    })
    subscription_id = sub_type_res.json()["data"]["subscription_id"]

    sub_payload = {
        "client_id": client_id,
        "subscription_id": subscription_id,
        "employee_id": 1,
        "transaction_date": "2026-05-17",
        "paid_now": "Y",
        "expiration_date": "2026-06-17"
    }
    await async_client.post("/client-subscriptions/", json=sub_payload)

    entry_payload = {
        "client_id": client_id,
        "gym_id": 1,
        "entry_time": "2026-06-18T10:00:00"
    }
    entry_res = await async_client.post("/entries/", json=entry_payload)

    assert entry_res.status_code == 403
    assert entry_res.json()["message"] == "Client does not have an active paid subscription."


@pytest.mark.integration
@pytest.mark.asyncio
async def test_financial_transaction_and_stock_flow(async_client: AsyncClient):
    article_payload = {
        "name": "Baton Proteinowy",
        "price": 10.00,
        "type": "Snack",
        "stock": 10
    }
    article_res = await async_client.post("/articles/", json=article_payload)
    assert article_res.status_code == 201
    article_id = article_res.json()["data"]["article_id"]

    client_res = await async_client.post("/clients/", json={
        "name": "Anna",
        "surname": "Zakupy",
        "email": "anna.shop@example.com",
        "phone": "444555666"
    })
    assert client_res.status_code == 201
    client_id = client_res.json()["data"]["client_id"]

    recept_payload = {
        "name": "John",
        "surname": "Receptionist",
        "gender": "M",
        "date_employed": "2024-01-01",
        "shift": "night"
    }
    recept_res = await async_client.post("/employees/receptionists", json=recept_payload)
    assert recept_res.status_code == 200
    recept_id = recept_res.json()["data"]["employee_id"]

    tx_client_payload = {
        "client_id": client_id,
        "receptionist_employee_id": recept_id,
        "transaction_date": "2026-06-18",
        "articles": [
            {
                "article_id": article_id,
                "quantity": 3
            }
        ]
    }
    tx_res = await async_client.post("/transactions/", json=tx_client_payload)
    assert tx_res.status_code == 201

    get_article_res = await async_client.get(f"/articles/{article_id}")
    assert get_article_res.status_code == 200
    assert get_article_res.json()["data"]["stock"] == 7

    spent_res = await async_client.get(f"/clients/{client_id}/total_spent")
    assert spent_res.status_code == 200
    assert float(spent_res.json()["data"]) == 30.00

@pytest.mark.integration
@pytest.mark.asyncio
async def test_trigger_restore_stock_on_delete(async_client: AsyncClient):
    recept_payload = {
        "name": "John",
        "surname": "Receptionist",
        "gender": "M",
        "date_employed": "2024-01-01",
        "shift": "night"
    }
    recept_res = await async_client.post("/employees/receptionists", json=recept_payload)
    assert recept_res.status_code == 200
    recept_id = recept_res.json()["data"]["employee_id"]

    article_res = await async_client.post("/articles/", json={
        "name": "Baton Testowy", "price": 10.00, "type": "Snack", "stock": 10
    })
    assert article_res.status_code == 201
    article_id = article_res.json()["data"]["article_id"]

    client_res = await async_client.post("/clients/", json={
        "name": "Jan", "surname": "Kupiec", "email": "jan.delete@test.com", "phone": "111222333"
    })
    assert client_res.status_code == 201
    client_id = client_res.json()["data"]["client_id"]

    tx_payload = {
        "client_id": client_id,
        "receptionist_employee_id": recept_id,
        "transaction_date": "2026-06-18",
        "articles": [{"article_id": article_id, "quantity": 3}]
    }
    tx_res = await async_client.post("/transactions/", json=tx_payload)
    assert tx_res.status_code == 201
    tx_id = tx_res.json()["data"]["transaction_client_id"]

    check_article = await async_client.get(f"/articles/{article_id}")
    assert check_article.status_code == 200
    assert check_article.json()["data"]["stock"] == 7

    patch_payload = {"articles": []}
    del_res = await async_client.patch(f"/transactions/{tx_id}", json=patch_payload)
    assert del_res.status_code == 200

    final_article_res = await async_client.get(f"/articles/{article_id}")
    assert final_article_res.status_code == 200
    assert final_article_res.json()["data"]["stock"] == 10


@pytest.mark.integration
@pytest.mark.asyncio
async def test_trigger_update_stock_quantity_change(async_client: AsyncClient):
    recept_payload = {
        "name": "John",
        "surname": "Receptionist",
        "gender": "M",
        "date_employed": "2024-01-01",
        "shift": "night"
    }
    recept_res = await async_client.post("/employees/receptionists", json=recept_payload)
    assert recept_res.status_code == 200
    recept_id = recept_res.json()["data"]["employee_id"]

    article_res = await async_client.post("/articles/", json={
        "name": "Woda", "price": 4.00, "type": "Drink", "stock": 10
    })
    assert article_res.status_code == 201
    article_id = article_res.json()["data"]["article_id"]

    client_res = await async_client.post("/clients/", json={
        "name": "Marek", "surname": "Woda", "email": "marek.woda@test.com", "phone": "000111222"
    })
    assert client_res.status_code == 201
    client_id = client_res.json()["data"]["client_id"]

    tx_payload = {
        "client_id": client_id,
        "receptionist_employee_id": recept_id,
        "transaction_date": "2026-06-18",
        "articles": [{"article_id": article_id, "quantity": 3}]
    }
    tx_res = await async_client.post("/transactions/", json=tx_payload)
    assert tx_res.status_code == 201
    tx_id = tx_res.json()["data"]["transaction_client_id"]

    update_payload = {"articles": [{"article_id": article_id, "quantity": 1}]}
    upd_res = await async_client.patch(f"/transactions/{tx_id}", json=update_payload)
    assert upd_res.status_code == 200

    article_check = await async_client.get(f"/articles/{article_id}")
    assert article_check.status_code == 200
    assert article_check.json()["data"]["stock"] == 9

    bad_update_payload = {"articles": [{"article_id": article_id, "quantity": 50}]}
    bad_upd_res = await async_client.patch(f"/transactions/{tx_id}", json=bad_update_payload)
    assert bad_upd_res.status_code == 503


@pytest.mark.integration
@pytest.mark.asyncio
async def test_trigger_contract_dates_invalid(async_client: AsyncClient):
    addr_payload = {
        "city": "Warszawa",
        "street": "Marszałkowska",
        "building_number": 10,
        "postal_code": "00-001"
    }
    addr_res = await async_client.post("/addresses/", json=addr_payload)
    assert addr_res.status_code == 200
    address_id = addr_res.json()["data"]["address_id"]

    sponsor_res = await async_client.post("/sponsors/", json={
        "name": "Sponsor Krokodyl", "contact_person": "Adam Nowak", "email": "krokodyl@test.com", "phone": "555666777"
    })
    assert sponsor_res.status_code == 200
    sponsor_id = sponsor_res.json()["data"]["sponsor_id"]

    gym_res = await async_client.post("/gyms/", json={
        "name": "Gym Central", "address_id": address_id, "established": "2026-01-01"
    })
    assert gym_res.status_code == 200
    gym_id = gym_res.json()["data"]["gym_id"]

    contract_payload = {
        "sponsor_id": sponsor_id,
        "gym_id": gym_id,
        "contract_date": "2026-06-18",
        "expiration_date": "2026-06-10",
        "amount": 5000.00
    }

    response = await async_client.post("/contracts/", json=contract_payload)
    assert response.status_code in [422]


@pytest.mark.integration
@pytest.mark.asyncio
async def test_contract_overlapping_dates_error(async_client: AsyncClient):
    addr_payload = {
        "city": "Warszawa",
        "street": "Marszałkowska",
        "building_number": 10,
        "postal_code": "00-001"
    }
    addr_res = await async_client.post("/addresses/", json=addr_payload)
    assert addr_res.status_code == 200
    address_id = addr_res.json()["data"]["address_id"]

    sponsor_res = await async_client.post("/sponsors/", json={
        "name": "Sponsor Gepard", "contact_person": "Jan Kowalski", "email": "gepard@test.com", "phone": "888999000"
    })
    assert sponsor_res.status_code == 200
    sponsor_id = sponsor_res.json()["data"]["sponsor_id"]

    gym_res = await async_client.post("/gyms/", json={
        "name": "Gym Północ", "address_id": address_id, "established": "2026-01-01"
    })
    assert gym_res.status_code == 200
    gym_id = gym_res.json()["data"]["gym_id"]

    first_contract = {
        "sponsor_id": sponsor_id,
        "gym_id": gym_id,
        "contract_date": "2026-06-01",
        "expiration_date": "2026-06-30",
        "payment": 3000.00
    }
    setup_res = await async_client.post("/contracts/", json=first_contract)
    assert setup_res.status_code == 200

    overlapping_contract = {
        "sponsor_id": sponsor_id,
        "gym_id": gym_id,
        "contract_date": "2026-06-15",
        "expiration_date": "2026-07-15",
        "payment": 4000.00
    }

    response = await async_client.post("/contracts/", json=overlapping_contract)

    assert response.status_code in [400, 409]


@pytest.mark.integration
@pytest.mark.asyncio
async def test_trigger_duplicate_active_subscriptions(async_client: AsyncClient):
    client_res = await async_client.post("/clients/", json={
        "name": "Anna", "surname": "Kowalska", "email": "anna.sub@test.com", "phone": "666777888"
    })
    assert client_res.status_code == 201
    client_id = client_res.json()["data"]["client_id"]

    sub_res = await async_client.post("/subscriptions/", json={
        "name": "monthly", "price": 150.00, "duration": 30
    })
    assert sub_res.status_code == 201
    subscription_id = sub_res.json()["data"]["subscription_id"]

    first_sub_payload = {
        "client_id": client_id,
        "subscription_id": subscription_id,
        "paid_now": "Y",
        "transaction_date": "2026-06-18",
        "expiration_date": "2026-07-18"
    }
    setup_res = await async_client.post("/subscriptions/client-subscriptions", json=first_sub_payload)
    assert setup_res.status_code == 201

    duplicate_sub_payload = {
        "client_id": client_id,
        "subscription_id": subscription_id,
        "paid_now": "Y",
        "transaction_date": "2026-06-18",
        "expiration_date": "2026-07-18"
    }
    response = await async_client.post("/subscriptions/client-subscriptions", json=duplicate_sub_payload)

    assert response.status_code == 503


@pytest.mark.integration
@pytest.mark.asyncio
async def test_trigger_validate_employee_dates(async_client: AsyncClient):
    emp_payload = {
        "name": "John",
        "surname": "Employes",
        "gender": "M",
        "date_employed": "2024-01-01",
        "birth_date": "2024-01-01"
    }
    emp_res = await async_client.post("/employees/", json=emp_payload)
    assert emp_res.status_code == 503
    

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