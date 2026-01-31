#!/bin/bash

# WHMCS Payment System - Quick Start Script
# This script helps you set up environment variables

echo "=========================================="
echo "   WHMCS Payment System Quick Setup"
echo "=========================================="
echo ""

# Check if we're in the project root
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📦 Setting up Backend..."
cd backend

# Check if .env exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists in backend"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping backend .env setup"
    else
        cp .env.example .env
        echo "✅ Created backend/.env from .env.example"
    fi
else
    cp .env.example .env
    echo "✅ Created backend/.env from .env.example"
fi

echo ""
echo "📦 Setting up Frontend..."
cd ../frontend

# Check if .env exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists in frontend"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping frontend .env setup"
    else
        cp .env.example .env
        echo "✅ Created frontend/.env from .env.example"
    fi
else
    cp .env.example .env
    echo "✅ Created frontend/.env from .env.example"
fi

cd ..

echo ""
echo "=========================================="
echo "   ✅ Setup Complete!"
echo "=========================================="
echo ""
echo "⚠️  IMPORTANT: Please update the .env files with your actual values:"
echo ""
echo "Backend (.env):"
echo "  - MONGO_URI (MongoDB connection string)"
echo "  - RAZORPAY_KEY_ID (from https://dashboard.razorpay.com)"
echo "  - RAZORPAY_KEY_SECRET"
echo "  - JWT_SECRET (random string, min 32 characters)"
echo ""
echo "Frontend (.env):"
echo "  - VITE_RAZORPAY_KEY_ID (same as backend RAZORPAY_KEY_ID)"
echo ""
echo "=========================================="
echo "   🚀 Next Steps:"
echo "=========================================="
echo ""
echo "1. Install dependencies:"
echo "   cd backend && npm install"
echo "   cd ../frontend && npm install"
echo ""
echo "2. Update .env files with your keys"
echo ""
echo "3. Start the servers:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm run dev"
echo ""
echo "4. Open http://localhost:5173 in your browser"
echo ""
echo "📚 Documentation:"
echo "   - Payment Setup: PAYMENT_SETUP.md"
echo "   - Fixes Summary: FIXES_SUMMARY.md"
echo ""
echo "=========================================="
