import React, { useMemo, useEffect, useCallback } from 'react';
import './hierarchy.scss';

// If you use an event bus, import it here
// import eventBus from 'path/to/eventBus';

function CheckboxTree({
  nodes = [],
  hierarchyid = "",
  selectedid = null,
  parentkey = "",
  disableme = false,
  disabledkeys = [],
  rootId = "",
  level = 1,
  onExpand,
  onSelect
}) {
  // Computed: nonEmptyNodesValue
  const nonEmptyNodesValue = useMemo(
    () => nodes.filter(node => node.value !== ''),
    [nodes]
  );

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [, setRefresh] = useState(0);
  // Mount: subscribe to event bus for data updates
  useEffect(() => {
  refresh();
}, [hierarchyid, refreshTrigger]);

// React equivalents for the Vue methods, to be used inside your CheckboxTree component

// isdisabled: checks if a node should be disabled
const isdisabled = (node, disabledkeys, disableme) => {
  return (disabledkeys.includes(node.key) || disableme || !node.selectable);
};

// removeParentKeyFromDisabled: removes pk from node.disabledkeys and tracks it
const removeParentKeyFromDisabled = (node) => {
  for (let i = 0; i < node.disabledkeys.length; i++) {
    if (node.disabledkeys[i] === node.pk) {
      node.disabledkeys.splice(i, 1);
    }
  }
  if (!node.removefromdisabled) node.removefromdisabled = [];
  node.removefromdisabled.push(node.pk);
};

// itemClick: toggles expand/collapse and triggers expand event
const itemClick = (node, emitExpand) => {
  node.parentkeys = [];
  node.expand = !node.expand;
  if (node.expand) node.loading = true;
  emitExpand(node);
};

// selectItem: toggles selection and triggers select event
const selectItem = (node, parentkey, emitSelect) => {
  node.parentkey = parentkey;
  node.pk = parentkey;
  node.parentkeys = [];
  node.path = "";
  node.disabledkeys = [];

  if (!node.selected) {
    node.selected = true;
    node.disableparent = true;
  } else {
    node.selected = false;
    node.disableparent = false;
  }
  emitSelect(node);
};

// emitExpand: adds parentkey to parentkeys and calls onExpand prop
const emitExpand = (node, parentkey, onExpand) => {
  if (parentkey) {
    node.parentkeys.splice(0, 0, parentkey);
  }
  if (onExpand) onExpand(node);
};

// emitSelect: handles parentkeys, disables, and calls onSelect prop
const emitSelect = (node, parentkey, nodes, removeParentKeyFromDisabled, onSelect) => {
  if (parentkey) {
    node.parentkeys.splice(0, 0, parentkey);
  }
  if (!node.removefromdisabled) node.removefromdisabled = [];
  if (node.disableparent) {
    node.disabledkeys.push(node.pk);
  } else {
    removeParentKeyFromDisabled(node);
  }

  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].key === node.pk) {
      node.path = nodes[i].value + " > " + node.path;
    }
  }

  node.pk = parentkey;
  if (onSelect) onSelect(node);
};

// refresh: in React, you can force update by changing state, but usually not needed if state is managed properly
// If you need to force a re-render, use a dummy state:

const refresh = () => setRefresh(r => r + 1);


 return (
    <div className="atp-hchy-tree">
      {nonEmptyNodesValue.map((node, index) => (
        <div key={index} data-key={node.key}>
          <div>
            {node.isend <= 0 ? (
              <i
                id={`Expand-Dtm-${rootId}-Level${level}-${removeSpaces(node.value)}`}
                tabIndex={0}
                className={`material-icons ${node.expand ? 'expanded' : 'collapsed'}`}
                onClick={() => itemClick(node)}
                onKeyUp={e => { if (e.key === 'Enter') itemClick(node); }}
              >
                {node.expand ? "arrow_drop_down" : "arrow_right"}
              </i>
            ) : (
              <span className="d-inline-block width-24 height-24" />
            )}
            <label className="cursor-pointer">
              <input
                id={`Input-Dtm-${rootId}-Level${level}-${removeSpaces(node.value)}`}
                disabled={isdisabled(node)}
                type="checkbox"
                checked={!!node.selected}
                value={node.key}
                onClick={() => selectItem(node)}
                readOnly
              />
              <span className="atp-hchy-tree-item">{node.value}</span>
            </label>
          </div>
          <div className="m-l-20">
            {node.loading && (
              <div className="atp-hchy-loading">Loading...</div>
            )}
            {node.expand && !node.loading && node.nodes && (
              <CheckboxTree
                level={level + 1}
                rootId={rootId}
                disabledkeys={disabledkeys}
                selectedid={selectedid}
                hierarchyid={hierarchyid}
                disableme={node.selected || disableme}
                parentkey={node.key}
                nodes={node.nodes}
                isdisabled={isdisabled}
                itemClick={itemClick}
                selectItem={selectItem}
                emitExpand={emitExpand}
                emitSelect={emitSelect}
                refreshTrigger={refreshTrigger}
              />
            )}
          </div>
        </div>
         ))}
    </div>
  );
}

export default CheckboxTree;