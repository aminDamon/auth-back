-- ایجاد جدول اگر وجود نداره
CREATE TABLE IF NOT EXISTS logs (
    id BIGSERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    method VARCHAR(10) NOT NULL,
    path TEXT NOT NULL,
    http_version VARCHAR(10),
    status_code INTEGER NOT NULL,
    response_size INTEGER,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ایجاد ایندکس‌ها برای بهبود کارایی
CREATE INDEX IF NOT EXISTS logs_ip_address_idx ON logs(ip_address);
CREATE INDEX IF NOT EXISTS logs_timestamp_idx ON logs(timestamp);
CREATE INDEX IF NOT EXISTS logs_status_code_idx ON logs(status_code);
CREATE INDEX IF NOT EXISTS logs_timestamp_ip_idx ON logs(timestamp, ip_address);

-- ایجاد یک جدول موقت برای import
CREATE TEMP TABLE temp_logs (
    ip_address VARCHAR(45),
    timestamp_str VARCHAR(50),
    method VARCHAR(10),
    path TEXT,
    http_version VARCHAR(10),
    status_code INTEGER,
    response_size INTEGER,
    user_agent TEXT
);

-- کپی داده‌ها از فایل به جدول موقت
\COPY temp_logs(ip_address, timestamp_str, method, path, http_version, status_code, response_size, user_agent) FROM 'logs_prepared.txt' WITH (FORMAT csv, DELIMITER E'\t');

-- انتقال داده‌ها از جدول موقت به جدول اصلی با تبدیل فرمت تاریخ
INSERT INTO logs (ip_address, timestamp, method, path, http_version, status_code, response_size, user_agent, created_at, updated_at)
SELECT 
    ip_address,
    TO_TIMESTAMP(timestamp_str, 'YYYY-MM-DD HH24:MI:SS'),
    method,
    path,
    http_version,
    status_code,
    response_size,
    user_agent,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM temp_logs;

-- پاک کردن جدول موقت
DROP TABLE temp_logs;

-- نمایش تعداد رکوردهای import شده
SELECT COUNT(*) as total_imported FROM logs;