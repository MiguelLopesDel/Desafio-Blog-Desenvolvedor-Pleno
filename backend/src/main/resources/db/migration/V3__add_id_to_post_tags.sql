ALTER TABLE post_tags ADD COLUMN id BIGSERIAL;

ALTER TABLE post_tags DROP CONSTRAINT post_tags_pkey;

ALTER TABLE post_tags ADD PRIMARY KEY (id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_post_tag ON post_tags(post_id, tag);