import { ActionSet, Minion, MinionStatus, MinionTypes } from "../../infrastructure/generated/api/swagger/api";
import Autocomplete from '@mui/material/Autocomplete';
import { useData } from "../../hooks/useData";
import { minionsService } from "../../services/minions.service";
import { useTranslation } from "react-i18next";
import { IconButton, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { SwitchEditStatus } from "../minions/editMinionStatus/SwitchEditStatus";
import { MinionEditStatus } from "../minions/editMinionStatus/MinionEditStatus";
import { DEFAULT_FONT_RATION } from "../../infrastructure/consts";
import { defaultMinionStatus, isOnMode } from "../../logic/common/minionsUtils";
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';

interface EditActionSetProps {
    actionSet: ActionSet;
    minionOwner: Minion;
    disable: boolean;
    onRemove: () => void;
    onUpdate: () => void;
}

export function EditActionSet(props: EditActionSetProps) {
    const { t } = useTranslation();

    const { actionSet, disable } = props;

    const [minions] = useData(minionsService);

    const [selectedMinion, setSelectedMinion] = useState<Minion | undefined>((minions.find(m => actionSet.minionId === m.minionId)));

    const [setStatus, setSetStatus] = useState<MinionStatus | undefined>(actionSet.setStatus);

    useEffect(() => {
        // Once the minion selection changed, re-find the minion status to show
        setSelectedMinion(minions.find(m => actionSet.minionId === m.minionId))
    }, [actionSet.minionId, minions])

    // Filter out action's trigger minion
    const availableMinions = minions.filter(m => m.minionId !== props.minionOwner.minionId);

    function updateStatus(status: MinionStatus) {
        setSetStatus(status);
        actionSet.setStatus = status;
        props.onUpdate();
    }

    return (<div style={{ width: '100%' }}>

        <div style={{ display: 'flex', width: '100%' }}>

            <div style={{ width: 'calc(100% - 20px)' }}>
                <Autocomplete
                    options={availableMinions}
                    disabled={disable}
                    getOptionLabel={(option: Minion) => {
                        return option.name;
                    }}
                    defaultValue={selectedMinion}
                    clearText={t('global.clear')}
                    closeText={t('global.close')}
                    noOptionsText={t('global.no.option')}
                    onChange={(e, o) => {
                        const newSelectedMinion = o as Minion;
                        setSelectedMinion(newSelectedMinion);
                        actionSet.minionId = newSelectedMinion?.minionId || '';
                        props.onUpdate();

                        if (newSelectedMinion?.minionType && newSelectedMinion?.minionType !== selectedMinion?.minionType) {
                            updateStatus(defaultMinionStatus(newSelectedMinion.minionType));
                        }

                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder={t('dashboard.actions.select.minion.to.set')}
                            disabled={disable}
                            variant="standard"
                        />
                    )}
                />
            </div>
            <div>
                <IconButton edge="end" aria-label="delete" onClick={props.onRemove}>
                    <RemoveCircleIcon />
                </IconButton>
            </div>
        </div>

        {setStatus && selectedMinion &&
            <div>
                <div>
                    <SwitchEditStatus disabled={disable} minionStatus={setStatus} setMinionStatus={updateStatus} minionType={selectedMinion.minionType} fontRatio={DEFAULT_FONT_RATION * 1.4} smallFontRatio={DEFAULT_FONT_RATION * 1.7 * 0.5} isOn={isOnMode(selectedMinion.minionType, setStatus)} />
                </div>
                <div>
                    {selectedMinion.minionType !== MinionTypes.Toggle && selectedMinion.minionType !== MinionTypes.Switch &&
                        <MinionEditStatus disabled={disable} minionStatus={setStatus} setMinionStatus={updateStatus} minionType={selectedMinion.minionType} fontRatio={DEFAULT_FONT_RATION * 1.5} />
                    }
                </div>
            </div>}
    </div>);
}