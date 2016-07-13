import $ = require('jquery');
import React = require('react');
import ReactDOM = require('react-dom');
import Typeahead = require('comm-typeahead');

import "./typeahead.css";

export class ReactTypeahead extends React.Component<Typeahead.ReactTypeaheadProps, any> {

    tid: number = 0;

    constructor(props) {
        super(props)

        this.onChange = this.onChange.bind(this);
        this._onClickItem = this._onClickItem.bind(this);
        this._Complete = this._Complete.bind(this);
        this.getData = this.getData.bind(this);
        this.keyDown = this.keyDown.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
        this.state = {
            inputValue: null,
            keyword: this.props.value,
            visibility: false,
            tid: null,
            data: [], // format {value:'value',text:'text'}
            pointIndex: -1
        }
    }
    static defaultProps = {
        disabled: false,
        inputClass: 'form-control',
        divClass: null,
        delay: 500,
        formatText: null,
        displayMode: 1 //0:input顯示的是 value 1:示的是text
    };

    onChange(e) {
        var v = e.target.value;
        if (v.trim() != '') {
            this.setState({
                keyword: v
            });

            var _this = this;
            var f = function () { _this.getData(v) };

            clearTimeout(this.tid);
            this.tid = setTimeout(f, this.props.delay);

        } else {
            this.setState({
                keyword: v,
                visibility: false
            });
        }
    }

    _onClickItem(i, data, e) {

        this.state.pointIndex = i;

        if (this.props.displayMode == 0) {
            this.setState({ pointIndex: i, visibility: false, keyword: data.value });
        } else if (this.props.displayMode == 1) {
            this.setState({ pointIndex: i, visibility: false, keyword: data.text });
        }

        this._Complete();
    }
    _Complete() {

        let idx = this.state.pointIndex
        let value = this.state.data[idx].value;
        let text = this.state.data[idx].text;
        this.props.onCompleteChange(this.props.fieldName, this.props.index, { value: value, text: text });
    }
    getData(q) {
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
    }
    keyDown(e) {

        if (e.keyCode == 40) { // key down
            if (this.state.pointIndex < this.state.data.length - 1) {
                let new_pos = this.state.pointIndex + 1;
                let index_value = this.state.data[new_pos].value;
                let index_text = this.state.data[new_pos].text;
                this.setState({ pointIndex: new_pos, keyword: index_text });

                if (this.props.displayMode == 0) {
                    this.setState({ pointIndex: new_pos, keyword: index_value });
                } else if (this.props.displayMode == 1) {
                    this.setState({ pointIndex: new_pos, keyword: index_text });
                }
            }
        }

        if (e.keyCode == 38) { //key up
            if (this.state.pointIndex > 0) {
                let new_pos = this.state.pointIndex - 1;
                let index_value = this.state.data[new_pos].value;
                let index_text = this.state.data[new_pos].text;

                if (this.props.displayMode == 0) {
                    this.setState({ pointIndex: new_pos, keyword: index_value });
                } else if (this.props.displayMode == 1) {
                    this.setState({ pointIndex: new_pos, keyword: index_text });
                }
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
    }
    onBlur(e) {
        //this.setState({ pointIndex: -1, visibility: false });
        //this._Complete();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.value != nextProps.value) {
            this.setState({ keyword: nextProps.value });
        }
    }
    render() {

        var out_selector = null;
        if (this.state.visibility) {
            out_selector = <Selector data={this.state.data}
                pointIndex={this.state.pointIndex}
                onClickItem={this._onClickItem}
                formatText={this.props.formatText}
                />;
        }
        return (
            <span>
                <input className={this.props.inputClass}
                    type="text"
                    value={this.state.keyword}
                    onChange={this.onChange}
                    onKeyDown={this.keyDown}
                    disabled={this.props.disabled}
                    placeholder={this.props.placeholder}
                    />
                {out_selector}
            </span>
        );
    }
}
export class Selector extends React.Component<any, any> {

    constructor(props) {
        super(props)
        this.state = {
        }
    }
    static defaultProps = {
        formatText: null
    };
    render() {
        return (
            <div className="typeahead-panel list-group">
                {
                    this.props.data.map(function (item, i) {
                        if (this.props.pointIndex == i) {
                            return (
                                <Options
                                    setClass="list-group-item active"
                                    data={item}
                                    index={i}
                                    key={item.value}
                                    onClickItem={this.props.onClickItem}
                                    formatText={this.props.formatText}
                                    />);
                        }
                        else {
                            return (
                                <Options
                                    setClass="list-group-item"
                                    data={item}
                                    index={i}
                                    key={item.value}
                                    onClickItem={this.props.onClickItem}
                                    formatText={this.props.formatText}
                                    />);
                        }
                    }.bind(this))
                }
            </div>
        );
    }
}
export class Options extends React.Component<any, any> {
    constructor(props) {
        super(props)
        this._onClickItem = this._onClickItem.bind(this);
        this.state = {
        }
    }
    static defaultProps = {
        setClass: 'list-group-item',
        formatText: null
    };
    _onClickItem(data, e) {
        this.props.onClickItem(this.props.index, data, e);
    }
    render() {

        let outHtml = null;
        if (this.props.formatText != null) {
            var get_text = this.props.formatText(this.props.data);
            outHtml = (
                <a className={this.props.setClass} href="#" onClick={this._onClickItem.bind(this, this.props.data) }>
                    {get_text}
                </a>
            );
        } else {
            outHtml = (
                <a className={this.props.setClass} href="#" onClick={this._onClickItem.bind(this, this.props.data) }>
                    {this.props.data.text}
                </a>
            );
        }

        return outHtml;
    }
}