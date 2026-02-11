import cron from 'node-cron';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// // Runs every day at 2:23 PM IST
// cron.schedule('00 09 * * *', () => {
//   console.log('Running the send-scheduled-reports script...');

//   const scriptPath = path.resolve(__dirname, './send-scheduled-reports.js');

//   exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
//     if (error) {
//       console.error('Error executing script:', error);
//       return;
//     }
//     if (stderr) {
//       console.error('Script stderr:', stderr);
//       return;
//     }
//     console.log('Script stdout:', stdout);
//   });
// }, {
//   scheduled: true,
//   timezone: 'Asia/Kolkata'
// });

// // Runs every 5 minutes to process scheduled orders
// cron.schedule('*/1 * * * *', () => {
//   console.log('Running the process-scheduled-orders script...');

//   const scriptPath = path.resolve(__dirname, './process-scheduled-orders.js');

//   exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
//     if (error) {
//       console.error('Error executing script:', error);
//       return;
//     }
//     if (stderr) {
//       console.error('Script stderr:', stderr);
//       return;
//     }
//     console.log('Script stdout:', stdout);
//   });
// }, {
//   scheduled: true,
//   timezone: 'Asia/Kolkata'
// });

// Runs every second to process the order queue
cron.schedule('*/10 * * * * *', () => {
  console.log('Running the order-process script...');

  const scriptPath = path.resolve(__dirname, './order-process.js');

  exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error executing script:', error);
      return;
    }
    if (stderr) {
      console.error('Script stderr:', stderr);
      return;
    }
    console.log('Script stdout:', stdout);
  });
});

console.log('Cron job scheduler started. Scheduled for 2:23 PM IST daily, every minute for scheduled orders, and every second for the order process queue.');