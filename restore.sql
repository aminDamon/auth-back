-- Create extension if not exists
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id integer NOT NULL,
    username character varying(30) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(100) NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    is_verified boolean DEFAULT false,
    verification_token character varying(255),
    verification_token_expire timestamp with time zone,
    verification_code character varying(6),
    verification_expires timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);

-- Create sequence
CREATE SEQUENCE IF NOT EXISTS public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Set sequence ownership
ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);

-- Insert data
INSERT INTO public.users (id, username, email, password, role, is_verified, verification_token, verification_token_expire, verification_code, verification_expires, created_at, updated_at) VALUES
(1, 'admin', 'admin@example.com', '$2b$10$avSInSEKZrbUGS.jX0WVMOdtAQtFkTqcytfCPTs9fnGg4Yy3lMUUu', 'admin', true, NULL, NULL, NULL, NULL, '2025-04-25 15:07:03.138+03:30', '2025-04-25 15:07:03.138+03:30'),
(2, 'amin', 'amin.liver82@gmail.com', '$2b$10$gqi6DPLA6jTlhjNxSbEsje.RO4si7wnUPBCZcVfiVrUj482Ks/iEq', 'user', true, NULL, NULL, NULL, NULL, '2025-04-25 15:39:37.96+03:30', '2025-04-25 16:18:10.645+03:30'),
(13, 'absalan', 'f.absalan@iec24.com', '$2b$10$hash...', 'user', false, NULL, NULL, NULL, NULL, '2025-04-25 17:09:55.57626+03:30', '2025-04-25 17:09:55.57626+03:30'),
(14, 'afta', 'balali@aftasec.ir', '$2b$10$hash...', 'user', false, NULL, NULL, NULL, NULL, '2025-04-25 17:09:55.57626+03:30', '2025-04-25 17:09:55.57626+03:30'),
(15, 'bahaadini', 'bahaadini.aman@gmail.com', '$2b$10$hash...', 'user', false, NULL, NULL, NULL, NULL, '2025-04-25 17:09:55.57626+03:30', '2025-04-25 17:09:55.57626+03:30'),
(16, 'bahmani', 'bahmani@gmail.com', '$2b$10$hash...', 'user', false, NULL, NULL, NULL, NULL, '2025-04-25 17:09:55.57626+03:30', '2025-04-25 17:09:55.57626+03:30'),
(17, 'baradaran', 'mehrdad.bara@gmail.com', '$2b$10$hash...', 'user', false, NULL, NULL, NULL, NULL, '2025-04-25 17:09:55.57626+03:30', '2025-04-25 17:09:55.57626+03:30'),
(18, 'dci', 'l.pourjavaheri@gmail.com', '$2b$10$hash...', 'user', false, NULL, NULL, NULL, NULL, '2025-04-25 17:09:55.57626+03:30', '2025-04-25 17:09:55.57626+03:30'),
(19, 'golestan', 'maryamtajari68@gmail.com', '$2b$10$hash...', 'user', false, NULL, NULL, NULL, NULL, '2025-04-25 17:09:55.57626+03:30', '2025-04-25 17:09:55.57626+03:30'),
(20, 'habibi', 'donkishot_h@yahoo.com', '$2b$10$hash...', 'user', false, NULL, NULL, NULL, NULL, '2025-04-25 17:09:55.57626+03:30', '2025-04-25 17:09:55.57626+03:30'),
(21, 'kiaei', 'kiaee2007@gmail.com', '$2b$10$hash...', 'user', false, NULL, NULL, NULL, NULL, '2025-04-25 17:09:55.57626+03:30', '2025-04-25 17:09:55.57626+03:30'),
(22, 'kimia', 'm.mohamadi@mekpco.ir', '$2b$10$hash...', 'user', false, NULL, NULL, NULL, NULL, '2025-04-25 17:09:55.57626+03:30', '2025-04-25 17:09:55.57626+03:30'),
(23, 'mana', 'A.hamedani@aranuma.com', '$2b$10$hash...', 'user', false, NULL, NULL, NULL, NULL, '2025-04-25 17:09:55.57626+03:30', '2025-04-25 17:09:55.57626+03:30'),
(24, 'rahahan', 'azizi_a@rai.ir', '$2b$10$hash...', 'user', false, NULL, NULL, NULL, NULL, '2025-04-25 17:09:55.57626+03:30', '2025-04-25 17:09:55.57626+03:30'),
(25, 'ramak', 'amir.maher@ramakdairy.com', '$2b$10$hash...', 'user', false, NULL, NULL, NULL, NULL, '2025-04-25 17:09:55.57626+03:30', '2025-04-25 17:09:55.57626+03:30'),
(26, 'refah', 'K.masoudi@refah.ir', '$2b$10$hash...', 'user', false, NULL, NULL, NULL, NULL, '2025-04-25 17:09:55.57626+03:30', '2025-04-25 17:09:55.57626+03:30'),
(27, 'rezvani', 'omid722@gmail.com', '$2b$10$hash...', 'user', false, NULL, NULL, NULL, NULL, '2025-04-25 17:09:55.57626+03:30', '2025-04-25 17:09:55.57626+03:30'),
(28, 'sitaad', 'info@safenet-co.net', '$2b$10$hash...', 'user', false, NULL, NULL, NULL, NULL, '2025-04-25 17:09:55.57626+03:30', '2025-04-25 17:09:55.57626+03:30'),
(29, 'soltan', 'si.soltanaz@uswr.ac.ir', '$2b$10$hash...', 'user', false, NULL, NULL, NULL, NULL, '2025-04-25 17:09:55.57626+03:30', '2025-04-25 17:09:55.57626+03:30'),
(30, 'tosan', 'bahram.peymani@gmail.com', '$2b$10$hash...', 'user', false, NULL, NULL, NULL, NULL, '2025-04-25 17:09:55.57626+03:30', '2025-04-25 17:09:55.57626+03:30'),
(31, 'wp_update-1719924831', '', '$2b$10$hash...', 'administrator', false, NULL, NULL, NULL, NULL, '2025-04-25 17:09:55.57626+03:30', '2025-04-25 17:09:55.57626+03:30');

-- Set sequence value
SELECT setval('public.users_id_seq', 31, true);

-- Add constraints
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username); 