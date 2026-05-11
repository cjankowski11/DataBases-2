CREATE TABLE accessory (
    equipment_id INTEGER NOT NULL,
    type         VARCHAR(64) NOT NULL
);

ALTER TABLE accessory ADD CONSTRAINT accessory_pk PRIMARY KEY ( equipment_id );

CREATE TABLE address (
    address_id      INTEGER NOT NULL,
    city            VARCHAR(64) NOT NULL,
    street          VARCHAR(64) NOT NULL,
    building_number INTEGER NOT NULL,
    postal_code     VARCHAR(6) NOT NULL
);

ALTER TABLE address ADD CONSTRAINT address_pk PRIMARY KEY ( address_id );

CREATE TABLE article (
    article_id INTEGER NOT NULL,
    name       VARCHAR(128) NOT NULL,
    price      NUMERIC(10, 2) NOT NULL,
    type       VARCHAR(128) NOT NULL,
    stock      INTEGER NOT NULL
);

ALTER TABLE article ADD CONSTRAINT article_pk PRIMARY KEY ( article_id );

CREATE TABLE class (
    class_id      INTEGER NOT NULL,
    class_date    DATE NOT NULL,
    class_type_id INTEGER NOT NULL,
    duration      INTEGER NOT NULL,
    capacity      INTEGER NOT NULL,
    room_id       INTEGER NOT NULL
);

ALTER TABLE class ADD CONSTRAINT class_pk PRIMARY KEY ( class_id );

CREATE TABLE class_registration (
    class_registration_id INTEGER NOT NULL,
    client_id             INTEGER NOT NULL,
    class_id              INTEGER NOT NULL,
    registration_date     DATE NOT NULL
);

ALTER TABLE class_registration ADD CONSTRAINT class_registration_pk PRIMARY KEY ( class_registration_id );

CREATE TABLE class_type (
    class_type_id INTEGER NOT NULL,
    name          VARCHAR(32) NOT NULL,
    difficulty    INTEGER NOT NULL
);

ALTER TABLE class_type ADD CONSTRAINT class_type_pk PRIMARY KEY ( class_type_id );

CREATE TABLE client (
    client_id  INTEGER NOT NULL,
    name       VARCHAR(32) NOT NULL,
    surname    VARCHAR(64) NOT NULL,
    email      VARCHAR(64) NOT NULL,
    phone      VARCHAR(9) NOT NULL,
    birth_date DATE
);

ALTER TABLE client ADD CONSTRAINT client_pk PRIMARY KEY ( client_id );

CREATE TABLE client_subscription (
    client_subscription_id   INTEGER NOT NULL,
    client_id                INTEGER NOT NULL,
    receptionist_employee_id INTEGER,
    subscription_id          INTEGER NOT NULL,
    transaction_date         DATE NOT NULL,
    paid_now                 CHAR(1) NOT NULL,
    expiration_date          DATE NOT NULL
);

ALTER TABLE client_subscription ADD CONSTRAINT client_subscription_pk PRIMARY KEY ( client_subscription_id );

CREATE TABLE contract (
    contract_id     INTEGER NOT NULL,
    gym_id          INTEGER NOT NULL,
    sponsor_id      INTEGER NOT NULL,
    payment         NUMERIC(10, 2) NOT NULL,
    contract_date   DATE NOT NULL,
    expiration_date DATE NOT NULL
);

ALTER TABLE contract ADD CONSTRAINT contract_pk PRIMARY KEY ( contract_id );

CREATE TABLE employee (
    employee_id   INTEGER NOT NULL,
    name          VARCHAR(32) NOT NULL,
    surname       VARCHAR(64) NOT NULL,
    date_employed DATE NOT NULL,
    is_employed   CHAR(1) NOT NULL,
    birth_date    DATE,
    gender        CHAR(1) NOT NULL,
    salary        NUMERIC(10, 2)
);

ALTER TABLE employee ADD CONSTRAINT employee_pk PRIMARY KEY ( employee_id );

CREATE TABLE entry (
    entry_id   INTEGER NOT NULL,
    client_id  INTEGER NOT NULL,
    entry_time TIMESTAMP NOT NULL,
    gym_id     INTEGER NOT NULL
);

