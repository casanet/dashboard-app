import fse from 'fs-extra';
import path from 'path';
import xmlParser from 'xml-js';

const DEV_MODE_SUFFIX = 'dev';
const PACKAGE_JSON = path.join('package.json');
const CORDOVA_CONFIG_XML = path.join('config.xml');

const packageJson = fse.readJSONSync(PACKAGE_JSON);

const devVersion = `${packageJson.version}-${DEV_MODE_SUFFIX}`;
const devAppId = `${packageJson.name}.${DEV_MODE_SUFFIX}`;
const devAppName = `${packageJson.displayName}-${DEV_MODE_SUFFIX}`;

// Set DEV ids to the package.json config
packageJson.version = devVersion;
packageJson.name = devAppId;
packageJson.displayName = devAppName;

// Read application configuration manifest
const cordovaConfiguration = xmlParser.xml2js(fse.readFileSync(CORDOVA_CONFIG_XML));

// Set the app version with dev prefix
cordovaConfiguration.elements[0].attributes.version = devVersion;
// Set the app id to be with dev prefix
cordovaConfiguration.elements[0].attributes.id = devAppId;
// Set the app name to be with dev prefix
cordovaConfiguration.elements[0].elements[0].elements[0].text = devAppName;

const xml = xmlParser.js2xml(cordovaConfiguration, {
	spaces: '	'
});

// Save files changes
fse.writeJSONSync(path.join(PACKAGE_JSON), packageJson)
fse.writeFileSync(path.join(CORDOVA_CONFIG_XML), xml)
