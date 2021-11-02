import fse from 'fs-extra';
import path from 'path';
import xmlParser from 'xml-js';

const PACKAGE_JSON = path.join('package.json');
const CORDOVA_CONFIG_XML = path.join('config.xml');

const packageJson = fse.readJSONSync(PACKAGE_JSON);

const cordovaConfiguration = xmlParser.xml2js(fse.readFileSync(CORDOVA_CONFIG_XML));

cordovaConfiguration.elements[0].attributes.version = packageJson.version;

const xml = xmlParser.js2xml(cordovaConfiguration, {
	spaces: '	'
});

fse.writeFileSync(path.join(CORDOVA_CONFIG_XML), xml)
