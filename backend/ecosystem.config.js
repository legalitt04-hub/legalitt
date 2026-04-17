module.exports = {
  apps: [
    {
      name: 'legalitt-api',
      script: 'src/server.js',
      instances: 'max',           // Use all CPU cores
      exec_mode: 'cluster',       // Cluster mode for load balancing
      watch: false,               // Never watch in production
      max_memory_restart: '500M',

      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },

      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },

      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,

      // Auto-restart settings
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '5s',

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,

      // Health monitoring
      health_check_grace_period: 3000,
    },
  ],

  deploy: {
    production: {
      user: 'ubuntu',
      host: 'your-aws-ec2-ip',
      ref: 'origin/main',
      repo: 'https://github.com/Krishsoni9827/legalitt.git',
      path: '/var/www/legalitt',
      'pre-deploy-local': '',
      'post-deploy': 'cd backend && npm install --production && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};
