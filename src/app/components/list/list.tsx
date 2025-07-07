import React, { useState, useMemo, useRef, useEffect } from 'react';
import './list.scss';
// import ConfirmModal from '../modals/yesno_modal'; // Implement as needed
// import DialogBox from '../modals/dialog'; // Implement as needed
// import utility from '../../utility/utility';
// import constList from '../../store/constants';

const features = typeof window !== "undefined" && (window as any).applicationConfig?.features
  ? (window as any).applicationConfig.features
  : {};

function removeSpaces(str: string) {
  return str.replace(/\s/g, '');
}

interface Column {
  name: string;
  value: string;
  link?: string;
  width: number;
  sortorder?: 'asc' | 'desc';
}

interface Row {
  [key: string]: any;
  isActionsVisible?: boolean;
  isDeleted?: boolean;
  displaydetails?: boolean;
}

interface Action {
  label: string;
  icon: string;
  action: string;
}

interface ListProps {
  list: {
    columns: Column[];
    rows: Row[];
    type?: string;
    defaultsortby?: string;
    actions?: Action[];
    invalidDraftActions?: Action[];
    archivedActions?: Action[];
    archivedAction?: Action[];
  };
  label?: string;
  onEditRow?: (row: any) => void;
  onCopyForecast?: (row: any) => void;
  onShareForecast?: (row: any) => void;
  onCopyOculus?: (row: any) => void;
  onShareOculus?: (id: number) => void;
  onCopyOutlook?: (row: any) => void;
  onShareOutlook?: (id: number) => void;
  onReviveForecast?: (row: any) => void;
  onArchiveOculus?: (row: any) => void;
  onClose?: () => void;
}

const ITEMS_PER_PAGE = 5;

