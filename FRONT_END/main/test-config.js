// Script de test pour vérifier la configuration des services
const SERVICES_CONFIG = {
  GATEWAY_URL: 'http://localhost:8088',
  
  TRANSACTION_SERVICE: {
    BASE_URL: 'http://localhost:8088',
    ENDPOINTS: {
      COUNT: '/api/history/count',
      PER_STATUS: '/api/history/per-status',
      PER_SOURCE: '/api/history/per-source',
      PER_DAY: '/api/history/per-day'
    }
  },
  
  INCIDENT_SERVICE: {
    BASE_URL: 'http://localhost:8088',
    ENDPOINTS: {
      COUNT: '/api/incidents/count',
      COUNT_NON_TRAITE: '/api/incidents/count-non-traite',
      COUNT_RESOLU: '/api/incidents/count-resolu'
    }
  },
  
  RESPONSE_SERVICE: {
    BASE_URL: 'http://localhost:8088',
    ENDPOINTS: {
      COUNT_SUCCESS: '/api/response/history/count-success',
      COUNT_FAILED: '/api/response/history/count-failed',
      HISTORY: '/api/response/history'
    }
  },
  
  ACCOUNT_SERVICE: {
    BASE_URL: 'http://localhost:8088',
    ENDPOINTS: {
      COUNT: '/api/accounts/count'
    }
  },
  
  AUTH_SERVICE: {
    BASE_URL: 'http://localhost:8088',
    ENDPOINTS: {
      COUNT: '/api/users/count'
    }
  }
};

function buildServiceUrl(serviceKey, endpointKey) {
  const service = SERVICES_CONFIG[serviceKey];
  if (!service || typeof service === 'string') {
    throw new Error(`Service ${serviceKey} non trouvé`);
  }
  
  const endpoint = service.ENDPOINTS[endpointKey];
  if (!endpoint) {
    throw new Error(`Endpoint ${endpointKey} non trouvé pour le service ${serviceKey}`);
  }
  
  return `${service.BASE_URL}${endpoint}`;
}

// Test des URLs
console.log('=== Test de Configuration ===');

try {
  console.log('TRANSACTION_SERVICE.COUNT:', buildServiceUrl('TRANSACTION_SERVICE', 'COUNT'));
  console.log('TRANSACTION_SERVICE.PER_DAY:', buildServiceUrl('TRANSACTION_SERVICE', 'PER_DAY'));
  console.log('INCIDENT_SERVICE.COUNT:', buildServiceUrl('INCIDENT_SERVICE', 'COUNT'));
  console.log('RESPONSE_SERVICE.COUNT_SUCCESS:', buildServiceUrl('RESPONSE_SERVICE', 'COUNT_SUCCESS'));
  console.log('RESPONSE_SERVICE.HISTORY:', buildServiceUrl('RESPONSE_SERVICE', 'HISTORY'));
  console.log('ACCOUNT_SERVICE.COUNT:', buildServiceUrl('ACCOUNT_SERVICE', 'COUNT'));
  console.log('AUTH_SERVICE.COUNT:', buildServiceUrl('AUTH_SERVICE', 'COUNT'));
  
  console.log('\n✅ Toutes les URLs sont valides !');
} catch (error) {
  console.error('❌ Erreur:', error.message);
} 