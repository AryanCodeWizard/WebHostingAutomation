#!/bin/bash

# Test Payment API Endpoint

echo "🧪 Testing Payment API..."
echo ""

# Test 1: Valid request with string invoiceId
echo "Test 1: Valid payment request"
response=$(curl -s -X POST http://localhost:4000/api/payments/create-order \
  -H "Content-Type: application/json" \
  -d '{"invoiceId":"test123","amount":999}')

if echo "$response" | grep -q '"id"'; then
    echo "✅ Test 1 PASSED - Order created successfully"
    echo "Response: $response"
else
    echo "❌ Test 1 FAILED"
    echo "Response: $response"
fi

echo ""
echo "---"
echo ""

# Test 2: Valid request with ObjectId
echo "Test 2: Valid payment request with ObjectId"
response=$(curl -s -X POST http://localhost:4000/api/payments/create-order \
  -H "Content-Type: application/json" \
  -d '{"invoiceId":"507f1f77bcf86cd799439011","amount":1499}')

if echo "$response" | grep -q '"id"'; then
    echo "✅ Test 2 PASSED - Order created with ObjectId"
    echo "Response: $response"
else
    echo "❌ Test 2 FAILED"
    echo "Response: $response"
fi

echo ""
echo "---"
echo ""

# Test 3: Invalid request - missing amount
echo "Test 3: Missing amount"
response=$(curl -s -X POST http://localhost:4000/api/payments/create-order \
  -H "Content-Type: application/json" \
  -d '{"invoiceId":"test123"}')

if echo "$response" | grep -q '"error"'; then
    echo "✅ Test 3 PASSED - Error handled correctly"
    echo "Response: $response"
else
    echo "❌ Test 3 FAILED"
    echo "Response: $response"
fi

echo ""
echo "---"
echo ""

# Test 4: Invalid request - zero amount
echo "Test 4: Zero amount"
response=$(curl -s -X POST http://localhost:4000/api/payments/create-order \
  -H "Content-Type: application/json" \
  -d '{"invoiceId":"test123","amount":0}')

if echo "$response" | grep -q '"error"'; then
    echo "✅ Test 4 PASSED - Zero amount rejected"
    echo "Response: $response"
else
    echo "❌ Test 4 FAILED"
    echo "Response: $response"
fi

echo ""
echo "🎉 All tests completed!"
