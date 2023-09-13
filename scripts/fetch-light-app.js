import fse from 'fs-extra';
import path from 'path';
import util from 'util';
import { exec } from 'child_process';
import dotenv from 'dotenv';
const execPromise = util.promisify(exec);

dotenv.config();

// Pull latest git, dont use artifacts at all, see run-mock server
const BUILD_MODE = process.env.BUILD_PATH === 'internal' ? 'internal' : 'www';
const dashboardDist = path.join(BUILD_MODE, 'light-app');

const ENV_BRANCH = (process.env.BRANCH !== 'main' && !process.env.BUILD_PROD) ? 'develop' : 'main';

console.log(`[fetch-light-app] Fetching light-app for branch "${process.env.BRANCH}" from server "${ENV_BRANCH}" branch...`);

function copyDirectorySync(source, destination) {
	// Create the destination directory if it doesn't exist
	if (!fse.existsSync(destination)) {
		fse.mkdirSync(destination, { recursive: true });
	}

	// Read the contents of the source directory
	const files = fse.readdirSync(source);

	for (const file of files) {
		const sourceFilePath = path.join(source, file);
		const destinationFilePath = path.join(destination, file);

		// Check if the current item is a directory
		if (fse.statSync(sourceFilePath).isDirectory()) {
			// If it's a directory, recursively copy its contents
			copyDirectorySync(sourceFilePath, destinationFilePath);
		} else {
			// If it's a file, copy it to the destination directory
			fse.copyFileSync(sourceFilePath, destinationFilePath);
		}
	}
}

(async () => {

	try { await execPromise(`mkdir ${path.join('temp-mock')}`); } catch { }
	try { await execPromise(`cd ${path.join('temp-mock')} && git clone https://github.com/casanet/lightweight-dashboard.git && git checkout ${ENV_BRANCH}`); } catch { }
	await execPromise(`cd ${path.join('temp-mock', 'lightweight-dashboard')} && git checkout ${ENV_BRANCH} && git pull`);
	try {
		fse.writeFileSync(path.join('temp-mock', 'lightweight-dashboard', 'src/environments.json'), JSON.stringify({
			API_URL: `${process.env.REACT_APP_API_URL || ''}/API`,
		}));
	} catch (error) {
		console.log(error);
	}

	copyDirectorySync(path.join('temp-mock', 'lightweight-dashboard', 'src'), dashboardDist);
})();