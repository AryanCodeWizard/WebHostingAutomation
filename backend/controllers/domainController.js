const godaddyAPI = require("../config/godaddy");


// ✅ Check domain availability
exports.checkDomain = async (req, res) => {
  try {
    const { domain } = req.query;
    console.log("Checking availability for domain:", domain);

    const response = await godaddyAPI.get("/v1/domains/available", {
      params: { domain }
    });

    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: "Error checking domain",
      error: error.response?.data || error.message
    });
  }
};


// ✅ Get all domains in account
exports.getDomains = async (req, res) => {
  try {
    const response = await godaddyAPI.get("/v1/domains");
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: "Error fetching domains",
      error: error.response?.data || error.message
    });
  }
};


// ✅ Get DNS records
exports.getDNSRecords = async (req, res) => {
  try {
    const { domain } = req.params;

    const response = await godaddyAPI.get(`/v1/domains/${domain}/records`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: "Error fetching DNS records",
      error: error.response?.data || error.message
    });
  }
};


// ✅ Point domain to server IP (A Record)
exports.updateARecord = async (req, res) => {
  try {
    const { domain } = req.params;
    const { ip } = req.body;

    const response = await godaddyAPI.put(
      `/v1/domains/${domain}/records/A/@`,
      [
        {
          data: ip,
          ttl: 600
        }
      ]
    );

    res.json({ message: "A record updated", response: response.data });
  } catch (error) {
    res.status(error.response?.status || 500).json({
      message: "Error updating A record",
      error: error.response?.data || error.message
    });
  }
};
