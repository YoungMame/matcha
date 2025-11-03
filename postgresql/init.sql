CREATE TYPE GENDER AS ENUM ('men', 'women');
CREATE TYPE ORIENTATION AS ENUM ('heterosexual', 'homosexual', 'bisexual');

CREATE TABLE if not exists users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    profile_picture_index INTEGER, -- index of selected profile picture
    profile_pictures TEXT[], -- array of image URLs
    bio TEXT DEFAULT '',
    tags TEXT[], -- array of tags
    born_at DATE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    gender GENDER NOT NULL,
    orientation ORIENTATION NOT NULL DEFAULT 'bisexual',
    fame_rate INTEGER DEFAULT 0,
    is_connected BOOLEAN DEFAULT FALSE,
    last_connection TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE if not exists blocked_users (
    id SERIAL PRIMARY KEY,
    blocker_id INTEGER NOT NULL,
    blocked_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE if not exists locations (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL NOT NULL,
    longitude DECIMAL NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    event_id INTEGER
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

