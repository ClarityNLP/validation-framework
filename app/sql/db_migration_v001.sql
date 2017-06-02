ALTER TABLE validation.validation_user ADD COLUMN user_roles VARCHAR(1000);
ALTER TABLE validation.validation_user ADD COLUMN name_first VARCHAR(250);
ALTER TABLE validation.validation_user ADD COLUMN name_last VARCHAR(250);


GRANT SELECT
ON ALL SEQUENCES IN SCHEMA validation
TO app_user;

GRANT UPDATE
ON ALL SEQUENCES IN SCHEMA validation
TO app_user