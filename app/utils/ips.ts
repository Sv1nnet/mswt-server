import { networkInterfaces } from 'os';

const nets = networkInterfaces();
const results = Object.create(null);

let firstIp: string;

for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
    if (net.family === 'IPv4' && !net.internal) {
      if (!results[name]) {
        results[name] = [];
      }
      if (!firstIp) firstIp = net.address;
      results[name].push(net.address);
    }
  }
}

export default {
  ips: results,
  firstIp,
};
