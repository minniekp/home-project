import React, { useRef, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import utility from '../../utility/utility.js';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const features =
  typeof window !== "undefined" && (window as any).applicationConfig?.features
    ? (window as any).applicationConfig.features
    : {};

function getTooltipLineInfoFromBodyLines(bodyLine: any, isStacked: boolean, index: number) {
  if (isStacked) {
    return {
      key: bodyLine.label.toLowerCase(),
      text: bodyLine.label,
      value: utility.commaSeparator(bodyLine.data[index]),
    };
  }
  const formatted = bodyLine[0].split(': ');
  return {
    key: formatted[0].toLowerCase(),
    text: formatted[0],
    value: utility.commaSeparator(formatted[1]),
  };
}

function getBody(bodyItem: any) {
  return bodyItem.lines;
}

function getToolTip(chartData: any, bodyLines: any, suffix: string) {
  let innerHtml = '';
  const clgDist =
    !chartData.datasets[0][0]?.stack || !(chartData.datasets[0][0]?.stack === 1)
      ? true
      : false;
  if (clgDist) {
    const index =
      chartData.labels.length > 1
        ? chartData.labels.indexOf(chartData.tooltipTitle)
        : 0;
    innerHtml += '<ul class="list-group live-forecast">';
    innerHtml +=
      '<li>' +
      '<span class="matric"> &nbsp; </span>' +
      '<span class="model"> Model </span>' +
      '<span class="forecast"> Live Forecast </span>' +
      '</li>';
    const clgIndex = chartData.datasets[0].length - 1;
    chartData.datasets[0].forEach((item: any, i: number) => {
      const idx = clgIndex - i;
      const lmElement = getTooltipLineInfoFromBodyLines(
        chartData.datasets[0][idx],
        true,
        index
      );
      const modelElement = getTooltipLineInfoFromBodyLines(
        chartData.datasets[1][idx],
        true,
        index
      );
      innerHtml +=
        '<li>' +
        '<span class="matric">' +
        lmElement.text +
        '</span>' +
        '<span class="model">' +
        modelElement.value +
        suffix +
        '</span>' +
        '<span class="forecast">' +
        lmElement.value +
        suffix +
        '</span>' +
        '</li>';
    });
    if (chartData.labels.length > 1 && !suffix.length) {
      innerHtml +=
        '<li>' +
        '<span class="live-total" style="font-weight:bold">' +
        'Total' +
        '</span>' +
        '<span class="model" style="font-weight:bold">' +
        parseFloat(bodyLines[1]).toLocaleString() +
        '</span>' +
        '<span class="forecast" style="font-weight:bold">' +
        parseFloat(bodyLines[0]).toLocaleString() +
        '</span>' +
        '</li>';
    }
  } else {
    innerHtml += '<ul class="list-group live-forecast-clg">';
    innerHtml +=
      '<li class="badge-model"><span class="key"> Model </span><span class="value">' +
      bodyLines[1] +
      suffix +
      '</span></li>' +
      '<li class="badge-live forecast"><span class="key"> Live Forecast </span><span class="value">' +
      bodyLines[0] +
      suffix +
      '</span></li>';
  }
  return innerHtml;
}

const BarChart = ({
  stacked = false,
  legend = true,
  displayYTicks = true,
  suffixSymbol = '',
  liveModelCompare = false,
  chartData = {},
}: {
  stacked?: boolean;
  legend?: boolean;
  displayYTicks?: boolean;
  suffixSymbol?: string;
  liveModelCompare?: boolean;
  chartData?: any;
}) => {
  const chartRef = useRef<any>(null);

  // Custom tooltip logic
  useEffect(() => {
    // react-chartjs-2 v4: chartRef.current is the Chart.js instance
    const chartInstance = chartRef.current && chartRef.current.chartInstance
      ? chartRef.current.chartInstance
      : chartRef.current;
    if (!chartInstance) return;

    chartInstance.options.plugins.tooltip.enabled = false;
    chartInstance.options.plugins.tooltip.external = function (context: any) {
      // Tooltip Element
      let tooltipEl = document.getElementById('chartjs-tooltip');
      // Create element on first render
      if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'chartjs-tooltip';
        tooltipEl.innerHTML = '<div></div>';
        document.body.appendChild(tooltipEl);
      }
      const tooltipModel = context.tooltip;
      // Hide if no tooltip
      if (tooltipModel.opacity === 0) {
        tooltipEl.style.opacity = '0';
        return;
      }
      // Set Text
      if (tooltipModel.body) {
        const chartData = chartInstance.options.plugins.tooltip.chartData;
        let bodyLines = tooltipModel.body.map(getBody);
        const hasBodyLines = bodyLines.length > 0;
        let innerHtml = `<div class="animated fadeInLeftCustom chart-tooltip" aria-hidden="true">
        <span class="arrow" aria-hidden="true"></span>`;

        if (hasBodyLines) {
          if (!chartInstance.options.plugins.tooltip.isStacked) {
            const bodyLineTemp = [
              ['Live Forecast: ' + bodyLines[0]],
              ['Model: ' + bodyLines[1]],
            ];
            bodyLines = bodyLineTemp;
            innerHtml += '<ul class="list-group live-forecast-clg">';
            bodyLines.reverse().forEach((bodyLine: any) => {
              const info = getTooltipLineInfoFromBodyLines(bodyLine, false, 0);
              innerHtml +=
                '<li class="badge-' +
                info.key +
                '"><span class="key">' +
                info.text +
                '</span><span class="value">' +
                info.value +
                chartInstance.options.plugins.tooltip.suffix +
                '</span></li>';
            });
          } else {
            if (!chartInstance.options.plugins.tooltip.liveModelCompare) {
              if (bodyLines.length > 1) {
                innerHtml += '<ul class="list-group legend">';
                bodyLines.reverse().forEach((bodyLine: any) => {
                  const info = getTooltipLineInfoFromBodyLines(bodyLine, true, 0);
                  innerHtml +=
                    '<li class="badge-' +
                    info.key +
                    '">' +
                    info.text +
                    '<span class="value">' +
                    info.value +
                    chartInstance.options.plugins.tooltip.suffix +
                    '</span></li>';
                });
                if (
                  chartData.labels.length > 1 &&
                  !(chartInstance.options.plugins.tooltip.suffix || '').length
                ) {
                  let total = 0;
                  bodyLines.forEach((bodyLine: any) => {
                    const info = getTooltipLineInfoFromBodyLines(bodyLine, true, 0);
                    total += parseFloat(
                      (info.value || '0').toString().replace(/,/g, '')
                    );
                  });
                  innerHtml +=
                    '<li><span class="total" >Total ' +
                    '<span class="value">' +
                    total.toLocaleString() +
                    '</span></span></li>';
                }
              } else {
                innerHtml += '<ul class="list-group not-stacked">';
                innerHtml +=
                  '<li><span class="key">Total' +
                  '</span><span class="value">' +
                  bodyLines[0] +
                  chartInstance.options.plugins.tooltip.suffix +
                  '</span></li>';
              }
              // Add PI logic if needed
            } else {
              const liveModelHtml = getToolTip(
                chartData,
                bodyLines,
                chartInstance.options.plugins.tooltip.suffix
              );
              innerHtml += liveModelHtml;
              // Add PI logic if needed
            }
          }
          innerHtml += '</ul>';
        }
        innerHtml += '</div>';
        const divRoot = tooltipEl.querySelector('div');
        if (divRoot) divRoot.innerHTML = innerHtml;
      }
      // Positioning
      const position = chartInstance.canvas.getBoundingClientRect();
      tooltipEl.style.opacity = '1';
      tooltipEl.style.position = 'absolute';
      tooltipEl.style.zIndex = '1';
      let xp = 0;
      let yp = 0;
      if (position.left > 900) {
        xp = 100;
        yp = 100;
      } else {
        xp = -2;
        yp = 50;
      }
      tooltipEl.style.left =
        position.left - xp + window.pageXOffset + context.tooltip.caretX + 'px';
      tooltipEl.style.top =
        position.top + yp + window.pageYOffset + context.tooltip.caretY + 'px';
      tooltipEl.style.pointerEvents = 'none';
    };
    chartInstance.update();
  }, [chartData, stacked, suffixSymbol, liveModelCompare]);

  // Chart options
const chartOptions: import('chart.js').ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: legend,
        position: 'bottom' as const,
      },
      tooltip: {
        enabled: false,
        mode: 'index' as const,
      },
    },
    layout: {
      padding: { left: 18, right: 18, top: 0, bottom: 8 },
    },
    scales: {
      y: {
        stacked: stacked && !liveModelCompare,
        display: true,
        grid: {
        },
        ticks: {
          font: {
            family: 'Graphik-Regular',
            size: 11,
          },
          maxTicksLimit: 3,
          padding: 10,
          display: displayYTicks,
          color: '#000',
          callback: function (value: any) {
            return utility.commaSeparator(value) + suffixSymbol;
          },
        },
      },
      y1: {
        stacked: false,
        display: false,
        grid: {
        },
        ticks: {
          font: {
            family: 'Graphik-Regular',
            size: 11,
          },
          maxTicksLimit: 3,
          padding: 10,
          display: displayYTicks,
          color: '#000',
        },
      },
      x: {
        stacked: liveModelCompare ? true : stacked,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Graphik-Regular',
            size: 11,
          },
          color: '#000',
        },
          },
    },
  };

  return (
    <div style={{ height: '25%', width: '25%' }}>
      <Bar
        ref={chartRef}
        data={chartData}
        options={chartOptions}
      />
    </div>
  );
};

export default BarChart;