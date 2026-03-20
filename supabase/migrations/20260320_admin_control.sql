-- Migration to add Admin Control and Payment Tables

-- 1. Admin Settings Table
CREATE TABLE IF NOT EXISTS public.admin_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Subscription Plans Table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    interval TEXT DEFAULT 'month',
    features TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Feature Flags Table
CREATE TABLE IF NOT EXISTS public.feature_flags (
    name TEXT PRIMARY KEY,
    is_enabled BOOLEAN DEFAULT TRUE,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Editable Content Table (CMS)
CREATE TABLE IF NOT EXISTS public.editable_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page TEXT NOT NULL,
    component TEXT NOT NULL,
    content_key TEXT NOT NULL,
    content_value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page, component, content_key)
);

-- 5. Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editable_content ENABLE ROW LEVEL SECURITY;

-- 6. Policies (Admin Only for most)
-- Public read for editable_content and feature_flags (needed for app functionality)
CREATE POLICY "Public read editable_content" ON public.editable_content FOR SELECT USING (true);
CREATE POLICY "Public read feature_flags" ON public.feature_flags FOR SELECT USING (true);
CREATE POLICY "Public read subscription_plans" ON public.subscription_plans FOR SELECT USING (true);

-- Admin only for manage
CREATE POLICY "Admin manage admin_settings" ON public.admin_settings FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin manage subscription_plans" ON public.subscription_plans FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin manage feature_flags" ON public.feature_flags FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin manage editable_content" ON public.editable_content FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- 7. Add trigger for updated_at
CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON public.admin_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON public.subscription_plans FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON public.feature_flags FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_editable_content_updated_at BEFORE UPDATE ON public.editable_content FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