ALTER TABLE entry ADD CONSTRAINT entry_pk PRIMARY KEY ( entry_id );

CREATE TABLE equipment (
    equipment_id  INTEGER NOT NULL,
    serial_number INTEGER NOT NULL,
    gym_id        INTEGER,
    producer      VARCHAR(128) NOT NULL,
    name          VARCHAR(64) NOT NULL,
    state         VARCHAR(16) NOT NULL,
    date_bought   DATE NOT NULL,
    date_produced DATE NOT NULL,
    price         NUMERIC(10, 2) NOT NULL,
    equipment_type VARCHAR(16) NOT NULL
);

ALTER TABLE equipment ADD CONSTRAINT equipment_pk PRIMARY KEY ( equipment_id );

CREATE TABLE gym (
    gym_id      INTEGER NOT NULL,
    name        VARCHAR(64) NOT NULL,
    established DATE NOT NULL,
    email       VARCHAR(128),
    phone       VARCHAR(9),
    area        INTEGER,
    open_hour   TIME,
    close_hour  TIME,
    address_id  INTEGER NOT NULL
);

CREATE UNIQUE INDEX gym__idx ON gym ( address_id ASC );

ALTER TABLE gym ADD CONSTRAINT gym_pk PRIMARY KEY ( gym_id );

CREATE TABLE gym_employee (
    gym_id      INTEGER NOT NULL,
    employee_id INTEGER NOT NULL
);

ALTER TABLE gym_employee ADD CONSTRAINT gym_employee_pk PRIMARY KEY ( gym_id, employee_id );

CREATE TABLE machine (
    equipment_id    INTEGER NOT NULL,
    max_weight      INTEGER NOT NULL,
    bodypart_target VARCHAR(128) NOT NULL
);

ALTER TABLE machine ADD CONSTRAINT machine_pk PRIMARY KEY ( equipment_id );

CREATE TABLE personal_training (
    personal_training_id INTEGER NOT NULL,
    client_id            INTEGER NOT NULL,
    start_time           TIMESTAMP NOT NULL,
    duration             INTEGER NOT NULL,
    trainer_employee_id  INTEGER NOT NULL
);

ALTER TABLE personal_training ADD CONSTRAINT personal_training_pk PRIMARY KEY ( personal_training_id );

CREATE TABLE receptionist (
    employee_id INTEGER NOT NULL,
    shift       VARCHAR(16) NOT NULL
);

ALTER TABLE receptionist ADD CONSTRAINT receptionist_pk PRIMARY KEY ( employee_id );

CREATE TABLE room (
    room_id INTEGER NOT NULL,
    gym_id  INTEGER NOT NULL,
    name    VARCHAR(64) NOT NULL
);

ALTER TABLE room ADD CONSTRAINT room_pk PRIMARY KEY ( room_id );

CREATE TABLE sponsor (
    sponsor_id INTEGER NOT NULL,
    name       VARCHAR(128) NOT NULL
);

ALTER TABLE sponsor ADD CONSTRAINT sponsor_pk PRIMARY KEY ( sponsor_id );

CREATE TABLE stocktaking (
    stocktaking_id   INTEGER NOT NULL,
    gym_id           INTEGER NOT NULL,
    stocktaking_date DATE NOT NULL
);

ALTER TABLE stocktaking ADD CONSTRAINT stocktaking_pk PRIMARY KEY ( stocktaking_id );

CREATE TABLE subscription (
    subscription_id INTEGER NOT NULL,
    name            VARCHAR(128) NOT NULL,
    price           NUMERIC(10, 2) NOT NULL,
    duration        INTEGER NOT NULL,
    entry_until     DATE
);

ALTER TABLE subscription ADD CONSTRAINT subscription_pk PRIMARY KEY ( subscription_id );

CREATE TABLE trainer (
    employee_id    INTEGER NOT NULL,
    specialization VARCHAR(64) NOT NULL,
    hourly_wage    NUMERIC(10, 2) NOT NULL
);

ALTER TABLE trainer ADD CONSTRAINT trainer_pk PRIMARY KEY ( employee_id );

CREATE TABLE trainer_class (
    trainer_employee_id INTEGER NOT NULL,
    class_id            INTEGER NOT NULL
);

