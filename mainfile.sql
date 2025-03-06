\c nc_news

-- Making some queries to the database

-- SELECT * FROM comments;
-- SELECT * FROM users;
-- SELECT username FROM users;
-- SELECT * FROM articles WHERE topic = 'coding';
-- SELECT * FROM comments WHERE votes <0;
-- SELECT * FROM topics;
-- SELECT * FROM articles WHERE author = 'grumpy19';
-- SELECT * FROM comments WHERE votes >10;
-- SELECT article_id FROM articles;
-- SELECT article_id FROM comments;

-- //Every comment row has a value for an article_id
-- SELECT * FROM comments;

-- -- Every article row has a value for vote
-- SELECT * FROM comments WHERE article_id IN (SELECT article_id FROM articles);