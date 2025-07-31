// Script pour vérifier le nombre réel d'utilisateurs
console.log('=== Vérification du Nombre Réel d\'Utilisateurs ===\n');

// Test de l'endpoint
async function checkRealUsers() {
  try {
    console.log('🔍 Test de l\'endpoint /api/users/count...');
    
    const token = localStorage.getItem('token');
    console.log('🔐 Token présent:', !!token);
    
    const response = await fetch('http://localhost:8088/api/users/count', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const userCount = await response.json();
      console.log(`✅ Nombre réel d'utilisateurs: ${userCount}`);
      
      if (userCount === 26) {
        console.log('⚠️  Attention: Le nombre 26 pourrait être codé en dur');
      } else if (userCount === 0) {
        console.log('❌ Aucun utilisateur trouvé dans la base de données');
      } else {
        console.log(`✅ Nombre d'utilisateurs correct: ${userCount}`);
      }
    } else {
      console.log(`❌ Erreur HTTP: ${response.status}`);
      const errorText = await response.text();
      console.log(`📝 Détails: ${errorText}`);
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

// Test de l'endpoint complet des utilisateurs
async function checkAllUsers() {
  try {
    console.log('\n🔍 Test de l\'endpoint /api/users...');
    
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:8088/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const users = await response.json();
      console.log(`✅ Nombre total d'utilisateurs: ${users.length}`);
      console.log('📋 Liste des utilisateurs:');
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.firstname} ${user.lastname})`);
      });
    } else {
      console.log(`❌ Erreur HTTP: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

// Exécuter les tests
checkRealUsers().then(() => {
  checkAllUsers();
});

console.log('\n=== Instructions ===');
console.log('1. Ouvrez la console du navigateur (F12)');
console.log('2. Copiez-collez ce script');
console.log('3. Vérifiez les résultats');
console.log('4. Comparez avec ce qui s\'affiche sur le dashboard'); 