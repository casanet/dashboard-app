import path from 'path';
import util from 'util';
import { exec, spawn } from 'child_process';
const execPromise = util.promisify(exec);

const prepareOnly = process.argv[2] === '--prepare';
const runOnly = process.argv[2] === '--run';


const BUILD_PATH = process.env.BUILD_PATH || 'temp-e2e';
const REACT_APP_API_URL = process.env.REACT_APP_API_URL || 'http://localhost:80';
const MOCK_PORT = process.env.MOCK_PORT || '80';
const FRONT_SERVE_PORT = process.env.FRONT_SERVE_PORT || '3001';

async function prepareMockServer() {

	try { await execPromise(`mkdir ${path.join('temp-mock')}`); } catch (error) { }
	try { await execPromise(`cd ${path.join('temp-mock')} && git clone https://github.com/casanet/mock-server.git`); } catch (error) { }
	try { await execPromise(`cd ${path.join('temp-mock')} && cd mock-server && git pull && npm i`); } catch (error) { }

	// try {
	// 	await execPromise(`npm run build`, {
	// 		env: {
	// 			BUILD_PATH,
	// 			REACT_APP_API_URL,
	// 		}
	// 	});
	// } catch (error) {
	// 	console.log(error);
	// }
}

async function runMockServer() {
	
	console.log('Starting mock server...')
	const server = spawn('node', ['index.js'], {
		cwd: 'temp-mock/mock-server',
		env: {
			PORT: MOCK_PORT
		}
	});

	server.stdout.on('data', function (data) {
		console.log(data.toString());
	});

	server.stderr.on('data', function (data) {
		console.log('stderr: ' + data.toString());
	});

	server.on('exit', function (code) {
		console.log('child process exited with code ' + code.toString());
	});

	console.log('Starting http-server...')
	const fileServer = spawn('node', ['node_modules/http-server/bin/http-server', './temp-e2e'], {
		cwd: '.',
		env: {
			PORT: FRONT_SERVE_PORT
		}
	});

	fileServer.stdout.on('data', function (data) {
		console.log(data.toString());
	});

	fileServer.stderr.on('data', function (data) {
		console.log('stderr: ' + data.toString());
	});

	fileServer.on('exit', function (code) {
		console.log('child process exited with code ' + code.toString());
	});
}

if (prepareOnly) {
	prepareMockServer();
}

if (runOnly) {
	runMockServer();
}