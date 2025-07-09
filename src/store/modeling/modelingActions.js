import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import constList from '../../constants';
import constants from '../../../utility/constants';
import modelingCalc from '../../../utility/modeling_calc';
import utility from '../../../utility/utility.js';
import zlib from 'zlib';

const { actions } = constList.modeling;
const features = applicationConfig.features;

const tabMap = [
    { feName: 'yearOnYearGrowth', beName: 'growth'},
    { feName: 'pyramid', beName: 'pyramid'},
    { feName: 'managedAttrition', beName: 'ATM'},
    { feName: 'unmanagedAttrition', beName: 'ATU'},
    { feName: 'promotionsOut', beName: 'PRO'},
    { feName: 'growthPhasing', beName: 'GRP'},
    { feName: 'EHC', beName: 'EHC'},
    { feName: 'BHC', beName: 'BHC'},
    { feName: 'AHC', beName: 'AHC'},
    { feName: 'joiners', beName: 'JOI'},
    { feName: 'movement', beName: 'MVO'},
    { feName: 'EPC', beName: 'EPC'},
    { feName: 'inQuarterFTE', beName: 'qGrowth'}
];

function mapPH(modelDetail) {
    const mappedPH = {values: [], title: "", key: "", path: ""};
    if (!modelDetail.orgunitlevel1_code) {
        // Accenture
        mappedPH.values.push([]);
        mappedPH.title = "Accenture";
        mappedPH.key = "Accenture";
        mappedPH.path = "";
    } else {
        mappedPH.values.push(modelDetail.orgunitlevel1_code);
        mappedPH.title = modelDetail.orgunitlevel1_desc;
        mappedPH.key = modelDetail.orgunitlevel1_code;
        mappedPH.path = "";
        for (let i = 2; i <= 10; i++) {
            const code = modelDetail['orgunitlevel' + i + '_code'];
            const description = modelDetail['orgunitlevel' + i + '_desc'];
            if (code) {
                mappedPH.values.push(code);
                // add previous title to path before modifying that title
                mappedPH.path += ((i == 2 ? '' : ' > ') + utility.clone(mappedPH.title));
                mappedPH.title = description;
                mappedPH.key = code;
            } else { break; }
        }
    }
    return mappedPH;
}
function checkIfForecastDataZero(curr, next, state) {
    let flag = false;
    const forecastQtrs = state.original.currFY.actualForecastQuarterForFY['F'];
    forecastQtrs.forEach((qtr)=>{
        if (curr[qtr] != 0) {
            flag = true;
        }
    });
    ['Q1','Q2','Q3','Q4'].forEach((qtr)=>{
        if (next[qtr] != 0) {
            flag = true;
        }
    })
    return flag;
}
function mapLH(modelDetail) {
    const mappedLH = {values: [], title: "", key: "", path: ""};
    if (!modelDetail.geounit_code) {
        // Global
        mappedLH.values.push([]);
        mappedLH.title = "Global";
        mappedLH.key = "Global";
        mappedLH.path = "";
    } else {
        mappedLH.values.push(modelDetail.geounit_code);
        mappedLH.title = modelDetail.geounit_desc;
        mappedLH.key = modelDetail.geounit_code;
        mappedLH.path = "";
        const geoItemLabels = ["country", "region"];
        for (let i = 0; i < geoItemLabels.length; i++) {
            const label = geoItemLabels[i];
            const code = modelDetail[label + '_code'];
            const description = modelDetail[label + '_desc'];
            if (code) {
                mappedLH.values.push(code);
                // add previous title to path before modifying that title
                mappedLH.path += ((i == 0 ? '' : ' > ') + utility.clone(mappedLH.title));
                mappedLH.title = description;
                mappedLH.key = code;
            } else { break; }
        }
    }
    return mappedLH;
}
function checkPHcount(modelid, state)  {
    if (modelid != null) {
        const modelData = state.oculus.modelList.find(val => val.modeling_id === modelid)
        if (modelData) {
            const phArr = modelData.org_hierarchy.split(";")
            if (phArr.length == 1) {
                return true
            }
            else {
                return false
            }
        }
    }
    return false;
}
// Save FY input/FTE and Qtr FTE value to display to oculus level
function createSaveInputDataSet(inputsData, fyValue, Quarter) {
    const mappedInputs = [];
    Object.keys(inputsData).forEach(inputKey => {
        if (inputsData[inputKey].value !== null && inputsData[inputKey].value !== ''  && inputsData[inputKey].value !== undefined) {
            const inputItemNext = {
                input: tabMap.find(x => x.feName == inputKey).beName,
                careerlevelgroupcode: null,
                value: inputsData[inputKey].value,
                modelingFY: fyValue,
                modelingQuarter: Quarter ? Quarter : null
            };
            mappedInputs.push(inputItemNext);
        } else {
            Object.keys(inputsData[inputKey]).forEach(clgKey => {
                const inputItemNext = {
                    input: tabMap.find(x => x.feName == inputKey).beName,
                    careerlevelgroupcode: constants.clgs.find(x => x.clgKey == clgKey).clgCode,
                    value: inputsData[inputKey][clgKey],
                    modelingFY: fyValue,
                    modelingQuarter: Quarter ? Quarter : null
                };
                mappedInputs.push(inputItemNext);
            });
        }
    });
    return mappedInputs;
}
function getInputDataSet(outputObj,fy,modelingId,oculusID) {
    const quarters = ['Q1','Q2','Q3','Q4'];
    const mappedEHC = [];
    quarters.map(curr => {
        Object.keys(outputObj[curr]).forEach(inputKey => {
            const inputItem = {
                modeling_id: modelingId,
                quarter: curr,
                metric: 'EHC',
                careerlevelcode: inputKey,
                metricvalue: outputObj[curr][inputKey],
                modeling_fy: fy,
                oculus_id: oculusID
            };
            mappedEHC.push(inputItem);
        });
    });
    return mappedEHC;
}
// Save quarter input
function createSaveInputDataQtr(inputStoreObj, fyValue, modelingType) {
    const inputType = ['growthPhasing', 'pyramid', 'managedAttrition', 'unmanagedAttrition',  'promotionsOut', 'inQuarterFTE'];

    const qtrSet = (({ Q1, Q2,Q3,Q4 }) => ({Q1, Q2,Q3,Q4 }))(inputStoreObj);
    let pyramidQtrsVal = [];
    const saveData =  ['Q1', 'Q2', 'Q3', 'Q4'].reduce((prev, curr) => {
        inputType.map((item) => {
            if (item == 'pyramid' ||
            ((item == 'managedAttrition' || item == 'unmanagedAttrition' ||
                item == 'promotionsOut') && modelingType == 'Q')) {
                const pyramidQtrVal = constants.clgs.reduce ((prevPyramid, currPyramid) => {
                    if (qtrSet[curr][item][currPyramid.clgKey] != undefined) {
                        prevPyramid.push({
                            input: tabMap.find(x => x.feName == item).beName,
                            careerlevelgroupcode: currPyramid.clgCode,
                            value: qtrSet[curr][item][currPyramid.clgKey],
                            modelingFY: fyValue,
                            modelingQuarter: curr
                        });
                    }
                    return prevPyramid;
                },[]);
                pyramidQtrsVal = pyramidQtrsVal.concat(pyramidQtrVal);
            } else {
                prev.push({
                    input: tabMap.find(x => x.feName == item).beName,
                    careerlevelgroupcode: null,
                    value: qtrSet[curr][item].value,
                    modelingFY: fyValue,
                    modelingQuarter: curr
                });
            }
        });
        return prev;
    }, []);
    return saveData.concat(pyramidQtrsVal);
}

