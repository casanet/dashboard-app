import { Typography, useTheme } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Minion } from "../../infrastructure/generated/api/swagger/api";
import { isOnMode, msToHMS } from "../../logic/common/minionsUtils";
import { useData } from "../../hooks/useData";
import { timeOutService } from "../../services/timeout.service";
import { useEffect, useState } from "react";

interface MinionTimeoutOverviewProps {
	minion: Minion;
	fontRatio: number;
}

function DrawDMS(props: { msTime: number, fontRatio: number, color: string, prefixMessage: string, messageOn0?: string }) {
	const { t } = useTranslation();
	const autoOff = msToHMS(props.msTime);

	return <Typography style={{ fontSize: props.fontRatio, color: props.color }}>
		{t(props.prefixMessage)}
		{!autoOff.hours ? '' : t('dashboard.minions.auto.turn.off.info.hours', { hours: autoOff.hours })}
		{!autoOff.minutes ? '' : t('dashboard.minions.auto.turn.off.info.minutes', { minutes: autoOff.minutes })}
		{!autoOff.seconds ? '' : t('dashboard.minions.auto.turn.off.info.seconds', { seconds: autoOff.seconds })}
		{props.messageOn0 && !autoOff.seconds && !autoOff.minutes && !autoOff.hours && t(props.messageOn0)}
	</Typography>
}

export function MinionTimeoutOverview(props: MinionTimeoutOverviewProps) {
	const theme = useTheme();
	const [now, setNow] = useState(new Date().getTime());

	const [timeoutMinions] = useData(timeOutService);

	const { minion, fontRatio } = props;

	useEffect(() => {
		(async () => {

		})();
		const activation = setInterval(() => {
			if (minion.minionAutoTurnOffMS) {
				setNow(new Date().getTime());
			}
		}, 1000);
		
		return () => {
			clearInterval(activation);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);


	if (!minion.minionAutoTurnOffMS) {
		return <div></div>
	}

	const activeTimeoutData = timeoutMinions?.find(tom => tom.active && tom.minionId === minion?.minionId);
	const subTitleColor = theme.palette.grey.A200;
	const isOn = isOnMode(minion.minionType, minion.minionStatus);

	if (activeTimeoutData && isOn) {
		const timeLeft = minion.minionAutoTurnOffMS - (now - activeTimeoutData.countdownTimestamp);
		const timeSpan = timeLeft < 0 ? 0 : timeLeft; // If time already passed, done show negative time, bot consider it as should be now,no time span for the turn off.
		return <DrawDMS msTime={timeSpan} color={subTitleColor} fontRatio={fontRatio} prefixMessage={'dashboard.minions.auto.turn.off.countdown.info'} messageOn0={'dashboard.minions.auto.turn.off.countdown.now.info'} />
	}
	return <DrawDMS msTime={minion.minionAutoTurnOffMS} color={subTitleColor} fontRatio={fontRatio} prefixMessage={'dashboard.minions.auto.turn.off.info'} />
}


