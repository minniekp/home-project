import React, { useState, useRef, useEffect, useMemo } from 'react';
import './modal.scss';
// import Hierarchy from '../hierarchy/hierarchy'; // Implement or import as needed
// import CustomText from '../textarea/textarea'; // Implement or import as needed
// import utility from '../../utility/utility';
// import constList from '../../store/constants';
// import CryptoJS from 'crypto-js';

const features =
  typeof window !== "undefined" && (window as any).applicationConfig?.features
    ? (window as any).applicationConfig.features
    : {};
interface Forecast {
  forecast_master_id: number;
  selectedPH: string;
  selectedGeo: string;
  ph: string[];
  geo: string[];
  contract: string;
  cascade_method: string;
  name: string;
  desc: string;
  archive_flag: string;
  chargeabilityScope?: number;
  cascade_method_model?: string;
  [key: string]: any;
}

interface CreateForecastProps {
  forecast: Forecast;
  allForecasts: Forecast[];
  modelForecast?: any;
  panelDetails?: any;
  mode?: string;
  callback?: () => void;
  onClose: (status?: string) => void;
  onCopyClose?: () => void;
  onForecastUpdated?: (forecast: Forecast) => void;
  onActiveCopy?: () => void;
  onArchiveCopy?: () => void;
}

const defaultPeopleHierarchyConfig = (selectedPH: string) => ({
  type: "people",
  rootleveltext: selectedPH === '' ? "Expand to browse Supervisory Org" : selectedPH,
  disabletoplevelselect: true,
  singleselect: true
});
const defaultLocationHierarchyConfig = (selectedGeo: string) => ({
  type: "location",
  rootleveltext: selectedGeo === '' ? "Expand to browse location" : selectedGeo,
  disabletoplevelselect: true,
  singleselect: true,
  independent: true,
  dependencynodes: []
});

