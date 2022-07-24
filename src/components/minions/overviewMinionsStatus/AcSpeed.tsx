import AutoIcon from '@mui/icons-material/HdrAuto';
import { Fragment } from 'react';
import { SvgIcon, useTheme } from '@material-ui/core';
import { getModeColor } from '../../../logic/common/themeUtils';
import { ReactComponent as FanHighIcon } from '../../../theme/icons/fanHigh.svg';
import { ReactComponent as FanMedIcon } from '../../../theme/icons/fanMed.svg';
import { ReactComponent as FanLowIcon } from '../../../theme/icons/fanLow.svg';
import { FanStrengthOptions } from '../../../infrastructure/generated/api/swagger/api';

interface AcSpeedProps {
	speed: FanStrengthOptions;
	fontRatio: number;
	isOn: boolean;
}

export function AcSpeed(props: AcSpeedProps) {
	const theme = useTheme();

	const { speed, fontRatio, isOn } = props;

	let SpeedIcon = FanHighIcon;
	switch (speed) {
		case FanStrengthOptions.High:
			SpeedIcon = FanHighIcon;
			break;
		case FanStrengthOptions.Med:
			SpeedIcon = FanMedIcon;
			break;
		case FanStrengthOptions.Low:
			SpeedIcon = FanLowIcon;
			break;
	}

	return <Fragment>
		{speed !== FanStrengthOptions.Auto && <SvgIcon component={SpeedIcon} style={{ fontSize: fontRatio, color: getModeColor(isOn, theme) }} viewBox="0 0 607.000000 607.000000" />}
		{speed === FanStrengthOptions.Auto && <AutoIcon style={{ fontSize: fontRatio, color: getModeColor(isOn, theme) }} />}
	</Fragment>
}