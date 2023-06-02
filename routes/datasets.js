const express = require("express");
const db = require("../startup/db");
const fs = require("fs");
const converter = require("json-2-csv");
const PlacesModel = require("../models/Places");

const {
  queryBuilder,
  getPointFeatures,
  getPolygonsFeatures,
  getDataForDB,
  LIMIT,
  getDataForMongo,
  getHexagonsPointFeatures,
  queryBuilderForBins,
  getBins,
  getBinFromPolygons,
} = require("../utils");

const router = express.Router();

router.get("/", async (req, res) => {
  const { type, limit } = req.query;
  try {
    const query = queryBuilder(type, limit);
    const [data] = await db.query(query);
    const features =
      type !== "AREAS" ? getPointFeatures(data) : getPolygonsFeatures(data);
    res.status(200).send({
      type: "FeatureCollection",
      features: features,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/file", async (req, res) => {
  const { type, limit } = req.query;
  try {
    const query = queryBuilder(type, limit);
    const [data] = await db.query(query);
    const dataForDB = getDataForDB(data);
    const csvData = await converter.json2csv(dataForDB, {});
    fs.writeFileSync(`${type}-${limit}.csv`, csvData);
    res.status(200).send({ ok: "ok" });
  } catch (err) {
    console.log(err);
  }
});

router.get("/mongo", async (req, res) => {
  const { type, limit } = req.query;
  try {
    const query = queryBuilder(type, limit);
    const [data] = await db.query(query);
    const dataForDB = getDataForMongo(data);
    const csvData = await converter.json2csv(dataForDB, {});
    fs.writeFileSync(`MONGO-${type}-${limit}.csv`, csvData);
    res.status(200).send({ ok: "ok" });
  } catch (err) {
    console.log(err);
  }
});

router.get("/new-format", async (req, res) => {
  const { limit } = req.query;
  try {
    const data = await PlacesModel.findAll({
      raw: true,
      limit: LIMIT[limit],
      attributes: {
        exclude: ["id"],
        include: ["geometry", "type", "properties"],
      },
    });
    res.status(200).send({
      type: "FeatureCollection",
      features: data,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/hexagons", async (req, res) => {
  try {
    const { limit, state } = req.query;

    const query = queryBuilderForBins(limit, state);
    const [data] = await db.query(query);
    // const hexagons = getHexagonsPointFeatures(data);
    // const hexagons = getBins(data);
    const hexagons = getBinFromPolygons(data);

    res.status(200).send({
      type: "FeatureCollection",
      features: hexagons,
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
