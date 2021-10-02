import { Grid, Typography, useTheme } from "@material-ui/core";
import { Minion } from "../../infrastructure/generated/api";
import '../../theme/styles/components/minions/minionsOverview.scss';
import { useHistory, useParams } from "react-router-dom";
import { DashboardRoutes } from "../../infrastructure/consts";
import { MinionPowerToggle } from "./MinionPowerToggle";
import { MinionStatusOverview } from "./overviewMinionsStatus/MinionStatusOverview";
import { mapMinionTypeToDisplay, msToHMS } from "../../logic/common/minionsUtils";
import { MinionIndicators } from "./MinionIndicators";
import { useTranslation } from "react-i18next";

interface MinionOverviewProps {
	minion: Minion;
	ratio: number;
}

export function MinionOverview(props: MinionOverviewProps) {
	const { t } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const history = useHistory();
	const theme = useTheme();

	async function onMinionSelection() {
		if (minion.minionId === id) {
			// If current minion already selected, unselect it
			history.push(DashboardRoutes.minions.path)
		} else {
			// Select the minion (by adding the id to the URL)
			history.push(`${DashboardRoutes.minions.path}/${minion.minionId}`)
		}
	}

	const { minion, ratio } = props;

	// Calc the icons/texts size according to the card ration
	const fontRatio = ratio / 2;
	const smallFontRatio = ratio / 4;
	const verySmallFontRatio = ratio / 8;
	const fontSize: string = `${fontRatio}px`;
	const smallFontSize: string = `${smallFontRatio}px`;

	const subTitleColor = theme.palette.grey.A200;
	// Hold the auto turn off, if set, as sec,min.ho.
	const autoOff = msToHMS(minion.minionAutoTurnOffMS);

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
				<div className="minion-name-container" style={{ width: `calc(100% - ${fontRatio + 30}px` }} >
					<Grid
						className="minion-name-container"
						container
						direction="column"
						justifyContent="flex-start"
						alignItems="flex-start"
					>
						<Typography className="minion-name" style={{ fontSize }}>{minion.name}</Typography>
						<Typography className="minion-name" style={{ fontSize: smallFontSize, color: subTitleColor }}>{t(mapMinionTypeToDisplay[minion.minionType])}</Typography>
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
						<div className="indicators-overview-container" style={{ maxWidth: fontSize }}>
							<MinionIndicators minion={minion} fontRatio={fontRatio} smallFontRatio={smallFontRatio} />
						</div>
					</Grid>
				</div>
			</Grid>
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
			<Grid
				className="minion-overview-footer-grid"
				container
				direction="row"
				justifyContent="center"
				alignItems="center"
			>
				{!!minion.minionAutoTurnOffMS && <Typography style={{ fontSize: verySmallFontRatio, color: subTitleColor }}>
					{t('dashboard.minions.auto.turn.off.info', autoOff)}
				</Typography>}
			</Grid>
		</div>
	</div>
}