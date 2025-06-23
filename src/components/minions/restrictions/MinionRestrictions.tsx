import { Button, CircularProgress, Grid, IconButton, Theme, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import Divider from "@mui/material/Divider";
import { useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from "react-i18next";
import Collapse from '@mui/material/Collapse';
import { Duration } from "unitsnet-js";
import { DashboardRoutes, DEFAULT_FONT_RATION } from "../../../infrastructure/consts";
import { Minion, minionsService } from "../../../services/minions.service";
import { getModeColor, marginLeft } from "../../../logic/common/themeUtils";
import { ThemeTooltip } from "../../global/ThemeTooltip";
import LaunchIcon from '@mui/icons-material/Launch';
import { useNavigate } from "react-router-dom";
import { RestrictionMode } from "./RestrictionMode";
import { ApiFacade, RestrictionItem, RestrictionType } from "../../../infrastructure/generated/api/swagger/api";
import { handleServerRestError } from "../../../services/notifications.service";
import DeleteIcon from '@mui/icons-material/Delete';
import { AddRestriction } from "./AddRestriction";

interface MinionRestrictionsProps {
    minion: Minion;
}

const PROPERTIES_OPEN_ANIMATION_DURATION = Duration.FromSeconds(0.8);

export default function MinionRestrictions(props: MinionRestrictionsProps) {
    const { t } = useTranslation();
    const theme = useTheme();
    const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
    const [showAddRestrictionView, setShowAddRestrictionView] = useState<boolean>(false);
    const [savingRestrictions, setSavingRestrictions] = useState<string>();
    const [addingRestrictions, setAddingRestrictions] = useState<boolean>(false);
    const navigate = useNavigate();

    const minion = props?.minion;
    const restrictions = minion?.restrictions || [];

    async function setRestrictions(restrictionsToSet: RestrictionItem[]) {
        try {
            await ApiFacade.MinionsApi.setMinionRestriction(minion?.minionId || '', restrictionsToSet);
            minion!.restrictions = restrictionsToSet;
            minionsService.updateMinion(minion);
        } catch (error) {
            handleServerRestError(error);
        }
    }

    async function addRestriction(restriction: RestrictionItem) {
        setAddingRestrictions(true);
        const restrictionsCopy: RestrictionItem[] = [...restrictions];
        restrictionsCopy.push(restriction);
        await setRestrictions(restrictionsCopy);
        setAddingRestrictions(false);
        setShowAddRestrictionView(false)
    }

    async function removeRestriction(userEmail: string) {
        setSavingRestrictions(userEmail);
        const restrictionsCopy: RestrictionItem[] = [...restrictions];
        const replaceIndex = restrictionsCopy.findIndex((r => r.userEmail === userEmail));
        restrictionsCopy.splice(replaceIndex, 1);
        await setRestrictions(restrictionsCopy);
        setSavingRestrictions('');
    }

    async function updateRestriction(userEmail: string, restrictionType: RestrictionType) {
        setSavingRestrictions(userEmail);
        const restrictionsCopy: RestrictionItem[] = [...restrictions];
        const replaceIndex = restrictionsCopy.findIndex((r => r.userEmail === userEmail));
        restrictionsCopy[replaceIndex] = {
            userEmail,
            restrictionType,
        }
        await setRestrictions(restrictionsCopy);
        setSavingRestrictions('');
    }


    return <div>
        {!restrictions?.length && <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
        >
            <Typography style={{ fontSize: DEFAULT_FONT_RATION * 0.7, color: getModeColor(false, theme) }} >{t('dashboard.restrictions.no.restrictions')}</Typography>
        </Grid>}
        {restrictions.map((restriction) => {
            return <div style={{ width: '100%' }}>
                <div style={{ display: 'flex' }}>
                    <Grid
                        style={{ width: '100%' }}
                        container
                        // In mobile show it on above other
                        direction={desktopMode ? 'row' : 'column'}
                        justifyContent="space-between"
                        // In mobile align content in the start
                        alignItems={desktopMode ? 'center' : 'flex-start'}
                    >
                        <div
                            style={{
                                display: 'flex',
                                marginTop: !desktopMode ? (DEFAULT_FONT_RATION * 0.3) : 0,
                                [marginLeft(theme)]: !desktopMode ? (DEFAULT_FONT_RATION * 0.2) : 0,
                                fontSize: DEFAULT_FONT_RATION * 0.65,
                                maxWidth: '55%',
                                textOverflow: 'clip',
                                color: getModeColor(true, theme)
                            }}
                        >
                            <div>
                                <p> {restriction.userEmail}</p>
                            </div>
                            <ThemeTooltip title={<span>{t('dashboard.restrictions.see.user.info')}</span>} >
                                <IconButton
                                    onClick={() => navigate(`${DashboardRoutes.profile.path}/${restriction.userEmail}`)}
                                    color="inherit">
                                    <LaunchIcon fontSize="small" />
                                </IconButton>
                            </ThemeTooltip>
                        </div>
                        <div>
                            <RestrictionMode disabled={showAddRestrictionView || savingRestrictions === restriction.userEmail} onRestrictionChange={((restrictionType) => { updateRestriction(restriction.userEmail, restrictionType); })} restrictionType={restriction.restrictionType} />
                        </div>
                    </Grid>
                    <Grid
                        style={{ maxWidth: DEFAULT_FONT_RATION * 2.5, marginBottom: DEFAULT_FONT_RATION * 0.3 }}
                        container
                        direction={'row'}
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        {savingRestrictions === restriction.userEmail ?
                            <CircularProgress thickness={5} size={DEFAULT_FONT_RATION} /> :
                            <ThemeTooltip title={<span>{t(`dashboard.restrictions.remove.restriction`, { user: restriction.userEmail })}</span>} >
                                <IconButton
                                    disabled={showAddRestrictionView}
                                    style={{ padding: DEFAULT_FONT_RATION * 0.1 }}
                                    onClick={() => { removeRestriction(restriction.userEmail) }}
                                    color="inherit">
                                    <DeleteIcon style={{ fontSize: DEFAULT_FONT_RATION * 0.9 }} />
                                </IconButton>
                            </ThemeTooltip>}
                    </Grid>
                </div>
                <Divider variant={'fullWidth'} flexItem />
            </div>;
        })}
        <div style={{ marginTop: DEFAULT_FONT_RATION, width: '100%' }}>
            <Collapse in={showAddRestrictionView} timeout={PROPERTIES_OPEN_ANIMATION_DURATION.Milliseconds}>
                <AddRestriction minion={minion} saving={addingRestrictions} onFinished={(restriction) => { !restriction ? setShowAddRestrictionView(false) : addRestriction(restriction) }} />
            </Collapse>
            {!showAddRestrictionView && <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="stretch"
            >
                <Button onClick={() => { setShowAddRestrictionView(true); }} variant='contained' startIcon={<AddIcon />}>
                    {t('dashboard.restrictions.add.restriction')}
                </Button>
            </Grid>}
        </div>
    </div>
}