ALTER TABLE trainer_class ADD CONSTRAINT trainer_class_pk PRIMARY KEY ( trainer_employee_id, class_id );

CREATE TABLE transaction_article (
    transaction_client_id INTEGER NOT NULL,
    article_id            INTEGER NOT NULL,
    quantity              INTEGER
);

ALTER TABLE transaction_article ADD CONSTRAINT transaction_article_pk PRIMARY KEY ( transaction_client_id, article_id );

CREATE TABLE transaction_client (
    transaction_client_id    INTEGER NOT NULL,
    client_id                INTEGER NOT NULL,
    receptionist_employee_id INTEGER NOT NULL,
    transaction_date         DATE NOT NULL
);

ALTER TABLE transaction_client ADD CONSTRAINT transaction_client_pk PRIMARY KEY ( transaction_client_id );

CREATE TABLE weight (
    equipment_id INTEGER NOT NULL,
    weight       NUMERIC(10, 2) NOT NULL,
    type         VARCHAR(64) NOT NULL,
    material     VARCHAR(32) NOT NULL
);

ALTER TABLE weight ADD CONSTRAINT weight_pk PRIMARY KEY ( equipment_id );

ALTER TABLE accessory
    ADD CONSTRAINT accessory_equipment_fk
        FOREIGN KEY ( equipment_id )
            REFERENCES equipment ( equipment_id )
            NOT DEFERRABLE;

ALTER TABLE class
    ADD CONSTRAINT class_class_type_fk
        FOREIGN KEY ( class_type_id )
            REFERENCES class_type ( class_type_id )
            NOT DEFERRABLE;

ALTER TABLE class_registration
    ADD CONSTRAINT class_registration_class_fk
        FOREIGN KEY ( class_id )
            REFERENCES class ( class_id )
            NOT DEFERRABLE;

ALTER TABLE class_registration
    ADD CONSTRAINT class_registration_client_fk
        FOREIGN KEY ( client_id )
            REFERENCES client ( client_id )
            NOT DEFERRABLE;

ALTER TABLE class
    ADD CONSTRAINT class_room_fk
        FOREIGN KEY ( room_id )
            REFERENCES room ( room_id )
            NOT DEFERRABLE;

ALTER TABLE client_subscription
    ADD CONSTRAINT client_subscription_client_fk
        FOREIGN KEY ( client_id )
            REFERENCES client ( client_id )
            NOT DEFERRABLE;

ALTER TABLE client_subscription
    ADD CONSTRAINT client_subscription_receptionist_fk
        FOREIGN KEY ( receptionist_employee_id )
            REFERENCES receptionist ( employee_id )
            NOT DEFERRABLE;

ALTER TABLE client_subscription
    ADD CONSTRAINT client_subscription_subscription_fk
        FOREIGN KEY ( subscription_id )
            REFERENCES subscription ( subscription_id )
            NOT DEFERRABLE;

ALTER TABLE contract
    ADD CONSTRAINT contract_gym_fk
        FOREIGN KEY ( gym_id )
            REFERENCES gym ( gym_id )
            NOT DEFERRABLE;

ALTER TABLE contract
    ADD CONSTRAINT contract_sponsor_fk
        FOREIGN KEY ( sponsor_id )
            REFERENCES sponsor ( sponsor_id )
            NOT DEFERRABLE;

ALTER TABLE entry
    ADD CONSTRAINT entry_client_fk
        FOREIGN KEY ( client_id )
            REFERENCES client ( client_id )
            NOT DEFERRABLE;

ALTER TABLE entry
    ADD CONSTRAINT entry_gym_fk
        FOREIGN KEY ( gym_id )
            REFERENCES gym ( gym_id )
            NOT DEFERRABLE;

ALTER TABLE equipment
    ADD CONSTRAINT equipment_gym_fk
        FOREIGN KEY ( gym_id )
            REFERENCES gym ( gym_id )
            NOT DEFERRABLE;

ALTER TABLE gym
    ADD CONSTRAINT gym_address_fk
        FOREIGN KEY ( address_id )
            REFERENCES address ( address_id )
            NOT DEFERRABLE;

ALTER TABLE gym_employee
    ADD CONSTRAINT gym_employee_employee_fk
        FOREIGN KEY ( employee_id )
            REFERENCES employee ( employee_id )
            NOT DEFERRABLE;

