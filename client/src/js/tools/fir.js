
var ToolModel = require('tools/tool');
var SearchBar = require('components/searchbar');
var Search = require('tools/search');

var FirModelProperties = {
    type: 'fir',
    panel: 'firpanel',
    toolbar: 'bottom',
    icon: 'fa fa-home icon',
    title: 'FIR',
    visible: false,
    instruction: '',
    searchExpandedClassButton: "fa fa-angle-up clickable arrow pull-right"

};

var FirModel = {

    defaults: FirModelProperties,

    initialize: function (options) {
        ToolModel.prototype.initialize.call(this);
    },

    configure: function (shell) {
       console.log("this in configure");
       console.log(this);
        var options = this.attributes.shell.initialConfig.tools.find(tool => tool.type === "search");
        var firSearchModel = new Search(options.options);
        firSearchModel.set('shell', this.attributes.shell);
        firSearchModel.configure(this.attributes.shell);
        firSearchModel.set("showExternalResultsId", "search-results-fir");
        console.log("firSearchModel");
        console.log(firSearchModel);
        this.set("firSearchModel", firSearchModel);
    },

    clicked: function(arg){
        this.set('visible', true);
        this.set('toggled', !this.get('toggled'));
    }
};


module.exports = ToolModel.extend(FirModel);