#!/bin/bash

# Script de test pour PackingISOService
# Test des endpoints de génération de messages ISO

BASE_URL="http://localhost:8082"
TEST_DATA="test_iso_message.json"

echo "🧪 Test du service PackingISOService"
echo "====================================="

# Test 1: Pack ASCII
echo -e "\n📤 Test 1: Pack ASCII"
if curl -X POST "$BASE_URL/packing/pack-ascii" \
  -H "Content-Type: application/json" \
  -d @"$TEST_DATA" \
  -s -w "\nHTTP Status: %{http_code}\n"; then
  echo "✅ Succès - Message ASCII généré"
else
  echo "❌ Erreur lors du test ASCII"
fi

# Test 2: Pack HEX
echo -e "\n📤 Test 2: Pack HEX"
if curl -X POST "$BASE_URL/packing/pack-hex" \
  -H "Content-Type: application/json" \
  -d @"$TEST_DATA" \
  -s -w "\nHTTP Status: %{http_code}\n"; then
  echo "✅ Succès - Message HEX généré"
else
  echo "❌ Erreur lors du test HEX"
fi

echo -e "\n�� Tests terminés!" 