ALTER TABLE gym_employee
    ADD CONSTRAINT gym_employee_gym_fk
        FOREIGN KEY ( gym_id )
            REFERENCES gym ( gym_id )
            NOT DEFERRABLE;

ALTER TABLE machine
    ADD CONSTRAINT machine_equipment_fk
        FOREIGN KEY ( equipment_id )
            REFERENCES equipment ( equipment_id )
            NOT DEFERRABLE;

ALTER TABLE personal_training
    ADD CONSTRAINT personal_training_client_fk
        FOREIGN KEY ( client_id )
            REFERENCES client ( client_id )
            NOT DEFERRABLE;

ALTER TABLE personal_training
    ADD CONSTRAINT personal_training_trainer_fk
        FOREIGN KEY ( trainer_employee_id )
            REFERENCES trainer ( employee_id )
            NOT DEFERRABLE;

ALTER TABLE receptionist
    ADD CONSTRAINT receptionist_employee_fk
        FOREIGN KEY ( employee_id )
            REFERENCES employee ( employee_id )
            NOT DEFERRABLE;

ALTER TABLE transaction_article
    ADD CONSTRAINT relation_12_article_fk
        FOREIGN KEY ( article_id )
            REFERENCES article ( article_id )
            NOT DEFERRABLE;

ALTER TABLE transaction_article
    ADD CONSTRAINT relation_12_transaction_client_fk
        FOREIGN KEY ( transaction_client_id )
            REFERENCES transaction_client ( transaction_client_id )
            NOT DEFERRABLE;

ALTER TABLE room
    ADD CONSTRAINT room_gym_fk
        FOREIGN KEY ( gym_id )
            REFERENCES gym ( gym_id )
            NOT DEFERRABLE;

ALTER TABLE stocktaking
    ADD CONSTRAINT stocktaking_gym_fk
        FOREIGN KEY ( gym_id )
            REFERENCES gym ( gym_id )
            NOT DEFERRABLE;

ALTER TABLE trainer_class
    ADD CONSTRAINT trainer_class_class_fk
        FOREIGN KEY ( class_id )
            REFERENCES class ( class_id )
            NOT DEFERRABLE;

ALTER TABLE trainer_class
    ADD CONSTRAINT trainer_class_trainer_fk
        FOREIGN KEY ( trainer_employee_id )
            REFERENCES trainer ( employee_id )
            NOT DEFERRABLE;

ALTER TABLE trainer
    ADD CONSTRAINT trainer_employee_fk
        FOREIGN KEY ( employee_id )
            REFERENCES employee ( employee_id )
            NOT DEFERRABLE;

ALTER TABLE transaction_client
    ADD CONSTRAINT transaction_client_client_fk
        FOREIGN KEY ( client_id )
            REFERENCES client ( client_id )
            NOT DEFERRABLE;

ALTER TABLE transaction_client
    ADD CONSTRAINT transaction_client_receptionist_fk
        FOREIGN KEY ( receptionist_employee_id )
            REFERENCES receptionist ( employee_id )
            NOT DEFERRABLE;

ALTER TABLE weight
    ADD CONSTRAINT weight_equipment_fk
        FOREIGN KEY ( equipment_id )
            REFERENCES equipment ( equipment_id )
            NOT DEFERRABLE;


-- INSERTING DATA PROCEDURES

INSERT INTO address (address_id, city, street, building_number, postal_code)
VALUES (1, 'Warszawa', 'Puławska', 17, '02-515');

INSERT INTO gym (gym_id, name, established, address_id)
VALUES (1, 'Zdrofit Europlex', '2024-01-01', 1);

INSERT INTO client (client_id, name, surname, email, phone, birth_date) VALUES
    (201, 'Michał', 'Kras', 'm.kras@studia.pl', '555111222', '2004-05-10'),
    (202, 'Anna', 'Zielińska', 'a.ziel@mail.com', '666222333', '1998-12-15'),
    (203, 'Piotr', 'Wiśniewski', 'p.wis@test.pl', '777333444', '1990-03-20'),
    (204, 'Maria', 'Dąbrowska', 'm.dab@web.pl', '888444555', '2001-07-25'),
    (205, 'Tomasz', 'Lewandowski', 't.lew@gym.pl', '999555666', '1985-11-02')
