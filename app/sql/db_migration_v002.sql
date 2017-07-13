ALTER TABLE validation.validation_local_cohort_definition ADD use_patient_source BOOLEAN DEFAULT FALSE  NOT NULL;

ALTER TABLE validation.validation_local_cohort ADD start_date DATE NULL;
ALTER TABLE validation.validation_local_cohort ADD end_date DATE NULL;
ALTER TABLE validation.validation_local_cohort ADD comment VARCHAR(256) NULL;