import fse from 'fs-extra';
import path from 'path';
import dotenv from 'dotenv';
import nodeFetch from 'node-fetch';

dotenv.config();

//  The branch to take spec from, as default use main branch
const API_SERVER_SPEC_BRANCH = process.env.API_SERVER_SPEC_BRANCH !== 'main' ? 'development' : 'master';

// The Local spec file path, if set the spec will be taken from machine's FS and not be fetched by GitHub artifactory 
const API_SERVER_SPEC_PATH = process.env.API_SERVER_SPEC_PATH;

// The spec file name
const SPEC_FILE_NAME = 'swagger.json';

// The directory to save the fetched spec
const SPEC_FILE_DEST_DIR = path.join('src/infrastructure/generated/api');
const CHANNEL_SPEC_PATH = `${SPEC_FILE_DEST_DIR}/channel-spec.ts`;
const SHARED_MODELS_PATH = `${SPEC_FILE_DEST_DIR}/sharedInterfaces.ts`;

const AUTO_GEN_COMMENT = `\n// This file was AutoGenerated at ${new Date()}'\n\n`;

/**
 * Download a source (text) file in order to use (for example a TS declaration file etc)
 * @param {*} fileURL The file URI
 * @param {*} sourceDestination The path/name where to place the fetched file
 */
 async function downloadSourceFile(fileURL, sourceDestination) {
	const sharedModelsResponse = await nodeFetch(fileURL);
	const sharedModelsResponseBuffer = await sharedModelsResponse.buffer();
	fse.writeFileSync(path.join(sourceDestination), AUTO_GEN_COMMENT);
	fse.appendFileSync(path.join(sourceDestination), sharedModelsResponseBuffer);
}

(async () => {

    // Create generated dir if not yet exists
    await fse.promises.mkdir(SPEC_FILE_DEST_DIR, { recursive: true });

    // If local path has been set, use it
    if (API_SERVER_SPEC_PATH) {
        console.log(`[fetch-api] Coping API Spec from local path "${API_SERVER_SPEC_PATH}"...`);

        

        // And copy spec file
        await fse.promises.copyFile(path.join(API_SERVER_SPEC_PATH), path.join(SPEC_FILE_DEST_DIR, SPEC_FILE_NAME));
        return;
    }

    console.log(`[fetch-api] Fetching API Spec form server "${API_SERVER_SPEC_BRANCH}" branch...`);
	await downloadSourceFile(`https://raw.githubusercontent.com/casanet/casanet-server/${API_SERVER_SPEC_BRANCH}/backend/src/models/remote2localProtocol.ts`, CHANNEL_SPEC_PATH);
	await downloadSourceFile(`https://raw.githubusercontent.com/casanet/casanet-server/${API_SERVER_SPEC_BRANCH}/backend/src/models/sharedInterfaces.d.ts`, SHARED_MODELS_PATH);
	await downloadSourceFile(`https://raw.githubusercontent.com/casanet/casanet-server/${API_SERVER_SPEC_BRANCH}/backend/src/generated/swagger.json`, path.join(SPEC_FILE_DEST_DIR, SPEC_FILE_NAME));
    console.log(`[fetch-api] API Spec fetched successfully`);
})();