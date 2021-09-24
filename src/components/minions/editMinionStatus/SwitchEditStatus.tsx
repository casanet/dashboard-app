import { Grid, IconButton, Tooltip } from "@material-ui/core";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { MinionStatus, SwitchOptions } from "../../../infrastructure/generated/api";
import clonedeep from 'lodash.clonedeep';
import { TypeEditStatusProps } from "./MinionEditStatus";
import { SwitchMode } from "../overviewMinionsStatus/SwitchMode";
import { defaultMinionStatus } from "../../../logic/common/minionsUtils";


export function SwitchEditStatus(props: TypeEditStatusProps) {
	const { t } = useTranslation();

	const toggle = props.minionStatus[props.minionType as unknown as keyof MinionStatus];
	const disabled = props.disabled;

	async function changeStatus() {
		let minionStatus = clonedeep<any>(props.minionStatus);
		if (!minionStatus[props.minionType]) {
			minionStatus = defaultMinionStatus(props.minionType);
		}
		minionStatus[props.minionType].status = toggle?.status === SwitchOptions.On ? SwitchOptions.Off : SwitchOptions.On;
		props.setMinionStatus(minionStatus);
	};

	return <Fragment>
		<Grid
			container
			justifyContent="center"
			alignItems="center"
		>
			<div style={{ marginTop: `${props.smallFontRatio}px` }}>
				<Tooltip title={<span>{t('dashboard.minions.switch.press.to.toggle')}</span>}>
					<IconButton
						disabled={disabled}
						onClick={() => { changeStatus(); }}
						color="inherit">
						<SwitchMode mode={toggle?.status || SwitchOptions.Off} fontRatio={props.fontRatio * 2.3} isOn={props.isOn} />
					</IconButton>
				</Tooltip>
			</div>
		</Grid>
	</Fragment>;

}
