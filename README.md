
# Installation Guide

## ⚠️ CAUTION
- There are some absolute paths (like for attachments in chats) that need to be configured for the frontend.

## Prerequisites
- SMTP server
- Splunk host
- Server IP address
- SSH credentials

---

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
sudo apt update
sudo apt install -y nodejs npm git
```

```bash
npx create-next-app@latest
```

update node
```bash
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
source ~/.nvm/nvm.sh
nvm install --lts
nvm use --lts
npm --version

```

### 2. Install and Build Next.js App
```bash
cd Haris
npm install
npm run build
npm start
```

rebuild haris
reboot the server
```bash
rm -rf .next
npm run build
npm start
```


access haris
```bash
npm start -- --hostname 0.0.0.0
```

### 3. Set Up ngrok
```bash
npm install -g ngrok
ngrok config add-authtoken <your_auth_token>
ngrok http 3000
```

### 4. Configure Splunk
- Use the ngrok URL in Splunk

### 5. Optional: Run in Background
```bash
npm install -g pm2
pm2 start npm --name "nextjs" -- start
pm2 start "ngrok http 3000" --name "ngrok"
pm2 save
```
- Copy and run the exact command provided.
```bash
pm2 startup
```

---

## 🚀 Deployment

### cPanel Deployment
1. Create standalone build: `npm run build`
2. Copy public and static files to `.next`
3. Zip `.next` folder
4. Push changes to GitHub
5. Pull changes on cPanel and unzip `.next`
6. Restart Node setup

### Splunk Configuration
- Next.js token and HEC configuration under:  
  `Settings > DATA > Data Inputs`
- Add token name and complete setup

---

## 🛠 Development Essentials

### Splunk Docker Setup
```bash
docker run -p 8000:8000 -p 8088:8088 -p 8089:8089 \
    -e TZ=Africa/Algiers \
    -e "SPLUNK_PASSWORD=MadjourAmir1#" \
    -e "SPLUNK_START_ARGS=--accept-license" \
    --name splunk \
    -it splunk/splunk:latest
```

### Test Splunk HEC
```bash
curl -k https://localhost:8088/services/collector \
  -H "Authorization: Splunk cb5f3d64-250b-4ec9-85da-f2f028f401ab" \
  -d '{"event": "Hello, world!", "sourcetype": "manual"}'
```
**Expected Response:** `{"text":"Success","code":0}`

---

## 🔄 Migration
- Changed from `better-sqlite3` to MySQL for deployment
- Updated `@lib/db.ts` for MySQL
- Added async/await for database functions in routes

---

## 🚨 Alert Management

### Webhook Test
```bash
curl -k https://localhost:8088/services/collector/event \
  -H "Authorization: Splunk cb5f3d64-250b-4ec9-85da-f2f028f401ab" \
  -H "Content-Type: application/json" \
  -d '{"event": {"id": 84078, "alert_name": "YAHMI - Suspicious Execution Blocked By Trellix", "analyst": "Faisal Ghamdi", "status": "Open", "severity": "Critical"}, "sourcetype": "test_sourcetype"}'
```

### Get All Alerts
```bash
curl -k -u admin:MadjourAmir1# https://localhost:8089/services/alerts/fired_alerts \
  --get -d output_mode=json
```

### Trigger Alert
```bash
curl -k https://localhost:8088/services/collector \
  -H "Authorization: Splunk cb5f3d64-250b-4ec9-85da-f2f028f401ab" \
  -d '{"event": "GET /test-page HTTP/1.1 500 Server Error", "sourcetype": "access_combined"}'
```

### Convert to Scheduled Alert
```bash
curl -k -u admin:MadjourAmir1# -X POST \
  "https://localhost:8089/servicesNS/admin/search/saved/searches/500_Server_Error" \
  -d dispatch.earliest_time="-1s" \
  -d dispatch.latest_time="now" \
  -d alert.track=1
```

---

## 📊 Reports

1. List saved searches:
   ```
   https://localhost:8089/services/saved/searches/
   ```
2. Get search history:
   ```
   https://localhost:8089/servicesNS/nobody/search/saved/searches/Errors%20in%20the%20last%2024%20hours/history
   ```
3. Get job events:
   ```
   https://localhost:8089/services/search/v2/jobs/admin__nobody__search__RMD55d9ebac05a79f513_at_1746210162_6/events
   ```

---

## 📜 License Simulation
```bash
curl -k https://localhost:8088/services/collector \
  -H "Authorization: Splunk cb5f3d64-250b-4ec9-85da-f2f028f401ab" \
  -d '{"event": "Successfully added license new_license.license",
    "sourcetype": "splunkd.log",
    "host": "splunk-server-1",
    "source": "/opt/splunk/var/log/splunk/splunkd.log"}'
```

---

## 🔐 Configuration Notes
- Update these values in `src/app/api/table/route.ts`:
  - Password
  - Username
  - Splunk host
