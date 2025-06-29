import { Grid, Typography, useTheme } from "@material-ui/core";
import '../../theme/styles/components/minions/minionsOverview.scss';
import { useNavigate, useParams } from "react-router-dom";
import { DashboardRoutes } from "../../infrastructure/consts";
import { MinionPowerToggle } from "./MinionPowerToggle";
import { MinionStatusOverview } from "./overviewMinionsStatus/MinionStatusOverview";
import { mapMinionTypeToDisplay } from "../../logic/common/minionsUtils";
import { MinionIndicators } from "./MinionIndicators";
import { useTranslation } from "react-i18next";
import { MinionTimeoutOverview } from "./MinionTimeoutOverview";
import { MinionBatteryOverview } from "./MinionBatteryOverview";
import { marginLeft, marginRight, right } from "../../logic/common/themeUtils";
import { Minion } from "../../services/minions.service";

interface MinionOverviewProps {
	minion: Minion;
	ratio: number;
}

export function MinionOverview(props: MinionOverviewProps) {
	const { t } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const theme = useTheme();

	async function onMinionSelection() {
		if (minion.minionId === id) {
			// If current minion already selected, unselect it
			navigate(DashboardRoutes.minions.path)
		} else {
			// Select the minion (by adding the id to the URL)
			navigate(`${DashboardRoutes.minions.path}/${minion.minionId}`)
		}
	}

	const { minion, ratio } = props;

	// Calc the icons/texts size according to the card ration
	const fontRatio = ratio / 2;
	const smallFontRatio = ratio / 4;
	const verySmallFontRatio = ratio / 8;

	const subTitleColor = theme.palette.grey.A200;

	return <div className="minion-overview-container" onClick={onMinionSelection}>
		<div className="minion-overview-header-container" >
			<Grid
				className="minion-overview-header"
				container
				direction="row"
				justifyContent="space-between"
				alignItems="flex-start"
			>
				{/* Set the name size as all card width, expect a place for the power icon. */}
				<div className="minion-name-container" style={{ width: `calc(100% - ${fontRatio * 1.6}px`, marginTop: fontRatio * 0.1, [marginLeft(theme)]: fontRatio * 0.1 }} >
					<Grid
						className="minion-name-container"
						container
						direction="column"
						justifyContent="flex-start"
						alignItems="flex-start"
					>
						<Typography className="minion-name" style={{ fontSize: fontRatio * 0.6 }}>{minion.name}</Typography>
						<Typography className="minion-name" style={{ fontSize: smallFontRatio * 0.8, color: subTitleColor }}>{t(mapMinionTypeToDisplay[minion.minionType])}</Typography>
					</Grid>
				</div>
				<div className="quick-action-container">
					<Grid
						container
						direction="column"
						justifyContent="center"
						alignItems="center"
					>
						<MinionPowerToggle minion={minion} fontRatio={fontRatio} />
					</Grid>
				</div>
			</Grid>
			<div className="indicators-overview-container" style={{ width: '100%', height: 0 }}>
				<div style={{ float: right(theme), [marginRight(theme)]: fontRatio * 0.45, marginTop: -(fontRatio * 0.2) }}>
					<MinionIndicators showAsRow={true} minion={minion} fontRatio={fontRatio} smallFontRatio={smallFontRatio} />
				</div>
			</div>
		</div>
		<div className="minion-overview-content-container" >
			<Grid
				className="minion-overview-content-grid"
				container
				direction="row"
				alignItems="center"
			>
				<div className="minion-status-overview-area" >
					<MinionStatusOverview minionStatus={minion.minionStatus} minionType={minion.minionType} fontRatio={fontRatio} smallFontRatio={smallFontRatio} showSwitches={false} />
				</div>
			</Grid>
		</div>
		<div className="minion-overview-footer-container" >
			<div style={{ height: 0 }}>
				<MinionBatteryOverview minion={minion} fontRatio={smallFontRatio} />
			</div>
			<Grid
				className="minion-overview-footer-grid"
				container
				direction="row"
				justifyContent="center"
				alignItems="center"
			>
				<MinionTimeoutOverview minion={minion} fontRatio={verySmallFontRatio} />
			</Grid>
		</div>
	</div>
}