// Save input data to model level
function mapInputs(state) {
    // To do this should be change to current FY and next FY
    const inputs = {};// utility.clone(state.input);
    const nextInputs = {};

    inputs.yearOnYearGrowth = utility.clone(state.input.currFY.yearOnYearGrowth);
    inputs.managedAttrition = utility.clone(state.input.currFY.managedAttrition);
    inputs.pyramid = utility.clone(state.input.currFY.pyramid);
    inputs.promotionsOut = utility.clone(state.input.currFY.promotionsOut);
    inputs.unmanagedAttrition = utility.clone(state.input.currFY.unmanagedAttrition);
    const fyValue = state.details.fy;

    nextInputs.yearOnYearGrowth = utility.clone(state.input.nextFY.yearOnYearGrowth);
    nextInputs.managedAttrition = utility.clone(state.input.nextFY.managedAttrition);
    nextInputs.pyramid = utility.clone(state.input.nextFY.pyramid);
    nextInputs.promotionsOut = utility.clone(state.input.nextFY.promotionsOut);
    nextInputs.unmanagedAttrition = utility.clone(state.input.nextFY.unmanagedAttrition);
    const fyValueNext = state.details.nextfy;

    let mappedInputs = [];
    let mappedCurrentData = [];
    let mappedNextData = [];

    mappedCurrentData = createSaveInputDataSet(inputs, fyValue);
    mappedNextData = createSaveInputDataSet(nextInputs, fyValueNext);

    const mappedQuarterCurrFY = createSaveInputDataQtr(state.input.currFY, fyValue, state.details.modeling_type);
    const mappedQuarterNextFY = createSaveInputDataQtr(state.input.nextFY, fyValueNext, state.details.modeling_type);
    mappedInputs = [...mappedCurrentData,...mappedNextData,...mappedQuarterCurrFY,...mappedQuarterNextFY];

    return {
        modeling_id: state.details.modelingId ? state.details.modelingId : state.details.id,
        oculus_id: state.oculus.details.oculus_id ? state.oculus.details.oculus_id : null,
        flag_modeled: state.details.modeled ? 1 : 0,
        inputs: mappedInputs
    };
}

// Save quarter wise output data
function qtrWiseOutputData(outputStoreObj,modeledOutput,fyValue) {
    const quarterOutputs = {Q1: {},Q2: {},Q3: {},Q4: {}};

    const quarters = ["Q1","Q2","Q3","Q4"];
    return quarters.reduce((prev,curr) => {
        quarterOutputs[curr].EHC = outputStoreObj[curr].EHC;
        quarterOutputs[curr].BHC = modeledOutput[curr].BHC;
        quarterOutputs[curr].AHC = modeledOutput[curr].AHC;
        quarterOutputs[curr].managedAttrition = outputStoreObj[curr].managedAttrition;
        quarterOutputs[curr].promotionsOut = outputStoreObj[curr].promotionsOut;
        quarterOutputs[curr].unmanagedAttrition = outputStoreObj[curr].unmanagedAttrition;
        quarterOutputs[curr].joiners = outputStoreObj[curr].joiners;
        quarterOutputs[curr].movement = outputStoreObj[curr].movements;
        const calculatedQtr = createSaveInputDataSet(quarterOutputs[curr],fyValue,curr);
        prev.push(...calculatedQtr);
        return prev;
    },[]);
}

// Save modeled FTE data to display @oculus level
function mapOculus(state) {
    // To do this should be change to current FY and next FY
    const outputs = {};// utility.clone(state.output);
    const nextoutputs = {};
    const prevoutputs = {};

    prevoutputs.EPC = state.original.prevFY.EPC;
    prevoutputs.EHC = state.original.prevFY.EHC;
    prevoutputs.AHC = state.original.prevFY.AHC;
    prevoutputs.BHC = state.original.prevFY.BHC;

    outputs.BHC = state.original.currFY.BHC;
    outputs.managedAttrition = state.output.currFY.attrition.managed;
    outputs.promotionsOut = state.output.currFY.promotions.out;
    outputs.unmanagedAttrition = state.output.currFY.attrition.unmanaged;
    outputs.joiners = state.output.currFY.joiners;
    outputs.movement = state.output.currFY.movements;

    nextoutputs.BHC = state.output.nextFY.BHC;
    nextoutputs.managedAttrition = state.output.nextFY.attrition.managed;
    nextoutputs.promotionsOut = state.output.nextFY.promotions.out;
    nextoutputs.unmanagedAttrition = state.output.nextFY.attrition.unmanaged;
    nextoutputs.joiners = state.output.nextFY.joiners;
    nextoutputs.movement = state.output.nextFY.movements;

    const outputState = state.details.modeled ? state.modeled : state.original;

    outputs.EHC = outputState.currFY.EHC;
    outputs.EPC = outputState.currFY.EPC;
    outputs.AHC = outputState.currFY.AHC;
    nextoutputs.EHC = outputState.nextFY.EHC;
    nextoutputs.EPC = outputState.nextFY.EPC;
    nextoutputs.AHC = outputState.nextFY.AHC;

    const fyValuePrev = state.details.fy - 1;
    const fyValue = state.details.fy;
    const fyValueNext = state.details.nextfy;
    let qtrCurrFY = [];
    let qtrNextFY = [];

    qtrCurrFY = qtrWiseOutputData(state.output.currFY,outputState.currFY,fyValue);
    qtrNextFY = qtrWiseOutputData(state.output.nextFY,outputState.nextFY,fyValueNext);

    let mappedoutputs = [];
    let mappedCurrentData = [];
    let mappedNextData = [];
    let mappedPrevData = [];
    let EPGData = [];
    mappedPrevData = createSaveInputDataSet(prevoutputs, fyValuePrev);
    mappedCurrentData = createSaveInputDataSet(outputs, fyValue);
    mappedNextData = createSaveInputDataSet(nextoutputs, fyValueNext);
    const partialFYData = {
        input: "PFY",
        careerlevelgroupcode: "105",
        value: state.details.partialFY ? 1 : 0,
        modelingFY: fyValueNext,
        modelingQuarter: null
    };
    EPGData = [{
        input: 'EPG',
        careerlevelgroupcode: "105",
        value: state.original.prevFY.totalEPC,
        modelingFY: fyValuePrev,
        modelingQuarter: null
    },{
        input: 'EPG',
        careerlevelgroupcode: "105",
        value: state.original.currFY.totalEPC,
        modelingFY: fyValue,
        modelingQuarter: null
    },{
        input: 'EPG',
        careerlevelgroupcode: "105",
        value: state.original.nextFY.totalEPC,
        modelingFY: fyValueNext,
        modelingQuarter: null
    }];
    mappedoutputs = mappedPrevData.concat(mappedCurrentData,mappedNextData,qtrCurrFY,qtrNextFY,partialFYData,EPGData);
    return {
        oculus_id: state.oculus.details.oculus_id ? state.oculus.details.oculus_id : state.details.id,
        modeling_id: state.details.modelingId ? state.details.modelingId : state.details.id,
        flag_oculus: 1,
        outputs: mappedoutputs
    };
}

function setQuarterData(mappedInputs, inputs, fyValue) {
    inputs.map((item) => {
        const fy = fyValue == item.modeling_FY ? 'nextFY' : 'currFY' ;
        const inputType = {GRP: 'growthPhasing', pyramid: 'pyramid', ATM: 'managedAttrition', ATU: 'unmanagedAttrition',  PRO: 'promotionsOut', qGrowth: 'inQuarterFTE'};
        const feName = inputType[item.input];
        if (item.careerlevelgroupcode != null) {
            item.careerlevelgroupcode = constants.clgs.find(x => x.clgCode == item.careerlevelgroupcode).clgKey;
            mappedInputs[fy][item.modeling_quarter][feName][item.careerlevelgroupcode] = item.value
        } else {
            mappedInputs[fy][item.modeling_quarter][feName].value = item.value;
        }
        return mappedInputs
    });

    return mappedInputs;
}

function mapInputsForFE(state, inputs) {
    let mappedInputs = utility.clone(state.input);
    let inputName, clgKey;
    const fyInputs = inputs.filter((key)=> key.modeling_quarter == null);
    fyInputs.forEach((item) => {
        const fy = state.details.nextfy == item.modeling_FY ? 'nextFY' : 'currFY' ;
        switch (item.input) {
        case "growth":
            if (fy == 'nextFY') {
                mappedInputs.nextFY.yearOnYearGrowth.value = item.value; }
            else {
                mappedInputs.currFY.yearOnYearGrowth.value = item.value; }
            break;
        default:
            inputName = tabMap.find(x => x.beName == item.input).feName;
            clgKey = constants.clgs.find(x => x.clgCode == item.careerlevelgroupcode).clgKey;
            mappedInputs[fy][inputName][clgKey] = item.value;
            break;
        }

    });
    const qtrData = inputs.filter((key)=> key.modeling_quarter != null);
    mappedInputs = setQuarterData(mappedInputs, qtrData, state.details.nextfy);
    return mappedInputs;
}

