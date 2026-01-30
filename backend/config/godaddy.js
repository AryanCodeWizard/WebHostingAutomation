const axios = require("axios");

const godaddyAPI = axios.create({
  baseURL: "https://api.ote-godaddy.com", // Use production later
  headers: {
    "Content-Type": "application/json",
    "Authorization": `sso-key ${process.env.GODADDY_KEY}:${process.env.GODADDY_SECRET}`
  }
});

module.exports = godaddyAPI;
