const express = require("express");
const xss = require("xss");
const FoldersService = require("./folders-service");
const path = require("path");
const foldersRouter = express.Router();
const jsonParser = express.json();

const serializeFolder = (folder) => ({
  id: folder.id,
  name: xss(folder.name),
});

foldersRouter
  .route("/")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    FoldersService.getAllFolders(knexInstance)
      .then((folder) => {
        res.json(folder.map(serializeFolder));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { name } = req.body;
    const newFolder = { name };

    for (const [key, value] of Object.entries(newFolder))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });

    //?newArticle.author = author;
    FoldersService.insertFolder(req.app.get("db"), newFolder)
      .then((folder) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${Folder.id}`))
          .json(serializeFolder(folder));
      })
      .catch(next);
  });

FoldersRouter.route("/:folder_id")
  .all((req, res, next) => {
    FoldersService.getById(req.app.get("db"), req.params.folder_id)
      .then((folder) => {
        if (!folder) {
          return res.status(404).json({
            error: { message: `Folder doesn't exist` },
          });
        }
        res.folder = folder; // save the folder for the next middleware
        next(); // don't forget to call next so the next middleware happens!
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json({
      id: res.folder.id,
      name: xss(res.folder.name),
    });
  });

module.exports = FoldersRouter;
