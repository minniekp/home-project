import React, { useState, useMemo, useRef } from 'react';
import CustomList from '../../components/list/list';
import CreateForecast from '../../components/modals/create_forecast';
import ShareModal from '../../components/modals/share_modal';
import DialogBox from '../../components/modals/dialog';
import CreateModel from '../../components/modals/create_model';
import CreateRollup from '../../components/modals/create_rollup';
import utility from '../../utility/utility';
import constList from '../../../store/constants';
import BarChart from '../../components/charts/bar';
import PyramidChart from '../../components/charts/pyramid';

const { actions } = constList.forecast;
const actionModeling = constList.modeling.actions;
const modelingActions = constList.app;
const features =
  typeof window !== "undefined" && (window as any).applicationConfig?.features
    ? (window as any).applicationConfig.features
    : {};
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const NAV_ITEMS = [
  { label: 'Home', key: 'home' },
  { label: 'Summary', key: 'summary' },
  { label: 'Export', key: 'export' },
  { label: 'Chargeability', key: 'chargeability' },
  { label: 'Outlook', key: 'outlook' },
  { label: 'Dashboard', key: 'dashboard' }
];

const HOME_TABS = [
  { label: 'Dynamic Outcome Simulator', key: 'simulation' },
  { label: 'Scenario', key: 'scenario' }
];

const SIMULATOR_TABS = [
  { label: 'Active', key: 'active' },
  { label: 'Shared with me', key: 'shared' },
  { label: 'Archived', key: 'archived' }
];

const ROLLUP_TABS = [
  { label: 'Active', key: 'active' },
  { label: 'Archived', key: 'archived' }
];

const defaultModel = {
  ph: [],
  geo: [],
  contract: 'N',
  selected_type: 'S',
  modeling_type: 'Q'
};