function mapInputsForPyramidlock(state, inputs) {
    const mappedLocks = utility.clone(state.lockvalue);
    let clgKey;
    if (state.lockvalue) {
        inputs.forEach(item => {
            const fy = state.details.nextfy == item.modeling_fy ? 'nextFY' : 'currFY' ;
            clgKey = constants.clgs.find(x => x.clgCode == item.careerlevelgroupcode).clgKey;
            mappedLocks[fy][clgKey] = item.lock_status;
        })
    }
    return mappedLocks;
}
function formatDataSet(metric, monthlyData, allmonths, forecastMonths) {
    const metricNonNegative = ["JOI", "PRI", "PRO", "ATM", "ATU"];
    return monthlyData.reduce((prev,curr,index) => {
        if (forecastMonths.indexOf(allmonths[index]) !== -1) {
            constants.clgs.reduce((prevClg, currClg) => {
                const obj = {};
                obj.metric = metric;
                obj.yearmonth = allmonths[index];
                obj.value = metricNonNegative.indexOf(metric) !== -1 && curr[currClg.clgKey] < 0 ? 0 : metric == "MVO" ? Math.abs(curr[currClg.clgKey]) : curr[currClg.clgKey];
                obj.careercodelevelcode = currClg.clgCode;
                prev.push(obj);
            },{})
        }
        return prev;
    },[])
}
function createMonthlyDataSet(state) {
    const months = [200009, 200010, 200011, 200012, 200101, 200102, 200103, 200104, 200105, 200106, 200107,200108];
    const monthsCurrFY = months.map(x => x + (state.details.fy - 1) * 100);
    const monthsNextFY = months.map(x => x + (state.details.nextfy - 1) * 100);
    const AllMonths = [...monthsCurrFY, ...monthsNextFY];
    const forecastMonths = AllMonths.filter(x => x >= state.original.currFY.firstForecastMonth);
    const PRO = formatDataSet("PRO", [...state.modeled.currFY.modeledPROMetric,...state.modeled.nextFY.modeledPROMetric], AllMonths, forecastMonths);
    const PRI = formatDataSet("PRI", [...state.modeled.currFY.modeledPRIMetric,...state.modeled.nextFY.modeledPRIMetric], AllMonths, forecastMonths);
    const ATU = formatDataSet("ATU", [...state.modeled.currFY.modeledATUMetric,...state.modeled.nextFY.modeledATUMetric], AllMonths, forecastMonths);
    const ATM = formatDataSet("ATM", [...state.modeled.currFY.modeledATMMetric,...state.modeled.nextFY.modeledATMMetric], AllMonths, forecastMonths);
    const JOI = formatDataSet("JOI", [...state.modeled.currFY.modeledJOIMetric,...state.modeled.nextFY.modeledJOIMetric], AllMonths, forecastMonths);
    const MVO = formatDataSet("MVO", [...state.modeled.currFY.modeledMOVMetric,...state.modeled.nextFY.modeledMOVMetric], AllMonths, forecastMonths);
    return {
        modeling_id: state.details.modelingId ? state.details.modelingId : state.details.id,
        monthlyData: [...PRO, ...PRI, ...ATU, ...ATM, ...JOI, ...MVO]
    };
}
function getNoneditedData(state) {
    const quarterdata = {
        modeling_id: state.details.id,
        currentFY: state.details.fy,
        nextFY: state.details.nextfy,
        modeledQuartervaluecurrFY: state.modeledLockQuarter.currFY,
        modeledQuartervaluenextFY: state.modeledLockQuarter.nextFY
    };
    // call this API to pass params in the format of quarterdata
    return quarterdata;
}

function getQtrEHCData(state) {
    const quarters = ["Q1","Q2","Q3","Q4"];
    const outputObj = {};
    quarters.map(curr => {
        outputObj[curr] = state['mlData'][curr];
    });
    return outputObj;
}

function getEHCMLData(state) {
    const fyValue = state.details.fy;
    const fyValueNext = state.details.nextfy;

    const currFYEHC = getQtrEHCData(state.original.currFY);
    const nextFYEHC = getQtrEHCData(state.original.nextFY);

    const mappedEHCcurrFY = getInputDataSet(currFYEHC,fyValue,state.details.id,state.oculus.details.oculus_id);
    const mappedEHCnextFY = getInputDataSet(nextFYEHC,fyValueNext,state.details.id,state.oculus.details.oculus_id);

    return mappedEHCcurrFY.concat(mappedEHCnextFY);
}

// --- Helper functions (mapPH, mapLH, etc.) go here ---

// Example: GET_MODELS_HOME
export const getModelsHome = createAsyncThunk(
  actions.GET_MODELS_HOME,
  async (_, { getState, dispatch }) => {
    const state = getState().modeling;
    const sharedOculus = state.shared && state.shared.length > 0 ? state.shared : [];
    const activatedOculus = state.archive && state.archive.length > 0 ? state.archive : [];
    dispatch(resetModel());
    const [simResp, rollupResp] = await Promise.all([
      axios.get('/api/simulator'),
      axios.get('/api/rollup')
    ]);
    // You would dispatch reducers here to update state, e.g.:
    dispatch(setModelsHome([simResp, rollupResp]));
    if (sharedOculus.length > 0) {
      dispatch(setSharedOculusHome(sharedOculus));
    }
    if (activatedOculus.length > 0) {
      dispatch(setActivatedOculusHome(activatedOculus));
    }
    return [simResp, rollupResp];
  }
);

export const getLiveForecast = createAsyncThunk(
  actions.GET_LIVE_FORECAST,
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const uri = payload.oculusid ? '/api/simulator/liveforecast/' : '/api/modeling/liveforecast/';
      const id = payload.oculusid ? payload.oculusid : payload.modelingid;
      // Reset model state before fetching
      dispatch({ type: actions.RESET_MODEL_STATE, payload: ['liveForecast', 'liveInput', 'liveOutput'] });

      const resp = await axios.get(uri + id);

      if (features.aug22SimEPGIssue) {
        const oculusFlag = !!payload.oculusid;
        if (!oculusFlag) {
          const dataWithoutEPC = resp.data.metrics.filter(m => m.metric !== "EPC");
          const epcData = resp.data.metrics.filter(m => m.metric === "EPC");
          dispatch({
            type: mutations.GET_LIVE_FORECAST,
            payload: {
              metricData: dataWithoutEPC,
              epcData: epcData,
              avgRate: resp.data.avgRate,
              oculusFlag,
              maCost: resp.data.maCost[0].ma_cost
            }
          });
        } else {
          const dataWithoutEPC = resp.data.metrics.filter(m => m.metric !== "EPC");
          const epcData = resp.data.metrics.filter(m => m.metric === "EPC");
          const dataWithoutEPCArr = [];
          const epcDataArr = [];
          const avgRateArr = resp.data.avgRateArr;
          resp.data.metricsArrFinal.reduce((prev, cur) => {
            dataWithoutEPCArr.push(cur.filter(m => m.metric !== "EPC"));
            epcDataArr.push(cur.filter(m => m.metric === "EPC"));
          }, []);
           dispatch({
            type: mutations.GET_LIVE_FORECAST,
            payload: {
              metricData: dataWithoutEPC,
              epcData: epcData,
              metricDataArr: dataWithoutEPCArr,
              epcDataArr: epcDataArr,
              avgRateArr: avgRateArr,
              oculusFlag
            }
          });
        }
      } else {
        const dataWithoutEPC = resp.data.metrics.filter(m => m.metric !== "EPC");
        const epcData = resp.data.metrics.filter(m => m.metric === "EPC");
        dispatch({
          type: mutations.GET_LIVE_FORECAST,
          payload: { metricData: dataWithoutEPC, epcData: epcData }
        });
      }
      return resp.data;
       } catch (e) {
      dispatch({ type: mutations.SET_WARNING_ERROR, payload: e });
      return rejectWithValue(e);
    }
  }
);

export const getLiveForecastValues = createAsyncThunk(
  actions.GET_LIVE_FORECAST_VALUES,
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const uri = payload.oculusid ? '/api/simulator/liveforecast/' : '/api/modeling/liveforecast/';
      const id = payload.oculusid ? payload.oculusid : payload.modelingid;
      // Reset model state before fetching
      dispatch({ type: actions.RESET_MODEL_STATE, payload: ['liveForecast', 'liveInput', 'liveOutput'] });

      const resp = await axios.get(uri + id);
      return resp;
    } catch (e) {
      dispatch({ type: mutations.SET_WARNING_ERROR, payload: e });
      return rejectWithValue(e);
    }
  }
);

