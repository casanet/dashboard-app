import { Grid, Typography } from "@material-ui/core";
import { DEFAULT_FONT_RATION } from "../../infrastructure/consts";
import InfoIcon from '@mui/icons-material/Info';
import { ThemeTooltip } from "../global/ThemeTooltip";

interface TitleButtonContentProps {
	/** The content */
	children?: JSX.Element;
	/** The button / controls on the right */
	button: JSX.Element;
	/** The title */
	title: string;
	/** A tip for the title */
	tip?: string;
	/** The font ratio */
	fontRation?: number;
}

/**
 * A generic implementation of title (with a tooltip, on the left) + button (on the right) and a content (below both). 
 */
export function TitleButtonContent(props: TitleButtonContentProps) {
	const fontRation = props.fontRation || DEFAULT_FONT_RATION;

	return <Grid
		style={{ marginBottom: fontRation * 0.8 }}
		container
		direction="column"
		justifyContent="space-between"
		alignItems="stretch"
	>
		<div>
			<Grid
				style={{ width: '100%' }}
				container
				direction="row"
				justifyContent="space-between"
				alignItems="center"
			>
				<div>
					<Grid
						container
						direction={'row'}
						justifyContent="flex-start"
						alignItems="center"
					>
						<Typography style={{ fontSize: fontRation * 0.8 }} >{props.title}</Typography>
						{props.tip && <ThemeTooltip title={<span>{props.tip}</span>}>
							<InfoIcon style={{ fontSize: fontRation * 0.8, marginTop: fontRation * -0.2 }} />
						</ThemeTooltip>}
					</Grid>
				</div>
				<div>
					{props.button}
				</div>
			</Grid>
		</div>
		<div>
			{props.children}
		</div>
	</Grid>
}