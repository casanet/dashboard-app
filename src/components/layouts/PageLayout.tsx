import { Paper, Theme, useMediaQuery } from "@material-ui/core";
import '../../theme/styles/layout/pageWithSideInfoLayout.scss';

interface PageLayoutProps {
	/** Page content */
	children: JSX.Element;
	/** Side info component */
	sideInfo?: JSX.Element;
	/** Whenever to show the Side info */
	showSideInfo?: boolean;
}

/**
 * Dashboard page layout.
 * The layout contain creating fixed size of page content with scroll in case of overflow and as option 
 * "sideinfo" with opening/closing smooth animation.
 * @param props The @see PageLayoutProps props
 */
export function PageLayout(props: PageLayoutProps) {
	const largeDesktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));

	return <div className="page-container">
		{/* Show page content only if side-info is hidden *or* it's very wide screen */}
		{<div className={`main-page-area ${props.showSideInfo && '---page-side-info-enabled'} ${!largeDesktopMode && props.showSideInfo && '--hide-main-page-area'}`}>
			{/* The page container */}
			<div className={`main-page-container ${!desktopMode && '--mobile'}`}>
				{props.children}
			</div>
		</div>}
		{/* If side info should be shown, show it */}
		{<div className={`page-side-info-area-container ${props.showSideInfo && '--page-side-info-enabled'} ${!largeDesktopMode && '--small-screen'}`}>
			<Paper elevation={3} className="page-side-full-info-card" >
				{props.sideInfo}
			</Paper>
		</div>}
	</div>;
}
