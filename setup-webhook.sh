#!/bin/bash

# Quick Webhook Setup Script for Local Development

echo "🔧 Setting Up Razorpay Webhook for Local Testing"
echo "================================================"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed!"
    echo ""
    echo "📥 Install ngrok:"
    echo "   brew install ngrok/ngrok/ngrok"
    echo "   or download from: https://ngrok.com/download"
    echo ""
    exit 1
fi

echo "✅ ngrok is installed"
echo ""

# Start ngrok
echo "🚀 Starting ngrok tunnel to localhost:4000..."
echo "   This will create a public URL for your backend"
echo ""
echo "⚠️  IMPORTANT: Keep this terminal window open!"
echo ""
echo "📋 Next Steps:"
echo "   1. Copy the 'Forwarding' HTTPS URL from below"
echo "   2. Go to: https://dashboard.razorpay.com/app/webhooks"
echo "   3. Click 'Add New Webhook'"
echo "   4. Paste: YOUR_NGROK_URL/api/webhooks/razorpay"
echo "   5. Select event: 'payment.captured'"
echo "   6. Copy the 'Secret' and add to backend/.env:"
echo "      RAZORPAY_WEBHOOK_SECRET=your_secret_here"
echo ""
echo "================================================================"
echo ""

ngrok http 4000
