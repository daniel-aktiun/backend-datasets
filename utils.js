const h3 = require("h3-js");
const geojson2h3 = require("geojson2h3");

const DB_TYPE = {
  AREAS: "fake_area_dataset",
  PLACES: "fake_places_dataset",
  PLACES_FORMAT: "fake_places_test",
  PEOPLE: "fake_people_dataset",
};

const LIMIT = {
  TINY: 1000,
  SMALL: 10000,
  MEDIUM: 100000,
  LARGE: 500000,
  XLARGE: 2000000,
};

const queryBuilder = (dbType = "AREAS", limit = "SMALL") => {
  return `
    select 
      *
    from 
      metadata.${DB_TYPE[dbType]}
    limit ${LIMIT[limit]}
  `;
};

const queryBuilderForBins = (limit = "SMALL", state) => {
  return `
    select 
      *
    from 
      metadata.${DB_TYPE["AREAS"]}
    where
      state = '${state}'
    limit ${LIMIT[limit]}
  `;
};

const queryBuilderWithNewFormat = (limit = "SMALL") => {
  return `
    select 
      feature
    from 
      public.${DB_TYPE.PLACES_FORMAT}
    limit ${LIMIT[limit]};
  `;
};

const createPoint = (point) => {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [
        point.geom_4326.coordinates[0],
        point.geom_4326.coordinates[1],
      ],
    },
    properties: {
      title: point.business_name,
      placeId: point.place_id,
      naicsCode: point.naics_code,
      classification: point.classification,
    },
  };
};

const getPointFeatures = (data) => {
  return data.map((point) => ({
    id: point.id,
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [
        point.geom_4326.coordinates[0],
        point.geom_4326.coordinates[1],
      ],
    },
    properties: {
      title: point.business_name,
    },
  }));
};

const getHexagonsPointFeatures = (data) => {
  return data.map((point) => ({
    id: point.hexagon_id,
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [
        point.hex_centroid_geom_4326.coordinates[0],
        point.hex_centroid_geom_4326.coordinates[1],
      ],
    },
    properties: {
      state: point.state,
      county: point.county,
      basename: point.basename,
    },
  }));
};

const getBins = (data) => {
  return data.map((point) => {
    const lat = point.hex_centroid_geom_4326.coordinates[1];
    const lng = point.hex_centroid_geom_4326.coordinates[0];
    const hexagonIndex = h3.latLngToCell(lat, lng, 7);
    const boundary = h3.cellToBoundary(hexagonIndex);

    return {
      id: point.hexagon_id,
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [boundary.map((b) => b.reverse())],
      },
      properties: {
        state: point.state,
        county: point.county,
        basename: point.basename,
      },
    };
  });
};

const getPolygonsFeatures = (data) => {
  return data.map((point) => ({
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [point.geom_4326.coordinates[0][0]],
    },
    properties: {
      title: point.business_name,
      description: "Business name",
    },
  }));
};

const getDataForDB = (data) => {
  return data.map((point) => {
    return {
      id: point.id,
      type: "Feature",
      geometry: JSON.stringify({
        type: "Point",
        coordinates: [
          point.geom_4326.coordinates[0],
          point.geom_4326.coordinates[1],
        ],
      }),
      properties: JSON.stringify({
        title: point.business_name,
      }),
      geom_4326: `POINT (${point.geom_4326.coordinates[0]} ${point.geom_4326.coordinates[1]})`,
    };
  });
};

const getDataForMongo = (data) => {
  return data.map((point) => {
    return {
      id: point.id,
      coordinates: JSON.stringify([
        point.geom_4326.coordinates[0],
        point.geom_4326.coordinates[1],
      ]),
      businessName: point.business_name,
      placeId: point.place_id,
      naicsCode: point.naics_code,
      classification: point.classification,
    };
  });
};

const getBinFromPolygons = (data) => {
  return data.map((point) => ({
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [point.geom_4326.coordinates[0][0]],
    },
    properties: {
      businessName: point.business_name,
      placeId: point.place_id,
      naicsCode: point.naics_code,
      classification: point.classification,
    },
  }));
};

module.exports = {
  queryBuilder,
  getPointFeatures,
  getPolygonsFeatures,
  getDataForDB,
  queryBuilderWithNewFormat,
  LIMIT,
  getDataForMongo,
  getHexagonsPointFeatures,
  getBins,
  queryBuilderForBins,
  getBinFromPolygons,
};
