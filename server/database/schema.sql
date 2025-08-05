-- PriceActionTalk Database Schema
-- PostgreSQL schema designed for easy SurrealDB migration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium')),
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    stripe_customer_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    theme VARCHAR(10) DEFAULT 'dark' CHECK (theme IN ('light', 'dark')),
    language VARCHAR(10) DEFAULT 'en',
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    plan VARCHAR(20) CHECK (plan IN ('basic', 'premium')),
    status VARCHAR(20) CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trades table
CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    instrument VARCHAR(20) NOT NULL,
    side VARCHAR(4) CHECK (side IN ('buy', 'sell')),
    entry_price DECIMAL(12, 5) NOT NULL,
    exit_price DECIMAL(12, 5),
    quantity DECIMAL(12, 2) NOT NULL,
    stop_loss DECIMAL(12, 5),
    take_profit DECIMAL(12, 5),
    entry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    exit_time TIMESTAMP WITH TIME ZONE,
    strategy_tags TEXT[],
    emotions TEXT[],
    notes TEXT,
    pnl DECIMAL(12, 2),
    status VARCHAR(10) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Macro bias data table
CREATE TABLE macro_bias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    currency VARCHAR(3) NOT NULL,
    heat_score DECIMAL(3, 1) CHECK (heat_score >= -5 AND heat_score <= 5),
    cot_score DECIMAL(5, 2),
    retail_sentiment_score DECIMAL(5, 2),
    price_momentum_score DECIMAL(5, 2),
    macro_surprise_score DECIMAL(5, 2),
    factors JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Learning paths table
CREATE TABLE learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    level_requirement INTEGER DEFAULT 1,
    estimated_duration INTEGER, -- in minutes
    xp_reward INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Learning modules table
CREATE TABLE learning_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    module_type VARCHAR(20) CHECK (module_type IN ('lesson', 'quiz', 'assignment')),
    order_index INTEGER NOT NULL,
    xp_reward INTEGER DEFAULT 0,
    requirements TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User progress table
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES learning_modules(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    score INTEGER,
    attempts INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, module_id)
);

-- Challenges table
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    challenge_type VARCHAR(20) CHECK (challenge_type IN ('daily', 'weekly', 'monthly')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    entry_fee_xp INTEGER DEFAULT 0,
    reward_xp INTEGER DEFAULT 0,
    max_participants INTEGER,
    rules TEXT[],
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Challenge participants table
CREATE TABLE challenge_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    entry_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    final_score DECIMAL(10, 2),
    rank INTEGER,
    trades_count INTEGER DEFAULT 0,
    win_rate DECIMAL(5, 2),
    roi DECIMAL(8, 2),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'disqualified')),
    UNIQUE(challenge_id, user_id)
);

-- Forum posts table
CREATE TABLE forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    tags TEXT[],
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Forum replies table
CREATE TABLE forum_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_reply_id UUID REFERENCES forum_replies(id) ON DELETE CASCADE,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    room VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Price data table (for demo trading)
CREATE TABLE price_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    price DECIMAL(12, 5) NOT NULL,
    change_amount DECIMAL(12, 5),
    change_percent DECIMAL(5, 2),
    volume BIGINT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_instrument ON trades(instrument);
CREATE INDEX idx_trades_entry_time ON trades(entry_time);
CREATE INDEX idx_macro_bias_currency ON macro_bias(currency);
CREATE INDEX idx_macro_bias_timestamp ON macro_bias(timestamp);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_forum_posts_category ON forum_posts(category);
CREATE INDEX idx_forum_posts_created_at ON forum_posts(created_at);
CREATE INDEX idx_forum_replies_post_id ON forum_replies(post_id);
CREATE INDEX idx_chat_messages_room ON chat_messages(room);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX idx_price_data_symbol ON price_data(symbol);
CREATE INDEX idx_price_data_timestamp ON price_data(timestamp);

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON trades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON learning_paths FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_modules_updated_at BEFORE UPDATE ON learning_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_replies_updated_at BEFORE UPDATE ON forum_replies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample learning data
INSERT INTO learning_paths (title, description, level_requirement, estimated_duration, xp_reward) VALUES
('Trading Fundamentals', 'Master the basics of price action trading and market structure', 1, 480, 500),
('Risk Management Mastery', 'Learn advanced risk management techniques and position sizing', 3, 360, 400),
('Psychology & Discipline', 'Develop the mental framework for consistent trading success', 5, 300, 350),
('Advanced Price Action', 'Deep dive into complex price action patterns and market dynamics', 8, 600, 750),
('Macro Analysis', 'Understand macroeconomic factors that drive currency movements', 10, 420, 600);

