import { createServer } from 'http';
import helmet from 'helmet';
import express from 'express';
import terminus from '@godaddy/terminus';
import axios from 'axios';
import { getTileNumber, getLonLat, mergeDeep } from './helpers.mjs';

// API init
const app = express();

// API Middleware : Security shield
app.use(helmet());

// Mapstatic endpoint
app.get('/static', async (req, res) => {
  // Get all params into the query string
  const {
    layers, zoom, lat, lon, height, width,
  } = req.query;

  // Deduct tile position based on position and zoom
  const tilePosition = getTileNumber(lat, lon, zoom);

  // With the tile size given, we calculate south and east tiles coordinates
  const tileSize = 256;
  const TileXSouth = (tilePosition[0] * tileSize - width / 2) / tileSize;
  const TileYSouth = (tilePosition[1] * tileSize - height / 2) / tileSize;
  const TileXEast = (tilePosition[0] * tileSize + width / 2) / tileSize;
  const TileYEast = (tilePosition[1] * tileSize + height / 2) / tileSize;

  // Retrieving the lon lat positions of south and east tiles to build the bbox
  const south = getLonLat(TileXSouth, TileYSouth, zoom);
  const east = getLonLat(TileXEast, TileYEast, zoom);
  const bbox = [south[0], east[1], east[0], south[1]];

  // Build the axios config object with defaults values and user values (MAPSTATIC_CONFIG env)
  const config = mergeDeep({
    url: 'https://wms.openstreetmap.fr/wms',
    responseType: 'arraybuffer',
    timeout: 30000,
    params: {
      service: 'WMS',
      version: '1.1.1',
      request: 'GetMap',
      layers,
      bbox: bbox.join(),
      width,
      height,
      format: 'image/jpeg',
      SRS: 'EPSG:4326',
    }
  }, process.env.MAPSTATIC_CONFIG ? JSON.parse(process.env.MAPSTATIC_CONFIG) : {});

  // Try to get map image thanks to WMS service url
  try {
    const response = await axios(config);
    res.set(response.headers);
    res.status(response.status);
    res.send(response.data);
  }
  catch(e) {
    console.log(e);
    res.status(500);
    res.send();
  }
  
});

// HTTP Server
const server = createServer(app);

// Routine that adds health checks and graceful shutdown
terminus.createTerminus(server, {
  logger: console.log,
  signal: 'SIGINT',
  healthChecks: { '/_healthcheck': () => Promise.resolve() },
});

// Listen for incomming HTTP requests
server.listen(80, '0.0.0.0');