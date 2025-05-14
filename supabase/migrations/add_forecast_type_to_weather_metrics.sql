-- Add forecast_type column to weather_metrics table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'weather_metrics'
        AND column_name = 'forecast_type'
    ) THEN
        ALTER TABLE public.weather_metrics ADD COLUMN forecast_type TEXT;
    END IF;
END $$;
