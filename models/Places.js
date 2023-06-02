const { DataTypes } = require("sequelize");
const db = require("../startup/db");

const PlacesModel = db.define(
  "fake_places_test",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    type: {
      type: DataTypes.TEXT,
    },
    geometry: {
      type: DataTypes.JSONB,
    },
    properties: {
      type: DataTypes.JSONB,
    },
  },
  {
    tableName: "fake_places_test",
    schema: "metadata",
    // tableName: "fake_places_dataset",
    // schema: "public",
    timestamps: false,
  }
);

module.exports = PlacesModel;
