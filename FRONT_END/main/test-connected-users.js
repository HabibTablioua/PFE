// Script pour tester le nombre d'utilisateurs connectés
console.log('=== Test des Utilisateurs Connectés ===\n');

async function testConnectedUsers() {
  try {
    console.log('🔍 Test de l\'endpoint /api/users/count/connected...');
    
    const token = localStorage.getItem('token');
    console.log('🔐 Token présent:', !!token);
    
    // Test du nombre total d'utilisateurs
    const totalResponse = await fetch('http://localhost:8088/api/users/count', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (totalResponse.ok) {
      const totalUsers = await totalResponse.json();
      console.log(`📊 Nombre total d'utilisateurs: ${totalUsers}`);
    } else {
      console.log(`❌ Erreur total users: ${totalResponse.status}`);
    }
    
    // Test du nombre d'utilisateurs connectés
    const connectedResponse = await fetch('http://localhost:8088/api/users/count/connected', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (connectedResponse.ok) {
      const connectedUsers = await connectedResponse.json();
      console.log(`🟢 Nombre d'utilisateurs connectés: ${connectedUsers}`);
      
      if (connectedUsers === 0) {
        console.log('⚠️  Aucun utilisateur connecté actuellement');
      } else {
        console.log(`✅ ${connectedUsers} utilisateur(s) connecté(s)`);
      }
    } else {
      console.log(`❌ Erreur connected users: ${connectedResponse.status}`);
      const errorText = await connectedResponse.text();
      console.log(`📝 Détails: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

// Test de tous les utilisateurs avec leur status
async function testAllUsersWithStatus() {
  try {
    console.log('\n🔍 Test de tous les utilisateurs avec leur status...');
    
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:8088/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const users = await response.json();
      console.log(`📋 Liste des utilisateurs (${users.length} total):`);
      
      let onlineCount = 0;
      let offlineCount = 0;
      
      users.forEach((user, index) => {
        const status = user.status || 'offline';
        const statusIcon = status === 'online' ? '🟢' : '🔴';
        console.log(`   ${index + 1}. ${user.email} (${user.firstname} ${user.lastname}) - ${statusIcon} ${status}`);
        
        if (status === 'online') {
          onlineCount++;
        } else {
          offlineCount++;
        }
      });
      
      console.log(`\n📊 Résumé:`);
      console.log(`   🟢 Connectés: ${onlineCount}`);
      console.log(`   🔴 Déconnectés: ${offlineCount}`);
      console.log(`   📊 Total: ${users.length}`);
      
    } else {
      console.log(`❌ Erreur HTTP: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

// Exécuter les tests
testConnectedUsers().then(() => {
  testAllUsersWithStatus();
});

console.log('\n=== Instructions ===');
console.log('1. Ouvrez la console du navigateur (F12)');
console.log('2. Copiez-collez ce script');
console.log('3. Vérifiez les résultats');
console.log('4. Comparez avec le dashboard');
console.log('\n=== Note ===');
console.log('Pour tester la connexion, connectez-vous avec différents comptes');
console.log('et vérifiez que le nombre d\'utilisateurs connectés augmente'); 