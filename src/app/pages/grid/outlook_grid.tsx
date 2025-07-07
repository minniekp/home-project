import React, { useState, useMemo, useRef } from 'react';
import './grid.scss';
import './outlook_grid.scss';
// import CommaSeparator from '../commaSeparator/CommaSeparator'; // Implement as needed
// import Toggle from '../toggle/Toggle'; // Implement as needed
// import utility from '../../utility/utility';
// import constants from '../../utility/constants';

interface Column {
  name: string;
  key: string;
  width: number;
  visible: boolean;
  isActuals?: boolean;
  [key: string]: any;
}
interface Metric {
  metric: string;
  name: string;
  expanded?: boolean;
  child?: boolean;
  careerLevelGroupsDetail?: any[];
  [key: string]: any;
}
interface Settings {
  columns: Column[];
  quarters: any[];
  fiscalYears: any[];
  actualQuarters?: any[];
  [key: string]: any;
}
interface OutlookGridProps {
  outlook: Metric[];
  settings: Settings;
  mode?: string;
  uimode?: string;
  features: any;
}

const OutlookGrid: React.FC<OutlookGridProps> = ({
  outlook,
  settings,
  mode = '',
  uimode = '',
  features
}) => {
  const [metricsWidth, setMetricsWidth] = useState(220); // Default, adjust as needed
  const [showPercent, setShowPercent] = useState(false);
  const [displaySettings, setDisplaySettings] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [scrollpoint, setScrollpoint] = useState(0);

  // Derived/computed
  const visibleColumns = useMemo(
    () => settings.columns.filter(col => col.visible),
    [settings.columns]
  );
  const totalColumnWidth = useMemo(
    () => visibleColumns.reduce((width, col) => width + col.width, 0),
    [visibleColumns]
  );

  // Utility stubs (implement as needed)
  function showColumn(metric: Metric) {
    return !metric.child || (metric.child && expanded);
  }
  function showArrow(metric: string) {
    const metricArray = features.dec24AFTEByMLG ? ['DM1','CH1','AHC'] : ['DM1','CH1'];
    if (features.dec24COTargetMlg) metricArray.push('TGT');
    return (features.jan24CoAtMlg && metricArray.includes(metric) && !showPercent) ||
      (features.dec24AFTEByMLG && metric === 'BHC') ||
      (!features.dec24AFTEByMLG && metric === 'AHC');
  }
  function arrowIcon(metric: Metric) {
    if ((features.dec24AFTEByMLG && metric.metric === 'BHC') || (!features.dec24AFTEByMLG && metric.metric === 'AHC')) {
      return !expanded ? 'keyboard_arrow_right' : 'keyboard_arrow_down';
    } else {
      return metric.expanded ? 'keyboard_arrow_down' : 'keyboard_arrow_right';
    }
  }
  function toggleExpand(metric: Metric) {
    if ((features.dec24AFTEByMLG && metric.metric === 'BHC') || (!features.dec24AFTEByMLG && metric.metric === 'AHC')) {
      setExpanded(e => !e);
    } else if (
      metric.metric === 'DM1' ||
      metric.metric === 'CH1' ||
      (features.dec24AFTEByMLG && metric.metric === 'AHC') ||
      (features.dec24COTargetMlg && metric.metric === 'TGT')
    ) {
      metric.expanded = !metric.expanded;
    }
  }
  function isPercentMetric(metric: string, showPercent: boolean) {
    const metricArr = features.jul23capBalanceFeature
      ? ["DAI","DM1","DM2","AHC","CBD"]
      : ["DAI","DM1","DM2","AHC"];
    return metricArr.includes(metric) && showPercent;
  }
  function generateRowBusinessKey(...args: string[]) {
    return args.join('-').replace(/\s/g, '');
  }
  function formatNumber(value: any) {
    if (typeof value === 'number') return value.toLocaleString();
    return value;
  }
  function addPercentSuffix(metric: Metric, column: Column) {
    // Implement your logic as needed
    return false;
  }
  function isEditable(column: Column, metric: Metric) {
    // Implement your logic as needed
    return false;
  }
  function cellAriaLabel(metric: Metric, column: Column) {
    return `${metric.name}, ${column.isActuals ? 'Actuals' : 'Forecast'}, ${column.name}, value: ${formatNumber(metric[column.name.toLowerCase().replace(' ', '_')])}`;
  }
  function nonExpandableQuarterValue(metric: Metric, column: Column) {
    // Implement as needed
    return [];
  }
  function showTargetVariance(metric: string) {
    return ["CAI", "CH1", "CH2", "CBC"].includes(metric) && mode !== "summary";
  }
  function calcTargetVariance(metric: string, column: string) {
    // Implement as needed
    return 0;
  }

  // Scroll handler
  function gridScrollHandler(e: React.UIEvent<HTMLDivElement>) {
    setScrollpoint(-e.currentTarget.scrollLeft);
  }

  if (!outlook || outlook.length === 0) {
    return <div className="alert alert-table" role="alert">No Rows To Show</div>;
  }

  return (
    <div>
      <div className="atp-grid" style={{ paddingLeft: metricsWidth + 1 }}>
        <div id="OutlookTable" className="atp-grid-lbl" style={{ width: metricsWidth }}>
          <div className="atp-grid-lbl-txt atp-grid-header-height atp-grid-seleted-label" style={{ width: metricsWidth }}>
            <span className="atp-grid-txt-title-edit">{showPercent ? "PERCENTAGE VIEW" : "FTE VIEW"}</span>
            <div />
            <div
              id="Cho-resize-handle-metrics"
              className="header-cell-resize"
              role="presentation"
              onDoubleClick={() => setMetricsWidth(220)}
            />
          </div>
          <div role="grid" className="atp-grid-aside-height">
            {outlook.map((metric, metricIndex) => (
              <div
                key={metricIndex}
                role="row"
                className={`atp-grid-aside-margin atp-grid-aside-${metric.metric}`}
              >
                {features.novFY22ShiftHorizonAndTargetIcon ? (
                  <>
                    {showColumn(metric) && (
                      <div
                        role="rowheader"
                        className={`atp-grid-lbl-txt overflow-visible atp-outlook-grid-lbl-${metric.metric} atp-grid-lbl-cell-${metric.metric}`}
                      >
                        {showArrow(metric.metric) && (
                          <button
                            className="material-icons btn-icon atp-list-expand atp-list-btn"
                            onClick={() => toggleExpand(metric)}
                          >
                            <i
                              className={`material-icons ${metric.expanded ? 'expanded' : 'collapsed'}`}
                              aria-hidden="true"
                            >
                              {arrowIcon(metric)}
                            </i>
                            <span className="sr-only">Row {metric.name}</span>
                          </button>
                        )}
                        {isPercentMetric(metric.metric, showPercent) ? (
                          <span
                            id={generateRowBusinessKey('Label', metric.metric)}
                            className="text-ellipsis d-block"
                          >
                            {metric.name + " %"}
                          </span>
                        ) : (
                          <span
                            id={generateRowBusinessKey('Label', metric.metric)}
                            className="text-ellipsis d-block"
                          >
                            {metric.name}
                          </span>
                        )}
                      </div>
                    )}
                    {features.jan24CoAtMlg && metric.careerLevelGroupsDetail && metric.expanded && (
                      <div id={generateRowBusinessKey('Children', metric.metric)} className="row-children">
                        {metric.careerLevelGroupsDetail.map((group: any, clgIndex: number) => (
                          <div key={clgIndex} role="grid" className="atp-grid-ad0">
                            <div role="row">
                              <div role="rowheader" className="atp-grid-lbl-txt atp-grid-cg">
                                <span
                                  id={generateRowBusinessKey('Label', metric.metric, group.careerlevelgroup)}
                                  className="text-ellipsis"
                                >
                                  {group.careerlevelgroup}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {showColumn(metric) && (
                      <div
                        role="rowheader"
                        className={`atp-grid-lbl-txt overflow-visible atp-cho-grid-lbl-${metric.metric} atp-grid-lbl-cell-${metric.metric}`}
                      >
                        {showArrow(metric.metric) && (
                          <button
                            className="material-icons btn-icon atp-list-expand atp-list-btn"
                            onClick={() => toggleExpand(metric)}
                          >
                            <i
                              className={`material-icons ${metric.expanded ? 'expanded' : 'collapsed'}`}
                              aria-hidden="true"
                            >
                              {arrowIcon(metric)}
                            </i>
                            <span className="sr-only">Row {metric.name}</span>
                          </button>
                        )}
                        {isPercentMetric(metric.metric, showPercent) ? (
                          <span
                            id={generateRowBusinessKey('Label', metric.metric)}
                            className="text-ellipsis d-block"
                          >
                            {metric.name + " %"}
                          </span>
                        ) : (
                          <span
                            id={generateRowBusinessKey('Label', metric.metric)}
                            className="text-ellipsis d-block"
                          >
                            {metric.name}
                          </span>
                        )}
                      </div>
                    )}
                    {features.jan24CoAtMlg && metric.careerLevelGroupsDetail && metric.expanded && (
                      <div id={generateRowBusinessKey('Children', metric.metric)} className="row-children">
                        {metric.careerLevelGroupsDetail.map((group: any, clgIndex: number) => (
                          <div key={clgIndex} role="grid" className="atp-grid-ad0">
                            <div role="row">
                              <div role="rowheader" className="atp-grid-lbl-txt atp-grid-cg">
                                <span
                                  id={generateRowBusinessKey('Label', metric.metric, group.careerlevelgroup)}
                                  className="text-ellipsis"
                                >
                                  {group.careerlevelgroup}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Table data */}
        <div id="atp-grid-data" className="atp-grid-data">
          {/* Table header */}
          <div className="atp-grid-data-hd">
            <div className="grid-actions" style={{ display: mode !== 'summary' ? undefined : 'none' }}>
              <button
                id="Btn-Cho-Menu-Actuals-Forecasts"
                type="button"
                aria-expanded={displaySettings ? 'true' : 'false'}
                aria-controls="Btn-Dtm-Menu-Actuals-Forecasts"
                aria-haspopup="true"
                className="btn-icon color-gray-67"
                onClick={() => setDisplaySettings(ds => !ds)}
              >
                <i className="material-icons" aria-hidden="true">settings</i>
                <span className="sr-only">Expand actions for percentage/Actuals</span>
              </button>
              {displaySettings && (
                <ul id="Cho-Collapse-Actuals" className="dropdown setting-dropdown">
                  <li>
                    {/* Replace with your Toggle component */}
                    <label>
                      <input
                        type="checkbox"
                        checked={showPercent}
                        onChange={e => setShowPercent(e.target.checked)}
                      />
                      View By: {showPercent ? 'FTE' : '%'}
                    </label>
                  </li>
                </ul>
              )}
            </div>
            <div
              role="row"
              className="atp-grid-header"
              style={{
                position: 'relative',
                width: totalColumnWidth,
                marginLeft: scrollpoint,
                height: '100%'
              }}
            >
              {visibleColumns.map((column, idx) => (
                <div
                  key={column.key}
                  id={`Col-Header-${column.name.replace(/\s/g, '')}`}
                  className={`atp-grid-c ${column.isActuals ? 'cell-actuals' : 'cell-forecasts'} ${idx === 0 ? 'cell-first' : ''}`}
                  style={{ width: column.width }}
                >
                  <div className="header-container-btn" style={{ width: column.width }}>
                    <div
                      id={`Dtm-resize-handle-${column.name.replace(/\s/g, '')}`}
                      className="header-cell-resize"
                      role="presentation"
                      onDoubleClick={() => {
                        // Set default column width logic here
                      }}
                    />
                    <span
                      id={`Label-Dtm-Col-${column.name.replace(/\s/g, '')}`}
                      className="text-ellipsis"
                    >
                      {column.isActuals ? '(A) ' : '(F) '}
                      {column.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Table body */}
          <div
            className="atp-grid-data-forecasts"
            role="grid"
            onScroll={gridScrollHandler}
          >
            {outlook.map((metric, metricIndex) => (
              <div key={metricIndex}>
                {showColumn(metric) && (
                  <div
                    role="row"
                    className={`row atp-outlook-grid-lbl-${metric.metric} atp-grid-lbl-cell-${metric.metric}`}
                    style={{ width: totalColumnWidth }}
                  >
                    {visibleColumns.map((column, enabledColIndex) => (
                      <div
                        key={enabledColIndex}
                        role="gridcell"
                        className={`atp-grid-c ${column.isActuals ? 'cell-actuals' : 'cell-forecasts'}`}
                        style={{ width: column.width }}
                      >
                        <span className="cell-span" tabIndex={0} aria-label={cellAriaLabel(metric, column)}>
                          {formatNumber(metric[column.name.toLowerCase().replace(' ', '_')])}
                          {addPercentSuffix(metric, column) ? '%' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {/* CLG row */}
                {features.jan24CoAtMlg && metric.careerLevelGroupsDetail && metric.expanded && (
                  metric.careerLevelGroupsDetail.map((group: any, groupIndex: number) => (
                    <div
                      key={groupIndex}
                      role="row"
                      className="row"
                      style={{ width: totalColumnWidth }}
                    >
                      {visibleColumns.map((column, enabledColIndex) => (
                        <div
                          key={enabledColIndex}
                          role="gridcell"
                          className={`atp-grid-c ${column.isActuals ? 'cell-actuals' : 'cell-forecasts'}`}
                          style={{ width: column.width }}
                        >
                          <span className="cell-numbers cell-span" tabIndex={0} aria-label={`${metric.name} ${group.careerlevelgroup}, ${column.isActuals ? 'Actuals' : 'Forecast'}, ${column.name}, value: ${formatNumber(group[column.name.toLowerCase().replace(' ', '_')])}`}>
                            {formatNumber(group[column.name.toLowerCase().replace(' ', '_')])}
                            {addPercentSuffix(group, column) ? '%' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutlookGrid;