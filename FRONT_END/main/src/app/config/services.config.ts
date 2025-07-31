// Configuration des services backend via GatewayService
export const SERVICES_CONFIG = {
  // Gateway principal
  GATEWAY_URL: 'http://localhost:8088',
  
  // Routes spécifiques pour chaque service via le gateway
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

  CARD_SERVICE: {
    BASE_URL: 'http://localhost:8088',
    ENDPOINTS: {
      COUNT: '/api/cards/count',
      COUNT_ACTIVE: '/api/cards/count/active',
      COUNT_BLOCKED: '/api/cards/count/blocked'
    }
  },
  
  AUTH_SERVICE: {
    BASE_URL: 'http://localhost:8088',
    ENDPOINTS: {
      COUNT: '/api/users/count',
      COUNT_CONNECTED: '/api/users/count/connected'
    }
  }
};

// Fonction utilitaire pour construire les URLs
export function buildServiceUrl(serviceKey: string, endpointKey: string): string {
  const service = SERVICES_CONFIG[serviceKey as keyof typeof SERVICES_CONFIG];
  if (!service || typeof service === 'string') {
    throw new Error(`Service ${serviceKey} non trouvé`);
  }
  
  const endpoint = service.ENDPOINTS[endpointKey as keyof typeof service.ENDPOINTS];
  if (!endpoint) {
    throw new Error(`Endpoint ${endpointKey} non trouvé pour le service ${serviceKey}`);
  }
  
  return `${service.BASE_URL}${endpoint}`;
} 