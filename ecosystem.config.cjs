// PM2 ecosystem config — serves the built Vite SPA from dist/
// Run: pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'noortime-frontend',
      script: 'serve',
      args: '-s dist -l 3000',
      error_file: '/var/log/services/frontend/error.log',
      out_file: '/var/log/services/frontend/out.log',
      merge_logs: true,
      env: {
        NODE_ENV: 'production',
        PM2_SERVE_PATH: './dist',
        PM2_SERVE_PORT: 3000,
        PM2_SERVE_SPA: 'true',
      },
    },
  ],
};
