const handler = require('../api/index');

const req = {
  query: {
    boss: ["MILESTONE 1:3:3", "MILESTONE 2:5:1"]
  }
};

const res = {
  statusCode: 200,
  headers: {},
  setHeader(k, v) { this.headers[k] = v; },
  status(c) { this.statusCode = c; return this; },
  send(body) {
    console.log("Status:", this.statusCode);
    console.log("Headers:", this.headers);
    console.log("SVG Length:", body.length);
    if (!body.includes("<svg") || !body.includes("MILESTONE 1")) {
      throw new Error("Invalid SVG generated from API!");
    }
    console.log("✔ Serverless API Handler test passed successfully!");
  }
};

handler(req, res);
