#!/bin/bash

# PriceActionTalk Setup Script
echo "🚀 Setting up PriceActionTalk development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. Please install PostgreSQL 14+ for database functionality."
    echo "   You can still run the frontend without the database."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "✅ Environment file created. Please edit .env with your configuration."
else
    echo "✅ Environment file already exists"
fi

# Database setup (if PostgreSQL is available)
if command -v psql &> /dev/null; then
    echo "🗄️  Setting up database..."
    
    # Check if database exists
    DB_EXISTS=$(psql -lqt | cut -d \| -f 1 | grep -w priceactiontalk)
    
    if [ -z "$DB_EXISTS" ]; then
        echo "Creating database 'priceactiontalk'..."
        createdb priceactiontalk
        
        if [ $? -eq 0 ]; then
            echo "✅ Database created successfully"
            
            # Run schema
            echo "📋 Setting up database schema..."
            psql -d priceactiontalk -f server/database/schema.sql
            
            if [ $? -eq 0 ]; then
                echo "✅ Database schema created successfully"
            else
                echo "⚠️  Failed to create database schema. You may need to run it manually."
            fi
        else
            echo "⚠️  Failed to create database. You may need to create it manually."
        fi
    else
        echo "✅ Database 'priceactiontalk' already exists"
    fi
else
    echo "⚠️  PostgreSQL not found. Skipping database setup."
fi

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run server:build

if [ $? -eq 0 ]; then
    echo "✅ TypeScript build successful"
else
    echo "⚠️  TypeScript build failed. You may need to fix compilation errors."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start the development servers:"
echo "   Frontend: npm run dev"
echo "   Backend:  npm run server:dev"
echo ""
echo "🌐 The application will be available at:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo "   WebSocket: ws://localhost:3002"
echo ""
echo "📚 For more information, see README.md"
echo ""
echo "Happy trading! 📈"
