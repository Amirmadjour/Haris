
curl -k https://localhost:8088/services/collector \
  -H "Authorization: Splunk <YOUR_TOKEN>" \
  -d '{"event": "Hello, world!", "sourcetype": "manual"}'

if it works: {"text":"Success","code":0}


Start docker container
docker run -p 8000:8000 -p 8088:8088 \
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
  -H "Authorization: Splunk a443e563-5f6a-4f67-ab94-7d482210375a" \
  -H "Content-Type: application/json" \
  -d '{"event": {"id": 84078, "alert_name": "YAHMI - Suspicious Execution Blocked By Trellix", "analyst": "Faisal Ghamdi", "status": "Open", "severity": "Critical"}, "sourcetype": "test_sourcetype"}'


##

| makeresults 
| eval _time=now(), message="TEST ALERT" 
| sendalert webhook param.url="http://localhost:3000/api/splunk-alerts"