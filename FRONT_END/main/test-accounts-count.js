// Script pour tester le nombre de comptes
console.log('=== Test du Nombre de Comptes ===\n');

async function testAccountsCount() {
  try {
    console.log('🔍 Test de l\'endpoint /api/accounts/count...');
    
    const token = localStorage.getItem('token');
    console.log('🔐 Token présent:', !!token);
    
    // Test du nombre de comptes
    const accountsResponse = await fetch('http://localhost:8088/api/accounts/count', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (accountsResponse.ok) {
      const accountsCount = await accountsResponse.json();
      console.log(`💳 Nombre de comptes: ${accountsCount}`);
      
      if (accountsCount === 0) {
        console.log('⚠️  Aucun compte trouvé dans la base de données');
      } else {
        console.log(`✅ ${accountsCount} compte(s) trouvé(s)`);
      }
    } else {
      console.log(`❌ Erreur comptes: ${accountsResponse.status}`);
      const errorText = await accountsResponse.text();
      console.log(`📝 Détails: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

// Test de tous les comptes
async function testAllAccounts() {
  try {
    console.log('\n🔍 Test de tous les comptes...');
    
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:8088/api/accounts', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const accounts = await response.json();
      console.log(`📋 Liste des comptes (${accounts.length} total):`);
      
      accounts.forEach((account, index) => {
        const status = account.status || 'UNKNOWN';
        const type = account.type || 'UNKNOWN';
        const balance = account.balance || 0;
        const statusIcon = status === 'OPEN' ? '🟢' : '🔴';
        
        console.log(`   ${index + 1}. ${account.pan} (${account.holderName}) - ${statusIcon} ${status} - ${type} - ${balance} ${account.currency}`);
      });
      
      console.log(`\n📊 Résumé:`);
      console.log(`   💳 Total comptes: ${accounts.length}`);
      
      // Compter par statut
      const statusCount = {};
      accounts.forEach(account => {
        const status = account.status || 'UNKNOWN';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
      
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });
      
    } else {
      console.log(`❌ Erreur HTTP: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

// Comparaison avec les utilisateurs
async function compareAccountsVsUsers() {
  try {
    console.log('\n🔍 Comparaison Comptes vs Utilisateurs...');
    
    const token = localStorage.getItem('token');
    
    // Nombre de comptes
    const accountsResponse = await fetch('http://localhost:8088/api/accounts/count', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // Nombre d'utilisateurs
    const usersResponse = await fetch('http://localhost:8088/api/users/count', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (accountsResponse.ok && usersResponse.ok) {
      const accountsCount = await accountsResponse.json();
      const usersCount = await usersResponse.json();
      
      console.log(`📊 Comparaison:`);
      console.log(`   💳 Comptes: ${accountsCount}`);
      console.log(`   👥 Utilisateurs: ${usersCount}`);
      console.log(`   📈 Différence: ${Math.abs(accountsCount - usersCount)}`);
      
      if (accountsCount === usersCount) {
        console.log('✅ Nombre de comptes = Nombre d\'utilisateurs');
      } else if (accountsCount > usersCount) {
        console.log('⚠️  Plus de comptes que d\'utilisateurs');
      } else {
        console.log('⚠️  Plus d\'utilisateurs que de comptes');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur de comparaison:', error.message);
  }
}

// Exécuter les tests
testAccountsCount().then(() => {
  testAllAccounts().then(() => {
    compareAccountsVsUsers();
  });
});

console.log('\n=== Instructions ===');
console.log('1. Ouvrez la console du navigateur (F12)');
console.log('2. Copiez-collez ce script');
console.log('3. Vérifiez les résultats');
console.log('4. Comparez avec le dashboard');
console.log('\n=== Note ===');
console.log('Le dashboard devrait maintenant afficher le nombre de comptes');
console.log('au lieu du nombre d\'utilisateurs dans "Total Comptes"'); 