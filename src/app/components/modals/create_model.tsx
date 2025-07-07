import React, { useState, useRef, useEffect, useMemo } from 'react';
// import BookmarkSimulator from '../bookMark/bookmark'; // Implement or import as needed
// import Hierarchy from '../hierarchy/hierarchy'; // Implement or import as needed
// import Selected from '../hierarchy/selected'; // Implement or import as needed
// import CustomText from '../textarea/textarea'; // Implement or import as needed
// import utility from '../../utility/utility';
// import constList from '../../store/constants';
// import constants from '../../utility/constants';
// import axios from 'axios';

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
  model: Model;
  isAddMoreModel?: boolean;
  oculusId?: number;
  liveCompare?: boolean;
  mode?: string;
  isSharedCopy?: boolean;
  lockedQuarter?: string;
  onClose: () => void;
  onSwitchTab?: () => void;
}

const CreateModel: React.FC<CreateModelProps> = ({
  model: initialModel,
  isAddMoreModel = false,
  oculusId,
  liveCompare,
  mode = '',
  isSharedCopy = false,
  lockedQuarter = '',
  onClose,
  onSwitchTab,
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
  const [bookmarkdetail, setBookmarkdetail] = useState<any>({
    bookmark_id: 0,
    ph: [],
    lh: [],
    bookmark_name: '',
    bookmark_page: 'SIMULATOR',
    phdetail: 0,
    islhdetail: false,
  });
  const [alertMsg, setAlertMsg] = useState<{ text: string; visible: boolean }>({ text: '', visible: false });
  const [simpleError, setSimpleError] = useState<{ text: string; visible: boolean }>({ text: '', visible: false });
  const [complexError, setComplexError] = useState<{ text: string; visible: boolean }>({ text: '', visible: false });
  const [isloading, setIsloading] = useState(false);
  const [bookmarkdisable, setBookmarkdisable] = useState(false);
  const [isModelTypeDisabled, setIsModelTypeDisabled] = useState(false);
  const [isManuallySelectedCombined, setIsManuallySelectedCombined] = useState(false);
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
    // Clear bookmark and hierarchy configs as needed
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

  // Add more handlers for hierarchy, bookmark, lock quarter, etc.

  // Example: toggle lock quarter dropdown
  function toggleQuarters() {
    setLockconfig(lc => ({ ...lc, showtree: !lc.showtree }));
  }

  // Example: update selected lock quarter
  function updateSelectedQuarter(item: string) {
    setLockconfig(lc => ({ ...lc, selected: item, showtree: false }));
  }

  // Example: check for errors (simplified)
  function hasErrors() {
    if (!model.name || model.name.trim().length < 3) {
      setSimpleError({ text: 'Model name must be at least 3 characters.', visible: true });
      return true;
    }
    // Add more error checks as needed
    return false;
  }

  // Example: submit/copy/activate handler
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

  // Example: lock quarter dropdown options (simulate API call)
  useEffect(() => {
    if (features.jul22ModelToScenario) {
      // Simulate API call to get lock quarters
      setLockQuarter(['No', 'Through FY24 Q1', 'Through FY24 Q2']);
    }
  }, []);

  // Render
  return (
    <div className="animated fadeIn atp-modal">
      <div
        id="Modal-Dtm-Model-Name"
        className={`atp-modal-cont atp-modal-forecast${mode === 'copy' ? ' atp-copy-model' : ''}${bookmark.bookmarkSelected ? ' atp-modal-shared-bookmark' : ''}`}
      >
        <div className="atp-modal-head">
          <h2 id="Title-Dtm-Model-Name" className="modal-title">{titleText}</h2>
          {/* {mode !== 'addModel' && mode !== 'copy' && (
            <BookmarkSimulator onUpdate={updateReportConfigsBookmark} bookmarkdetail={bookmarkdetail} />
          )} */}
          <button type="button" aria-label="Close modal (Define your model)" className="btn-icon atp-modal-close close" onClick={closeDlg}>
            <i aria-hidden="true" className="material-icons">close</i>
          </button>
        </div>
        {alertMsg.visible && (
          <div className="atp-modal-fixed-message">
            <div id="Label-Dtm-Model-Alert" role="alert" className="animated fadeInUp atp-notif-item atp-notif-warning" dangerouslySetInnerHTML={{ __html: alertMsg.text }} />
          </div>
        )}
        <div className={alertMsg.visible ? 'atp-modal-body atp-modal-body-fixed-message' : 'atp-modal-body'}>
          {complexError.visible && (
            <div id="Alert-Dtm-Model-Error" role="alert" className="animated fadeInUp atp-notif-item atp-notif-item-error notif-icon m-b-20" aria-label={complexError.text}>
              <img src="/images/error-icon.svg" className="animated fadeInUp img-icon" alt="Error" />
              <div className="notif-text">
                <p className="m-0">{complexError.text}</p>
              </div>
            </div>
          )}
          {simpleError.visible && (
            <div id="Label-Dtm-Model-Error" role="alert" className="animated fadeInUp atp-notif-item atp-notif-item-error" dangerouslySetInnerHTML={{ __html: simpleError.text }} />
          )}
          <div>
            <label id="Label-Dtm-ModelCreation-Name" className="atp-modal-lbl" htmlFor="Input-Dtm-ModelCreation-Name">
              <span>{SimulatorName} </span>
              <span aria-label="(Required field)" className="field-req">*</span>
            </label>
            <input
              id="Input-Dtm-ModelCreation-Name"
              name="name"
              value={bookmark.bookmarkSelected ? bookmark.bookmark_name : model.name}
              className="atp-createforecast-txt"
              type="text"
              placeholder={mode === 'copy' ? 'Give your simulation a unique name' : 'Give a unique name'}
              aria-required="true"
              disabled={isAddMoreModel}
              onChange={e => {
                if (bookmark.bookmarkSelected) setBookmark(b => ({ ...b, bookmark_name: e.target.value }));
                else setModel(m => ({ ...m, name: e.target.value }));
                resetError();
              }}
              maxLength={255}
            />
            {/* Replace with your CustomText component */}
            <textarea
              id="Texarea-Dtm-ModelCreation-descrip"
              name="desc"
              value={model.desc}
              className="atp-createforecast-txt"
              maxLength={500}
              placeholder={mode === 'copy'
                ? 'Add a brief description of your simulation (up to 500 alphanumeric characters)'
                : !isAddMoreModel
                  ? 'Add a brief description (up to 500 alphanumeric characters)'
                  : ''}
              onChange={handleInputChange}
              onKeyUp={resetError}
              disabled={isAddMoreModel}
            />
          </div>
          {/* Add hierarchy, contract, chargeability, model type, lock quarter, etc. as needed */}
          {/* ... */}
          {features.jul22ModelToScenario && (
            <div className="atp-modal-row">
              <div className="atp-modal-col">
                <div className="atp-modal-wrp">
                  <div id="Label-modal-lock-quarter" className="atp-modal-lbl">
                    <span>Do you want to lock any Quarter forecast?</span>
                    <i role="tooltip" title="Selecting a quarter freezes the live forecast from DTM until that quarter." className="atp-modal-info material-icons">info</i>
                  </div>
                  <button
                    id={`Btn-Dtm-Modal-LockQuarter-Selected-${lockconfig.selected.replace(/\s/g, '')}`}
                    aria-expanded={lockconfig.showtree ? 'true' : 'false'}
                    type="button"
                    className="atp-modal-fakedd-lock-quarter"
                    onClick={toggleQuarters}
                    disabled={isAddMoreModel}
                  >
                    {lockconfig.selected}
                    <i aria-hidden="true" className="material-icons">keyboard_arrow_down</i>
                  </button>
                  <div>
                    {lockconfig.showtree && (
                      <div className="atpn-hchy-lock-quarter animated fadeIn">
                        {lockQuarter.map((item, idx) => (
                          <a
                            key={idx}
                            id={`Btn-Dtm-Modal-LockQuarter-${item.replace(/\s/g, '')}`}
                            role="button"
                            className="lock-quarter-dd"
                            aria-disabled={lockconfig.showtree ? 'false' : 'true'}
                            tabIndex={0}
                            onClick={() => updateSelectedQuarter(item)}
                            onKeyUp={e => e.key === 'Enter' && updateSelectedQuarter(item)}
                          >
                            {item}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="atp-modal-btns">
          <button id="Btn-Dtm-ModelCreation-Cancel" type="button" className="atp-btn atp-btn-cancel" aria-label="Cancel model" onClick={closeDlg}>
            Cancel
          </button>
          <button
            id="Btn-Dtm-ModelCreation-Create"
            type="button"
            className={`atp-btn ${!isloading && !submissionDisabled ? 'atp-btn-ok' : 'atp-btn-disabled'}`}
            aria-label="Create model"
            aria-disabled={isloading || submissionDisabled}
            disabled={isloading || submissionDisabled}
            onClick={targetMethod}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateModel;