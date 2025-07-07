import constants from './constants.js';

export default {
    commaSeparator: function(value) {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    acquireTokenPopup: function(modal) {
        return new Promise((resolve,reject)=>{
            modal.$children[0].$data.active = true;

            modal.$once('close', function () {
                modal.$children[0].$data.active = false;
                reject();
            });

            modal.$once('token', function(token) {
                modal.$children[0].$data.active = false;
                resolve(token);
            })
        })
    },
    acquireTokenSilent: function() {
        return Promise.resolve(window.localStorage['access_token']);
    },
    round: function(value, precision) {
        // i.e. =>
        //          (23.387, 0) -> 23
        //          (23.387, 1) -> 23.4
        //          (23.387, ) -> 23.39
        const multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    },
    clone: function(obj) {
        let copy;

        // Handle the 3 simple types, and null or undefined
        if (null == obj || "object" != typeof obj) { return obj; }

        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }

        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            for (let i = 0, len = obj.length; i < len; i++) {
                copy[i] = this.clone(obj[i]);
            }
            return copy;
        }

        // Handle Object
        if (obj instanceof Object) {
            copy = {};
            for (const attr in obj) {
                if (obj.hasOwnProperty(attr)) { copy[attr] = this.clone(obj[attr]); }
            }
            return copy;
        }
        throw new Error("Unable to copy obj! Its type isn't supported.");
    },
    downloadFile: function(filename, data, contenttype) {
        var a = document.createElement('a');
        if (navigator.msSaveBlob) { // IE10
            navigator.msSaveBlob(new Blob([data], {
                type: contenttype
            }), filename);
        } else if (URL && 'download' in a) { // html5 A[download]
            a.href = URL.createObjectURL(new Blob([data], {
                type: contenttype
            }));
            a.setAttribute('download', filename);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            location.href = 'data:application/octet-stream,' + encodeURIComponent(data); // only this mime type is supported
        }
    },
    convertToLocalDatetime: function(dateString) {
        const dt = new Date(dateString);
        function formatAMPM(date) {
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var seconds = date.getSeconds();
            var ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            seconds = seconds < 10 ? '0' + seconds : seconds;

            var strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
            return strTime;
        }
        return (dt.getMonth() + 1) + "/" + dt.getDate() + "/" + dt.getFullYear() + " " + formatAMPM(dt);
    },
    sort: function (array, prop, sortOrder) {
        function predicateBy(predicateProp) {
            return function(a,b) {
                if (a[predicateProp].toLowerCase() > b[predicateProp].toLowerCase()) {
                    return 1;
                } else if (a[predicateProp].toLowerCase() < b[predicateProp].toLowerCase()) {
                    return -1;
                }
                return 0;
            }
        }
        const sortedArr = array.sort(predicateBy(prop));
        if (sortOrder != "desc") { return sortedArr; }
        else { return sortedArr.reverse(); }
    },
    /**
     * Gets the array of columns to display in the grid
     * @param {*} targetQs The quarter object
     * @param {*} forecastDate The last actuals date
     */
    getColumns: function(targetQs, forecastDate, columnWidth) {
        const columns = [];
        let actuals = forecastDate ? true : false;
        let currentMonth = 0;
        let currentFiscalYear = 0;
        let currentYear = 0;
        let colWidth;
        if (applicationConfig.features.nov22ChargeabilityVarianceToTarget) {
            if  (columnWidth) {
                colWidth = columnWidth;
            } else {
                colWidth = constants.gridSizes.defaultColumnWidth;
            }
        } else {
            colWidth = constants.gridSizes.defaultColumnWidth;
        }

        if (forecastDate) {
            // Calculate forecast month, natural year and fiscal year
            currentMonth = parseInt(forecastDate.substring(4)) + 1;
            currentYear = parseInt(forecastDate.substring(0, 4)) - 2000;
            if (currentMonth == 13) {
                currentMonth = 1;
                currentYear++;
            }
            currentFiscalYear = (currentMonth >= 9) ? currentYear + 1 : currentYear;
        }

        for (let i = 0; i < targetQs.length; i++) {
            const currQ = targetQs[i];
            if (currQ.isExpandable) {
                // Add all months of each quarter
                for (let j = 0; j < currQ.months.length; j++) {
                    const month = currQ.months[j];
                    let year = currQ.year;
                    if (month >= 9) { year = year - 1; }
                    // When we reach the current month and year, data stops being actuals and start being forecast
                    if (actuals && (year >= currentYear && month >= currentMonth)) {
                        actuals = false;
                    }
                    columns.push({
                        key: 'fy' + currQ.year + 'q' + currQ.quarter + 'm' + currQ.months[j],
                        name: constants.months[month - 1] + ' ' + year,
                        visible: !actuals || currQ.firstForecastMonth > 0,
                        isActuals: actuals,
                        width: colWidth
                    });
                }
                // Add quarter column
                columns.push({
                    key: 'fy' + currQ.year + 'q' + currQ.quarter,
                    name: 'Q' + currQ.quarter + ' ' + currQ.year,
                    visible: actuals,
                    isActuals: actuals,
                    width: colWidth
                });
            } else {
                // Add unexpandable quarter column
                columns.push({
                    key: 'fy' + currQ.year + 'q' + currQ.quarter,
                    name: 'Q' + currQ.quarter + ' ' + currQ.year,
                    visible: true,
                    isActuals: false,
                    width: colWidth
                });
            }
            // Add fiscal year
            if (currQ.quarter == 4) {
                columns.push({
                    key: 'fy' + currQ.year,
                    name: 'FY ' + currQ.year,
                    visible: true,
                    isActuals: currQ.year >= currentFiscalYear ? false : true,
                    width: colWidth
                });
            }
        }
        return columns;
    },
    getForecastQuartersDropDown: function(targetQs, res, forecastDate) {
        const columns = [];
        let actuals = forecastDate ? true : false;
        let currentMonth = 0;
        let currentYear = 0;

        if (forecastDate) {
            // Calculate forecast month, natural year and fiscal year
            currentMonth = parseInt(forecastDate.substring(4)) + 1;
            currentYear = parseInt(forecastDate.substring(0, 4)) - 2000;
            if (currentMonth == 13) {
                currentMonth = 1;
                currentYear++;
            }
        }

        for (let i = 0; i < targetQs.length; i++) {
            const currQ = targetQs[i];
            if (currQ.isExpandable) {
                // Add all months of each quarter
                for (let j = 0; j < currQ.months.length; j++) {
                    const month = currQ.months[j];
                    let year = currQ.year;
                    if (month >= 9) { year = year - 1; }
                    // When we reach the current month and year, data stops being actuals and start being forecast
                    if (actuals && (year >= currentYear && month >= currentMonth)) {
                        actuals = false;
                    }
                    // To map the quater range response with month and qaurter from targetQs
                    for (let k = 0; k < res.length; k++) {
                        const yearData = res[k].fy;
                        const yearvalData = yearData.toString().substring(2);
                        if (!actuals ? res[k].source = "forecast" : res[k].source = "actuals")
                        { if (res[k].quarter == currQ.quarter && yearvalData == year) {
                            columns.push({
                                quarter: res[k].quarter,
                                fy: res[k].fy,
                                ispartialquarter: res[k].ispartialquarter,
                                iscurrentquarter: res[k].iscurrentquarter,
                                effectivedate: res[k].effectivedate,
                                source: res[k].source,
                                disabled: false,
                                key: 'fy' + currQ.year + 'q' + currQ.quarter + 'm' + currQ.months[j],
                                value: constants.months[month - 1] + ' ' + year,
                                visible: !actuals || currQ.firstForecastMonth > 0,
                                isActuals: actuals
                            });
                        } }
                    }
                }
            } else {
                // Add unexpandable quarter column
                for (let k = 0; k < res.length; k++) {
                    const yearData = res[k].fy;
                    const yearvalData = yearData.toString().substring(2);
                    if (res[k].quarter == currQ.quarter && yearvalData == currQ.year) {
                        columns.push({
                            quarter: res[k].quarter,
                            fy: res[k].fy,
                            ispartialquarter: res[k].ispartialquarter,
                            iscurrentquarter: res[k].iscurrentquarter,
                            effectivedate: res[k].effectivedate,
                            source: res[k].source,
                            disabled: false,
                            key: 'fy' + currQ.year + 'q' + currQ.quarter,
                            value: 'Q' + currQ.quarter + ' ' + currQ.year,
                            visible: true,
                            isActuals: false,
                        });
                    } }
            }
        }
        return columns;
    },
    /**
     * Returns a forecast object as it was before the change (removing actual quarters and months)
     * @param {*} fullQuarters The full quarters object (includes actuals and forecast quarters)
     */
    getForecastQuarters: function(fullQuarters) {
        const forecastQuarters = [];
        let actuals = true;
        for (let quarterIndex = 0;quarterIndex < fullQuarters.length;quarterIndex++) {
            const quarter = fullQuarters[quarterIndex];
            if (quarter.firstForecastMonth >= 0) {
                actuals = false;
            }
            if (!actuals) {
                forecastQuarters.push(module.exports.clone(quarter));
            }
        }
        // Remove actual months from the current quarter "months" array
        if (forecastQuarters[0] && forecastQuarters[0].months) { forecastQuarters[0].months.splice(0, forecastQuarters[0].firstForecastMonth); }
        return forecastQuarters.length > 0 ? forecastQuarters : fullQuarters;
    },
    /**
     * Returns an object with fical years info
     * @param {*} fullQuarters The full quarters object (includes actuals and forecast quarters)
     * @param {string} forecastDate The last actuals date (i.e. "201812")
     */
    getFiscalYears: function(fullQuarters, forecastDate) {
        const lastFYsQuarter = fullQuarters.filter(function (q) {
            return q.quarter == 4 && q.months.length > 0
        });
        return lastFYsQuarter.map(function (q) {
            const lastMonthInQuarter = q.months[q.months.length - 1];
            const formatedMonth = (lastMonthInQuarter < 10 ? ("0" + lastMonthInQuarter) : (lastMonthInQuarter)).toString();
            const lastFYMonth = (2000 + q.year).toString() + formatedMonth;
            return {
                isActualFY: parseInt(lastFYMonth, 10) <= parseInt(forecastDate, 10),
                expanded: true,
                fiscalYear: q.year
            }
        });
    },
    /**
     * Returns a full list of quarters, including actual and forecast quarters
     * @param {*} forecastDate The last actuals date
     */
    getTargetQuarters: function(forecastDate) {
        let currentMonth = parseInt(forecastDate.substring(4)) + 1;
        let currentYear = parseInt(forecastDate.substring(0, 4)) - 2000;
        if (currentMonth >= 9) { currentYear += 1; }
        if (currentMonth == 13) { currentMonth = 1; }

        // Determine current quarter
        let currentQuarter = 0;
        for (let i = 0; i < constants.quarters.length; i++) {
            const q = constants.quarters[i];
            if (q.months.includes(currentMonth)) {
                currentQuarter = q.quarter;
                break;
            }
        }
        // Determine final quarter and FY (so we know when to stop calculating quarters)
        const finalQuarter = currentQuarter == 4 ? 1 : currentQuarter + 1;
        const initialFY = currentYear - 1;
        const finalFY = currentQuarter == 4 ? currentYear + 2 : currentYear + 1;
        let actuals = true;

        // Get target quarters
        const targetQs = [];
        for (let FYCounter = initialFY;FYCounter <= finalFY; FYCounter++) {
            for (let q = 1; q <= 4;q++) {
                // Push each quarter into the table until we reach the final quarter/FY
                const quarter = {
                    quarter: q,
                    year: FYCounter,
                    months: constants.quarters[q - 1].months,
                    expanded: !actuals,
                    isExpandable: true
                };
                if (q == currentQuarter && FYCounter == currentYear) {
                    quarter.firstForecastMonth = quarter.months.indexOf(currentMonth);
                    actuals = false;
                    quarter.expanded = true;
                }
                targetQs.push(quarter);
                if (FYCounter == finalFY && q == finalQuarter) { break; }
            }
        }
        // Collapse the last four quarters
        for (let i = 1;i <= 4;i++) {
            targetQs[targetQs.length - i].expanded = false;
            targetQs[targetQs.length - i].isExpandable = false;
        }

        return targetQs;
    },
    /**
     * Returns current FY based on Date Now
     */
    getCurrentFYDate: function() {
        const date = new Date();
        const currentYear = date.getFullYear();
        const month = date.getMonth() + 1;
        const currentFY = currentYear + ((month >= 9 && month <= 12) ? 1 : 0);
        return parseInt(currentFY.toString().substring(2));
    },
    /**
     * Returns the current FY for a yearmonth given
     * @param {string|number} yearmonth yearmonth i.e "201905"
     */
    getFYfromYearMonth: function(yearmonth) {
        const year = parseInt(yearmonth.toString().substring(2, 4));
        const month = parseInt(yearmonth.toString().substring(4));
        return year + ((month >= 9 && month <= 12) ? 1 : 0);
    },
    /**
     * Returns the upper CLG code for a CLG code given
     * @param {string} CLGCode CLG code
     */
    getUpperCLGCode: function(CLGCode) {
        const clgCodes = constants.clgCodes;
        const index = clgCodes.indexOf(CLGCode);
        return index > 0 ? clgCodes[index - 1] : null;
    },
    /**
     * Returns the upper CLG code for actuals for a CLG code given for getPROCLGValue() from forecast_calc.js
     * @param {string} CLGCode CLG code
     */
    getActualsUpperCLGCode: function(CLGCode,clgCodes) {
        const index = clgCodes.indexOf(CLGCode);
        return index > 0 ? clgCodes[index - 1] : null;
    },
    /**
     * Returns the lower CLG code for a CLG code given
     * @param {string} CLGCode CLG code
     */
    getLowerCLGCode: function(CLGCode) {
        const clgCodes = constants.clgCodes;
        const index = clgCodes.indexOf(CLGCode);
        return index > 0 ? clgCodes[index + 1] : null;
    },
    /**
     * Returns the lowest CL code for a given CLG code
     * @param {string} CLGCode CLG code
     */
    getLowestCLCode: function(CLGCode) {
        const clgTree = constants.clgTreeCodes;
        const clgFiltered = clgTree.filter(function(clg) { return clg.clgCode == CLGCode; });
        return (clgFiltered.length > 0) ? clgFiltered[0].clCodes[clgFiltered[0].clCodes.length - 1] : null;
    },
    getErrormessage: function(errId) {
        const errmsgs = constants.errormessages;
        const errmsgfiltered = errmsgs.filter(function(err) { return err.errorid == errId; });
        return (errmsgfiltered.length > 0) ? errmsgfiltered[0].errormsg : "Error" ;
    },
    getWarningMessage: function(errId) {
        const errmsgs = constants.errormessages;
        const errmsgfiltered = errmsgs.filter(function(err) { return err.errorid == errId; });
        return (errmsgfiltered.length > 0) ? errmsgfiltered[0] : {};
    },
    checkIfFeatureDisabled: function (featuresArray, featureName) {
        const feature = featuresArray.find(o=>o.feature_name == featureName);
        return (feature && feature.enabled == 0) ? true : false;
    },

    /**
     * Simple object check.
     * @param item
     * @returns {boolean}
     */
    isObject: function(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    },

    /**
     * Deep merge two objects.
     * @param target
     * @param ...sources
     */
    mergeDeep: function(target, ...sources) {
        if (!sources.length) { return target; }
        const source = sources.shift();

        if (module.exports.isObject(target) && module.exports.isObject(source)) {
            for (const key in source) {
                if (module.exports.isObject(source[key])) {
                    if (!target[key]) { Object.assign(target, { [key]: {} }); }
                    module.exports.mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }
        return module.exports.mergeDeep(target, ...sources);
    },
    replaceValueByComma: function(value) {
        return  value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    pushCustomEventDD: function(event,page) {
        if (DD_RUM != undefined) {
            DD_RUM.onReady(function () {
                DD_RUM.addAction(event,{page: page})
            });
        }
    },
    sumOfObj: function (...objs) {
        return objs.reduce((a, b) => {
            // eslint-disable-next-line guard-for-in
            for (const k in b) {
                a[k] = (a[k] || 0) + b[k];
            }
            return a;
        }, {});
    },

    sumOfobjects: function (ob1, ob2) {
        const sum = {};

        Object.keys(ob1).forEach(key => {
            if (ob2.hasOwnProperty(key)) {
                sum[key] = ob1[key] + ob2[key]
            }
        })
        return sum;
    },
    sanitizeHtmlData: function(data) {
        if (data) {
            data = data.replace(/</g,"&lt");
            data = data.replace(/>/g,"&gt");
            data = data.replace(/'/g,"&apos");
            data = data.replace(/"/g,"&quot");
            data = data.replace(/\//g,"&#x2F");
        }
        return data;
    },
    sanitizeHtmlReverseData: function (data) {
        if (data) {
            data = data.replace(/&lt/g,"<");
            data = data.replace(/&gt/g,">");
            data = data.replace(/&apos/g,"'");
            data = data.replace(/&quote/g,'"');
            data = data.replace(/&#x2F/g,"/");
        }
        return data;
    }

};

