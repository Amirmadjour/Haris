This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

curl -k https://localhost:8088/services/collector/event \
  -H "Authorization: Splunk a443e563-5f6a-4f67-ab94-7d482210375a" \
  -H "Content-Type: application/json" \
  -d '{"event": {"id": 84078, "alert_name": "YAHMI - Suspicious Execution Blocked By Trellix", "analyst": "Faisal Ghamdi", "status": "Open", "severity": "Critical"}, "sourcetype": "test_sourcetype"}'