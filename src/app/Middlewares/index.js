const AUTH_TOKEN = require("./authenticateToken");

const onRouteCustom = ({
  app,
  controllerName,
  methods,
  route,
  handler,
  role = "NO_AUTH",
  isFee,
}) => {
  app[methods](
    `/api/v1/${controllerName}/${route}`,
    AUTH_TOKEN({ role, isFee }).authenticateToken,
    handler
  );
};

module.exports = { onRouteCustom };
