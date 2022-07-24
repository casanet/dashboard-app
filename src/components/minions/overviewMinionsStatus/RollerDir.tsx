import { useTheme } from '@material-ui/core';
import { Fragment } from 'react';
import { getModeColor } from '../../../logic/common/themeUtils';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import { RollerDirection } from '../../../infrastructure/generated/api/swagger/api';
interface RollerDirProps {
	direction: RollerDirection;
	fontRatio: number;
	isOn: boolean;
}

export function RollerDir(props: RollerDirProps) {
	const theme = useTheme();

	const { direction, fontRatio, isOn } = props;

	const ModeIcon = (direction === RollerDirection.Up ? ArrowCircleUpIcon : ArrowCircleDownIcon);

	return <Fragment>
		<ModeIcon style={{ fontSize: fontRatio, color: getModeColor(isOn, theme) }} />
	</Fragment>
}