const godaddyAPI = require("../config/godaddy");
const Domain = require("../models/Domain");
const logger = require("../utils/logger");
const { sendSuccess, sendError } = require("../utils/response");
const { HTTP_STATUS } = require("../constants");

/**
 * Check domain availability via GoDaddy API
 * @route GET /api/domains/check
 * @param {String} req.query.domain - Domain name to check
 */
exports.checkDomain = async (req, res) => {
  try {
    const { domain } = req.query;

    if (!domain) {
      return sendError(res, "Domain name is required", HTTP_STATUS.BAD_REQUEST);
    }

    logger.info(`Checking availability for domain: ${domain}`);

    const response = await godaddyAPI.get("/v1/domains/available", {
      params: { domain }
    });

    return sendSuccess(res, response.data, "Domain availability checked");
  } catch (error) {
    logger.error("Domain availability check failed", error);
    return sendError(
      res,
      "Error checking domain availability",
      error.response?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.response?.data || error
    );
  }
};

/**
 * Get all registered domains from database
 * @route GET /api/domains
 */
exports.getDomains = async (req, res) => {
  try {
    const domains = await Domain.find()
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });
    
    logger.info(`Retrieved ${domains.length} domains from database`);
    
    return sendSuccess(res, domains, "Domains retrieved successfully");
  } catch (error) {
    logger.error("Failed to fetch domains", error);
    return sendError(res, "Error fetching domains", HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

/**
 * Get DNS records for a specific domain
 * @route GET /api/domains/:domain/dns
 * @param {String} req.params.domain - Domain name
 */
exports.getDNSRecords = async (req, res) => {
  try {
    const { domain } = req.params;

    logger.info(`Fetching DNS records for: ${domain}`);

    const response = await godaddyAPI.get(`/v1/domains/${domain}/records`);
    
    return sendSuccess(res, response.data, "DNS records retrieved");
  } catch (error) {
    logger.error(`Failed to fetch DNS records for ${req.params.domain}`, error);
    return sendError(
      res,
      "Error fetching DNS records",
      error.response?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.response?.data || error
    );
  }
};

/**
 * Update A record to point domain to server IP
 * @route PUT /api/domains/:domain/dns/a-record
 * @param {String} req.params.domain - Domain name
 * @param {String} req.body.ip - Server IP address
 */
exports.updateARecord = async (req, res) => {
  try {
    const { domain } = req.params;
    const { ip } = req.body;

    if (!ip) {
      return sendError(res, "IP address is required", HTTP_STATUS.BAD_REQUEST);
    }

    logger.info(`Updating A record for ${domain} to ${ip}`);

    const response = await godaddyAPI.put(
      `/v1/domains/${domain}/records/A/@`,
      [
        {
          data: ip,
          ttl: 600
        }
      ]
    );

    logger.success(`A record updated for ${domain}`);

    return sendSuccess(res, response.data, "A record updated successfully");
  } catch (error) {
    logger.error(`Failed to update A record for ${req.params.domain}`, error);
    return sendError(
      res,
      "Error updating A record",
      error.response?.status || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error.response?.data || error
    );
  }
};
