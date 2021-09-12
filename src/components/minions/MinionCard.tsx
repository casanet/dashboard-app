import { Grid, Typography } from "@material-ui/core";
import { Minion } from "../../infrastructure/generated/api";
import '../../theme/styles/components/minions/minionsCard.scss';
import { useHistory, useParams } from "react-router-dom";
import { DashboardRoutes } from "../../infrastructure/consts";
import { MinionPowerToggle } from "./MinionPowerToggle";
import { sleep } from "../../infrastructure/utils";
import { Duration } from 'unitsnet-js';

interface MinionCardProps {
	minion: Minion;
	ratio: number;
}

export function MinionCard(props: MinionCardProps) {
	const { id } = useParams<{ id: string }>();
	const history = useHistory();

	const { minion, ratio } = props;

	// Calc fonts size, TEMP LOGIC
	let fontSize: string = 'medium';
	let smallFontSize: string = 'x-small';
	if (ratio < 35) {
		fontSize = 'x-small';
		smallFontSize = 'xxx-small';
	} else if (ratio < 40) {
		fontSize = 'small';
		smallFontSize = 'xx-small';
	} else if (ratio < 60) {
		fontSize = 'medium';
		smallFontSize = 'xx-small';
	} else if (ratio < 70) {
		fontSize = 'large';
		smallFontSize = 'x-small';
	} else if (ratio < 80) {
		fontSize = 'x-large';
		smallFontSize = 'small';
	} else if (ratio < 90) {
		fontSize = 'xx-large';
		smallFontSize = 'small';
	} else if (ratio <= 100) {
		fontSize = 'xxx-large';
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		smallFontSize = 'small';
	}


	async function onMinionSelection() {
		if (minion.minionId === id) {
			// If current minion already selected, unselect it
			history.push(DashboardRoutes.minions.path)
		} else {
			// Select the minion (by adding the id to the URL)
			history.push(`${DashboardRoutes.minions.path}/${minion.minionId}`)
		}

		await sleep(Duration.FromMilliseconds(400));

	}

	return <div className="minion-card-container">
		<div className="minion-card-header-container" onClick={onMinionSelection}>
			<Grid
				className="minion-card-header"
				container
				direction="row"
				justifyContent="space-between"
				alignItems="center"
			>
				<div className="minion-name-container" >
					<Typography style={{ fontSize }}>{minion.name}</Typography>
				</div>
				<div className="quick-action-container">
					<Grid
						container
						direction="column"
						justifyContent="center"
						alignItems="center"
					>
						<MinionPowerToggle minion={minion} fontSize={fontSize} />
					</Grid>
				</div>
			</Grid>
		</div>
	</div>
}