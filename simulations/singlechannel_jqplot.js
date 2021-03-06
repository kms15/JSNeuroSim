/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';
    
    var params, layout, controlsPanel, controls, dataPanel, mGateDataTable,
        hGateDataTable, currentDataTable, voltageDataTable,
        tMax = 1000e-3, plotHandles = []; 

    // set up the controls for the passive membrane simulation
    params = { 
        m_gates: { label: 'Number of activation gates',
            defaultVal: 3, minVal: 0, maxVal: 10 },
        h_gates: { label: 'Number of inactivation gates', 
            defaultVal: 1, minVal: 0, maxVal: 10 },
        E_rev_mV: { label: 'Channel reversal potential', units: 'mV',
            defaultVal: 0, minVal: -1000, maxVal: 1000 }, 
        g_channel_pS: { label: 'Open channel conductance', units: 'pS', 
            defaultVal: 10, minVal: 0.1, maxVal: 1000 },

        V_hold_mV: { label: 'Holding potential', units: 'mV', 
            defaultVal: -100, minVal: -1000, maxVal: 1000 },
        t_step_ms: { label: 'Step delay', units: 'ms', 
            defaultVal: 0.5, minVal: 0, maxVal: tMax / 1e-3 },
        V_step_mV: { label: 'Step potential', units: 'mV', 
            defaultVal: 100, minVal: -1000, maxVal: 1000 },

        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 4, minVal: 0, maxVal: tMax / 1e-3 }
    };
    layout = [
        ['Channel Properties', ['m_gates', 'h_gates', 'E_rev_mV', 
            'g_channel_pS']],
        ['Voltage Clamp', ['V_hold_mV', 't_step_ms', 'V_step_mV']],
        ['Simulation Settings', ['totalDuration_ms']]
    ];
    controlsPanel = document.getElementById('SingleChannelControls');

    // prepare tables for displaying captured data points
    dataPanel = document.getElementById('SingleChannelData');
    dataPanel.className = 'datapanel';

    mGateDataTable = document.createElement('table');
    mGateDataTable.className = 'datatable';
    dataPanel.appendChild(mGateDataTable);

    hGateDataTable = document.createElement('table');
    hGateDataTable.className = 'datatable';
    dataPanel.appendChild(hGateDataTable);

    currentDataTable = document.createElement('table');
    currentDataTable.className = 'datatable';
    dataPanel.appendChild(currentDataTable);

    voltageDataTable = document.createElement('table');
    voltageDataTable.className = 'datatable';
    dataPanel.appendChild(voltageDataTable);

    // simulate and plot a simple harmonic oscillator
    function runSimulation() {

        var params = controls.values, t, m_gates, h_gates, channel_open, V, I,
            m_gates_time, h_gates_time, V_mV, I_pA,
            eventTimeFuncs = [], eventFuncs = [], 
            t_next, t_event, nextEventFunc, done = false, i, j,
            plotPanel, plot, title;

        // set up the simulation
        j = 0;
        params = controls.values;
        t = [0];
        m_gates = [];
        for (i = 0; i < params.m_gates; i += 1) {
            m_gates[i] = [0];
        }
        h_gates = [];
        for (i = 0; i < params.h_gates; i += 1) {
            h_gates[i] = [1];
        }
        V = [params.V_hold_mV * 1e-3];
        channel_open = [1];
        for (i = 0; i < params.m_gates; i += 1) {
            if (!m_gates[i][j]) {
                channel_open[j] = 0;
            }
        }
        for (i = 0; i < params.h_gates; i += 1) {
            if (!h_gates[i][j]) {
                channel_open[j] = 0;
            }
        }
        I = [channel_open[j] * (V[j] - params.E_rev_mV * 1e-3) *
            params.g_channel_pS * 1e-12];
        
        // add the "end simulation" event
        eventTimeFuncs.push(function (t) { 
            return params.totalDuration_ms * 1e-3; 
        });
        eventFuncs.push(function (t) { 
            done = true;
        });
        
        // add the voltage step event
        eventTimeFuncs.push(function (t) { 
            if (t < params.t_step_ms * 1e-3) {
                return params.t_step_ms * 1e-3;
            } else {
                return Infinity;
            }
        });
        eventFuncs.push(function (t) { 
            V[V.length - 1] = params.V_step_mV * 1e-3;
        });

        // add the activation gate change events
        function eventTimeFuncM(i) {
            return function (t) {
                var rate;
                if (m_gates[i][m_gates[i].length - 1]) {
                    rate = electrophys.hhNaConductance.beta_m(V[V.length - 1]);
                } else {
                    rate = electrophys.hhNaConductance.alpha_m(V[V.length - 1]);
                }
                return -Math.log(Math.random()) / rate + t;
            };
        }
        function eventFuncM(i) {
            return function (t) {
                if (m_gates[i][m_gates[i].length - 1]) {
                    m_gates[i][m_gates[i].length - 1] = 0;
                } else {
                    m_gates[i][m_gates[i].length - 1] = 1;
                }
            };
        }
        for (i = 0; i < params.m_gates; i += 1) {
            eventTimeFuncs.push(eventTimeFuncM(i));
            eventFuncs.push(eventFuncM(i));
        }

        // add the inactivation gate change events
        function eventTimeFuncH(i) {
            return function (t) {
                var rate;
                if (h_gates[i][h_gates[i].length - 1]) {
                    rate = electrophys.hhNaConductance.beta_h(V[V.length - 1]);
                } else {
                    rate = electrophys.hhNaConductance.alpha_h(V[V.length - 1]);
                }
                return -Math.log(Math.random()) / rate + t;
            };
        }
        function eventFuncH(i) {
            return function (t) {
                if (h_gates[i][h_gates[i].length - 1]) {
                    h_gates[i][h_gates[i].length - 1] = 0;
                } else {
                    h_gates[i][h_gates[i].length - 1] = 1;
                }
            };
        }
        for (i = 0; i < params.h_gates; i += 1) {
            eventTimeFuncs.push(eventTimeFuncH(i));
            eventFuncs.push(eventFuncH(i));
        }


        // simulate the channel
        while (!done) {
            t_next = Infinity;
            for (i = 0; i < eventTimeFuncs.length; i += 1) {
                t_event = eventTimeFuncs[i](t[j]);
                if (t_event < t_next) {
                    t_next = t_event;
                    nextEventFunc = eventFuncs[i];
                }
            }

            j += 2;
            t[j - 1] = t_next;
            t[j] = t_next;

            for (i = 0; i < params.m_gates; i += 1) {
                m_gates[i][j - 1] = m_gates[i][j - 2];
                m_gates[i][j] = m_gates[i][j - 2];
            }
            for (i = 0; i < params.h_gates; i += 1) {
                h_gates[i][j - 1] = h_gates[i][j - 2];
                h_gates[i][j] = h_gates[i][j - 2];
            }
            V[j - 1] = V[j - 2];
            V[j] = V[j - 2];
   
            nextEventFunc();
   
            channel_open[j - 1] = channel_open[j - 2];
            channel_open[j] = 1;
            for (i = 0; i < params.m_gates; i += 1) {
                if (!m_gates[i][j]) {
                    channel_open[j] = 0;
                }
            }
            for (i = 0; i < params.h_gates; i += 1) {
                if (!h_gates[i][j]) {
                    channel_open[j] = 0;
                }
            }
            I[j - 1] = I[j - 2];
            I[j] = [channel_open[j] * (V[j] - params.E_rev_mV * 1e-3) *
                params.g_channel_pS * 1e-12];
        }
        

        // convert to the right units
        // each ordered pair consists of a time and another variable
        V_mV = [];
        I_pA = [];
        m_gates_time = [];
        h_gates_time = [];
        for (j = 0; j < m_gates.length; j += 1) {
            m_gates_time[j] = [];
        }
        for (j = 0; j < h_gates.length; j += 1) {
            h_gates_time[j] = [];
        }
        for (i = 0; i < t.length; i += 1) {
            V_mV.push([t[i] / 1e-3, V[i] / 1e-3]);
            I_pA.push([t[i] / 1e-3, I[i] / 1e-12]);
            for (j = 0; j < m_gates.length; j += 1) {
                m_gates_time[j].push([t[i] / 1e-3, m_gates[j][i]]);
            }
            for (j = 0; j < h_gates.length; j += 1) {
                h_gates_time[j].push([t[i] / 1e-3, h_gates[j][i]]);
            }
        }

        // free resources from old plots
        while (plotHandles.length > 0) {
            plotHandles.pop().destroy();
        }

        // plot the results
        plotPanel = document.getElementById('SingleChannelPlots');
        plotPanel.innerHTML = '';

        // m Gates
        title = document.createElement('h4');
        title.innerHTML = 'Activation Gates';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        for (j = 0; j < m_gates_time.length; j += 1) {
            plot = document.createElement('div');
            plot.id = 'mGatePlot' + j;
            plot.style.width = '425px';
            plot.style.height = '60px';
            plotPanel.appendChild(plot);
            plotHandles.push(
                $.jqplot('mGatePlot' + j, [m_gates_time[j]], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                    axesDefaults: {
                        showTicks: false,
                    },
                    axes: {
                        yaxis: {
                            min: -0.5, max: 1.5,
                        },
                    },
                    series: [
                        {label: 'm', color: 'black'},
                    ],
            })));
            graphJqplot.bindDataCapture('#mGatePlot' + j, mGateDataTable, title.innerHTML, 'Time');
            graphJqplot.bindCursorTooltip('#mGatePlot' + j, 'Time', 'ms', '');
        }

        // h Gates
        title = document.createElement('h4');
        title.innerHTML = 'Inactivation Gates';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        for (j = 0; j < h_gates_time.length; j += 1) {
            plot = document.createElement('div');
            plot.id = 'hGatePlot' + j;
            plot.style.width = '425px';
            plot.style.height = '60px';
            plotPanel.appendChild(plot);
            plotHandles.push(
                $.jqplot('hGatePlot' + j, [h_gates_time[j]], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                    axesDefaults: {
                        showTicks: false,
                    },
                    axes: {
                        yaxis: {
                            min: -0.5, max: 1.5,
                        },
                    },
                    series: [
                        {label: 'h', color: 'black'},
                    ],
            })));
            graphJqplot.bindDataCapture('#hGatePlot' + j, hGateDataTable, title.innerHTML, 'Time');
            graphJqplot.bindCursorTooltip('#hGatePlot' + j, 'Time', 'ms', '');
        }

        // Current
        title = document.createElement('h4');
        title.innerHTML = 'Channel Current';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        plot = document.createElement('div');
        plot.id = 'currentPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('currentPlot', [I_pA], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Channel Current (pA)'},
                },
                series: [
                    {label: 'I', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#currentPlot', currentDataTable, title.innerHTML, 'Time');
        graphJqplot.bindCursorTooltip('#currentPlot', 'Time', 'ms', 'pA');

        // Voltage
        title = document.createElement('h4');
        title.innerHTML = 'Clamp Potential';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);
        plot = document.createElement('div');
        plot.id = 'voltagePlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('voltagePlot', [V_mV], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Clamp Potential (mV)'},
                },
                series: [
                    {label: 'V<sub>m</sub>', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#voltagePlot', voltageDataTable, title.innerHTML, 'Time');
        graphJqplot.bindCursorTooltip('#voltagePlot', 'Time', 'ms', 'mV');
    }


    function reset() {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
    }


    function clearDataTables() {
        mGateDataTable.innerHTML = '';
        mGateDataTable.style.display = 'none';

        hGateDataTable.innerHTML = '';
        hGateDataTable.style.display = 'none';

        currentDataTable.innerHTML = '';
        currentDataTable.style.display = 'none';

        voltageDataTable.innerHTML = '';
        voltageDataTable.style.display = 'none';

        gateDataTable.innerHTML = '';
        gateDataTable.style.display = 'none';
    }


    (document.getElementById('SingleChannelRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('SingleChannelResetButton')
        .addEventListener('click', reset, false));
    (document.getElementById('SingleChannelClearDataButton')
        .addEventListener('click', clearDataTables, false));
    
    // make the enter key run the simulation  
    controlsPanel.addEventListener('keydown',  
        function (evt, element) {
            if (evt.keyCode === 13) { // enter was pressed 
                controls.triggerRead();
                runSimulation();
                return false;
            }
        }, true);

    reset();
    clearDataTables();
   
}, false);
