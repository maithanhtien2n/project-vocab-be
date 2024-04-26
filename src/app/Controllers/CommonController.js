module.exports = (app) => {
  const { onResponse, checkNullRequest } = require("../Utils/index");
  const { onRouteCustom } = require("../Middlewares/index");

  const controllerName = "common";
  const onRoute = ({ route, role, isFee, methods, handler }) => {
    onRouteCustom({
      app,
      controllerName,
      methods,
      route,
      handler,
      role,
      isFee,
    });
  };

  // Service import
  const commonService = require("../Services/CommonService");

  const getFileContentType = (fileName) => {
    const fileExtension = fileName.split(".").pop().toLowerCase();

    switch (fileExtension) {
      case "mp4":
        return "video/mp4";
      case "mp3":
        return "audio/mpeg";
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return "image";
      default:
        return "application/octet-stream";
    }
  };

  // API mở file ảnh hoặc video
  const onApiOpenFile = (folderName = "") => {
    app.get(`/uploads${folderName}/:name`, (req, res) => {
      const fileName = req.params.name;
      const options = {
        root: `uploads${folderName}`,
        headers: {
          "Content-Type": getFileContentType(fileName),
        },
      };

      try {
        res.sendFile(fileName, options);
      } catch (error) {
        onResponse(res, null).badRequest(error);
      }
    });
  };

  // Register routes for different folders
  onApiOpenFile("/images");
};
