var Panel = require('views/panel');
var Search = require('components/search');

var FirPanelView = {

    getInitialState: function () {
        return{
        };
    },

    componentDidUpdate: function () {
    },

    componentDidMount: function () {
    },

    generate: function () {
    },

    minBox: function() {
        var contains = $('#FIRSearchMinimizeBox');
        if(typeof contains === "undefined"){
            return;
        }
        contains.toggle(function() {
            $('#FIRSearchMinimizeBox').toggleClass('visible, hidden');
        },function(){
            $('#FIRSearchMinimizeBox').toggleClass('hidden, visible');
            }
        );

        if(typeof $("#FIRSearchMinimizeButton").attr('class') === "undefined"){
            console.log("className undefined");

        }else {
            var buttonClass = $("#FIRSearchMinimizeBox").attr('class').indexOf('hidden') !== -1
                ? 'fa fa-angle-up clickable arrow pull-right arrowBoxSize'
                : 'fa fa-angle-down clickable arrow pull-right arrowBoxSize';
            this.props.model.set("searchExpandedClassButton", buttonClass);
            document.getElementById("FIRSearchMinimizeButton").className = buttonClass;
        };

    },

    render: function () {
        console.log("FIR panel");

        return (
            <Panel title='FIR' onCloseClicked={this.props.onCloseClicked} onUnmountClicked={this.props.onUnmountClicked} minimized={this.props.minimized} instruction={window.atob(this.props.model.get('instruction'))}>
                <div className='panel-content'>
                    <div className='panel panel-default'>
                        <div className='panel-heading'>Sökning <button id="FIRSearchMinimizeButton" onClick={() => this.minBox()} className={this.props.model.get("searchExpandedClassButton")} ></button></div>
                        <div className='panel-body visible' id='FIRSearchMinimizeBox'>
                            <p>FIR searchModel</p>
                            <Search model={this.props.model.get("firSearchModel")}/>
                        </div>
                    </div>
                    <div className='panel panel-default'>
                        <div className='panel-heading'>Skapa fastighetsförteckning</div>
                        <div className='panel-body'>
                            <p>Inkludera i förteckning:</p>
                                <input type="checkbox" id="myCheck" onClick={()=> "checkBoxFir()"} /> Fastigheter <br/>
                                <input type="checkbox" id="myCheck2" onClick={()=> "checkBoxFir()"} /> Gemensamhetsanläggningar <br/>
                                <input type="checkbox" id="myCheck3" onClick={()=> "checkBoxFir()"} /> Rättigheter <br/>
                        </div>
                    </div>
                    <div id="search-results-fir"></div>
                </div>
            </Panel>
        );
    }
};

module.exports = React.createClass(FirPanelView);