export const getLiveForecastSetValues = createAsyncThunk(
  actions.GET_LIVE_FORECAST_SET_VALUES,
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const payloadIp = payload.inputData ? payload.inputData : payload;
      const resp = payload;
      const oculusFlag = !!payloadIp.oculusid;

      if (!oculusFlag) {
        const dataWithoutEPC = resp.resps.metrics.filter(m => m.metric !== "EPC");
        const epcData = resp.resps.metrics.filter(m => m.metric === "EPC");
        dispatch({
          type: mutations.GET_LIVE_FORECAST,
          payload: {
            metricData: dataWithoutEPC,
             epcData: epcData,
            avgRate: resp.resps.avgRate,
            oculusFlag,
            maCost: resp.resps.maCost[0].ma_cost
          }
        });
      } else {
        const dataWithoutEPC = resp.resps.metrics.filter(m => m.metric !== "EPC");
        const epcData = resp.resps.metrics.filter(m => m.metric === "EPC");
        const dataWithoutEPCArr = [];
        const epcDataArr = [];
        const avgRateArr = resp.resps.avgRateArr;
        resp.resps.metricsArrFinal.reduce((prev, cur) => {
          dataWithoutEPCArr.push(cur.filter(m => m.metric !== "EPC"));
          epcDataArr.push(cur.filter(m => m.metric === "EPC"));
        }, []);
         dispatch({
          type: mutations.GET_LIVE_FORECAST,
          payload: {
            metricData: dataWithoutEPC,
            epcData: epcData,
            metricDataArr: dataWithoutEPCArr,
            epcDataArr: epcDataArr,
            avgRateArr: avgRateArr,
            oculusFlag
          }
        });
      }
      return resp;
    } catch (e) {
      // If you want to handle errors in the reducer, you can dispatch a mutation here
      // dispatch({ type: mutations.SET_WARNING_ERROR, payload: e });
      return rejectWithValue(e);
    }
  }
);

