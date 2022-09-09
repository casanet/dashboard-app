import { Typography, useTheme } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Minion } from "../../infrastructure/generated/api/swagger/api";
import { msToHMS } from "../../logic/common/minionsUtils";

interface MinionTimeoutOverviewProps {
	minion: Minion;
	fontRatio: number;
}

export function MinionTimeoutOverview(props: MinionTimeoutOverviewProps) {
	const { t } = useTranslation();
	const theme = useTheme();

	const { minion, fontRatio } = props;

	if (!minion.minionAutoTurnOffMS) {
		return <div></div>
	}

	const subTitleColor = theme.palette.grey.A200;
	// Hold the auto turn off, if set, as sec,min.ho.
	const autoOff = msToHMS(minion.minionAutoTurnOffMS);

	return <Typography style={{ fontSize: fontRatio, color: subTitleColor }}>
		{t('dashboard.minions.auto.turn.off.info')}
		{!autoOff.hours ? '' : t('dashboard.minions.auto.turn.off.info.hours', { hours: autoOff.hours })}
		{!autoOff.minutes ? '' : t('dashboard.minions.auto.turn.off.info.minutes', { minutes: autoOff.minutes })}
		{!autoOff.seconds ? '' :  t('dashboard.minions.auto.turn.off.info.seconds', { seconds: autoOff.seconds })}
	</Typography>;
}
