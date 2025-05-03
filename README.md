# installation

## 🔧 Step 1: Install Node.js and Git (if needed)
```bash
sudo apt update
sudo apt install -y nodejs npm git
```

## 📦 Step 2: Install and Build Your Next.js App


```bash
cd /home/username/your-nextjs-app
```

```bash
npm install
npm run build
npm start
```

## 🌐 Step 3: Install and Start ngrok

```bash
npm install -g ngrok
```
```bash
ngrok config add-authtoken <your_auth_token>
```
```bash
ngrok http 3000
```

## 📬 Step 4: Use the ngrok URL in Splunk


## 🛑 Optional: Run everything in the background


```bash
npm install -g pm2
pm2 start npm --name "nextjs" -- start
pm2 start "ngrok http 3000" --name "ngrok"
```

## Dev necessities

curl -k https://localhost:8088/services/collector \
  -H "Authorization: Splunk cb5f3d64-250b-4ec9-85da-f2f028f401ab" \
  -d '{"event": "Hello, world!", "sourcetype": "manual"}'

if it works: {"text":"Success","code":0}


Start docker container
docker run -p 8000:8000 -p 8088:8088 -p 8089:8089 \
    -e TZ=Africa/Algiers \
    -e "SPLUNK_PASSWORD=MadjourAmir1#" \
    -e "SPLUNK_START_ARGS=--accept-license" \
    --name splunk \
    -it splunk/splunk:latest

docker stop id_or_name

Step							Done?

- Ask client for HEC URL and token ✅				☐
- Confirm SSL config (valid cert or self-signed) 🔒		☐
- Set env vars in your app 📁					☐
- Update code if self-signed cert used				☐
- Build + deploy Next.js app on their server 🚀		☐
- Test logs in Splunk UI (Search by sourcetype="_json")		☐


Deployment on server:

- nextjs token, HEC under settings>DATA>data inputs, enter the name of the token and press next till the end 

## under the file src/app/api/table/route.ts

- password
- username
- host of splunk software

## Add a webhook for Alerts

curl -k https://localhost:8088/services/collector/event \
  -H "Authorization: Splunk cb5f3d64-250b-4ec9-85da-f2f028f401ab" \
  -H "Content-Type: application/json" \
  -d '{"event": {"id": 84078, "alert_name": "YAHMI - Suspicious Execution Blocked By Trellix", "analyst": "Faisal Ghamdi", "status": "Open", "severity": "Critical"}, "sourcetype": "test_sourcetype"}'


## Webhook test

| makeresults 
| eval _time=now(), message="TEST ALERT" 
| sendalert webhook param.url="http://localhost:3000/api/splunk-alerts"


## GET all alerts

curl -k -u admin:MadjourAmir1# https://localhost:8089/services/alerts/fired_alerts \
--get -d output_mode=json


## GET all reports

1 . https://localhost:8089/services/saved/searches/
entry > 2 > id
2 . https://localhost:8089/servicesNS/nobody/search/saved/searches/Errors%20in%20the%20last%2024%20hours/history
entry > 1 > id
3. https://localhost:8089/services/search/v2/jobs/admin__nobody__search__RMD55d9ebac05a79f513_at_1746210162_6/events

## Simulate License Addition

curl -k https://localhost:8088/services/collector \
-H "Authorization: Splunk cb5f3d64-250b-4ec9-85da-f2f028f401ab" \
-d '{"event": "Successfully added license new_license.license",
  "sourcetype": "splunkd.log",
  "host": "splunk-server-1",
  "source": "/opt/splunk/var/log/splunk/splunkd.log"}'

## Trigger alert

curl -k https://localhost:8088/services/collector \
-H "Authorization: Splunk cb5f3d64-250b-4ec9-85da-f2f028f401ab" \
-d '{"event": "GET /test-page HTTP/1.1 500 Server Error", "sourcetype": "access_combined"}'

##  Convert to a scheduled alert with 1-second window

curl -k -u admin:MadjourAmir1# -X POST \
"https://localhost:8089/servicesNS/admin/search/saved/searches/500_Server_Error" \
-d dispatch.earliest_time="-1s" \
-d dispatch.latest_time="now" \
-d alert.track=1

## GET ALL Alerts

curl -k -u admin:MadjourAmir1# https://localhost:8089/services/alerts/fired_alerts \
--get -d output_mode=json

