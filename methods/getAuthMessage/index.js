const axios = require("axios");
const { lighthouseAuthNode } = require("../../config");

module.exports.getAuthMessage = async (address) => {
  try {
    const data = await axios
      .get(`${lighthouseAuthNode}/api/message/${address}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => res.data[0].message);
    return { message: data, error: {} };
  } catch (err) {
    return { message: {}, error: err?.response?.data || err.message };
  }
};
