// Script de test pour vérifier le nombre d'utilisateurs
const axios = require('axios');

async function testUsersCount() {
  console.log('=== Test du Nombre d\'Utilisateurs ===\n');
  
  const endpoints = [
    'http://localhost:8088/api/users/count',
    'http://localhost:8088/api/accounts/count'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Test de ${endpoint}...`);
      const response = await axios.get(endpoint, { 
        timeout: 5000,
        headers: {
          'Authorization': 'Bearer ' + (localStorage.getItem('token') || 'test-token')
        }
      });
      console.log(`✅ ${endpoint}: ${response.data} utilisateurs`);
    } catch (error) {
      console.log(`❌ ${endpoint}: Erreur - ${error.message}`);
      if (error.response) {
        console.log(`   Statut: ${error.response.status}`);
        console.log(`   Message: ${error.response.data}`);
      }
    }
  }
  
  console.log('\n=== Diagnostic ===');
  console.log('1. Vérifiez que auth-service2 est démarré');
  console.log('2. Vérifiez que le token d\'authentification est valide');
  console.log('3. Vérifiez les logs du GatewayService');
  console.log('4. Vérifiez les logs de auth-service2');
}

// Exécuter le test
testUsersCount().catch(console.error); 