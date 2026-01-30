const express = require("express");
const router = express.Router();
const domainController = require("../controllers/domainController");

// Domain APIs
router.get("/check", domainController.checkDomain);
router.get("/", domainController.getDomains);
router.get("/:domain/dns", domainController.getDNSRecords);
router.put("/:domain/a-record", domainController.updateARecord);

module.exports = router;
