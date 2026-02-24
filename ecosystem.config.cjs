module.exports = {
  apps: [
    {
      name: "wove-gift-portal-app",
      cwd: __dirname,
      script: "npm",
      args: "start",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "wove-gift-portal-cron",
      cwd: __dirname,
      script: "npm",
      args: "run cron:start",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      restart_delay: 5000,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
