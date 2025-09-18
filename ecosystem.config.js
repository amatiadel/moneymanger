module.exports = {
  apps: [
    {
      name: 'budget-tracker-api',
      script: 'server.js',
      cwd: '/var/www/budget-tracker',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/budget-tracker/error.log',
      out_file: '/var/log/budget-tracker/out.log',
      log_file: '/var/log/budget-tracker/combined.log',
      time: true
    }
  ]
};
