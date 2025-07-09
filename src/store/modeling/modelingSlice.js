import { createSlice } from '@reduxjs/toolkit';
// Import your thunks (async actions) and selectors here
import modelingCalc from '../../../utility/modeling_calc';
import utility from '../../../utility/utility';
import oculusCalc from '../../../utility/oculus_calc';

// Initial state (converted from initialState function)
const initialState = {
    active: [],
    archive: [],
    shared: [],
    refreshedQtrs: [],
    talentGrowth: {},
    cbloading: false,
    cbpull: false,
    ischargeable: [],
    liveForecast: {
        currFY: {
            AHC: {},
            pyramidindex: 0,
            EHC: {},
            BHC: {},
            joiners: {},
            movements: {},
            promotions: { out: {} },
            attrition: { managed: {}, unmanaged: {} }
        },
        prevFY: {
            AHC: {},
            EHC: {},
            BHC: {}
        },
        nextFY: {
            AHC: {},
            EHC: {},
            BHC: {},
            pyramidindex: 0,
            joiners: {},
            movements: {},
            promotions: { out: {} },
            attrition: { managed: {}, unmanaged: {} }
        }
    },
    liveInput: {
        currFY: {
            pyramid: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
            managedAttrition: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
            unmanagedAttrition: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
            promotionsOut: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
            Q1: { pyramid: {} },
            Q2: { pyramid: {} },
            Q3: { pyramid: {} },
            Q4: { pyramid: {} }
        },
        nextFY: {
            pyramid: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
            managedAttrition: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
            unmanagedAttrition: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
            promotionsOut: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
            Q1: { pyramid: {} },
            Q2: { pyramid: {} },
            Q3: { pyramid: {} },
            Q4: { pyramid: {} }
        }
    },
    liveOutput: {
        prevFY: {
            AHC: {},
            Q1: { AHC: {} },
            Q2: { AHC: {} },
            Q3: { AHC: {} },
            Q4: { AHC: {} },
            total: { totalAHC: 0 }
        },
        currFY: {
            epg: { percentage: 0 },
            AHC: {},
            pyramidindex: 0,
            fteGrowth: {
                inYear: { value: 0, percentage: 0 },
                yearOnYear: { value: 0, percentage: 0 }
            },
            total: {
                managedAttrition: 0,
                unManagedAttrition: 0,
                promotions: { out: 0 },
                totalAHC: 0,
                totalEHC: 0,
                totalBHC: 0,
                joiners: 0,
                movements: 0
            },
            percent: {
                managedAttrition: 0,
                unManagedAttrition: 0,
                promotions: { out: 0 },
                BHC: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }
            },
            Q1: {
                EHC: {}, AHC: {}, BHC: {}, pyramidindex: 0, joiners: {}, movements: {}, promotionsOut: {}, unmanagedAttrition: {}, managedAttrition: {},
                percent: { managedAttrition: 0, unmanagedAttrition: 0, promotionsOut: 0, BHC: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 } }
            },
            Q2: {
                EHC: {}, AHC: {}, BHC: {}, pyramidindex: 0, joiners: {}, movements: {}, promotionsOut: {}, unmanagedAttrition: {}, managedAttrition: {},
                percent: { managedAttrition: 0, unmanagedAttrition: 0, promotionsOut: 0, BHC: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 } }
            },
            Q3: {
                EHC: {}, AHC: {}, BHC: {}, pyramidindex: 0, joiners: {}, movements: {}, promotionsOut: {}, unmanagedAttrition: {}, managedAttrition: {},
                percent: { managedAttrition: 0, unmanagedAttrition: 0, promotionsOut: 0, BHC: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 } }
            },
            Q4: {
                EHC: {}, AHC: {}, BHC: {}, pyramidindex: 0, joiners: {}, movements: {}, promotionsOut: {}, unmanagedAttrition: {}, managedAttrition: {},
                percent: { managedAttrition: 0, unmanagedAttrition: 0, promotionsOut: 0, BHC: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 } }
            }
        },
        nextFY: {
            epg: { percentage: 0 },
            AHC: {},
            pyramidindex: 0,
            fteGrowth: {
                inYear: { value: 0, percentage: 0 },
                yearOnYear: { value: 0, percentage: 0 }
            },
            total: {
                managedAttrition: 0,
                unManagedAttrition: 0,
                promotions: { out: 0 },
                totalAHC: 0,
                totalEHC: 0,
                totalBHC: 0,
                joiners: 0,
                movements: 0
            },
            percent: {
                managedAttrition: 0,
                unManagedAttrition: 0,
                promotions: { out: 0 },
                BHC: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }
            },
            Q1: {
                EHC: {}, AHC: {}, BHC: {}, pyramidindex: 0, joiners: {}, movements: {}, promotionsOut: {}, unmanagedAttrition: {}, managedAttrition: {},
                percent: { managedAttrition: 0, unmanagedAttrition: 0, promotionsOut: 0, BHC: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 } }
            },
            Q2: {
                EHC: {}, AHC: {}, BHC: {}, pyramidindex: 0, joiners: {}, movements: {}, promotionsOut: {}, unmanagedAttrition: {}, managedAttrition: {},
                percent: { managedAttrition: 0, unmanagedAttrition: 0, promotionsOut: 0, BHC: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 } }
            },
            Q3: {
                EHC: {}, AHC: {}, BHC: {}, joiners: {}, movements: {}, pyramidindex: 0, promotionsOut: {}, unmanagedAttrition: {}, managedAttrition: {},
                percent: { managedAttrition: 0, unmanagedAttrition: 0, promotionsOut: 0, BHC: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 } }
            },
            Q4: {
                EHC: {}, AHC: {}, BHC: {}, joiners: {}, pyramidindex: 0, movements: {}, promotionsOut: {}, unmanagedAttrition: {}, managedAttrition: {},
                percent: { managedAttrition: 0, unmanagedAttrition: 0, promotionsOut: 0, BHC: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 } }
            }
        }
    },
    loading: false,
    saving: false,
    isModelSave: false,
    pendingChanges: false,
    details: {},
    liveDataFlag: false,
    minLimitError: false,
    oculus: {
        modelError: [],
        oculus_type: 'S',
        details: {},
        modelList: [],
        shareUserList: []
    },
    rollup: {
        active: [],
        archive: [],
        oculus: [],
        modelError: [],
        details: {}
    },
    warningMsg: {},
    warningBkMsg: {},
    clgs: [],
    original: {
        metricData: {},
        leaderData: {},
        leaderFYData: {},
        selectedFY: '',
        epcData: [],
        currFY: {
            AHC: {},
            EHC: {},
            BHC: {},
            FirstForecastMonthBHC: {},
            BHCSumOnlyActuals: {},
            EHCSumOnlyActuals: {},
            APC: {},
            EPC: {},
            joiners: {},
            movements: {},
            promotions: { in: {}, out: {} },
            attrition: { managed: {}, unmanaged: {} },
            firstForecastMonth: 0,
            total: {
                managedAttrition: 0,
                unManagedAttrition: 0,
                promotions: { out: 0 },
                totalAHC: 0,
                totalEHC: 0,
                totalBHC: 0,
                joiners: 0,
                movements: 0
            },
            actual: { joiners: {}, movements: {} },
            percent: { managedAttrition: 0, unManagedAttrition: 0, promotions: { out: 0 } },
            BB: {},
            EPCRate: {},
            liveForecastDistPercent: {},
            Q1: {
                AHC: {}, EHC: {}, BHC: {}, joiners: {}, movements: {}, promotionsIn: {}, promotionsOut: {}, unmanagedAttrition: {}, managedAttrition: {},
                firstForecastMonth: 0, liveForecastEHC: {}, actual: { joiners: {}, movements: {} },
                percent: { managedAttrition: 0, unManagedAttrition: 0, promotionsout: {} }
            },
            Q2: {
                AHC: {}, EHC: {}, BHC: {}, joiners: {}, movements: {}, promotionsIn: {}, promotionsOut: {}, unmanagedAttrition: {}, managedAttrition: {},
                firstForecastMonth: 0, liveForecastEHC: {}, actual: { joiners: {}, movements: {} },
                percent: { managedAttrition: 0, unManagedAttrition: 0, promotionsout: {} }
            },
            Q3: {
                AHC: {}, EHC: {}, BHC: {}, joiners: {}, movements: {}, promotionsIn: {}, promotionsOut: {}, unmanagedAttrition: {}, managedAttrition: {},
                firstForecastMonth: 0, liveForecastEHC: {}, actual: { joiners: {}, movements: {} },
                percent: { managedAttrition: 0, unManagedAttrition: 0, promotionsout: {} }
            },
            Q4: {
                AHC: {}, EHC: {}, BHC: {}, joiners: {}, movements: {}, promotionsIn: {}, promotionsOut: {}, unmanagedAttrition: {}, managedAttrition: {},
                firstForecastMonth: 0, liveForecastEHC: {}, actual: { joiners: {}, movements: {} },
                percent: { managedAttrition: 0, unManagedAttrition: 0, promotionsout: {} }
            },
            mlData: { Q1: {}, Q2: {}, Q3: {}, Q4: {} }
        },
        prevFY: {
            AHC: {}, EHC: {}, BHC: {}, APC: {}, EPC: {}, EPCRate: {},
            Q1: { AHC: {}, BHC: {} }, Q2: { AHC: {}, BHC: {} }, Q3: { AHC: {}, BHC: {} }, Q4: { AHC: {}, BHC: {} },
            total: { totalAHC: 0 },
            mlData: { Q1: {}, Q2: {}, Q3: {}, Q4: {} }
        },
        nextFY: {
            AHC: {}, EHC: {}, BHC: {}, FirstForecastMonthBHC: {}, BHCSumOnlyActuals: {}, EHCSumOnlyActuals: {}, APC: {}, EPC: {}, joiners: {}, movements: {},
            promotions: { in: {}, out: {} }, attrition: { managed: {}, unmanaged: {} }, firstForecastMonth: 0,
            total: {
                managedAttrition: 0,
                unManagedAttrition: 0,
                promotions: { out: 0 },
                totalAHC: 0,
                totalEHC: 0,
                totalBHC: 0,
                joiners: 0,
                movements: 0
            },
            actual: { joiners: {}, movements: {} },
            percent: { managedAttrition: 0, unManagedAttrition: 0, promotions: { out: 0 } },
            BB: {},
            EPCRate: {},
            liveForecastDistPercent: {},
            Q1: {
                AHC: {}, EHC: {}, BHC: {}, joiners: {}, movements: {}, promotionsIn: {}, promotionsOut: {}, unmanagedAttrition: {}, managedAttrition: {},
                firstForecastMonth: 0, liveForecastEHC: {}, actual: { joiners: {}, movements: {} },
                percent: { managedAttrition: 0, unManagedAttrition: 0, promotionsout: {} }
            },
            Q2: {
                AHC: {}, EHC: {}, BHC: {}, joiners: {}, movements: {}, promotionsIn: {}, promotionsOut: {}, unmanagedAttrition: {}, managedAttrition: {},
                firstForecastMonth: 0, liveForecastEHC: {}, actual: { joiners: {}, movements: {} },
                percent: { managedAttrition: 0, unManagedAttrition: 0, promotionsout: {} }
            },
            Q3: {
                AHC: {}, EHC: {}, BHC: {}, joiners: {}, movements: {}, promotionsIn: {}, promotionsOut: {}, unmanagedAttrition: {}, managedAttrition: {},
                firstForecastMonth: 0, liveForecastEHC: {}, actual: { joiners: {}, movements: {} },
                percent: { managedAttrition: 0, unManagedAttrition: 0, promotionsout: {} }
            },
            Q4: {
                AHC: {}, EHC: {}, BHC: {}, joiners: {}, movements: {}, promotionsIn: {}, promotionsOut: {}, unmanagedAttrition: {}, managedAttrition: {},
                firstForecastMonth: 0, liveForecastEHC: {}, actual: { joiners: {}, movements: {} },
                percent: { managedAttrition: 0, unManagedAttrition: 0, promotionsout: {} }
            },
            mlData: { Q1: {}, Q2: {}, Q3: {}, Q4: {} }
        }
    },
    modeled: {
        currFY: {
            AHC: {}, EHC: {}, liveForecastGrowthValue: {}, modeledEHCMetric: {}, modeledBHCMetric: {}, modeledPROMetric: [], modeledPRIMetric: [],
            modeledATUMetric: [], modeledATMMetric: [], modeledJOIMetric: [], modeledMOVMetric: [], BBB: {}, EPC: {},
            Q1: { AHC: {}, EHC: {}, BHC: {}, liveForecastGrowthValue: {}, growthPhasing: { monthlyDistribution: {}, totalDistribution: {} }, managedAttrition: { monthlyDistribution: {}, values: {} }, unmanagedAttrition: { monthlyDistribution: {}, values: {} }, promotionsOut: { monthlyDistribution: {}, values: {} }, promotionsIn: { values: {} }, inQuarterFTE: { monthlyDistribution: {}, values: {} } },
            Q2: { AHC: {}, EHC: {}, BHC: {}, liveForecastGrowthValue: {}, growthPhasing: { monthlyDistribution: {}, totalDistribution: {} }, managedAttrition: { monthlyDistribution: {}, values: {} }, unmanagedAttrition: { monthlyDistribution: {}, values: {} }, promotionsOut: { monthlyDistribution: {}, values: {} }, promotionsIn: { values: {} }, inQuarterFTE: { monthlyDistribution: {}, values: {} } },
            Q3: { AHC: {}, EHC: {}, BHC: {}, liveForecastGrowthValue: {}, growthPhasing: { monthlyDistribution: {}, totalDistribution: {} }, managedAttrition: { monthlyDistribution: {}, values: {} }, unmanagedAttrition: { monthlyDistribution: {}, values: {} }, promotionsOut: { monthlyDistribution: {}, values: {} }, promotionsIn: { values: {} }, inQuarterFTE: { monthlyDistribution: {}, values: {} } },
            Q4: { AHC: {}, EHC: {}, BHC: {}, liveForecastGrowthValue: {}, growthPhasing: { monthlyDistribution: {}, totalDistribution: {} }, managedAttrition: { monthlyDistribution: {}, values: {} }, unmanagedAttrition: { monthlyDistribution: {}, values: {} }, promotionsOut: { monthlyDistribution: {}, values: {} }, promotionsIn: { values: {} }, inQuarterFTE: { monthlyDistribution: {}, values: {} } }
        },
        nextFY: {
            AHC: {}, EHC: {}, liveForecastGrowthValue: {}, modeledEHCMetric: {}, modeledBHCMetric: {}, modeledPROMetric: [], modeledPRIMetric: [],
            modeledATUMetric: [], modeledATMMetric: [], modeledJOIMetric: [], modeledMOVMetric: [], BBB: {}, EPC: {},
            Q1: { AHC: {}, EHC: {}, BHC: {}, liveForecastGrowthValue: {}, growthPhasing: { monthlyDistribution: {}, totalDistribution: {} }, managedAttrition: { monthlyDistribution: {}, values: {} }, unmanagedAttrition: { monthlyDistribution: {}, values: {} }, promotionsOut: { monthlyDistribution: {}, values: {} }, promotionsIn: { values: {} }, inQuarterFTE: { monthlyDistribution: {}, values: {} } },
            Q2: { AHC: {}, EHC: {}, BHC: {}, liveForecastGrowthValue: {}, growthPhasing: { monthlyDistribution: {}, totalDistribution: {} }, managedAttrition: { monthlyDistribution: {}, values: {} }, unmanagedAttrition: { monthlyDistribution: {}, values: {} }, promotionsOut: { monthlyDistribution: {}, values: {} }, promotionsIn: { values: {} }, inQuarterFTE: { monthlyDistribution: {}, values: {} } },
            Q3: { AHC: {}, EHC: {}, BHC: {}, liveForecastGrowthValue: {}, growthPhasing: { monthlyDistribution: {}, totalDistribution: {} }, managedAttrition: { monthlyDistribution: {}, values: {} }, unmanagedAttrition: { monthlyDistribution: {}, values: {} }, promotionsOut: { monthlyDistribution: {}, values: {} }, promotionsIn: { values: {} }, inQuarterFTE: { monthlyDistribution: {}, values: {} } },
            Q4: { AHC: {}, EHC: {}, BHC: {}, liveForecastGrowthValue: {}, growthPhasing: { monthlyDistribution: {}, totalDistribution: {} }, managedAttrition: { monthlyDistribution: {}, values: {} }, unmanagedAttrition: { monthlyDistribution: {}, values: {} }, promotionsOut: { monthlyDistribution: {}, values: {} }, promotionsIn: { values: {} }, inQuarterFTE: { monthlyDistribution: {}, values: {} } }
        }
    },
    lockvalue: {
        currFY: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
        nextFY: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }
    },
    LockQuarter: {
        currFY: {
            growthPhasing: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
            inQuarterFTE: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
            managedAttrition: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
            unmanagedAttrition: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
            promotionsOut: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
            pyramid: {
                Q1: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
                Q2: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
                Q3: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
                Q4: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }
            }
        },
        nextFY: {
            growthPhasing: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
            inQuarterFTE: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
            managedAttrition: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
            unmanagedAttrition: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
            promotionsOut: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
            pyramid: {
                Q1: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
                Q2: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
                Q3: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
                Q4: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }
            }
        }
    },
    modeledLockQuarter: {
        currFY: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 },
        nextFY: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 }
    },
    input: {
        currFY: {
            yearOnYearGrowth: { value: 0, minValue: 0, defaultValue: 0 },
            pyramid: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
            oldPyramid: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
            managedAttrition: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
            unmanagedAttrition: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
            promotionsOut: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
            Q1: {
                actualMonths: 0, growthPhasing: { value: 0, minValue: 0 }, managedAttrition: { value: 0, minValue: 0 }, unmanagedAttrition: { value: 0, minValue: 0 },
                promotionsOut: { value: 0, minValue: 0 }, pyramid: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }, inQuarterFTE: { value: 0, minValue: 0 },
                oldPyramid: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }
            },
            Q2: {
                actualMonths: 0, growthPhasing: { value: 0, minValue: 0 }, managedAttrition: { value: 0, minValue: 0 }, unmanagedAttrition: { value: 0, minValue: 0 },
                promotionsOut: { value: 0, minValue: 0 }, pyramid: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }, inQuarterFTE: { value: 0, minValue: 0 },
                oldPyramid: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }
            },
            Q3: {
                actualMonths: 0, growthPhasing: { value: 0, minValue: 0 }, managedAttrition: { value: 0, minValue: 0 }, unmanagedAttrition: { value: 0, minValue: 0 },
                promotionsOut: { value: 0, minValue: 0 }, pyramid: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }, inQuarterFTE: { value: 0, minValue: 0 },
                oldPyramid: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }
            },
            Q4: {
                actualMonths: 0, growthPhasing: { value: 0, minValue: 0 }, managedAttrition: { value: 0, minValue: 0 }, unmanagedAttrition: { value: 0, minValue: 0 },
                promotionsOut: { value: 0, minValue: 0 }, pyramid: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }, inQuarterFTE: { value: 0, minValue: 0 },
                oldPyramid: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }
            },
            minLimitQtrGrowth: { Q1: -100, Q2: -100, Q3: -100, Q4: -100 },
            minLimitATM: {
                Q1: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
                Q2: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
                Q3: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
                Q4: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }
            },
            minLimitATU: {
                Q1: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
                Q2: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
                Q3: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
                Q4: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }
            },
            minLimitPRO: {
                Q1: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
                Q2: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
                Q3: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
                Q4: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }
            },
            zeroliveForecastQtrEHC: [],
            zeroLiveForecastEHC: ''
        },
        nextFY: {
            yearOnYearGrowth: { value: 0, minValue: 0, defaultValue: 0 },
            pyramid: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
            oldPyramid: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
            managedAttrition: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
            unmanagedAttrition: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
            promotionsOut: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 },
            Q1: {
                actualMonths: 0, growthPhasing: { value: 0, minValue: 0 }, managedAttrition: { value: 0, minValue: 0 }, unmanagedAttrition: { value: 0, minValue: 0 },
                promotionsOut: { value: 0, minValue: 0 }, pyramid: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }, inQuarterFTE: { value: 0, minValue: 0 },
                oldPyramid: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }
            },
            Q2: {
                actualMonths: 0, growthPhasing: { value: 0, minValue: 0 }, managedAttrition: { value: 0, minValue: 0 }, unmanagedAttrition: { value: 0, minValue: 0 },
                promotionsOut: { value: 0, minValue: 0 }, pyramid: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }, inQuarterFTE: { value: 0, minValue: 0 },
                oldPyramid: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }
            },
            Q3: {
                actualMonths: 0, growthPhasing: { value: 0, minValue: 0 }, managedAttrition: { value: 0, minValue: 0 }, unmanagedAttrition: { value: 0, minValue: 0 },
                promotionsOut: { value: 0, minValue: 0 }, pyramid: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }, inQuarterFTE: { value: 0, minValue: 0 },
                oldPyramid: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }
            },
            Q4: {
                actualMonths: 0, growthPhasing: { value: 0, minValue: 0 }, managedAttrition: { value: 0, minValue: 0 }, unmanagedAttrition: { value: 0, minValue: 0 },
                promotionsOut: { value: 0, minValue: 0 }, pyramid: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }, inQuarterFTE: { value: 0, minValue: 0 },
                oldPyramid: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }
            },
            minLimitQtrGrowth: { Q1: -100, Q2: -100, Q3: -100, Q4: -100 },
            zeroliveForecastQtrEHC: [],
            zeroLiveForecastEHC: ''
        },
        prevFY: {
            Q1: { promotionsOut: { value: 0, minValue: 0 } },
            Q2: { promotionsOut: { value: 0, minValue: 0 } },
            Q3: { promotionsOut: { value: 0, minValue: 0 } },
            Q4: { promotionsOut: { value: 0, minValue: 0 } }
        }
    },
    output: {
        currFY: {
            epg: { percentage: 0 },
            fteGrowth: { inYear: { value: 0, percentage: 0 }, yearOnYear: { value: 0, percentage: 0 } },
            headcount: { EHC: {} },
            BHC: {}, AHC: {}, joiners: {}, promotions: { in: {}, out: {} }, movements: {}, attrition: { managed: {}, unmanaged: {} }, TOTALAHC: {},
            total: {
                managedAttrition: 0, unManagedAttrition: 0, promotions: { out: 0 }, totalAHC: 0, totalEHC: 0, totalBHC: 0, joiners: 0, movements: 0
            },
            actual: { joiners: {}, movements: {} },
            percent: {
                managedAttrition: 0, unManagedAttrition: 0, promotions: { out: 0 },
                BHC: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }
            },
            Q1: {
                EHC: {}, AHC: {}, BHC: {}, joiners: {}, movements: {}, promotionsIn: {}, promotionsOut: {}, unmanagedAttrition: {}, managedAttrition: {},
                percent: { managedAttrition: 0, unmanagedAttrition: 0, promotionsOut: 0, BHC: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 } },
                totalEHC: 0, pyramidindex: 0
            },
            Q2: {
                EHC: {}, AHC: {}, BHC: {}, joiners: {}, movements: {}, promotionsIn: {}, promotionsOut: {}, unmanagedAttrition: {}, managedAttrition: {},
                percent: { managedAttrition: 0, unmanagedAttrition: 0, promotionsOut: 0, BHC: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 } },
                totalEHC: 0, pyramidindex: 0
            },
            Q3: {
                EHC: {}, AHC: {}, BHC: {}, joiners: {}, movements: {}, promotionsIn: {}, promotionsOut: {}, unmanagedAttrition: {}, managedAttrition: {},
                percent: { managedAttrition: 0, unmanagedAttrition: 0, promotionsOut: 0, BHC: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 } },
                totalEHC: 0, pyramidindex: 0
            },
            Q4: {
                EHC: {}, AHC: {}, BHC: {}, joiners: {}, movements: {}, promotionsIn: {}, promotionsOut: {}, unmanagedAttrition: {}, managedAttrition: {},
                percent: { managedAttrition: 0, unmanagedAttrition: 0, promotionsOut: 0, BHC: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 } },
                totalEHC: 0, pyramidindex: 0
            },
            pyramidindex: 0
        },
        nextFY: {
            epg: { percentage: 0 },
            fteGrowth: { inYear: { value: 0, percentage: 0 }, yearOnYear: { value: 0, percentage: 0 } },
            headcount: { EHC: {} },
            BHC: {}, AHC: {}, joiners: {}, promotions: { in: {}, out: {} }, movements: {}, attrition: { managed: {}, unmanaged: {} }, TOTALAHC: {},
            total: {
                managedAttrition: 0, unManagedAttrition: 0, promotions: { out: 0 }, totalAHC: 0, totalEHC: 0, totalBHC: 0, joiners: 0, movements: 0
            },
            actual: { joiners: {}, movements: {} },
            percent: {
                managedAttrition: 0, unManagedAttrition: 0, promotions: { out: 0 },
                BHC: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 }
            },
            Q1: {
                EHC: {}, AHC: {}, BHC: {}, joiners: {}, movements: {}, promotionsIn: {}, promotionsOut: {}, unmanagedAttrition: {}, managedAttrition: {},
                percent: { managedAttrition: 0, unmanagedAttrition: 0, promotionsOut: 0, BHC: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 } },
                totalEHC: 0, pyramidindex: 0
            },
            Q2: {
                EHC: {}, AHC: {}, BHC: {}, joiners: {}, movements: {}, promotionsIn: {}, promotionsOut: {}, unmanagedAttrition: {}, managedAttrition: {},
                percent: { managedAttrition: 0, unmanagedAttrition: 0, promotionsOut: 0, BHC: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 } },
                totalEHC: 0, pyramidindex: 0
            },
            Q3: {
                EHC: {}, AHC: {}, BHC: {}, joiners: {}, movements: {}, promotionsIn: {}, promotionsOut: {}, unmanagedAttrition: {}, managedAttrition: {},
                percent: { managedAttrition: 0, unmanagedAttrition: 0, promotionsOut: 0, BHC: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 } },
                totalEHC: 0, pyramidindex: 0
            },
            Q4: {
                EHC: {}, AHC: {}, BHC: {}, joiners: {}, movements: {}, promotionsIn: {}, promotionsOut: {}, unmanagedAttrition: {}, managedAttrition: {},
                percent: { managedAttrition: 0, unmanagedAttrition: 0, promotionsOut: 0, BHC: { smd: 0, md: 0, sm: 0, m: 0, c: 0, an: 0, as: 0 } },
                totalEHC: 0, pyramidindex: 0
            },
            pyramidindex: 0
        },
        prevFY: { pyramidindex: 0 }
    },
    inputRefreshWarning: ''
};

