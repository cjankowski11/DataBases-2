import pytest
from pydantic import ValidationError
from datetime import date, datetime, time, timedelta
from decimal import Decimal

from app.schemas import (
    AddressCreate, GymCreate, RoomCreate, ClassTypeCreate, ClassCreate, 
    ClassRegistrationCreate, ClientCreate, EmployeeCreate, ReceptionistCreate, 
    TrainerCreate, GymEmployeeCreate, PersonalTrainingCreate, ArticleCreate, 
    StocktakingCreate, TransactionClientCreate, TransactionArticleCreate, 
    SponsorCreate, ContractCreate, SubscriptionCreate, ClientSubscriptionCreate, 
    EntryCreate, EquipmentCreate, WeightCreate, MachineCreate, AccessoryCreate,
    RoomUpdate, ClassTypeUpdate, ClassUpdate, ClientUpdate,
    ClassRegistrationUpdate, EmployeeUpdate, ReceptionistUpdate,
    TrainerUpdate, GymEmployeeUpdate, PersonalTrainingUpdate,
    ArticleUpdate, StocktakingUpdate, TransactionClientUpdate,
    EquipmentUpdate, WeightUpdate, MachineUpdate, AccessoryUpdate,
    EntryUpdate, SubscriptionUpdate, ClientSubscriptionUpdate,
    ContractUpdate, GymUpdate
)

@pytest.mark.unit
def test_address_create_schema():
    addr = AddressCreate(city="Warsaw", street="Main", building_number=10, postal_code="00-001")
    assert addr.city == "Warsaw"
    assert addr.postal_code == "00-001"

@pytest.mark.unit
def test_gym_create_schema():
    gym = GymCreate(
        name="Test Gym",
        established=date(2023, 1, 1),
        address_id=1,
        open_hour=time(6, 0),
        close_hour=time(22, 0)
    )
    assert gym.name == "Test Gym"
    assert gym.address_id == 1
    assert gym.open_hour == time(6, 0)

@pytest.mark.unit
def test_room_create_schema():
    room = RoomCreate(name="Cardio", gym_id=1)
    assert room.name == "Cardio"
    assert room.gym_id == 1

@pytest.mark.unit
def test_class_type_create_schema():
    ct = ClassTypeCreate(name="Yoga", difficulty=2)
    assert ct.name == "Yoga"
    assert ct.difficulty == 2

@pytest.mark.unit
def test_class_create_schema():
    cls = ClassCreate(class_date=date.today(), class_type_id=1, duration=60, capacity=20, room_id=1)
    assert cls.capacity == 20
    assert cls.duration == 60

@pytest.mark.unit
def test_class_registration_create_schema():
    reg = ClassRegistrationCreate(client_id=1, class_id=1, registration_date=date.today())
    assert reg.client_id == 1
    assert reg.class_id == 1

@pytest.mark.unit
def test_client_create_schema_valid():
    client = ClientCreate(name="John", surname="Doe", email="john.doe@example.com", phone="123456789")
    assert client.name == "John"
    assert client.birth_date is None

@pytest.mark.unit
def test_client_create_schema_invalid_date():
    with pytest.raises(ValidationError):
        ClientCreate(name="John", surname="Doe", email="john@example.com", phone="123456789", birth_date="invalid-date")

@pytest.mark.unit
def test_employee_create_schema():
    # Test valid creation and the empty_date_to_none validator
    emp = EmployeeCreate(name="Anna", surname="Nowak", gender="F", date_employed=date.today(), birth_date="")
    assert emp.name == "Anna"
    assert emp.birth_date is None

@pytest.mark.unit
def test_receptionist_create_schema():
    rec = ReceptionistCreate(name="A", surname="B", gender="F", date_employed=date.today(), shift="Morning")
    assert rec.shift == "Morning"
    assert rec.gender == "F"

