// Script pour déboguer l'endpoint des cartes bancaires
console.log('=== Debug Endpoint Cartes Bancaires ===\n');

async function debugCardsEndpoint() {
  try {
    console.log('🔍 Test direct de l\'endpoint /api/cards/count...');
    
    const token = localStorage.getItem('token');
    console.log('🔐 Token présent:', !!token);
    
    // Test 1: Endpoint via Gateway
    console.log('\n📡 Test via Gateway (port 8088):');
    const gatewayResponse = await fetch('http://localhost:8088/api/cards/count', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`   Status: ${gatewayResponse.status}`);
    if (gatewayResponse.ok) {
      const count = await gatewayResponse.json();
      console.log(`   ✅ Nombre de cartes: ${count}`);
    } else {
      const errorText = await gatewayResponse.text();
      console.log(`   ❌ Erreur: ${errorText}`);
    }
    
    // Test 2: Endpoint direct (si ResponseISOService est sur un port différent)
    console.log('\n📡 Test direct sur ResponseISOService (port 8080):');
    try {
      const directResponse = await fetch('http://localhost:8080/cards/count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`   Status: ${directResponse.status}`);
      if (directResponse.ok) {
        const count = await directResponse.json();
        console.log(`   ✅ Nombre de cartes: ${count}`);
      } else {
        const errorText = await directResponse.text();
        console.log(`   ❌ Erreur: ${errorText}`);
      }
    } catch (error) {
      console.log(`   ❌ Erreur de connexion: ${error.message}`);
    }
    
    // Test 3: Endpoint sans authentification
    console.log('\n📡 Test sans authentification:');
    try {
      const noAuthResponse = await fetch('http://localhost:8088/api/cards/count');
      console.log(`   Status: ${noAuthResponse.status}`);
      if (noAuthResponse.ok) {
        const count = await noAuthResponse.json();
        console.log(`   ✅ Nombre de cartes: ${count}`);
      } else {
        const errorText = await noAuthResponse.text();
        console.log(`   ❌ Erreur: ${errorText}`);
      }
    } catch (error) {
      console.log(`   ❌ Erreur de connexion: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

// Test de tous les endpoints de cartes
async function testAllCardEndpoints() {
  try {
    console.log('\n🔍 Test de tous les endpoints de cartes...');
    
    const token = localStorage.getItem('token');
    const endpoints = [
      { name: 'Count Total', url: 'http://localhost:8088/api/cards/count' },
      { name: 'Count Active', url: 'http://localhost:8088/api/cards/count/active' },
      { name: 'Count Blocked', url: 'http://localhost:8088/api/cards/count/blocked' },
      { name: 'All Cards', url: 'http://localhost:8088/api/cards' }
    ];
    
    for (const endpoint of endpoints) {
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
    console.error('❌ Erreur de test:', error.message);
  }
}

// Test de la base de données directement
async function testDatabaseConnection() {
  try {
    console.log('\n🔍 Test de la connexion à la base de données...');
    
    // Test des autres endpoints pour voir si le service fonctionne
    const testEndpoints = [
      { name: 'Accounts Count', url: 'http://localhost:8088/api/accounts/count' },
      { name: 'Response Count', url: 'http://localhost:8088/api/response/history/count-success' }
    ];
    
    const token = localStorage.getItem('token');
    
    for (const endpoint of testEndpoints) {
      try {
        const response = await fetch(endpoint.url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log(`\n📊 ${endpoint.name}:`);
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
    
  } catch (error) {
    console.error('❌ Erreur de test DB:', error.message);
  }
}

// Exécuter les tests
debugCardsEndpoint().then(() => {
  testAllCardEndpoints().then(() => {
    testDatabaseConnection();
  });
});

console.log('\n=== Instructions ===');
console.log('1. Ouvrez la console du navigateur (F12)');
console.log('2. Copiez-collez ce script');
console.log('3. Vérifiez les résultats');
console.log('4. Comparez avec les autres endpoints');
console.log('\n=== Solutions Possibles ===');
console.log('- Vérifiez que ResponseISOService est démarré');
console.log('- Vérifiez que GatewayService route correctement');
console.log('- Vérifiez que la base de données contient des cartes');
console.log('- Vérifiez les logs de ResponseISOService'); 