ON CONFLICT (client_id) DO NOTHING;

CREATE OR REPLACE PROCEDURE generate_rooms()
LANGUAGE plpgsql AS $$
BEGIN

    INSERT INTO room (room_id, gym_id, name) VALUES
        (1, 1, 'Main Weight Room'),
        (2, 1, 'Cardio Zone'),
        (3, 1, 'Yoga Studio')
    ON CONFLICT DO NOTHING;
END;
$$;

CREATE OR REPLACE PROCEDURE generate_classes(num_classes INT)
LANGUAGE plpgsql AS $$
DECLARE i INT;
BEGIN
    INSERT INTO class_type VALUES (1, 'Yoga', 2), (2, 'Crossfit', 5), (3, 'Pilates', 3) ON CONFLICT DO NOTHING;

    FOR i IN 1..num_classes LOOP
        INSERT INTO class (class_id, class_date, class_type_id, duration, capacity, room_id)
        VALUES (i, CURRENT_DATE + (i % 14), (i % 3) + 1, 60, 20, (i % 3) + 1)
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$;

CREATE OR REPLACE PROCEDURE generate_registrations()
LANGUAGE plpgsql AS $$
DECLARE
    r_client RECORD;
    v_class_id INT;
    v_random_date DATE;
    v_reg_id INT := 1;
BEGIN
    SELECT COALESCE(MAX(class_registration_id), 0) INTO v_reg_id FROM class_registration;

    FOR r_client IN SELECT client_id FROM client LOOP

        SELECT class_id INTO v_class_id FROM class ORDER BY RANDOM() LIMIT 1;

        v_random_date := DATE '2020-01-01' + (random() * (CURRENT_DATE - DATE '2020-01-01'))::INT;
        v_reg_id := v_reg_id + 1;

        INSERT INTO class_registration (
            class_registration_id,
            client_id,
            class_id,
            registration_date
        ) VALUES (
            v_reg_id,
            r_client.client_id,
            v_class_id,
            v_random_date
        ) ON CONFLICT DO NOTHING;

    END LOOP;
END;
$$;

CREATE OR REPLACE PROCEDURE add_subscriptions(
    p_subscription_id INT,
    p_name VARCHAR(128),
    p_price NUMERIC(10,2),
    p_duration INT,
    p_entry_until DATE DEFAULT NULL

)
LANGUAGE plpgsql as $$
BEGIN
    IF p_price < 0 THEN
        RAISE EXCEPTION 'Price can not be negative: ', p_price;
    END IF;

    IF p_duration <= 0 THEN
        RAISE EXCEPTION 'Time must be bigger than 0 ';
    END IF;

    INSERT INTO subscription (subscription_id, name, price,duration,entry_until)
    VALUES (p_subscription_id,p_name,p_price, p_duration, p_entry_until)
    ON CONFLICT (subscription_id) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        duration = EXCLUDED.duration,
        entry_until = EXCLUDED.entry_until;

    RAISE NOTICE 'Subscription "%" (id=%) added/updated', p_name, p_subscription_id;
END;
$$;

CREATE OR REPLACE PROCEDURE add_equipment_base(
    p_equipment_id   INTEGER,
    p_serial_number  INTEGER,
    p_producer       VARCHAR(128),
    p_name           VARCHAR(64),
    p_state          VARCHAR(16),
    p_date_bought    DATE,
    p_date_produced  DATE,
    p_price          NUMERIC(10, 2),
    p_equipment_type VARCHAR(16),
    p_gym_id         INTEGER DEFAULT NULL
)
LANGUAGE plpgsql AS $$
BEGIN
    IF p_price < 0 THEN
        RAISE EXCEPTION 'Price can not be negative';
    END IF;

    IF p_date_produced > p_date_bought THEN
        RAISE EXCEPTION 'Production date (%) can not be later than buy date (%)',
        p_date_produced,p_date_bought;
    END IF;

      IF p_gym_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM gym WHERE gym_id = p_gym_id
    ) THEN
        RAISE EXCEPTION 'Gym  id=% does not exist', p_gym_id;
    END IF;

    INSERT INTO equipment (
        equipment_id, serial_number, gym_id, producer, name,
        state, date_bought, date_produced, price, equipment_type
    ) VALUES (
        p_equipment_id, p_serial_number, p_gym_id, p_producer, p_name,
        p_state, p_date_bought, p_date_produced, p_price, p_equipment_type
    );
