import { Grid, Typography, Paper, Slider, useMediaQuery, Theme, IconButton, Tooltip } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';
import Remove from '@material-ui/icons/Remove';
import { useState } from "react";
import { useTranslation } from "react-i18next";
import '../../theme/styles/minions.scss'
import { LocalStorageKey, setLocalStorageItem, getLocalStorageItem } from "../../infrastructure/local-storage";

// For mock only, generate "minions"
const minions = new Array(20).fill(0).map(() => ({}));

// The default minion card size
const defaultWidth = 410;
const defaultHeight = 350;

// The max/min ration (in %) to change from the default size
const maxRation = 100;
const minRation = 25;
const defaultRation = 40;

export default function Minions() {
	const { t } = useTranslation();
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
	const [sizeRation, setSizeRation] = useState<number>(getLocalStorageItem<number>(LocalStorageKey.MinionsCardRation, { itemType: 'number' }) || defaultRation);

	function applyNewSizeRation(newRation: number) {
		setSizeRation(newRation);
		setLocalStorageItem<number>(LocalStorageKey.MinionsCardRation, newRation, { itemType: 'number' });
	}

	function handleRationScrollChange(event: any, newValue: number | number[]) {
		applyNewSizeRation(newValue as number);
	};

	// Calc the minions size px 
	const calcRationPercents = sizeRation / 100;
	const calculatedWidth = defaultWidth * calcRationPercents;
	const calculatedHeight = defaultHeight * calcRationPercents;

	return <div className="minions-container">
		<Grid className="minions-grid-container"
			container
			direction="row"
			justifyContent="flex-start"
			alignItems="flex-start"
		>
			{minions.map(() =>
				<div className="minion-card-container">
					<Paper className="minion-card" elevation={3}>
						<div className="casanet-credit-container" style={{ width: `${calculatedWidth}px`, height: `${calculatedHeight}px` }}>
							<AddIcon />
							<Typography className="casanet-credit-text" variant="body2" >{t('global.powered.by.casanet')}</Typography>
						</div>
					</Paper>
				</div>)}
		</Grid>
		<div className={`resize-slider-container ${!desktopMode && '--mobile'}`}>
			<Grid
				container
				direction={desktopMode ? 'row' : 'column-reverse'}
				justifyContent="space-between"
				alignItems="center"
			>
				<div>
					<Tooltip className="resize-slider-icon-tip" title={<span>{t('dashboard.minions.decrease.card.ration')}</span>} enterDelay={300}>
						<IconButton
							onClick={() => { sizeRation > minRation && applyNewSizeRation(sizeRation - 0.2); }}
							color="inherit">
							<Remove />
						</IconButton>
					</Tooltip>
				</div>
				<div className={`resize-slider ${!desktopMode && '--mobile'}`}>
					<Slider orientation={desktopMode ? 'horizontal' : 'vertical'} value={sizeRation} onChange={handleRationScrollChange} min={minRation} max={maxRation} />
				</div>
				<div>
					<Tooltip className="resize-slider-icon-tip" title={<span>{t('dashboard.minions.increase.card.ration')}</span>} enterDelay={300}>
						<IconButton
							onClick={() => { sizeRation < maxRation && applyNewSizeRation(sizeRation + 0.2); }}
							color="inherit">
							<AddIcon />
						</IconButton>
					</Tooltip>
				</div>
			</Grid>
		</div>
	</div>
}