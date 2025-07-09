import React, { useState, useEffect, useCallback } from 'react';
// import './hierarchy.scss';
import TreeView from './hierarchytree'; // You need to implement or import this

const features = window.applicationConfig?.features || {};

const Hierarchy = ({
  config = {},
  rootId = '',
  datasource = '',
  unknownOptionIncluded = false,
  labelDescriptionExpandTrigger = '',
  unknownResetAll = true,
  disableSnapshot = false,
  showDelimited = false,
  page = 'ph',
  serviceFeature = true,
  enableLH = false,
  pageName = '',
  onSelect,
  onClear,
}) => {
  const [checked, setChecked] = useState(false);
  const [unknownChecked, setUnknownChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [disablechildren, setDisableChildren] = useState(false);
  const [selectedchildren, setSelectedChildren] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [selectedvalueforsingleselect, setSelectedValueForSingleSelect] = useState('');
  const [selectalllevel, setSelectAllLevel] = useState(-1);
  const [showSingleSelectRoot, setShowSingleSelectRoot] = useState(false);
  const [removechecked, setRemoveChecked] = useState(false);

  // --- Computed helpers ---
  const hasselectedchild = useCallback(() => {
    // Implement logic as in Vue computed
    // This is a placeholder; you may need to adapt based on your state/store
    return selectedchildren.length > 0 && selectedchildren[0].key !== 0;
  }, [selectedchildren]);

  const isactive = useCallback(() => {
    const dependency = config.dependencynodes;
    if (!dependency || (dependency && dependency.length > 0) || enableLH) return true;
    return false;
  }, [config, enableLH]);

  const disablerootnode = useCallback(() => {
    const geo = config.geo;
    if (!geo || (geo && (geo.length === 0 || geo[0].key === 0))) return false;
    return true;
  }, [config]);

  const disableselectonparent = useCallback(() => {
    // You may need to connect to your Redux/Context store for useraccess
    return false;
  }, []);

  const showTreeviewSingleRootCondition = !config.singleSelectRoot || (config.singleSelectRoot && showSingleSelectRoot);

  const singleSelectRootLabel = config.type === 'people'
    ? 'Accenture'
    : config.type === 'location'
    ? 'Global'
    : '';

  // --- Effects ---
  useEffect(() => {
    // Reset when config changes
    reset();
    // eslint-disable-next-line
  }, [config, config.dependencynodes]);

  useEffect(() => {
    if (!unknownResetAll) setUnknownChecked(false);
  }, [unknownResetAll]);

  useEffect(() => {
    if (config.hideRootLevel && config.type !== 'service') getInitialData();
    // eslint-disable-next-line
  }, []);

  // --- Methods ---
  function getConfig(node) {
    return {
      disable: disablechildren,
      node: node,
      parentkey: node.key,
      singleselect: config.singleselect,
      path: '',
      filterdata: config.filterdata,
      selectalllevel: selectalllevel,
      type: config.type,
      geo: config.geo,
    };
  }

  function getServiceApi(parentid) {
    // This is a simplified version; adapt as needed
    const api = config.api || '';
    const service = api + '/pickers';
    const contractpath = '/contract/' + config.contract;
    let serviceurl = '';
    const ds = datasource || '';
    const locationapi = (config.parenttype === 'costcenter' ? '/cc' : '/ph') + '/multi/geo';

    if (config.type === 'people') serviceurl = service + '/ph';
    else if (config.type === 'costcenter') serviceurl = service + contractpath + '/cc';
    else if (config.type === 'location') serviceurl = service + locationapi;
    else if (config.type === 'level') serviceurl = service + '/careerlevelgroup';
    else if (config.type === 'levelall') serviceurl = service + '/allcareerlevelgroupandcareerlevel';
    else if (config.type === 'service') serviceurl = service + '/servicegroupflags';
    if (parentid && config.type !== 'service') serviceurl = serviceurl + '/' + parentid;

    serviceurl = serviceurl + '?ds=' + ds;
    return serviceurl;
  }

  function getInitialData() {
    if (!isactive()) return;
    if (expanded) setExpanded(false);
    else {
      if (nodes.length <= 0) {
        getData();
        setLoading(true);
      }
      setExpanded(true);
    }
  }

  function reset() {
    setChecked(config.type === 'location' || config.type === 'service' ? checked : false);
    setLoading(false);
    setExpanded(false);
    setShowSingleSelectRoot(false);
    setDisableChildren(checked);
    setSelectedChildren([]);
    setNodes([]);
    setSelectedValueForSingleSelect('');
    setSelectAllLevel(-1);
    setRemoveChecked(false);
    if (config.hideRootLevel && config.type !== 'service') getInitialData();
  }

  function clearAll() {
    setChecked(false);
    reset();
    if (onClear) onClear(config);
  }

  function selectNode(node, checkedFlag = false) {
    if (config.singleselect) {
      setSelectedValueForSingleSelect(node.value);
      if (showSingleSelectRoot) setShowSingleSelectRoot(false);
      setExpanded(false);
      setSelectedChildren([node]);
    } else {
      if (checkedFlag) {
        if (!selectedchildren.find(o => o.key === node.key)) {
          setSelectedChildren([...selectedchildren, node]);
        }
        setRemoveChecked(false);
      } else {
        setSelectAllLevel(-1);
        setRemoveChecked(true);
        setSelectedChildren(selectedchildren.filter(o => o.key !== node.key));
      }
    }
    if (onSelect) onSelect(massageSelectedNodes());
  }

  function massageSelectedNodes() {
    return selectedchildren.map(node => ({
      values: node.patharray,
      title: node.value,
      key: node.key,
      path: node.path,
      ...(features.aug24simChargScope && { isChargeable: node.isChargeable !== undefined ? node.isChargeable : 1 }),
    }));
  }

  // --- Render ---
  return (
    <div className="atpn-hchy animated fadeIn">
      <div>
        {!config.singleselect ? (
          <>
            <div className="atp-export-sall float-right">
              {config.type === 'levelall' && (
                <>
                  <a
                    id={`Btn-Dtm-${rootId}-selectAllCLG`}
                    role="button"
                    tabIndex={0}
                    className="atpn-hchy-sel"
                    onClick={() => setSelectAllLevel(1)}
                  >
                    Select All MLG
                  </a>
                  <a
                    id={`Btn-Dtm-${rootId}-selectAllCL`}
                    role="button"
                    tabIndex={0}
                    className="atpn-hchy-sel"
                    onClick={() => setSelectAllLevel(2)}
                  >
                    Select All ML
                  </a>
                </>
              )}
              {!config.singleselect && (
                <a
                  id={`Btn-Dtm-${rootId}-ClearAll`}
                  role="button"
                  tabIndex={0}
                  className="atpn-hchy-reset"
                  onClick={clearAll}
                >
                  Clear all
                </a>
              )}
            </div>
            {!config.hideRootLevel && (
              <>
                <button
                  id={`Expand-Dtm-${rootId}-Level1-${config.rootleveltext?.replace(/\s/g, '')}`}
                  disabled={disableSnapshot}
                  aria-live="polite"
                  type="button"
                  aria-describedby={`Collapse-Dtm-Description-${rootId}-Level1-${config.rootleveltext?.replace(/\s/g, '')}`}
                  aria-expanded={expanded ? 'true' : 'false'}
                  aria-controls={`Collapse-Dtm-${rootId}`}
                  className="btn-icon atp-list-expand atp-list-btn"
                  onClick={getInitialData}
                >
                  <i className="material-icons" aria-hidden="true">
                    {expanded ? 'arrow_drop_down' : 'arrow_right'}
                  </i>
                  <span
                    id={`Collapse-Dtm-Description-${rootId}-Level1-${config.rootleveltext?.replace(/\s/g, '')}`}
                    className="sr-only"
                  >
                    ({config.rootleveltext}, browser hierarchy)
                  </span>
                </button>
                {!config.disabletoplevelselect ? (
                  <label
                    id={`Label-Dtm-${rootId}-Level1-${config.rootleveltext?.replace(/\s/g, '')}`}
                    htmlFor={`Input-Dtm-${rootId}-Level1-${config.rootleveltext?.replace(/\s/g, '')}`}
                    className="custom-checkbox-hrcy"
                    aria-label={config.rootleveltext}
                  >
                    <input
                      id={`Input-Dtm-${rootId}-Level1-${config.rootleveltext?.replace(/\s/g, '')}`}
                      type="checkbox"
                      checked={checked}
                      disabled={hasselectedchild() || disableselectonparent() || !isactive() || disablerootnode() || disableSnapshot}
                      onChange={() => selectNode({
                        key: 0,
                        path: '',
                        patharray: [],
                        value: config.rootleveltext,
                      }, !checked)}
                    />
                    {config.rootleveltext}
                    <span className="atp-checkbox-hrtree" />
                  </label>
                ) : (
                  <span className="label" aria-label={config.rootleveltext}>
                    {config.rootleveltext}
                  </span>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {config.singleSelectRoot ? (
              <>
                <button
                  id={`expand${config.type}TreeFilterShowHideModel`}
                  disabled={!isactive()}
                  aria-describedby={`describedbyExpand${config.type}TreeFilterShowHideModel`}
                  aria-expanded={expanded ? 'true' : 'false'}
                  aria-controls={`Collapse-Dtm-${rootId}`}
                  type="button"
                  className="atpn-hchy-ssdd"
                  onClick={() => setShowSingleSelectRoot(!showSingleSelectRoot)}
                >
                  <i aria-hidden="true" className="material-icons">keyboard_arrow_down</i>
                  <div>
                    <span className="sr-only">{labelDescriptionExpandTrigger}, (required)</span>
                    {selectedvalueforsingleselect !== ''
                      ? selectedvalueforsingleselect
                      : config.rootleveltext}
                    <span
                      id={`describedbyExpand${config.type}TreeFilterShowHideModel`}
                      aria-hidden="true"
                      className="sr-only"
                    >
                      {selectedvalueforsingleselect !== ''
                        ? `Selected value ${selectedvalueforsingleselect}`
                        : `Value not selected yet ${config.rootleveltext}`}
                    </span>
                  </div>
                </button>
                {showSingleSelectRoot && (
                  <div className="m-t-10">
                    <button
                      id={`Expand-${rootId}Param-Level1-${singleSelectRootLabel}`}
                      aria-live="polite"
                      type="button"
                      aria-describedby={`Collapse-Dtm-Description-${rootId}-Level1-${singleSelectRootLabel}`}
                      aria-expanded={expanded ? 'true' : 'false'}
                      aria-controls={`Collapse-Dtm-${rootId}`}
                      className="btn-icon atp-list-expand atp-list-btn"
                      onClick={getInitialData}
                    >
                      <i className="material-icons" aria-hidden="true">
                        {expanded ? 'arrow_drop_down' : 'arrow_right'}
                      </i>
                      <span
                        id={`Collapse-Dtm-Description-${rootId}-Level1-${singleSelectRootLabel}`}
                        className="sr-only"
                      >
                        ({singleSelectRootLabel}, browser hierarchy)
                      </span>
                    </button>
                    <a
                      id={`Label-${rootId}Param-Level1-${singleSelectRootLabel}`}
                      role="button"
                      className={`link-label${config.disableSelectRoot ? ' atpn-hchy-tree-item-disabled' : ''}`}
                      aria-disabled={config.disableSelectRoot ? 'true' : 'false'}
                      tabIndex={0}
                      onClick={() => selectNode({
                        isend: 0,
                        key: singleSelectRootLabel,
                        path: '',
                        patharray: [[]],
                        selectable: 1,
                        value: singleSelectRootLabel,
                      })}
                    >
                      {singleSelectRootLabel}
                    </a>
                  </div>
                )}
              </>
            ) : (
              <button
                id={`expand${config.type}TreeFilterShowHide`}
                disabled={!isactive()}
                aria-describedby={`describedbyExpand${config.type}TreeFilterShowHide`}
                aria-expanded={expanded ? 'true' : 'false'}
                aria-controls={`Collapse-Dtm-${rootId}`}
                type="button"
                className="atpn-hchy-ssdd"
                onClick={getInitialData}
              >
                <i aria-hidden="true" className="material-icons">keyboard_arrow_down</i>
                <div>
                  <span className="sr-only">{labelDescriptionExpandTrigger}, (required)</span>
                  {selectedvalueforsingleselect !== ''
                    ? selectedvalueforsingleselect
                    : config.rootleveltext}
                  <span
                    id={`describedbyExpand${config.type}TreeFilterShowHide`}
                    aria-hidden="true"
                    className="sr-only"
                  >
                    {selectedvalueforsingleselect !== ''
                      ? `Selected value ${selectedvalueforsingleselect}`
                      : `Value not selected yet ${config.rootleveltext}`}
                  </span>
                </div>
              </button>
            )}
          </>
        )}
      </div>
      {expanded && showTreeviewSingleRootCondition && (
        <div
          id={`Collapse-Dtm-${rootId}`}
          className={
            (!config.singleselect && !config.hideRootLevel) || showSingleSelectRoot
              ? 'm-l-20'
              : ''
          }
        >
          {loading ? (
            <div role="alert" className="atpn-loading">Loading...</div>
          ) : (
            nodes.map((node, index) => (
              // <TreeView ... /> // Implement or import your TreeView component here
              <div key={index}>{node.value}</div>
            ))
          )}
        </div>
      )}
      {unknownOptionIncluded && (
        <div className="m-t-5">
          <label
            htmlFor="Input-Dtm-DataExport-CostCenterSelection-Level0-Unknown"
            className="custom-checkbox-hrcy"
          >
            <input
              id="Input-Dtm-DataExport-CostCenterSelection-Level0-Unknown"
              disabled={disableSnapshot}
              type="checkbox"
              checked={unknownChecked}
              onChange={e => setUnknownChecked(e.target.checked)}
            />
            Unknown
            <span className="atp-checkbox-hrtree" />
          </label>
        </div>
      )}
    </div>
  );
};

export default Hierarchy;