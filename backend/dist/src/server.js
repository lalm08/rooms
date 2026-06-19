import { buildApp } from './app.js';
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? '0.0.0.0';
let app;
try {
    app = await buildApp();
}
catch (err) {
    console.error('[rooms-api] Failed to build app:', err);
    process.exit(1);
}
const close = async () => {
    app.log.info('Shutting down...');
    await app.close();
    process.exit(0);
};
process.on('SIGINT', close);
process.on('SIGTERM', close);
try {
    await app.listen({ port, host });
    app.log.info(`Server listening on ${host}:${port}`);
}
catch (err) {
    console.error('[rooms-api] Failed to start server:', err);
    process.exit(1);
}
//# sourceMappingURL=server.js.map