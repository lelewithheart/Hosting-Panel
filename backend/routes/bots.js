import upload from "../middleware/upload.js";
import express from "express";
import * as botController from "../controllers/botController.js";
import * as filesController from "../controllers/filesController.js";
import * as templatesController from "../controllers/templatesController.js";
import uploadAny from "../middleware/uploadAny.js";

const router = express.Router();

router.post("/start", botController.startBot);
router.post("/stop", botController.stopBot);
router.post("/logs", botController.getLogs);
router.post("/deploy", botController.deployBot);
router.post("/upload", upload.single("file"), botController.uploadBot);
router.post("/status", botController.getStatus);
router.post("/restart", botController.restartBot);
router.post("/create", botController.createBot);
router.post("/upgrade", botController.upgradeBot);
router.post("/rename", botController.renameBot);
router.post("/delete", botController.deleteBot);

router.get("/list", botController.listBots);

// File management
router.get("/files/list", filesController.list);
router.get("/files/get", filesController.get);
router.post("/files/save", filesController.save);
router.post("/files/delete", filesController.del);
router.get("/files/download", filesController.download);
router.post("/files/upload", uploadAny.single("file"), filesController.upload);
router.post("/files/mkdir", filesController.mkdir);
router.post("/files/create", filesController.create);
router.post("/files/rename", filesController.rename);

// Templates
router.get("/templates/:lang.zip", templatesController.downloadZip);

export default router;
