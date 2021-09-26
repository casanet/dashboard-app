import { useTheme } from '@material-ui/core';
import AcUnitIcon from '@material-ui/icons/AcUnit';
import WavesIcon from '@material-ui/icons/Waves';
import { Fragment } from 'react';
import { ACModeOptions } from '../../../infrastructure/generated/api';
import { getModeColor } from '../../../logic/common/themeUtils';

interface AcModeProps {
	mode: ACModeOptions;
	fontRatio: number;
	isOn: boolean;
}

export function AcMode(props: AcModeProps) {
	const theme = useTheme();

	const { mode, fontRatio, isOn } = props;

	const ModeIcon = (mode === ACModeOptions.Cold ? AcUnitIcon : WavesIcon) as any;

	return <Fragment>
		<ModeIcon style={{ fontSize: fontRatio, transform: 'rotate(-90deg)', color: getModeColor(isOn, theme) }} />
	</Fragment>
}