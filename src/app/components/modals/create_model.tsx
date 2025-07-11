import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { useSelector, useDispatch } from 'react-redux';
import utility from '../../utility/utility';
import axios from 'axios';
import SET_OCULUS_TYPE from '../../../store/modeling/modelingSlice';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Hierarchy from '../hierarchy/hierarchy';
import Selected from '../hierarchy/selected';

// Extend the Window interface to include applicationConfig
declare global {
  interface Window {
    applicationConfig?: {
      features?: Record<string, any>;
      [key: string]: any;
    };
  }
}

const features =
  typeof window !== "undefined" && window.applicationConfig?.features
    ? window.applicationConfig.features
    : {};

const defaultModel = {
  ph: [],
  geo: [],
  contract: 'N',
  selected_type: 'S',
  modeling_type: 'Q',
  name: '',
  desc: '',
  isChargeable: '',
  isActivated: false
};

interface CreateModelProps {
  show: boolean;
  onClose: () => void;
  model: any;
  isAddMoreModel?: boolean;
  oculusId?: any;
  liveCompare?: any;
  mode?: string;
  isSharedCopy?: boolean;
  lockedQuarter?: string;
}

const CreateModel = ({
  show,
  onClose,
  model: initialModel,
  isAddMoreModel = false,
  oculusId,
  liveCompare,
  mode = '',
  isSharedCopy = false,
  lockedQuarter = '',
}: CreateModelProps) => {
  // Redux
  const dispatch = useDispatch();
  const bookmarkState = useSelector((state: any) => state.bookmark);
  const modelingState = useSelector((state: any) => state.modeling);
  const userState = useSelector((state: any) => state.user);

  // Data (state)
  const [bookmark, setBookmark] = useState({
    bookmark_id: 0,
    bookmark_name: '',
    bookmark_page: '',
    bookmarkSelected: false,
    ischanged: false,
    isallchanged: false,
    isoverlapped: false,
  });
  const [bookmarkdetail, setBookmarkDetail] = useState({
    bookmark_id: 0,
    ph: [],
    lh: [],
    bookmark_name: '',
    bookmark_page: 'SIMULATOR',
    phdetail: 0,
    islhdetail: false,
  });
  const [peopleHierarchyConfigMulti] = useState({
    type: "people",
    rootleveltext: "Accenture",
    singleselect: false,
    singleSelectRoot: false,
  });
  const [phconfig, setPhConfig] = useState({
    showtree: false,
    showselected: false,
    selected: []
  });
  const [locationHierarchyConfigMulti] = useState({
    type: "location",
    rootleveltext: "Global",
    disabletoplevelselect: false,
    singleselect: false,
    independent: true,
    dependencynodes: []
  });
  const [lhconfig, setLhConfig] = useState({
    showtree: false,
    showselected: false,
    selected: []
  });
  const [lockconfig, setLockConfig] = useState({
    showtree: false,
    selected: 'No',
  });
  const [lockQuarter, setLockQuarter] = useState(['No']);
  const [isloading, setIsLoading] = useState(false);
  const [isModelTypeDisabled, setIsModelTypeDisabled] = useState(false);
  const [isManuallySelectedCombined, setIsManuallySelectedCombined] = useState(false);
  const [simpleError, setSimpleError] = useState({ text: '', visible: false });
  const [complexError, setComplexError] = useState({ text: '', visible: false });
  const [alertMsg, setAlertMsg] = useState({ text: '', visible: false });
  const [model, setModel] = useState({ ...initialModel });
  // Computed (useMemo)
  const submissionDisabled = useMemo(() => {
    if ((mode === 'copy' && model.isActivated === true) || (mode === 'copy')) {
      return (!model.name || model.name.length <= 0);
    } else {
      return model.ph.length < 1 || model.geo.length < 1 || model.contract.length !== 1 || !model.name || (model.name.length < 1);
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
  }, [model, mode, isloading]);

  const titleText = useMemo(() => {
    if (mode === 'copy' && model.isActivated === true) {
      return "Activate Simulator";
    } else if (mode === 'copy') {
      return "Copy Simulation";
    } else {
      return "Define your intersection";
    }
  }, [mode, model]);

  const SimulatorName = useMemo(() => (
    isAddMoreModel ? "Dynamic Outcome Simulation Name" : "Dynamic Outcome Simulator Name"
  ), [isAddMoreModel]);

  // clearOnDelete (getter/setter)
  const clearOnDelete = useSelector((state: any) => state.bookmark?.bookmarkDeleted);

  // Watch (useEffect)
  useEffect(() => {
    const selectedBookmarkId = bookmarkState?.current?.bookmark_id;
    const deletedBookmarkId = bookmarkState?.bookmarkDeletedId;
    if (clearOnDelete && deletedBookmarkId === selectedBookmarkId) {
      clearBookmark();
    } else if (clearOnDelete) {
      dispatch({ type: 'RESET_BOOKMARK_DELETED' });
    }
    // eslint-disable-next-line
  }, [clearOnDelete, bookmarkState, dispatch]);

  // beforeMount (useEffect, runs once)
  useEffect(() => {
    if (features.aug24simChargScope) {
      model.isChargeable = "1";
    }
    // eslint-disable-next-line
  }, []);

  // mounted (useEffect, runs once)
  useEffect(() => {
    if (features.jul22ModelToScenario) {
      lockQuarterDD();
      getQuarterAndFY();
    }
    // eslint-disable-next-line
  }, []);

  // Methods (functions)
  const clearBookmark = useCallback(() => {
    dispatch({ type: 'RESET_BOOKMARK' });
    setBookmark(b => ({ ...b, bookmarkSelected: false }));
    resetError();
  }, [dispatch]);

  const resetError = () => {
    setSimpleError({ text: '', visible: false });
    setComplexError({ text: '', visible: false });
  };

  const lockQuarterDD = useCallback(() => {
    axios.get('/api/pickers/lock/quarter').then(res => {
      if (res.data && res.data.length > 0) {
        const resultset2 = res.data.map((element: any) =>
          `Through FY${element.fyqtr.slice(2, 4)} Q${element.fyqtr.slice(6)}`
        );
        resultset2.pop();
        setLockQuarter(['No', ...resultset2]);
      }
    }).catch(err => { /* handle error */ });
  }, []);

  const getQuarterAndFY = useCallback(() => {
    const ddFY = modelingState.details?.locked_fy;
    const ddQuarter = modelingState.details?.quarter;
    if (isAddMoreModel && ddFY !== "") {
      setLockConfig(cfg => ({ ...cfg, selected: `Through FY${ddFY} Q${ddQuarter}` }));
    }
  }, [isAddMoreModel, modelingState]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setModel((m: any) => ({ ...m, [e.target.name]: e.target.value }));
    resetError();
  };

  const togglePHTree = () => setPhConfig(cfg => ({ ...cfg, showtree: !cfg.showtree }));
  const toggleLHTree = () => setLhConfig(cfg => ({ ...cfg, showtree: !cfg.showtree }));
  const updateSelectedPH = (val: any) => setPhConfig(cfg => ({ ...cfg, selected: val, showselected: true }));
  const updateSelectedLH = (val: any) => setLhConfig(cfg => ({ ...cfg, selected: val, showselected: true }));
  const clearPH = () => setPhConfig(cfg => ({ ...cfg, selected: [], showselected: false }));
  const clearLH = () => setLhConfig(cfg => ({ ...cfg, selected: [], showselected: false }));

  const toggleQuarters = () => setLockConfig(lc => ({ ...lc, showtree: !lc.showtree }));
  const updateSelectedQuarter = (item: string) => setLockConfig(lc => ({ ...lc, selected: item, showtree: false }));

  function targetMethod() {
    // Implement your create/copy/activate logic here
  }

  const closeDlg = () => {
    onClose();
    resetError();
  };

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
          else setModel((m: any) => ({ ...m, name: e.target.value }));
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
      {/* Supervisory Org Hierarchy */}
      <div className="atp-modal-row">
        <div className="atp-modal-col">
        <div className="atp-modal-wrp">
          <div id="Label-Dtm-Home-PeopleHierarchy" className="atp-modal-lbl">
          <span>Select Supervisory Org</span>
          <span aria-label="(Required field)" className="field-req">*</span>
          <InfoOutlinedIcon
            titleAccess="Multiple selections permitted in Supervisory Org & Location simultaneously"
            className="atp-modal-info"
            fontSize="small"
          />
          </div>
          <button
          id="Btn-Dtm-Modal-PeopleHierarchy"
          aria-expanded={phconfig.showtree ? 'true' : 'false'}
          aria-controls="Collapse-Dtm-Modal-PeopleHierarchy"
          type="button"
          className="atp-modal-fakedd"
          onClick={togglePHTree}
          >
          Expand to browse Hierarchy
          <KeyboardArrowDownIcon aria-hidden="true" />
          </button>
          <div
          id="Collapse-Dtm-Modal-PeopleHierarchy"
          aria-describedby="Btn-Dtm-Modal-PeopleHierarchy"
          >
          {phconfig.showtree && (
            <Hierarchy
            rootId="CreateModel-peoplehierarchy"
            labelDescriptionExpandTrigger="Select People Hierarchy"
            config={peopleHierarchyConfigMulti}
            onSelect={updateSelectedPH}
            onClear={clearPH}
            />
          )}
          </div>
          {phconfig.showselected && <Selected selected={phconfig.selected} />}
        </div>
        </div>
      </div>
      {/* Location Hierarchy */}
      <div className="atp-modal-row">
        <div className="atp-modal-col">
        <div className="atp-modal-wrp">
          <div id="Label-Dtm-Home-LocationHierarchy" className="atp-modal-lbl">
          Select Location
          <span aria-label="(Required field)" className="field-req">*</span>
          <InfoOutlinedIcon
            titleAccess="Multiple selections permitted in Supervisory Org & Location simultaneously"
            className="atp-modal-info"
            fontSize="small"
          />
          </div>
          <button
          id="Btn-Dtm-Home-LocationHierarchy"
          aria-expanded={lhconfig.showtree ? 'true' : 'false'}
          aria-controls="Collapse-Dtm-Home-LocationHierarchy"
          type="button"
          className="atp-modal-fakedd"
          onClick={toggleLHTree}
          >
          Expand to browse Hierarchy
          <KeyboardArrowDownIcon aria-hidden="true" />
          </button>
          <div
          id="Collapse-Dtm-Home-LocationHierarchy"
          aria-describedby="Btn-Dtm-Home-LocationHierarchy"
          >
          {lhconfig.showtree && (
            <Hierarchy
            rootId="CreateModel-locationHierarchyParam"
            config={locationHierarchyConfigMulti}
            onSelect={updateSelectedLH}
            onClear={clearLH}
            />
          )}
          </div>
          {lhconfig.showselected && <Selected selected={lhconfig.selected} />}
        </div>
        </div>
      </div>
      {/* Contract-based and Chargeability Scope */}
      <div className="atp-modal-simChScope">
        <div id="Label-Dtm-Home-ContractBased" className="atp-modal-lbl">
        Is this model contract-based?
        </div>
        <div className="atp-createmodel-radios">
        <fieldset>
          <legend className="sr-only">Is this scenario contract-based?</legend>
          <label htmlFor="contractBasedYesModel" className="custom_layout">
          <input
            id="contractBasedYesModel"
            type="radio"
            value="Y"
            name="iscontractModel"
            required
            checked={model.contract === 'Y'}
            onChange={() => setModel((m: any) => ({ ...m, contract: 'Y' }))}
          />
          <span className="checkmark" /> Yes
          </label>
          <label htmlFor="contractBasedNoModel" className="custom_layout">
          <input
            id="contractBasedNoModel"
            type="radio"
            value="N"
            name="iscontractModel"
            required
            checked={model.contract === 'N'}
            onChange={() => setModel((m: any) => ({ ...m, contract: 'N' }))}
          />
          <span className="checkmark" /> No
          </label>
        </fieldset>
        </div>
      </div>
      <div className="atp-createmodel-ChScopeSelection">
        <fieldset>
        <legend className="sr-only">Chargeability Scope?</legend>
        <label htmlFor="inScopeModel" className="custom_layout">
          <input
          id="inScopeModel"
          type="radio"
          value="1"
          name="chargScope"
          required
          checked={model.isChargeable === '1'}
          onChange={() => setModel((m: any) => ({ ...m, isChargeable: '1' }))}
          />
          <span className="checkmark" /> In-Scope
        </label>
        <label htmlFor="outScopeModel" className="custom_layout">
          <input
          id="outScopeModel"
          type="radio"
          value="0"
          name="chargScope"
          required
          checked={model.isChargeable === '0'}
          onChange={() => setModel((m: any) => ({ ...m, isChargeable: '0' }))}
          />
          <span className="checkmark" /> Out-Scope
        </label>
        </fieldset>
      </div>
      {/* Model Type */}
      <div id="Label-Dtm-Home-Modeltype" className="atp-modal-lbl">
        Model Type
        <InfoOutlinedIcon
        titleAccess="Up to 8 Separate Models can be created. Not allowed for multiple PH/multiple LH selections."
        className="atp-modal-info"
        fontSize="small"
        />
      </div>
      <div className="atp-createmodel-radios">
        <fieldset>
        <legend className="sr-only">Model Type</legend>
        <label htmlFor="modelTypeSeparate" className="custom_layout">
          <input
          id="modelTypeSeparate"
          type="radio"
          value="S"
          name="modelType"
          required
          checked={model.selected_type === 'S'}
          disabled={isModelTypeDisabled}
          onChange={() => {
            setModel((m: any) => ({ ...m, selected_type: 'S' }));
            setIsManuallySelectedCombined(false);
          }}
          />
          <span className="checkmark" /> Separate
        </label>
        <label htmlFor="modelTypeCombined" className="custom_layout">
          <input
          id="modelTypeCombined"
          type="radio"
          value="C"
          name="modelType"
          required
          checked={model.selected_type === 'C'}
          disabled={isModelTypeDisabled}
          onChange={() => {
            setModel((m: any) => ({ ...m, selected_type: 'C' }));
            setIsManuallySelectedCombined(true);
          }}
          />
          <span className="checkmark" /> Combined
        </label>
        </fieldset>
      </div>
      {/* Lock Quarter (if feature enabled) */}
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
  )}  

  export default CreateModel;
