const debug = require('debug')('website:server');
const http = require('http');
const app = require('./modules/app');
const db = require('./modules/db');
const config = require('./config');

const port = config.server.port;

const server = http.createServer(app);

db.connect(config.database)
  .then(hasMaster => {
    app.locals.hasMaster = hasMaster;

    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
  })
  .catch(err => {
    console.error(err.toString());
    process.exit(1);
  });

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