const Home = () => {
  // Replace with your store/context logic
  const store = typeof window !== "undefined" && (window as any).$store
    ? (window as any).$store
    : {
        getters: {},
        state: { forecast: { active: [], archived: [], shared: [], currentyearmonth: '', lastupdatedate: '' }, modeling: {} },
        dispatch: () => Promise.resolve(),
      };

  // State
  const [forecast, setForecast] = useState(utility.clone({
    forecast_master_id: 0, selectedPH: '', selectedGeo: '', ph: [], geo: [],
    contract: 'N', cascade_method: 'A', name: '', desc: '', archive_flag: ''
  }));
  const [forecastMode, setForecastMode] = useState('create');
  const [mode, setMode] = useState('');
  const [shareOculusId, setShareOculusId] = useState(null);
  const [isSharedCopy, setIsSharedCopy] = useState(false);
  const [forecastid, setForecastid] = useState(null);
  const [initialUsers, setInitialUsers] = useState([]);
  const [ouShare, setOuShare] = useState([]);
  const [guShare, setGuShare] = useState([]);
  const [lockedQuarter, setLockedQuarter] = useState('');
  const [isActivated, setIsActivated] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [activeHomeTab, setActiveHomeTab] = useState('simulation');
  const [activeSimulatorTab, setActiveSimulatorTab] = useState('active');
  const [activeRollupTab, setActiveRollupTab] = useState('active');
  const [tabs, setTabs] = useState([
    { label: 'Active', isActive: true },
    { label: 'Shared with me', isActive: false },
    { label: 'Archived', isActive: false }
  ]);
  const [modelTabs, setModelTabs] = useState([
    { label: 'Active', isActive: true },
    { label: 'Shared with me', isActive: false },
    { label: 'Archived', isActive: false }
  ]);
  const [rollupTabs, setRollupTabs] = useState([
    { label: 'Active', isActive: true },
    { label: 'Archived', isActive: false }
  ]);
  const [isReady, setIsReady] = useState(true);
  const [showRollupDialog, setShowRollupDialog] = useState(false);

   const [showCreateModelDialog, setShowCreateModelDialog] = useState(false);
  const [model, setModel] = useState(utility.clone(defaultModel));
  const createModelDialog = useRef<{ show?: () => void; hide?: () => void }>(null);

  // Sections
  const [sections, setSections] = useState(() => [
    features.june24simlandingpage
      ? { label: 'Dynamic Outcome Simulator', isActive: store.getters.setTabValues === 'Dynamic Outcome Simulator' }
      : { label: 'Scenario', isActive: store.getters.setTabValues !== 'Dynamic Outcome Simulator' },
    features.june24simlandingpage
      ? { label: 'Scenario', isActive: store.getters.setTabValues !== 'Dynamic Outcome Simulator' }
      : { label: 'Dynamic Outcome Simulator', isActive: store.getters.setTabValues === 'Dynamic Outcome Simulator' }
  ]);
  const [oculusSections, setOculusSections] = useState([
    { label: 'SIMULATION', value: 'Simulate', isActive: store.getters.setTabSimulatorValues !== 'Roll-Up' },
    { label: 'Roll-Up', value: 'Roll-Up', isActive: store.getters.setTabSimulatorValues === 'Roll-Up' }
  ]);
  const [previousTab, setPreviousTab] = useState(0);
  const [activeTab, setActiveTab] = useState(0);

  // Rollup
  const [rollup, setRollup] = useState(utility.clone({
    name: '', desc: '', selectedOculus: [], selectedShared: []
  }));

  // Dialog refs
  const dialogRef = useRef<{ show?: () => void; hide?: () => void }>(null);
  const shareForecastDialogRef = useRef<{ show?: () => void; hide?: () => void }>(null);
  const shareOculusDialogRef = useRef<{ show?: () => void; hide?: () => void }>(null);
  const createModelDialogRef = useRef<{ show?: () => void; hide?: () => void }>(null);
  const createRollupDialogRef = useRef<{ show?: () => void; hide?: () => void }>(null);

  // Computed
  const activeSection = useMemo(() => sections.find(x => x.isActive) || sections[0], [sections]);
  const activeOculusSection = useMemo(() => oculusSections.find(x => x.isActive) || oculusSections[0], [oculusSections]);
  const hasCreate = store.getters.hasCreate;
  const hasModeling = store.getters.hasModeling;

  // List data (replace with selectors or context as needed)
  const activeList = useMemo(() => ({
    columns: [
      { name: 'Title', link: 'forecast_master_id', value: 'forecast_name', width: 60, sortorder: "desc" },
      { name: 'Last modified date', value: 'edit_timestamp', width: 40, sortorder: "desc" }
    ],
    type: 'active',
    rows: store.state.forecast.active,
    defaultsortby: "edit_timestamp",
    actions: hasCreate
      ? [
          { label: 'Edit', icon: 'edit', action: 'edit' },
          { label: 'Share', icon: 'share', action: 'share' },
          { label: 'Copy', icon: 'file_copy', action: 'copy' },
          { label: 'Remove', icon: 'delete', action: 'delete' }
        ]
      : [
          { label: 'Edit', icon: 'edit', action: 'edit' },
          { label: 'Share', icon: 'share', action: 'share' },
          { label: 'Remove', icon: 'delete', action: 'delete' }
        ]
  }), [hasCreate, store.state.forecast.active]);

  const archivedList = useMemo(() => ({
    columns: [
      { name: 'Title', link: 'forecast_master_id', value: 'forecast_name', width: 60, sortorder: "desc" },
      { name: 'Last modified date', value: 'edit_timestamp', width: 40, sortorder: "desc" }
    ],
    type: 'archived',
    rows: store.state.forecast.archived,
    defaultsortby: "edit_timestamp",
    actions: [
      { label: 'Activate', icon: '', action: 'revive' },
      { label: 'Remove', icon: 'delete', action: 'delete' }
    ],
    invalidDraftActions: [
      { label: 'Remove', icon: 'delete', action: 'delete' }
    ]
  }), [store.state.forecast.archived]);

  const sharedList = useMemo(() => ({
    columns: [
      { name: 'Title', link: 'forecast_master_id', value: 'forecast_name', width: 35, sortorder: "desc" },
      { name: 'Shared by', value: 'sharedby', width: 25 },
      { name: 'Date Shared', value: 'shared_date', width: 20, sortorder: "desc" },
      { name: 'Last modified date', value: 'updated_date', width: 20 }
    ],
    type: 'shared',
    rows: store.state.forecast.shared,
    defaultsortby: "shared_date",
    actions: hasCreate
      ? [
          { label: 'Copy', icon: 'file_copy', action: 'copy' },
          { label: 'Remove', icon: 'delete', action: 'deleteSharedForecast' }
        ]
      : [
          { label: 'Remove', icon: 'delete', action: 'deleteSharedForecast' }
        ],
    invalidDraftActions: [
      { label: 'Remove', icon: 'delete', action: 'deleteSharedForecast' }
    ]
  }), [hasCreate, store.state.forecast.shared]);

  // Tabs logic
  const getTabs = useMemo(() => {
    if (activeSection.label === 'Scenario') return tabs;
    if (activeOculusSection.value === 'Roll-Up' && activeSection.label !== 'Scenario') return rollupTabs;
    return modelTabs;
  }, [activeSection, activeOculusSection, tabs, rollupTabs, modelTabs]);

  const getTabsIDs = useMemo(() => {
    if (activeSection.label === 'Scenario') {
      return ['Btn-Dtm-Active-Drafts', 'Btn-Dtm-Shared-With-Me-Drafts', 'Btn-Dtm-Archived-Drafts'];
    } else {
      if (activeOculusSection.value !== 'Roll-Up') {
        return ['Btn-Dtm-Active-Drafts', 'Btn-Dtm-Shared-Model', 'Btn-Dtm-Archived-Model'];
      } else {
        return ['Btn-Dtm-Active-Drafts', 'Btn-Dtm-Archived-Model'];
      }
    }
  }, [activeSection, activeOculusSection]);

  // Actuals date
  const actualsDate = useMemo(() => {
    const forecastDate = store.state.forecast.currentyearmonth.toString();
    const currentMonth = parseInt(forecastDate.substring(4)) - 1;
    const currentYear = parseInt(forecastDate.substring(0, 4));
    return {
      month: ' ' + months[currentMonth],
      message: `${months[currentMonth]} ${currentYear} month-end.`
    };
  }, [store.state.forecast.currentyearmonth]);

  // Recent refresh
  const hasRecentRefresh = useMemo(() => {
    const dt1 = new Date(store.state.forecast.lastupdatedate);
    const dt2 = new Date();
    const days = Math.floor(
      (Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) -
        Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) /
        (1000 * 60 * 60 * 24)
    );
    return days <= 7;
  }, [store.state.forecast.lastupdatedate]);

  // Section/tab switching
  interface Section {
    label: string;
    isActive: boolean;
  }

  function switchSections(index: number): void {
    setSections((sections: Section[]) =>
      sections.map((x: Section, i: number) => ({ ...x, isActive: i === index }))
    );
    const sectionData: string = sections[index].label;
    store.dispatch(modelingActions.TAB_SET_TYPE, sectionData);
  }
  function switchOculusSections(index: any) {
    setOculusSections(oculusSections => oculusSections.map((x, i) => ({ ...x, isActive: i === index })));
    const sectionData = oculusSections[index].value;
    store.dispatch(modelingActions.SIMULATOR_TAB_SET_TYPE, sectionData);
  }
  function switchTab(index : any) {
    setPreviousTab(activeTab);
    setActiveTab(index);
    if (activeSection.label === 'Scenario') {
      setTabs(tabs => tabs.map((tab, i) => ({ ...tab, isActive: i === index })));
      // Add any additional logic for Scenario tab switching here
    } else if (activeOculusSection.value === 'Roll-Up' && activeSection.label !== 'Scenario') {
      setRollupTabs(rollupTabs => rollupTabs.map((tab, i) => ({ ...tab, isActive: i === index })));
    } else {
      setModelTabs(modelTabs => modelTabs.map((tab, i) => ({ ...tab, isActive: i === index })));
    }
  }

  // Forecast/modal actions (shortened for brevity)
 


  function shareOculus(oculusId: any) {
    setShareOculusId(oculusId);
    store.dispatch(actionModeling.GET_OCULUS_SHARE_USERS).then(() => {
      setInitialUsers(store.state.modeling.oculus.shareUserList);
      if (shareOculusDialogRef.current && shareOculusDialogRef.current.show) shareOculusDialogRef.current.show();
    });
  }
  function copyOculus(oculus: any) {
    setMode('copy');
    setIsSharedCopy(oculus.isSharedCopy);
    setModel(oculus);
    setLockedQuarter(oculus.locked_quarter);
    setModel((m: any) => ({ ...m, modeling_type: oculus.modeling_type || "" }));
    setShowCreateModelDialog(true);
    if (createModelDialogRef.current && createModelDialogRef.current.show) createModelDialogRef.current.show();
  }
  function activeArchivedOculus(oculus: any) {
    setMode('copy');
    setIsActivated(oculus.isActivated);
    setModel(oculus);
    setLockedQuarter(oculus.locked_quarter);
    setModel((m: any) => ({ ...m, modeling_type: oculus.modeling_type || "" }));
    setShowCreateModelDialog(true);
    if (createModelDialogRef.current && createModelDialogRef.current.show) createModelDialogRef.current.show();
  }


  function createRollup() {
    setShowRollupDialog(true);
    setRollup(utility.clone({
      name: '', desc: '', selectedOculus: [], selectedShared: []
    }));
    if (createRollupDialogRef.current && createRollupDialogRef.current.show) createRollupDialogRef.current.show();
  }
 const openModelCreationModal = () => {
    setShowCreateModelDialog(true);
    const newModel = utility.clone(defaultModel);
    newModel.modeling_type = 'Q';
    setModel(newModel);
    // If you need to call a method on the modal, use the ref:
    if (createModelDialog.current && createModelDialog.current.show) {
      createModelDialog.current.show();
    }
  };

  // Handler to close the modal
  const hideModelCreationModal = () => {
    setShowCreateModelDialog(false);
    if (createModelDialog.current && createModelDialog.current.hide) {
      createModelDialog.current.hide();
    }
  };

  return (
    <div className="atp-page" style={{ marginLeft: 32 }}>
      {/* Top Nav Bar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-light" style={{ borderBottom: '1px solid #e5e5e5', marginBottom: 16 }}>
        <div className="d-flex w-100 justify-content-between align-items-center">
          {/* Left: Talent Planning text */}
          <span style={{ color: '#0078d4', fontWeight: 700, fontSize: 22, marginLeft: 8 }}>
            Talent Planning
          </span>
         <div style={{ display: 'flex', alignItems: 'center', marginLeft: 32 }}>
  {NAV_ITEMS.map(item => (
    <span
      key={item.key}
      className={`nav-item${activeNav === item.key ? ' active' : ''}`}
      style={{
        marginRight: 24,
        cursor: 'pointer',
        fontWeight: activeNav === item.key ? 'bold' : undefined,
        color: activeNav === item.key ? '#0078d4' : '#222',
        fontSize: 18,
        padding: '4px 12px',
        borderBottom: activeNav === item.key ? '3px solid #0078d4' : '3px solid transparent',
        borderRadius: 3,
        transition: 'border 0.2s'
      }}
      onClick={() => setActiveNav(item.key)}
    >
      {item.label}
    </span>
  ))}
</div>
        </div>
      </nav>
      {/* Only show home content if Home nav is active */}
      {activeNav === 'home' && (
        <section id="Section-Home" className="atp-content" role="main">
          <div
            role="alert"
            className="animated fadeInUp atp-notif-item atp-notif-warning"
            style={{
              marginBottom: 12,
              backgroundColor: '#e6f2fb',
              width: '100vw',
              position: 'relative',
              marginRight: '-50vw',
              padding: '2px 0',
              border: 'none',
              boxShadow: 'none',
              zIndex: 1,
              textAlign: 'left'
            }}
          >
            <span
              style={{
                color: 'black',
                padding: '4px 12px',
                borderRadius: '4px',
                display: 'inline-block'
              }}
            >
              Data has updated with November actuals, BHC &amp; EHC are recomputed.
            </span>
          </div>
          <div className="atp-page-head d-flex space-between" style={{ borderBottom: '1px solid #e5e5e5', marginBottom: 16 }}>
                     <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            {HOME_TABS.map(tab => (
              <span
                key={tab.key}
                className={`nav-item${activeHomeTab === tab.key ? ' active' : ''}`}
                style={{
                  cursor: 'pointer',
                  fontWeight: activeHomeTab === tab.key ? 'bold' : undefined,
                  color: activeHomeTab === tab.key ? '#0078d4' : '#222',
                  fontSize: 18,
                  padding: '8px 20px',
                  borderBottom: activeHomeTab === tab.key ? '3px solid #0078d4' : '3px solid transparent',
                  borderRadius: 3,
                  marginRight: 16,
                  transition: 'border 0.2s'
                }}
                onClick={() => setActiveHomeTab(tab.key)}
              >
                {tab.label}
              </span>
            ))}
          </div>
          </div>
          {/* Render the existing content under the correct home tab */}
          {activeHomeTab === 'simulation' && (
            <>
              {/* Oculus Modeling/Oculus & Roll-Up */}
              <div className="atp-page-head-new d-flex space-between" style={{ borderBottom: '1px solid #e5e5e5', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <span
                className={`nav-item${activeOculusSection.value === 'Simulate' ? ' active' : ''}`}
                style={{
                  cursor: 'pointer',
                  fontWeight: activeOculusSection.value === 'Simulate' ? 'bold' : undefined,
                  color: activeOculusSection.value === 'Simulate' ? '#0078d4' : '#222',
                  fontSize: 18,
                  padding: '8px 20px',
                  borderBottom: activeOculusSection.value === 'Simulate' ? '3px solid #0078d4' : '3px solid transparent',
                  borderRadius: 3,
                  marginRight: 16,
                  transition: 'border 0.2s'
                }}
                onClick={() => {
                  setOculusSections([
                    { ...oculusSections[0], isActive: true },
                    { ...oculusSections[1], isActive: false }
                  ]);
                  setActiveSimulatorTab('active');
                }}
              >
                Simulation
              </span>
              <div>
     <button onClick={() => setShowCreateModelDialog(true)}>Simulate</button>

      {/* Modal */}
      {showCreateModelDialog && (
        <CreateModel
  show={showCreateModelDialog}
  onClose={() => setShowCreateModelDialog(false)}
  model={model}
/>
      )}
    </div>
              <span
                className={`nav-item${activeOculusSection.value === 'Roll-Up' ? ' active' : ''}`}
                style={{
                  cursor: 'pointer',
                  fontWeight: activeOculusSection.value === 'Roll-Up' ? 'bold' : undefined,
                  color: activeOculusSection.value === 'Roll-Up' ? '#0078d4' : '#222',
                  fontSize: 18,
                  padding: '8px 20px',
                  borderBottom: activeOculusSection.value === 'Roll-Up' ? '3px solid #0078d4' : '3px solid transparent',
                  borderRadius: 3,
                  marginRight: 16,
                  transition: 'border 0.2s'
                }}
                onClick={() => {
                  setOculusSections([
                    { ...oculusSections[0], isActive: false },
                    { ...oculusSections[1], isActive: true }
                  ]);
                  setActiveRollupTab('active');
                }}
              >
                Rollup
              </span>
            </div>
                <div>
                  {hasModeling && activeOculusSection.value === 'Roll-Up' && (
                    <button
                      id="Btn-Dtm-ListModels-Create"
                      aria-label="Create rollup (open a modal)"
                      type="button"
                      className="atp-btn atp-btn-ok m-l-10"
                      onClick={createRollup}
                    >
                      Create Rollup
                    </button>
                  )}
                </div>
              </div>
              {activeOculusSection.value === 'Simulate' && (
                <>
                                 <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #e5e5e5' }}>
                  {SIMULATOR_TABS.map(tab => (
                    <span
                      key={tab.key}
                      className={`nav-item${activeSimulatorTab === tab.key ? ' active' : ''}`}
                      style={{
                        cursor: 'pointer',
                        fontWeight: activeSimulatorTab === tab.key ? 'bold' : undefined,
                        color: activeSimulatorTab === tab.key ? '#0078d4' : '#222',
                        fontSize: 16,
                        padding: '10px 32px',
                        borderBottom: activeSimulatorTab === tab.key ? '3px solid #0078d4' : '3px solid transparent',
                        borderRadius: 0,
                        marginRight: 0,
                        transition: 'border 0.2s',
                        textAlign: 'center'
                      }}
                      onClick={() => setActiveSimulatorTab(tab.key)}
                    >
                      {tab.label}
                    </span>
                  ))}
                </div>
                  {activeSimulatorTab === 'active' && (
                    <>
                      <CustomList
                        key="simulator-active"
                        list={{
                          columns: [
                            { name: 'Title', link: 'oculus_id', value: 'oculus_name', width: 60, sortorder: "desc" },
                            { name: 'Last modified date', value: 'edit_timestamp', width: 40, sortorder: "desc" }
                          ],
                          type: 'active',
                          rows: store.state.modeling.active || [],
                          defaultsortby: "edit_timestamp",
                          actions: hasCreate
                            ? [
                                { label: 'Edit', icon: 'edit', action: 'edit' },
                                { label: 'Share', icon: 'share', action: 'share' },
                                { label: 'Copy', icon: 'file_copy', action: 'copy' },
                                { label: 'Remove', icon: 'delete', action: 'delete' }
                              ]
                            : [
                                { label: 'Edit', icon: 'edit', action: 'edit' },
                                { label: 'Share', icon: 'share', action: 'share' },
                                { label: 'Remove', icon: 'delete', action: 'delete' }
                              ]
                        }}
                        label="Simulation"
                        onShareOculus={shareOculus}
                        onCopyOculus={copyOculus}
                      />
                      <BarChart
                        chartData={{
                          labels: ['Jan', 'Feb', 'Mar'],
                          datasets: [
                            {
                              label: 'Example',
                              data: [10, 20, 30],
                              backgroundColor: '#0078d4'
                            }
                          ]
                        }}
                        stacked={true}
                        legend={true}
                        displayYTicks={true}
                        suffixSymbol=""
                        liveModelCompare={false}
                      />
                      <PyramidChart
                        chartData={{
                          labels: ['Level 1', 'Level 2', 'Level 3'],
                          datasets: [
                            {
                              label: 'Example Pyramid',
                              data: [30, 20, 10],
                              backgroundColor: ['#0078d4', '#5db2ff', '#b3d8ff']
                            }
                          ]
                        }}
                      />
                    </>
                  )}
                  {activeSimulatorTab === 'shared' && (
                    <CustomList
                      key="simulator-shared"
                      list={{
                        columns: [
                          { name: 'Title', link: 'oculus_id', value: 'oculus_name', width: 35, sortorder: "desc" },
                          { name: 'Shared by', value: 'sharedby', width: 25 },
                          { name: 'Date Shared', value: 'shared_date', width: 20, sortorder: "desc" },
                          { name: 'Last modified date', value: 'updated_date', width: 20 }
                        ],
                        type: 'shared',
                        rows: store.state.modeling.shared || [],
                        defaultsortby: "shared_date",
                        actions: hasCreate
                          ? [
                              { label: 'Copy', icon: 'file_copy', action: 'copy' },
                              { label: 'Remove', icon: 'delete', action: 'deleteSharedOculus' }
                            ]
                          : [
                              { label: 'Remove', icon: 'delete', action: 'deleteSharedOculus' }
                            ],
                        invalidDraftActions: [
                          { label: 'Remove', icon: 'delete', action: 'deleteSharedOculus' }
                        ]
                      }}
                      label="Simulation"
                      onCopyOculus={copyOculus}
                    />
                  )}
                  {activeSimulatorTab === 'archived' && (
                    <CustomList
                      key="simulator-archived"
                      list={{
                        columns: [
                          { name: 'Title', link: 'oculus_id', value: 'oculus_name', width: 60, sortorder: "desc" },
                          { name: 'Last modified date', value: 'edit_timestamp', width: 40, sortorder: "desc" }
                        ],
                        rows: store.state.modeling.archived || [],
                        type: 'archived',
                        defaultsortby: "edit_timestamp",
                        actions: hasCreate
                          ? [
                              { label: 'Activate', icon: '', action: 'revive' },
                              { label: 'Remove', icon: 'delete', action: 'delete' }
                            ]
                          : [
                              { label: 'Remove', icon: 'delete', action: 'delete' }
                            ]
                      }}
                      label="Simulation"
                      onArchiveOculus={activeArchivedOculus}
                    />
                  )}
                </>
              )}
              {activeOculusSection.value === 'Roll-Up' && (
                <>
                  <ul className="nav nav-tabs nav-lg" role="tablist" style={{ marginBottom: 16 }}>
                    {ROLLUP_TABS.map(tab => (
                      <li
                        key={tab.key}
                        className={`nav-item${activeRollupTab === tab.key ? ' active' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setActiveRollupTab(tab.key)}
                      >
                        <span className={`nav-link${activeRollupTab === tab.key ? ' active' : ''}`}>
                          {tab.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {activeRollupTab === 'active' && (
                    <CustomList
                      key="rollup-active"
                      list={{
                        columns: [
                          { name: 'Title', link: 'rollup_id', value: 'rollup_name', width: 60, sortorder: "desc" },
                          { name: 'Last modified date', value: 'edit_timestamp', width: 40, sortorder: "desc" }
                        ],
                        rows: store.state.modeling.rollupActive || [],
                        type: 'active',
                        defaultsortby: "edit_timestamp",
                        actions: hasCreate
                          ? [
                              { label: 'Edit', icon: 'edit', action: 'edit' },
                              { label: 'Remove', icon: 'delete', action: 'delete' }
                            ]
                          : [
                              { label: 'Edit', icon: 'edit', action: 'edit' },
                              { label: 'Remove', icon: 'delete', action: 'delete' }
                            ]
                      }}
                      label="Rollup"
                    />
                  )}
                  {activeRollupTab === 'archived' && (
                    <CustomList
                      key="rollup-archived"
                      list={{
                        columns: [
                          { name: 'Title', link: 'rollup_id', value: 'rollup_name', width: 60, sortorder: "desc" },
                          { name: 'Last modified date', value: 'edit_timestamp', width: 40, sortorder: "desc" }
                        ],
                        rows: store.state.modeling.rollupArchived || [],
                        type: 'archived',
                        defaultsortby: "edit_timestamp",
                        actions: hasCreate
                          ? [
                              { label: 'Remove', icon: 'delete', action: 'delete' }
                            ]
                          : [
                              { label: 'Remove', icon: 'delete', action: 'delete' }
                            ]
                      }}
                      label="Rollup"
                    />
                  )}
                </>
              )}
            </>
          )}
          {activeHomeTab === 'scenario' && (
            <>
              <ul className="nav nav-tabs nav-lg" role="tablist" style={{ marginBottom: 16 }}>
                {SIMULATOR_TABS.map(tab => (
                  <li
                    key={tab.key}
                    className={`nav-item${activeSimulatorTab === tab.key ? ' active' : ''}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setActiveSimulatorTab(tab.key)}
                  >
                    <span className={`nav-link${activeSimulatorTab === tab.key ? ' active' : ''}`}>
                      {tab.label}
                    </span>
                  </li>
                ))}
              </ul>
              {activeSimulatorTab === 'active' && (
                <CustomList
                  key="simulator-active"
                  list={{
                    columns: [
                      { name: 'Title', link: 'oculus_id', value: 'oculus_name', width: 60, sortorder: "desc" },
                      { name: 'Last modified date', value: 'edit_timestamp', width: 40, sortorder: "desc" }
                    ],
                    type: 'active',
                    rows: store.state.modeling.active || [],
                    defaultsortby: "edit_timestamp",
                    actions: hasCreate
                      ? [
                          { label: 'Edit', icon: 'edit', action: 'edit' },
                          { label: 'Share', icon: 'share', action: 'share' },
                          { label: 'Copy', icon: 'file_copy', action: 'copy' },
                          { label: 'Remove', icon: 'delete', action: 'delete' }
                        ]
                      : [
                          { label: 'Edit', icon: 'edit', action: 'edit' },
                          { label: 'Share', icon: 'share', action: 'share' },
                          { label: 'Remove', icon: 'delete', action: 'delete' }
                        ]
                  }}
                  label="Simulation"
                  onShareOculus={shareOculus}
                  onCopyOculus={copyOculus}
                />
              )}
              {activeSimulatorTab === 'shared' && (
                <CustomList
                  key="simulator-shared"
                  list={{
                    columns: [
                      { name: 'Title', link: 'oculus_id', value: 'oculus_name', width: 35, sortorder: "desc" },
                      { name: 'Shared by', value: 'sharedby', width: 25 },
                      { name: 'Date Shared', value: 'shared_date', width: 20, sortorder: "desc" },
                      { name: 'Last modified date', value: 'updated_date', width: 20 }
                    ],
                    type: 'shared',
                    rows: store.state.modeling.shared || [],
                    defaultsortby: "shared_date",
                    actions: hasCreate
                      ? [
                          { label: 'Copy', icon: 'file_copy', action: 'copy' },
                          { label: 'Remove', icon: 'delete', action: 'deleteSharedOculus' }
                        ]
                      : [
                          { label: 'Remove', icon: 'delete', action: 'deleteSharedOculus' }
                        ],
                    invalidDraftActions: [
                      { label: 'Remove', icon: 'delete', action: 'deleteSharedOculus' }
                    ]
                  }}
                  label="Simulation"
                  onCopyOculus={copyOculus}
                />
              )}
              {activeSimulatorTab === 'archived' && (
                <CustomList
                  key="simulator-archived"
                  list={{
                    columns: [
                      { name: 'Title', link: 'oculus_id', value: 'oculus_name', width: 60, sortorder: "desc" },
                      { name: 'Last modified date', value: 'edit_timestamp', width: 40, sortorder: "desc" }
                    ],
                    rows: store.state.modeling.archived || [],
                    type: 'archived',
                    defaultsortby: "edit_timestamp",
                    actions: hasCreate
                      ? [
                          { label: 'Activate', icon: '', action: 'revive' },
                          { label: 'Remove', icon: 'delete', action: 'delete' }
                        ]
                      : [
                          { label: 'Remove', icon: 'delete', action: 'delete' }
                        ]
                  }}
                  label="Simulation"
                  onArchiveOculus={activeArchivedOculus}
                />
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
};

export default Home;