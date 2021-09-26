import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide } from '@material-ui/core';
import MuiButton from "@mui/material/Button";
import { TransitionProps } from '@material-ui/core/transitions';
import * as React from 'react';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children?: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface AlertDialogProps {
	title: string;
	text?: string;
	submitText: string;
	cancelText: string;
	open: boolean;
	onSubmit: () => void;
	onCancel: () => void;
	submitColor?: "inherit" | "error" | "primary" | "secondary" | "success" | "info" | "warning" | undefined;
}

export function AlertDialog(props: AlertDialogProps) {
  const { open, onSubmit, onCancel, submitText, cancelText, text, title, submitColor } = props;

  return (
    <div>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={onCancel}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {text}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={onCancel}>{cancelText}</Button>
          <MuiButton variant="contained" color={submitColor} onClick={onSubmit}>{submitText}</MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
}