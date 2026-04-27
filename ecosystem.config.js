module.exports = {
  apps: [{
    name: "blog",
    script: "./dist/boot.js",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    },
    instances: 1,
    exec_mode: "fork",
    max_memory_restart: "500M",
    restart_delay: 3000,
    max_restarts: 10,
    min_uptime: "10s",
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    error_file: "./logs/err.log",
    out_file: "./logs/out.log",
    merge_logs: true,
    autorestart: true,
    watch: false
  }]
};
