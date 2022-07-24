import { Grid, useTheme } from "@material-ui/core";
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import { useTranslation } from "react-i18next";
import { isOnMode, mapMinionChangeTriggerDisplay } from "../../../logic/common/minionsUtils";
import ReactTimeAgo from 'react-time-ago';
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json';
import he from 'javascript-time-ago/locale/he.json';
import Typography from "@mui/material/Typography";
import { ThemeTooltip } from "../../global/ThemeTooltip";
import { MinionStatusOverview } from "../overviewMinionsStatus/MinionStatusOverview";
import { DEFAULT_FONT_RATION } from "../../../infrastructure/consts";
import { useData } from "../../../hooks/useData";
import { timelineService } from "../../../services/timeline.service";
import { Loader } from "../../Loader";
import { SwitchMode } from "../overviewMinionsStatus/SwitchMode";
import { getLang } from "../../../services/localization.service";
import { right } from "../../../logic/common/themeUtils";
import { Minion, MinionChangeTrigger, MinionTypes, SwitchOptions } from "../../../infrastructure/generated/api/swagger/api";

// TODO: Once this logic will be used in other component too, move to to app index
// get lang and load TimeAgo module with the correct lang
const lang = getLang();
const supportedLangs: any = {
	en,
	he,
};
TimeAgo.addDefaultLocale(supportedLangs[lang.langCode]);

interface MinionAdvancedSettingsProps {
	fontRatio: number;
	minion: Minion;
}

function TooltipContainer(props: { verboseDate: string, children: any }) {
	return <ThemeTooltip title={<span>{props.verboseDate}</span>} removeAutoFlex>
		<span>
			{props.children}
		</span>
	</ThemeTooltip>;
}


export default function MinionTimeline(props: MinionAdvancedSettingsProps) {
	const { t } = useTranslation();
	const theme = useTheme();
	const { minion } = props;
	const [minionsTimeline, loading] = useData(timelineService, []);

	// Filter out other minions nodes, and old nodes (without the trigger info)
	const minionTimeline = minionsTimeline.filter(node => node.minionId === minion.minionId && node.trigger);

	if (loading) {
		return <Loader fontRatio={DEFAULT_FONT_RATION * 2} />;
	}

	if (minionTimeline.length === 0) {
		return <div style={{ textAlign: 'center' }}>{t('dashboard.minions.timeline.no.nodes')}</div>;
	}


	return <Grid
		style={{ width: '100%', maxHeight: '35vh', overflowY: 'auto' }}
		container
		direction="column"
		justifyContent="flex-start"
		alignItems="stretch"
	>
		<Timeline style={{}}>
			{minionTimeline.map(node => {
				const isOn = isOnMode(minion.minionType, node.status);
				return <TimelineItem>
					<TimelineOppositeContent
						style={{ maxWidth: '45%', wordBreak: 'break-word' }}
						sx={{ m: 'auto 0' }}
						align={right(theme)}
						variant="body2"
						color="text.secondary"
					>
						<ReactTimeAgo date={node.timestamp} component={TooltipContainer} tooltip={false} />
					</TimelineOppositeContent>
					<TimelineSeparator>
						<TimelineConnector />
						<TimelineDot>
							<ThemeTooltip hideTip={[MinionTypes.Toggle, MinionTypes.Switch].includes(minion.minionType as any)} title={<span><MinionStatusOverview
								minionStatus={node.status}
								disabled={false}
								minionType={minion.minionType}
								showSwitches={true}
								fontRatio={DEFAULT_FONT_RATION}
								smallFontRatio={DEFAULT_FONT_RATION * 0.5} /></span>}>
								<SwitchMode fontRatio={DEFAULT_FONT_RATION * 1.5} isOn={true} mode={isOn ? SwitchOptions.On : SwitchOptions.Off} />
							</ThemeTooltip>
						</TimelineDot>
						<TimelineConnector />
					</TimelineSeparator>
					<TimelineContent sx={{ py: '12px', px: 2 }} style={{ minWidth: '50%', wordBreak: 'break-word' }}>
						<ThemeTooltip hideTip={[MinionTypes.Toggle, MinionTypes.Switch].includes(minion.minionType as any)} title={<span><MinionStatusOverview
							minionStatus={node.status}
							disabled={false}
							minionType={minion.minionType}
							showSwitches={true}
							fontRatio={DEFAULT_FONT_RATION}
							smallFontRatio={DEFAULT_FONT_RATION * 0.5} /></span>}>
							<Typography variant="h6" component="span">
								{t(isOn ? 'global.on' : 'global.off')}
							</Typography>
						</ThemeTooltip>
						<ThemeTooltip hideTip={node.trigger !== MinionChangeTrigger.User} title={<span>{node.user?.email}</span>}>
							<Typography>{t('dashboard.minions.timeline.trigger.by')} {node.trigger === MinionChangeTrigger.User ? node.user?.name : t(mapMinionChangeTriggerDisplay[node.trigger])}</Typography>
						</ThemeTooltip>
					</TimelineContent>
				</TimelineItem>
			})}
		</Timeline>
	</Grid>;
}
