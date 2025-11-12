CREATE TYPE GENDER AS ENUM ('men', 'women');
CREATE TYPE ORIENTATION AS ENUM ('heterosexual', 'homosexual', 'bisexual');

CREATE TABLE if not exists users (
-- Mandatory fields
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,

-- Email Verification
    is_verified BOOLEAN DEFAULT FALSE,

-- Profile completion fields
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    bio TEXT DEFAULT '',
    tags TEXT[], -- array of tags
    born_at DATE,
    gender GENDER,
    orientation ORIENTATION DEFAULT 'bisexual',

-- Profile completion status
    is_profile_completed BOOLEAN DEFAULT FALSE,

-- Profile picture (not mandatory on user creation)
    profile_picture_index INTEGER, -- index of selected profile picture
    profile_pictures TEXT[], -- array of image URLs

    fame_rate INTEGER DEFAULT 0,
    is_connected BOOLEAN DEFAULT FALSE,
    last_connection TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE NOTIFICATION_TYPE AS ENUM ('like', 'view', 'unlike', 'like_back', 'message', 'chat_event');

CREATE TABLE if not exists notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    notification_type NOTIFICATION_TYPE NOT NULL,
    target_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE VIEW notifications_details AS
SELECT bu.*, u_author.username AS author_username
FROM notifications bu
JOIN users u_author ON u_author.id = bu.author_id;

ALTER TABLE notifications
ADD FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE notifications
ADD FOREIGN KEY (author_id) REFERENCES users(id)
ON DELETE CASCADE;

CREATE TABLE if not exists reported_users (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER NOT NULL,
    reported_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE reported_users
ADD FOREIGN KEY (reported_id) REFERENCES users(id)
ON DELETE CASCADE;

CREATE TABLE if not exists blocked_users (
    id SERIAL PRIMARY KEY,
    blocker_id INTEGER NOT NULL,
    blocked_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE VIEW blocked_with_username AS
SELECT bu.*, u_origin.username AS blocker_username, u_target.username AS blocked_username
FROM blocked_users bu
JOIN users u_origin ON u_origin.id = bu.blocker_id
JOIN users u_target ON u_target.id = bu.blocked_id;

ALTER TABLE blocked_users
ADD FOREIGN KEY (blocker_id) REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE blocked_users
ADD FOREIGN KEY (blocked_id) REFERENCES users(id)
ON DELETE CASCADE;

CREATE TABLE if not exists likes (
    id SERIAL PRIMARY KEY,
    liker_id INTEGER NOT NULL,
    liked_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE likes
ADD FOREIGN KEY (liker_id) REFERENCES users(id);

ALTER TABLE likes
ADD FOREIGN KEY (liked_id) REFERENCES users(id)
ON DELETE CASCADE;

CREATE TABLE if not exists views (
    id SERIAL PRIMARY KEY,
    viewer_id INTEGER NOT NULL,
    viewed_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE views
ADD FOREIGN KEY (viewer_id) REFERENCES users(id);

ALTER TABLE views
ADD FOREIGN KEY (viewed_id) REFERENCES users(id)
ON DELETE CASCADE;

CREATE TABLE if not exists chats (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE if not exists messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER NULL,
    sender_id INTEGER NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE messages
ADD FOREIGN KEY (chat_id) REFERENCES chats(id)
ON DELETE CASCADE;

ALTER TABLE messages
ADD FOREIGN KEY (sender_id) REFERENCES users(id)
ON DELETE CASCADE;

CREATE TABLE if not exists chats_users (
    chat_id INTEGER,
    user_id INTEGER,
    PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE if not exists events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    location_id INTEGER ,
    chat_id INTEGER,
    date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE if not exists locations (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL NOT NULL,
    longitude DECIMAL NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER DEFAULT NULL,
    event_id INTEGER DEFAULT NULL
);

ALTER TABLE chats
ADD FOREIGN KEY (event_id) REFERENCES events(id)
ON DELETE CASCADE;

ALTER TABLE chats_users
ADD FOREIGN KEY (chat_id) REFERENCES chats(id)
ON DELETE CASCADE;

ALTER TABLE chats_users
ADD FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE events
ADD FOREIGN KEY (location_id) REFERENCES locations(id)
ON DELETE CASCADE;

ALTER TABLE events
ADD FOREIGN KEY (chat_id) REFERENCES chats(id)
ON DELETE CASCADE;

ALTER TABLE locations
ADD FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE locations
ADD FOREIGN KEY (event_id) REFERENCES events(id)
ON DELETE CASCADE;

ALTER TABLE chats
ADD FOREIGN KEY (event_id) REFERENCES events(id);

