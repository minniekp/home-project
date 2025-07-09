import React, { useState, useEffect } from 'react';

// Helper to remove spaces from a string
const removeSpaces = str => (str ? String(str).replace(/\s/g, '') : '');

const HierarchyTree = ({
  config = {},
  level = 1,
  rootId = '',
  disableAll = false,
  disabledLevels = [],
  outlookExport = false,
  showDelimited = false,
  page = 'ph',
  serviceFeature = true,
  onGetData,
  onSelectNode,
}) => {
  const features = window.applicationConfig?.features || {};
  const sgFeature = features.aug22ServiceGroupFlag;

  const [checked, setChecked] = useState(false);
  const [selected, setSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [disablechildren, setDisableChildren] = useState(false);
  const [selectedchildren, setSelectedChildren] = useState([]);
  const [enableparent, setEnableParent] = useState(false);

  const node = config.node || {};
  const hasselectedchild = selectedchildren.length > 0;
  const disableLevel = disabledLevels.includes(level);

  // Helper to generate IDs
  const generateId = (prefix, node) =>
    `${prefix}-${rootId}Param-Level${level}-${removeSpaces(node.value)}`;

  // Get config for child nodes
  const getConfig = node => ({
    disable: outlookExport ? false : config.disable || disablechildren,
    node: node,
    parentkey: (config.node || {}).key,
    singleselect: config.singleselect,
    path: (config.path && config.path.length > 0 ? config.path + ' > ' + (config.node ? config.node.value : '') : (config.node ? config.node.value : '')),
    selectalllevel: config.selectalllevel,
    type: config.type,
    geo: config.geo,
  });

  // Handle expand/collapse and fetch children if needed
  const handleExpand = node => {
    if (expanded) {
      setExpanded(false);
    } else {
      setExpanded(true);
      if (!node.nodes || node.nodes.length <= 0) {
        setLoading(true);
        if (onGetData) onGetData(node);
      }
    }
  };

  // Remove node from selectedchildren
  const removeFromSelectedChildren = node => {
    setSelectedChildren(selectedchildren.filter(child => child.key !== node.key));
  };

  // Emit select node event
  const emitSelect = (node, checked, fromselectall = false, frombookmark = false) => {
    if (checked) {
      if (!selectedchildren.find(o => o.key === node.key)) {
        setSelectedChildren([...selectedchildren, node]);
      }
    } else {
      if (bookmarkselected() || lhRetained()) setEnableParent(true);
      removeFromSelectedChildren(node);
    }
    if (onSelectNode) onSelectNode(node, checked, fromselectall, frombookmark);
  };

  // Select current node
  const selectNode = (fromselectall = false) => {
    if (!bookmarkselected() && node.selectable < 1 && !config.geo) return;
    if (node.selectable === 2) {
      if (!selected) {
        setDisableChildren(true);
        setEnableParent(false);
        node.path = config.path;
        emitSelect(node, true, fromselectall);
        setSelected(true);
      } else {
        setDisableChildren(false);
        emitSelect(node, false, fromselectall);
        setSelected(false);
      }
    } else {
      if (!checked) {
        setDisableChildren(true);
        setEnableParent(false);
        node.path = config.path;
        emitSelect(node, true, fromselectall);
        setChecked(true);
      } else {
        setDisableChildren(false);
        emitSelect(node, false, fromselectall);
        setChecked(false);
      }
    }
  };

  // Simulate Vuex store bookmark state
  const bookmarkselected = () => {
    // Replace with your actual bookmark state logic
    return window.bookmark?.current?.bookmark_id !== 0;
  };

  const lhRetained = () => {
    return config.geo !== undefined;
  };

  // Watch config changes for select all logic
  useEffect(() => {
    setLoading(false);
    if (config.selectalllevel > 0 && node.level !== undefined) {
      if (config.selectalllevel === node.level && !checked && node.selectable > 0) {
        selectNode(true);
        setChecked(true);
      } else if (config.selectalllevel !== node.level && checked) {
        selectNode(true);
        setChecked(false);
      }
      if (config.selectalllevel > node.level) {
        setExpanded(true);
      }
    }
    // eslint-disable-next-line
  }, [config]);

  // Render
  return (
    <div className="atpn-hchy-tree">
      {(config.type === 'service' && sgFeature && serviceFeature
        ? (page === 'ph' ? !node.delimited : showDelimited ? true : !node.delimited)
        : true) && (
        <div
          className={
            'atpn-hchy-tree-item' + (node.isend <= 0 ? '' : ' m-t-1 m-l-28')
          }
          data-key={node.key}
        >
          {node.isend <= 0 && (
            <button
              id={generateId('Expand', node)}
              aria-live="polite"
              type="button"
              aria-describedby={generateId('Collapse', node)}
              aria-expanded={expanded ? 'true' : 'false'}
              aria-controls={'Collapse-Dtm-' + rootId}
              className="btn-icon atp-list-expand atp-list-btn"
              onClick={() => handleExpand(node)}
            >
              <i className="material-icons" aria-hidden="true">
                {expanded ? 'arrow_drop_down' : 'arrow_right'}
              </i>
              <span id={generateId('Collapse', node)} className="sr-only">
                ({node.value} , browser hierarchy)
              </span>
            </button>
          )}
          {!config.singleselect ? (
            <label
              title={node.value}
              htmlFor={`Input-Dtm-${rootId}-Level${level}-${removeSpaces(node.key)}`}
              className={
                'custom-checkbox-hrcy' +
                (config.type === 'service' &&
                node.delimited &&
                showDelimited &&
                sgFeature &&
                serviceFeature
                  ? ' delimited-node'
                  : '')
              }
            >
              {node.selectable === 2 && (bookmarkselected() || lhRetained()) ? (
                <input
                  id={`Input-Dtm-${rootId}-Level${level}-${removeSpaces(node.key)}`}
                  type="checkbox"
                  checked={selected}
                  disabled={
                    disableAll ||
                    (!selected &&
                      (config.disable ||
                        hasselectedchild ||
                        node.selectable < 1)) ||
                    disableLevel
                  }
                  onChange={selectNode}
                />
              ) : (
                <input
                  id={`Input-Dtm-${rootId}-Level${level}-${removeSpaces(node.key)}`}
                  type="checkbox"
                  checked={checked}
                  disabled={
                    disableAll ||
                    (!checked &&
                      (config.disable ||
                        (hasselectedchild && !outlookExport) ||
                        (!enableparent && node.selectable < 1))) ||
                    disableLevel
                  }
                  onChange={selectNode}
                />
              )}
              {node.value}
              <span className="atp-checkbox-hrtree" />
            </label>
          ) : (
            <a
              id={generateId('Label', node)}
              role="button"
              className={
                'link-label' + (node.selectable < 1 ? ' atpn-hchy-tree-item-disabled' : '')
              }
              aria-disabled={node.selectable < 1 ? 'true' : 'false'}
              tabIndex={0}
              onClick={selectNode}
              onKeyUp={e => e.key === 'Enter' && selectNode()}
            >
              {node.value}
            </a>
          )}
          {node.is_target_parent && (
            <i
              title="One or more children of this node has a target."
              className="material-icons target-info"
            >
              info
            </i>
          )}
          {node.is_target_editable && (
            <span title="This node has a target." className="target-node" />
          )}
        </div>
      )}
      {expanded && (
        <div className="m-l-20">
          {loading ? (
            <div className="atpn-loading" role="alert">
              Loading...
            </div>
          ) : (
            <>
              <span className="sr-only" role="alert">
                Loading completed
              </span>
              {(node.nodes || []).map((childnode, index) => (
                <HierarchyTree
                  key={index}
                  config={getConfig(childnode)}
                  rootId={rootId}
                  disableAll={disableAll}
                  disabledLevels={disabledLevels}
                  page={page}
                  showDelimited={showDelimited}
                  serviceFeature={serviceFeature}
                  level={level + 1}
                  onGetData={onGetData}
                  onSelectNode={onSelectNode}
                  outlookExport={outlookExport}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HierarchyTree;