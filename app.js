const express = require("express");
const http = require("http");
const cors = require("cors"); // Import cors module

const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);

// Enable CORS for all routes
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "500MB" })); // Tăng giới hạn kích thước lên 500MB

// Định tuyến các API endpoint
require("./src/app/Controllers/CommonController")(app);
require("./src/app/Controllers/AuthController")(app);
require("./src/app/Controllers/ClassRoomController")(app);

const port = process.env.PORT;
server.listen(port, () => {
  console.log(`Máy chủ đang chạy trên cổng ${port}`);
});
