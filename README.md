This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

curl -k https://localhost:8088/services/collector/event \
  -H "Authorization: Splunk a443e563-5f6a-4f67-ab94-7d482210375a" \
  -H "Content-Type: application/json" \
  -d '{"event": {"id": 84078, "alert_name": "YAHMI - Suspicious Execution Blocked By Trellix", "analyst": "Faisal Ghamdi", "status": "Open", "severity": "Critical"}, "sourcetype": "test_sourcetype"}'

| makeresults count=3
| eval _time=now() - (300 * random() % 5)
| eval host="mock-host", user="admin", log_level="INFO", component="Licenser",
       message=case(
         random() % 3 == 0, "Added type=enterprise license",
         random() % 3 == 1, "license stack size exceeded",
         true(), "Successfully added license"
       )
| table _time, host, user, log_level, component, message
| sort -_time