INSERT INTO learning_modules (path_id, title, content, module_type, order_index, xp_reward) VALUES
-- Trading Fundamentals modules
((SELECT id FROM learning_paths WHERE title = 'Trading Fundamentals'), 'Introduction to Price Action', 'Welcome to the world of price action trading. In this module, you will learn the fundamental concepts that form the foundation of successful trading.

Price action is the movement of a security''s price plotted over time. It forms the basis for all technical analysis and is considered by many to be the purest form of market analysis.

Key concepts covered:
- What is price action?
- Why price action matters
- Basic chart reading
- Support and resistance levels
- Market structure basics

By the end of this module, you will understand the core principles that drive price movements and how to read basic chart patterns.', 'lesson', 1, 50),

((SELECT id FROM learning_paths WHERE title = 'Trading Fundamentals'), 'Support and Resistance', 'Support and resistance levels are the cornerstone of price action trading. These levels represent areas where price has historically had difficulty breaking through.

Support Level: A price level where a downtrend can be expected to pause due to a concentration of demand or buying interest.

Resistance Level: A price level where an uptrend can be expected to pause due to a concentration of supply or selling interest.

Key learning points:
- How to identify support and resistance
- The role of psychological levels
- Dynamic vs static levels
- How to trade bounces and breaks

Practice identifying these levels on different timeframes to build your pattern recognition skills.', 'lesson', 2, 50),

((SELECT id FROM learning_paths WHERE title = 'Trading Fundamentals'), 'Market Structure Quiz', 'Test your understanding of basic market structure concepts.', 'quiz', 3, 75),

-- Risk Management modules
((SELECT id FROM learning_paths WHERE title = 'Risk Management Mastery'), 'Position Sizing Fundamentals', 'Position sizing is arguably the most important aspect of trading that determines long-term success. This module covers the mathematical foundations of risk management.

Key topics:
- The 1% rule and why it works
- Fixed dollar vs percentage risk
- Position size calculation formulas
- Risk-reward ratios
- Portfolio heat and correlation

Remember: You can be right about market direction 60% of the time and still lose money if your position sizing is wrong.', 'lesson', 1, 60),

((SELECT id FROM learning_paths WHERE title = 'Risk Management Mastery'), 'Stop Loss Strategies', 'Learn different approaches to setting stop losses and when to use each method.

Types of stop losses:
- Technical stops (support/resistance)
- Volatility-based stops (ATR)
- Time-based stops
- Trailing stops

Each method has its place depending on market conditions and trading style.', 'lesson', 2, 60),

-- Psychology modules
((SELECT id FROM learning_paths WHERE title = 'Psychology & Discipline'), 'Trading Psychology Basics', 'The mental game of trading is often what separates successful traders from the rest. This module introduces key psychological concepts.

Common psychological traps:
- Fear of missing out (FOMO)
- Revenge trading
- Overconfidence bias
- Loss aversion

Developing discipline and emotional control is a journey that requires constant practice and self-awareness.', 'lesson', 1, 70);

-- Insert sample challenges
INSERT INTO challenges (title, description, challenge_type, start_date, end_date, entry_fee_xp, reward_xp, max_participants, rules, status) VALUES
('Weekly Trading Challenge', 'Compete with other traders in a week-long demo trading competition', 'weekly', NOW(), NOW() + INTERVAL '7 days', 100, 500, 100, ARRAY['Demo trading only', 'Maximum 10 trades', 'Risk per trade: 2%'], 'active'),
('Monthly Consistency Challenge', 'Focus on consistent returns over flashy gains', 'monthly', NOW(), NOW() + INTERVAL '30 days', 200, 1000, 50, ARRAY['Minimum 20 trades', 'Maximum drawdown: 10%', 'Target: 5% monthly return'], 'active');

-- Risk management tables
CREATE TABLE risk_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    max_risk_per_trade DECIMAL(5,2) DEFAULT 2.0,
    max_daily_loss DECIMAL(5,2) DEFAULT 5.0,
    max_weekly_loss DECIMAL(5,2) DEFAULT 10.0,
    max_monthly_loss DECIMAL(5,2) DEFAULT 20.0,
    max_open_trades INTEGER DEFAULT 5,
    max_correlation_exposure DECIMAL(5,2) DEFAULT 15.0,
    trading_enabled BOOLEAN DEFAULT true,
    auto_close_enabled BOOLEAN DEFAULT false,
    emergency_stop_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE TABLE trade_blockers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    auto_resolve_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    severity VARCHAR(20) DEFAULT 'warning' CHECK (severity IN ('warning', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_risk_settings_user_id ON risk_settings(user_id);
CREATE INDEX idx_trade_blockers_user_id ON trade_blockers(user_id);
CREATE INDEX idx_trade_blockers_active ON trade_blockers(user_id, is_active);

-- Triggers for risk management
CREATE TRIGGER update_risk_settings_updated_at BEFORE UPDATE ON risk_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trade_blockers_updated_at BEFORE UPDATE ON trade_blockers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
