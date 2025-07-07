import React, { useState, useRef, useMemo } from 'react';
// import Selected from "../hierarchy/selected"; // Implement or import as needed
// import CustomText from "../textarea/textarea"; // Implement or import as needed
// import utility from '../../utility/utility';
// import constList from '../../store/constants';
// import axios from 'axios';
// import CryptoJS from 'crypto-js';
// import page from 'page';
import './modal.scss';

const features =
  typeof window !== "undefined" && (window as any).applicationConfig?.features
    ? (window as any).applicationConfig.features
    : {};

interface OculusItem {
  oculus_id: number;
  oculus_name: string;
  [key: string]: any;
}

interface Rollup {
  name: string;
  desc: string;
  selectedOculus: any[];
  selectedShared: any[];
}

interface CreateRollupProps {
  rollup: Rollup;
  isAddMoreOculus?: boolean;
  previousSelectedOculus?: number[];
  onClose: () => void;
}

const CreateRollup: React.FC<CreateRollupProps> = ({
  rollup: initialRollup,
  isAddMoreOculus = false,
  previousSelectedOculus = [],
  onClose,
}) => {
  // Replace with your store/context logic
  const store = (window as any).$store;

  // State
  const [rollup, setRollup] = useState<Rollup>({ ...initialRollup });
  const [oculusConfig, setOculusConfig] = useState({
    show: false,
    selectedItems: [] as { title: string; id: number }[],
    selected: [] as string[],
  });
  const [sharedConfig, setSharedConfig] = useState({
    show: false,
    selectedItems: [] as { title: string; id: number }[],
    selected: [] as string[],
  });
  const [isloading, setIsloading] = useState(false);
  const [simpleError, setSimpleError] = useState({ text: '', visible: false });
  const [complexError, setComplexError] = useState({ text: '', visible: false });
  const [alertMsg] = useState('Select at least one simulation to Roll-up');
  const modalBodyRef = useRef<HTMLDivElement>(null);

  // Computed
  const getAllActiveOculus = useMemo(() => {
    const active = store?.state?.modeling?.active || [];
    return active.filter((curr: OculusItem) => !previousSelectedOculus.includes(curr.oculus_id));
  }, [store, previousSelectedOculus]);

  const getAllSharedOculus = useMemo(() => {
    const shared = (store?.state?.modeling?.shared || []).filter((item: any) => !item.is_archived);
    return shared.filter((curr: OculusItem) => !previousSelectedOculus.includes(curr.oculus_id));
  }, [store, previousSelectedOculus]);

  const isOculusSelected = useMemo(
    () => oculusConfig.selectedItems.length > 0 || sharedConfig.selectedItems.length > 0,
    [oculusConfig.selectedItems, sharedConfig.selectedItems]
  );

  const submissionDisabled = useMemo(
    () => !isOculusSelected || (isAddMoreOculus ? false : !rollup.name),
    [isOculusSelected, isAddMoreOculus, rollup.name]
  );

  const buttonText = useMemo(() => {
    if (isAddMoreOculus) {
      return isloading ? 'Adding...' : 'Add';
    } else {
      return isloading ? 'Creating...' : 'Create';
    }
  }, [isAddMoreOculus, isloading]);

  const titleText = 'Define your Roll-Up';

  // Handlers
  function toggleActiveOculus() {
    setOculusConfig(cfg => ({ ...cfg, show: !cfg.show }));
  }
  function toggleSharedOculus() {
    setSharedConfig(cfg => ({ ...cfg, show: !cfg.show }));
  }
  function changeSelectedActiveOculus(name: string, checked: boolean) {
    let selected = [...oculusConfig.selected];
    if (checked) selected.push(name);
    else selected = selected.filter(n => n !== name);

    const selectedItems = selected
      .map(n => getAllActiveOculus.find((el: OculusItem) => el.oculus_name === n))
      .filter(Boolean)
      .map((oc: OculusItem) => ({ title: oc.oculus_name, id: oc.oculus_id }));

    setOculusConfig(cfg => ({ ...cfg, selected, selectedItems }));
  }
  function changeSharedOculus(name: string, checked: boolean) {
    let selected = [...sharedConfig.selected];
    if (checked) selected.push(name);
    else selected = selected.filter(n => n !== name);

    const selectedItems = selected
      .map(n => getAllSharedOculus.find((el: OculusItem) => el.oculus_name === n))
      .filter(Boolean)
      .map((oc: OculusItem) => ({ title: oc.oculus_name, id: oc.oculus_id }));

    setSharedConfig(cfg => ({ ...cfg, selected, selectedItems }));
  }
  function clearAllActive() {
    setOculusConfig(cfg => ({ ...cfg, selected: [], selectedItems: [] }));
    resetError();
  }
  function clearAllShared() {
    setSharedConfig(cfg => ({ ...cfg, selected: [], selectedItems: [] }));
    resetError();
  }
  function resetError() {
    setSimpleError({ text: '', visible: false });
    setComplexError({ text: '', visible: false });
  }
  function clearConfigObj() {
    clearAllActive();
    clearAllShared();
    setOculusConfig(cfg => ({ ...cfg, show: false }));
    setSharedConfig(cfg => ({ ...cfg, show: false }));
  }
  function closeDlg() {
    if (isloading) return;
    resetError();
    clearConfigObj();
    onClose();
  }
  function showErrorMessage(errMsg: any) {
    resetError();
    setIsloading(false);
    if (!errMsg) {
      setSimpleError({ text: 'Roll-Up generation failed.', visible: true });
    } else if (errMsg?.response?.data?.errmsg) {
      setSimpleError({ text: errMsg.response.data.errmsg, visible: true });
    } else {
      setComplexError({ text: errMsg, visible: true });
    }
    modalBodyRef.current?.scrollTo(0, 0);
  }
  function checkRollupChar(rollupName: string) {
    const re = /^[@|\-|+|=]/;
    return re.test(rollupName);
  }
  function isNameExisting() {
    const active = store?.state?.modeling?.rollup?.active || [];
    return active.map((item: any) => item.rollup_name.trim().toLowerCase()).includes(rollup.name.trim().toLowerCase());
  }
  function isNameExistingArchive() {
    const archive = store?.state?.modeling?.rollup?.archive || [];
    return archive.map((item: any) => item.rollup_name.trim().toLowerCase()).includes(rollup.name.trim().toLowerCase());
  }
  function hasErrors() {
    // utility.getErrormessage("4000"), etc. should be replaced with your error messages
    if (!isAddMoreOculus && rollup.name.trim().length < 3) {
      showErrorMessage("Roll-Up name must be at least 3 characters.");
      return true;
    }
    if (!isAddMoreOculus && checkRollupChar(rollup.name)) {
      showErrorMessage("Roll-Up name cannot start with @, -, +, =.");
      return true;
    }
    if (!isAddMoreOculus && (isNameExisting() || isNameExistingArchive())) {
      showErrorMessage("Roll-Up name already exists.");
      return true;
    }
    return false;
  }
  function createRollup() {
    setIsloading(true);
    if (hasErrors()) {
      setIsloading(false);
      return;
    } else {
      resetError();
    }
    // utility.pushCustomEventDD(...)
    const oculusIds = [...oculusConfig.selectedItems, ...sharedConfig.selectedItems].map(item => item.id);
    let rollupId = null;
    if (isAddMoreOculus) {
      const pathArray = window.location.pathname.split("/");
      rollupId = parseInt(pathArray[pathArray.indexOf('rollup') + 1]);
    }
    let postData: any = {
      rollup_name: rollup.name,
      rollup_desc: rollup.desc,
      selectedOculus: oculusIds,
      rollup_id: rollupId
    };
    if (features.ASAHttpParameterFix) {
      // Encrypt postData as needed
      // const originalDataEncr = CryptoJS.AES.encrypt(JSON.stringify(postData), encryptConfig).toString();
      // postData = { reqBody: originalDataEncr };
    }
    validateRollup(postData, rollupId);
  }
  function validateRollup(postData: any, rollupId: number | null) {
    if (features.ASAHtmlinjectionfix) {
      // postData.rollup_name = utility.sanitizeHtmlData(postData.rollup_name);
      // postData.rollup_desc = utility.sanitizeHtmlData(postData.rollup_desc);
    }
    // axios.post('/api/rollup/validation', postData).then(result => {
    //   if (result.data === 'ok') {
    //     axios.post('/api/rollup', postData).then(res => {
    //       if (isAddMoreOculus) {
    //         store.dispatch(actions.INITIALIZE_ROLLUP, { rollupId, isArchive: false }).then(() => {
    //           store.dispatch(actions.GET_OCULUS_LIST, { id: rollupId, isArchive: false }).then(() => {
    //             setIsloading(false);
    //             page('/rollup/' + res.data.rollup_id);
    //             closeDlg();
    //           });
    //         });
    //       } else {
    //         page('/rollup/' + res.data.rollup_id);
    //         setIsloading(false);
    //         closeDlg();
    //       }
    //     }).catch(err => handleError(err));
    //   }
    // }).catch(err => handleError(err));
  }

  return (
    <div className="animated fadeIn atp-modal">
      <div
        id="Oculus-Dtm-Rollup-Name"
        className={
          isAddMoreOculus
            ? 'atp-modal-cont atp-modal-forecast atp-rollup-model-height'
            : 'atp-modal-cont atp-modal-forecast'
        }
      >
        <div className="atp-modal-head">
          <h2 id="Title-Dtm-Rollup-Name" className="modal-title">{titleText}</h2>
          <button
            type="button"
            aria-label="Close modal (Define your rollup)"
            className="btn-icon atp-modal-close close"
            onClick={closeDlg}
          >
            <i aria-hidden="true" className="material-icons">close</i>
          </button>
        </div>
        {!isOculusSelected && (
          <div className="atp-modal-fixed-message">
            <div
              id="Label-Modal-Rollup-Alert"
              role="alert"
              className="animated fadeInUp atp-notif-item atp-notif-warning"
              aria-label={alertMsg}
              dangerouslySetInnerHTML={{ __html: alertMsg }}
            />
          </div>
        )}
        <div
          ref={modalBodyRef}
          className={!isOculusSelected ? 'atp-modal-body atp-rollup-body-fixed-message' : 'atp-modal-body'}
        >
          {complexError.visible && (
            <div
              id="Alert-Dtm-Rollup-Error"
              role="alert"
              className="animated fadeInUp atp-notif-item atp-notif-item-error notif-icon m-b-20"
              aria-label={complexError.text}
            >
              <img src="/images/error-icon.svg" className="animated fadeInUp img-icon" alt="Error" />
              <div className="notif-text">
                <p className="m-0">{complexError.text}</p>
              </div>
            </div>
          )}
          {simpleError.visible && (
            <div
              id="Label-Dtm-Rollup-Error"
              role="alert"
              className="animated fadeInUp atp-notif-item atp-notif-item-error"
              dangerouslySetInnerHTML={{ __html: simpleError.text }}
            />
          )}
          {/* Name & Description */}
          {!isAddMoreOculus && (
            <>
              <label id="Label-Dtm-Rollup-Name" className="atp-modal-lbl" htmlFor="Input-Dtm-Rollup-Name">
                <span>Roll-Up Name </span>
                <span aria-label="(Required field)" className="field-req">*</span>
              </label>
              <input
                id="Input-Dtm-Rollup-Name"
                name="name"
                value={rollup.name}
                className="atp-createforecast-txt"
                type="text"
                placeholder="Give your rollup a unique name"
                aria-required="true"
                onChange={e => setRollup(r => ({ ...r, name: e.target.value }))}
              />
              {/* Replace with your CustomText component */}
              <textarea
                id="Texarea-Dtm-Rollup-desc"
                name="desc"
                value={rollup.desc}
                className="atp-createforecast-txt"
                maxLength={500}
                placeholder="Add a brief description of your rollup (up to 500 alphanumeric characters)"
                onChange={e => setRollup(r => ({ ...r, desc: e.target.value }))}
              />
            </>
          )}
          {/* Select Oculus */}
          <div>
            <div className="atp-modal-row">
              <div className="atp-modal-col">
                <div className="atp-modal-wrp">
                  <div id="Label-Modal-Rollup-ActiveOculus" className="atp-modal-lbl">
                    Active Simulations
                  </div>
                  <button
                    id="Btn-Modal-Rollup-ActiveOculus"
                    aria-expanded={oculusConfig.show ? 'true' : 'false'}
                    aria-controls="Collapse-Modal-Rollup-ActiveOculus"
                    type="button"
                    className="atp-modal-fakedd"
                    onClick={toggleActiveOculus}
                  >
                    Select<i aria-hidden="true" className="material-icons">keyboard_arrow_down</i>
                  </button>
                  {oculusConfig.show && (
                    <div
                      id="Collapse-Modal-Active-Oculus"
                      className="atpn-hchy animated fadeIn"
                      role="region"
                      aria-labelledby="Btn-Modal-Rollup-ActiveOculus"
                    >
                      <div className="atp-export-sall float-right">
                        <a
                          role="button"
                          tabIndex={0}
                          onClick={clearAllActive}
                          onKeyUp={e => e.key === 'Enter' && clearAllActive()}
                        >
                          Clear all<span className="sr-only">Active Simulations</span>
                        </a>
                      </div>
                      {getAllActiveOculus.map((oculus: OculusItem, index: number) => (
                        <fieldset id={`Modal-ActiveOculusData-${index}`} key={index}>
                          <legend className="sr-only">Active Simulations</legend>
                          <label htmlFor={`Input-Modal-Rollup-ActiveOculusSelectionParam-${oculus.oculus_name.replace(/\s/g, '')}`}>
                            <input
                              id={`Input-Modal-Rollup-ActiveOculusSelectionParam-${oculus.oculus_name.replace(/\s/g, '')}`}
                              type="checkbox"
                              name="oculus"
                              value={oculus.oculus_name}
                              checked={oculusConfig.selected.includes(oculus.oculus_name)}
                              className={oculusConfig.selected.includes(oculus.oculus_name) ? 'selected' : ''}
                              onChange={e => changeSelectedActiveOculus(oculus.oculus_name, e.target.checked)}
                            />{' '}
                            {oculus.oculus_name}
                          </label>
                        </fieldset>
                      ))}
                    </div>
                  )}
                  {/* <Selected selected={oculusConfig.selectedItems} selectedDescription="oculus" /> */}
                </div>
              </div>
            </div>
            <div className="atp-modal-row">
              <div className="atp-modal-col">
                <div className="atp-modal-wrp">
                  <div id="Label-Dtm-Rollup-SharedOclus" className="atp-modal-lbl">
                    Shared Simulations (Active)
                  </div>
                  <button
                    id="Btn-Dtm-Rollup-SharedOclus"
                    type="button"
                    aria-expanded={sharedConfig.show ? 'true' : 'false'}
                    aria-controls="Collapse-Dtm-Rollup-SharedOclus"
                    className="atp-modal-fakedd"
                    onClick={toggleSharedOculus}
                  >
                    <span className="sr-only">
                      Shared Simulations (Field required and multiple selections permitted),{' '}
                    </span>
                    Select
                    <i aria-hidden="true" className="material-icons">keyboard_arrow_down</i>
                  </button>
                  {sharedConfig.show && (
                    <div
                      id="Collapse-Modal-Shared-Oculus"
                      className="atpn-hchy animated fadeIn"
                      role="region"
                      aria-labelledby="Btn-Dtm-Modal-Rollup-Shared"
                    >
                      <div className="atp-export-sall float-right">
                        <a
                          role="button"
                          tabIndex={0}
                          onClick={clearAllShared}
                          onKeyUp={e => e.key === 'Enter' && clearAllShared()}
                        >
                          Clear all<span className="sr-only">Shared Simulations</span>
                        </a>
                      </div>
                      {getAllSharedOculus.map((oculus: OculusItem, index: number) => (
                        <fieldset id={`Modal-SharedOculusData-${index}`} key={index}>
                          <legend className="sr-only">Shared Simulations</legend>
                          <label htmlFor={`Input-Modal-Rollup-SharedOculusSelectionParam-${oculus.oculus_name.replace(/\s/g, '')}`}>
                            <input
                              id={`Input-Modal-Rollup-SharedOculusSelectionParam-${oculus.oculus_name.replace(/\s/g, '')}`}
                              type="checkbox"
                              name="oculus"
                              value={oculus.oculus_name}
                              checked={sharedConfig.selected.includes(oculus.oculus_name)}
                              className={sharedConfig.selected.includes(oculus.oculus_name) ? 'selected' : ''}
                              onChange={e => changeSharedOculus(oculus.oculus_name, e.target.checked)}
                            />{' '}
                            {oculus.oculus_name}
                          </label>
                        </fieldset>
                      ))}
                    </div>
                  )}
                  {/* <Selected selected={sharedConfig.selectedItems} selectedDescription="oculus" /> */}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="atp-modal-btns">
          <button
            id="Btn-Dtm-RollupCreation-Cancel"
            type="button"
            className="atp-btn atp-btn-cancel"
            aria-label="Cancel model"
            onClick={closeDlg}
          >
            Cancel
          </button>
          <button
            id="Btn-Dtm-RollupCreation-Create"
            type="button"
            className={`atp-btn ${!isloading && !submissionDisabled ? 'atp-btn-ok' : 'atp-btn-disabled'}`}
            aria-label="Create rollup"
            aria-disabled={isloading || submissionDisabled}
            disabled={isloading || submissionDisabled}
            onClick={createRollup}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRollup;