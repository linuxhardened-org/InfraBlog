import { buildApp } from '../src/server.js';

export default async (req: any, res: any) => {
  console.log('Incoming request URL:', req.url);
  const app = await buildApp();
  await app.ready();
  app.server.emit('request', req, res);
};
