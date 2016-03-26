global.jQuery = require('jquery');
var React = require('react');
var ReactDOM = require('react-dom');
var update = require('react-addons-update');
var moment = require('moment');
var CommFunc = require('comm-func');
var LinkedStateMixin = require('react-addons-linked-state-mixin');
var ReactBootstrap = require('react-bootstrap');
var Typeahead = require('../../react-typehead/main.js');
var Bootstrap = require('bootstrap')

var GirdForm = React.createClass({
    mixins: [LinkedStateMixin],
    getInitialState: function () {
        return {
            searchData: {
                customer_name: null
            },
            collect: {
                customer: null,
                born: [],
                productRecord: null
            }
        };
    },
    getDefaultProps: function () {
        return {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPathName: gb_approot + 'api/ScheduleDetail'
        };
    },
    componentDidMount: function () {
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
    },
    changeGDValue: function (name, e) {
        this.setInputValue(this.props.gdName, name, e);
    },
    setInputValue: function (collentName, name, e) {

        var obj = this.state[collentName];
        if (e.target.value == 'true') {
            obj[name] = true;
        } else if (e.target.value == 'false') {
            obj[name] = false;
        } else {
            obj[name] = e.target.value;
        }
        this.setState({ fieldData: obj });
    },
    handleSearch: function (e) {
        e.preventDefault();
        return false;
    },
    CompleteTACustomer(f, i, select_item) {
        CommFunc.jqGet(gb_approot + 'api/GetAction/GetCustomerById', { customer_id: select_item.value })
        .done(function (data, textStatus, jqXHRdata) {
            console.log(data);
            this.setState({ collect: data })
        }.bind(this))
        .fail(function (jqXHR, textStatus, errorThrown) {
            showAjaxError(errorThrown);
        });

    },
    formatText(data) {
        var text = 'Customer:' + data.text;
        return text;
    },
    setBornValue: function (i, name, e) {
        var v = e.target.value;;
        var objForUpdate = {
            collect:
                {
                    born: {
                        [i]: {
                            [name]: {
                                $set: v
                            }
                        }
                    }
                }
        };
        var newState = update(this.state, objForUpdate);
        this.setState(newState);
    },
    render: function () {
        var outHtml = null;
        var searchData = this.state.searchData;
        var Tabs = ReactBootstrap.Tabs;
        var Tab = ReactBootstrap.Tab;
        var TypeAhead = Typeahead.ReactTypeahead;
        var spanStyle = { width: '120px' };

        outHtml =
        (
                <div>
                    <h3 className="title">{this.props.Caption} </h3>
                    <form onSubmit={this.handleSearch}>
                        <div className="table-header">
                            <div className="table-filter">
                                <div className="form-inline">
                                    <div className="form-group">
                                        <label></label> { }
                                        <span style={spanStyle}>
                                                        <TypeAhead fieldName="customer_name"
                                                                   value={this.state.searchData.customer_name}
                                                                   placeholder="客戶名稱..."
                                                                   index={0}
                                                                   disabled={false}
                                                                   apiPath={gb_approot + 'api/GetAction/ta_Customer'}
                                                                   onCompleteChange={this.CompleteTACustomer}
                                                                   formatText={this.formatText}
                                                                   displayMode={1} />
                                        </span>
                                        { }
        <button className="btn-primary" type="submit"><i className="fa-search"></i>{ }搜尋</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>

                    <Tabs defaultActiveKey={1}>
                      <Tab eventKey={1} title="基本資料">基本資料</Tab>
                      <Tab eventKey={2} title="生產記錄"><CustBorn born={this.state.collect.born} setBornValue={this.setBornValue} /></Tab>
                      <Tab eventKey={3} title="需求設定">需求設定</Tab>
                      <Tab eventKey={4} title="用餐記錄">用餐記錄</Tab>
                    </Tabs>
                </div>
			);

        return outHtml;
    }
});

var CustBorn = React.createClass({
    getInitialState: function () {
        return {

        };
    },
    getDefaultProps: function () {
        return {
            born: []
        };
    },
    formSubmit: function (i, e) {
        e.preventDefault();

        var data = this.props.born[i];
        console.log(data);

        return false;
    },
    render: function () {
        var outHtml = null;
        outHtml =
        (
            <div>
                <div className="row">
                   <div className="col-xs-8">
                        <button type="button"><i className="fa-times"></i> 新增生產紀錄</button>
                   </div>
                </div>

                {
                this.props.born.map(function (item, i) {
                    var out_sub_1 = (
                        <form className="form-horizontal" key={item.born_id} onSubmit={this.formSubmit.bind(null,i)}>

                            <div className="form-group">
                                <label className="col-xs-2 control-label">姓名</label>
                                <div className="col-xs-8">
                                    <input type="text"
                                           className="form-control"
                                           value={item.mom_name}
                                           onChange={this.props.setBornValue.bind(null, i, 'mom_name')}
                                           maxLength="64"
                                           required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="col-xs-2 control-label">生產日期</label>
                                <div className="col-xs-8">
                                    <input type="text"
                                           className="form-control"
                                           value={item.birthday}
                                           maxLength="64"
                                           required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="col-xs-2 control-label">電話一</label>
                                <div className="col-xs-8">
                                    <input type="text"
                                           className="form-control"
                                           value={item.tel_1}
                                           maxLength="64"
                                           required />
                                </div>
                            </div>
                            <div className="form-action text-right">
						        <button type="submit" className="btn-primary" name="btn-1"><i className="fa-check"></i> 儲存</button> { }

                            </div>
                        </form>
                        );
                    return out_sub_1;
                }.bind(this))
                }
            </div>
        );
        return outHtml;
    }
});



var dom = document.getElementById('page_content');
ReactDOM.render(<GirdForm caption={'gb_caption'} menuName={'gb_menuname'} iconClass="fa-list-alt" />, dom); 