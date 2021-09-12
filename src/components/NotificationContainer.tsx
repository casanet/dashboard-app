import { Snackbar } from "@material-ui/core";
import { useTranslation } from "react-i18next"
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { useEffect, useState } from "react";
import React from "react";
import { notificationsFeed } from "../services/notifications.service";
import { NotificationInfo } from "../infrastructure/symbols/global";

export function NotificationContainer() {
	const { t } = useTranslation(['translation', 'server']);
	const [open, setOpen] = useState(false);
	const [notificationInfo, setNotificationInfo] = useState<NotificationInfo>();

	useEffect(() => {
		let notificationsDetacher: () => void;

		// Subscribe to the notifications feed
		notificationsDetacher = notificationsFeed.attach((notificationInfo) => {
			setNotificationInfo(notificationInfo);
			setOpen(true);
		});

		return () => {
			// unsubscribe the feed on component unmount
			notificationsDetacher && notificationsDetacher();
		};
	}, []);

	const handleClose = (event: React.SyntheticEvent | React.MouseEvent, reason?: string) => {
		// if (reason === 'clickaway') {
		// 	return;
		// }
		setOpen(false);
	};

	return <div>
		<Snackbar
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'center',
			}}
			open={open}
			autoHideDuration={notificationInfo?.duration.Milliseconds}
			onClose={handleClose}
			message={notificationInfo ? t(notificationInfo.messageKey) : ''}
			action={
				<div>
					<IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
						<CloseIcon fontSize="small" />
					</IconButton>
				</div>
			}
		/>
	</div>
}