#!/bin/bash

# SafeHouse Backend - Run Script

echo "🏠 Starting SafeHouse Backend..."

# Check if virtual environment exists
source $HOME/dev/nathacks/natHacksEnv/bin/activate

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies if requirements.txt is newer than venv
if [ requirements.txt -nt venv ]; then
    echo "📥 Installing dependencies..."
    pip install -r requirements.txt
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file..."
    cat > .env << EOL
DATABASE_URL=sqlite:///./safehouse.db
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')
API_HOST=0.0.0.0
API_PORT=8000
EOL
    echo "✅ Created .env file"
fi

# Run the server
echo "🚀 Starting server..."
python -m app.main

