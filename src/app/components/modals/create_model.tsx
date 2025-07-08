import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const features =
  typeof window !== "undefined" && (window as any).applicationConfig?.features
    ? (window as any).applicationConfig.features
    : {};

interface Bookmark {
  bookmark_id: number;
  bookmark_name: string;
  bookmark_page: string;
  bookmarkSelected: boolean;
  ischanged: boolean;
  isallchanged: boolean;
  isoverlapped: boolean;
  model: any[];
}

interface Model {
  ph: any[];
  geo: any[];
  contract: string;
  selected_type: string;
  modeling_type: string;
  name: string;
  desc: string;
  isChargeable?: string;
  isActivated?: boolean;
  id?: number;
  [key: string]: any;
}

interface CreateModelProps {
  show: boolean;
  onClose: () => void;
  model: Model;
  isAddMoreModel?: boolean;
  oculusId?: number;
  liveCompare?: boolean;
  mode?: string;
  isSharedCopy?: boolean;
  lockedQuarter?: string;
  onSwitchTab?: () => void;
}

const CreateModel: React.FC<CreateModelProps> = ({
  show,
  onClose,
  model: initialModel,
  isAddMoreModel = false,
  oculusId,
  liveCompare,
  mode = '',
  isSharedCopy = false,
  lockedQuarter = '',
}) => {
  // State
  const [model, setModel] = useState<Model>({ ...initialModel });
  const [bookmark, setBookmark] = useState<Bookmark>({
    bookmark_id: 0,
    bookmark_name: '',
    bookmark_page: '',
    bookmarkSelected: false,
    ischanged: false,
    isallchanged: false,
    isoverlapped: false,
    model: [],
  });
  const [alertMsg, setAlertMsg] = useState<{ text: string; visible: boolean }>({ text: '', visible: false });
  const [simpleError, setSimpleError] = useState<{ text: string; visible: boolean }>({ text: '', visible: false });
  const [complexError, setComplexError] = useState<{ text: string; visible: boolean }>({ text: '', visible: false });
  const [isloading, setIsloading] = useState(false);
  const [lockconfig, setLockconfig] = useState({ showtree: false, selected: 'No' });
  const [lockQuarter, setLockQuarter] = useState<string[]>(['No']);

  // Computed
  const submissionDisabled = useMemo(() => {
    if ((mode === 'copy' && model.isActivated === true) || mode === 'copy') {
      return !model.name || model.name.length <= 0;
    } else {
      return model.ph.length < 1 || model.geo.length < 1 || model.contract.length !== 1 || !model.name || model.name.length < 1;
    }
  }, [mode, model]);

  const buttonText = useMemo(() => {
    if (model.isActivated === true && mode === 'copy') {
      return isloading ? 'Activating...' : 'Activate';
    } else if (mode === 'copy') {
      return isloading ? 'Copying...' : 'Copy';
    } else {
      return isloading ? 'Creating...' : 'Create';
    }
  }, [mode, model.isActivated, isloading]);

  const titleText = useMemo(() => {
    if (mode === 'copy' && model.isActivated === true) {
      return 'Activate Simulator';
    } else if (mode === 'copy') {
      return 'Copy Simulation';
    } else {
      return 'Define your intersection';
    }
  }, [mode, model.isActivated]);

  const SimulatorName = useMemo(() => {
    return isAddMoreModel ? 'Dynamic Outcome Simulation Name' : 'Dynamic Outcome Simulator Name';
  }, [isAddMoreModel]);

  // Handlers
  function closeDlg() {
    if (isloading) return;
    setSimpleError({ text: '', visible: false });
    setComplexError({ text: '', visible: false });
    onClose();
  }

  function resetError() {
    setSimpleError({ text: '', visible: false });
    setComplexError({ text: '', visible: false });
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setModel({ ...model, [e.target.name]: e.target.value });
    resetError();
  }

  function toggleQuarters() {
    setLockconfig(lc => ({ ...lc, showtree: !lc.showtree }));
  }

  function updateSelectedQuarter(item: string) {
    setLockconfig(lc => ({ ...lc, selected: item, showtree: false }));
  }

  function hasErrors() {
    if (!model.name || model.name.trim().length < 3) {
      setSimpleError({ text: 'Model name must be at least 3 characters.', visible: true });
      return true;
    }
    return false;
  }

  function targetMethod() {
    if (mode === 'copy' && model.isActivated === true) {
      // activeArchivedOculus();
    } else if (mode === 'copy') {
      // copyOculus();
    } else if (bookmark.bookmarkSelected) {
      // createModelBookmark();
    } else {
      // createModel();
    }
  }

  useEffect(() => {
    if (features.jul22ModelToScenario) {
      setLockQuarter(['No', 'Through FY24 Q1', 'Through FY24 Q2']);
    }
  }, []);

  return (
    <Dialog open={show} onClose={closeDlg} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        {titleText}
        <IconButton
          aria-label="close"
          onClick={closeDlg}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
          size="large">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {alertMsg.visible && (
          <Box mb={2}>
            <Typography color="warning.main" dangerouslySetInnerHTML={{ __html: alertMsg.text }} />
          </Box>
        )}
        {complexError.visible && (
          <Box mb={2} display="flex" alignItems="center">
            <img src="/images/error-icon.svg" alt="Error" style={{ marginRight: 8, width: 24, height: 24 }} />
            <Typography color="error">{complexError.text}</Typography>
          </Box>
        )}
        {simpleError.visible && (
          <Box mb={2}>
            <Typography color="error" dangerouslySetInnerHTML={{ __html: simpleError.text }} />
          </Box>
        )}
        <Box mb={2}>
          <Typography variant="subtitle1" component="label" htmlFor="Input-Dtm-ModelCreation-Name">
            {SimulatorName} <span aria-label="(Required field)" style={{ color: 'red' }}>*</span>
          </Typography>
          <TextField
            id="Input-Dtm-ModelCreation-Name"
            name="name"
            value={bookmark.bookmarkSelected ? bookmark.bookmark_name : model.name}
            fullWidth
            margin="dense"
            variant="outlined"
            placeholder={mode === 'copy' ? 'Give your simulation a unique name' : 'Give a unique name'}
            required
            disabled={isAddMoreModel}
            onChange={e => {
              if (bookmark.bookmarkSelected) setBookmark(b => ({ ...b, bookmark_name: e.target.value }));
              else setModel(m => ({ ...m, name: e.target.value }));
              resetError();
            }}
            inputProps={{ maxLength: 255 }}
          />
          <TextField
            id="Texarea-Dtm-ModelCreation-descrip"
            name="desc"
            value={model.desc}
            fullWidth
            margin="dense"
            variant="outlined"
            multiline
            minRows={3}
            maxRows={6}
            inputProps={{ maxLength: 500 }}
            placeholder={
              mode === 'copy'
                ? 'Add a brief description of your simulation (up to 500 alphanumeric characters)'
                : !isAddMoreModel
                  ? 'Add a brief description (up to 500 alphanumeric characters)'
                  : ''
            }
            onChange={handleInputChange}
            onKeyUp={resetError}
            disabled={isAddMoreModel}
          />
        </Box>
        {features.jul22ModelToScenario && (
          <Box mb={2}>
            <Typography variant="subtitle2" component="div" gutterBottom>
              Do you want to lock any Quarter forecast?
              <span title="Selecting a quarter freezes the live forecast from DTM until that quarter." style={{ marginLeft: 8, color: '#888', cursor: 'pointer' }}>ℹ️</span>
            </Typography>
            <Button
              id={`Btn-Dtm-Modal-LockQuarter-Selected-${lockconfig.selected.replace(/\s/g, '')}`}
              aria-expanded={lockconfig.showtree ? 'true' : 'false'}
              type="button"
              variant="outlined"
              onClick={toggleQuarters}
              disabled={isAddMoreModel}
              sx={{ mb: 1 }}
            >
              {lockconfig.selected}
            </Button>
            {lockconfig.showtree && (
              <Box>
                {lockQuarter.map((item, idx) => (
                  <Button
                    key={idx}
                    id={`Btn-Dtm-Modal-LockQuarter-${item.replace(/\s/g, '')}`}
                    onClick={() => updateSelectedQuarter(item)}
                    sx={{ mr: 1, mb: 1 }}
                    variant="text"
                  >
                    {item}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          id="Btn-Dtm-ModelCreation-Cancel"
          onClick={closeDlg}
          color="secondary"
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          id="Btn-Dtm-ModelCreation-Create"
          color="primary"
          variant="contained"
          disabled={isloading || submissionDisabled}
          onClick={targetMethod}
        >
          {buttonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateModel;