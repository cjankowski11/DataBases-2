import pytest
from unittest.mock import AsyncMock, MagicMock
from decimal import Decimal
from datetime import datetime

from app.routers.subscriptions import (
    get_subscriptions, get_subscription, create_subscription,
    update_subscription, delete_subscription
)
from app.routers.entries import (
    get_entries, get_entry, create_entry, update_entry, delete_entry
)
from app.models import Subscription, Entry, Gym, Address, Client
from app.schemas import SubscriptionCreate, SubscriptionUpdate, EntryCreate, EntryUpdate



@pytest.mark.asyncio
@pytest.mark.unit
async def test_get_subscriptions_mocked(mock_db):
    mock_sub = Subscription(
        subscription_id=1,
        name="Premium",
        price=Decimal("150.00"),
        duration=30,
        entry_until=None
    )

    mock_scalars = MagicMock()
    mock_scalars.all.return_value = [mock_sub]
    mock_result = MagicMock()
    mock_result.scalars.return_value = mock_scalars
    mock_db.execute = AsyncMock(return_value=mock_result)

    response = await get_subscriptions(db=mock_db)

    assert response["status"] == "SUCCEEDED"
    assert len(response["data"]) == 1
    assert response["data"][0].name == "Premium"
    mock_db.execute.assert_called_once()


@pytest.mark.asyncio
@pytest.mark.unit
async def test_get_subscription_mocked(mock_db):
    mock_sub = Subscription(
        subscription_id=2,
        name="Basic",
        price=Decimal("50.00"),
        duration=15,
        entry_until=None
    )

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_sub
    mock_db.execute = AsyncMock(return_value=mock_result)

    response = await get_subscription(subscription_id=2, db=mock_db)

    assert response["status"] == "SUCCEEDED"
    assert response["data"].name == "Basic"


@pytest.mark.asyncio
@pytest.mark.unit
async def test_create_subscription_mocked(mock_db):
    payload = SubscriptionCreate(
        name="New Sub",
        price=Decimal("100.00"),
        duration=30
    )

    # When db.refresh is called, manually assign an ID to the object
    async def mock_refresh(obj):
        obj.subscription_id = 3

    mock_db.refresh = AsyncMock(side_effect=mock_refresh)

    response = await create_subscription(payload=payload, db=mock_db)

    assert response["status"] == "SUCCEEDED"
    assert response["data"].name == "New Sub"
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()


@pytest.mark.asyncio
@pytest.mark.unit
async def test_update_subscription_mocked(mock_db):
    mock_sub = Subscription(
        subscription_id=1,
        name="Old Sub",
        price=Decimal("100.00"),
        duration=30
    )
    mock_db.get = AsyncMock(return_value=mock_sub)

    payload = SubscriptionUpdate(name="Updated Sub")

    response = await update_subscription(subscription_id=1, payload=payload, db=mock_db)

    assert response["status"] == "SUCCEEDED"
    assert response["data"].name == "Updated Sub"
    mock_db.commit.assert_called_once()


@pytest.mark.asyncio
@pytest.mark.unit
async def test_delete_subscription_mocked(mock_db):
    mock_sub = Subscription(
        subscription_id=1,
        name="To Delete",
        price=Decimal("100.00"),
        duration=30
    )
    # the router likely queries it via db.execute or db.get
    # depending on implementation, let's mock both.
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_sub
    mock_db.execute = AsyncMock(return_value=mock_result)
    mock_db.get = AsyncMock(return_value=mock_sub)

    response = await delete_subscription(subscription_id=1, db=mock_db)

    assert response["status"] == "SUCCEEDED"
    mock_db.delete.assert_called_once()
    mock_db.commit.assert_called_once()

@pytest.mark.asyncio
@pytest.mark.unit
async def test_get_entries_mocked(mock_db):
    mock_entry = Entry(
        entry_id=1,
        client_id=1,
        gym_id=1,
        entry_time=datetime(2023, 1, 1, 10, 0, 0),
        client=Client(client_id=1, name="John", surname="Doe", email="j@d.com", phone="123"),
        gym=Gym(gym_id=1, name="Fit", established=datetime.now().date(), address_id=1, address=Address(address_id=1, city="C", street="S", building_number=1, postal_code="00"))
    )

    mock_scalars = MagicMock()
    mock_scalars.all.return_value = [mock_entry]
    mock_result = MagicMock()
    mock_result.scalars.return_value = mock_scalars
    mock_db.execute = AsyncMock(return_value=mock_result)

    response = await get_entries(db=mock_db)

    assert response["status"] == "SUCCEEDED"
    assert len(response["data"]) == 1
    assert response["data"][0].client_id == 1
    assert response["data"][0].client.name == "John"


@pytest.mark.asyncio
@pytest.mark.unit
async def test_get_entry_mocked(mock_db):
    mock_entry = Entry(
        entry_id=2,
        client_id=2,
        gym_id=2,
        entry_time=datetime(2023, 1, 1, 10, 0, 0),
        client=Client(client_id=2, name="Jane", surname="Doe", email="jane@d.com", phone="123"),
        gym=Gym(gym_id=2, name="Fit", established=datetime.now().date(), address_id=1, address=Address(address_id=1, city="C", street="S", building_number=1, postal_code="00"))
    )

    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_entry
    mock_db.execute = AsyncMock(return_value=mock_result)

    response = await get_entry(entry_id=2, db=mock_db)

    assert response["status"] == "SUCCEEDED"
    assert response["data"].client_id == 2


@pytest.mark.asyncio
@pytest.mark.unit
async def test_create_entry_mocked(mock_db):
    payload = EntryCreate(
        client_id=3,
        gym_id=3,
        entry_time=datetime(2023, 1, 1, 12, 0, 0)
    )

    # Needs a mock gym for checking if gym exists
    mock_gym = Gym(gym_id=3)
    mock_db.get = AsyncMock(return_value=mock_gym)

    # Needs a mock result for the final full fetch
    mock_full_entry = Entry(
        entry_id=3, client_id=3, gym_id=3, entry_time=payload.entry_time,
        client=Client(client_id=3, name="J", surname="D", email="j@j.com", phone="1"),
        gym=Gym(gym_id=3, name="F", established=datetime.now().date(), address_id=1, address=Address(address_id=1, city="C", street="S", building_number=1, postal_code="00"))
    )
    mock_result = MagicMock()
    mock_result.scalar_one.return_value = mock_full_entry
    mock_db.execute = AsyncMock(return_value=mock_result)

    response = await create_entry(payload=payload, db=mock_db)

    assert response["status"] == "SUCCEEDED"
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()


@pytest.mark.asyncio
@pytest.mark.unit
async def test_update_entry_mocked(mock_db):
    # Mocking initial get for the entry to update
    db_entry = Entry(entry_id=1, client_id=1, gym_id=1, entry_time=datetime(2023, 1, 1, 10, 0, 0))
    mock_db.get = AsyncMock(return_value=db_entry)

    payload = EntryUpdate(client_id=99)

    # Mocking the refresh/full fetch at the end
    mock_full_entry = Entry(
        entry_id=1, client_id=99, gym_id=1, entry_time=datetime(2023, 1, 1, 10, 0, 0),
        client=Client(client_id=99, name="J", surname="D", email="j@j.com", phone="1"),
        gym=Gym(gym_id=1, name="F", established=datetime.now().date(), address_id=1, address=Address(address_id=1, city="C", street="S", building_number=1, postal_code="00"))
    )
    mock_result = MagicMock()
    mock_result.scalar_one.return_value = mock_full_entry
    mock_db.execute = AsyncMock(return_value=mock_result)

    response = await update_entry(entry_id=1, payload=payload, db=mock_db)

    assert response["status"] == "SUCCEEDED"
    assert response["data"].client_id == 99
    mock_db.commit.assert_called_once()


@pytest.mark.asyncio
@pytest.mark.unit
async def test_delete_entry_mocked(mock_db):
    db_entry = Entry(entry_id=1)
    mock_db.get = AsyncMock(return_value=db_entry)

    response = await delete_entry(entry_id=1, db=mock_db)

    assert response["status"] == "SUCCEEDED"
    mock_db.delete.assert_called_once()
    mock_db.commit.assert_called_once()


from app.routers.subscriptions import (
    get_client_subscriptions, get_client_subscription, create_client_subscription,
    update_client_subscription, delete_client_subscription
)
from app.models import ClientSubscription
from app.schemas import ClientSubscriptionCreate, ClientSubscriptionUpdate