const CreateForecast: React.FC<CreateForecastProps> = ({
  forecast: initialForecast,
  allForecasts,
  modelForecast,
  panelDetails = {},
  mode = 'create',
  callback,
  onClose,
  onCopyClose,
  onForecastUpdated,
  onActiveCopy,
  onArchiveCopy
}) => {
  const [forecast, setForecast] = useState<Forecast>({ ...initialForecast });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ text: string; visible: boolean }>({ text: '', visible: false });
  const [peopleHierarchyConfig, setPeopleHierarchyConfig] = useState(defaultPeopleHierarchyConfig(initialForecast.selectedPH));
  const [locationHierarchyConfig, setLocationHierarchyConfig] = useState(defaultLocationHierarchyConfig(initialForecast.selectedGeo));
  const [lastScenario, setLastScenario] = useState<string[]>([]);
  const nameRef = useRef<HTMLInputElement>(null);
  const modalBodyRef = useRef<HTMLDivElement>(null);

  // Derived/computed
  const isFormValid = useMemo(() => {
    if (mode === 'create' || (features.march22ScenarioInCO && mode === 'outlook')) {
      return (
        forecast.name?.trim() &&
        forecast.ph && forecast.ph.length > 0 &&
        forecast.geo && forecast.geo.length > 0
      );
    }
    return forecast.name?.trim();
  }, [forecast, mode]);

  const titleText = useMemo(() => {
    if (mode === 'submit') return 'Submit your intersection';
    if (mode === 'copy') return 'Copy scenario';
    if (mode === 'save') return 'Save your intersection as';
    if (mode === 'edit') return 'Edit your intersection';
    if (features.jul22ModelToScenario && mode === 'modeling') return 'Create Scenario from Model';
    return 'Define your intersection';
  }, [mode]);

  const buttonText = useMemo(() => {
    if (!isLoading) {
      if (mode === 'submit') return 'Submit';
      if (mode === 'copy') return 'Copy';
      if (mode === 'edit') return 'Update';
      if (mode === 'save') return 'Save-As';
      return 'Create';
    } else {
      if (mode === 'submit') return 'Submitting...';
      if (mode === 'copy') return 'Copying...';
      if (mode === 'edit') return 'Updating...';
      if (mode === 'save') return 'Saving As...';
      return 'Creating...';
    }
  }, [mode, isLoading]);

  const classMode = useMemo(() => {
    if (mode === 'edit') return 'atp-modal-forecast-edit';
    if (mode === 'copy') return 'atp-modal-forecast-copy';
    if (mode === 'save') return 'atp-modal-forecast-saveas';
    if (mode === 'submit') return 'atp-modal-forecast-submit';
    return '';
  }, [mode]);

  // Utility functions (implement or import as needed)
  function checkIfOnlyActualsAreAvailable() {
    // Replace with your store/context logic
    return false;
  }

  function resetError() {
    setError({ text: '', visible: false });
  }

  function hasErrors() {
    if (!forecast.name || forecast.name.trim().length < 3) {
      setError({ text: "Scenario name must be at least 3 characters.", visible: true });
      nameRef.current?.focus();
      return true;
    }
    // Add more error checks as needed
    return false;
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForecast({ ...forecast, [e.target.name]: e.target.value });
    resetError();
  }



  function closeDlg() {
    if (isLoading) return;
    resetError();
    setPeopleHierarchyConfig(defaultPeopleHierarchyConfig(''));
    setLocationHierarchyConfig(defaultLocationHierarchyConfig(''));
    onClose();
    if (onCopyClose) onCopyClose();
  }

  function validate() {
    if (!isFormValid || isLoading) return;
    if (hasErrors()) {
      modalBodyRef.current?.scrollTo(0, 0);
      return;
    }
    setIsLoading(true);
    // Call create/copy/update/submit/save logic here
    setTimeout(() => {
      setIsLoading(false);
      onClose('created');
    }, 1000);
  }

  // Mount logic for outlook mode
  useEffect(() => {
    if (features.march22ScenarioInCO && mode === 'outlook') {
      // Set ph/geo from panelDetails if needed
      setForecast((prev) => ({
        ...prev,
        ph: panelDetails.org_hierarchy_code ? [panelDetails.org_hierarchy_code] : [],
        geo: panelDetails.loc_hierarchy_code ? [panelDetails.loc_hierarchy_code] : []
      }));
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className="animated fadeIn atp-modal">
      <div id="Modal-Dtm-Forecast-Name" className={`atp-modal-cont atp-modal-forecast ${classMode}`}>
        <div className="atp-modal-head">
          <h2 id="Title-Dtm-Forecast-Name" className="modal-title">{titleText}</h2>
          <button
            type="button"
            aria-label="Close modal (Define your intersection)"
            className="btn-icon atp-modal-close close"
            onClick={closeDlg}
          >
            <i aria-hidden="true" className="material-icons">close</i>
          </button>
        </div>
        <div ref={modalBodyRef} className="atp-modal-body">
          {error.visible && (
            <div
              id="Warning-Dtm-DraftCreation-Name"
              role="alert"
              className="animated fadeInUp atp-notif-item atp-notif-item-error"
              aria-label={error.text}
            >
              {error.text}
            </div>
          )}
          <label className="atp-modal-lbl" htmlFor="Input-Dtm-DraftCreation-Name">
            Scenario Name <span aria-label="(Required field)" className="field-req">*</span>
          </label>
          <input
            id="Input-Dtm-DraftCreation-Name"
            ref={nameRef}
            name="name"
            value={forecast.name}
            className="atp-createforecast-txt"
            maxLength={200}
            type="text"
            placeholder="Give your scenario a unique name"
            aria-required="true"
            onChange={handleInputChange}
            onKeyUp={resetError}
          />
          {/* Replace with your CustomText component */}
          <textarea
            id="Texarea-Dtm-DraftCreation-descrip"
            name="desc"
            value={forecast.desc}
            className="atp-createforecast-txt"
            maxLength={500}
            placeholder="Add a brief description of your scenario (up to 500 alphanumeric characters)"
            onChange={handleInputChange}
            onKeyUp={resetError}
          />
          {/* Hierarchy and other fields go here, implement as needed */}
          {/* ... */}
        </div>
        <div className="atp-modal-btns">
          <button
            id="Btn-Dtm-DraftCreation-Cancel"
            type="button"
            className="atp-btn atp-btn-cancel"
            aria-label="Cancel intersection"
            onClick={closeDlg}
          >
            Cancel
          </button>
          <button
            id={`Btn-Dtm-DraftCreation-${buttonText}`}
            type="button"
            className={`atp-btn ${!isLoading && isFormValid ? 'atp-btn-ok' : 'atp-btn-disabled'}`}
            aria-disabled={isLoading || !isFormValid}
            aria-label={`${buttonText} intersection`}
            onClick={validate}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateForecast;