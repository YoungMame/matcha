CREATE TABLE if not exists users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture_index INTEGER, -- index of selected profile picture
    profile_pictures TEXT[], -- array of image URLs
    gallery TEXT[], -- array of image URLs
    bio TEXT DEFAULT '',
    tags TEXT[] , -- array of tags

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE if not exists chats (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NULL REFERENCES events(id) ,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE if not exists chats_users (
    chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE if not exists events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    location_id INTEGER NULL REFERENCES locations(id),
    chat_id INTEGER NULL REFERENCES chats(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE if not exists locations (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL NOT NULL,
    longitude DECIMAL NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER NULL REFERENCES events(id) ON DELETE CASCADE
);

