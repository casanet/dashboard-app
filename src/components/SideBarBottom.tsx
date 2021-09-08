import { useEffect, useState } from "react";

export function SideBarBottom() {
	const [time, setTime] = useState<string>();

	useEffect(() => {
		const intervalHandler = setInterval(() => {
			setTime(new Date().toLocaleTimeString())
		}, 1000);

		return () => {
			clearInterval(intervalHandler)
		}
	}, []);

	return <div>{time}</div>
}