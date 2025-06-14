-- Seed Test Users with Realistic Fitness Journeys
-- Run this in your Supabase SQL Editor to create 5 test users with progression data

-- =============================================================================
-- TEST USER 1: Sarah - Fat Loss Journey (6 months)
-- 28-year-old female, lost 45 lbs and 18% body fat
-- =============================================================================

DO $$
DECLARE
    user_id_sarah UUID := '550e8400-e29b-41d4-a716-446655440001';
    start_date DATE := CURRENT_DATE - INTERVAL '6 months';
    current_week INTEGER := 0;
BEGIN
    -- Create user profile
    INSERT INTO public.profiles (
        id, email, name, gender, height, birthday, created_at, updated_at
    ) VALUES (
        user_id_sarah,
        'sarah.chen@example.com',
        'Sarah Chen',
        'female',
        165, -- 5'5"
        '1995-03-15',
        start_date,
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- Create user settings
    INSERT INTO public.user_settings (
        user_id, units, created_at, updated_at
    ) VALUES (
        user_id_sarah, 'imperial', start_date, NOW()
    ) ON CONFLICT (user_id) DO NOTHING;

    -- Create subscription
    INSERT INTO public.subscriptions (
        user_id, status, trial_start_date, trial_end_date, created_at, updated_at
    ) VALUES (
        user_id_sarah, 'active', start_date, start_date + INTERVAL '3 days', start_date, NOW()
    ) ON CONFLICT (user_id) DO NOTHING;

    -- Generate progressive body metrics (6 months of weekly data)
    FOR current_week IN 0..24 LOOP
        INSERT INTO public.body_metrics (
            user_id,
            weight,
            body_fat_percentage,
            method,
            measured_at,
            created_at,
            updated_at
        ) VALUES (
            user_id_sarah,
            195 - (current_week * 1.8), -- Started 195 lbs, lost 45 lbs total
            38 - (current_week * 0.75), -- Started 38% BF, down to 20% BF
            'navy',
            start_date + (current_week * INTERVAL '1 week'),
            start_date + (current_week * INTERVAL '1 week'),
            NOW()
        );
    END LOOP;

    RAISE NOTICE 'Created Sarah Chen - 6 month fat loss journey (195→150 lbs, 38→20%% BF)';
END $$;

-- =============================================================================
-- TEST USER 2: Marcus - Muscle Building Journey (2 years)
-- 24-year-old male, gained 35 lbs of lean mass
-- =============================================================================

DO $$
DECLARE
    user_id_marcus UUID := '550e8400-e29b-41d4-a716-446655440002';
    start_date DATE := CURRENT_DATE - INTERVAL '2 years';
    current_month INTEGER := 0;
BEGIN
    -- Create user profile
    INSERT INTO public.profiles (
        id, email, name, gender, height, birthday, created_at, updated_at
    ) VALUES (
        user_id_marcus,
        'marcus.rodriguez@example.com',
        'Marcus Rodriguez',
        'male',
        180, -- 5'11"
        '1999-08-22',
        start_date,
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- Create user settings
    INSERT INTO public.user_settings (
        user_id, units, created_at, updated_at
    ) VALUES (
        user_id_marcus, 'imperial', start_date, NOW()
    ) ON CONFLICT (user_id) DO NOTHING;

    -- Create subscription
    INSERT INTO public.subscriptions (
        user_id, status, trial_start_date, trial_end_date, created_at, updated_at
    ) VALUES (
        user_id_marcus, 'active', start_date, start_date + INTERVAL '3 days', start_date, NOW()
    ) ON CONFLICT (user_id) DO NOTHING;

    -- Generate progressive body metrics (2 years of monthly data)
    FOR current_month IN 0..24 LOOP
        INSERT INTO public.body_metrics (
            user_id,
            weight,
            body_fat_percentage,
            method,
            measured_at,
            created_at,
            updated_at
        ) VALUES (
            user_id_marcus,
            145 + (current_month * 1.5), -- Started 145 lbs, gained 35 lbs lean mass
            18 - (current_month * 0.125), -- Started 18% BF, down to 15% BF (recomp)
            '3-site',
            start_date + (current_month * INTERVAL '1 month'),
            start_date + (current_month * INTERVAL '1 month'),
            NOW()
        );
    END LOOP;

    RAISE NOTICE 'Created Marcus Rodriguez - 2 year muscle building journey (145→180 lbs, 18→15%% BF)';
END $$;

-- =============================================================================
-- TEST USER 3: Jennifer - Body Recomposition (1 year)
-- 35-year-old female, maintained weight but lost fat and gained muscle
-- =============================================================================

DO $$
DECLARE
    user_id_jennifer UUID := '550e8400-e29b-41d4-a716-446655440003';
    start_date DATE := CURRENT_DATE - INTERVAL '1 year';
    current_month INTEGER := 0;
BEGIN
    -- Create user profile
    INSERT INTO public.profiles (
        id, email, name, gender, height, birthday, created_at, updated_at
    ) VALUES (
        user_id_jennifer,
        'jennifer.thompson@example.com',
        'Jennifer Thompson',
        'female',
        170, -- 5'7"
        '1988-11-03',
        start_date,
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- Create user settings
    INSERT INTO public.user_settings (
        user_id, units, created_at, updated_at
    ) VALUES (
        user_id_jennifer, 'metric', start_date, NOW()
    ) ON CONFLICT (user_id) DO NOTHING;

    -- Create subscription
    INSERT INTO public.subscriptions (
        user_id, status, trial_start_date, trial_end_date, created_at, updated_at
    ) VALUES (
        user_id_jennifer, 'active', start_date, start_date + INTERVAL '3 days', start_date, NOW()
    ) ON CONFLICT (user_id) DO NOTHING;

    -- Generate progressive body metrics (1 year of monthly data - body recomposition)
    FOR current_month IN 0..12 LOOP
        INSERT INTO public.body_metrics (
            user_id,
            weight,
            body_fat_percentage,
            method,
            measured_at,
            created_at,
            updated_at
        ) VALUES (
            user_id_jennifer,
            68 + (CASE WHEN current_month < 6 THEN current_month * 0.5 ELSE 3 - (current_month - 6) * 0.5 END), -- Weight stayed around 68-71 kg
            29 - (current_month * 1.2), -- Started 29% BF, down to 15% BF
            '7-site',
            start_date + (current_month * INTERVAL '1 month'),
            start_date + (current_month * INTERVAL '1 month'),
            NOW()
        );
    END LOOP;

    RAISE NOTICE 'Created Jennifer Thompson - 1 year body recomposition (68kg maintained, 29→15%% BF)';
END $$;

-- =============================================================================
-- TEST USER 4: David - Long-term Transformation (4 years)
-- 42-year-old male, lost 80 lbs over 4 years with some setbacks
-- =============================================================================

DO $$
DECLARE
    user_id_david UUID := '550e8400-e29b-41d4-a716-446655440004';
    start_date DATE := CURRENT_DATE - INTERVAL '4 years';
    current_month INTEGER := 0;
    weight_val NUMERIC;
    bf_val NUMERIC;
BEGIN
    -- Create user profile
    INSERT INTO public.profiles (
        id, email, name, gender, height, birthday, created_at, updated_at
    ) VALUES (
        user_id_david,
        'david.kim@example.com',
        'David Kim',
        'male',
        175, -- 5'9"
        '1981-06-18',
        start_date,
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- Create user settings
    INSERT INTO public.user_settings (
        user_id, units, created_at, updated_at
    ) VALUES (
        user_id_david, 'imperial', start_date, NOW()
    ) ON CONFLICT (user_id) DO NOTHING;

    -- Create subscription
    INSERT INTO public.subscriptions (
        user_id, status, trial_start_date, trial_end_date, created_at, updated_at
    ) VALUES (
        user_id_david, 'active', start_date, start_date + INTERVAL '3 days', start_date, NOW()
    ) ON CONFLICT (user_id) DO NOTHING;

    -- Generate progressive body metrics (4 years with realistic setbacks)
    FOR current_month IN 0..48 LOOP
        -- Realistic weight loss with plateaus and small regains
        IF current_month <= 12 THEN
            weight_val := 275 - (current_month * 2.5); -- First year: lost 30 lbs
        ELSIF current_month <= 18 THEN
            weight_val := 245 + (current_month - 12) * 0.8; -- Plateau/small regain
        ELSIF current_month <= 36 THEN
            weight_val := 250 - (current_month - 18) * 1.8; -- Second major loss phase
        ELSE
            weight_val := 218 - (current_month - 36) * 0.5; -- Final phase
        END IF;

        -- Body fat percentage improvement
        bf_val := 35 - (current_month * 0.35);
        IF bf_val < 18 THEN bf_val := 18; END IF; -- Minimum realistic BF%

        INSERT INTO public.body_metrics (
            user_id,
            weight,
            body_fat_percentage,
            method,
            measured_at,
            created_at,
            updated_at
        ) VALUES (
            user_id_david,
            weight_val,
            bf_val,
            'navy',
            start_date + (current_month * INTERVAL '1 month'),
            start_date + (current_month * INTERVAL '1 month'),
            NOW()
        );
    END LOOP;

    RAISE NOTICE 'Created David Kim - 4 year transformation with setbacks (275→195 lbs, 35→18%% BF)';
END $$;

-- =============================================================================
-- TEST USER 5: Alex - Recent Beginner (3 months)
-- 19-year-old non-binary, rapid newbie gains
-- =============================================================================

DO $$
DECLARE
    user_id_alex UUID := '550e8400-e29b-41d4-a716-446655440005';
    start_date DATE := CURRENT_DATE - INTERVAL '3 months';
    current_week INTEGER := 0;
BEGIN
    -- Create user profile
    INSERT INTO public.profiles (
        id, email, name, gender, height, birthday, created_at, updated_at
    ) VALUES (
        user_id_alex,
        'alex.patel@example.com',
        'Alex Patel',
        'non-binary',
        168, -- 5'6"
        '2004-12-07',
        start_date,
        NOW()
    ) ON CONFLICT (id) DO NOTHING;

    -- Create user settings
    INSERT INTO public.user_settings (
        user_id, units, created_at, updated_at
    ) VALUES (
        user_id_alex, 'metric', start_date, NOW()
    ) ON CONFLICT (user_id) DO NOTHING;

    -- Create subscription
    INSERT INTO public.subscriptions (
        user_id, status, trial_start_date, trial_end_date, created_at, updated_at
    ) VALUES (
        user_id_alex, 'trial', start_date, start_date + INTERVAL '3 days', start_date, NOW()
    ) ON CONFLICT (user_id) DO NOTHING;

    -- Generate progressive body metrics (3 months of weekly data - newbie gains)
    FOR current_week IN 0..12 LOOP
        INSERT INTO public.body_metrics (
            user_id,
            weight,
            body_fat_percentage,
            method,
            measured_at,
            created_at,
            updated_at
        ) VALUES (
            user_id_alex,
            58 + (current_week * 0.7), -- Started 58 kg, gained 8.4 kg (mostly muscle)
            22 - (current_week * 0.6), -- Started 22% BF, down to 15% BF (newbie recomp)
            '3-site',
            start_date + (current_week * INTERVAL '1 week'),
            start_date + (current_week * INTERVAL '1 week'),
            NOW()
        );
    END LOOP;

    RAISE NOTICE 'Created Alex Patel - 3 month newbie gains (58→66 kg, 22→15%% BF)';
END $$;

-- =============================================================================
-- Verification Query
-- =============================================================================

-- Check that all test users were created successfully
SELECT 
    p.name,
    p.gender,
    COUNT(bm.id) as total_measurements,
    MIN(bm.measured_at) as first_measurement,
    MAX(bm.measured_at) as last_measurement,
    ROUND(
        (SELECT weight FROM body_metrics WHERE user_id = p.id ORDER BY measured_at LIMIT 1)::numeric, 1
    ) as starting_weight,
    ROUND(
        (SELECT weight FROM body_metrics WHERE user_id = p.id ORDER BY measured_at DESC LIMIT 1)::numeric, 1
    ) as current_weight,
    ROUND(
        (SELECT body_fat_percentage FROM body_metrics WHERE user_id = p.id ORDER BY measured_at LIMIT 1)::numeric, 1
    ) as starting_bf,
    ROUND(
        (SELECT body_fat_percentage FROM body_metrics WHERE user_id = p.id ORDER BY measured_at DESC LIMIT 1)::numeric, 1
    ) as current_bf
FROM profiles p
LEFT JOIN body_metrics bm ON p.id = bm.user_id
WHERE p.email LIKE '%@example.com'
GROUP BY p.id, p.name, p.gender
ORDER BY p.name;

-- Summary of test user journeys
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TEST USER SUMMARY';
    RAISE NOTICE '========================================';
    RAISE NOTICE '1. Sarah Chen (F, 28): 6-month fat loss - 195→150 lbs, 38→20%% BF';
    RAISE NOTICE '2. Marcus Rodriguez (M, 24): 2-year muscle gain - 145→180 lbs, 18→15%% BF';
    RAISE NOTICE '3. Jennifer Thompson (F, 35): 1-year recomp - 68kg maintained, 29→15%% BF';
    RAISE NOTICE '4. David Kim (M, 42): 4-year transformation - 275→195 lbs, 35→18%% BF';
    RAISE NOTICE '5. Alex Patel (NB, 19): 3-month newbie gains - 58→66 kg, 22→15%% BF';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'All users have realistic progression data with different timelines,';
    RAISE NOTICE 'methods, and body composition goals. Perfect for testing and demos!';
    RAISE NOTICE '========================================';
END $$;