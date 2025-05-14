-- Add unique constraint to weather_metrics table
ALTER TABLE IF EXISTS public.weather_metrics 
ADD CONSTRAINT weather_metrics_address_id_timestamp_key 
UNIQUE (address_id, timestamp);
