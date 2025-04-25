This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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