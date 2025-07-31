// Script pour vérifier si ResponseISOService est accessible
console.log('=== Vérification ResponseISOService ===\n');

async function checkResponseService() {
  try {
    console.log('🔍 Test de la connectivité ResponseISOService...');
    
    // Test 1: Vérifier si le service répond
    console.log('\n📡 Test de connectivité de base:');
    
    const testUrls = [
      'http://localhost:8080/actuator/health',
      'http://localhost:8080/actuator/info',
      'http://localhost:8080/',
      'http://localhost:8088/actuator/health'
    ];
    
    for (const url of testUrls) {
      try {
        const response = await fetch(url);
        console.log(`   ${url}: ${response.status} ${response.statusText}`);
      } catch (error) {
        console.log(`   ${url}: ❌ ${error.message}`);
      }
    }
    
    // Test 2: Vérifier les endpoints existants
    console.log('\n📡 Test des endpoints existants:');
    
    const existingEndpoints = [
      { name: 'Accounts Count', url: 'http://localhost:8088/api/accounts/count' },
      { name: 'Response Count', url: 'http://localhost:8088/api/response/history/count-success' },
      { name: 'Cards Count', url: 'http://localhost:8088/api/cards/count' }
    ];
    
    const token = localStorage.getItem('token');
    
    for (const endpoint of existingEndpoints) {
      try {
        const response = await fetch(endpoint.url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log(`\n📊 ${endpoint.name}:`);
        console.log(`   URL: ${endpoint.url}`);
        console.log(`   Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`   ✅ Données: ${data}`);
        } else {
          const errorText = await response.text();
          console.log(`   ❌ Erreur: ${errorText}`);
        }
      } catch (error) {
        console.log(`   ❌ Erreur de connexion: ${error.message}`);
      }
    }
    
    // Test 3: Vérifier les logs possibles
    console.log('\n📋 Informations de diagnostic:');
    console.log('   - Vérifiez que ResponseISOService est démarré sur le port 8080');
    console.log('   - Vérifiez que GatewayService est démarré sur le port 8088');
    console.log('   - Vérifiez les logs de ResponseISOService pour des erreurs');
    console.log('   - Vérifiez que la base de données contient des données de cartes');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Test spécifique pour les cartes
async function testCardsSpecially() {
  try {
    console.log('\n🔍 Test spécifique pour les cartes...');
    
    const token = localStorage.getItem('token');
    
    // Test avec différents headers
    const testConfigs = [
      { name: 'Avec Auth', headers: { 'Authorization': `Bearer ${token}` } },
      { name: 'Sans Auth', headers: {} },
      { name: 'Content-Type JSON', headers: { 'Content-Type': 'application/json' } }
    ];
    
    for (const config of testConfigs) {
      try {
        console.log(`\n📡 Test ${config.name}:`);
        const response = await fetch('http://localhost:8088/api/cards/count', {
          headers: config.headers
        });
        
        console.log(`   Status: ${response.status}`);
        if (response.ok) {
          const data = await response.json();
          console.log(`   ✅ Données: ${data}`);
        } else {
          const errorText = await response.text();
          console.log(`   ❌ Erreur: ${errorText}`);
        }
      } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur de test spécifique:', error.message);
  }
}

// Test de la base de données directement
async function testDatabaseDirectly() {
  try {
    console.log('\n🔍 Test de la base de données...');
    
    // Test des endpoints qui fonctionnent pour comparer
    const workingEndpoints = [
      { name: 'Accounts', url: 'http://localhost:8088/api/accounts' },
      { name: 'Responses', url: 'http://localhost:8088/api/response/history' }
    ];
    
    const token = localStorage.getItem('token');
    
    for (const endpoint of workingEndpoints) {
      try {
        const response = await fetch(endpoint.url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log(`\n📊 ${endpoint.name}:`);
        console.log(`   Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            console.log(`   ✅ Nombre d'éléments: ${data.length}`);
            if (data.length > 0) {
              console.log(`   📋 Premier élément:`, data[0]);
            }
          } else {
            console.log(`   ✅ Données: ${data}`);
          }
        } else {
          const errorText = await response.text();
          console.log(`   ❌ Erreur: ${errorText}`);
        }
      } catch (error) {
        console.log(`   ❌ Erreur de connexion: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur de test DB:', error.message);
  }
}

// Exécuter les tests
checkResponseService().then(() => {
  testCardsSpecially().then(() => {
    testDatabaseDirectly();
  });
});

console.log('\n=== Solutions Possibles ===');
console.log('1. Redémarrez ResponseISOService');
console.log('2. Vérifiez les logs de démarrage');
console.log('3. Vérifiez que CardController est bien détecté');
console.log('4. Vérifiez la configuration de la base de données');
console.log('5. Vérifiez que la table "card" existe et contient des données'); 