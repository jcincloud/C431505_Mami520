var $ = require('jquery');
var React = require('react');
var ReactDOM = require('react-dom');
require("./typeahead.css");

var ReactTypeahead = React.createClass({
    getInitialState: function () {
        return {
            inputValue: null,
            keyword: this.props.value,
            visibility: false,
            tid: null,
            data: [], // format {value:'value',text:'text'}
            pointIndex: -1
        };
    },
    getDefaultProps: function () {
        return {
            disabled: false,
            inputClass: 'form-control',
            divClass: null
        };
    },
    onChange: function (e) {
        var v = e.target.value;
        if (v.trim() != '') {
            this.setState({
                keyword: v
            });

            var _this = this;
            var f = function () { _this.getData(v) };

            clearTimeout(this.tid);
            this.tid = setTimeout(f, 500);

        } else {
            this.setState({
                keyword: v,
                visibility: false
            });
        }
    },
    _onClickItem(i, v, e) {

        this.state.pointIndex = i;
        this.setState({ visibility: false, keyword: v });
        this._Complete();
    },
    _Complete: function () {

        let idx = this.state.pointIndex
        let index_value = this.state.data[idx].value;
        let text = this.state.data[idx].text;
        //console.log(this.state.data);
        this.props.onCompleteChange(this.props.fieldName, this.props.index, { value: index_value, text: text });
    },
    getData: function (q) {
        //console.log(new Date(), 'start query', q);
        clearTimeout(this.tid);
        this.tid = 0;
        if (this.state.keyword.trim() == '') {
            this.setState({
                visibility: false
            });
        } else {
            //
            $.get(this.props.apiPath, { keyword: q })
                .done((data, textStatus, jqXHRdata) => {
                    this.setState({ data: data, visibility: true });
                });
        }
    },
    keyDown: function (e) {

        if (e.keyCode == 40) { // key down
            if (this.state.pointIndex < this.state.data.length - 1) {
                let new_pos = this.state.pointIndex + 1;
                let index_value = this.state.data[new_pos].value;
                this.setState({ pointIndex: new_pos, keyword: index_value });
            }
        }

        if (e.keyCode == 38) { //key up
            if (this.state.pointIndex > 0) {
                let new_pos = this.state.pointIndex - 1;
                let index_value = this.state.data[new_pos].value;
                this.setState({ pointIndex: new_pos, keyword: index_value });
            }
        }

        if (e.keyCode == 13) { //key enter
            this.setState({ pointIndex: -1, visibility: false });
            this._Complete();
        }

        if (e.keyCode == 27) { //key esc restroe value
            this.setState({ pointIndex: -1, visibility: false, keyword: this.props.value });
        }

        //console.log('key down', e.key, e.keyCode);
    },
    onBlur: function (e) {

    },

    componentWillReceiveProps: function (nextProps) {
        if (this.props.value != nextProps.value) {
            this.setState({ keyword: nextProps.value });
        }
    },
    render: function () {
        var out_selector = null;
        if (this.state.visibility) {
            out_selector = <Selector data={this.state.data} pointIndex={this.state.pointIndex} onClickItem={this._onClickItem } />;
        }
        return (
            <div className={this.props.divClass}>
                <input className={this.props.inputClass}
                       type="text"
                       value={this.state.keyword}
                       onChange={this.onChange}
                       onKeyDown={this.keyDown}
                       disabled={this.props.disabled}
                       placeholder={this.props.placeholder} />
                {out_selector}
            </div>
        );
    }
});



var Selector = React.createClass({
    getInitialState: function () {
        return {
        };
    },
    getDefaultProps: function () {
        return {
            setClass: 'list-group-item'
        };
    },
    _onClickItem: function (v, e) {
        this.props.onClickItem(this.props.index, v, e);
    },
    render: function () {
        return (
            <div className="typeahead-panel list-group">
                {
                    this.props.data.map(function (item, i) {
                        if (this.props.pointIndex == i) {
                            return (<Options setClass="list-group-item active" data={item} index={i} key={item.value} onClickItem={this.props.onClickItem } />);
                        }
                        else {
                            return (<Options setClass="list-group-item" data={item} index={i} key={item.value} onClickItem={this.props.onClickItem } />);
                        }
                    }.bind(this))
                }
            </div>
        );
    }
});

var Options = React.createClass({
    getInitialState: function () {
        return {
        };
    },
    getDefaultProps: function () {
        return {
            setClass: 'list-group-item'
        };
    },
    _onClickItem: function (v, e) {
        this.props.onClickItem(this.props.index, v, e);
    },
    render: function () {
        return (
            <a className={this.props.setClass} href="#" onClick={this._onClickItem.bind(this, this.props.data.value) }>
                {this.props.data.text}
            </a>
        );
    }
});
