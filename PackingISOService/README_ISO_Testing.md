# 🧪 Test du Service PackingISOService

## 📋 Description
Ce service permet de générer des messages ISO 8583 en format ASCII et HEX à partir de champs JSON.

## 🚀 Endpoints Disponibles

### 1. Pack ASCII
- **URL**: `POST /packing/pack-ascii`
- **Description**: Génère un message ISO en format ASCII
- **Port**: 8082

### 2. Pack HEX
- **URL**: `POST /packing/pack-hex`
- **Description**: Génère un message ISO en format HEX
- **Port**: 8082

## 📝 Format de la Requête

```json
{
  "mti": "0200",
  "fields": {
    "2": "5200828282828210",
    "3": "200000",
    "4": "000000010000",
    "5": "000000010000",
    "6": "000000010000",
    "7": "0315143015",
    "8": "00000100",
    "9": "00000100",
    "10": "00000100",
    "11": "123456",
    "12": "143015",
    "13": "0315",
    "14": "1228",
    "15": "0821",
    "16": "0822",
    "17": "0823",
    "18": "6011",
    "19": "504",
    "20": "504",
    "21": "504",
    "22": "123",
    "23": "001",
    "24": "200",
    "25": "00",
    "26": "12",
    "27": "1",
    "28": "000000100",
    "29": "000000200",
    "30": "000000300",
    "31": "000000400",
    "32": "12345678901",
    "33": "98765432101",
    "34": "9876543210123456789012345678",
    "35": "5200828282828210=2812123456789876",
    "36": "[MASKED TRACK 3 DATA]",
    "37": "ACC135790",
    "38": "123456",
    "39": "",
    "40": "123",
    "41": "T12345",
    "42": "123456789012345",
    "43": "Alice Dupont",
    "44": "ADDITIONAL RESP DATA",
    "45": "TRACK1DATA/EXAMPLE/5200828282828210",
    "46": "DATAISOADDITIONAL",
    "47": "DATANATIONALADDITIONAL",
    "48": "DATAPRIVATEADDITIONAL",
    "49": "MAD",
    "52": "1234567890ABCDEF"
  }
}
```

## 🧪 Comment Tester

### Option 1: Script PowerShell (Windows)
```powershell
.\test_iso_service.ps1
```

### Option 2: Script Bash (Linux/Mac)
```bash
chmod +x test_iso_service.sh
./test_iso_service.sh
```

### Option 3: Curl Manuel
```bash
# Test ASCII
curl -X POST http://localhost:8082/packing/pack-ascii \
  -H "Content-Type: application/json" \
  -d @test_iso_message.json

# Test HEX
curl -X POST http://localhost:8082/packing/pack-hex \
  -H "Content-Type: application/json" \
  -d @test_iso_message.json
```

### Option 4: Postman
1. Ouvrir Postman
2. Créer une nouvelle requête POST
3. URL: `http://localhost:8082/packing/pack-ascii` ou `http://localhost:8082/packing/pack-hex`
4. Headers: `Content-Type: application/json`
5. Body: Copier le contenu de `test_iso_message.json`

## 📊 Réponse Attendue

```json
{
  "message": "0200[champs ISO générés]"
}
```

## 🔧 Prérequis
- Service PackingISOService démarré sur le port 8082
- Java 17+ installé
- Maven installé

## 🚀 Démarrage du Service
```bash
cd PackingISOService
mvn spring-boot:run
```

## 📝 Logs
Les logs sont disponibles dans: `D:/logs/iso-logs.log` 