@pytest.mark.unit
def test_trainer_create_schema():
    tr = TrainerCreate(name="C", surname="D", gender="M", date_employed=date.today(), specialization="Strength", hourly_wage=Decimal("50.0"))
    assert tr.specialization == "Strength"
    assert tr.hourly_wage == Decimal("50.0")

@pytest.mark.unit
def test_gym_employee_create_schema():
    ge = GymEmployeeCreate(gym_id=1, employee_id=1)
    assert ge.gym_id == 1
    assert ge.employee_id == 1

@pytest.mark.unit
def test_personal_training_create_schema():
    pt = PersonalTrainingCreate(client_id=1, trainer_id=1, start_time=datetime.now(), duration=60)
    assert pt.duration == 60
    assert pt.client_id == 1

@pytest.mark.unit
def test_sponsor_create_schema():
    sp = SponsorCreate(name="Nike")
    assert sp.name == "Nike"

@pytest.mark.unit
def test_contract_create_schema():
    c = ContractCreate(gym_id=1, sponsor_id=1, payment=Decimal("1000.00"), contract_date=date.today(), expiration_date=date.today() + timedelta(days=365))
    assert c.payment == Decimal("1000.00")
    assert c.gym_id == 1

@pytest.mark.unit
def test_subscription_create_schema():
    sub = SubscriptionCreate(name="Monthly", price=Decimal("100.00"), duration=30)
    assert sub.duration == 30
    assert sub.name == "Monthly"

@pytest.mark.unit
def test_client_subscription_create_schema():
    cs = ClientSubscriptionCreate(client_id=1, subscription_id=1, transaction_date=date.today(), paid_now="Y", expiration_date=date.today() + timedelta(days=30))
    assert cs.paid_now == "Y"
    assert cs.subscription_id == 1

@pytest.mark.unit
def test_entry_create_schema():
    entry = EntryCreate(client_id=1, gym_id=1, entry_time=datetime.now())
    assert entry.client_id == 1
    assert entry.gym_id == 1

@pytest.mark.unit
def test_article_create_schema():
    art = ArticleCreate(name="Water", price=5.0, type="Drink", stock=100)
    assert art.stock == 100
    assert art.type == "Drink"

@pytest.mark.unit
def test_stocktaking_create_schema():
    st = StocktakingCreate(gym_id=1, stocktaking_date=date.today())
    assert st.gym_id == 1

@pytest.mark.unit
def test_transaction_client_create_schema():
    ta = TransactionArticleCreate(article_id=1, quantity=2)
    tc = TransactionClientCreate(client_id=1, receptionist_employee_id=1, transaction_date=date.today(), articles=[ta])
    assert len(tc.articles) == 1
    assert tc.articles[0].quantity == 2

@pytest.mark.unit
def test_equipment_create_schema():
    eq = EquipmentCreate(
        serial_number=12345, producer="TestProd", name="Barbell", state="NEW", 
        date_bought=date(2023, 5, 1), date_produced=date(2022, 1, 1), 
        price=Decimal("150.50"), equipment_type="WEIGHT"
    )
    assert eq.serial_number == 12345
    assert eq.price == Decimal("150.50")
    assert eq.gym_id is None

@pytest.mark.unit
def test_equipment_subtypes_create_schema():
    w = WeightCreate(serial_number=1, producer="P", name="N", state="NEW", date_bought=date.today(), date_produced=date.today(), price=Decimal("10"), equipment_type="WEIGHT", weight=Decimal("5"), type="Dumbbell", material="Iron")
    assert w.weight == Decimal("5")

    m = MachineCreate(serial_number=2, producer="P", name="N", state="NEW", date_bought=date.today(), date_produced=date.today(), price=Decimal("10"), equipment_type="MACHINE", max_weight=100, bodypart_target="Legs")
    assert m.max_weight == 100

    a = AccessoryCreate(serial_number=3, producer="P", name="N", state="NEW", date_bought=date.today(), date_produced=date.today(), price=Decimal("10"), equipment_type="ACCESSORY", type="Band")
    assert a.type == "Band"

