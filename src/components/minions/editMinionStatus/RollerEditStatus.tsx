import { Grid, Tooltip, useTheme } from "@material-ui/core";
import { Fragment } from "react";
// import '../../theme/styles/components/minions/minionsStatusOverview.scss';
import { getModeColor } from "../../../logic/common/themeUtils";
import { useTranslation } from "react-i18next";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { RollerDirection } from "../../../infrastructure/generated/api";
import clonedeep from 'lodash.clonedeep';
import { TypeEditStatusProps } from "./MinionEditStatus";
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import { defaultMinionStatus } from "../../../logic/common/minionsUtils";

export function RollerEditStatus(props: TypeEditStatusProps) {
	const { t } = useTranslation();
	const theme = useTheme();

	const roller = props.minionStatus.roller;
	const disabled = props.disabled;

	async function changeDirection(direction: RollerDirection) {
		let minionStatus = clonedeep<any>(props.minionStatus);
		if (!minionStatus[props.minionType]) {
			minionStatus = defaultMinionStatus(props.minionType);
		}
		minionStatus[props.minionType].direction = direction || minionStatus[props.minionType].direction;
		props.setMinionStatus(minionStatus);
	};

	return <Fragment>
		<Grid
			style={{ marginTop: `${props.smallFontRatio}px` }}
			container
			justifyContent="center"
			alignItems="center"
		>
			<ToggleButtonGroup
				disabled={disabled}
				orientation="vertical"
				size="medium"
				value={roller?.direction}
				exclusive
				onChange={(e, v) => { changeDirection(v); }}
			>
				<ToggleButton value={RollerDirection.Up} aria-label={t('dashboard.minions.roller.roll.up')} style={{ color: getModeColor(props.isOn, theme) }}>
					<Tooltip title={<span>{t('dashboard.minions.roller.roll.up')}</span>}>
						<ArrowCircleUpIcon style={{ fontSize: props.fontRatio }} />
					</Tooltip>
				</ToggleButton>
				<ToggleButton value={RollerDirection.Down} aria-label={t('dashboard.minions.roller.roll.down')} style={{ color: getModeColor(props.isOn, theme) }}>
					<Tooltip title={<span>{t('dashboard.minions.roller.roll.down')}</span>}>
						<ArrowCircleDownIcon style={{ fontSize: props.fontRatio }} />
					</Tooltip>
				</ToggleButton>
			</ToggleButtonGroup>
		</Grid>
	</Fragment>;

}
