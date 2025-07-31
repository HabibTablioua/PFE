// Script de test pour vérifier la connectivité aux services
const axios = require('axios');

const SERVICES = {
  TRANSACTION: 'http://localhost:8088/api/history/count',
  INCIDENT: 'http://localhost:8088/api/incidents/count',
  RESPONSE_SUCCESS: 'http://localhost:8088/api/response/history/count-success',
  RESPONSE_FAILED: 'http://localhost:8088/api/response/history/count-failed',
  ACCOUNT: 'http://localhost:8088/api/accounts/count',
  USER: 'http://localhost:8088/api/users/count'
};

async function testService(url, name) {
  try {
    console.log(`🔍 Test de ${name}...`);
    const response = await axios.get(url, { timeout: 5000 });
    console.log(`✅ ${name}: ${response.data}`);
    return response.data;
  } catch (error) {
    console.log(`❌ ${name}: Erreur - ${error.message}`);
    return 0;
  }
}

async function testAllServices() {
  console.log('=== Test de Connectivité des Services ===\n');
  
  const results = await Promise.all([
    testService(SERVICES.TRANSACTION, 'TransactionHistoryService'),
    testService(SERVICES.INCIDENT, 'IncidentReportService'),
    testService(SERVICES.RESPONSE_SUCCESS, 'ResponseISO Success'),
    testService(SERVICES.RESPONSE_FAILED, 'ResponseISO Failed'),
    testService(SERVICES.ACCOUNT, 'AccountService'),
    testService(SERVICES.USER, 'AuthService')
  ]);
  
  console.log('\n=== Résumé ===');
  console.log(`Transactions: ${results[0]}`);
  console.log(`Incidents: ${results[1]}`);
  console.log(`Réponses Succès: ${results[2]}`);
  console.log(`Réponses Échec: ${results[3]}`);
  console.log(`Comptes: ${results[4]}`);
  console.log(`Utilisateurs: ${results[5]}`);
  
  const total = results.reduce((sum, val) => sum + val, 0);
  console.log(`\nTotal des données: ${total}`);
  
  if (total === 0) {
    console.log('\n⚠️  Aucune donnée trouvée. Vérifiez que:');
    console.log('1. Les services backend sont démarrés');
    console.log('2. Le GatewayService est accessible sur le port 8088');
    console.log('3. Les services sont enregistrés dans Eureka');
  } else {
    console.log('\n✅ Services accessibles avec des données !');
  }
}

// Exécuter le test
testAllServices().catch(console.error); 