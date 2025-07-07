const features =
  typeof window !== "undefined" && window.applicationConfig?.features
    ? window.applicationConfig.features
    : {};
export default Object.freeze({
    quarters: [
        { quarter: 1, months: [9, 10, 11] },
        { quarter: 2, months: [12, 1, 2] },
        { quarter: 3, months: [3, 4, 5] },
        { quarter: 4, months: [6, 7, 8] }
    ],
    gridSizes: {
        defaultColumnWidth: 90,
        defaultOutlookColumnWidth: 175,
        minColumnWidth: 70,
        maxColumnWidth: 120,
        defaultMetricsWidth: 250,
        minMetricsWidth: 70,
        maxMetricsWidth: 399,
    },
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    monthMap: {
        'jan': '01',
        'feb': '02',
        'mar': '03',
        'apr': '04',
        'may': '05',
        'jun': '06',
        'jul': '07',
        'aug': '08',
        'sep': '09',
        'oct': '10',
        'nov': '11',
        'dec': '12',
    },
    clgCodes: ['-1', '105', '110', '115', '120', '125', '130', '135'],
    clgTreeCodes: [
        {clgCode: '-1', clCodes: ['leadership']},
        {clgCode: '105', clCodes: ['GMC-10000025', 'SMD-10000025']},
        {clgCode: '110', clCodes: ['MD2-10000025', 'MD3-10000025', 'MD4-10000025']},
        {clgCode: '115', clCodes: ['10000050', '10000060']},
        {clgCode: '120', clCodes: ['10000070']},
        {clgCode: '125', clCodes: ['10000080', '10000090']},
        {clgCode: '130', clCodes: ['10000100', '10000110']},
        {clgCode: '135', clCodes: ['10000120', '10000130']},
    ],
    clgTreeCodesPRIPRO: [
        {clgCode: '-1', clCodes: ['leadership']},
        {clgCode: '105', clCodes: ['GMC-10000025', 'SMD-10000025']},
        {clgCode: '110', clCodes: ['MD2-10000025', 'MD3-10000025', 'MD4-10000025']},
        {clgCode: '115', clCodes: ['10000050','10000055', '10000060']},
        {clgCode: '120', clCodes: ['10000070']},
        {clgCode: '125', clCodes: ['10000080', '10000085', '10000090']},
        {clgCode: '130', clCodes: ['10000100', '10000105', '10000110']},
        {clgCode: '135', clCodes: ['10000120', '10000130']},
    ],
    errormessages: [
        {errorid: "1001", errordesc: "Scenariolength",errormsg: "Please enter a scenario name length of more than 2 characters."},
        {errorid: "1002", errordesc: "DuplicateDraft",errormsg: "This name already exists. Please enter another name."},
        {errorid: "1003", errordesc: "SomethingWentWrong",
            errormsg: "Data could not be processed successfully and no Data Export is generated. Kindly make selections and click on Export button again"},
        {errorid: "1004", errordesc: "ForeCastError",errormsg: "Please fix the errors highlighted in red, before submitting your scenario."},
        {errorid: "1005", errordesc: "SavingFailed",errormsg: "Saving row data failed."},
        {errorid: "1006", errordesc: "ForecastNameInvalid", errormsg: "Scenario name is invalid. Please do not use special characters at the beginning of the scenario name." },
        {errorid: "1007", errordesc: "BookmarkNameInvalid", errormsg: "Bookmark name is invalid. Please do not use special characters at the beginning of the bookmark name." },
        {errorid: "1008", errordesc: "DescriptionInvalid", errormsg: "Please do not use special characters at the beginning of your description." },
        {errorid: "1009", errordesc: "OpeningLockedNode", errormsg: "Cannot open this node as all nodes under it are on hold. Please open a node below to continue." },
        {errorid: "1010", errordesc: "ValidationOnLockNode", errormsg: "Could not complete the request as all nodes cannot be On Hold." },
        {errorid: "1011", errordesc: "CascadeDerivedFullLockedNode", errormsg: "Unable to Cascade. Please Open the Cascade Hold for at least 1 Org Node below the Selected Node." },
        {errorid: "1012", errordesc: "ValidationValueEntered",
            errormsg: `The value entered is less than the amount on Hold. CLG/Career Level values have either been adjusted to compensate or reverted to the previous value.` +
            ` Please review and edit your CLG and Career Level entries as needed.` },
        { errorid: "1013", errordesc: "ExcelReachedThreshold", errormsg: "Export was not completed due to data exceeding excel capacity. Please, apply additional filters to run this report again" },
        {errorid: "2001", errordesc: "ModelingDefault",errormsg: "Model generation failed."},
        {errorid: "2002", errordesc: "ModelingEmpty",errormsg: "ERROR - Data is empty."},
        {errorid: "2003", errordesc: "NoForecast", errormsg: "The selected intersection has no live forecast associated."},
        {
            errorid: "2004",
            errordesc: "NoActualsPrevFY",
            errormsg: "I am sorry! As there are no actuals available for previous FY, a model cannot be created for this intersection. Try selecting other intersections."
        },
        {
            errorid: "3004",
            errordesc: "Intersection Submitted recently",
            errormsg: "Live forecast has changed since this Model was created"
        },
        {
            errorid: "2005",
            errordesc: "ActualPrevFYButBHCCurrZero",
            errormsg: "I am sorry! As there is no beginning FTE for the current FY, a model cannot be created for this intersection. Try selecting other intersections."
        },
        {
            errorid: "2006",
            errordesc: "ActualPrevFYAndBHCCurrDistinctZeroButEHCCurrZero",
            errormsg: "I am sorry! As there is no Ending HC for current FY, a model cannot be created for this intersection. Try selecting other intersections."
        },
        {
            errorid: "2007",
            errordesc: "ActualPrevFYAndBHCCurrDistinctZeroAndEHCCurrDistinctZeroButEPCPrevFYZero",
            errormsg: "I am sorry! As there is no Estimated Payroll Cost for below leaders in previous FY, a model cannot be created for this intersection. Try selecting other intersections."
        },
        {
            errorid: "2008",
            errordesc: "ShortModelName",
            errormsg: "Please enter a model Name length of more than 2 characters."
        },
        {
            errorid: "2013",
            errordesc: "ShortSimulationName",
            errormsg: "Please enter an simulation Name length of more than 2 characters."
        },
        {
            errorid: "2022",
            errordesc: "ShortOutlookName",
            errormsg: "Please enter an Outlook name length of more than 2 characters."
        },
        {
            errorid: "2009",
            errordesc: "WrongModelName",
            errormsg: "Model name is invalid. Please do not use special characters at the beginning of the model name."
        },
        {
            errorid: "2014",
            errordesc: "WrongSimulationName",
            errormsg: "Simulation name is invalid. Please do not use special characters at the beginning of the simulation name."
        },
        {
            errorid: "2016",
            errordesc: "SimulationBookmarkDelimied",
            errormsg: "Simulator canot be created because all the models are delimited."
        },
        {
            errorid: "2023",
            errordesc: "WrongOutlookName",
            errormsg: "Outlook name is invalid. Please do not use special characters at the beginning of the Outlook name."
        },
        {
            errorid: "2010",
            errordesc: "UsedModelName",
            errormsg: "Model name is already in use"
        },
        {
            errorid: "2012",
            errordesc: "UsedSimulationName",
            errormsg: "Simulation name is already in use"
        },
        {
            errorid: "2024",
            errordesc: "UsedOutlookName",
            errormsg: "Outlook Name is already in use"
        },
        {
            errorid: "2011",
            errordesc: "ArchiveModel",
            errormsg: "This model does not contain the latest actuals available. Please create a new model to continue with updated actuals."
        },
        {
            errorid: "2015",
            errordesc: "SimulationArchiveModel",
            errormsg: "This simulation does not contain the latest actuals and EPC data available. Please create a new simulation to continue with updated actuals and EPC data."
        },
        {
            errorid: "2020",
            errordesc: "QtrSimulationArchiveModel",
            errormsg: "Note! This is an archived Simulation. Please create a new Simulation for the most current data & functionality."
        },
        {
            errorid: "2021",
            errordesc: "QtrSimulationNegativeModel",
            errormsg: "Ending FTE is negative in a quarter. Please review and adjust your input."
        },
        {errorid: "3001", errordesc: "RefreshBookmark",
            errormsg: "Attributes selected in your bookmark have been updated. Please review your selections and update current bookmark or save as a new bookmark"},
        {errorid: "3002", errordesc: "ValidationValue",
            errormsg: `The value entered is less than the amount on Hold. MLG/Management Level values have either been adjusted to compensate or reverted to the previous value.` +
            ` Please review and edit your MLG and Management Level entries as needed.` },
        {
            errorid: "4000",
            errordesc: "ShortRollupName",
            errormsg: "Please enter a Roll-Up name length of more than 2 characters."
        },
        {
            errorid: "4001",
            errordesc: "WrongRollupName",
            errormsg: "Roll-Up name is invalid. Please do not use special characters at the beginning of the Roll-Up name."
        },
        {
            errorid: "4002",
            errordesc: "UsedRollupName",
            errormsg: "Roll-Up name is already in use"
        },
        {
            errorid: "4003",
            errordesc: "RollupArchiveModel",
            errormsg: "Note! This is an archived Roll-up. Please create a new Roll-up for the most current data & functionality."
        },
        {
            errorid: "4004",
            errordesc: "OverlappingSimulation",
            errormsg: "One or more Simulations in this Rollup overlap with each other. Please review."
        },
        {
            errorid: "4008",
            errordesc: "SimulationCreated",
            errormsg: "Live forecast has changed since this Simulation was created. Please review the models with the information icon."
        },
        {
            errorid: "4009",
            errordesc: "RolllUpCreated",
            errormsg: "Live forecast has changed since this Roll Up was created. Please review the simulation with the information icon."
        },
        {
            errorid: "5000",
            errordesc: "OutlookSubmitValidation",
            errormsg: "Updated Supply values are available. Please click refresh to update supply before submitting."
        },
        {
            errorid: "4010",
            errordesc: "SimulationCreated",
            errormsg: "Bookmark contains any delimited or remapped model that cannot included in the new simulator. Please save a new bookmark to avoid this warning message in the future."
        },
        {
            errorid: "3105",
            errordesc: "SubmittedLiveForecast",
            errormsg: "Live forecast has changed in this node since the scenario was created."
        },
        {
            errorid: "3412",
            errordesc: "NoEHCDataAvailable",
            errormsg: "There is no Ending Pyramid in Live data"
        },
        {
            errorid: "3413",
            errordesc: "PartialEHCDataAvailable",
            errormsg: "Data refreshed for Q1, Q2, Q3 of FY25 based on refreshed data"
        },
        {
            errorid: "3414",
            errordesc: "LiveDataFetchError",
            errormsg: "Cannot retrieve data, please try again later."
        }
    ],
    kpiPyramidAccessibility: {
        AL: "Accenture Leadership",
        SM: "Senior Manager",
        M: "Manager",
        C: "Consultant",
        AN: "Analyst",
        AS: "Associate",
    },
    modelingAccessibility: {
        SMD: "Senior Manager Director",
        MD: "Manager Director",
        SM: "Senior Manager",
        M: "Manager",
        C: "Consultant",
        AN: "Analyst",
        AS: "Associate",
    },
    clgs: [
        {clgCode: '105', clgKey: 'smd', clgName: 'Senior Managing Director'},
        {clgCode: '110', clgKey: 'md', clgName: 'Managing Director'},
        {clgCode: '115', clgKey: 'sm', clgName: 'Senior Manager'},
        {clgCode: '120', clgKey: 'm', clgName: 'Manager'},
        {clgCode: '125', clgKey: 'c', clgName: 'Consultant'},
        {clgCode: '130', clgKey: 'an', clgName: 'Analyst'},
        {clgCode: '135', clgKey: 'as', clgName: 'Associate'},
    ],
    outlookClgs: [
        {clgCode: '110', clgKey: 'md', clgName: 'Accenture Leadership'},
        {clgCode: '115', clgKey: 'sm', clgName: 'Senior Manager'},
        {clgCode: '120', clgKey: 'm', clgName: 'Manager'},
        {clgCode: '125', clgKey: 'c', clgName: 'Consultant'},
        {clgCode: '130', clgKey: 'an', clgName: 'Analyst'},
        {clgCode: '135', clgKey: 'as', clgName: 'Associate'},
    ],
    navigationUrls: {
        atpCircles: "https://web.yammer.com/main/groups/eyJfdHlwZSI6Ikdyb3VwIiwiaWQiOiI3MTYzMjM1NTMyOCJ9/all",
        technicalIssueReport: "https://ts.accenture.com/:x:/s/AccentureTalentPlanning/EcEi7V4DyvdLgIGFrEP2zykBTc_rUg0JtPJvN-SeYFSoEw",
        serviceNow: "https://accentureinternal.service-now.com/technologysupport?id=support_topic_v2&catalog_sys_id=e0d08b13c3330100c8b837659bba8fb4&topic=0",
        atpAcessJobAid: "https://kxdocuments.accenture.com/contribution/9c586d8a-df95-4366-a2e6-4c3b7a4456fb",
        myAccess: "https://support.accenture.com/support_portal?id=my_access"
    },
    peForecastMonths: 8,
    cchDataSourceMessage: 'Please note! Only “Live Data” & the most recent Snapshot date are valid. Do not use any other date selections.',
    snapshotMessage: 'Please note! Only Snapshots taken before dataload will be visible.Live data is not ready for selections.',
    supOrgMessage: 'Select Snapshot to expand Supervisory Org Hierarchy.',
    cchOrgMessage: 'Select Snapshot to expand Cost Center Hierarchy.',
    commentsPasteErrMessage: 'Failed to paste, as total characters in field exceeds ',
    separateModelErrMessage: 'Separate models cannot be created! Please make fewer PH/LH selections or create a Combined model.',
    shareOculusErrMessage: 'User(s) highlighted in red do not have access to one or more models in this Simulation. Please remove them to share.',
    phExportCaptionCriteriaTwo: 'Ensure Career Track is not selected.',
    outlookMetrics: [{"metric": "BHC","name": "Beginning FTE","type": "metrics", child: true},
        {"metric": "EHC","name": "Ending FTE","type": "metrics", child: true},
        {"metric": "AHC","name": "Average FTE","type": "metrics", expanded: false},
        {"metric": "JOI","name": (features.oct22JoinersImprovement) ? "Total Joiners" : "Joiners","type": "metrics", child: true},
        {"metric": "ATM","name": (features.dec23UpdateAttrition) ? "Involuntary Attrition" : "Involuntary Turnover","type": "metrics", child: true},
        {"metric": "ATU","name": (features.dec23UpdateAttrition) ? "Voluntary Attrition" : "Voluntary Turnover","type": "metrics", child: true},
        {"metric": "OMV","name": "Other Movements","type": "metrics", child: true},
        {"metric": "DAI","name": "Demand AI","type": "demand"}],
    outlookChargeabbilityMetrics: [
        {"metric": "CAI","name": "Chargeability AI %","type": "chargeability"},
        {"metric": "CH1","name": "Probable Chargeability %","type": "chargeability"},
        {"metric": "CH2","name": "What-If Chargeability %","type": "chargeability"},
        {"metric": "TGT","name": "Chargeability Target %","type": "chargeability"}
    ],
    outlookExportMetrics: (features.jul23capBalanceFeature) ?
        [{ key: "CH1", value: "Probable Chargeability %" },
            { key: "CH2", value: "What-If Chargeability %" },
            { key: "CAI", value: "Chargeability AI %" },
            { key: "CBC", value: "CapBal Chargeability %" },
            { key: "TGT", value: "Chargeability Target %" },
            { key: "DM1", value: "Probable Demand" },
            { key: "DM2", value: "What-If Demand" },
            { key: "DAI", value: "Demand AI" },
            { key: "CBD", value: "CapBal Demand" },
            { key: "AHC", value: "Average FTE" },
            { key: "BHC", value: "Beginning FTE" },
            { key: (features.oct22JoinersImprovement) ? "JOI,VJO,IJO,TJO" : "JOI" , value: "Joiners" },
            { key: "ATU,ATM", value: (features.dec23UpdateAttrition) ? "Attrition" : "Turnover" },
            { key: "OMV", value: "Other Movements" },
            { key: "EHC", value: "Ending FTE" }
        ] : [{ key: "CH1", value: "Probable Chargeability %" },
            { key: "CH2", value: "What-If Chargeability %" },
            { key: "CAI", value: "Chargeability AI %" },
            { key: "TGT", value: "Chargeability Target %" },
            { key: "DM1", value: "Probable Demand" },
            { key: "DM2", value: "What-If Demand" },
            { key: "DAI", value: "Demand AI" },
            { key: "AHC", value: "Average FTE" },
            { key: "BHC", value: "Beginning FTE" },
            { key: (features.oct22JoinersImprovement) ? "JOI,VJO,IJO,TJO" : "JOI" , value: "Joiners" },
            { key: "ATU,ATM", value: (features.dec23UpdateAttrition) ? "Attrition" : "Turnover" },
            { key: "OMV", value: "Other Movements" },
            { key: "EHC", value: "Ending FTE" }
        ],
    outlookExportMetricsLive: [{ key: "CH1", value: "Probable Chargeability %" },
        { key: "CH2", value: "What-If Chargeability %" },
        { key: "CAI", value: "Chargeability AI %" },
        { key: "CBC", value: "CapBal Chargeability %" },
        { key: "TGT", value: "Chargeability Target %" },
        { key: "DM1", value: "Probable Demand" },
        { key: "DM2", value: "What-If Demand" },
        { key: "DAI", value: "Demand AI" },
        { key: "CBD", value: "CapBal Demand" },
        { key: "AHC", value: "Average FTE" },
        { key: "BHC", value: "Beginning FTE" },
        { key: (features.oct22JoinersImprovement) ? "JOI,VJO,IJO,TJO" : "JOI" , value: "Joiners" },
        { key: "ATU,ATM", value: (features.dec23UpdateAttrition) ? "Attrition" : "Turnover" },
        { key: "OMV", value: "Other Movements" },
        { key: "EHC", value: "Ending FTE" }
    ],
    outlookExportMetricsSnap: [{ key: "CH1", value: "Probable Chargeability %" },
        { key: "CH2", value: "What-If Chargeability %" },
        { key: "CAI", value: "Chargeability AI %" },
        { key: "TGT", value: "Chargeability Target %" },
        { key: "DM1", value: "Probable Demand" },
        { key: "DM2", value: "What-If Demand" },
        { key: "DAI", value: "Demand AI" },
        { key: "AHC", value: "Average FTE" },
        { key: "BHC", value: "Beginning FTE" },
        { key: (features.oct22JoinersImprovement) ? "JOI,VJO,IJO,TJO" : "JOI" , value: "Joiners" },
        { key: "ATU,ATM", value: (features.dec23UpdateAttrition) ? "Attrition" : "Turnover" },
        { key: "OMV", value: "Other Movements" },
        { key: "EHC", value: "Ending FTE" }
    ],
    weightage: {
        "GMC-10000025": 9,
        "SMD-10000025": 9,
        "MD2-10000025": 9,
        "MD3-10000025": 9,
        "MD4-10000025": 9,
        "10000050": 8,
        "10000060": 8,
        "10000070": 7,
        "10000080": 6,
        "10000090": 5,
        "10000100": 4,
        "10000110": 3,
        "10000120": 2,
        "10000130": 1
    },
    quarterEHC: [
        { quarter: 'Q1', month: 12 },
        { quarter: 'Q2', month: 3 },
        { quarter: 'Q3', month: 6 },
        { quarter: 'Q4', month: 9 }
    ]
});