const CustomList: React.FC<ListProps> = ({
  list,
  label = '',
  onEditRow,
  onCopyForecast,
  onShareForecast,
  onCopyOculus,
  onShareOculus,
  onCopyOutlook,
  onShareOutlook,
  onReviveForecast,
  onArchiveOculus,
  onClose,
}) => {
  const [pagenumber, setPagenumber] = useState(1);
  const [sortby, setSortby] = useState(list.defaultsortby || (list.columns[0]?.value ?? ''));
  const [sortorder, setSortorder] = useState<'asc' | 'desc'>(
    list.columns.find(col => col.value === (list.defaultsortby || list.columns[0]?.value))?.sortorder || 'asc'
  );
  const [dialogSettings, setDialogSettings] = useState<{ title: string; body: string; callback: (() => void) | null }>({
    title: 'Confirm delete',
    body: 'Are you sure you want to delete this forecast?',
    callback: null,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lastIndexOpened, setLastIndexOpened] = useState(0);

  // Sorting and paging
  const sortedRows = useMemo(() => {
    const rows = [...(list.rows || [])];
    rows.sort((a, b) => {
      const aVal = a[sortby];
      const bVal = b[sortby];
      if (aVal === bVal) return 0;
      if (sortorder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
    return rows;
  }, [list.rows, sortby, sortorder]);

  const pagedList = useMemo(() => {
    return sortedRows.slice(0, pagenumber * ITEMS_PER_PAGE);
  }, [sortedRows, pagenumber]);

  const hasData = useMemo(() => list.rows && list.rows.length > 0, [list.rows]);

  // Handlers
  function handleSort(column: Column) {
    if (sortby !== column.value) {
      setSortorder('asc');
    } else {
      setSortorder(sortorder === 'asc' ? 'desc' : 'asc');
    }
    setSortby(column.value);
  }

  function showMore() {
    setPagenumber(pagenumber + 1);
  }

  function showDetails(row: Row) {
    row.displaydetails = !row.displaydetails;
  }

  function toggleActions(row: Row, index: number) {
    setLastIndexOpened(index);
    list.rows.forEach((el, i) => {
      if (i !== index) el.isActionsVisible = false;
      else el.isActionsVisible = !el.isActionsVisible;
    });
  }

  // Utility functions (implement or import as needed)
  function formatDate(dateString: string) {
    // return utility.convertToLocalDatetime(dateString);
    return dateString;
  }
  function modelingType(selectionType: string) {
    return selectionType?.toLowerCase() === 'q' ? 'In Quarter FTE Growth' : 'In Year FTE Growth';
  }
  function concatOrgUnits(row: Row) {
    let txt = '';
    for (let i = 1; i <= 10; i++) {
      if (row[`orgunitlevel${i}`]) txt += row[`orgunitlevel${i}`] + ' > ';
      if (row[`orgunitlevel${i}_desc`]) txt += row[`orgunitlevel${i}_desc`] + ' > ';
    }
    return txt.substring(0, txt.length - 2);
  }
  function formatMultiPhLh(value: string) {
    return value?.replace(/;/g, '; ');
  }
  function formatCBF(contractBasedFlag: string) {
    return contractBasedFlag?.replace(/N/g, 'No').replace(/Y/g, 'Yes').replace(/;/g, '; ');
  }
  function formatChargeabilityScope(scope: string) {
    const scopeArray = scope ? scope.split(';') : [];
    const finalString = scopeArray.map(el => (el === '1' ? 'In-Scope' : 'Out-Scope')).join('; ');
    return finalString ? finalString : 'Not Applicable';
  }
  function actionMethod(list: any, row: Row) {
    if (list.type === 'sharedOculus' && row.is_archived) {
      return list.archivedActions;
    } else if (features.oct22JoinersImprovement && list.type === 'archived' && row.is_revival === 0) {
      return list.invalidDraftActions;
    } else if (features.oct22JoinersImprovement && list.type === 'shared' && row.is_revival === 0) {
      return list.invalidDraftActions;
    } else if (
      features.aug23ActivateArchivedSim &&
      list.type === 'archiveModel' &&
      row.modeling_type === 'Q' &&
      row.flagdelimiter === 1
    ) {
      return list.archivedAction;
    } else {
      return list.actions;
    }
  }

  // Action dispatcher
  function doAction(action: string, row: Row, index: number) {
    if (action === 'edit' && onEditRow) {
      onEditRow(row);
    } else if (action === 'copy' && onCopyForecast) {
      onCopyForecast(row);
    } else if (action === 'share' && onShareForecast) {
      onShareForecast(row);
    } else if ((action === 'copyOculus' || action === 'copySharedOculus') && onCopyOculus) {
      onCopyOculus(row);
    } else if (action === 'shareOculus' && onShareOculus) {
      onShareOculus(row.oculus_id);
    } else if (action === 'copySharedOutlook' && onCopyOutlook) {
      onCopyOutlook(row);
    } else if (action === 'shareOutlook' && onShareOutlook) {
      onShareOutlook(row.outlook_master_id);
    } else if (action === 'revive' && onReviveForecast) {
      onReviveForecast(row);
    } else if (action === 'activeArchivedOculus' && onArchiveOculus) {
      onArchiveOculus(row);
    }
    // For delete actions, show dialog (implement dialog logic as needed)
    // ...
    row.isActionsVisible = false;
  }

  return (
    <div className="atp-list animated fadeIn">
      <div className="atp-list-hd">
        {list.columns.map((column, index) => (
          <button
            id={`Btn-Dtm-page-list-forecast-${removeSpaces(column.name)}-sort`}
            key={index}
            aria-live="polite"
            type="button"
            tabIndex={0}
            className="btn-icon atp-list-c atp-list-mhd"
            style={{ width: `${column.width}%` }}
            onClick={() => handleSort(column)}
          >
            <span className="sr-only">Sort by</span> {column.name}
            <span className="sr-only">
              ({sortorder === 'asc' ? 'order down' : 'order up'})
            </span>
            {/* {sortby === column.value && (
              <i className="material-icons atp-list-icn" aria-hidden="true">
                {sortorder === 'desc' ? 'arrow_drop_down' : 'arrow_drop_up'}
              </i>
            )} */}
          </button>
        ))}
      </div>
      <div className="atp-list-body">
        {pagedList.map((row, i) => (
          <div
            key={i}
            className={`atp-list-r${row.isActionsVisible ? ' atp-list-r-active' : ''}${row.isDeleted ? ' atp-list-r-deleted' : ''}`}
          >
            <button
              type="button"
              id={`Btn-Dtm-expand-details-${i}`}
              aria-describedby={`Collapse-Dtm-page-list-forecast-name-description${i}`}
              aria-expanded={row.displaydetails ? 'true' : 'false'}
              aria-controls={`Collapse-Dtm-page-list-forecast-name-${i}`}
              className="btn-icon atp-list-expand atp-list-btn"
              onClick={() => showDetails(row)}
            >
              <i className="material-icons" aria-hidden="true">
                {row.displaydetails ? 'arrow_drop_down' : 'arrow_right'}
              </i>
              <span id={`Collapse-Dtm-page-list-forecast-name-description${i}`} className="sr-only">
                Details {row.forecast_name}
              </span>
            </button>
            {list.columns.map((column, colIdx) => (
              <div key={colIdx} className="atp-list-c" style={{ width: `${column.width}%` }}>
                {/* Render links and details as in Vue */}
                <span>
                  {/* Implement all the link and conditional logic as in your Vue code */}
                  {row[column.value]}
                </span>
              </div>
            ))}
            {/* Actions */}
            {row.deactivated !== 1 && list.actions && list.actions.length > 0 && (
              <div className="atp-list-actions atp-list-btn">
                <a
                  id={`Btn-Dtm-action-menu-${i}`}
                  href="#"
                  tabIndex={0}
                  aria-expanded={row.isActionsVisible ? 'true' : 'false'}
                  aria-controls={`Collapse-Dtm-Actions-${i}`}
                  aria-haspopup="true"
                  className="btn-icon"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleActions(row, i);
                  }}
                >
                  <i className="material-icons" aria-hidden="true">
                    more_vert
                  </i>
                  <span className="sr-only">Expand Actions {row.forecast_name}</span>
                </a>
                <ul style={{ display: row.isActionsVisible ? undefined : 'none' }} id={`Collapse-Dtm-Actions-${i}`}>
                  {actionMethod(list, row)?.map((action: Action, idx: number) => (
                    <li
                      key={idx}
                      tabIndex={0}
                      onClick={() => doAction(action.action, row, i)}
                      onKeyUp={e => e.key === 'Enter' && doAction(action.action, row, i)}
                    >
                      <i className="material-icons" aria-hidden="true">
                        {action.icon}
                      </i>
                      <span>{action.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
        {(pagenumber * ITEMS_PER_PAGE < list.rows.length) && (
          <div className="atp-list-showmore">
            <a
              id="Btn-Dtm-ShowMore-Drafts"
              role="button"
              tabIndex={0}
              aria-label="Press to show more scenarios"
              className="atp-link"
              href="#"
              onClick={e => {
                e.preventDefault();
                showMore();
              }}
              onKeyUp={e => e.key === 'Enter' && showMore()}
            >
              show more
            </a>
          </div>
        )}
        {!hasData && (
          <div className="atp-list-r">
            <div role="alert" className="atp-list-c">
              No items to display.
            </div>
          </div>
        )}
      </div>
      {/* DialogBox and ConfirmModal logic goes here */}
    </div>
  );
};

export default CustomList;