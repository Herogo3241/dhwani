const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  let dataToPost = [];

  const url = `${process.env.MAIN_URL}`;

  const method = "GET"; // or 'POST', 'PUT', 'DELETE', etc.
  const headers = {
    Authorization: `${process.env.BEARER_TOKEN}`,
    "Content-Type": "application/json", // adjust content type if necessary
  };

  axios({
    method,
    url,
    headers,
  })
    .then(response => {

      const promises = response.data["result"]["content"].map(item => {
        const id = item["id"];
        const event = item["name"];
        const newUrl = `${process.env.SUB_URL_1}${id}${process.env.SUB_URL_2}`;

        return axios({
          method,
          url: newUrl,
          headers,
        }).then(newResponse => {


          const eventData = newResponse.data["result"];
          const completed = eventData ? eventData["COMPLETED"] ?? 0 : 0;
          const total = eventData ? eventData["total"] ?? 0 : 0;
          const accepted = eventData ? eventData["ACCEPTED"] ?? 0 : 0;
          const submitted = eventData ? eventData["SUBMITTED"] ?? 0 : 0;
          const verified = eventData ? eventData["VERIFIED"] ?? 0 : 0;

          dataToPost.push([
            event,
            completed,
            total,
            accepted,
            submitted,
            verified,
          ]);
        });
      });

      Promise.all(promises).then(() => {
        const tableRows = dataToPost.map(row => {
          return `<tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${row[0]}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${row[1]}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${row[2]}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${row[3]}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${row[4]}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${row[5]}</td>
                  </tr>`;
        });

        const table = `<table style="border-collapse: collapse; width: 100%;">
                        <thead>
                          <tr style="background-color: #f2f2f2;">
                            <th style="padding: 8px; border: 1px solid #ddd;">Event</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">Completed</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">Total</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">Accepted</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">Submitted</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">Verified</th>
                          </tr>
                        </thead>
                        <tbody>${tableRows.join("")}</tbody>
                      </table>`;

        res.send(table);
      });
    })
    .catch(error => {
      console.error("Error:", error);
      res.status(500).send("An error occurred while fetching data.");
    });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
