// Copyright (C) 2016 Göteborgs Stad
//
// Denna programvara är fri mjukvara: den är tillåten att distribuera och modifiera
// under villkoren för licensen CC-BY-NC-SA 4.0.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the CC-BY-NC-SA 4.0 licence.
//
// http://creativecommons.org/licenses/by-nc-sa/4.0/
//
// Det är fritt att dela och anpassa programvaran för valfritt syfte
// med förbehåll att följande villkor följs:
// * Copyright till upphovsmannen inte modifieras.
// * Programvaran används i icke-kommersiellt syfte.
// * Licenstypen inte modifieras.
//
// Den här programvaran är öppen i syfte att den skall vara till nytta för andra
// men UTAN NÅGRA GARANTIER; även utan underförstådd garanti för
// SÄLJBARHET eller LÄMPLIGHET FÖR ETT VISST SYFTE.
//
// https://github.com/hajkmap/Hajk
var SelectionToolbar = require('components/selectiontoolbar');
var SearchResultGroup = require('components/searchresultgroup');

/**
 * @class
 */
var SearchView = {
    /**
     * @property {string} value
     * @instance
     */
    value: undefined,

    /**
     * @property {number} timer
     * @instance
     */
    timer: undefined,

    /**
     * @property {number} loading
     * @instance
     */
    loading: 0,

    /**
     * Get initial state.
     * @instance
     * @return {object}
     */
    getInitialState: function () {
        return {
            visible: false,
            displayPopup: this.props.model.get('displayPopup')
        };
    },

    /**
     * Triggered when the component is successfully mounted into the DOM.
     * @instance
     */

    componentDidUpdate: function () {
        console.log("componentDidUpdate");
        console.log("results DidUpdate");
        console.log(this.state.results);
        if(this.props.model.get("showExternalResultsId") !== "" && this.state.results != null){
            var externalResults = document.getElementById(this.props.model.get("showExternalResultsId"));
            console.log("this.state.results");
            console.log(this.state.results);
            ReactDOM.render(this.state.results, externalResults);
            //this.props.model.set("externalResults", results);
            this.state.results = "";
        }
        console.log("showExternalResultsId");
        console.log(this.props.model.get("showExternalResultsId"));
    },


    componentDidMount: function () {
        this.value = this.props.model.get('value');
        if (this.props.model.get('items')) {
            this.setState({
                showResults: true,
                result: {
                    status: 'success',
                    items: this.props.model.get('items')
                }
            });
        }

        this.props.model.on('change:displayPopup', () => {
            this.setState({
                displayPopup: this.props.model.get('displayPopup')
            });
        });
        this.props.model.on('change:url', () => {
            this.setState({
                downloadUrl: this.props.model.get('url')
            });
        });
        this.props.model.on('change:downloading', () => {
            this.setState({
                downloading: this.props.model.get('downloading')
            });
        });
    },

    /**
     * Triggered before the component mounts.
     * @instance
     */
    componentWillMount: function () {
        this.props.model.get('layerCollection')
            ? this.bindLayerVisibilityChange()
            : this.props.model.on('change:layerCollection', this.bindLayerVisibilityChange);

    },

    /**
     * Triggered when component unmounts.
     * @instance
     */
    componentWillUnmount: function () {
        this.props.model.get('layerCollection').each((layer) => {
            layer.off('change:visible', this.search);
        });
        this.props.model.off('change:layerCollection', this.bindLayerVisibilityChange);
        this.props.model.off('change:displayPopup');
        this.props.model.off('change:url');
        this.props.model.off('change:downloading');

        console.log("willunmount");
        ReactDOM.unmountComponentAtNode(externalResults);
    },

    /**
     * Clear the search result.
     * @instance
     */
    clear: function () {
        this.value = '';
        this.props.model.set('value', '');
        this.props.model.set('searchTriggered', false);
        this.props.model.clear();
        if (!isMobile && typeof $('#snabbsokRensa') !== 'undefined') {
            $('#snabbsokRensa').click();
        }


        if (document.getElementById('alertSearchbar') != null) {
            document.getElementById('alertSearchbar').remove();
        }

        this.setState({
            loading: true,
            showResults: true,
            result: []
        });

        if (!isMobile && $('#searchbar-input-field').length != 0) {
            $('#searchbar-input-field')[0].value = '';
        }
    },

    /**
     * Handle key down event, this will set state.
     * @instance
     * @param {object} event
     */
    handleKeyDown: function (event) {
        if (event.keyCode === 13 && event.target.value.length < 5) {
            event.preventDefault();
            this.props.model.set('value', event.target.value);
            this.setState({
                force: true
            });
            this.props.model.set('force', true);
            this.search();
        }
    },

    /**
     * Perform a search in the model to update results.
     * @instance
     */
    update: function () {
        this.props.model.search();
    },

    /**
     * Search requested information.
     * @instance
     * @param {object} event
     */
    search: function (event) {
        this.props.model.set('searchTriggered', true);
        this.setState({
            loading: true
        });
        this.loading = Math.random();
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            var loader = this.loading;
            this.props.model.abort();
            this.props.model.search(result => {
                var state = {
                    loading: false,
                    showResults: true,
                    result: result
                };
                if (loader !== this.loading) {
                    state.loading = true;
                }
                this.setState(state);
            }, false);
        }, 200);
    },

    /**
     * Bind an event handler to layer visibility change.
     * If a layer changes visibility the result vill update.
     * @instance
     */
    bindLayerVisibilityChange: function () {
        this.props.model.get('layerCollection').each((layer) => {
            layer.on('change:visible', () => {
                this.update();
            });
        });
    },

    /**
     * Set search filter and perform a search.
     * @instance
     * @param {string} type
     * @param {object} event
     */
    setFilter: function (event) {
        this.props.model.set('filter', event.target.value);
        this.search();
    },

    /**
     * Render the search options component.
     * @instance
     * @return {external:ReactElement}
     */
    renderOptions: function () {
        var settings = this.props.model.get('settings'),
            sources = this.props.model.get('sources'),
            filterVisible = this.props.model.get('filterVisible'),
            filterVisibleBtn = null
        ;
        if (filterVisible) {
            filterVisibleBtn = (
                <div>
                    <input
                        id='filter-visible'
                        type='checkbox'
                        checked={this.props.model.get('filterVisibleActive')}
                        onChange={(e) => {
                            this.props.model.set('filterVisibleActive', e.target.checked);
                            this.setState({
                                filterVisibleActive: e.target.checked
                            });
                        }}
                    />&nbsp;
                    <label htmlFor='filter-visible'>Sök i alla synliga lager</label>
                </div>
            );
        }
        return (
            <div>
                <p>
                    <span>Sök: </span>&nbsp;
                    <select value={this.props.model.get('filter')} onChange={(e) => { this.setFilter(e); }}>
                        <option value='*'>--  Alla  --</option>
                        {
                            (() => {
                                return sources.map((wfslayer, i) => {
                                    return (
                                        <option key={i} value={wfslayer.caption}>
                                            {wfslayer.caption}
                                        </option>
                                    );
                                });
                            })()
                        }
                    </select>
                </p>
                {filterVisibleBtn}
            </div>
        );
    },

    onChangeDisplayPopup: function (e) {
        this.props.model.set('displayPopup', e.target.checked);
    },

    exportSelected: function (type) {
        this.props.model.export(type);
    },

    /**
     * Render the result component.
     * @instance
     * @return {external:ReactElement}
     */
    renderResults: function () {
        var groups = this.props.model.get('items'),
            excelButton = null,
            kmlButton = null,
            downloadLink = null
        ;

        if (this.props.model.get('kmlExportUrl')) {
            kmlButton = (
                <button className='btn btn-default icon-button' onClick={(e) => this.exportSelected('kml')}>
                    <i className='kml' />
                </button>
            );
        }

        if (this.props.model.get('excelExportUrl')) {
            excelButton = (
                <button className='btn btn-default icon-button' onClick={(e) => this.exportSelected('excel')}>
                    <i className='excel' />
                </button>
            );
        }

        // skapar en länk med url till nedladdning av export. Visar Spara
        // först när url finns.
        if (this.props.model.get('downloading')) {
            downloadLink = <a href='#'>Hämtar...</a>;
        } else if (this.props.model.get('url')) {
            downloadLink = <a href={this.props.model.get('url')}>Hämta sökresultat</a>;
        } else {
            downloadLink = null;
        }

        return (
            <div className='search-results' key='search-results'>
                <h3>Sökresultat</h3>
                <div>
                    <input type='checkbox' id='display-popup' /*ref='displayPopup'*/ onChange={(e) => { this.onChangeDisplayPopup(e); }} checked={this.state.displayPopup} />
                    <label htmlFor='display-popup'>Visa information</label>
                    <span className='pull-right'>{excelButton}&nbsp;{kmlButton}</span>
                    <div>{downloadLink}</div>
                </div>
                {
                    (() => {
                        if (groups && groups.length > 0) {
                            return groups.map((item, i) => {
                                var id = 'group-' + i;
                                return (
                                    <SearchResultGroup
                                        isBar='no'
                                        id={id}
                                        key={id}
                                        result={item}
                                        numGroups={groups.length}
                                        model={this.props.model}
                                        parentView={this}
                                        map={this.props.model.get('map')} />
                                );
                            });
                        } else {
                            return (<div>Sökningen gav inget resultat.</div>);
                        }
                    })()
                }
            </div>

        );
    },

    /**
     * Render the panel component.
     * @instance
     * @return {external:ReactElement}
     */
    render: function () {
        var results = null,
            value = this.props.model.get('value'),
            showResults = this.props.model.shouldRenderResult(false),
            options = this.renderOptions();


        if (showResults) {
            if (this.state.loading) {
                results = (
                    <p>
                        <span className='sr-only'>Laddar...</span>
                        <i className='fa fa-refresh fa-spin fa-3x fa-fw' />
                    </p>
                );
            } else {
                if ((this.props.model.get('value') &&
                    this.props.model.get('value').length > 3) ||
                    this.props.model.get('force')) {
                    results = this.renderResults();
                } else {
                    results = (
                        <p className='alert alert-info'>
                            Skriv minst fyra tecken för att påbörja automatisk sökning. Tryck på <b>retur</b> för att forcera en sökning.
                        </p>
                    );
                }
            }
            this.setState({result: results});
        }

        console.log("showResults -results-");
        console.log(results);

        var search_on_input = (event) => {
            this.value = event.target.value;
            this.props.model.set('value', this.value);
            this.setState({
                value: this.value,
                force: false
            });
            this.props.model.set('force', false);
            if (event.target.value.length > 3) {
                this.search();
            } else {
                this.setState({
                    loading: false
                });
            }
            this.props.model.set('downloading', null);
            this.props.model.set('url', null);
        };

        var search_on_click = (event) => {
            this.setState({
                force: true
            });
            this.props.model.set('force', true);
            this.search();

            this.props.model.set('downloading', null);
            this.props.model.set('url', null);
        };

        var selectionToolbar = this.props.model.get('selectionTools')
            ? <SelectionToolbar model={this.props.model.get('selectionModel')} />
            : null;

        /*
      if(this.props.model.get("showExternalResultsId") !== "" && results != null){
        var externalResults = document.getElementById(this.props.model.get("showExternalResultsId"));
        console.log("results");
        console.log(results);
        ReactDOM.render(results, externalResults);
        //this.props.model.set("externalResults", results);
        results = "";
      } */

        return (
            <div className='search-tools'>
                <div className='form-group'>
                    {options}
                    {selectionToolbar}
                    <div className='input-group'>
                        <div className='input-group-addon'>
                            <i className='fa fa-search' />
                        </div>
                        <input
                            type='text'
                            /* ref='searchInput' */
                            className='form-control'
                            placeholder='Ange söktext..'
                            value={value}
                            onKeyDown={this.handleKeyDown}
                            onChange={search_on_input} />
                    </div>
                    <div className='clearfix'>
                        <span className='info-text clearfix'>Inled sökningen med * för att söka på delar av en text.</span>
                    </div>
                </div>
                <button onClick={search_on_click} type='submit' className='btn btn-primary'>Sök</button>&nbsp;
                <button onClick={this.clear} type='submit' className='btn btn-primary' id='sokRensa'>Rensa</button>

                {results}
            </div>
        );
    }
};

/**
 * SearchView module.<br>
 * Use <code>require('components/search')</code> for instantiation.
 * @module SearchView-module
 * @returns {SearchView}
 */
module.exports = React.createClass(SearchView);