END;
$$;

CREATE OR REPLACE PROCEDURE add_weight(
    p_equipment_id  INTEGER,
    p_serial_number INTEGER,
    p_producer      VARCHAR(128),
    p_name          VARCHAR(64),
    p_state         VARCHAR(16),
    p_date_bought   DATE,
    p_date_produced DATE,
    p_price         NUMERIC(10, 2),
    p_weight        NUMERIC(10, 2),  -- ciężar w kg
    p_type          VARCHAR(64),      -- np. 'dumbbell', 'barbell', 'plate'
    p_material      VARCHAR(32),      -- np. 'cast iron', 'rubber'
    p_gym_id        INTEGER DEFAULT NULL
)
LANGUAGE plpgsql AS $$
BEGIN
    IF p_weight <= 0 THEN
        RAISE EXCEPTION 'Weight must be > 0';
    END IF;

    CALL add_equipment_base(p_equipment_id, p_serial_number, p_producer, p_name,
        p_state, p_date_bought, p_date_produced, p_price, 'weight', p_gym_id
    );

    INSERT INTO weight (equipment_id,weight,type, material) VALUES (p_equipment_id,p_weight,p_type,p_material);

    RAISE NOTICE 'Weight "%" (id=%) added', p_name,p_equipment_id;
END;
$$;

CREATE OR REPLACE PROCEDURE add_machine(
    p_equipment_id   INTEGER,
    p_serial_number  INTEGER,
    p_producer       VARCHAR(128),
    p_name           VARCHAR(64),
    p_state          VARCHAR(16),
    p_date_bought    DATE,
    p_date_produced  DATE,
    p_price          NUMERIC(10, 2),
    p_max_weight     INTEGER,       --kg
    p_bodypart       VARCHAR(128),
    p_gym_id         INTEGER DEFAULT NULL
)
LANGUAGE plpgsql AS $$
BEGIN
    IF p_max_weight <= 0 THEN
        RAISE EXCEPTION 'Max weight must be > 0';
    END IF;

    CALL add_equipment_base(
        p_equipment_id, p_serial_number, p_producer, p_name,
        p_state, p_date_bought, p_date_produced, p_price, 'machine', p_gym_id
    );

    INSERT INTO machine (equipment_id, max_weight, bodypart_target)
    VALUES (p_equipment_id, p_max_weight, p_bodypart);

    RAISE NOTICE 'Machine "%" (id=%) added.', p_name, p_equipment_id;
END;
$$;

CREATE OR REPLACE PROCEDURE add_accessory(
    p_equipment_id  INTEGER,
    p_serial_number INTEGER,
    p_producer      VARCHAR(128),
    p_name          VARCHAR(64),
    p_state         VARCHAR(16),
    p_date_bought   DATE,
    p_date_produced DATE,
    p_price         NUMERIC(10, 2),
    p_type          VARCHAR(64),      -- 'resistance band', 'mat', 'rope'
    p_gym_id        INTEGER DEFAULT NULL
)
LANGUAGE plpgsql AS $$
BEGIN
    CALL add_equipment_base(
        p_equipment_id, p_serial_number, p_producer, p_name,
        p_state, p_date_bought, p_date_produced, p_price, 'accessory', p_gym_id
    );

    INSERT INTO accessory (equipment_id, type)
    VALUES (p_equipment_id, p_type);

    RAISE NOTICE 'Accessory "%" (id=%) added.', p_name, p_equipment_id;
END;
$$;

CREATE OR REPLACE PROCEDURE add_client_subscription(
    p_client_subscription_id INTEGER,
    p_client_id                INTEGER,
    p_subscription_id          INTEGER,
    p_transaction_date         DATE DEFAULT CURRENT_DATE,
    p_paid_now                 CHAR(1) DEFAULT 'Y',        -- 'Y' lub 'N'
    p_receptionist_employee_id INTEGER DEFAULT NULL        -- NULL = zakup online
)
LANGUAGE plpgsql AS $$
DECLARE
    v_duration INTEGER;
    v_expiration DATE;
    v_entry_until DATE;

