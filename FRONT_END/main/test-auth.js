// Script de test pour l'authentification
console.log('=== Test d\'Authentification ===\n');

// Vérifier le token
const token = localStorage.getItem('token');
console.log('🔍 Token présent:', !!token);

if (token) {
  console.log('📝 Token trouvé dans localStorage');
  
  // Décoder le token JWT
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('📊 Payload du token:', payload);
    
    const expDate = new Date(payload.exp * 1000);
    const now = new Date();
    const isValid = payload.exp * 1000 > Date.now();
    
    console.log('⏰ Expiration:', expDate);
    console.log('🕐 Maintenant:', now);
    console.log('✅ Token valide:', isValid);
    
    if (!isValid) {
      console.warn('⚠️ Token expiré !');
    }
  } catch (error) {
    console.error('❌ Erreur lors du décodage du token:', error);
  }
} else {
  console.warn('⚠️ Aucun token trouvé !');
  console.log('💡 Solution: Se connecter à l\'application');
}

// Test d'une requête avec le token
if (token) {
  console.log('\n🧪 Test de requête authentifiée...');
  
  fetch('http://localhost:8088/api/history/count', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    console.log('📡 Statut de la réponse:', response.status);
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  })
  .then(data => {
    console.log('✅ Requête réussie:', data);
  })
  .catch(error => {
    console.error('❌ Erreur de requête:', error.message);
  });
} else {
  console.log('\n💡 Impossible de tester la requête sans token');
}

console.log('\n=== Instructions ===');
console.log('1. Si pas de token: Aller sur /login et se connecter');
console.log('2. Si token expiré: Se reconnecter');
console.log('3. Si token invalide: Vérifier la configuration JWT');
console.log('4. Actualiser le dashboard après connexion'); 