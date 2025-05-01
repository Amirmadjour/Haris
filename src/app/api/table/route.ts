import https from "https";
import axios from "axios";


export async function GET() {
  const httpsAgent = new https.Agent({ rejectUnauthorized: false });
  const SPLUNK_HOST = "https://localhost:8089";
  const SPLUNK_USER = "admin";
  const SPLUNK_PASS = "MadjourAmir1#";

/*  const SPL_QUERY = `
search sourcetype="splunkd.log"  
| search "Added type=enterprise license" OR "license stack" OR "Successfully added license"
| table _time, host, user, log_level, component, message
| sort -_time
  `; */

  const SPL_QUERY = `
  search sourcetype=test_sourcetype | table id alert_name analyst status severity`

  try {
    // Authentication
    const authRes = await axios.post(
      `${SPLUNK_HOST}/services/auth/login`,
      `username=${SPLUNK_USER}&password=${SPLUNK_PASS}&output_mode=json`,
      { httpsAgent }
    );

    const sessionKey = authRes.data.sessionKey;

    const searchRes = await axios.post(
      `${SPLUNK_HOST}/services/search/jobs`,
      `search=${encodeURIComponent(SPL_QUERY)}&output_mode=json`,
      {
        httpsAgent,
        headers: {
          Authorization: `Bearer ${sessionKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const sid = searchRes.data.sid;

    let isDone = false;
    let results;
    while (!isDone) {
      const statusRes = await axios.get(
        `${SPLUNK_HOST}/services/search/jobs/${sid}?output_mode=json`,
        { httpsAgent, headers: { Authorization: `Bearer ${sessionKey}` } }
      );

      isDone = statusRes.data.entry[0].content.isDone;
      if (!isDone) await new Promise((r) => setTimeout(r, 1000));
      else {
        results = await axios.get(
          `${SPLUNK_HOST}/services/search/jobs/${sid}/results?output_mode=json`,
          { httpsAgent, headers: { Authorization: `Bearer ${sessionKey}` } }
        );
      }
    }

    if (!results) return;
    console.log(results.data.results);

    const transformedData = {
      severityCounts: {
        Critical: results.data.results.filter(
          (r: any) => r.severity === "Critical"
        ).length,
        High: results.data.results.filter((r: any) => r.severity === "High")
          .length,
        Medium: results.data.results.filter((r: any) => r.severity === "Medium")
          .length,
        Low: results.data.results.filter((r: any) => r.severity === "Low")
          .length,
      },
      statusCounts: {
        Open: results.data.results.filter((r: any) => r.status === "Open")
          .length,
        Assigned: results.data.results.filter(
          (r: any) => r.status === "Assigned"
        ).length,
        EngineeringReview: results.data.results.filter(
          (r: any) => r.status === "Engineering Review"
        ).length,
      },
      caseDetails: results.data.results.map((r: any) => ({
        id: r.id,
        alert: r.alert_name,
        analyst: r.analyst,
        status: r.status,
        severity: r.severity,
      })),
    };

    console.log(transformedData);

    return Response.json(transformedData);
  } catch (error: any) {
    console.error("Splunk error:", error.response?.data || error.message);
    return Response.json(
      {
        error: "Query execution failed",
        details: {
          message: error.response?.data?.messages?.[0]?.text || error.message,
          suggestion:
            "Verify your sourcetype exists using: | metadata type=sourcetypes",
        },
      },
      { status: 500 }
    );
  }
}
