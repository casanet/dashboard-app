import { Grid, IconButton } from "@material-ui/core";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import clonedeep from 'lodash.clonedeep';
import { TypeEditStatusProps } from "./MinionEditStatus";
import { SwitchMode } from "../overviewMinionsStatus/SwitchMode";
import { defaultMinionStatus } from "../../../logic/common/minionsUtils";
import { ThemeTooltip } from "../../global/ThemeTooltip";
import { SwitchOptions } from "../../../infrastructure/generated/api/swagger/api";


export function ToggleEditStatus(props: TypeEditStatusProps) {
	const { t } = useTranslation();

	const disabled = props.disabled;

	async function changeStatus(switchOptions: SwitchOptions) {
		let minionStatus = clonedeep<any>(props.minionStatus);
		if (!minionStatus[props.minionType]) {
			minionStatus = defaultMinionStatus(props.minionType);
		}
		minionStatus[props.minionType].status = switchOptions;
		props.setMinionStatus(minionStatus);
	};

	return <Fragment>
		<Grid
			container
			justifyContent="center"
			alignItems="center"
		>
			<div style={{ marginTop: `${props.smallFontRatio}px` }}>
				<ThemeTooltip title={<span>{t('dashboard.minions.toggle.send.on.command')}</span>} >
					<IconButton
						disabled={disabled}
						onClick={() => { changeStatus(SwitchOptions.On); }}
						color="inherit">
						<SwitchMode mode={SwitchOptions.On} fontRatio={props.fontRatio * 2.3} isOn={true} />
					</IconButton>
				</ThemeTooltip>
			</div>
			<div style={{ marginTop: `${props.smallFontRatio}px` }}>
				<ThemeTooltip title={<span>{t('dashboard.minions.toggle.send.off.command')}</span>} >
					<IconButton
						disabled={disabled}
						onClick={() => { changeStatus(SwitchOptions.Off); }}
						color="inherit">
						<SwitchMode mode={SwitchOptions.Off} fontRatio={props.fontRatio * 2.3} isOn={true} />
					</IconButton>
				</ThemeTooltip>
			</div>
		</Grid>
	</Fragment>;

}
