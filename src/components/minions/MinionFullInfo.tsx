import { Grid, IconButton, Tooltip } from "@material-ui/core";
import { Minion } from "../../infrastructure/generated/api";
import '../../theme/styles/components/minions/minionsCard.scss';
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DashboardRoutes } from "../../infrastructure/consts";
import { MinionPowerToggle } from "./MinionPowerToggle";
import CloseIcon from '@material-ui/icons/Close';
import '../../theme/styles/components/minions/minionFullInfo.scss';

interface MinionFullInfoProps {
	minion: Minion;
}

export function MinionFullInfo(props: MinionFullInfoProps) {
	const { t } = useTranslation();
	const history = useHistory();

	const { minion } = props;

	return <div className="minion-full-info-container">
		<Grid
			container
			direction="row"
			justifyContent="flex-start"
			alignItems="flex-start"
		>
			<div>
				{minion.minionId}
				<br />
				{minion?.name}
				<br />
			</div>
			<div>
				<Tooltip className="resize-slider-icon-tip" title={<span>{t('global.close')}</span>} enterDelay={100}>
					<IconButton
						onClick={() => { history.push(DashboardRoutes.minions.path); }}
						color="inherit">
						<CloseIcon />
					</IconButton>
				</Tooltip>
				<MinionPowerToggle minion={minion} fontSize={'xxx-large'} />
			</div>
		</Grid>
	</div>
}