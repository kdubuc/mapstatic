// Converts a number of degrees to radians
function deg2rad(angle) {
  return (angle * Math.PI) / 180;
}

// Converts a radian to a degree
function rad2deg(angle) {
  return (angle * 180) / Math.PI;
}

// Calculation of a Secant
function sec(value) {
  return 1 / Math.cos(value);
}

// Deduct tile number based on position and zoom
export function getTileNumber(lat, lon, zoom) {
  const n = 2 ** zoom;
  return [
    ((Number(lon) + Number(180.0)) / 360.0) * n,
    ((1 - Math.log(Math.tan(deg2rad(lat)) + sec(deg2rad(lat))) / Math.PI) / 2) * n,
  ];
}

// Retrieving the lon lat position of a tile
export function getLonLat(tileX, tileY, zoom) {
  const n = 2 ** zoom;
  return [
    ((tileX / n) * 360.0) - 180.0,
    rad2deg(Math.atan(Math.sinh(Math.PI * (1 - (2 * tileY) / n)))),
  ];
}

// Deep Merge helper (https://stackoverflow.com/a/48218209)
export function mergeDeep(...objects) {
  const isObject = (obj) => obj && typeof obj === 'object';
  return objects.reduce((prevA, obj) => {
    const prevB = prevA;
    Object.keys(obj).forEach((key) => {
      const pVal = prevA[key];
      const oVal = obj[key];
      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prevB[key] = pVal.concat(...oVal);
      } else if (isObject(pVal) && isObject(oVal)) {
        prevB[key] = mergeDeep(pVal, oVal);
      } else {
        prevB[key] = oVal;
      }
    });
    return prevB;
  }, {});
}
