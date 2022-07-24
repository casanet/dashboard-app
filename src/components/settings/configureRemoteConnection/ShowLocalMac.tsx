import { IconButton, InputAdornment, OutlinedInput, Typography, useTheme } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { DEFAULT_FONT_RATION } from "../../../infrastructure/consts";
import { useState } from "react";
import Collapse from '@mui/material/Collapse';
import { ThemeTooltip } from "../../global/ThemeTooltip";
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { getModeColor } from "../../../logic/common/themeUtils";
import { handleServerRestError, notificationsFeed } from "../../../services/notifications.service";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { copyToClipboard } from "../../../infrastructure/utils";
import { Duration } from "unitsnet-js";
import { TitleButtonContent } from "../../layouts/TitleButtonContent";
import { ApiFacade } from "../../../infrastructure/generated/api/swagger/api";

export function ShowLocalMac() {
	const { t } = useTranslation();
	const theme = useTheme();

	const [fetchingMac, setFetchingMac] = useState<boolean>();
	const [machineMac, setMachineMac] = useState<string>();

	async function fetchMachineMac() {
		setFetchingMac(true);
		try {
			const machineMac = await ApiFacade.RemoteApi.getMachineMac();
			setMachineMac(machineMac);
		} catch (error) {
			await handleServerRestError(error);
		}
		setFetchingMac(false);
	}

	function toggleMachineMacVisibility() {
		if (machineMac) {
			setMachineMac('');
		} else {
			fetchMachineMac();
		}
	}

	function copyMacToClipboard() {
		copyToClipboard(machineMac || '');
		notificationsFeed.post({
			messageKey: 'dashboard.settings.connectivity.show.physical.copied.address.to.clipboard',
			duration: Duration.FromSeconds(3),
		});
	}

	return <TitleButtonContent
		title={t('dashboard.settings.connectivity.show.physical.address')}
		tip={t('dashboard.settings.connectivity.show.physical.address.tip')}
		button={<ThemeTooltip title={<span>{t(`dashboard.settings.connectivity.show.physical.${!machineMac ? 'show' : 'hide'}.button`)}</span>}>
			<IconButton
				disabled={fetchingMac}
				onClick={toggleMachineMacVisibility}
				color="inherit"
			>
				{/* In case of fetching, show loader icon */}
				{fetchingMac && <MoreHorizIcon style={{ fontSize: DEFAULT_FONT_RATION, color: getModeColor(false, theme) }} />}
				{(!fetchingMac && !machineMac) && <VisibilityIcon style={{ fontSize: DEFAULT_FONT_RATION }} />}
				{(!fetchingMac && machineMac) && <VisibilityOffIcon style={{ fontSize: DEFAULT_FONT_RATION }} />}
			</IconButton>
		</ThemeTooltip>}
	>
		<Collapse in={fetchingMac || !!machineMac}>
			{/* <div style={{ margin: DEFAULT_FONT_RATION * 0.7 }}> */}
			<div style={{ textAlign: 'center', margin: DEFAULT_FONT_RATION * 0.7 }}>
				{fetchingMac && <Typography style={{ color: theme.palette.text.hint }} > {t('dashboard.settings.connectivity.show.physical.fetching.address')} </Typography>}
				{!fetchingMac && machineMac && <OutlinedInput
					style={{ width: '100%' }}
					type={'text'}
					value={machineMac}
					endAdornment={
						<InputAdornment position="end">
							<ThemeTooltip title={<span>{t(`dashboard.settings.connectivity.show.physical.copy.address.to.clipboard`)}</span>}>
								<IconButton
									onClick={copyMacToClipboard}
									edge="end"
								>
									<ContentCopyIcon />
								</IconButton>
							</ThemeTooltip>
						</InputAdornment>
					}
				/>}
			</div>
		</Collapse>
	</TitleButtonContent>;
}
