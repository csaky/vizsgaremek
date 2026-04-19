CREATE DATABASE IF NOT EXISTS bladerunner CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bladerunner;


CREATE TABLE users (
    user_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    full_name   VARCHAR(255) NOT NULL,
    password    VARCHAR(255) NOT NULL,   -- bcrypt hash
    phone       VARCHAR(30),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE customers (
    user_id INT UNSIGNED PRIMARY KEY,
    notes   TEXT,
    CONSTRAINT fk_customer_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);


CREATE TABLE owners (
    user_id INT UNSIGNED PRIMARY KEY,
    CONSTRAINT fk_owner_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);


CREATE TABLE salons (
    salon_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    owner_id    INT UNSIGNED NOT NULL,
    name        VARCHAR(255) NOT NULL,
    address     VARCHAR(500) NOT NULL,
    phone       VARCHAR(30),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_salon_owner FOREIGN KEY (owner_id) REFERENCES owners(user_id) ON DELETE RESTRICT
);


CREATE TABLE barbers (
    user_id     INT UNSIGNED PRIMARY KEY,
    salon_id    INT UNSIGNED NOT NULL,
    ratings     DECIMAL(3,2) DEFAULT NULL,
    CONSTRAINT fk_barber_user   FOREIGN KEY (user_id)  REFERENCES users(user_id)  ON DELETE CASCADE,
    CONSTRAINT fk_barber_salon  FOREIGN KEY (salon_id) REFERENCES salons(salon_id) ON DELETE RESTRICT
);


CREATE TABLE services (
    service_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL
);


CREATE TABLE salon_services (
    salon_id        INT UNSIGNED NOT NULL,
    service_id      INT UNSIGNED NOT NULL,
    price           DECIMAL(10,2) NOT NULL,
    duration_min    INT UNSIGNED NOT NULL,   -- percben
    PRIMARY KEY (salon_id, service_id),
    CONSTRAINT fk_ss_salon   FOREIGN KEY (salon_id)   REFERENCES salons(salon_id)   ON DELETE CASCADE,
    CONSTRAINT fk_ss_service FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE
);


CREATE TABLE barber_services (
    barber_user_id  INT UNSIGNED NOT NULL,
    service_id      INT UNSIGNED NOT NULL,
    PRIMARY KEY (barber_user_id, service_id),
    CONSTRAINT fk_bs_barber  FOREIGN KEY (barber_user_id) REFERENCES barbers(user_id)    ON DELETE CASCADE,
    CONSTRAINT fk_bs_service FOREIGN KEY (service_id)     REFERENCES services(service_id) ON DELETE CASCADE
);


CREATE TABLE appointments (
    appointment_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id     INT UNSIGNED NOT NULL,
    barber_id       INT UNSIGNED NOT NULL,
    salon_id        INT UNSIGNED NOT NULL,
    start_at        DATETIME NOT NULL,
    duration        INT UNSIGNED NOT NULL,  -- percben, kalkulált
    status          ENUM('pending','confirmed','cancelled','completed','no_show') NOT NULL DEFAULT 'pending',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_appt_customer FOREIGN KEY (customer_id) REFERENCES customers(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_appt_barber   FOREIGN KEY (barber_id)   REFERENCES barbers(user_id)   ON DELETE RESTRICT,
    CONSTRAINT fk_appt_salon    FOREIGN KEY (salon_id)    REFERENCES salons(salon_id)   ON DELETE RESTRICT
);


CREATE TABLE appointment_services (
    appointment_id      INT UNSIGNED NOT NULL,
    service_id          INT UNSIGNED NOT NULL,
    price_at_booking    DECIMAL(10,2) NOT NULL,
    duration_at_booking INT UNSIGNED NOT NULL,
    PRIMARY KEY (appointment_id, service_id),
    CONSTRAINT fk_as_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE,
    CONSTRAINT fk_as_service     FOREIGN KEY (service_id)     REFERENCES services(service_id)         ON DELETE RESTRICT
);

INSERT INTO services (name) VALUES
    ('Hajvágás'),
    ('Szakállvágás'),
    ('Borotválás'),
    ('Hajsmosás'),
    ('Hajfestés');


