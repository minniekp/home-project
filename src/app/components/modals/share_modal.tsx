import React, { useState, useMemo, useRef } from 'react';
// import utility from '../../utility/utility';
// import constList from '../../store/constants';
// import constants from '../../utility/constants';
// import { useStore } from '../../store/useStore'; // Replace with your store/context
import './modal.scss';

const features =
  typeof window !== "undefined" && (window as any).applicationConfig?.features
    ? (window as any).applicationConfig.features
    : {};

interface User {
  enterpriseid: string;
  [key: string]: any;
}

interface ShareModalProps {
  initialUsers: User[];
  ou?: any[];
  gu?: any[];
  forecastid?: number;
  oculusId?: number;
  outlookId?: number;
  mode?: 'oculus' | 'outlook' | '';
  onClose: () => void;
}

const MAX_SELECTIONS = 5;

const ShareModal: React.FC<ShareModalProps> = ({
  initialUsers = [],
  ou = [],
  gu = [],
  forecastid = 0,
  oculusId = 0,
  outlookId = 0,
  mode = '',
  onClose,
}) => {
  // Replace with your store/context logic
  const store = (window as any).$store;

  const [searchText, setSearchText] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [hasError, setHasError] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [unauthorizedUsers, setUnauthorizedUsers] = useState<string[]>([]);
  const [isloading, setIsloading] = useState(false);
  const [localSharedSuccess, setLocalSharedSuccess] = useState(false);

  // Derived/computed
  const titleText = useMemo(() => {
    if (mode === 'oculus') return 'Share a Simulation';
    if (mode === 'outlook') return 'Share an Outlook';
    return 'Share a Scenario';
  }, [mode]);

  const buttonText = useMemo(() => (isloading ? 'Sharing...' : 'Share'), [isloading]);

  const remainingSelectionMessage = useMemo(() => {
    const remaining = MAX_SELECTIONS - selectedUsers.length;
    if (remaining <= 0) return 'Maximum shares reached';
    if (remaining === 1) return 'Share with up to 1 more person';
    return `Share with up to ${remaining} people`;
  }, [selectedUsers.length]);

  const noSelectionsAvailable = selectedUsers.length >= MAX_SELECTIONS;

  const users = initialUsers;

  const emailSharedMessage = 'The Simulator has been successfully shared';

  // Utility
  function removeSpaces(str: string) {
    return str.replace(/\s/g, '');
  }

  function isUserSelected(enterpriseid: string) {
    return selectedUsers.some(u => u.enterpriseid === enterpriseid);
  }

  // Handlers
  function selectUser(enterpriseid: string) {
    if (!users || users.length === 0) return;
    if (selectedUsers.length >= MAX_SELECTIONS) return;
    if (isUserSelected(enterpriseid)) return;
    const user = users.find(x => x.enterpriseid === enterpriseid);
    if (!user) return;
    setSelectedUsers(prev => [...prev, user]);
    setSearchText('');
    setFilteredUsers([]);
    if (mode === 'oculus') {
      validateShareUser(enterpriseid);
    }
  }

  function removeUser(enterpriseid: string) {
    setSelectedUsers(prev => prev.filter(x => x.enterpriseid !== enterpriseid));
    if (mode === 'oculus') {
      setUnauthorizedUsers(prev => prev.filter(id => id !== enterpriseid));
      showHideErrorMsg();
    }
  }

  function filterUsers(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSearchText(value);
    if (users.length === 0 || value.length < 2) {
      setFilteredUsers([]);
      return;
    }
    setFilteredUsers(
      users.filter(
        x => x.enterpriseid.toUpperCase().includes(value.toUpperCase())
      )
    );
  }

  function clearSelections() {
    setSearchText('');
    setSelectedUsers([]);
    setFilteredUsers([]);
    setHasError(false);
    setErrMsg('');
  }

  function cancel() {
    clearSelections();
    onClose();
  }

  function share() {
    // Replace with your store/context logic
    const shareUsers = selectedUsers.map(x => x.enterpriseid).join();
    const sharePayload = { ph: ou, geo: gu, forecastid, sharedwith: shareUsers };
    store.dispatch('POST_SHARE_USERS', sharePayload);
    clearSelections();
    onClose();
  }

  function shareOculus() {
    // utility.pushCustomEventDD('OculusShare','Modeling');
    const shareUsers = selectedUsers.map(x => x.enterpriseid).join();
    const sharePayload = { oculusId, sharedwith: shareUsers };
    store.dispatch('OCULUS_SHARE', sharePayload).then(() => {
      if (features.dec23emailNotification) {
        setLocalSharedSuccess(true);
        clearSelections();
        setTimeout(() => {
          onClose();
          setLocalSharedSuccess(false);
        }, 3000);
      } else {
        clearSelections();
        onClose();
      }
    });
  }

  function shareOutlook() {
    setIsloading(true);
    const shareUsers = selectedUsers.map(x => x.enterpriseid).join();
    const sharePayload = { outlookId, sharedwith: shareUsers };
    store.dispatch('OUTLOOK_SHARE', sharePayload).then(() => {
      // utility.pushCustomEventDD('Share Outlook', 'Outlook');
      clearSelections();
      setIsloading(false);
      onClose();
    });
  }

  function showHideErrorMsg() {
    const unauthorizedUserExist = selectedUsers.some(item =>
      unauthorizedUsers.includes(item.enterpriseid)
    );
    if (unauthorizedUserExist) {
      setHasError(true);
      setErrMsg('You do not have permission to share with one or more selected users.');
    } else {
      setHasError(false);
      setErrMsg('');
    }
  }

  function validateShareUser(enterpriseid: string) {
    const sharePayload = { enterpriseId: enterpriseid, oculusId };
    store.dispatch('VALIDATE_OCULUS_SHARE_USERS', sharePayload).then((res: any) => {
      if (res.data.hasaccess === 0) {
        setUnauthorizedUsers(prev => [...prev, enterpriseid]);
        setHasError(true);
        setErrMsg('You do not have permission to share with one or more selected users.');
      }
    });
  }

  // Keyboard handlers for list items
  function handleUserKey(e: React.KeyboardEvent, enterpriseid: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      selectUser(enterpriseid);
    }
  }

  return (
    <div className="animated fadeIn atp-modal">
      <div
        id={`Modal-Dtm-${mode === 'oculus' ? 'Oculus' : mode === 'outlook' ? 'Outlook' : 'Forecast'}-Share`}
        className="atp-modal-cont atp-modal-shared"
      >
        <div className="atp-modal-head">
          <h2
            id={`Title-Dtm-${mode === 'oculus' ? 'Oculus' : 'Forecast'}-Share`}
            className="modal-title"
          >
            {titleText}
          </h2>
          <button
            type="button"
            aria-label={`Close modal (${titleText})`}
            className="btn-icon atp-modal-close close"
            onClick={cancel}
          >
            <i aria-hidden="true" className="material-icons">
              close
            </i>
          </button>
        </div>
        <div className="atp-modal-body">
          {/* Error banner */}
          {hasError && errMsg && (
            <div className="animated fadeInUp atp-notif-item atp-notif-item-error">
              <p className="m-0">{errMsg}</p>
            </div>
          )}
          <label
            htmlFor={`Input-Dtm-Home-${mode === 'oculus' ? 'Oculus' : mode === 'outlook' ? 'Outlook' : 'Scenarios'}-Share-Search-Users`}
            className={`atp-modal-lbl${noSelectionsAvailable ? ' atp-modal-share-div-text-warn' : ''}`}
            aria-live="polite"
          >
            {remainingSelectionMessage}
          </label>
          <input
            id={`Input-Dtm-Home-${mode === 'oculus' ? 'Oculus' : mode === 'outlook' ? 'Outlook' : 'Scenarios'}-Share-Search-Users`}
            type="text"
            value={searchText}
            placeholder="Enter an Enterprise ID"
            autoComplete="off"
            aria-autocomplete="list"
            className={`form-control m-b-0${filteredUsers.length ? ' active' : ''}`}
            onChange={filterUsers}
          />
          {filteredUsers.length > 0 && (
            <ul
              id={`Div-Dtm-Home-${mode === 'oculus' ? 'Oculus' : mode === 'outlook' ? 'Outlook' : 'Scenarios'}-Share-Complete-User-List`}
              aria-expanded={filteredUsers.length ? 'true' : 'false'}
              role="listbox"
              className="atp-modal-share-div-complete-user-list"
            >
              {filteredUsers.map(user => (
                <li
                  id={`List-Dtm-Home-${mode === 'oculus' ? 'Oculus' : mode === 'outlook' ? 'Outlook' : 'Scenarios'}-Share-User-Detail${removeSpaces(user.enterpriseid)}`}
                  key={user.enterpriseid}
                  tabIndex={0}
                  role="option"
                  className="atp-modal-share-div-user-detail"
                  aria-selected={isUserSelected(user.enterpriseid) ? 'true' : 'false'}
                  onClick={() => selectUser(user.enterpriseid)}
                  onKeyUp={e => handleUserKey(e, user.enterpriseid)}
                >
                  <div className="bold">{user.enterpriseid}</div>
                </li>
              ))}
            </ul>
          )}
          <div className="atp-modal-share-div-selected-user-list">
            {selectedUsers.map(user => (
              <span
                id={`Label-Dtm-Home-${mode === 'oculus' ? 'Oculus' : mode === 'outlook' ? 'Outlook' : 'Scenarios'}-Share-Selected-User${removeSpaces(user.enterpriseid)}`}
                key={user.enterpriseid}
                className="animated flipInY atp-modal-share-span-selected-user"
              >
                <span className={`m-l-5${unauthorizedUsers.includes(user.enterpriseid) ? ' unauth-share-user' : ''}`}>
                  {user.enterpriseid}
                </span>
                <button
                  type="button"
                  className="atp-modal-share-btn-remove-user"
                  onClick={() => removeUser(user.enterpriseid)}
                >
                  <i aria-hidden="true" className="material-icons">
                    close
                  </i>
                  <span className="sr-only">Delete selection: {user.enterpriseid}</span>
                </button>
              </span>
            ))}
            <span aria-live="polite">
              {selectedUsers.map(user => (
                <span key={user.enterpriseid} className="sr-only">
                  Selected: {user.enterpriseid}
                </span>
              ))}
            </span>
          </div>
          <div className="atp1" aria-hidden={features.dec23emailNotification ? 'false' : 'true'} />
          {localSharedSuccess && features.dec23emailNotification && (
            <span className="atp-modal-lbl2">{emailSharedMessage}</span>
          )}
        </div>
        <div className="atp-modal-btns">
          <button
            id={`Btn-Dtm-Home-${mode === 'oculus' ? 'Oculus' : mode === 'outlook' ? 'Outlook' : 'Scenarios'}-Share-Cancel`}
            type="button"
            className="atp-btn atp-btn-cancel"
            onClick={cancel}
          >
            Cancel
          </button>
          {mode === 'oculus' && (
            <button
              id="Btn-Dtm-Home-Oculus-Share-Ok"
              type="button"
              disabled={selectedUsers.length === 0 || hasError}
              className={`atp-btn${selectedUsers.length > 0 && !hasError ? ' atp-btn-ok' : ' atp-btn-disabled'}`}
              aria-label="Share a Simulation"
              onClick={shareOculus}
            >
              Share
            </button>
          )}
          {mode !== 'oculus' && mode !== 'outlook' && (
            <button
              id="Btn-Dtm-Home-Scenarios-Share-Ok"
              type="button"
              disabled={selectedUsers.length === 0}
              className={`atp-btn${selectedUsers.length > 0 ? ' atp-btn-ok' : ' atp-btn-disabled'}`}
              aria-label="Share a Scenario"
              onClick={share}
            >
              Share
            </button>
          )}
          {mode === 'outlook' && (
            <button
              id="Btn-Dtm-Home-Scenarios-Share-Ok"
              type="button"
              disabled={selectedUsers.length === 0 && !isloading}
              className={`atp-btn${selectedUsers.length > 0 && !isloading ? ' atp-btn-ok' : ' atp-btn-disabled'}`}
              aria-label="Share a Scenario"
              onClick={shareOutlook}
            >
              {buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;