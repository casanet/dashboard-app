import { Grid, Paper, Slider, useMediaQuery, Theme, IconButton, Tooltip } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';
import Remove from '@material-ui/icons/Remove';
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import '../../theme/styles/minions.scss'
import { LocalStorageKey, setLocalStorageItem, getLocalStorageItem } from "../../infrastructure/local-storage";
import { Minion } from "../../infrastructure/generated/api";
import { MinionOverview } from "../../components/minions/MinionOverview";
import { minionsService } from "../../services/minions.service";
import { GRID_CARDS_RATION_STEP } from "../../infrastructure/consts";
import { MinionFullInfo } from "../../components/minions/MinionFullInfo";
import { useParams } from "react-router-dom";
import { handleServerRestError } from "../../services/notifications.service";
import { Loader } from "../../components/Loader";
import { DashboardPageInjectProps } from "../Dashboard";
import { mapMinionTypeToDisplay } from "../../logic/common/minionsUtils";
import { NoContent } from "../../components/NoContent";
import WbIncandescentIcon from '@material-ui/icons/WbIncandescent';

// For mock only, generate "minions"
// const minions: Minion[] = new Array(200).fill(0).map((o,i) => ({ minionId: i, name: `${i}`, isProperlyCommunicated: true, minionType: MinionTypes.Switch, minionStatus: { switch: { status: i % 2 == 0 ? SwitchOptions.On : SwitchOptions.Off } } } as unknown as Minion));

// TODO:TEMP fix ratio

// The default minion card size
const defaultWidth = 410;
const defaultHeight = 240;

// The max/min ration (in %) to change from the default size
const maxRation = 100;
const minRation = 25;
const defaultRation = 40;

export default function Minions(props: DashboardPageInjectProps) {
	const { t } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
	const largeDesktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
	const [sizeRatio, setSizeRatio] = useState<number>(getLocalStorageItem<number>(LocalStorageKey.MinionsCardRatio, { itemType: 'number' }) || defaultRation);
	const [minions, setMinions] = useState<Minion[]>([]);
	const [filteredMinions, setFilteredMinion] = useState<Minion[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		let minionsDetacher: () => void;
		setLoading(true);
		(async () => {
			try {
				// Subscribe to the minion data feed
				minionsDetacher = await minionsService.attachDataSubs(setMinions);
			} catch (error) {
				await handleServerRestError(error);
			}
			setLoading(false);
		})();

		return () => {
			// unsubscribe the feed on component unmount
			minionsDetacher && minionsDetacher();
		};
	}, []);

	useEffect(() => {
		// every time the minion collection has changed or the search term changed, re-calc the filtered minions
		calcMinionsFilter(minions);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [minions, props.searchText])

	function calcMinionsFilter(minions: Minion[]) {
		const searchString = props.searchText?.trim().toLowerCase() || '';
		const filteredMinions = !searchString ? minions : minions.filter(m => {
			// If the name match, return true
			if (m.name.toLowerCase().includes(searchString)) {
				return true;
			}
			// Check if the minion type match to the search term
			return t(mapMinionTypeToDisplay[m.minionType])?.toLowerCase()?.includes(searchString);
		});
		setFilteredMinion(filteredMinions);
	}

	function applyNewSizeRation(newRation: number) {
		setSizeRatio(newRation);
		setLocalStorageItem<number>(LocalStorageKey.MinionsCardRatio, newRation, { itemType: 'number' });
	}

	function handleRationScrollChange(event: any, newValue: number | number[]) {
		applyNewSizeRation(newValue as number);
	};

	// Calc the minions size px 
	const calcRationPercents = sizeRatio / 100;
	const calculatedWidth = defaultWidth * calcRationPercents;
	const calculatedHeight = defaultHeight * calcRationPercents;

	const selectedMinion = minions.find(m => id === m.minionId);
	const showMinionFullInfo = !!id && !!selectedMinion;

	if (loading) {
		return <Loader />;
	}

	// If there are no any minion, show proper message
	if (minions.length === 0) {
		return <NoContent Icon={WbIncandescentIcon} message={t('dashboard.minions.no.minions.message')} />
	}

	// If there are no any minion match the search, show proper message
	if (filteredMinions.length === 0) {
		return <NoContent Icon={WbIncandescentIcon} message={t('dashboard.minions.no.minions.match.message')} />
	}

	return <div className="minions-container">
		{/* Show minions cards grid only if none has been selected *or* it's very wide screen */}
		{<div className={`minions-grid-area ${showMinionFullInfo && '--minion-full-info-enabled'} ${!largeDesktopMode && showMinionFullInfo && '--hide-minion-grid'}`}>
			{/* The minions cards grid */}
			<Grid className={`minions-grid-container ${!desktopMode && '--mobile'}`}
				container
				direction="row"
				justifyContent="flex-start"
				alignItems="flex-start"
			>
				{filteredMinions.map((minion) =>
					<div className={`minion-grid-box-container ${!desktopMode && '--mobile'}`} key={minion.minionId}>
						<Paper className="" elevation={3}>
							{/* Set the minion card content container size  */}
							<div className="minion-grid-box" style={{ width: `${calculatedWidth}px`, height: `${calculatedHeight}px` }}>
								<MinionOverview minion={minion} ratio={sizeRatio} />
							</div>
						</Paper>
					</div>)}
			</Grid>
			{/* The grid card size ratio scroll */}
			<div className={`resize-slider-container ${showMinionFullInfo && '--minion-full-info-enabled'} ${!desktopMode && '--mobile'}`}>
				<Grid
					container
					direction={desktopMode ? 'row' : 'column-reverse'}
					justifyContent="space-between"
					alignItems="center"
				>
					<div>
						<Tooltip className="resize-slider-icon-tip" title={<span>{t('dashboard.minions.decrease.card.ration')}</span>} enterDelay={100}>
							<IconButton
								onClick={() => { sizeRatio > minRation && applyNewSizeRation(sizeRatio - GRID_CARDS_RATION_STEP); }}
								color="inherit">
								<Remove />
							</IconButton>
						</Tooltip>
					</div>
					<div className={`resize-slider ${!desktopMode && '--mobile'}`}>
						<Slider orientation={desktopMode ? 'horizontal' : 'vertical'} value={sizeRatio} onChange={handleRationScrollChange} min={minRation} max={maxRation} />
					</div>
					<div>
						<Tooltip className="resize-slider-icon-tip" title={<span>{t('dashboard.minions.increase.card.ration')}</span>} enterDelay={100}>
							<IconButton
								onClick={() => { sizeRatio < maxRation && applyNewSizeRation(sizeRatio + GRID_CARDS_RATION_STEP); }}
								color="inherit">
								<AddIcon />
							</IconButton>
						</Tooltip>
					</div>
				</Grid>
			</div>
		</div>}

		{/* If minion has been selected, show the full minion properties view card */}
		{<div className={`minion-full-info-area-container ${showMinionFullInfo && '--minion-full-info-enabled'} ${!largeDesktopMode && '--small-screen'}`}>
			<Paper elevation={3} className="minion-full-info-card">
				{showMinionFullInfo && <MinionFullInfo minion={selectedMinion} />}
			</Paper>
		</div>}
	</div>;
}