@pytest.mark.unit
def test_room_update_schema():
    upd = RoomUpdate(name="New Name")
    assert upd.name == "New Name"
    assert upd.gym_id is None

@pytest.mark.unit
def test_class_type_update_schema():
    upd = ClassTypeUpdate(difficulty=5)
    assert upd.difficulty == 5
    assert upd.name is None

@pytest.mark.unit
def test_class_update_schema():
    upd = ClassUpdate(duration=90)
    assert upd.duration == 90
    assert upd.capacity is None

@pytest.mark.unit
def test_client_update_schema():
    upd = ClientUpdate(email="new@example.com")
    assert upd.email == "new@example.com"
    assert upd.name is None

@pytest.mark.unit
def test_class_registration_update_schema():
    upd = ClassRegistrationUpdate(class_id=2)
    assert upd.class_id == 2
    assert upd.client_id is None

@pytest.mark.unit
def test_employee_update_schema():
    upd = EmployeeUpdate(is_employed=False)
    assert upd.is_employed is False
    assert upd.name is None

@pytest.mark.unit
def test_receptionist_update_schema():
    upd = ReceptionistUpdate(shift="Night")
    assert upd.shift == "Night"
    assert upd.name is None

@pytest.mark.unit
def test_trainer_update_schema():
    upd = TrainerUpdate(specialization="Yoga")
    assert upd.specialization == "Yoga"
    assert upd.name is None

@pytest.mark.unit
def test_gym_employee_update_schema():
    upd = GymEmployeeUpdate(gym_id=2)
    assert upd.gym_id == 2
    assert upd.employee_id is None

@pytest.mark.unit
def test_personal_training_update_schema():
    upd = PersonalTrainingUpdate(duration=120)
    assert upd.duration == 120
    assert upd.client_id is None

@pytest.mark.unit
def test_article_update_schema():
    upd = ArticleUpdate(price=10.5)
    assert upd.price == 10.5
    assert upd.stock is None

@pytest.mark.unit
def test_stocktaking_update_schema():
    upd = StocktakingUpdate(gym_id=5)
    assert upd.gym_id == 5
    assert upd.stocktaking_date is None

@pytest.mark.unit
def test_transaction_client_update_schema():
    upd = TransactionClientUpdate(client_id=3)
    assert upd.client_id == 3
    assert upd.articles is None

@pytest.mark.unit
def test_equipment_update_schema():
    upd = EquipmentUpdate(state="BROKEN")
    assert upd.state == "BROKEN"
    assert upd.price is None

@pytest.mark.unit
def test_equipment_subtypes_update_schema():
    w = WeightUpdate(weight=Decimal("15.5"))
    assert w.weight == Decimal("15.5")
    assert w.state is None
    
    m = MachineUpdate(max_weight=200)
    assert m.max_weight == 200
    assert m.state is None

    a = AccessoryUpdate(type="Belt")
    assert a.type == "Belt"
    assert a.state is None

@pytest.mark.unit
def test_entry_update_schema():
    upd = EntryUpdate(gym_id=4)
    assert upd.gym_id == 4
    assert upd.client_id is None

@pytest.mark.unit
def test_subscription_update_schema():
    upd = SubscriptionUpdate(duration=90)
    assert upd.duration == 90
    assert upd.price is None

@pytest.mark.unit
def test_client_subscription_update_schema():
    upd = ClientSubscriptionUpdate(paid_now="N")
    assert upd.paid_now == "N"
    assert upd.client_id is None

@pytest.mark.unit
def test_contract_update_schema():
    upd = ContractUpdate(payment=Decimal("2000.00"))
    assert upd.payment == Decimal("2000.00")
    assert upd.expiration_date is None

@pytest.mark.unit
def test_gym_update_schema():
    upd = GymUpdate(area=500)
    assert upd.area == 500
    assert upd.name is None