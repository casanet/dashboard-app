import { Duration } from 'unitsnet-js';

/**
 * Sleep for a given duration time, this will not block the NODD's event loop
 * @param duration The time to sleep
 */
export async function sleep(duration: Duration): Promise<void> {
	return new Promise<void>((res) => {
		setTimeout(() => {
			res();
		}, duration.Milliseconds);
	});
}

/**
 * Check string if it's a valid URL
 * @param string The string to check
 * @param protocol The protocol to validate (http as default)
 * @returns True if it's a valid one
 */
export function isValidUrl(string: string, protocol: string = 'http'): boolean {
	let url;
	try {
		url = new URL(string);
	} catch (_) {
		return false;
	}

	return url.protocol === `${protocol}:` || url.protocol === `${protocol}s:`;
}

/**
 * Detect touch screens devices
 * @returns True whenever the device is with touch screen
 */
export function isTouchScreenDevice() {
	return 'ontouchstart' in window || navigator.maxTouchPoints;
};

/**
 * Copy a text to the user's clipboard
 * @param text The text to copy
 */
export function copyToClipboard(text: string) {
	// If writeText API supported, use it
	if (!!navigator?.clipboard?.writeText) {
		navigator.clipboard.writeText(text);
		return;
	}

	// Else create textarea element on the DOM and use it to copy
	const textField = document.createElement('textarea')
	textField.innerText = text;
	document.body.appendChild(textField);
	textField.select();
	document.execCommand('copy');
	textField.remove();
}

/**
 * Download binary content 
 * @param buffer The file content
 * @param fileName The name for the downloaded file
 */
export function downloadBinaryFile(buffer: Buffer | ArrayBuffer, fileName: string) {
	// Create a blob of the file
	const blob = new Blob([buffer], { type: 'application/octet-stream' });
	// Create "URL" with the blob as content
	const url = window.URL.createObjectURL(blob);
	// Create link element and point it to the "URL" with the blob
	const anchorElem = document.createElement("a");
	anchorElem.href = url;
	anchorElem.download = fileName;
	// Add the link to the DOM 
	document.body.appendChild(anchorElem);
	// Simulate the click
	anchorElem.click();
	// Remove it from the DOM
	document.body.removeChild(anchorElem);
	// On Edge, revokeObjectURL should be called only after
	// a.click() has completed, atleast on EdgeHTML 15.15048
	setTimeout(function () {
		window.URL.revokeObjectURL(url);
	}, 1000);
}
