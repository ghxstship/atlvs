#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📊 Performance Monitoring Started');

// Monitor system resources
function getSystemStats() {
  return new Promise((resolve) => {
    exec('ps aux | grep node | grep -v grep', (error, stdout) => {
      const lines = stdout.trim().split('\n');
      const nodeProcesses = lines.filter(line => line.includes('next'));

      if (nodeProcesses.length > 0) {
        const process = nodeProcesses[0].split(/\s+/);
        resolve({
          pid: process[1],
          cpu: parseFloat(process[2]),
          memory: parseFloat(process[3]),
          timestamp: new Date().toISOString()
        });
      } else {
        resolve({
          pid: 'N/A',
          cpu: 0,
          memory: 0,
          timestamp: new Date().toISOString()
        });
      }
    });
  });
}

// Monitor response times (would integrate with Artillery)
async function runPerformanceCheck() {
  const stats = await getSystemStats();

  console.log(`📈 [${stats.timestamp}] CPU: ${stats.cpu}%, Memory: ${stats.memory}%, PID: ${stats.pid}`);

  // Check if thresholds are exceeded
  if (stats.cpu > 80) {
    console.warn('⚠️  High CPU usage detected!');
  }

  if (stats.memory > 85) {
    console.warn('⚠️  High memory usage detected!');
  }
}

// Run monitoring
setInterval(runPerformanceCheck, 5000); // Every 5 seconds

console.log('Monitoring active... Press Ctrl+C to stop');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Performance monitoring stopped');
  process.exit(0);
});
