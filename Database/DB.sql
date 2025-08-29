CREATE DATABASE disaster_preparedness;

USE disaster_preparedness;

-- 1. USERS table
CREATE TABLE USERS (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- di ko alam anong hashing gagamitin natin UwU
    phone_number VARCHAR(15), -- para sa SMS notif
    role ENUM('family_member', 'admin', 'lgu_official') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. USER_PROFILE table
-- hiwalay for data privacy
CREATE TABLE USER_PROFILE (
    profile_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    birthdate DATE,
    address VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES USERS(user_id)
    -- pwede pa lagyan ng BLOB
);

-- 3. FAMILY table
CREATE TABLE FAMILY (
    family_id INT PRIMARY KEY AUTO_INCREMENT, -- para kahit may maulit na family name ok lang
    family_name VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. FAMILY_MEMBERS table
CREATE TABLE FAMILY_MEMBERS (
    family_member_id INT PRIMARY KEY AUTO_INCREMENT,
    family_id INT NOT NULL,
    user_id INT NOT NULL,
    relation VARCHAR(50),
    FOREIGN KEY (family_id) REFERENCES FAMILY(family_id),
    FOREIGN KEY (user_id) REFERENCES USERS(user_id)
);

-- 5. DISASTER_ALERTS table
CREATE TABLE DISASTER_ALERTS (
    alert_id INT PRIMARY KEY AUTO_INCREMENT,
    disaster_type ENUM('typhoon', 'earthquake', 'flood', 'volcanic eruption') NOT NULL,
    source VARCHAR(100),
    severity VARCHAR(50),
    description TEXT,
    alert_datetime DATETIME NOT NULL, -- para ma-record kung kailan nang-yari yung alert
    location VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. EVACUATION_CENTERS table
CREATE TABLE EVACUATION_CENTERS (
    center_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    capacity INT, -- kung ilan kasya sa evac. center
    contact_number VARCHAR(15)
);

-- 7. FAMILY_CHECKINS table
CREATE TABLE FAMILY_CHECKINS (
    checkin_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    alert_id INT NOT NULL,
    status ENUM('safe', 'not_responded', 'unknown', 'evacuated') DEFAULT 'not_responded',
    checkin_time DATETIME,
    center_id INT,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id),
    FOREIGN KEY (alert_id) REFERENCES DISASTER_ALERTS(alert_id),
    FOREIGN KEY (center_id) REFERENCES EVACUATION_CENTERS(center_id)
);

-- 8. GO_BAG_ITEMS table
CREATE TABLE GO_BAG_ITEMS (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(100) NOT NULL, -- lahatan na to beh, pwede rin siguro lakihan yung varchar tapos lagyan ng mga dapat gawin
    description TEXT				 --  pero feeling ko mas maganda kung pictures para sa panic lamaw
);

-- 9. USER_GO_BAG table
-- syempre anong mga laman ng go bag ni user
CREATE TABLE USER_GO_BAG (
    user_go_bag_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT DEFAULT 1,
    is_checked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES USERS(user_id),
    FOREIGN KEY (item_id) REFERENCES GO_BAG_ITEMS(item_id)
);

-- 10. EMERGENCY_BROADCASTS table
CREATE TABLE EMERGENCY_BROADCASTS (
    broadcast_id INT PRIMARY KEY AUTO_INCREMENT,
    lgu_user_id INT NOT NULL,
    message TEXT NOT NULL,
    target_location VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lgu_user_id) REFERENCES USERS(user_id)
);

-- 11. VIEW for family disaster status
-- view beh para madali
CREATE VIEW family_disaster_status AS
SELECT 
    f.family_name,
    CONCAT(up.first_name, ' ', up.last_name) AS member_name,
    da.disaster_type,
    da.severity,
    da.location AS disaster_location,
    fc.status,
    ec.name AS evacuation_center
FROM FAMILY f
JOIN FAMILY_MEMBERS fm 
    ON f.family_id = fm.family_id
JOIN USERS u 
    ON fm.user_id = u.user_id
JOIN USER_PROFILE up 
    ON u.user_id = up.user_id
LEFT JOIN FAMILY_CHECKINS fc 
    ON u.user_id = fc.user_id
LEFT JOIN DISASTER_ALERTS da 
    ON fc.alert_id = da.alert_id
LEFT JOIN EVACUATION_CENTERS ec 
    ON fc.center_id = ec.center_id
ORDER BY f.family_name, member_name;

-- NOTE: di ko alam kung mas maganda ba gumamit ng +63 para default philippines kaya 15 muna linagay ko para sa mga CP numbers
-- NOTE: 3nf lang kaya ng person  