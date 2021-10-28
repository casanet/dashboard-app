import { useEffect, useState } from 'react';
import { livelinessFeed, livelinessFlag, LivelinessInfo } from '../services/liveliness.service';

/**
 * Liveliness hook, get the presents state of the liveliness info 
 * @returns The presents @see LivelinessInfo
 */
export function useLiveliness(): LivelinessInfo {
	// The liveliness state 
	const [liveliness, setLiveliness] = useState(livelinessFlag);

	useEffect(() => {
		let livelinessDetacher: () => void;

		// Subscribe to the liveliness 
		livelinessDetacher = livelinessFeed.attach(setLiveliness);

		return () => {
			// unsubscribe the feed on component unmount
			livelinessDetacher?.();
		};
		// Run only once, on component mount.
	}, []);

	return liveliness;
}
