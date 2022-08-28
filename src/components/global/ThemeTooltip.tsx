import Tooltip, { TooltipProps } from "@mui/material/Tooltip";
import { useState } from "react";
import { Duration } from "unitsnet-js";
import { isTouchScreenDevice } from "../../infrastructure/utils";

interface ThemeTooltipProps extends TooltipProps {
	/** Hide tip */
	hideTip?: boolean;
	removeAutoFlex?: boolean;
}

/**
 * MUI Tooltip with adaption to the move away once focuses left.
 * See https://stackoverflow.com/questions/60751964/react-material-uihow-to-disable-tooltip-after-click-it
 */
export function ThemeTooltip(props: ThemeTooltipProps) {
	const [open, setOpen] = useState<boolean>(false);

	if (props.hideTip) {
		return props.children;
	}

	// In touch devices, just use the original behavior.
	if (isTouchScreenDevice()) {
		return <div style={{ display: 'flex' }}><Tooltip {...props} leaveDelay={Duration.FromSeconds(10).Milliseconds} leaveTouchDelay={Duration.FromSeconds(15).Milliseconds} /></div>;
	}
	return <div
		style={{ display: props.removeAutoFlex ? '' : 'flex' }}
		onMouseEnter={() => setOpen(true)}
		onMouseLeave={() => setOpen(false)}
		onClick={() => setOpen(false)}
	>
		{/* Show the original MUI Tooltip with all props. */}
		{/* Just override the open attribute to be fully managed, and disable internal listeners */}
		<Tooltip {...props} open={open} disableHoverListener disableFocusListener leaveDelay={Duration.FromSeconds(5).Milliseconds} />
	</div>;
}
