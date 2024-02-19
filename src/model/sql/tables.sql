CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(500) DEFAULT("default-avatar.png"),
    join_in DATE NOT NULL,
    user_type INT DEFAULT(0),
    muted_time INT NOT NULL DEFAULT(0),
    times_silenced INT DEFAULT(0),
    warned_silenced INT DEFAULT(0),
    isBanned BOOLEAN DEFAULT(0),

    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS category (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    parent_id INT UNSIGNED,
    created_by INT UNSIGNED NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (parent_id) REFERENCES category(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS news (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    content mediumblob NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    image_url VARCHAR(500) DEFAULT("http://localhost:3001/userAvatar/default-avatar.png"),
    date_create DATE NOT NULL,
    visits INT DEFAULT(0),
    isVisible BOOLEAN DEFAULT(1),

    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES category(id)
);

CREATE TABLE IF NOT EXISTS comments (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    content MEDIUMTEXT NOT NULL,
    news_id INT UNSIGNED NOT NULL,
    author_id INT UNSIGNED NOT NULL,
    date_posted DATE NOT NULL,
    agree_count INT DEFAULT(0),
    disagree_count INT DEFAULT(0)

    PRIMARY KEY (id),
    FOREIGN KEY (news_id) REFERENCES news(id),
    FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS answers (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    content MEDIUMTEXT NOT NULL,
    author_id INT UNSIGNED NOT NULL,
    comment_id INT UNSIGNED NOT NULL,
    date_posted DATE NOT NULL,
    agree_count INT DEFAULT(0),
    disagree_count INT DEFAULT(0)

    PRIMARY KEY (id),
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (comment_id) REFERENCES comments(id)
);

CREATE TABLE IF NOT EXISTS user_notification (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    type VARCHAR(50) NOT NULL,
    content VARCHAR(255) NOT NULL,
    caused_by INT UNSIGNED NOT NULL,
    user_target INT UNSIGNED NOT NULL,
    news_origen INT UNSIGNED NOT NULL,
    hasBeenRead BOOLEAN DEFAULT(0),

    PRIMARY KEY (id),
    FOREIGN KEY (caused_by) REFERENCES users(id),
    FOREIGN KEY (user_target) REFERENCES users(id),
    FOREIGN KEY (news_origen) REFERENCES news(id)
);

CREATE TABLE IF NOT EXISTS comments_reactions (
    agree_or_disagree VARCHAR(50) NOT NULL,
    caused_by INT UNSIGNED NOT NULL,
    comment_id INT UNSIGNED NOT NULL,
    user_target INT UNSIGNED NOT NULL,

    PRIMARY KEY (caused_by, comment_id),
    FOREIGN KEY (caused_by) REFERENCES users(id),
    FOREIGN KEY (comment_id) REFERENCES comments(id),
    FOREIGN KEY (user_target) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS answers_reactions (
    agree_or_disagree VARCHAR(50) NOT NULL,
    caused_by INT UNSIGNED NOT NULL,
    answer_id INT UNSIGNED NOT NULL,
    user_target INT UNSIGNED NOT NULL,

    PRIMARY KEY (caused_by, answer_id),
    FOREIGN KEY (caused_by) REFERENCES users(id),
    FOREIGN KEY (answer_id) REFERENCES answers(id),
    FOREIGN KEY (user_target) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS reports (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    type VARCHAR(50) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    content VARCHAR(255) NOT NULL,
    user_author INT UNSIGNED NOT NULL,
    user_target INT UNSIGNED NOT NULL,
    news_target INT UNSIGNED NOT NULL,
    comment_target INT UNSIGNED NOT NULL,
    answer_target INT UNSIGNED NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (user_author) REFERENCES users(id),
    FOREIGN KEY (user_target) REFERENCES users(id),
    FOREIGN KEY (news_target) REFERENCES news(id),
    FOREIGN KEY (comment_target) REFERENCES comments(id),
    FOREIGN KEY (answer_target) REFERENCES answers(id)
);
