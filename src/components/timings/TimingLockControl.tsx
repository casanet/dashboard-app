import { Grid, useTheme } from "@material-ui/core";
import { useTranslation } from "react-i18next"
import { ThemeSwitch } from "../global/ThemeSwitch";
import { ThemeTooltip } from "../global/ThemeTooltip";
import { paddingLeft, paddingRight } from "../../logic/common/themeUtils";
import { CalibrationMode } from "../../infrastructure/generated/api/swagger/api";
import Typography from "@mui/material/Typography";
import InfoIcon from '@mui/icons-material/Info';
import { Theme, useMediaQuery } from "@mui/material";

interface TimingLockControlProps {
    lockMode: CalibrationMode | undefined;
    disabled: boolean;
    fontRatio: number;
    setLockMode: (lockMode: CalibrationMode | undefined) => void;
}

export function TimingLockControl(props: TimingLockControlProps) {
    const { t } = useTranslation();
    const desktopMode = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'));
    const theme = useTheme();

    const { fontRatio } = props;

    return <Grid
        container
        direction={'row'}
        justifyContent={desktopMode ? 'space-around' : "space-between"}
        alignItems={'center'}
        style={{ width: '100%', [paddingLeft(theme)]: desktopMode ? '20%' : '0%', [paddingRight(theme)]: desktopMode ? '15%' : '0%' }}
    >
        <Grid
            style={{ width: '70%' }}
            container
            direction={'row'}
            justifyContent="flex-start"
            alignItems="center"
        >
            <Typography style={{ fontSize: fontRatio * 0.8 }} >{t('dashboard.timings.set.lock.by.timing')}</Typography>
            <ThemeTooltip title={<span>{t('dashboard.timings.set.lock.by.timing.tip')}</span>}>
                <InfoIcon style={{ fontSize: fontRatio * 0.8, marginTop: fontRatio * -0.2 }} />
            </ThemeTooltip>
        </Grid>
        <Grid
            style={{ width: '30%' }}
            container
            direction="column"
            justifyContent="flex-end"
            alignItems="flex-end"
        >
            <ThemeSwitch disabled={props.disabled} checked={!!props.lockMode} size="medium" onChange={() => {
                props.setLockMode(props.lockMode ? undefined : CalibrationMode.LockDashboard);
            }} />
        </Grid>
    </Grid>;
}