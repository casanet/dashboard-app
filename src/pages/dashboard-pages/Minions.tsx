import { Grid, Paper, Slider, useMediaQuery, Theme, IconButton } from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';
import Remove from '@material-ui/icons/Remove';
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import '../../theme/styles/minions.scss';
import { LocalStorageKey, setLocalStorageItem, getLocalStorageItem } from "../../infrastructure/local-storage";
import { Minion } from "../../infrastructure/generated/api";
import { MinionOverview } from "../../components/minions/MinionOverview";
import { minionsService } from "../../services/minions.service";
import { CREATE_MINION_PATH, GRID_CARDS_RATION_STEP } from "../../infrastructure/consts";
import { MinionFullInfo } from "../../components/minions/MinionFullInfo";
import { useLocation, useParams } from "react-router-dom";
import { Loader } from "../../components/Loader";
import { DashboardPageInjectProps } from "../Dashboard";
import { mapMinionTypeToDisplay } from "../../logic/common/minionsUtils";
import { NoContent } from "../../components/NoContent";
import WbIncandescentIcon from '@material-ui/icons/WbIncandescent';
import { ThemeTooltip } from "../../components/global/ThemeTooltip";
import { CreateMinion } from "../../components/minions/CreateMinion";
import { useData } from "../../hooks/useData";
import { PageLayout } from "../../components/layouts/PageLayout";

// The default minion card size
const defaultWidth = 410;
const defaultHeight = 240;

// The max/min ration (in %) to change from the default size
const maxRation = 100;
const minRation = 25;

const mobileDefaultRation = 75;
const desktopDefaultRation = 60;
const wideDesktopDefaultRation = 70;
const veryWideDesktopDefaultRation = 90;

function getMinionsCardRationRation(desktopMode: boolean, wideDesktopMode: boolean, veryWideDesktopMode: boolean): number {

	const savedRation = getLocalStorageItem<number>(LocalStorageKey.MinionsCardRatio, { itemType: 'number' });
	// If size saved, return it
	if (savedRation) {
		return savedRation;
	}
	if (veryWideDesktopMode) {
		return veryWideDesktopDefaultRation;
	}
	if (wideDesktopMode) {
		return wideDesktopDefaultRation;
	}
	if (desktopMode) {
		return desktopDefaultRation;
	}
	return mobileDefaultRation;
}

export default function Minions(props: DashboardPageInjectProps) {
	const { t } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const location = useLocation();
	const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
	const wideDesktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
	const veryWideDesktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
	const [minions, loading] = useData(minionsService, []);

	const [sizeRatio, setSizeRatio] = useState<number>(getMinionsCardRationRation(desktopMode, wideDesktopMode, veryWideDesktopMode));
	const [filteredMinions, setFilteredMinion] = useState<Minion[]>([]);

	useEffect(() => {
		// every time the minion collection has changed or the search term changed, re-calc the filtered minions
		calcMinionsFilter(minions);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [minions, props.searchText]);

	function calcMinionsFilter(minions: Minion[]) {
		const searchString = props.searchText?.trim().toLowerCase() || '';
		// In case of empty search term, "clone" collection anyway to avoid sort cache issue
		const filteredMinions = !searchString ? [...minions] : minions.filter(m => {
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

	// Show minion info if there is an id and the id match some minion
	const showMinionFullInfo = !!id && !!selectedMinion;

	// Show minion creation view, if the path match minion creation  
	const showCreateMinion = location?.pathname === CREATE_MINION_PATH;

	// Show side view in case of minion selected or minion creation
	const minionSideContainer = showMinionFullInfo || showCreateMinion;

	if (loading) {
		return <Loader fancy={{ text: t('dashboard.loading.data', { data: t('global.minions').toLowerCase() }) }} />;
	}

	// If there are no any minion, show proper message
	if (minions.length === 0) {
		return <NoContent Icon={WbIncandescentIcon} message={t('dashboard.minions.no.minions.message')} />
	}

	// If there are no any minion match the search, show proper message
	if (filteredMinions.length === 0) {
		return <NoContent Icon={WbIncandescentIcon} message={t('dashboard.minions.no.minions.match.message')} />
	}

	// As default, the side info is empty
	let SideInfo = <div></div>;
	if (showMinionFullInfo) {
		SideInfo = <MinionFullInfo minion={selectedMinion} />;
	}
	if (showCreateMinion) {
		SideInfo = <CreateMinion />;
	}

	return <PageLayout
		showSideInfo={minionSideContainer}
		sideInfo={SideInfo}
	>
		<div className={'minions-container'} >
			<Grid
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
			<div className={`resize-slider-container ${minionSideContainer && '--minion-full-info-enabled'} ${!desktopMode && '--mobile'}`}>
				<Grid
					container
					direction={desktopMode ? 'row' : 'column-reverse'}
					justifyContent="space-between"
					alignItems="center"
				>
					<div>
						<ThemeTooltip className="resize-slider-icon-tip" title={<span>{t('dashboard.minions.decrease.card.ration')}</span>} enterDelay={100}>
							<IconButton
								onClick={() => { sizeRatio > minRation && applyNewSizeRation(sizeRatio - GRID_CARDS_RATION_STEP); }}
								color="inherit">
								<Remove />
							</IconButton>
						</ThemeTooltip>
					</div>
					<div className={`resize-slider ${!desktopMode && '--mobile'}`}>
						<Slider orientation={desktopMode ? 'horizontal' : 'vertical'} value={sizeRatio} onChange={handleRationScrollChange} min={minRation} max={maxRation} />
					</div>
					<div>
						<ThemeTooltip className="resize-slider-icon-tip" title={<span>{t('dashboard.minions.increase.card.ration')}</span>} enterDelay={100}>
							<IconButton
								onClick={() => { sizeRatio < maxRation && applyNewSizeRation(sizeRatio + GRID_CARDS_RATION_STEP); }}
								color="inherit">
								<AddIcon />
							</IconButton>
						</ThemeTooltip>
					</div>
				</Grid>
			</div>
		</div>
	</PageLayout>;
}
