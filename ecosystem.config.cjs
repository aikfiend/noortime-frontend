// PM2 ecosystem config — runs Next.js production server
// Run: pm2 start ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'noortime-frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      error_file: '/var/log/services/noortime-frontend/error.log',
      out_file: '/var/log/services/noortime-frontend/out.log',
      merge_logs: true,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
