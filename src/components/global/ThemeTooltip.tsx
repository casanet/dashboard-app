import Tooltip, { TooltipProps } from "@mui/material/Tooltip";
import { useState } from "react";
import { isTouchScreenDevice } from "../../infrastructure/utils";

/**
 * MUI Tooltip with adaption to the move away once focus leaved.
 * See https://stackoverflow.com/questions/60751964/react-material-uihow-to-disable-tooltip-after-click-it
 */
export function ThemeTooltip(props: TooltipProps) {
	const [open, setOpen] = useState<boolean>(false);

	// In touch devices, just use the original behavior.
	if (isTouchScreenDevice()) {
		return <Tooltip {...props} />;
	}
	return <span
		onMouseEnter={() => setOpen(true)}
		onMouseLeave={() => setOpen(false)}
	>
		{/* Set Tooltip to be fully controlled, and disable internal listeners */}
		<Tooltip {...props} open={open} disableHoverListener disableFocusListener />
	</span>;
}
