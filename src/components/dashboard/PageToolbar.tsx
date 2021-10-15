import { Grid, Paper, useTheme, useMediaQuery, Theme } from "@material-ui/core";
import { Fragment, useState } from "react";
import { ThemeTooltip } from "../global/ThemeTooltip";
import LoadingButton from '@mui/lab/LoadingButton';
import Divider from '@mui/material/Divider';
import DoneIcon from '@mui/icons-material/Done';
import { DEFAULT_FONT_RATION, DEFAULT_SUCCEED_ICON_SHOWN } from "../../infrastructure/consts";

export function ToolbarDivider() {
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
	// Show divider in desktops only
	return !desktopMode ? <Fragment /> : <Divider orientation="vertical" variant="middle" flexItem style={{ margin: DEFAULT_FONT_RATION * 0.5 }} />;
}

export interface PageToolbarButtonProps {
	loading: boolean;
	disabled: boolean;
	Icon: any;
	text: string;
	tip?: string;
	runAction?: () => Promise<boolean>;
}

/**
 * Generic toolbar button
 * @param props @see PageToolbarButtonProps
 */
export function PageToolbarButton(props: PageToolbarButtonProps) {
	const wideDesktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
	const theme = useTheme();

	const [succeed, setSucceed] = useState<boolean>();

	const { loading, disabled, Icon, text, tip } = props;

	async function callAction() {
		// Do not call action while success indicator still shown (or there is no action :)
		if (succeed || !props.runAction) {
			return;
		}
		// Invoke action, and get results
		const showDone = await props.runAction();
		// If succeed show success indicator 
		if (showDone) {
			setSucceed(true);
			setTimeout(() => {
				setSucceed(false);
			}, DEFAULT_SUCCEED_ICON_SHOWN.Milliseconds);
		}
	}

	const IconToShow = succeed ? DoneIcon : Icon;

	return <ThemeTooltip hideTip={!tip} title={<span>{tip}</span>}>
		<LoadingButton
			style={{ margin: 5, color: theme.palette.grey[900] }}
			loading={loading}
			loadingPosition={wideDesktopMode ? 'start' : 'center'}
			disabled={disabled}
			variant="contained"
			color={'inherit'}
			startIcon={wideDesktopMode && <IconToShow />}
			onClick={callAction}>
			{!wideDesktopMode
				? <IconToShow style={{
					opacity: loading ? 0 : 1 // Hide icon while loading is overriding it
				}} />
				: text
			}
		</LoadingButton>
	</ThemeTooltip>;
}

interface PageToolbarContainerProps {
	children: JSX.Element;
	toggleToolBar: () => void;
}

export function PageToolbarContainer(props: PageToolbarContainerProps) {

	return <Grid
		style={{ width: '100%', marginBottom: DEFAULT_FONT_RATION * 0.7 }}
		container
		direction="row"
		justifyContent="center"
		alignItems="center"
	>
		<Paper elevation={3}>
			<Grid
				style={{ width: '100%' }}
				container
				direction="row"
				justifyContent="center"
				alignItems="center"
			>
				<div>
					{props.children}
				</div>
			</Grid >
		</Paper>
	</Grid >;
}
