import { combineReducers } from 'redux';


// Initial root state (from Vuex state)
const initialState = {
  useraccess: [],
  typeValue: {
    type: 'Dynamic Outcome Simulator'
  },
  simulatorValue: {
    type: 'Simulate'
  },
  uiprefs: {
    forecast: {
      detail: {
        expanded: true
      },
      grid: {
        showActuals: true,
        metricsWidth: 0,
        columns: [],
        quarters: [],
        actualQuarters: [],
        cachedQuartersState: [],
        fiscalYears: []
      }
    }
  },
  downloads: [],
  activejobs: [],
  data: []
};

// Root reducer for non-module state
function rootReducer(state = initialState, action) {
  switch (action.type) {
    // Add cases for actions that affect root state here
    default:
      return state;
  }
}

// Combine all reducers
const rootCombinedReducer = combineReducers({
  root: rootReducer,
});

export default rootCombinedReducer;