// Create the slice (reducers should be filled in with your logic)
// ...existing code...
import modelingCalc from '../../../utility/modeling_calc';
import utility from '../../../utility/utility';
import oculusCalc from '../../../utility/oculus_calc';
// import features, getScope, updateState, etc. as needed

const modelingSlice = createSlice({
  name: 'modeling',
  initialState,
  reducers: {
    getModelsHome(state, action) {
      const activeModels = action.payload;
      activeModels[0].data.active.forEach(el => {
        el.isActionsVisible = false;
        el.isDeleted = false;
        el.deactivated = 0;
      });
      activeModels[0].data.archived.forEach(el => {
        el.isActionsVisible = false;
        el.isDeleted = false;
        el.deactivated = 0;
      });
      activeModels[1].data.active.forEach(el => {
        el.isActionsVisible = false;
        el.isDeleted = false;
        el.deactivated = 0;
      });
      activeModels[1].data.archived.forEach(el => {
        el.isActionsVisible = false;
        el.isDeleted = false;
        el.deactivated = 0;
      });
      state.archive = activeModels[0].data.archived;
      state.active = activeModels[0].data.active;
      state.rollup.archive = activeModels[1].data.archived;
      state.rollup.active = activeModels[1].data.active;
    },
    getLiveForecast(state, action) {
      const data = action.payload;
      const currentFY = state.details.fy;
      const previousFY = state.details.fy - 1;
      const nextFY = state.details.nextfy;
      const metricData = modelingCalc.getMissingMonth(data.metricData, nextFY, 'BHC').metricData;
      const epcData = modelingCalc.getMissingMonth(data.epcData, nextFY, 'EPC').metricData;
      const storeData = {};

    // First forecast month
        const currFYFirstForecastMonth = modelingCalc.getFirstForecastMonth(metricData);
        const nextFYFirstForecastMonth = parseInt('20' + (currentFY) + '09');
        // Calculate initial values
        // Input data
        const prevHC = modelingCalc.getHCData(previousFY, currFYFirstForecastMonth, metricData, state.clgs);
        const prevEPC = modelingCalc.getEPCData(previousFY, epcData, prevHC.AHC, state.clgs);
        state.liveForecast.prevFY = utility.mergeDeep(prevHC, prevEPC);

        // Get Headcount data for curr fy and next fy originals
        const currHC = modelingCalc.getHCData(currentFY, currFYFirstForecastMonth, metricData, state.clgs);
        const nextHC = modelingCalc.getHCData(nextFY, nextFYFirstForecastMonth, metricData, state.clgs);
        storeData.currHC = currHC;
        storeData.nextHC = nextHC;

        // Get EPC Data
        const currEPC = modelingCalc.getEPCData(currentFY, epcData, currHC.AHC, state.clgs);
        const nextEPC = modelingCalc.getEPCData(nextFY, epcData, nextHC.AHC, state.clgs);

        storeData.currHC.EPC = currEPC.EPC;
        storeData.nextHC.EPC = nextEPC.EPC;
        updateState(storeData.currHC,state.liveForecast.currFY);
        updateState(storeData.nextHC,state.liveForecast.nextFY);
        state.liveForecast.nextFY.BHC = currHC.EHC;

        // Growth
        // curr and next FY type implenetation for output keeping the above root level object once multi year is completed delete the root level prop
        // IN YEAR Growth
        state.liveOutput.currFY.fteGrowth.inYear = modelingCalc.getInYearGrowth(
            state.liveForecast.currFY.BHC,
            state.liveForecast.currFY.EHC);
        state.liveOutput.nextFY.fteGrowth.inYear = modelingCalc.getInYearGrowth(
            state.liveForecast.nextFY.BHC,
            state.liveForecast.nextFY.EHC);

        // Pyramid
        state.liveInput.currFY.pyramid = modelingCalc.getInitialPyramid(state.liveForecast.currFY.EHC, state.clgs);
        state.liveInput.nextFY.pyramid = modelingCalc.getInitialPyramid(state.liveForecast.nextFY.EHC, state.clgs);

        // initial base bonus for epc
        const ahcCurrData = modelingCalc.getMonthlyAHCData(currentFY, metricData, state.clgs);
        const ahcPrevData = modelingCalc.getMonthlyAHCData(previousFY, metricData, state.clgs);
        const ahcNextData = modelingCalc.getMonthlyAHCData(nextFY, metricData, state.clgs);

        const currLeaderBB = modelingCalc.getInitialLeaderBB(ahcCurrData,state.original.avgRateEPCLeader, currentFY);
        const prevLeaderBB = modelingCalc.getInitialLeaderBB(ahcPrevData,state.original.avgRateEPCLeader, previousFY);
        const nextLeaderBB = modelingCalc.getInitialLeaderBB(ahcNextData,state.original.avgRateEPCLeader, nextFY);
        const epgCurrYr = modelingCalc.getInitialEPGWithLeaderBB(epcData, currentFY, prevLeaderBB, currLeaderBB);
        const epgNextYr = modelingCalc.getInitialEPGWithLeaderBB(epcData, nextFY, currLeaderBB, nextLeaderBB);

        state.liveOutput.currFY.epg = epgCurrYr.percentage;
        state.liveOutput.nextFY.epg = epgNextYr.percentage;

        // Total initial Headcount
        // total AHC calculation for current Fy and next fy
        let totalAHC;
        let totalAHCNextFy;
        totalAHC = modelingCalc.getTotalMetricsValues(state.liveForecast.currFY.AHC);
        totalAHCNextFy = modelingCalc.getTotalMetricsValues(state.liveForecast.nextFY.AHC);
        state.liveOutput.currFY.total.totalAHC = totalAHC;
        state.liveOutput.nextFY.total.totalAHC = totalAHCNextFy;

        // total EHC calculation for current Fy and next fy
        state.liveOutput.currFY.total.totalEHC = modelingCalc.getTotalMetricsValues(state.liveForecast.currFY.EHC);
        state.liveOutput.nextFY.total.totalEHC = modelingCalc.getTotalMetricsValues(state.liveForecast.nextFY.EHC);

        // total BHC calculation for current Fy and next fy
        const totalBHC = modelingCalc.getTotalMetricsValues(state.liveForecast.currFY.BHC);
        const totalBHCNextFy = modelingCalc.getTotalMetricsValues(state.liveForecast.currFY.EHC);
        state.liveOutput.currFY.total.totalBHC = totalBHC;
        state.liveOutput.nextFY.total.totalBHC = totalBHCNextFy;

        // Joiners
        // calculation for current FY and next FY
        // Calculate total joiners for current FY and next fy
        if (features.oct22JoinersImprovementSimulator) {
            const initialJOI = modelingCalc.getFilterDataByMetric(metricData,state.clgs,'JOI',currentFY);
            const initialJOINextFY = modelingCalc.getFilterDataByMetric(metricData, state.clgs, 'JOI',nextFY);
            const initialVJO = modelingCalc.getFilterDataByMetric(metricData,state.clgs,'VJO',currentFY);
            const initialVJONextFY = modelingCalc.getFilterDataByMetric(metricData, state.clgs, 'VJO',nextFY);
            const initialIJO = modelingCalc.getFilterDataByMetric(metricData,state.clgs,'IJO',currentFY);
            const initialIJONextFY = modelingCalc.getFilterDataByMetric(metricData, state.clgs, 'IJO',nextFY);
            const initialJoiners = utility.sumOfObj(initialJOI, initialVJO, initialIJO);
            const initialJoinersNextFY = utility.sumOfObj(initialJOINextFY, initialVJONextFY, initialIJONextFY);
            state.liveForecast.currFY.joiners = initialJoiners;
            state.liveForecast.nextFY.joiners = initialJoinersNextFY;
            state.liveOutput.currFY.total.joiners = modelingCalc.getTotalMetricsValues(initialJoiners);
            state.liveOutput.nextFY.total.joiners = modelingCalc.getTotalMetricsValues(initialJoinersNextFY);
        } else {
            const initialJoiners = modelingCalc.getFilterDataByMetric(metricData,state.clgs,'JOI',currentFY);
            const initialJoinersNextFY = modelingCalc.getFilterDataByMetric(metricData, state.clgs, 'JOI',nextFY);
            state.liveForecast.currFY.joiners = initialJoiners;
            state.liveForecast.nextFY.joiners = initialJoinersNextFY;
            state.liveOutput.currFY.total.joiners = modelingCalc.getTotalMetricsValues(initialJoiners);
            state.liveOutput.nextFY.total.joiners = modelingCalc.getTotalMetricsValues(initialJoinersNextFY);
        }

        // Promotions
        // Calculation for current FY and next fy
        const initialPromotionsOut = modelingCalc.getInitialPromotionsOut(metricData, state.clgs, currentFY);
        const initialPromotionsOutNextFY = modelingCalc.getInitialPromotionsOut(metricData, state.clgs, nextFY);
        state.liveForecast.currFY.promotions.out = initialPromotionsOut;
        state.liveForecast.nextFY.promotions.out = initialPromotionsOutNextFY;
        // Initial Input Promotions calculation for curr fy and next fy
        const initialInputPromotionsOut = modelingCalc.getInitialInputPromotionsOut(initialPromotionsOut, state.liveForecast.currFY.BHC, state.clgs);
        const initialInputPromotionsOutNextFY = modelingCalc.getInitialInputPromotionsOut(initialPromotionsOutNextFY, state.liveForecast.currFY.EHC, state.clgs);
        state.liveInput.currFY.promotionsOut = initialInputPromotionsOut;
        state.liveInput.nextFY.promotionsOut = initialInputPromotionsOutNextFY;
        // total promotion calculation for current Fy and next fy
        const totalPromotionsOut = modelingCalc.getTotalMetricsValues(initialPromotionsOut);
        const totalPromotionsNextFyOut = modelingCalc.getTotalMetricsValues(initialPromotionsOutNextFY);
        state.liveOutput.currFY.total.promotions.out = totalPromotionsOut;
        state.liveOutput.nextFY.total.promotions.out = totalPromotionsNextFyOut;
        // total percentage for promotion calculation for current Fy and next fy
        state.liveOutput.currFY.percent.promotions.out = modelingCalc.getPercentage(totalBHC, totalPromotionsOut);
        state.liveOutput.nextFY.percent.promotions.out = modelingCalc.getPercentage(totalBHCNextFy, totalPromotionsNextFyOut);

        // Movements
        // Calculation for Current FY and next fy
        const initialMovements = modelingCalc.getInitialMovements(metricData, state.clgs, currentFY, 'currFY', true);
        const initialMovementsNextFY = modelingCalc.getInitialMovements(metricData, state.clgs, nextFY, 'nextFY', true);
        state.liveForecast.currFY.movements = initialMovements;
        state.liveForecast.nextFY.movements = initialMovementsNextFY;
        // total Movement calculation for current fy and next fy
        state.liveOutput.currFY.total.movements = modelingCalc.getTotalMetricsValues(initialMovements);
        state.liveOutput.nextFY.total.movements = modelingCalc.getTotalMetricsValues(initialMovementsNextFY);

        // Attrition
        // Managed Attrition
        // Calculation for current FY and next fy
        const initialManagedAttrition = modelingCalc.getFilterDataByMetric(metricData,state.clgs,'ATM',currentFY);
        const initialManagedAttritionNextFY = modelingCalc.getFilterDataByMetric(metricData,state.clgs,'ATM',nextFY);
        state.liveForecast.currFY.attrition.managed = initialManagedAttrition;
        state.liveForecast.nextFY.attrition.managed = initialManagedAttritionNextFY;
        // Initial Input calculation for current fy and next fy
        state.liveInput.currFY.managedAttrition = modelingCalc.getInitialInputAttrition(initialManagedAttrition, state.liveForecast.currFY.AHC, state.clgs);
        state.liveInput.nextFY.managedAttrition = modelingCalc.getInitialInputAttrition(initialManagedAttritionNextFY, state.liveForecast.nextFY.AHC, state.clgs);
        // total managed attrition calculation for current Fy and next fy
        const totalManagedAttrition = modelingCalc.getTotalMetricsValues(initialManagedAttrition);
        const totalManagedAttritionNextFy = modelingCalc.getTotalMetricsValues(initialManagedAttritionNextFY);
        state.liveOutput.currFY.total.managedAttrition = totalManagedAttrition;
        state.liveOutput.nextFY.total.managedAttrition = totalManagedAttritionNextFy;
        // calcualte percentage managed attrition calculation for current Fy and next fy
        state.liveOutput.currFY.percent.managedAttrition = modelingCalc.getPercentage(totalAHC, totalManagedAttrition);
        state.liveOutput.nextFY.percent.managedAttrition = modelingCalc.getPercentage(totalAHCNextFy, totalManagedAttritionNextFy);

        // unManagedAttrition
        // calculation of current FY and next FY
        const initialUnmanagedAttrition = modelingCalc.getFilterDataByMetric(metricData,state.clgs,'ATU',currentFY);
        const initialUnmanagedAttritionNextFY = modelingCalc.getFilterDataByMetric(metricData,state.clgs,'ATU',nextFY);
        state.liveForecast.currFY.attrition.unmanaged = initialUnmanagedAttrition;
        state.liveForecast.nextFY.attrition.unmanaged = initialUnmanagedAttritionNextFY;
        // Initial Input calculation for current fy and next fy
        state.liveInput.currFY.unmanagedAttrition = modelingCalc.getInitialInputAttrition(initialUnmanagedAttrition, state.liveForecast.currFY.AHC, state.clgs);
        state.liveInput.nextFY.unmanagedAttrition = modelingCalc.getInitialInputAttrition(initialUnmanagedAttritionNextFY, state.liveForecast.nextFY.AHC, state.clgs);
        // total calculation for current Fy and next fy
        const totalUnManagedAttrition = modelingCalc.getTotalMetricsValues(initialUnmanagedAttrition);
        const totalUnManagedAttritionNextFy = modelingCalc.getTotalMetricsValues(initialUnmanagedAttritionNextFY);
        state.liveOutput.currFY.total.unManagedAttrition = totalUnManagedAttrition;
        state.liveOutput.nextFY.total.unManagedAttrition = totalUnManagedAttritionNextFy;
        // calcualte percentage for current Fy and next fy
        state.liveOutput.currFY.percent.unManagedAttrition = modelingCalc.getPercentage(totalAHC, totalUnManagedAttrition);
        state.liveOutput.nextFY.percent.unManagedAttrition = modelingCalc.getPercentage(totalAHCNextFy, totalUnManagedAttritionNextFy);

        // Live forecast for Quarter View

        const qtrCurrFY = modelingCalc.getQuarter(currentFY);
        const qtrNextFY = modelingCalc.getQuarter(nextFY);

        // FTE VIEW
        // EHC/BHC/AHC by quarter
        const currQuarterHC = modelingCalc.getQuaterHCData(qtrCurrFY,currentFY, metricData, state.clgs);
        const nextQuarterHC = modelingCalc.getQuaterHCData(qtrNextFY, nextFY,metricData, state.clgs);
        [state.liveOutput.currFY.Q1.EHC, state.liveOutput.currFY.Q2.EHC, state.liveOutput.currFY.Q3.EHC, state.liveOutput.currFY.Q4.EHC] = currQuarterHC.ehcQtr;
        [state.liveOutput.nextFY.Q1.EHC, state.liveOutput.nextFY.Q2.EHC, state.liveOutput.nextFY.Q3.EHC, state.liveOutput.nextFY.Q4.EHC] = nextQuarterHC.ehcQtr;

        [state.liveOutput.currFY.Q1.BHC, state.liveOutput.currFY.Q2.BHC, state.liveOutput.currFY.Q3.BHC, state.liveOutput.currFY.Q4.BHC] = currQuarterHC.bhcQtr;
        [state.liveOutput.nextFY.Q1.BHC, state.liveOutput.nextFY.Q2.BHC, state.liveOutput.nextFY.Q3.BHC, state.liveOutput.nextFY.Q4.BHC] = nextQuarterHC.bhcQtr;
        // mar 23 in qtr feature implementation
        // PREV FY
        const prevFYAHC = modelingCalc.calculateQuarterAHC(null,null,previousFY, metricData, state.clgs);
        state.liveOutput.prevFY.Q1.AHC = prevFYAHC[0];
        state.liveOutput.prevFY.Q2.AHC = prevFYAHC[1];
        state.liveOutput.prevFY.Q3.AHC = prevFYAHC[2];
        state.liveOutput.prevFY.Q4.AHC = prevFYAHC[3];
        state.liveOutput.prevFY.AHC = modelingCalc.calculateTotalAvgAHC(state.liveOutput.prevFY.Q1.AHC,
            state.liveOutput.prevFY.Q2.AHC,state.liveOutput.prevFY.Q3.AHC,state.liveOutput.prevFY.Q4.AHC,state.clgs);

        // CURR FY
        const currFYAHC = modelingCalc.calculateQuarterAHC(currQuarterHC.ehcQtr,currQuarterHC.bhcQtr,currentFY, metricData, state.clgs);
        state.liveOutput.currFY.Q1.AHC = currFYAHC[0];
        state.liveOutput.currFY.Q2.AHC = currFYAHC[1];
        state.liveOutput.currFY.Q3.AHC = currFYAHC[2];
        state.liveOutput.currFY.Q4.AHC = currFYAHC[3];
        state.liveOutput.currFY.AHC = modelingCalc.calculateTotalAvgAHC(state.liveOutput.currFY.Q1.AHC,
            state.liveOutput.currFY.Q2.AHC,state.liveOutput.currFY.Q3.AHC,state.liveOutput.currFY.Q4.AHC,state.clgs);

        // NEXT FY
        state.liveOutput.nextFY.Q1.AHC = modelingCalc.calculateAHCNextFYQuarter(nextQuarterHC.bhcQtr[0],nextQuarterHC.ehcQtr[0],state.clgs);
        state.liveOutput.nextFY.Q2.AHC = modelingCalc.calculateAHCNextFYQuarter(nextQuarterHC.bhcQtr[1],nextQuarterHC.ehcQtr[1],state.clgs);
        state.liveOutput.nextFY.Q3.AHC = modelingCalc.calculateAHCNextFYQuarter(nextQuarterHC.bhcQtr[2],nextQuarterHC.ehcQtr[2],state.clgs);
        state.liveOutput.nextFY.Q4.AHC = modelingCalc.calculateAHCNextFYQuarter(nextQuarterHC.bhcQtr[3],nextQuarterHC.ehcQtr[3],state.clgs);
        state.liveOutput.nextFY.AHC = modelingCalc.calculateTotalAvgAHC(state.liveOutput.nextFY.Q1.AHC,
            state.liveOutput.nextFY.Q2.AHC,state.liveOutput.nextFY.Q3.AHC,state.liveOutput.nextFY.Q4.AHC,state.clgs);

        // Total initial Headcount
        // total AHC calculation for PrevFY, CurrentFY and NextFY
        const totalAHCPrevFy = modelingCalc.getTotalMetricsValues(state.liveOutput.prevFY.AHC);
        totalAHC = modelingCalc.getTotalMetricsValues(state.liveOutput.currFY.AHC);
        totalAHCNextFy = modelingCalc.getTotalMetricsValues(state.liveOutput.nextFY.AHC);
        state.liveOutput.prevFY.total.totalAHC = totalAHCPrevFy;
        state.liveOutput.currFY.total.totalAHC = totalAHC;
        state.liveOutput.nextFY.total.totalAHC = totalAHCNextFy;

        state.liveForecast.prevFY.AHC = state.liveOutput.prevFY.AHC;
        state.liveForecast.currFY.AHC = state.liveOutput.currFY.AHC;
        state.liveForecast.nextFY.AHC = state.liveOutput.nextFY.AHC;

        // YOY Growth
        state.liveOutput.currFY.fteGrowth.yearOnYear = modelingCalc.getYoYGrowth(
            state.liveForecast.prevFY.AHC,
            state.liveForecast.currFY.AHC);
        state.liveOutput.nextFY.fteGrowth.yearOnYear = modelingCalc.getYoYGrowth(
            state.liveForecast.currFY.AHC,
            state.liveForecast.nextFY.AHC);

        // Joiners by Quarter
        const initialJoinersQtr = features.oct22JoinersImprovementSimulator ? modelingCalc.getFilterDataByMetricQuarter(metricData,state.clgs,['JOI','VJO','IJO'], qtrCurrFY) :
            modelingCalc.getFilterDataByMetricQuarter(metricData,state.clgs,'JOI', qtrCurrFY);
        const initialJoinersNextFYQtr = features.oct22JoinersImprovementSimulator ? modelingCalc.getFilterDataByMetricQuarter(metricData, state.clgs,['JOI','VJO','IJO'], qtrNextFY) :
            modelingCalc.getFilterDataByMetricQuarter(metricData, state.clgs, 'JOI', qtrNextFY);
        [state.liveOutput.currFY.Q1.joiners, state.liveOutput.currFY.Q2.joiners, state.liveOutput.currFY.Q3.joiners, state.liveOutput.currFY.Q4.joiners] = initialJoinersQtr;
        [state.liveOutput.nextFY.Q1.joiners, state.liveOutput.nextFY.Q2.joiners,state.liveOutput.nextFY.Q3.joiners, state.liveOutput.nextFY.Q4.joiners] = initialJoinersNextFYQtr;

        // Promotions Out by Quarter
        const initialPromotionsOutQtr = modelingCalc.getInitialPromotionsOutQuarter(metricData, state.clgs, qtrCurrFY);
        const initialPromotionsOutNextFYQtr = modelingCalc.getInitialPromotionsOutQuarter(metricData, state.clgs, qtrNextFY);
        [state.liveOutput.currFY.Q1.promotionsOut, state.liveOutput.currFY.Q2.promotionsOut,
            state.liveOutput.currFY.Q3.promotionsOut, state.liveOutput.currFY.Q4.promotionsOut] = initialPromotionsOutQtr;
        [state.liveOutput.nextFY.Q1.promotionsOut, state.liveOutput.nextFY.Q2.promotionsOut,
            state.liveOutput.nextFY.Q3.promotionsOut, state.liveOutput.nextFY.Q4.promotionsOut] = initialPromotionsOutNextFYQtr;

        // Movements by Quarter
        const initialMovementsQtr = modelingCalc.getInitialMovementsQuarter(metricData, state.clgs, currentFY);
        const initialMovementsNextFYQtr = modelingCalc.getInitialMovementsQuarter(metricData, state.clgs, nextFY);
        [state.liveOutput.currFY.Q1.movements, state.liveOutput.currFY.Q2.movements, state.liveOutput.currFY.Q3.movements, state.liveOutput.currFY.Q4.movements] = initialMovementsQtr;
        [state.liveOutput.nextFY.Q1.movements, state.liveOutput.nextFY.Q2.movements,state.liveOutput.nextFY.Q3.movements, state.liveOutput.nextFY.Q4.movements] = initialMovementsNextFYQtr;

        // Managed Attrition by Quarter
        const initialManagedAttritionQtr = modelingCalc.getFilterDataByMetricQuarter(metricData,state.clgs,'ATM',qtrCurrFY);
        const initialManagedAttritionNextFYQtr =  modelingCalc.getFilterDataByMetricQuarter(metricData,state.clgs,'ATM',qtrNextFY);
        [state.liveOutput.currFY.Q1.managedAttrition, state.liveOutput.currFY.Q2.managedAttrition,
            state.liveOutput.currFY.Q3.managedAttrition, state.liveOutput.currFY.Q4.managedAttrition] = initialManagedAttritionQtr;
        [state.liveOutput.nextFY.Q1.managedAttrition, state.liveOutput.nextFY.Q2.managedAttrition,
            state.liveOutput.nextFY.Q3.managedAttrition, state.liveOutput.nextFY.Q4.managedAttrition] = initialManagedAttritionNextFYQtr;

        // UnManaged Attrition by Quarter
        const initialUnmanagedAttritionQtr = modelingCalc.getFilterDataByMetricQuarter(metricData,state.clgs,'ATU',qtrCurrFY);
        const initialUnmanagedAttritionNextFYQtr =  modelingCalc.getFilterDataByMetricQuarter(metricData,state.clgs,'ATU',qtrNextFY);
        [state.liveOutput.currFY.Q1.unmanagedAttrition, state.liveOutput.currFY.Q2.unmanagedAttrition,
            state.liveOutput.currFY.Q3.unmanagedAttrition, state.liveOutput.currFY.Q4.unmanagedAttrition] = initialUnmanagedAttritionQtr;
        [state.liveOutput.nextFY.Q1.unmanagedAttrition, state.liveOutput.nextFY.Q2.unmanagedAttrition,
            state.liveOutput.nextFY.Q3.unmanagedAttrition, state.liveOutput.nextFY.Q4.unmanagedAttrition] = initialUnmanagedAttritionNextFYQtr;
        // PERCENT VIEW
        // Pyramid (EHC)
        state.liveInput.currFY.Q1.pyramid = modelingCalc.getInitialPyramid(state.liveOutput.currFY.Q1.EHC, state.clgs);
        state.liveInput.nextFY.Q1.pyramid = modelingCalc.getInitialPyramid(state.liveOutput.nextFY.Q1.EHC, state.clgs);
        state.liveInput.currFY.Q2.pyramid = modelingCalc.getInitialPyramid(state.liveOutput.currFY.Q2.EHC, state.clgs);
        state.liveInput.nextFY.Q2.pyramid = modelingCalc.getInitialPyramid(state.liveOutput.nextFY.Q2.EHC, state.clgs);
        state.liveInput.currFY.Q3.pyramid = modelingCalc.getInitialPyramid(state.liveOutput.currFY.Q3.EHC, state.clgs);
        state.liveInput.nextFY.Q3.pyramid = modelingCalc.getInitialPyramid(state.liveOutput.nextFY.Q3.EHC, state.clgs);
        state.liveInput.currFY.Q4.pyramid = modelingCalc.getInitialPyramid(state.liveOutput.currFY.Q4.EHC, state.clgs);
        state.liveInput.nextFY.Q4.pyramid = modelingCalc.getInitialPyramid(state.liveOutput.nextFY.Q4.EHC, state.clgs);

        // Promotions
        [state.liveOutput.currFY.Q1.percent.promotionsOut, state.liveOutput.currFY.Q2.percent.promotionsOut, state.liveOutput.currFY.Q3.percent.promotionsOut,
            state.liveOutput.currFY.Q4.percent.promotionsOut] =  modelingCalc.getQuarterPercentage(state.liveOutput.currFY,state.liveOutput.currFY,'BHC','promotionsOut');
        [state.liveOutput.nextFY.Q1.percent.promotionsOut, state.liveOutput.nextFY.Q2.percent.promotionsOut, state.liveOutput.nextFY.Q3.percent.promotionsOut,
            state.liveOutput.nextFY.Q4.percent.promotionsOut] =  modelingCalc.getQuarterPercentage(state.liveOutput.nextFY,state.liveOutput.nextFY,'BHC','promotionsOut');
        // Managed Attrition
        [state.liveOutput.currFY.Q1.percent.managedAttrition, state.liveOutput.currFY.Q2.percent.managedAttrition, state.liveOutput.currFY.Q3.percent.managedAttrition,
            state.liveOutput.currFY.Q4.percent.managedAttrition] =  modelingCalc.getQuarterPercentage(state.liveOutput.currFY,state.liveOutput.currFY,'AHC','managedAttrition',4);
        [state.liveOutput.nextFY.Q1.percent.managedAttrition, state.liveOutput.nextFY.Q2.percent.managedAttrition, state.liveOutput.nextFY.Q3.percent.managedAttrition,
            state.liveOutput.nextFY.Q4.percent.managedAttrition] =  modelingCalc.getQuarterPercentage(state.liveOutput.nextFY,state.liveOutput.nextFY,'AHC','managedAttrition',4);

        // UnManaged Attrition
        [state.liveOutput.currFY.Q1.percent.unmanagedAttrition, state.liveOutput.currFY.Q2.percent.unmanagedAttrition, state.liveOutput.currFY.Q3.percent.unmanagedAttrition,
            state.liveOutput.currFY.Q4.percent.unmanagedAttrition] =  modelingCalc.getQuarterPercentage(state.liveOutput.currFY,state.liveOutput.currFY,'AHC','unmanagedAttrition',4);
        [state.liveOutput.nextFY.Q1.percent.unmanagedAttrition, state.liveOutput.nextFY.Q2.percent.unmanagedAttrition, state.liveOutput.nextFY.Q3.percent.unmanagedAttrition,
            state.liveOutput.nextFY.Q4.percent.unmanagedAttrition] =  modelingCalc.getQuarterPercentage(state.liveOutput.nextFY,state.liveOutput.nextFY,'AHC','unmanagedAttrition',4);

        // BHC Percentage for FY and QTR

        state.liveOutput.currFY.percent.BHC = modelingCalc.getBHCFYPercent(storeData.currHC.BHC,state.clgs,false);
        state.liveOutput.nextFY.percent.BHC = modelingCalc.getBHCFYPercent(storeData.nextHC.BHC,state.clgs,false);
        [state.liveOutput.currFY.Q1.percent.BHC, state.liveOutput.currFY.Q2.percent.BHC, state.liveOutput.currFY.Q3.percent.BHC,
            state.liveOutput.currFY.Q4.percent.BHC] = modelingCalc.getBHCFYPercent(state.liveOutput.currFY,state.clgs,true);
        [state.liveOutput.nextFY.Q1.percent.BHC, state.liveOutput.nextFY.Q2.percent.BHC, state.liveOutput.nextFY.Q3.percent.BHC,
            state.liveOutput.nextFY.Q4.percent.BHC] = modelingCalc.getBHCFYPercent(state.liveOutput.nextFY,state.clgs,true);

        // In-Q Live Forecast Model level EPG calc
        if (!data.oculusFlag) {

            state.liveForecast.prevFY.BB = modelingCalc.getInitialBB(metricData,previousFY,state.clgs);
            state.liveForecast.prevFY.EPCRate  = modelingCalc.calculateInitialEPCRate(state.liveForecast.prevFY.AHC,state.liveForecast.prevFY.BB,state.clgs,state.details.modeling_type);

            // get the BB value for BB /EPC rate calculation for new epc calculation value
            state.liveForecast.currFY.BB = modelingCalc.getInitialBB(metricData,currentFY,state.clgs);
            state.liveForecast.currFY.EPCRate = modelingCalc.calculateInitialEPCRate(state.liveForecast.currFY.AHC,state.liveForecast.currFY.BB,state.clgs,state.details.modeling_type);

            // get the BB value for BB /EPC rate calculation for new epc calculation value
            state.liveForecast.nextFY.BB = modelingCalc.getInitialBB(metricData,nextFY,state.clgs);
            state.liveForecast.nextFY.EPCRate  = modelingCalc.calculateInitialEPCRate(state.liveForecast.nextFY.AHC,state.liveForecast.nextFY.BB,state.clgs,state.details.modeling_type);

            state.original.avgRateEPCLeader = data.avgRate;
            state.details.maCost = data.maCost;

            const combinedData = [].concat(metricData, epcData);
            const prevFYQtr = modelingCalc.calculateQtrwiseEPC(combinedData, previousFY, state.liveForecast.prevFY.EPCRate, state.original.avgRateEPCLeader, state.details.maCost,
                state.liveOutput.prevFY);
            const currFYQtr = modelingCalc.calculateQtrwiseEPC(combinedData, currentFY, state.liveForecast.currFY.EPCRate, state.original.avgRateEPCLeader, state.details.maCost,
                state.liveOutput.currFY);
            const nextFYQtr = modelingCalc.calculateQtrwiseEPC(combinedData, nextFY, state.liveForecast.nextFY.EPCRate, state.original.avgRateEPCLeader, state.details.maCost,
                state.liveOutput.nextFY);

            state.liveForecast.prevFY.EPC = modelingCalc.sumUpQtrToFY(prevFYQtr);
            state.liveForecast.currFY.EPC = modelingCalc.sumUpQtrToFY(currFYQtr);
            state.liveForecast.nextFY.EPC = modelingCalc.sumUpQtrToFY(nextFYQtr);

            const currFYEPG = modelingCalc.calculateNewEPGWithLeaderData(state.liveForecast.currFY.EPC, state.liveForecast.prevFY.EPC, null, null, state.details.modeling_type);
            const nextFYEPG = modelingCalc.calculateNewEPGWithLeaderData(state.liveForecast.nextFY.EPC, state.liveForecast.currFY.EPC, null, null, state.details.modeling_type);
            state.liveOutput.currFY.epg = currFYEPG.percentage;
            state.liveOutput.nextFY.epg = nextFYEPG.percentage;
        }
        // In-Q Live Forecast Oculus level EPG calc
        if (data.oculusFlag) {
            // make avg rate zero for country level
            if (state.details.iscountrylevel) {
                data.avgRateArr.reduce((prev, cur) => {
                    cur.reduce((previous, current) => {
                        current.avgrate = 0;
                    }, []);
                }, []);
            }
            var ahcCurrDataQtrArr = [];
            var ahcPrevDataQtrArr = [];
            var ahcNextDataQtrArr = [];

            var currLeaderQtrBBArr = [];
            var prevLeaderQtrBBArr = [];
            var nextLeaderQtrBBArr = [];

            var currEPCRateQtrBBArr = [];
            var prevEPCRateQtrBBArr = [];
            var nextEPCRateQtrBBArr = [];

            var currQuarterHCArr = [];
            var nextQuarterHCArr = [];

            const currQtrwisemanagedAttr = [];
            const nextQtrwisemanagedAttr = [];

            const qtrCurrOculusFY = modelingCalc.getQuarter(currentFY);
            const qtrNextOculusFY = modelingCalc.getQuarter(nextFY);

            var metricDataArrInQ = [];
            var epcDataArrInQ = [];

            data.metricDataArr.reduce((prev, cur) => {
                /* metricData for all models in an array format */
                metricDataArrInQ.push(modelingCalc.getMissingMonth(cur,nextFY,'BHC').metricData);
            }, []);
            data.epcDataArr.reduce((prev, cur) => {
                /* epcData for all models in an array format */
                epcDataArrInQ.push(modelingCalc.getMissingMonth(cur,nextFY,'EPC').metricData);
            }, []);

            // calculate AHC/BB/Unmanaged attrition for each model
            metricDataArrInQ.reduce((prev, cur, index) => {
                currQuarterHCArr.push(modelingCalc.getQuaterHCData(qtrCurrOculusFY,currentFY, cur, state.clgs));
                nextQuarterHCArr.push(modelingCalc.getQuaterHCData(qtrNextOculusFY, nextFY,cur, state.clgs));

                // AHC calculation
                ahcPrevDataQtrArr.push(modelingCalc.calculateQuarterAHC(null,null,previousFY, cur, state.clgs));
                ahcCurrDataQtrArr.push(modelingCalc.calculateQuarterAHC(currQuarterHCArr[index].ehcQtr,currQuarterHCArr[index].bhcQtr,currentFY, cur, state.clgs));
                ahcNextDataQtrArr.push(modelingCalc.calculateQuarterAHC(nextQuarterHCArr[index].ehcQtr,nextQuarterHCArr[index].bhcQtr,nextFY, cur, state.clgs));

                currLeaderQtrBBArr.push(modelingCalc.getInitialBB(cur,currentFY,state.clgs));
                prevLeaderQtrBBArr.push(modelingCalc.getInitialBB(cur,previousFY,state.clgs));
                nextLeaderQtrBBArr.push(modelingCalc.getInitialBB(cur,nextFY,state.clgs));

                currQtrwisemanagedAttr.push(modelingCalc.getFilterDataByMetricQuarter(cur,state.clgs,'ATM',qtrCurrFY));
                nextQtrwisemanagedAttr.push(modelingCalc.getFilterDataByMetricQuarter(cur,state.clgs,'ATM',qtrNextFY));
            }, []);

            var ahcPrevAvgArr = [];
            var ahcCurrAvgArr = [];
            var ahcNextAvgArr = [];

            ahcCurrDataQtrArr.reduce((prev, cur) => {
                ahcCurrAvgArr.push(modelingCalc.calculateTotalAvgAHC(cur[0], cur[1], cur[2], cur[3], state.clgs));
            }, []);
            ahcCurrAvgArr.reduce((prev, cur, index) => {
                currEPCRateQtrBBArr.push(modelingCalc.calculateInitialEPCRate(cur,currLeaderQtrBBArr[index],state.clgs,state.details.modeling_type));
            }, []);

            ahcPrevDataQtrArr.reduce((prev, cur) => {
                ahcPrevAvgArr.push(modelingCalc.calculateTotalAvgAHC(cur[0], cur[1], cur[2], cur[3], state.clgs));
            }, []);
            ahcPrevAvgArr.reduce((prev, cur, index) => {
                prevEPCRateQtrBBArr.push(modelingCalc.calculateInitialEPCRate(cur,prevLeaderQtrBBArr[index],state.clgs,state.details.modeling_type));
            }, []);

            ahcNextDataQtrArr.reduce((prev, cur) => {
                ahcNextAvgArr.push(modelingCalc.calculateTotalAvgAHC(cur[0], cur[1], cur[2], cur[3], state.clgs));
            }, []);

            ahcNextAvgArr.reduce((prev, cur, index) => {
                nextEPCRateQtrBBArr.push(modelingCalc.calculateInitialEPCRate(cur,nextLeaderQtrBBArr[index],state.clgs,state.details.modeling_type));
            }, []);

            var combinedDataArr = [];
            metricDataArrInQ.reduce((prev, cur, index) => {
                combinedDataArr.push([].concat(cur, epcDataArrInQ[index]));
            }, []);

            var prevFYQtrwise = [];
            var currFYQtrwise = [];
            var nextFYQtrwise = [];

            const avgRateArrInQ = data.avgRateArr;
            combinedDataArr.reduce((prev, cur, index) => {
                // Creating object similar to store
                const prevStoreObj = {
                    Q1: {AHC: ahcPrevDataQtrArr[index][0], managedAttrition: {}},
                    Q2: {AHC: ahcPrevDataQtrArr[index][1], managedAttrition: {}},
                    Q3: {AHC: ahcPrevDataQtrArr[index][2], managedAttrition: {}},
                    Q4: {AHC: ahcPrevDataQtrArr[index][3], managedAttrition: {}}
                };
                const currStoreObj = {
                    Q1: {AHC: ahcCurrDataQtrArr[index][0], managedAttrition: currQtrwisemanagedAttr[index][0]},
                    Q2: {AHC: ahcCurrDataQtrArr[index][1], managedAttrition: currQtrwisemanagedAttr[index][1]},
                    Q3: {AHC: ahcCurrDataQtrArr[index][2], managedAttrition: currQtrwisemanagedAttr[index][2]},
                    Q4: {AHC: ahcCurrDataQtrArr[index][3], managedAttrition: currQtrwisemanagedAttr[index][3]}
                };
                const nextStoreObj = {
                    Q1: {AHC: ahcNextDataQtrArr[index][0], managedAttrition: nextQtrwisemanagedAttr[index][0]},
                    Q2: {AHC: ahcNextDataQtrArr[index][1], managedAttrition: nextQtrwisemanagedAttr[index][1]},
                    Q3: {AHC: ahcNextDataQtrArr[index][2], managedAttrition: nextQtrwisemanagedAttr[index][2]},
                    Q4: {AHC: ahcNextDataQtrArr[index][3], managedAttrition: nextQtrwisemanagedAttr[index][3]}
                };
                if (features.may23LiveForecastEPGMismatch) {
                    prevFYQtrwise.push(modelingCalc.calculateQtrwiseEPC(cur, previousFY, prevEPCRateQtrBBArr[index], avgRateArrInQ[index], state.details.maCostModels[index], prevStoreObj,true));
                    currFYQtrwise.push(modelingCalc.calculateQtrwiseEPC(cur, currentFY, currEPCRateQtrBBArr[index], avgRateArrInQ[index], state.details.maCostModels[index], currStoreObj,true));
                    nextFYQtrwise.push(modelingCalc.calculateQtrwiseEPC(cur, nextFY, nextEPCRateQtrBBArr[index], avgRateArrInQ[index], state.details.maCostModels[index], nextStoreObj,true));
                }
                else
                {
                    prevFYQtrwise.push(modelingCalc.calculateQtrwiseEPC(cur, previousFY, prevEPCRateQtrBBArr[index], avgRateArrInQ[index], state.details.maCost, prevStoreObj));
                    currFYQtrwise.push(modelingCalc.calculateQtrwiseEPC(cur, currentFY, currEPCRateQtrBBArr[index], avgRateArrInQ[index], state.details.maCost, currStoreObj));
                    nextFYQtrwise.push(modelingCalc.calculateQtrwiseEPC(cur, nextFY, nextEPCRateQtrBBArr[index], avgRateArrInQ[index], state.details.maCost, nextStoreObj));
                }
            }, []);

            var originalprevFYEPC = [];
            var originalcurrFYEPC = [];
            var originalnextFYEPC = [];

            prevFYQtrwise.reduce((prev, cur) => {
                originalprevFYEPC.push(modelingCalc.sumUpQtrToFY(cur));
            }, []);
            currFYQtrwise.reduce((prev, cur) => {
                originalcurrFYEPC.push(modelingCalc.sumUpQtrToFY(cur));
            }, []);
            nextFYQtrwise.reduce((prev, cur) => {
                originalnextFYEPC.push(modelingCalc.sumUpQtrToFY(cur));
            }, []);

            var currQtrFYEPG = [];
            var nextQtrFYEPG = [];

            originalcurrFYEPC.reduce((prev, cur, index) => {
                currQtrFYEPG.push(modelingCalc.calculateNewEPGWithLeaderData(cur, originalprevFYEPC[index], null, null, state.details.modeling_type));
                nextQtrFYEPG.push(modelingCalc.calculateNewEPGWithLeaderData(originalnextFYEPC[index], cur, null, null, state.details.modeling_type));
            }, []);

            const epgCurrQtrTotal = currQtrFYEPG.reduce((prev, cur,index) => {
                if (index == 0) {
                    prev.epgCurrYr = 0;
                    prev.epgPrevYr = 0;
                }
                prev.epgCurrYr = prev.epgCurrYr + cur.epgCurrYr;
                prev.epgPrevYr = prev.epgPrevYr + cur.epgPrevYr;
                return prev;
            }, []);

            const epgNextQtrTotal = nextQtrFYEPG.reduce((prev, cur, index) => {
                if (index == 0) {
                    prev.epgCurrYr = 0;
                    prev.epgPrevYr = 0;
                }
                prev.epgCurrYr = prev.epgCurrYr + cur.epgCurrYr;
                prev.epgPrevYr = prev.epgPrevYr + cur.epgPrevYr;
                return prev;
            }, []);

            state.liveOutput.currFY.epg = oculusCalc.getPercentage(epgCurrQtrTotal.epgCurrYr,epgCurrQtrTotal.epgPrevYr);
            state.liveOutput.nextFY.epg = oculusCalc.getPercentage(epgNextQtrTotal.epgCurrYr,epgNextQtrTotal.epgPrevYr);
        }
        if (features.oct23PyramidIndexSimulator) {
            state.liveForecast.prevFY.mlData = modelingCalc.getMLDataByMetric(metricData, state.details.fy - 1);
            state.liveForecast.currFY.mlData = modelingCalc.getMLDataByMetric(metricData, state.details.fy);
            state.liveForecast.nextFY.mlData = modelingCalc.getMLDataByMetric(metricData, state.details.fy + 1);

            state.liveOutput.prevFY.pyramidindex = modelingCalc.calculatePI(state.liveForecast.prevFY.mlData,true);

            [state.liveOutput.currFY.Q1.pyramidindex,state.liveOutput.currFY.Q2.pyramidindex,state.liveOutput.currFY.Q3.pyramidindex,
                state.liveOutput.currFY.Q4.pyramidindex] = modelingCalc.calculatePI(state.liveForecast.currFY.mlData);
            state.liveOutput.currFY.pyramidindex = state.liveOutput.currFY.Q4.pyramidindex;

            [state.liveOutput.nextFY.Q1.pyramidindex,state.liveOutput.nextFY.Q2.pyramidindex,state.liveOutput.nextFY.Q3.pyramidindex,
                state.liveOutput.nextFY.Q4.pyramidindex] = modelingCalc.calculatePI(state.liveForecast.nextFY.mlData);
            state.liveOutput.nextFY.pyramidindex = state.liveOutput.nextFY.Q4.pyramidindex;

        }
    },

    initializeClgs(state, action) {
      state.clgs = action.payload;
    },
    updateDetails(state, action) {
      const data = action.payload;
      state.details = data.details;
      if (features.aug24simChargScope && data.details.ischargeable !== undefined) {
        state.ischargeable = (data.details.ischargeable.length !== 0 && Array.isArray(data.details.ischargeable))
          ? getScope(data.details.ischargeable)
          : ['N/A'];
      }
      state.details.fy = modelingCalc.getCurrentFY(data.data);
      state.details.nextfy = state.details.fy + 1;
    },
    updateOculusDetails(state, action) {
      const data = action.payload;
      state.details = data.details;
      if (features.aug24simChargScope) {
        state.ischargeable = getScope(data.details.ischargeable);
      }
      state.details.oculusName = utility.sanitizeHtmlReverseData(data.details.oculusName);
      const value = oculusCalc.getCurrentFY(data.data);
      state.details.fy = parseInt(value[1]);
      state.details.nextfy = state.details.fy + 1;
    },
    setWarningError(state, action) {
      state.warningMsg = action.payload;
    },
    // ...add other reducers here...
  }
});

export const {
  getModelsHome,
  getLiveForecast,
  initializeClgs,
  updateDetails,
  updateOculusDetails,
  setWarningError,
  // ...other actions...
} = modelingSlice.actions;

export default modelingSlice.reducer;