BEGIN
    IF NOT EXISTS (SELECT 1 FROM client WHERE client_id = p_client_id) THEN
        RAISE EXCEPTION 'Client id=% does not exist', p_client_id;
    END IF;

    SELECT duration, entry_until
    INTO v_duration, v_entry_until
    FROM subscription
    WHERE subscription_id = p_subscription_id

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Subscription id=% does not exist', p_subscription_id;
    END IF;


    IF p_receptionist_employee_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM receptionist WHERE employee_id = p_receptionist_employee_id
    ) THEN
        RAISE EXCEPTION 'Recepcjonist id=% does not exist', p_receptionist_employee_id;
    END IF;


    IF p_paid_now NOT IN ('Y', 'N') THEN  --validation
        RAISE EXCEPTION 'paid_now must be "Y" or "N"';
    END IF;


    v_expiration := p_transaction_date + v_duration;

    IF v_entry_until IS NOT NULL AND v_entry_until < v_expiration THEN
        RAISE NOTICE 'ALERT: entry_until (%) earlier than expiration_date (%)',
            v_entry_until, v_expiration;
    END IF;

    INSERT INTO client_subscription (
        client_subscription_id,
        client_id,
        receptionist_employee_id,
        subscription_id,
        transaction_date,
        paid_now,
        expiration_date
    ) VALUES (
        p_client_subscription_id,
        p_client_id,
        p_receptionist_employee_id,
        p_subscription_id,
        p_transaction_date,
        p_paid_now,
        v_expiration
    );

    RAISE NOTICE 'Subscription id=% set to client id=%, expire: %',
        p_subscription_id, p_client_id, v_expiration;
END;
$$;


CALL generate_rooms();
CALL generate_classes(20);
CALL generate_registrations();


-- TRIGGERS, FUNCTIONS AND OTHER PROCEDURES

CREATE OR REPLACE FUNCTION check_class_capacity()
RETURNS TRIGGER AS $$
DECLARE
    v_capacity INT;
    v_current_count INT;
BEGIN
    SELECT capacity INTO v_capacity FROM class WHERE class_id = NEW.class_id;

    SELECT COUNT(*) INTO v_current_count FROM class_registration WHERE class_id = NEW.class_id;

    IF v_current_count >= v_capacity THEN
        RAISE EXCEPTION 'Class is full! Maximum capacity is %', v_capacity;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_capacity
BEFORE INSERT ON class_registration
FOR EACH ROW EXECUTE FUNCTION check_class_capacity();


CREATE OR REPLACE PROCEDURE schedule_recurring_class(p_class_id INT, p_weeks INT DEFAULT 4)
LANGUAGE plpgsql AS $$
DECLARE
    r_base_class RECORD;
    i INT;
    v_new_id INT;
BEGIN
    SELECT * INTO r_base_class FROM class WHERE class_id = p_class_id;

    SELECT MAX(class_id) INTO v_new_id FROM class;

    FOR i IN 1..p_weeks LOOP
        v_new_id := v_new_id + 1;
        INSERT INTO class (class_id, class_date, class_type_id, duration, capacity, room_id)
        VALUES (
            v_new_id,
            r_base_class.class_date + (i * 7),
            r_base_class.class_type_id,
            r_base_class.duration,
            r_base_class.capacity,
            r_base_class.room_id
        );
    END LOOP;

    RAISE NOTICE 'Scheduled % recurring classes.', p_weeks;
END;
$$;

CREATE OR REPLACE FUNCTION get_class_occupancy_pct(p_class_id INT)
RETURNS NUMERIC AS $$
DECLARE
    v_capacity INT;
    v_count INT;
BEGIN
    SELECT capacity INTO v_capacity FROM class WHERE class_id = p_class_id;
    SELECT COUNT(*) INTO v_count FROM class_registration WHERE class_id = p_class_id;

    IF v_capacity = 0 THEN RETURN 0; END IF;

    RETURN ROUND((v_count::NUMERIC / v_capacity::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql;

CALL schedule_recurring_class(1, 4);