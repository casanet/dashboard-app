import { Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import RefreshIcon from '@mui/icons-material/Refresh';
import { PageToolbarButton, ToolbarDivider } from "../dashboard/PageToolbar";
import { handleServerRestError } from "../../services/notifications.service";
import { useState } from "react";
import { usersService } from "../../services/users.service";
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from "react-router-dom";
import { CREATE_USER_PATH, DEFAULT_FONT_RATION } from "../../infrastructure/consts";

export function UsersToolbar() {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [refreshing, setRefreshing] = useState<boolean>(false);

	async function createUser(): Promise<boolean> {
		// Route to the create user path
		navigate(CREATE_USER_PATH);
		// Return false in order to not show the succeed icon, since it's pointless, only move route, yes? 
		return false;
	}

	async function refresh(): Promise<boolean> {
		setRefreshing(true);
		let succeed = false;
		try {
			await usersService.forceFetchData();
			succeed = true;
		} catch (error) {
			handleServerRestError(error);
		}
		setRefreshing(false);
		return succeed;
	}

	return <Grid
		style={{ padding: DEFAULT_FONT_RATION * 0.5 }}
		container
		direction="row"
		justifyContent="center"
		alignItems="center"
	>
		<PageToolbarButton
			loading={false}
			disabled={false}
			runAction={createUser}
			text={t('dashboard.toolbar.pages.users.create.user')}
			Icon={AddIcon}
			tip={t('dashboard.toolbar.pages.users.create.user.tip')}
		/>
		<ToolbarDivider />
		<PageToolbarButton
			loading={refreshing}
			disabled={refreshing}
			runAction={refresh}
			text={t('global.refresh')}
			Icon={RefreshIcon}
			tip={t('dashboard.toolbar.pages.users.refresh.tip')}
		/>
	</Grid>;
}
