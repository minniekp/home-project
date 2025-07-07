import React, { useState, useRef, useEffect, useMemo } from 'react';
import './grid.scss';
// import CommaSeparator from '../commaSeparator/CommaSeparator'; // You must implement this
// import Toggle from '../toggle/Toggle'; // You must implement this
// import utility from '../../utility/utility';
// import constants from '../../utility/constants';
// import { useStore } from '../../store/useStore'; // You must implement this

// Types for props (simplified, expand as needed)
interface Metric {
  metric: string;
  name: string;
  expanded?: boolean;
  [key: string]: any;
}
interface Column {
  name: string;
  key: string;
  width: number;
  visible: boolean;
  isActuals?: boolean;
  [key: string]: any;
}
interface Quarter {
  year: number;
  quarter: number;
  months: number[];
  expanded?: boolean;
  firstForecastMonth?: number;
  [key: string]: any;
}
interface FiscalYear {
  fiscalYear: number;
  isActualFY: boolean;
  expanded?: boolean;
  [key: string]: any;
}
interface Settings {
  mode: string;
  metrics: Metric[];
  columns: Column[];
  quarters: Quarter[];
  actualQuarters?: Quarter[];
  fiscalYears: FiscalYear[];
  forecasts: Metric[];
  [key: string]: any;
}
interface GridProps {
  forecasts: Metric[];
  settings: Settings;
  mode: string;
  noclgselected?: boolean;
  enableActuals?: boolean;
  enablePercent?: boolean;
  enableSettings?: boolean;
  isDisableGrid?: boolean;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Grid: React.FC<GridProps> = ({
  forecasts,
  settings,
  mode,
  noclgselected = false,
  enableActuals = true,
  enablePercent = false,
  enableSettings = false,
  isDisableGrid = false,
}) => {
  // Store and features (replace with your actual store/context)
  // const store = useStore();
  // const features = store.features;
  const features = {}; // Replace with your features object

  // State
  const [metricsWidth, setMetricsWidth] = useState(220); // Replace with your default
  const [showActuals, setShowActuals] = useState(enableActuals);
  const [showPercent, setShowPercent] = useState(enablePercent);
  const [displaySettings, setDisplaySettings] = useState(false);
  const [scrollpoint, setScrollpoint] = useState(0);

  // Refs
  const scrollableTableElement = useRef<HTMLDivElement>(null);

  // Derived/computed
  const visibleMetrics = useMemo(
    () => forecasts.filter(metric => isMetricVisible(metric.metric)),
    [forecasts]
  );
  const visibleColumns = useMemo(
    () => settings.columns.filter(col => showActuals ? col.visible : col.visible && !col.isActuals),
    [settings.columns, showActuals]
  );
  const totalColumnWidth = useMemo(
    () => visibleColumns.reduce((width, col) => width + col.width, 0),
    [visibleColumns]
  );

  // Example: isMetricVisible (stub, implement your logic)
  function isMetricVisible(metric: string) {
    // Implement your logic here
    return true;
  }

  // Example: toggleExpand (stub)
  function toggleExpand(metric: Metric) {
    metric.expanded = !metric.expanded;
    // If you want to trigger a re-render, use state or forceUpdate
  }

  // Example: formatNumber (stub)
  function formatNumber(value: any, isActuals: boolean, metric: string) {
    if (typeof value === 'number') return value.toLocaleString();
    return value;
  }

  // Example: handle scroll
  function gridScrollHandler(e: React.UIEvent<HTMLDivElement>) {
    setScrollpoint(-e.currentTarget.scrollLeft);
  }

  // Example: handle resize (stub)
  function startResize(e: React.MouseEvent) {
    // Implement resize logic
  }

  // Render
  if (!forecasts || forecasts.length === 0) {
    return <div className="alert alert-table" role="alert">No Rows To Show</div>;
  }

  return (
    <div className="atp-grid" style={{ paddingLeft: metricsWidth + 1 }}>
      <div id="ForecastsTable" className="atp-grid-lbl" style={{ width: metricsWidth }}>
        <div className="atp-grid-lbl-txt atp-grid-header-height atp-grid-seleted-label" style={{ width: metricsWidth }}>
          <span className={`atp-grid-txt-title-${mode}`}>{showPercent ? "PERCENTAGE VIEW" : "FTE VIEW"}</span>
          <div />
          <div
            id="Dtm-resize-handle-metrics"
            className="header-cell-resize"
            role="presentation"
            onMouseDown={startResize}
            // onDoubleClick={setDefaultMetricsWidth}
          />
          {/* Render metrics headers and expandable rows */}
          {visibleMetrics.map((metric, metricIndex) => (
            <div key={metricIndex} className={`atp-grid-aside-margin atp-grid-aside-${metric.metric}`}>
              <div className={`atp-grid-lbl-txt overflow-visible atp-grid-lbl-${metric.metric} atp-grid-lbl-cell-${metric.metric}`}>
                {/* Expand/collapse button */}
                {/* Implement isExpandable and generateRowBusinessKey */}
                <button
                  // id={generateRowBusinessKey('Expand', metric.metric)}
                  aria-live="polite"
                  type="button"
                  className="material-icons btn-icon atp-list-expand atp-list-btn"
                  aria-expanded={metric.expanded ? 'true' : 'false'}
                  // aria-controls={generateRowBusinessKey('Children', metric.metric)}
                  // aria-describedby={generateRowBusinessKey('Label', metric.metric)}
                  onClick={() => toggleExpand(metric)}
                >
                  <i className={`material-icons ${metric.expanded ? 'expanded' : 'collapsed'}`} aria-hidden="true">
                    {metric.expanded ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}
                  </i>
                  <span className="sr-only">Row {metric.name}</span>
                </button>
                <span className="text-ellipsis d-block">{metric.name}</span>
              </div>
              {/* Render CLG and CL rows as needed */}
            </div>
          ))}
        </div>
      </div>
      <div id="atp-grid-data" className="atp-grid-data">
        {/* Table headers */}
        <div className="atp-grid-data-hd">
          {/* Render column headers */}
          {visibleColumns.map((col, idx) => (
            <div
              key={col.key}
              className="atp-grid-c"
              style={{ width: col.width }}
            >
              {col.name}
            </div>
          ))}
        </div>
        {/* Table body */}
        <div
          ref={scrollableTableElement}
          className="atp-grid-data-forecasts"
          onScroll={gridScrollHandler}
        >
          {visibleMetrics.map((metric, metricIndex) => (
            <div key={metricIndex} className={`row atp-grid-lbl-${metric.metric} atp-grid-lbl-cell-${metric.metric}`}>
              {visibleColumns.map((col, colIdx) => (
                <div
                  key={col.key}
                  className="atp-grid-c"
                  style={{ width: col.width }}
                >
                  <span className="cell-span">
                    {formatNumber(metric[col.name.toLowerCase().replace(' ', '_')], col.isActuals ?? false, metric.metric)}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Grid;