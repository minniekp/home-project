import React, { useState, useMemo, useEffect, useCallback } from 'react';
import CheckboxTree from './CheckboxTree'; // React version of checkbox_tree.vue
import './hierarchy.scss';
import { useSelector } from 'react-redux'; // If using Redux for useraccess
import { useMemo } from 'react';

function removeSpaces(str) {
  return (str || '').replace(/\s+/g, '');
}

function CheckboxHierarchy({
  config,
  contract,
  rootId,
  treeRoot,
  selectedid,
  selectedvalue,
  disabled,
  allowRoot,
  checked,
  disablechildren,
  disabledkeys,
  isActive,
  getData,
  selectParent,
  clear,
  changeSelected,
})  {
const useraccess = useSelector(state => state.root.useraccess);
const [treeRoot, setTreeRoot] = useState({
    expand: false,
    nodes: [],
    loading: false
  });
  const [selectedid, setSelectedId] = useState(0);
  const [selectedvalue, setSelectedValue] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [selectedValues, setSelectedValues] = useState([]);
  const [disablechildren, setDisableChildren] = useState(false);
  const [disabledkeys, setDisabledKeys] = useState([]);
  const [checked, setChecked] = useState("");

  // Computed: allowRoot
  const allowRoot = useMemo(() => {
    let type;
    if (config.type === "people") type = "ph";
    else if (config.type === "location") type = "geo";

    if (type) {
      for (let i = 0; i < useraccess.length; i++) {
        const intersection = useraccess[i];
        if (intersection.ph?.toString() === '') {
          return true;
        }
      }
      return false;
    } else {
      return true;
    }
  }, [config, useraccess]);

  // Computed: isActive
  const isActive = useMemo(() => {
    if (config.dependencynode && !config.dependencynode.key) return false;
    return true;
  }, [config]);

  // Computed: disabledClass
  const disabledClass = useMemo(() => (!isActive ? 'atp-splan-disabled' : ''), [isActive]);

  // Mount: subscribe to reset event (replace with your event bus logic if needed)
  useEffect(() => {
    // Example: eventBus.on(`${config.hierarchyid}_reset`, reset);
    // return () => eventBus.off(`${config.hierarchyid}_reset`, reset);
  }, [config.hierarchyid]);

  // ...methods and handlers would go here...

  return (
    <div className="atp-hchy atp-splan">
      <div className="atp-hchy-cont">
        <i
          id={`Expand-Dtm-${rootId}-Level1-${removeSpaces(selectedvalue || config.defaultTxt)}`}
          role="button"
          tabIndex={0}
          className={`material-icons ${treeRoot.expand ? 'expanded' : 'collapsed'}`}
          onClick={() => getData()}
          onKeyUp={e => { if (e.key === 'Enter') getData(); }}
        >
          {treeRoot.expand ? 'arrow_drop_down' : 'arrow_right'}
        </i>
        <label className="cursor-pointer">
          {!config.disableselectonparent && (
            <input
              id={`Input-Dtm-${rootId}-Level1-${removeSpaces(selectedvalue || config.defaultTxt)}`}
              disabled={disabled || !allowRoot}
              type="checkbox"
              value=""
              checked={checked}
              onChange={selectParent}
            />
          )}
          <span className="atp-hchy-selected">
            {(selectedid !== "" && selectedid !== 0) ? selectedvalue : config.defaultTxt}
          </span>
        </label>
        <span
          id={`Link-Dtm-${rootId}-ClearAll`}
          className="atp-hchy-reset"
          onClick={clear}
        >
          Clear all
        </span>
        {!isActive && <div className="atp-hchy-cont-overlay" />}
      </div>
      <div className="atp-hchy-tree-cont m-l-20">
        {treeRoot.loading && <div className="atp-hchy-loading">Loading...</div>}
        {treeRoot.expand && !treeRoot.loading && (
             <CheckboxTree
            level={2}
            rootId={rootId}
            disabledkeys={disabledkeys}
            disableme={disablechildren}
            hierarchyid={config.hierarchyid}
            selectedid={selectedid}
            nodes={treeRoot.nodes}
            onExpand={getData}
            onSelect={changeSelected}
          />
        )}
      </div>
    </div>
  );
}

export default CheckboxHierarchy;