@pytest.mark.asyncio
@pytest.mark.unit
async def test_get_client_subscriptions_mocked(mock_db):
    mock_cs = ClientSubscription(
        client_subscription_id=1, client_id=1, subscription_id=1,
        transaction_date=datetime.now().date(), paid_now="Y", expiration_date=datetime.now().date(),
        client=Client(client_id=1, name="J", surname="D", email="j@d.com", phone="1"),
        subscription=Subscription(subscription_id=1, name="P", price=Decimal("1"), duration=30)
    )
    mock_scalars = MagicMock()
    mock_scalars.all.return_value = [mock_cs]
    mock_result = MagicMock()
    mock_result.scalars.return_value = mock_scalars
    mock_db.execute = AsyncMock(return_value=mock_result)

    response = await get_client_subscriptions(db=mock_db)
    assert response["status"] == "SUCCEEDED"
    assert len(response["data"]) == 1
    assert response["data"][0].paid_now == "Y"

@pytest.mark.asyncio
@pytest.mark.unit
async def test_get_client_subscription_mocked(mock_db):
    mock_cs = ClientSubscription(
        client_subscription_id=2, client_id=2, subscription_id=2,
        transaction_date=datetime.now().date(), paid_now="N", expiration_date=datetime.now().date(),
        client=Client(client_id=2, name="J", surname="D", email="j@d.com", phone="1"),
        subscription=Subscription(subscription_id=2, name="P", price=Decimal("1"), duration=30)
    )
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_cs
    mock_db.execute = AsyncMock(return_value=mock_result)

    response = await get_client_subscription(client_subscription_id=2, db=mock_db)
    assert response["status"] == "SUCCEEDED"
    assert response["data"].paid_now == "N"

@pytest.mark.asyncio
@pytest.mark.unit
async def test_create_client_subscription_mocked(mock_db):
    payload = ClientSubscriptionCreate(
        client_id=1, subscription_id=1, transaction_date=datetime.now().date(),
        paid_now="Y", expiration_date=datetime.now().date()
    )

    mock_sub = Subscription(subscription_id=1, name="Sub", price=Decimal("1"), duration=30)
    mock_db.get = AsyncMock(return_value=mock_sub)

    async def mock_refresh(obj):
        obj.client_subscription_id = 3
    mock_db.refresh = AsyncMock(side_effect=mock_refresh)

    mock_full_cs = ClientSubscription(
        client_subscription_id=3, client_id=1, subscription_id=1,
        transaction_date=payload.transaction_date, paid_now="Y", expiration_date=payload.expiration_date,
        client=Client(client_id=1, name="J", surname="D", email="e", phone="1"),
        subscription=mock_sub
    )
    mock_result = MagicMock()
    mock_result.scalar_one.return_value = mock_full_cs
    mock_db.execute = AsyncMock(return_value=mock_result)

    response = await create_client_subscription(payload=payload, db=mock_db)
    assert response["status"] == "SUCCEEDED"
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()

@pytest.mark.asyncio
@pytest.mark.unit
async def test_update_client_subscription_mocked(mock_db):
    db_cs = ClientSubscription(client_subscription_id=1, client_id=1, subscription_id=1, paid_now="Y")
    mock_db.get = AsyncMock(return_value=db_cs)

    payload = ClientSubscriptionUpdate(paid_now="N")

    mock_full_cs = ClientSubscription(
        client_subscription_id=1, client_id=1, subscription_id=1, paid_now="N",
        transaction_date=datetime.now().date(), expiration_date=datetime.now().date(),
        client=Client(client_id=1, name="J", surname="D", email="e", phone="1"),
        subscription=Subscription(subscription_id=1, name="Sub", price=Decimal("1"), duration=30)
    )
    mock_result = MagicMock()
    mock_result.scalar_one.return_value = mock_full_cs
    mock_db.execute = AsyncMock(return_value=mock_result)

    response = await update_client_subscription(client_subscription_id=1, payload=payload, db=mock_db)
    assert response["status"] == "SUCCEEDED"
    assert response["data"].paid_now == "N"
    mock_db.commit.assert_called_once()

@pytest.mark.asyncio
@pytest.mark.unit
async def test_delete_client_subscription_mocked(mock_db):
    db_cs = ClientSubscription(client_subscription_id=1)
    mock_db.get = AsyncMock(return_value=db_cs)

    response = await delete_client_subscription(client_subscription_id=1, db=mock_db)
    assert response["status"] == "SUCCEEDED"
    mock_db.delete.assert_called_once()
    mock_db.commit.assert_called_once()


