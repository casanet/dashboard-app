import fse from 'fs-extra';
import path from 'path';
import jsZip from 'jszip';
import nodeFetch from 'node-fetch';

const BUILD_MODE = process.env.BUILD_PATH || 'www';
const dashboardDist = path.join(BUILD_MODE);

const ENV_BRANCH = process.env.GITHUB_REF !== 'main' ? 'develop' : 'main';

async function downloadAndUnpackDashboard(dashboardArtifact, distDir) {
	const latestArtifact = await nodeFetch(dashboardArtifact);
	const artifactBuffer = await latestArtifact.buffer();

	const artifactZip = await jsZip.loadAsync(artifactBuffer);

	for (const [filename, file] of Object.entries(artifactZip.files)) {
		if (file.dir) {
			continue;
		}

		const fileBuffer = await file.async('nodebuffer');


		const fileDist = path.join(distDir, filename);
		await fse.promises.mkdir(path.dirname(fileDist), { recursive: true });
		fse.outputFileSync(fileDist, fileBuffer);
	}
}

(async () => {
	// Download the dashboard app
	await downloadAndUnpackDashboard(`https://nightly.link/casanet/lightweight-dashboard/workflows/build/${ENV_BRANCH}/${BUILD_MODE}.zip`, dashboardDist);
})();