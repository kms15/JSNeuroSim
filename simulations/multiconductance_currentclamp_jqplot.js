/*jslint browser: true */
/*global ode: true, graph: true, simcontrols: true, electrophys: true, 
   componentModel: true */

// wait until the document has loaded
window.addEventListener('load', function () {
    'use strict';

    var params, layout, controlsPanel, controls, dataPanel, voltageDataTable,
        stimDataTable, currentHHDataTable, conductanceHHDataTable, gateHHDataTable,
        currentNaPandADataTable, conductanceNaPandADataTable, gateNaPandADataTable,
        currentSagDataTable, conductanceSagDataTable, gateSagDataTable,
        currentCaDataTable, conductanceCaDataTable, gateCaDataTable,
        tMax = 1000e-3, plotHandles = []; 

    // set up the controls for the passive membrane simulation
    params = { 
        C_nF: { label: 'Membrane capacitance', units: 'nF',
            defaultVal: 0.04, minVal: 0.01, maxVal: 100 }, 
        g_leak_uS: { label: 'Leak conductance', units: '\u00B5S', 
            defaultVal: 0.005, minVal: 0, maxVal: 100 }, 
        E_leak_mV: { label: 'Leak potential', units: 'mV',
            defaultVal: -50, minVal: -1000, maxVal: 1000 }, 
        E_K_mV: { label: 'Potassium Nernst potential', units: 'mV',
            defaultVal: -80, minVal: -1000, maxVal: 1000},
        g_K_uS: { label: 'Delayed rectifier potassium conductance', units: '\u00B5S',
            defaultVal: 1.3, minVal: 0, maxVal: 100},
        g_A_uS: { label: 'Fast transient potassium conductance', units: '\u00B5S',
            defaultVal: 1.0, minVal: 0, maxVal: 100},
        E_Na_mV: { label: 'Sodium Nernst potential', units: 'mV',
            defaultVal: 60, minVal: -1000, maxVal: 1000},
        g_Na_uS: { label: 'Fast transient sodium conductance', units: '\u00B5S',
            defaultVal: 0.7, minVal: 0, maxVal: 100},
        g_NaP_uS: { label: 'Persistent sodium conductance', units: '\u00B5S',
            defaultVal: 0.05, minVal: 0, maxVal: 100},
        E_H_mV: { label: 'H-current Nernst potential', units: 'mV',
            defaultVal: -38.8, minVal: -1000, maxVal: 1000},
        g_H_uS: { label: 'H-current conductance', units: '\u00B5S',
            defaultVal: 0.005, minVal: 0, maxVal: 100},
        E_Ca_mV: { label: 'Calcium Nernst potential', units: 'mV',
            defaultVal: 40, minVal: -1000, maxVal: 1000},
        g_T_uS: { label: 'T-current conductance', units: '\u00B5S',
            defaultVal: 0.1, minVal: 0, maxVal: 100},
        g_N_uS: { label: 'N-current conductance', units: '\u00B5S',
            defaultVal: 0.05, minVal: 0, maxVal: 100},
        pulseStart_ms: { label: 'Stimulus delay', units: 'ms', 
            defaultVal: 10, minVal: 0, maxVal: tMax / 1e-3 },
        pulseHeight_nA: { label: 'Stimulus current', units: 'nA', 
            defaultVal: 10, minVal: -1000, maxVal: 1000 },
        pulseWidth_ms: { label: 'Pulse duration', units: 'ms', 
            defaultVal: 4, minVal: 0, maxVal: tMax / 1e-3 },
        isi_ms: { label: 'Inter-stimulus interval', units: 'ms', 
            defaultVal: 1, minVal: 0, maxVal: tMax / 1e-3 },
        numPulses: { label: 'Number of pulses', units: '', 
            defaultVal: 1, minVal: 0, maxVal: 100 },
        totalDuration_ms: { label: 'Total duration', units: 'ms', 
            defaultVal: 40, minVal: 0, maxVal: tMax / 1e-3 }
    };
    layout = [
        ['Cell Properties', ['C_nF', 'g_leak_uS', 'E_leak_mV']],
        ['Potassium Currents', ['E_K_mV', 'g_K_uS', 'g_A_uS']],
        ['Sodium Currents', ['E_Na_mV', 'g_Na_uS', 'g_NaP_uS']],
        ['Nonspecific Currents', ['E_H_mV', 'g_H_uS']],
        ['Calcium Currents', ['E_Ca_mV', 'g_T_uS']],
        ['Current Clamp', ['pulseStart_ms', 'pulseHeight_nA', 
            'pulseWidth_ms', 'isi_ms', 'numPulses']],
        ['Simulation Settings', ['totalDuration_ms']]
    ];
    controlsPanel = document.getElementById('MultiConductanceControls');

    // prepare tables for displaying captured data points
    dataPanel = document.getElementById('MultiConductanceData');
    dataPanel.className = 'datapanel';

    voltageDataTable = document.createElement('table');
    voltageDataTable.className = 'datatable';
    dataPanel.appendChild(voltageDataTable);

    stimDataTable = document.createElement('table');
    stimDataTable.className = 'datatable';
    dataPanel.appendChild(stimDataTable);

    currentHHDataTable = document.createElement('table');
    currentHHDataTable.className = 'datatable';
    dataPanel.appendChild(currentHHDataTable);

    conductanceHHDataTable = document.createElement('table');
    conductanceHHDataTable.className = 'datatable';
    dataPanel.appendChild(conductanceHHDataTable);

    gateHHDataTable = document.createElement('table');
    gateHHDataTable.className = 'datatable';
    dataPanel.appendChild(gateHHDataTable);

    currentNaPandADataTable = document.createElement('table');
    currentNaPandADataTable.className = 'datatable';
    dataPanel.appendChild(currentNaPandADataTable);

    conductanceNaPandADataTable = document.createElement('table');
    conductanceNaPandADataTable.className = 'datatable';
    dataPanel.appendChild(conductanceNaPandADataTable);

    gateNaPandADataTable = document.createElement('table');
    gateNaPandADataTable.className = 'datatable';
    dataPanel.appendChild(gateNaPandADataTable);

    currentSagDataTable = document.createElement('table');
    currentSagDataTable.className = 'datatable';
    dataPanel.appendChild(currentSagDataTable);

    conductanceSagDataTable = document.createElement('table');
    conductanceSagDataTable.className = 'datatable';
    dataPanel.appendChild(conductanceSagDataTable);

    gateSagDataTable = document.createElement('table');
    gateSagDataTable.className = 'datatable';
    dataPanel.appendChild(gateSagDataTable);

    currentCaDataTable = document.createElement('table');
    currentCaDataTable.className = 'datatable';
    dataPanel.appendChild(currentCaDataTable);

    conductanceCaDataTable = document.createElement('table');
    conductanceCaDataTable.className = 'datatable';
    dataPanel.appendChild(conductanceCaDataTable);

    gateCaDataTable = document.createElement('table');
    gateCaDataTable.className = 'datatable';
    dataPanel.appendChild(gateCaDataTable);

    // simulate and plot a passive membrane with a pulse
    function runSimulation() {
        var model, neuron, pulseTrain,
            V_rest = -71.847e-3, 
            KCurrent, NaCurrent,
            NaPCurrent, ACurrent,
            HCurrent,
            TCurrent, NCurrent,
            result, v, iLeak, iStim,
            iK, iNa, iNaP, iA, iH, iT, iN,
            gK, gNa, gNaP, gA, gH, gT, gN,
            v_mV, iLeak_nA, params, iStim_nA,
            iK_nA, iNa_nA, iNaP_nA, iA_nA, iH_nA, iT_nA, iN_nA,
            gK_uS, gNa_uS, gNaP_uS, gA_uS, gH_uS, gT_uS, gN_uS,
            nGate, mGate, hGate, mNaPGate, hNaPGate,
            mAGate, hAGate, mHGate, mTGate, hTGate, mNGate, hNGate,
            plotPanel, plot, title;
        
        // create the passive membrane
        params = controls.values;
        model = componentModel.componentModel();
        neuron = electrophys.passiveMembrane(model, {
            C: params.C_nF * 1e-9, 
            g_leak: params.g_leak_uS * 1e-6, 
            E_leak: params.E_leak_mV * 1e-3,
            V_rest: V_rest
        });

        pulseTrain = electrophys.pulseTrain({
            start: 1e-3 * params.pulseStart_ms, 
            width: params.pulseWidth_ms * 1e-3, 
            height: params.pulseHeight_nA * 1e-9,
            gap: params.isi_ms * 1e-3,
            num_pulses: params.numPulses
        });
        neuron.addCurrent(pulseTrain);
        
        KCurrent = electrophys.multiConductance.KConductance(model, neuron, {
            g_K: params.g_K_uS * 1e-6,
            E_K: params.E_K_mV * 1e-3,
            V_rest: V_rest
        });
        
        NaCurrent = electrophys.multiConductance.NaConductance(model, neuron, {
            g_Na: params.g_Na_uS * 1e-6,
            E_Na: params.E_Na_mV * 1e-3,
            V_rest: V_rest
        });
        
        NaPCurrent = electrophys.multiConductance.NaPConductance(model, neuron, {
            g_NaP: params.g_NaP_uS * 1e-6,
            E_Na: params.E_Na_mV * 1e-3,
            V_rest: V_rest
        });
        
        ACurrent = electrophys.multiConductance.AConductance(model, neuron, {
            g_A: params.g_A_uS * 1e-6,
            E_K: params.E_K_mV * 1e-3,
            V_rest: V_rest
        });
        
        HCurrent = electrophys.multiConductance.HConductance(model, neuron, {
            g_H: params.g_H_uS * 1e-6,
            E_H: params.E_H_mV * 1e-3,
            V_rest: V_rest
        });
        
        TCurrent = electrophys.multiConductance.TConductance(model, neuron, {
            g_T: params.g_T_uS * 1e-6,
            E_Ca: params.E_Ca_mV * 1e-3,
            V_rest: V_rest
        });
        
        NCurrent = electrophys.multiConductance.NConductance(model, neuron, {
            g_N: params.g_N_uS * 1e-6,
            E_Ca: params.E_Ca_mV * 1e-3,
            V_rest: V_rest
        });
        

        // simulate it
        result = model.integrate({
            tMin: 0, 
            tMax: params.totalDuration_ms * 1e-3, 
            tMaxStep: Math.min(1e-4, params.C_nF / params.g_leak_uS * 1e-3) 
        });
        
        v        = result.mapOrderedPairs(neuron.V);
        iLeak    = result.mapOrderedPairs(neuron.leak.current);
        iK       = result.mapOrderedPairs(KCurrent.current);
        iNa      = result.mapOrderedPairs(NaCurrent.current);
        iNaP     = result.mapOrderedPairs(NaPCurrent.current);
        iA       = result.mapOrderedPairs(ACurrent.current);
        iH       = result.mapOrderedPairs(HCurrent.current);
        iT       = result.mapOrderedPairs(TCurrent.current);
        iN       = result.mapOrderedPairs(NCurrent.current);
        gK       = result.mapOrderedPairs(KCurrent.g);
        gNa      = result.mapOrderedPairs(NaCurrent.g);
        gNaP     = result.mapOrderedPairs(NaPCurrent.g);
        gA       = result.mapOrderedPairs(ACurrent.g);
        gH       = result.mapOrderedPairs(HCurrent.g);
        gT       = result.mapOrderedPairs(TCurrent.g);
        gN       = result.mapOrderedPairs(NCurrent.g);
        nGate    = result.mapOrderedPairs(KCurrent.n);
        mGate    = result.mapOrderedPairs(NaCurrent.m);
        hGate    = result.mapOrderedPairs(NaCurrent.h);
        mNaPGate = result.mapOrderedPairs(NaPCurrent.m);
        hNaPGate = result.mapOrderedPairs(NaPCurrent.h);
        mAGate   = result.mapOrderedPairs(ACurrent.m);
        hAGate   = result.mapOrderedPairs(ACurrent.h);
        mHGate   = result.mapOrderedPairs(HCurrent.m);
        mTGate   = result.mapOrderedPairs(TCurrent.m);
        hTGate   = result.mapOrderedPairs(TCurrent.h);
        mNGate   = result.mapOrderedPairs(NCurrent.m);
        hNGate   = result.mapOrderedPairs(NCurrent.h);
        iStim    = result.mapOrderedPairs(pulseTrain);

        // convert to the right units
        // each ordered pair consists of a time and another variable
        v_mV     = v.map        (function (v) {return [v[0] / 1e-3,  v[1] / 1e-3];});
        iLeak_nA = iLeak.map    (function (i) {return [i[0] / 1e-3, -i[1] / 1e-9];});
        iK_nA    = iK.map       (function (i) {return [i[0] / 1e-3, -i[1] / 1e-9];});
        iNa_nA   = iNa.map      (function (i) {return [i[0] / 1e-3, -i[1] / 1e-9];});
        iNaP_nA  = iNaP.map     (function (i) {return [i[0] / 1e-3, -i[1] / 1e-9];});
        iA_nA    = iA.map       (function (i) {return [i[0] / 1e-3, -i[1] / 1e-9];});
        iH_nA    = iH.map       (function (i) {return [i[0] / 1e-3, -i[1] / 1e-9];});
        iT_nA    = iT.map       (function (i) {return [i[0] / 1e-3, -i[1] / 1e-9];});
        iN_nA    = iN.map       (function (i) {return [i[0] / 1e-3, -i[1] / 1e-9];});
        gK_uS    = gK.map       (function (g) {return [g[0] / 1e-3,  g[1] / 1e-6];});
        gNa_uS   = gNa.map      (function (g) {return [g[0] / 1e-3,  g[1] / 1e-6];});
        gNaP_uS  = gNaP.map     (function (g) {return [g[0] / 1e-3,  g[1] / 1e-6];});
        gA_uS    = gA.map       (function (g) {return [g[0] / 1e-3,  g[1] / 1e-6];});
        gH_uS    = gH.map       (function (g) {return [g[0] / 1e-3,  g[1] / 1e-6];});
        gT_uS    = gT.map       (function (g) {return [g[0] / 1e-3,  g[1] / 1e-6];});
        gN_uS    = gN.map       (function (g) {return [g[0] / 1e-3,  g[1] / 1e-6];});
        nGate    = nGate.map    (function (n) {return [n[0] / 1e-3,  n[1]       ];});
        mGate    = mGate.map    (function (m) {return [m[0] / 1e-3,  m[1]       ];});
        hGate    = hGate.map    (function (h) {return [h[0] / 1e-3,  h[1]       ];});
        mNaPGate = mNaPGate.map (function (m) {return [m[0] / 1e-3,  m[1]       ];});
        hNaPGate = hNaPGate.map (function (h) {return [h[0] / 1e-3,  h[1]       ];});
        mAGate   = mAGate.map   (function (m) {return [m[0] / 1e-3,  m[1]       ];});
        hAGate   = hAGate.map   (function (h) {return [h[0] / 1e-3,  h[1]       ];});
        mHGate   = mHGate.map   (function (m) {return [m[0] / 1e-3,  m[1]       ];});
        mTGate   = mTGate.map   (function (m) {return [m[0] / 1e-3,  m[1]       ];});
        hTGate   = hTGate.map   (function (h) {return [h[0] / 1e-3,  h[1]       ];});
        mNGate   = mNGate.map   (function (m) {return [m[0] / 1e-3,  m[1]       ];});
        hNGate   = hNGate.map   (function (h) {return [h[0] / 1e-3,  h[1]       ];});
        iStim_nA = iStim.map    (function (i) {return [i[0] / 1e-3,  i[1] / 1e-9];});

        // free resources from old plots
        while (plotHandles.length > 0) {
            plotHandles.pop().destroy();
        }

        // plot the results
        plotPanel = document.getElementById('MultiConductancePlots');
        plotPanel.innerHTML = '';

        //*****************
        // VOLTAGE AND STIMULATION CURRENT
        //*****************

        // Section title
        title = document.createElement('h4');
        title.innerHTML = 'Membrane Potential and Stimulation Current';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);

        // Voltage
        plot = document.createElement('div');
        plot.id = 'voltagePlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
           $.jqplot('voltagePlot', [v_mV], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Membrane Potential (mV)'},
                },
                series: [
                    {label: 'V<sub>m</sub>', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#voltagePlot', voltageDataTable, 'Membrane Potential', 'Time');
        graphJqplot.bindCursorTooltip('#voltagePlot', 'Time', 'ms', 'mV');

        // Stimulus current
        plot = document.createElement('div');
        plot.id = 'stimPlot';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('stimPlot', [iStim_nA], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Stimulation Current (nA)'},
                },
                series: [
                    {label: 'I<sub>stim</sub>', color: 'black'},
                ],
        })));
        graphJqplot.bindDataCapture('#stimPlot', stimDataTable, 'Stimulation Current', 'Time');
        graphJqplot.bindCursorTooltip('#stimPlot', 'Time', 'ms', 'nA');

        //*****************
        // HODGKIN-HUXLEY
        //*****************

        // Section title
        title = document.createElement('h4');
        title.innerHTML = 'Hodgkin-Huxley Currents, Conductances, and Gates';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);

        // Currents
        plot = document.createElement('div');
        plot.id = 'currentPlotHH';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('currentPlotHH', [iLeak_nA, iK_nA, iNa_nA], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                legend: {show: true},
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Current (nA)'},
                },
                series: [
                    {label: 'I<sub>leak</sub>', color: 'black'},
                    {label: 'I<sub>K</sub>',    color: 'red'},
                    {label: 'I<sub>Na</sub>',   color: 'blue'},
                ],
        })));
        graphJqplot.bindDataCapture('#currentPlotHH', currentHHDataTable, 'Hodgkin-Huxley Currents', 'Time');
        graphJqplot.bindCursorTooltip('#currentPlotHH', 'Time', 'ms', 'nA');

        // Conductances
        plot = document.createElement('div');
        plot.id = 'conductancePlotHH';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('conductancePlotHH', [gK_uS, gNa_uS], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                legend: {show: true},
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Conductance (\u00B5S)'},
                },
                series: [
                    {label: 'g<sub>K</sub>',   color: 'red'},
                    {label: 'g<sub>Na</sub>',  color: 'blue'},
                ],
        })));
        graphJqplot.bindDataCapture('#conductancePlotHH', conductanceHHDataTable, 'Hodgkin-Huxley Conductances', 'Time');
        graphJqplot.bindCursorTooltip('#conductancePlotHH', 'Time', 'ms', '\u00B5S');

        // Gates
        plot = document.createElement('div');
        plot.id = 'gatePlotHH';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('gatePlotHH', [nGate, mGate, hGate], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                legend: {show: true},
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {
                        label:'Gate',
                        min: 0, max: 1,
                        numberTicks: 6,
                    }
                },
                series: [
                    {label: 'n', color: 'red'},
                    {label: 'm', color: 'blue'},
                    {label: 'h', color: 'purple'},
                ],
        })));
        graphJqplot.bindDataCapture('#gatePlotHH', gateHHDataTable, 'Hodgkin-Huxley Gates', 'Time');
        graphJqplot.bindCursorTooltip('#gatePlotHH', 'Time', 'ms', '');

        //*****************
        // PERSISTENT SODIUM AND FAST POTASSIUM
        //*****************

        // Section title
        title = document.createElement('h4');
        title.innerHTML = 'Persistent Sodium and Fast Potassium Currents, Conductances, and Gates';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);

        // Currents
        plot = document.createElement('div');
        plot.id = 'currentPlotNaPandA';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('currentPlotNaPandA', [iNaP_nA, iA_nA], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                legend: {show: true},
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Current (nA)'},
                },
                series: [
                    {label: 'I<sub>NaP</sub>',  color: 'green'},
                    {label: 'I<sub>A</sub>',    color: 'orange'},
                ],
        })));
        graphJqplot.bindDataCapture('#currentPlotNaPandA', currentNaPandADataTable, 'Persistent Na and Fast K Currents', 'Time');
        graphJqplot.bindCursorTooltip('#currentPlotNaPandA', 'Time', 'ms', 'nA');

        // Conductances
        plot = document.createElement('div');
        plot.id = 'conductancePlotNaPandA';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('conductancePlotNaPandA', [gNaP_uS, gA_uS], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                legend: {show: true},
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Conductance (\u00B5S)'},
                },
                series: [
                    {label: 'g<sub>NaP</sub>', color: 'green'},
                    {label: 'g<sub>A</sub>',   color: 'orange'},
                ],
        })));
        graphJqplot.bindDataCapture('#conductancePlotNaPandA', conductanceNaPandADataTable, 'Persistent Na and Fast K Conductances', 'Time');
        graphJqplot.bindCursorTooltip('#conductancePlotNaPandA', 'Time', 'ms', '\u00B5S');

        // Gates
        plot = document.createElement('div');
        plot.id = 'gatePlotNaPandA';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('gatePlotNaPandA', [mNaPGate, hNaPGate, mAGate, hAGate], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                legend: {show: true},
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {
                        label:'Gate',
                        min: 0, max: 1,
                        numberTicks: 6,
                    }
                },
                series: [
                    {label: 'm<sub>NaP</sub>', color: 'green'},
                    {label: 'h<sub>NaP</sub>', color: 'lime'},
                    {label: 'm<sub>A</sub>',   color: 'orange'},
                    {label: 'h<sub>A</sub>',   color: 'yellow'},
                ],
        })));
        graphJqplot.bindDataCapture('#gatePlotNaPandA', gateNaPandADataTable, 'Persistent Na and Fast K Gates', 'Time');
        graphJqplot.bindCursorTooltip('#gatePlotNaPandA', 'Time', 'ms', '');

        //*****************
        // SAG
        //*****************

        // Section title
        title = document.createElement('h4');
        title.innerHTML = 'Sag Current, Conductance, and Gate';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);

        // Currents
        plot = document.createElement('div');
        plot.id = 'currentPlotSag';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('currentPlotSag', [iH_nA], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                legend: {show: true},
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Current (nA)'},
                },
                series: [
                    {label: 'I<sub>H</sub>',    color: 'gray'},
                ],
        })));
        graphJqplot.bindDataCapture('#currentPlotSag', currentSagDataTable, 'Sag Current', 'Time');
        graphJqplot.bindCursorTooltip('#currentPlotSag', 'Time', 'ms', 'nA');

        // Conductances
        plot = document.createElement('div');
        plot.id = 'conductancePlotSag';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('conductancePlotSag', [gH_uS], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                legend: {show: true},
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Conductance (\u00B5S)'},
                },
                series: [
                    {label: 'g<sub>H</sub>',   color: 'gray'},
                ],
        })));
        graphJqplot.bindDataCapture('#conductancePlotSag', conductanceSagDataTable, 'Sag Conductance', 'Time');
        graphJqplot.bindCursorTooltip('#conductancePlotSag', 'Time', 'ms', '\u00B5S');

        // Gates
        plot = document.createElement('div');
        plot.id = 'gatePlotSag';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('gatePlotSag', [mHGate], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                legend: {show: true},
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {
                        label:'Gate',
                        min: 0, max: 1,
                        numberTicks: 6,
                    }
                },
                series: [
                    {label: 'm<sub>H</sub>',   color: 'gray'},
                ],
        })));
        graphJqplot.bindDataCapture('#gatePlotSag', gateSagDataTable, 'Sag Gate', 'Time');
        graphJqplot.bindCursorTooltip('#gatePlotSag', 'Time', 'ms', '');

        //*****************
        // CALCIUM
        //*****************

        // Section title
        title = document.createElement('h4');
        title.innerHTML = 'Calcium Currents, Conductances, and Gates';
        title.className = 'simplotheading';
        plotPanel.appendChild(title);

        // Currents
        plot = document.createElement('div');
        plot.id = 'currentPlotCa';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('currentPlotCa', [iT_nA, iN_nA], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                legend: {show: true},
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Current (nA)'},
                },
                series: [
                    {label: 'I<sub>T</sub>', color: 'magenta'},
                    {label: 'I<sub>N</sub>', color: 'cyan'},
                ],
        })));
        graphJqplot.bindDataCapture('#currentPlotCa', currentCaDataTable, 'Ca Currents', 'Time');
        graphJqplot.bindCursorTooltip('#currentPlotCa', 'Time', 'ms', 'nA');

        // Conductances
        plot = document.createElement('div');
        plot.id = 'conductancePlotCa';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('conductancePlotCa', [gT_uS, gN_uS], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                legend: {show: true},
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {label:'Conductance (\u00B5S)'},
                },
                series: [
                    {label: 'g<sub>T</sub>', color: 'magenta'},
                    {label: 'g<sub>N</sub>', color: 'cyan'},
                ],
        })));
        graphJqplot.bindDataCapture('#conductancePlotCa', conductanceCaDataTable, 'Ca Conductances', 'Time');
        graphJqplot.bindCursorTooltip('#conductancePlotCa', 'Time', 'ms', '\u00B5S');

        // Gates
        plot = document.createElement('div');
        plot.id = 'gatePlotCa';
        plot.style.width = '425px';
        plot.style.height = '200px';
        plotPanel.appendChild(plot);
        plotHandles.push(
            $.jqplot('gatePlotCa', [mTGate, hTGate, mNGate, hNGate], jQuery.extend(true, {}, graphJqplot.defaultOptions(params), {
                legend: {show: true},
                axes: {
                    xaxis: {label:'Time (ms)'},
                    yaxis: {
                        label:'Gate',
                        min: 0, max: 1,
                        numberTicks: 6,
                    }
                },
                series: [
                    {label: 'm<sub>T</sub>',   color: 'magenta'},
                    {label: 'h<sub>T</sub>',   color: 'chartreuse'},
                    {label: 'm<sub>N</sub>',   color: 'cyan'},
                    {label: 'h<sub>N</sub>',   color: 'brown'},
                ],
        })));
        graphJqplot.bindDataCapture('#gatePlotCa', gateCaDataTable, 'Ca Gates', 'Time');
        graphJqplot.bindCursorTooltip('#gatePlotCa', 'Time', 'ms', '');
    }

    
    function reset() {
        controlsPanel.innerHTML = '';
        controls = simcontrols.controls(controlsPanel, params, layout);
        runSimulation();
    }


    function clearDataTables() {
        voltageDataTable.innerHTML = '';
        voltageDataTable.style.display = 'none';

        stimDataTable.innerHTML = '';
        stimDataTable.style.display = 'none';

        currentHHDataTable.innerHTML = '';
        currentHHDataTable.style.display = 'none';

        conductanceHHDataTable.innerHTML = '';
        conductanceHHDataTable.style.display = 'none';

        gateHHDataTable.innerHTML = '';
        gateHHDataTable.style.display = 'none';

        currentNaPandADataTable.innerHTML = '';
        currentNaPandADataTable.style.display = 'none';

        conductanceNaPandADataTable.innerHTML = '';
        conductanceNaPandADataTable.style.display = 'none';

        gateNaPandADataTable.innerHTML = '';
        gateNaPandADataTable.style.display = 'none';

        currentSagDataTable.innerHTML = '';
        currentSagDataTable.style.display = 'none';

        conductanceSagDataTable.innerHTML = '';
        conductanceSagDataTable.style.display = 'none';

        gateSagDataTable.innerHTML = '';
        gateSagDataTable.style.display = 'none';

        currentCaDataTable.innerHTML = '';
        currentCaDataTable.style.display = 'none';

        conductanceCaDataTable.innerHTML = '';
        conductanceCaDataTable.style.display = 'none';

        gateCaDataTable.innerHTML = '';
        gateCaDataTable.style.display = 'none';
    }


    (document.getElementById('MultiConductanceRunButton')
        .addEventListener('click', runSimulation, false));
    (document.getElementById('MultiConductanceResetButton')
        .addEventListener('click', reset, false));
    (document.getElementById('MultiConductanceClearDataButton')
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

