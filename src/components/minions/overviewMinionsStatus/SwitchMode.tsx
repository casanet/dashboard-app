import { SwitchOptions } from '../../../infrastructure/generated/api';
import { Fragment } from 'react';
import { SvgIcon, useTheme } from '@material-ui/core';
import { getModeColor } from '../../../logic/common/themeUtils';
import { ReactComponent as OnIcon } from '../../../theme/icons/on.svg';
import { ReactComponent as OffIcon } from '../../../theme/icons/off.svg';

interface SwitchModeProps {
	mode: SwitchOptions;
	fontRatio: number;
	isOn: boolean;
}

export function SwitchMode(props: SwitchModeProps) {
	const theme = useTheme();

	const { mode, fontRatio, isOn } = props;

	const ModeIcon = mode === SwitchOptions.On ? OnIcon : OffIcon;
	
	return <Fragment>
		<SvgIcon component={ModeIcon} style={{ fontSize: fontRatio, color: getModeColor(isOn, theme) }} viewBox="0 0 607.000000 630.000000" />
	</Fragment>
}