from app.routers.equipment import (
    get_equipment, get_equipment_item, create_weight, update_weight, delete_equipment
)
from app.models import Weight, Equipment
from app.schemas import WeightCreate, WeightUpdate

@pytest.mark.asyncio
@pytest.mark.unit
async def test_get_equipment_mocked(mock_db):
    mock_w = Weight(
        equipment_id=1, serial_number=123, producer="P", name="W", state="NEW",
        date_bought=datetime.now().date(), date_produced=datetime.now().date(),
        price=Decimal("10"), equipment_type="WEIGHT", weight=Decimal("5"),
        type="D", material="Iron", gym_id=None, gym=None
    )
    mock_scalars = MagicMock()
    mock_scalars.all.return_value = [mock_w]
    mock_result = MagicMock()
    mock_result.scalars.return_value = mock_scalars
    mock_db.execute = AsyncMock(return_value=mock_result)

    response = await get_equipment(db=mock_db)
    assert response["status"] == "SUCCEEDED"
    assert len(response["data"]) == 1
    assert response["data"][0].equipment_type == "WEIGHT"

@pytest.mark.asyncio
@pytest.mark.unit
async def test_get_equipment_item_mocked(mock_db):
    mock_w = Weight(
        equipment_id=2, serial_number=123, producer="P", name="W2", state="NEW",
        date_bought=datetime.now().date(), date_produced=datetime.now().date(),
        price=Decimal("10"), equipment_type="WEIGHT", weight=Decimal("5"),
        type="D", material="Iron", gym_id=None, gym=None
    )
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_w
    mock_db.execute = AsyncMock(return_value=mock_result)

    response = await get_equipment_item(equipment_id=2, db=mock_db)
    assert response["status"] == "SUCCEEDED"
    assert response["data"].name == "W2"

@pytest.mark.asyncio
@pytest.mark.unit
async def test_create_weight_mocked(mock_db):
    payload = WeightCreate(
        serial_number=123, producer="P", name="W3", state="NEW",
        date_bought=datetime.now().date(), date_produced=datetime.now().date(),
        price=Decimal("10"), equipment_type="WEIGHT", weight=Decimal("10"),
        type="Plate", material="Iron", gym_id=None
    )

    async def mock_refresh(obj):
        obj.equipment_id = 3
    mock_db.refresh = AsyncMock(side_effect=mock_refresh)

    mock_full_w = Weight(
        equipment_id=3, serial_number=123, producer="P", name="W3", state="NEW",
        date_bought=payload.date_bought, date_produced=payload.date_produced,
        price=Decimal("10"), equipment_type="WEIGHT", weight=Decimal("10"),
        type="Plate", material="Iron", gym_id=None, gym=None
    )
    mock_result = MagicMock()
    mock_result.scalar_one.return_value = mock_full_w
    mock_db.execute = AsyncMock(return_value=mock_result)

    response = await create_weight(payload=payload, db=mock_db)
    assert response["status"] == "SUCCEEDED"
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()

@pytest.mark.asyncio
@pytest.mark.unit
async def test_update_weight_mocked(mock_db):
    db_w = Weight(equipment_id=1, weight=Decimal("10"))
    mock_db.get = AsyncMock(return_value=db_w)

    payload = WeightUpdate(weight=Decimal("20"))

    mock_full_w = Weight(
        equipment_id=1, serial_number=123, producer="P", name="W3", state="NEW",
        date_bought=datetime.now().date(), date_produced=datetime.now().date(),
        price=Decimal("10"), equipment_type="WEIGHT", weight=Decimal("20"),
        type="Plate", material="Iron", gym_id=None, gym=None
    )
    mock_result = MagicMock()
    mock_result.scalar_one.return_value = mock_full_w
    mock_db.execute = AsyncMock(return_value=mock_result)

    response = await update_weight(equipment_id=1, payload=payload, db=mock_db)
    assert response["status"] == "SUCCEEDED"
    assert response["data"].weight == Decimal("20")
    mock_db.commit.assert_called_once()

@pytest.mark.asyncio
@pytest.mark.unit
async def test_delete_equipment_mocked(mock_db):
    db_eq = Equipment(equipment_id=1)
    mock_db.get = AsyncMock(return_value=db_eq)

    response = await delete_equipment(equipment_id=1, db=mock_db)
    assert response["status"] == "SUCCEEDED"
    mock_db.delete.assert_called_once()
    mock_db.commit.assert_called_once()