export const getLiveForecastStatus = createAsyncThunk(
  actions.GET_LIVE_FORECAST_STATUS,
  async (payload, { rejectWithValue }) => {
    try {
      const url = `/api/simulator/compareWithLFStatus/${payload.enterpriseid}/${payload.name}`;
      const resp = await axios.get(url, payload);
      if (features.may25ComparewithLFFix && !("done" in resp.data)) {
        const unzippedBuffer = zlib.gunzipSync(
          Buffer.isBuffer(resp.data.data) ? resp.data.data : Buffer.from(resp.data.data)
        );
        resp.data = JSON.parse(unzippedBuffer.toString());
      }
      return resp;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

export const getModelLiveForecastStatus = createAsyncThunk(
  actions.GET_MODEL_LIVE_FORECAST_STATUS,
  async (payload, { rejectWithValue }) => {
    try {
      const url = `/api/modeling/compwithLFModel/${payload.enterpriseid}/${payload.name}`;
      const resp = await axios.get(url, payload);
      return resp;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

// Example: SAVE_MODEL
export const saveModel = createAsyncThunk(
  actions.SAVE_MODEL,
  async (_, { getState, dispatch }) => {
    const state = getState().modeling;
    dispatch(toggleSaving(true));
    dispatch(togglePendingChanges(true));
    const mappedInputs = mapInputs(state);
    const mappedOculusOutputs = mapOculus(state);
    const quarterdata = getNoneditedData(state);
    const axiosArray = [
      axios.post('/api/modeling/inputs', mappedInputs),
      axios.post('/api/simulator/outputs', mappedOculusOutputs),
      axios.post('/api/modeling/noneditedquarter', quarterdata)
    ];
    if (features.jul22ModelToScenario && state.details.modeled) {
      const modeledMonthlyData = createMonthlyDataSet(state);
      axiosArray.push(axios.post("/api/modeling/save/modeleddata", modeledMonthlyData));
    }
    state.cbloading = false;
    try {
      await Promise.all(axiosArray);
      dispatch(toggleSaving(false));
      dispatch(togglePendingChanges(false));
    } catch (e) {
      dispatch(toggleSaving(false));
      state.cbloading = false;
      throw e;
    }
  }
);

// You will need to import or define mapPH and mapLH in this file or import from a shared utility

export const initializeRollup = createAsyncThunk(
  actions.INITIALIZE_ROLLUP,
  async (rollupPageInfo, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState().modeling;
      dispatch({ type: actions.RESET_MODEL_STATE, payload: ['archive', 'warningMsg'] });

      const rollupId = rollupPageInfo.rollupId;
      const url = rollupPageInfo.isArchive ? '/api/rollup/archived/' : '/api/rollup/';
      const oculusRollupList = state.rollup.oculus.map(e => e.modellist.length > 0);
      const oculusfilterRollupListvalue = oculusRollupList.indexOf(true) !== -1;
      const ErrorMsg = oculusfilterRollupListvalue ? utility.getWarningMessage('4009') : false;
      dispatch({
        type: mutations.SET_WARNING_ERROR,
        payload: ErrorMsg ? ErrorMsg : {}
      });

      const resp = await axios.get(url + rollupId);

      // Initialize clgs
      const rollupDetail = resp.data.rollupdetails[0];
      const mappedDetails = {
        ph: mapPH(rollupDetail),
        geo: mapLH(rollupDetail),
        contract: rollupDetail.contractbasedcode
      };
      // You may need to adjust how you get getters.getClgs in Redux
      // For now, assuming a selector or helper function getClgs is available
      const getClgs = () => []; // <-- Replace with actual implementation
      dispatch({
        type: mutations.INITIALIZE_CLGS,
        payload: getClgs(mappedDetails.ph.key, mappedDetails.geo.key)
      });

      const lockedQuarter = features.jul22ModelToScenario ? resp.data.locked_quarter[0] : "";

      const details = {
        id: rollupId,
        rollupName: rollupDetail.rollup_name,
        rollupDescription: rollupDetail.rollup_description ? rollupDetail.rollup_description : "",
        rollupDescriptionText: rollupDetail.rollup_description_text ? rollupDetail.rollup_description_text : "",
        ph: mappedDetails.ph.title,
        phPath: mappedDetails.ph.path,
        multiPh: rollupDetail.org_hierarchy,
        multilh: rollupDetail.loc_hierarchy,
        geo: mappedDetails.geo.title,
        geoPath: mappedDetails.geo.path,
        contract: mappedDetails.contract,
        lastUpdated: rollupDetail.edit_timestamp,
        isarchive: rollupPageInfo.isArchive,
        isehcnegative: resp.data.isehcnegative[0].isehcnegative,
        isOverlappingOculus: resp.data.isoverlappingoculus && resp.data.isoverlappingoculus.length > 0 ? resp.data.isoverlappingoculus[0].isoverlappingoculus : 0,
        iscountrylevel: resp.data.iscountrylevel && resp.data.iscountrylevel.length > 0 ? resp.data.iscountrylevel[0].iscountrylevel : 0,
        quarter: lockedQuarter.locked_quarter ? lockedQuarter.locked_quarter.substring(0, 1) : "",
        locked_fy: lockedQuarter.locked_quarter ? lockedQuarter.locked_quarter.substring(2) : "",
        pyramidIndexFlag: (features.oct23PyramidIndexSimulator && resp.data.pyramid_index_flag !== undefined) ? resp.data.pyramid_index_flag[0].pyramid_index_flag : "",
        ischargeable: !features.aug24simChargScope ? [] : (resp.data.ischargeable === undefined ? ['N/A'] : resp.data.ischargeable)
      };
      const outputCalcData = resp.data.metrics;
      const leaderFYData = resp.data.leaderfymetrics;
      const partialFY = resp.data.ispartialfy;

      dispatch({
        type: mutations.UPDATE_OCULUS_DETAILS,
        payload: { details, data: outputCalcData }
      });

      if (features.oct23PyramidIndexSimulator) {
        dispatch({
          type: mutations.INITIALIZE_OCULUS,
          payload: {
            metricData: outputCalcData,
            leaderFYData: leaderFYData,
            partialFY: partialFY,
            avgRate: resp.data.leaderfymetricsupdate,
            mlData: resp.data.mlData,
            modeledData: resp.data.modeledData
          }
        });
      } else {
        dispatch({
          type: mutations.INITIALIZE_OCULUS,
          payload: {
            metricData: outputCalcData,
            leaderFYData: leaderFYData,
            partialFY: partialFY,
            avgRate: resp.data.leaderfymetricsupdate
          }
        });
      }

      return resp.data;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

export const initializeModel = createAsyncThunk(
  actions.INITIALIZE_MODEL,
  async (modelPageInfo, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState().modeling;
      const modelId = modelPageInfo.modelId;
      const oculusId = modelPageInfo.oculusId;
      const rollupId = modelPageInfo.rollupId;

      const url = modelPageInfo.isArchive
        ? (modelPageInfo.rollupId
            ? `/api/rollup/archived/${rollupId}/simulator/${oculusId}/modeling/`
            : `/api/simulator/archived/${oculusId}/modeling/`)
        : (modelPageInfo.rollupId
            ? `/api/rollup/${rollupId}/simulator/${oculusId}/modeling/`
            : `/api/simulator/${oculusId}/modeling/`);

      const resp = await axios.get(url + modelId);

      // Initialize clgs
      const modelDetail = resp.data.modeldetails[0];
      const modelIntersection = resp.data.subscenario;
      const mappedDetails = {
        ph: mapPH(modelDetail),
        geo: mapLH(modelDetail),
        contract: modelDetail.contractbasedcode
      };
      // You may need to implement or import getClgs for Redux
      const getClgs = () => []; // <-- Replace with actual implementation
      dispatch({
        type: mutations.INITIALIZE_CLGS,
        payload: getClgs(mappedDetails.ph.key, mappedDetails.geo.key)
      });

      const lockedQuarter = features.jul22ModelToScenario ? resp.data.locked_quarter[0] : "";
      const modelingType = resp.data.modeling_type ? resp.data.modeling_type[0] : "";
      const uneditedQtrs = resp.data.uneditedQuarters;

      // Update details
      const details = {
        id: modelId,
        modelName: modelDetail.modeling_name,
        modelDescription: modelDetail.modeling_description ? modelDetail.modeling_description : "",
        modelDescriptionText: modelDetail.modeling_description_text ? modelDetail.modeling_description_text : "",
        ph: mappedDetails.ph.title,
        phPath: mappedDetails.ph.path,
        multiPh: modelDetail.org_hierarchy,
        multilh: modelDetail.loc_hierarchy,
        geo: mappedDetails.geo.title,
        geoPath: mappedDetails.geo.path,
        contract: mappedDetails.contract,
        lastUpdated: modelDetail.edit_timestamp,
        modeled: modelDetail.flag_modeled === 1,
        isarchive: modelPageInfo.isArchive,
        maCost: modelDetail.ma_cost,
        maCostLeader: 0,
        quarterView: modelPageInfo.isArchive ? resp.data.quarterenabled[0].quarterView : 0,
        quarter: lockedQuarter.locked_quarter ? lockedQuarter.locked_quarter.substring(0, 1) : "",
        locked_fy: lockedQuarter.locked_quarter ? lockedQuarter.locked_quarter.substring(2) : "",
        modeling_type: modelingType.modeling_type ? modelingType.modeling_type : "",
        pyramidIndexFlag: (features.oct23PyramidIndexSimulator && resp.data.pyramid_index_flag !== undefined)
          ? resp.data.pyramid_index_flag[0].pyramid_index_flag
          : "",
        ischargeable: !features.aug24simChargScope ? [] : (resp.data.ischargeable === undefined ? ['N/A'] : resp.data.ischargeable)
      };

      if (modelPageInfo.isArchive) {
        const inputs = mapInputsForFE(state, resp.data.inputs);
        const outputCalcData = resp.data.metrics;
        const leaderFYData = resp.data.leaderfymetrics;
        const partialFY = resp.data.ispartialfy;
        dispatch({ type: mutations.UPDATE_INPUT, payload: inputs });
        dispatch({ type: mutations.UPDATE_OCULUS_DETAILS, payload: { details, data: outputCalcData } });
        if (features.oct23PyramidIndexSimulator) {
          dispatch({
            type: mutations.INITIALIZE_OCULUS,
            payload: {
              metricData: outputCalcData,
              leaderFYData: leaderFYData,
              partialFY: partialFY,
              avgRate: resp.data.leaderfymetricsupdate,
              isArchived: true,
              mlData: resp.data.mlData,
              modeledData: details.modeled ? resp.data.modeledData : [],
              isModel: true
            }
          });
        } else {
          dispatch({
            type: mutations.INITIALIZE_OCULUS,
            payload: {
              metricData: outputCalcData,
              leaderFYData: leaderFYData,
              partialFY: partialFY,
              avgRate: resp.data.leaderfymetricsupdate,
              isArchived: true,
              isModel: true
            }
          });
        }
      } else {
        const dataWithoutEPC = resp.data.metrics.filter(m => m.metric !== "EPC");
        dispatch({ type: mutations.UPDATE_DETAILS, payload: { details, data: dataWithoutEPC } });

        // Set warning error
        const epcData = resp.data.metrics.filter(m => m.metric === "EPC");
        if (modelIntersection !== undefined && modelIntersection.length > 0) {
          const ErrorMsg = utility.getWarningMessage('3004');
          dispatch({ type: mutations.SET_WARNING_ERROR, payload: ErrorMsg });
        } else {
          const warningError = modelingCalc.validateModelData(dataWithoutEPC);
          dispatch({ type: mutations.SET_WARNING_ERROR, payload: warningError ? warningError : {} });
        }

        // Initialize model
        let pyramidinput;
        if (state && resp.data.pyramidlockstatus) {
          dispatch({ type: mutations.RESET_MODEL_STATE, payload: ['lockvalue'] });
          pyramidinput = mapInputsForPyramidlock(state, resp.data.pyramidlockstatus);
        }
        const leaderData = resp.data.leadermetrics;
        const leaderFYData = resp.data.leaderfymetrics;

        if (resp.data.quarterslockstatus) {
          dispatch({ type: mutations.RESET_MODEL_STATE, payload: ['LockQuarter'] });
          dispatch({
            type: mutations.INITIALIZE_MODEL,
            payload: {
              metricData: dataWithoutEPC,
              epcData: epcData,
              pyramidinput: pyramidinput,
              leaderData: leaderData,
              leaderFYData: leaderFYData,
              quarterLockStatus: resp.data.quarterslockstatus,
              avgRate: resp.data.leaderfymetricsupdate,
              modeledMetrics: resp.data.modeledMetrics,
              inputs: features.jan24ActivateArchivedLiveForecast ? resp.data.inputs : undefined
            }
          });
        } else {
          dispatch({
            type: mutations.INITIALIZE_MODEL,
            payload: {
              metricData: dataWithoutEPC,
              epcData: epcData,
              pyramidinput: pyramidinput,
              leaderData: leaderData,
              leaderFYData: leaderFYData,
              avgRate: resp.data.leaderfymetricsupdate,
              inputs: features.jan24ActivateArchivedLiveForecast ? resp.data.inputs : undefined
            }
          });
        }

        if (!details.modeled && state.isModelSave) {
          const mappedOutputs = mapOculus(state);
          if (state.oculus.oculus_type !== 'S') {
            await axios.post('/api/simulator/outputs', mappedOutputs).then(() => {
              state.isModelSave = false;
            }).catch(e => {
              // Optionally handle/log error
            });
          }
        }

        // Load inputs from BE
        if (details.modeled) {
          const inputs = mapInputsForFE(state, resp.data.inputs);
          dispatch({
            type: mutations.UPDATE_INPUT,
            payload: { currFY: inputs.currFY, nextFY: inputs.nextFY, isActivate: modelPageInfo.isActivating }
          });
          const partialFY = resp.data.ispartialfy;
          const reloadMetrics = resp.data.reload_metrics;
          if (modelPageInfo.isActivating === undefined) {
            if (features.oct23PyramidIndexSimulator) {
              const response = await axios.get('/api/modeling/mldata/' + state.details.id);
              dispatch({
                type: mutations.INITIALIZE_OCULUS,
                payload: {
                  metricData: reloadMetrics,
                  leaderFYData: leaderFYData,
                  partialFY: partialFY,
                  avgRate: resp.data.leaderfymetricsupdate,
                  isModel: true,
                  mlData: resp.data.metrics,
                  modeledData: response.data
                }
              });
            } else {
              dispatch({
                type: mutations.INITIALIZE_OCULUS,
                payload: {
                  metricData: reloadMetrics,
                  leaderFYData: leaderFYData,
                  partialFY: partialFY,
                  avgRate: resp.data.leaderfymetricsupdate,
                  isModel: true
                }
              });
            }
          }
        }
        if (modelPageInfo.isActivating && uneditedQtrs.length > 0) {
          uneditedQtrs.forEach((row, index) => {
            if (index < 4) {
              state.modeledLockQuarter.currFY[row.forecast_quarter] = row.flag_modeled;
            } else {
              state.modeledLockQuarter.nextFY[row.forecast_quarter] = row.flag_modeled;
            }
          });
        }
      }
      return resp.data;
 } catch (e) {
      return rejectWithValue(e);
    }
  }
);


// UPDATE_MODEL as AsyncThunk
export const updateModel = createAsyncThunk(
  actions.UPDATE_MODEL,
  async (payload, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState().modeling;
      dispatch({ type: mutations.UPDATE_INPUT, payload });

      if (features.oct23PyramidIndexSimulator) {
        const response = await axios.get('/api/modeling/mlRatios/' + state.details.id);
        dispatch({ type: mutations.RECALCULATE_MODEL_QUARTER, payload: { ratios: response.data[0] } });

        if (state.details.liveData && features.feb24LivedataRefreshEndPyrmd) {
          dispatch({ type: mutations.UPDATE_LIVEDATA });
        }

        // Autosave ML data
        const EHCdataset = getEHCMLData(state);
        await axios.post('/api/modeling/savemldata/' + state.details.id, EHCdataset);

        if (features.may24SimLoader && state.cbloading) {
          dispatch({ type: actions.SAVE_MODEL });
        }

        if (!state.pendingChanges) {
          if (
            !features.apr23DisableAutoSaveINQ ||
            (features.apr23DisableAutoSaveINQ && state.details.modeling_type !== 'Q')
          ) {
            state.details.timeoutId = setTimeout(() => {
              dispatch({ type: actions.SAVE_MODEL });
            }, 10000);
          }
          dispatch({ type: mutations.TOGGLE_PENDING_CHANGES, payload: true });
        }
      } else {
        dispatch({ type: mutations.RECALCULATE_MODEL_QUARTER });
        if (!state.pendingChanges) {
          if (
            !features.apr23DisableAutoSaveINQ ||
            (features.apr23DisableAutoSaveINQ && state.details.modeling_type !== 'Q')
          ) {
            state.details.timeoutId = setTimeout(() => {
              dispatch({ type: actions.SAVE_MODEL });
            }, 10000);
          }
          dispatch({ type: mutations.TOGGLE_PENDING_CHANGES, payload: true });
        }
      }
      return true;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

// UPDATE_NONEDITED_QUARTER as AsyncThunk
export const updateNoneditedQuarter = createAsyncThunk(
  actions.UPDATE_NONEDITED_QUARTER,
  async (payload, { dispatch }) => {
    dispatch({ type: mutations.UPDATE_NONEDITED_QUARTER, payload });
    return true;
  }
);

// UPDATE_LOCKS as AsyncThunk
export const updateLocks = createAsyncThunk(
  actions.UPDATE_LOCKS,
  async (payload, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState().modeling;
      const careercodelevelcode = constants.clgs.find(x => x.clgKey === payload.key).clgCode;
      const lockstatus = payload.val ? 1 : 0;
      const fy = payload.fy === 'currFY' ? state.details.fy : state.details.nextfy;
      const modeId = payload.modelid;
      const mappedLockData = {
        careerlevelgroupcode: careercodelevelcode,
        modeling_fy: fy,
        lock_status: lockstatus,
        modeling_id: modeId
      };
      await axios.post('/api/modeling/updatelockstatus', mappedLockData);
      dispatch({ type: mutations.UPDATE_LOCKS, payload });
      return true;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

// SET_MODEL_DESCRIPTION as AsyncThunk
export const setModelDescription = createAsyncThunk(
  actions.SET_MODEL_DESCRIPTION,
  async (description, { dispatch }) => {
    dispatch({ type: mutations.SET_MODEL_DESCRIPTION, payload: description });
    return true;
  }
);

// UPDATE_MODEL_DESCRIPTION as AsyncThunk
export const updateModelDescription = createAsyncThunk(
  actions.UPDATE_MODEL_DESCRIPTION,
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const modelingID = payload.modeling_id;
      const id =
        payload.rollup_id != null
          ? payload.rollup_id
          : modelingID != null
          ? modelingID
          : payload.oculus_id;
      const url =
        payload.rollup_id != null
          ? '/api/rollup/'
          : modelingID != null
          ? '/api/modeling/'
          : '/api/simulator/savecomment/';
      dispatch({ type: mutations.TOGGLE_SAVING, payload: true });
      if (payload.rollup_id != null) delete payload.rollup_id;
      else if (modelingID != null) delete payload.modeling_id;
      else delete payload.oculus_id;
      await axios.post(url + id, payload);
      dispatch({ type: mutations.SET_MODEL_DESCRIPTION, payload: payload.comments });
      dispatch({ type: mutations.SET_MODEL_DESCRIPTION_TEXT, payload: payload.commentsText });
      dispatch({ type: mutations.SET_MODEL_LAST_UPDATED });
      dispatch({ type: mutations.TOGGLE_SAVING, payload: false });
      return true;
    } catch (e) {
      dispatch({ type: mutations.TOGGLE_SAVING, payload: false });
      return rejectWithValue(e);
 }
  }
);


// GET_MODEL_LIST as AsyncThunk
export const getModelList = createAsyncThunk(
  actions.GET_MODEL_LIST,
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const url = payload.isArchive
        ? `/api/simulator/archived/list/${payload.id}`
        : `/api/simulator/list/${payload.id}`;
      const resp = await axios.get(url);
      dispatch({ type: mutations.GET_MODEL_LIST, payload: resp.data });

      // To check if Capacity Balancing is down
      if (resp.data.talentGrowth) {
        dispatch({ type: actions.GET_TALENT_GROWTH, payload: resp.data.talentGrowth });
      }
      if (resp.data.modellist.length > 0) {
        const ErrorMsg = utility.getWarningMessage('4008');
        dispatch({ type: mutations.SET_WARNING_ERROR, payload: ErrorMsg });
      } else {
        dispatch({ type: actions.RESET_MODEL_STATE, payload: ['active', 'archive', 'warningMsg'] });
      }
      return resp.data;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

// OPT_FORCE as AsyncThunk
export const optForce = createAsyncThunk(
  actions.OPT_FORCE,
  async (params, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState().modeling;
      if (features.may24SimLoader) {
        state.cbloading = true;
      }
      const modelId = { id: params.modelid };
      const response = await axios.post(`/api/simulator/optforce`, modelId);

      if (response.data && response.data.message) {
        dispatch({ type: mutations.SET_INPUT_WARNING, payload: "LiveData" });
        return;
      }
      if (Array.isArray(response.data) && response.data.length === 0) {
        params.type === "unmanagedAttrition"
          ? dispatch({ type: mutations.SET_INPUT_WARNING, payload: "OptforceVolAttr" })
          : dispatch({ type: mutations.SET_INPUT_WARNING, payload: "Optforce" });
        return;
      }
      dispatch({ type: mutations.OPT_FORCE, payload: { respdata: response.data, params } });
      if (!state.refreshedQtrs.length == 0) {
        const qtr = state.refreshedQtrs[0].split("");
        dispatch({
          type: mutations.UPDATE_NONEDITED_QUARTER,
          payload: { fy: params.fy, quarter: qtr[1], selectedfy: params.fyValue }
        });
        dispatch({ type: actions.UPDATE_MODEL });
      }
      return response.data;
    } catch (e) {
      dispatch({ type: mutations.SET_INPUT_WARNING, payload: "LiveData" });
      return rejectWithValue(e);
    }
  }
);

// REVIVE as AsyncThunk
export const revive = createAsyncThunk(
  actions.REVIVE,
  async (Id, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState().modeling;
      const oculusId = Id.oculusId;
      for (const id of Id.modelList) {
        if (features.oct23PyramidIndexSimulator) {
          const response = await axios.get('/api/modeling/mlRatios/' + id);
          await dispatch({
            type: actions.INITIALIZE_MODEL,
            payload: { modelId: id, oculusId: oculusId, isArchive: false, asTotalJoiners: true, isActivating: true }
          });
          dispatch({
            type: mutations.RECALCULATE_MODEL_QUARTER,
            payload: { ratios: response.data[0], isActivating: true }
          });
          state.oculus.details.oculus_id = oculusId;
          dispatch({ type: actions.SAVE_MODEL });
          const { getEHCMLData } = await import('../../../utility/utility.js');
          const EHCdataset = getEHCMLData(state);
          await axios.post('/api/modeling/savemldata/' + id, EHCdataset);
        } else {
          await dispatch({
            type: actions.INITIALIZE_MODEL,
            payload: { modelId: id, oculusId: oculusId, isArchive: false, asTotalJoiners: true, isActivating: true }
          });
          dispatch({ type: mutations.RECALCULATE_MODEL_QUARTER });
          state.oculus.details.oculus_id = oculusId;
          dispatch({ type: actions.SAVE_MODEL });
        }
      }
      return true;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

// GET_OCULUS_LIST as AsyncThunk
export const getOculusList = createAsyncThunk(
  actions.GET_OCULUS_LIST,
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const url = payload.isArchive
        ? `/api/rollup/archived/list/${payload.id}`
        : `/api/rollup/list/${payload.id}`;
      const resp = await axios.get(url);
      dispatch({ type: mutations.GET_OCULUS_LIST, payload: resp.data });
      const oculusNames = resp.data.oculus.map(e => e.modellist);
      const mergedOculus = [].concat.apply([], oculusNames);
      const isModelIntersection = mergedOculus.length > 0;
      const ErrorMsg = isModelIntersection ? utility.getWarningMessage('4009') : false;
      dispatch({ type: mutations.SET_WARNING_ERROR, payload: ErrorMsg ? ErrorMsg : {} });
      return resp.data;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);


// GET_ISMODEL_SAVE as AsyncThunk
export const getIsModelSave = createAsyncThunk(
  actions.GET_ISMODEL_SAVE,
  async (payload, { dispatch }) => {
    dispatch({ type: mutations.GET_ISMODEL_SAVE, payload: payload.flag });
    return true;
  }
);

// RESET_MODEL_STATE as AsyncThunk
export const resetModelState = createAsyncThunk(
  actions.RESET_MODEL_STATE,
  async (resetState, { dispatch }) => {
    dispatch({ type: mutations.RESET_MODEL_STATE, payload: resetState });
    return true;
  }
);

// RESET_MODEL as AsyncThunk
export const resetModel = createAsyncThunk(
  actions.RESET_MODEL,
  async (_, { dispatch }) => {
    dispatch({ type: mutations.RESET_MODEL });
    return true;
  }
);

// DELETE_OCULUS as AsyncThunk
export const deleteOculus = createAsyncThunk(
  actions.DELETE_OCULUS,
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const url = `/api/simulator/${payload.oculusId}/type/${payload.type}`;
      const resp = await axios.delete(url);
      if (resp.data.oculusDeleted) {
        dispatch({ type: mutations.DELETE_OCULUS, payload });
      }
      return resp.data;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

// GET_LIVEFORECAST_DATA as AsyncThunk
export const getLiveForecastData = createAsyncThunk(
  actions.GET_LIVEFORECAST_DATA,
  async (payload, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState().modeling;
      state.original.selectedFY = payload.fyValue;
      if (features.may24SimLoader) {
        state.cbloading = true;
      }
      const resp = await axios.post(`/api/modeling/livedata/${payload.modelingid}`, payload);
      if (resp.data && resp.data.message) {
        dispatch({ type: mutations.SET_INPUT_WARNING, payload: "LiveData" });
      } else {
        const firstMonth = state.original.currFY.firstForecastMonth.toString().slice(-2);
        let firstForecastQuarter = 0;
        constants.quarters.forEach((item) => {
          const isPresent = item['months'].filter(month => month == firstMonth);
          if (isPresent.length !== 0) {
            firstForecastQuarter = item['quarter'];
          }
        });
        const qtr = 'Q' + firstForecastQuarter;
        if (payload.type === "pyramid") {
          dispatch({ type: mutations.GET_LIVEFORECAST_DATA, payload: resp.data });
        } else if (payload.type === 'inQuarterFTE') {
          dispatch({ type: mutations.GET_LIVEFORECAST_INQTR, payload: { data: resp.data, params: payload, quarter: qtr } });
        } else if (payload.type === 'unmanagedAttrition') {
          dispatch({ type: mutations.GET_LIVEFORECAST_ATTRITION, payload: { data: resp.data, params: payload, quarter: qtr } });
        } else {
          dispatch({ type: mutations.GET_LIVEFORECAST_PROMOTIONS, payload: { data: resp.data, params: payload, quarter: qtr } });
        }
        dispatch({
          type: mutations.UPDATE_NONEDITED_QUARTER,
          payload: { fy: state.details.fy, quarter: payload.fyValue === "currFY" ? qtr[1] : "1", selectedfy: payload.fyValue }
        });
        dispatch({ type: actions.UPDATE_MODEL });
      }
      return resp.data;
    } catch (e) {
      dispatch({ type: mutations.SET_INPUT_WARNING, payload: "LiveData" });
      return rejectWithValue(e);
    }
  }
);

// UPDATE_SELECTED_FY as AsyncThunk
export const updateSelectedFY = createAsyncThunk(
  actions.UPDATE_SELECTED_FY,
  async (payload, { dispatch }) => {
    dispatch({ type: mutations.UPDATE_SELECTED_FY, payload });
    return true;
  }
);

// DELETE_ROLLUP_OCULUS as AsyncThunk
export const deleteRollupOculus = createAsyncThunk(
  actions.DELETE_ROLLUP_OCULUS,
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const url = `/api/rollup/${payload.oculusRollupId}/type/${payload.type}`;
      const resp = await axios.delete(url);
      if (resp.data.rollupDeleted) {
        dispatch({ type: mutations.DELETE_ROLLUP_OCULUS, payload });
      }
      return resp.data;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

// UPDATE_QUARTER_LOCKS as AsyncThunk
export const updateQuarterLocks = createAsyncThunk(
  actions.UPDATE_QUARTER_LOCKS,
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      payload.careerlevelgroup = payload.careerlevelgroup != null
        ? constants.clgs.find(x => x.clgKey === payload.careerlevelgroup).clgCode
        : null;
      await axios.post('/api/modeling/updatemodelquarterslockstatus', payload);
      payload.careerlevelgroup = payload.careerlevelgroup != null
        ? constants.clgs.find(x => x.clgCode === payload.careerlevelgroup).clgKey
        : null;
      dispatch({ type: mutations.UPDATE_QUARTER_LOCKS, payload });
      return true;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

// INITIALIZE_SEPARATE_MODEL as AsyncThunk
export const initializeSeparateModel = createAsyncThunk(
  actions.INITIALIZE_SEPARATE_MODEL,
  async (payload, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState().modeling;
      const oculusId = payload.oculusId;
      await dispatch({ type: actions.RESET_MODEL_STATE, payload: ['active', 'archive', 'warningMsg'] });
      dispatch({ type: mutations.RESET_MODEL });
      const oculusDetail = payload.data.oculus.detail;
      const mappedDetails = {
        ph: mapPH(oculusDetail),
        geo: mapLH(oculusDetail),
        contract: oculusDetail.contractbasedcode
      };
      const axiosArray = [];
      for (const data of payload.data.models) {
        dispatch({ type: mutations.INITIALIZE_CLGS, payload: getState().modeling.getters.getClgs(mappedDetails.ph.key, mappedDetails.geo.key) });
        const details = {
          id: oculusId,
          modelingId: data.modeling_id,
          oculusName: oculusDetail.oculus_name,
          oculusDescription: oculusDetail.oculus_description ? oculusDetail.oculus_description : "",
          ph: mappedDetails.ph.title,
          phPath: mappedDetails.ph.path,
          multiPh: oculusDetail.org_hierarchy,
          multilh: oculusDetail.loc_hierarchy,
          geo: mappedDetails.geo.title,
          geoPath: mappedDetails.geo.path,
          contract: mappedDetails.contract,
          lastUpdated: oculusDetail.edit_timestamp,
          modeled: false,
          isarchive: false,
          quarterView: 0,
          modeling_type: data.modeling_type,
          maCost: data.ma_cost
        };
        const dataWithoutEPC = data.metrics.filter(m => m.metric !== "EPC");
        dispatch({ type: mutations.UPDATE_DETAILS, payload: { details, data: dataWithoutEPC } });
        const epcData = data.metrics.filter(m => m.metric === "EPC");
        const leaderData = payload.data.oculus.leadermetrics ? payload.data.oculus.leadermetrics : [];
        const leaderFYData = payload.data.oculus.leaderfymetrics;
        dispatch({
          type: mutations.INITIALIZE_MODEL,
          payload: {
            metricData: dataWithoutEPC,
            epcData: epcData,
            leaderData: leaderData,
            leaderFYData: leaderFYData,
            avgRate: data.leaderfymetricsupdate
          }
        });
        const postData = mapOculus(state);
        axiosArray.push(axios.post('/api/simulator/outputs', postData));
        if (features.jan24ActivateArchivedLiveForecast) {
          const mappedInputs = mapInputs(state);
          mappedInputs.oculus_id = state.details.id;
          axios.post('/api/modeling/inputs', mappedInputs);
        }
        dispatch({ type: mutations.RESET_MODEL });
      }
      await Promise.all(axiosArray);
      return true;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

// SET_OCULUS_TYPE as AsyncThunk
export const setOculusType = createAsyncThunk(
  actions.SET_OCULUS_TYPE,
  async (payload, { dispatch }) => {
    dispatch({ type: mutations.SET_OCULUS_TYPE, payload });
    return true;
  }
);

// SET_OCULUS_BOOKMARK_ERROR as AsyncThunk
export const setOculusBookmarkError = createAsyncThunk(
  actions.SET_OCULUS_BOOKMARK_ERROR,
  async (payload, { dispatch }) => {
    const bookmarkError = payload.isChanged ? true : false;
    const ErrorMsgBookmark = bookmarkError === true ? utility.getWarningMessage('4010') : false;
    dispatch({ type: mutations.SET_OCULUS_BOOKMARK_ERROR, payload: ErrorMsgBookmark ? ErrorMsgBookmark : {} });
    return true;
  }
);

// GET_OCULUS_SHARE_USERS as AsyncThunk
export const getOculusShareUsers = createAsyncThunk(
  actions.GET_OCULUS_SHARE_USERS,
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const resp = await axios.post(`/api/pickers/users`);
      dispatch({ type: mutations.GET_OCULUS_SHARE_USERS, payload: resp.data });
      return resp.data;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);

// OCULUS_SHARE as AsyncThunk
export const oculusShare = createAsyncThunk(
  actions.OCULUS_SHARE,
  async (payload) => {
    return axios.post(`/api/simulator/${payload.oculusId}/share`, { shared_with: payload.sharedwith });
  }
);

// DELETE_OCULUS_SHARE as AsyncThunk
export const deleteOculusShare = createAsyncThunk(
  actions.DELETE_OCULUS_SHARE,
  async (payload) => {
    return axios.post(`/api/simulator/${payload.oculusId}/share`, { delete_oculus: true, shared_with: payload.sharedWith });
  }
);

// VALIDATE_OCULUS_SHARE_USERS as AsyncThunk
export const validateOculusShareUsers = createAsyncThunk(
  actions.VALIDATE_OCULUS_SHARE_USERS,
  async (payload) => {
    return axios.post(`/api/simulator/${payload.oculusId}/share/validation`, { enterpriseid: payload.enterpriseId });
  }
);

// GET_SHARED_OCULUS_HOME as AsyncThunk
export const getSharedOculusHome = createAsyncThunk(
  actions.GET_SHARED_OCULUS_HOME,
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const resp = await axios.get('/api/simulator/share/list');
      dispatch({ type: mutations.GET_SHARED_OCULUS_HOME, payload: resp.data });
      return resp.data;
    } catch (e) {
      return rejectWithValue(e);
    }
  }
);


// GET_TALENT_GROWTH as AsyncThunk
export const getTalentGrowth = createAsyncThunk(
  actions.GET_TALENT_GROWTH,
  async (payload, { getState }) => {
    const state = getState().modeling;
    const finalData = [];
    const currentFY = "20" + state.details.fy;
    const nextFY = "20" + state.details.nextfy;
    if (payload.errorCode && features.jan24TechGlitch) {
      state.talentGrowth = { errorCode: payload.errorCode };
    } else {
      state.oculus.modelList.forEach((item) => {
        const currFYInputs = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
        const nextFYInputs = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
        const orgunitcode = item.org_hierarchy_code ? item.org_hierarchy_code : "0";
        if (checkPHcount(item.modeling_id, state)) {
          let flag = false;
          const filteredPayload = payload.reduce((previtr, curritr) => {
            if (curritr.orgunitcode == orgunitcode) {
              previtr.push(curritr);
            }
            return previtr;
          }, []);
          const rollupData = filteredPayload.filter(isrollup => isrollup.is_rollup == 0);
          const nonrollup = filteredPayload.filter(isNotRollup => isNotRollup.is_rollup == 1);
          const checkVirtualNode = (rollupData.length > 0) ? rollupData : nonrollup;
          checkVirtualNode.forEach((curr) => {
            if (curr.orgunitcode === orgunitcode && curr.quarter.includes(currentFY)) {
              flag = true;
              currFYInputs[curr.quarter.substring(0, 2)] = isNaN(curr.metric) ? 0 : curr.metric * 100;
            }
            if (curr.orgunitcode === orgunitcode && curr.quarter.includes(nextFY)) {
              flag = true;
              nextFYInputs[curr.quarter.substring(0, 2)] = isNaN(curr.metric) ? 0 : curr.metric * 100;
            }
          });
          if (flag) {
            finalData.push({
              modelid: item.modeling_id,
              orgunitcode: orgunitcode,
              inputs: { currFY: currFYInputs, nextFY: nextFYInputs }
            });
          }
        }
      });
      state.talentGrowth = finalData;
    }
    return state.talentGrowth;
  }
);

// GET_TALENT_FROM_STORE as AsyncThunk
export const getTalentFromStore = createAsyncThunk(
  actions.GET_TALENT_FROM_STORE,
  async (_, { getState, dispatch }) => {
    const state = getState().modeling;
    if (features.may24SimLoader) {
      state.cbloading = true;
    }
    if (state.talentGrowth.length === undefined || state.talentGrowth.length === 0) {
      state.cbloading = true;
      state.cbpull = true;
      await dispatch({ type: actions.GET_MODEL_LIST, payload: { id: state.oculus.details.oculus_id, isArchive: false } });
      state.cbloading = false;
      state.cbpull = false;
      if (state.talentGrowth.length === undefined || state.talentGrowth.length === 0) {
        if (state.talentGrowth.errorCode && features.jan24TechGlitch) {
          dispatch({ type: mutations.SET_INPUT_WARNING, payload: state.talentGrowth.errorCode });
        } else {
          dispatch({ type: mutations.SET_INPUT_WARNING, payload: "504" });
        }
      } else {
        await dispatch({ type: actions.GET_TALENT_FROM_STORE });
      }
    } else {
      const inputs = state.talentGrowth.filter((row) => row.modelid === state.details.id);
      if (
        inputs.length === 0 ||
        !checkIfForecastDataZero(inputs[0]["inputs"]["currFY"], inputs[0]["inputs"]["nextFY"], state)
      ) {
        dispatch({ type: mutations.SET_INPUT_WARNING, payload: "504" });
        state.cbloading = false;
      } else {
        const unedited = state.original.currFY.actualForecastQuarterForFY['F'][0];
        dispatch({
          type: mutations.UPDATE_NONEDITED_QUARTER,
          payload: { fy: state.details.fy, quarter: unedited, selectedfy: "currFY" }
        });
        dispatch({ type: mutations.GET_TALENT_FROM_STORE });
        dispatch({ type: actions.UPDATE_MODEL });
      }
    }
    return true;
  }
);

// UPDATE_PROMO_PRIORFY as AsyncThunk
export const updatePromoPriorFY = createAsyncThunk(
  actions.UPDATE_PROMO_PRIORFY,
  async (payload, { getState, dispatch }) => {
    const state = getState().modeling;
    try {
      if (features.may24SimLoader) {
        state.cbloading = true;
      }
      const firstMonth = state.original.currFY.firstForecastMonth.toString().slice(-2);
      let firstForecastQuarter = 0;
      constants.quarters.forEach((item) => {
        const isPresent = item['months'].filter(month => month == firstMonth);
        if (isPresent.length !== 0) {
          firstForecastQuarter = item['quarter'];
        }
      });
      dispatch({ type: mutations.UPDATE_PROMO_PRIORFY, payload });
      dispatch({
        type: mutations.UPDATE_NONEDITED_QUARTER,
        payload: {
          fy: state.details.fy,
          quarter: payload.fyValue === "currFY" ? firstForecastQuarter : "1",
          selectedfy: payload.fyValue
        }
      });
      dispatch({ type: actions.UPDATE_MODEL });
      return true;
    } catch (error) {
      dispatch({ type: mutations.SET_INPUT_WARNING, payload: "LiveData" });
      return false;
    }
  }
);


// --- Example reducers (to be placed in your slice file) ---
export const setModelsHome = (payload) => ({ type: 'modeling/setModelsHome', payload });
export const setSharedOculusHome = (payload) => ({ type: 'modeling/setSharedOculusHome', payload });
export const setActivatedOculusHome = (payload) => ({ type: 'modeling/setActivatedOculusHome', payload });
export const setLiveForecast = (payload) => ({ type: 'modeling/setLiveForecast', payload });
export const setWarningError = (payload) => ({ type: 'modeling/setWarningError', payload });
export const toggleSaving = (payload) => ({ type: 'modeling/toggleSaving', payload });
export const togglePendingChanges = (payload) => ({ type: 'modeling/togglePendingChanges', payload });

// ...repeat for other actions...

// Export all thunks
export default {
  getModelsHome,
  getLiveForecast,
  saveModel,
  // ...other thunks...
};