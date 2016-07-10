var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var CommFunc = require('comm-func');
var ReactBootstrap = require('react-bootstrap');
var Moment = require('moment');
var pikaday = require("Pikaday");
var upload = require("simple-ajax-uploader");
var DT = require("dt");
var GridButtonModify = (function (_super) {
    __extends(GridButtonModify, _super);
    function GridButtonModify(props) {
        _super.call(this, props);
        this.onClick = this.onClick.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.state = {
            className: 'fa-pencil'
        };
    }
    GridButtonModify.prototype.componentDidMount = function () {
        if (this.props.ver == 2) {
            this.setState({ className: 'fa-search-plus' });
        }
    };
    GridButtonModify.prototype.onClick = function () {
        this.props.modify();
    };
    GridButtonModify.prototype.render = function () {
        return React.createElement("button", {"type": "button", "className": "btn-link btn-lg", "onClick": this.onClick}, React.createElement("i", {"className": this.state.className}));
    };
    GridButtonModify.defaultProps = {
        ver: 1
    };
    return GridButtonModify;
})(React.Component);
exports.GridButtonModify = GridButtonModify;
var GridCheckDel = (function (_super) {
    __extends(GridCheckDel, _super);
    function GridCheckDel() {
        _super.call(this);
        this.onChange = this.onChange.bind(this);
    }
    GridCheckDel.prototype.onChange = function (e) {
        console.log('Test1');
        this.props.delCheck(this.props.iKey, this.props.chd);
    };
    GridCheckDel.prototype.render = function () {
        return React.createElement("label", {"className": "cbox"}, React.createElement("input", {"type": "checkbox", "checked": this.props.chd, "onChange": this.onChange}), React.createElement("i", {"className": "fa-check"}));
    };
    return GridCheckDel;
})(React.Component);
exports.GridCheckDel = GridCheckDel;
var GridNavPage = (function (_super) {
    __extends(GridNavPage, _super);
    function GridNavPage(props) {
        _super.call(this, props);
        this.nextPage = this.nextPage.bind(this);
        this.prvePage = this.prvePage.bind(this);
        this.firstPage = this.firstPage.bind(this);
        this.lastPage = this.lastPage.bind(this);
    }
    GridNavPage.prototype.firstPage = function () {
        this.props.onQueryGridData(1);
    };
    GridNavPage.prototype.lastPage = function () {
        this.props.onQueryGridData(this.props.totalPage);
    };
    GridNavPage.prototype.nextPage = function () {
        if (this.props.nowPage < this.props.totalPage) {
            this.props.onQueryGridData(this.props.nowPage + 1);
        }
    };
    GridNavPage.prototype.prvePage = function () {
        if (this.props.nowPage > 1) {
            this.props.onQueryGridData(this.props.nowPage - 1);
        }
    };
    GridNavPage.prototype.jumpPage = function () {
    };
    GridNavPage.prototype.render = function () {
        var setAddButton = null, setDeleteButton = null;
        if (this.props.showAdd) {
            setAddButton = React.createElement("button", {"className": "btn-link text-success", "type": "button", "onClick": this.props.InsertType}, React.createElement("i", {"className": "fa-plus-circle"}), " 新增");
        }
        if (this.props.showDelete) {
            setDeleteButton = React.createElement("button", {"className": "btn-link text-danger", "type": "button", "onClick": this.props.deleteSubmit}, React.createElement("i", {"className": "fa-trash-o"}), " 刪除");
        }
        var oper = null;
        oper = (React.createElement("div", {"className": "table-footer"}, React.createElement("div", {"className": "pull-left"}, setAddButton, setDeleteButton), React.createElement("small", {"className": "pull-right"}, "第", this.props.startCount, "-", this.props.endCount, "筆，共", this.props.recordCount, "筆"), React.createElement("ul", {"className": "pager"}, React.createElement("li", null, React.createElement("a", {"href": "#", "title": "移至第一頁", "tabIndex": -1, "onClick": this.firstPage}, React.createElement("i", {"className": "fa-angle-double-left"}))), " ", React.createElement("li", null, React.createElement("a", {"href": "#", "title": "上一頁", "tabIndex": -1, "onClick": this.prvePage}, React.createElement("i", {"className": "fa-angle-left"}))), " ", React.createElement("li", {"className": "form-inline"}, React.createElement("div", {"className": "form-group"}, React.createElement("label", null, "第"), ' ', React.createElement("input", {"className": "form-control text-center", "type": "number", "min": "1", "tabIndex": -1, "value": this.props.nowPage.toString(), "onChange": this.jumpPage}), ' ', React.createElement("label", null, "頁，共", this.props.totalPage, "頁"))), " ", React.createElement("li", null, React.createElement("a", {"href": "#", "title": "@Resources.Res.NextPage", "tabIndex": -1, "onClick": this.nextPage}, React.createElement("i", {"className": "fa-angle-right"}))), " ", React.createElement("li", null, React.createElement("a", {"href": "#", "title": "移至最後一頁", "tabIndex": -1, "onClick": this.lastPage}, React.createElement("i", {"className": "fa-angle-double-right"}))))));
        return oper;
    };
    GridNavPage.defaultProps = {
        showAdd: true,
        showDelete: true
    };
    return GridNavPage;
})(React.Component);
exports.GridNavPage = GridNavPage;
var InputDate = (function (_super) {
    __extends(InputDate, _super);
    function InputDate(props) {
        _super.call(this, props);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.render = this.render.bind(this);
        this.state = {
            pk: null
        };
    }
    InputDate.prototype.componentDidMount = function () {
        var ele = document.getElementById(this.props.id);
        this.state.pk = new pikaday({
            field: ele,
            format: 'YYYY-MM-DD',
            i18n: {
                previousMonth: '上月',
                nextMonth: '下月',
                months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                weekdays: ['日', '一', '二', '三', '四', '五', '六'],
                weekdaysShort: ['日', '一', '二', '三', '四', '五', '六']
            },
            onSelect: function (date) {
                this.props.onChange(this.props.field_name, date);
            }.bind(this)
        });
    };
    InputDate.prototype.onChange = function (e) {
    };
    InputDate.prototype.render = function () {
        var out_html = null;
        if (this.props.ver == 1) {
            out_html = (React.createElement("div", null, React.createElement("input", {"type": "date", "className": "form-control datetimepicker", "id": this.props.id, "name": this.props.field_name, "value": this.props.value != undefined ? Moment(this.props.value).format(DT.dateFT) : '', "onChange": this.onChange, "required": this.props.required, "disabled": this.props.disabled}), React.createElement("i", {"className": "fa-calendar form-control-feedback"})));
        }
        else if (this.props.ver == 2) {
            out_html = (React.createElement("div", null, React.createElement("input", {"type": "date", "className": "form-control input-sm datetimepicker", "id": this.props.id, "name": this.props.field_name, "value": this.props.value != undefined ? Moment(this.props.value).format(DT.dateFT) : '', "onChange": this.onChange, "required": this.props.required, "disabled": this.props.disabled}), React.createElement("i", {"className": "fa-calendar form-control-feedback"})));
        }
        else if (this.props.ver == 3) {
            out_html = (React.createElement("input", {"type": "text", "className": "form-element-inline datetimepicker", "id": this.props.id, "name": this.props.field_name, "value": this.props.value != undefined ? Moment(this.props.value).format(DT.dateFT) : '', "onChange": this.onChange, "required": this.props.required, "disabled": this.props.disabled}));
        }
        else if (this.props.ver == 4) {
            out_html = (React.createElement("input", {"type": "text", "className": "form-element datetimepicker", "id": this.props.id, "name": this.props.field_name, "value": this.props.value != undefined ? Moment(this.props.value).format(DT.dateFT) : '', "onChange": this.onChange, "required": this.props.required, "disabled": this.props.disabled}));
        }
        return out_html;
    };
    InputDate.defaultProps = {
        id: null,
        value: null,
        onChange: null,
        field_name: null,
        required: false,
        disabled: false,
        ver: 1
    };
    return InputDate;
})(React.Component);
exports.InputDate = InputDate;
var ModalSales = (function (_super) {
    __extends(ModalSales, _super);
    function ModalSales() {
        _super.call(this);
        this.close = this.close.bind(this);
        this.queryModal = this.queryModal.bind(this);
        this.setModalKeyword = this.setModalKeyword.bind(this);
        this.selectModal = this.selectModal.bind(this);
        this.render = this.render.bind(this);
        this.onChange = this.onChange.bind(this);
        this.state = {
            modalData: [],
            keyword: null
        };
    }
    ModalSales.prototype.close = function () {
        this.props.close();
    };
    ModalSales.prototype.queryModal = function () {
        var _this = this;
        CommFunc.jqGet(gb_approot + 'api/GetAction/GetModalQuerySales', { keyword: this.state.keyword })
            .done(function (data, textStatus, jqXHRdata) {
            var obj = _this.state.modalData;
            obj = data;
            _this.setState({ modalData: obj });
        })
            .fail(function (jqXHR, textStatus, errorThrown) {
            CommFunc.showAjaxError(errorThrown);
        });
    };
    ModalSales.prototype.setModalKeyword = function (e) {
        var input = e.target;
        var getObj = this.state.keyword;
        getObj = input.value;
        this.setState({ keyword: getObj });
    };
    ModalSales.prototype.selectModal = function (sales_no, e) {
        var _this = this;
        var qObj = this.state.modalData;
        qObj.map(function (item, index, ary) {
            if (item.sales_no == sales_no) {
                _this.props.updateView(item.sales_no, item.sales_name);
            }
        });
        this.close();
    };
    ModalSales.prototype.onChange = function (e) {
        this.setState({ keyword: e.target.value });
    };
    ModalSales.prototype.render = function () {
        var _this = this;
        var Modal = ReactBootstrap.Modal;
        var out_html = (React.createElement(Modal, {"onHide": this.close, "show": this.props.isShow}, React.createElement(Modal.Header, {"closeButton": true}, React.createElement(Modal.Title, {"id": "contained-modal-title-lg"}, "會員查詢")), React.createElement(Modal.Body, null, React.createElement("div", {"className": "form-inline"}, React.createElement("div", {"className": "form-group"}, React.createElement("label", null, "會員編號"), " ", React.createElement("input", {"type": "text", "className": "form-control input-sm", "value": this.state.keyword, "onChange": this.onChange}), " ", React.createElement("button", {"className": "btn-primary btn-sm", "onClick": this.queryModal}, React.createElement("i", {"className": "fa-search"}), " 搜尋"))), React.createElement("table", {"className": "table-condensed"}, React.createElement("tbody", null, React.createElement("tr", null, React.createElement("th", {"className": "col-xs-3"}, "會員編號"), React.createElement("th", {"className": "col-xs-3"}, "會員姓名"), React.createElement("th", {"className": "col-xs-6"}, "加入日期")), this.state.modalData.map(function (itemData, i) {
            var out_html = React.createElement("tr", {"key": itemData.sales_no}, React.createElement("td", null, React.createElement("button", {"type": "button", "className": "btn btn-link", "onClick": _this.selectModal.bind(_this, itemData.sales_no)}, itemData.sales_no)), React.createElement("td", null, itemData.sales_name), React.createElement("td", null, itemData.join_date));
            return out_html;
        }))))));
        return out_html;
    };
    return ModalSales;
})(React.Component);
exports.ModalSales = ModalSales;
var Tips = (function (_super) {
    __extends(Tips, _super);
    function Tips() {
        _super.apply(this, arguments);
    }
    Tips.prototype.render = function () {
        var Tooltip = ReactBootstrap.Tooltip;
        var OverlayTrigger = ReactBootstrap.OverlayTrigger;
        var tooltipObj = (React.createElement(Tooltip, null, this.props.comment));
        var out_html = null;
        out_html = (React.createElement(OverlayTrigger, {"placement": "top", "overlay": tooltipObj}, React.createElement("span", {"className": "badge"}, "?")));
        return out_html;
    };
    return Tips;
})(React.Component);
exports.Tips = Tips;
var MasterImageUpload = (function (_super) {
    __extends(MasterImageUpload, _super);
    function MasterImageUpload() {
        _super.call(this);
        this.createFileUpLoadObject = this.createFileUpLoadObject.bind(this);
        this.deleteFile = this.deleteFile.bind(this);
        this.getFileList = this.getFileList.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.render = this.render.bind(this);
        this.state = {
            filelist: []
        };
    }
    MasterImageUpload.prototype.componentDidMount = function () {
        if (typeof this.props.MainId === 'string') {
            if (this.props.MainId != null) {
                this.createFileUpLoadObject();
                this.getFileList();
            }
        }
        else if (typeof this.props.MainId === 'number') {
            if (this.props.MainId > 0) {
                this.createFileUpLoadObject();
                this.getFileList();
            }
        }
    };
    MasterImageUpload.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (typeof this.props.MainId === 'string') {
            if (this.props.MainId != null && prevProps.MainId == null) {
                this.createFileUpLoadObject();
                this.getFileList();
            }
        }
        else if (typeof this.props.MainId === 'number') {
            if (this.props.MainId > 0 && prevProps.MainId == 0) {
                this.createFileUpLoadObject();
                this.getFileList();
            }
        }
    };
    MasterImageUpload.prototype.deleteFile = function (filename) {
        CommFunc.jqPost(this.props.url_delete, {
            id: this.props.MainId,
            fileKind: this.props.FileKind,
            filename: filename
        })
            .done(function (data, textStatus, jqXHRdata) {
            if (data.result) {
                this.getFileList();
            }
            else {
                alert(data.message);
            }
        }.bind(this))
            .fail(function (jqXHR, textStatus, errorThrown) {
            CommFunc.showAjaxError(errorThrown);
        });
    };
    MasterImageUpload.prototype.createFileUpLoadObject = function () {
        if (this.props.ParentEditType == 1)
            return;
        var btn = document.getElementById('upload-btn-' + this.props.MainId + '-' + this.props.FileKind);
        var _this = this;
        var uploader = new upload.SimpleUpload({
            button: btn,
            url: this.props.url_upload,
            data: {
                id: this.props.MainId,
                fileKind: this.props.FileKind
            },
            name: 'fileName',
            multiple: true,
            maxSize: 5000,
            allowedExtensions: ['jpg', 'jpeg', 'png'],
            accept: 'image/*',
            responseType: 'json',
            encodeCustomHeaders: true,
            onSubmit: function (filename, ext) {
                if (_this.props.MainId == 0) {
                    alert('此筆資料未完成新增，無法上傳檔案!');
                    return false;
                }
                var progress = document.createElement('div'), bar = document.createElement('div'), fileSize = document.createElement('div'), wrapper = document.createElement('div'), progressBox = document.getElementById('progressBox-' + _this.props.MainId);
                progress.className = 'progress';
                bar.className = 'progress-bar progress-bar-success progress-bar-striped active';
                fileSize.className = 'size';
                wrapper.className = 'wrapper';
                progress.appendChild(bar);
                wrapper.innerHTML = '<div class="name">' + filename + '</div>';
                wrapper.appendChild(fileSize);
                wrapper.appendChild(progress);
                progressBox.appendChild(wrapper);
                this.setProgressBar(bar);
                this.setFileSizeBox(fileSize);
                this.setProgressContainer(wrapper);
            },
            onSizeError: function () {
            },
            onExtError: function () {
            },
            onComplete: function (file, response) {
                if (response.result) {
                    _this.getFileList();
                }
                else {
                    alert(response.message);
                }
            }
        });
    };
    MasterImageUpload.prototype.getFileList = function () {
        CommFunc.jqPost(this.props.url_list, {
            id: this.props.MainId,
            fileKind: this.props.FileKind
        })
            .done(function (data, textStatus, jqXHRdata) {
            if (data.result) {
                this.setState({ filelist: data.files });
            }
            else {
                alert(data.message);
            }
        }.bind(this))
            .fail(function (jqXHR, textStatus, errorThrown) {
            CommFunc.showAjaxError(errorThrown);
        });
    };
    MasterImageUpload.prototype.render = function () {
        var outHtml = null;
        var imgButtonHtml = null;
        if (this.props.ParentEditType == 1) {
            imgButtonHtml = (React.createElement("div", {"className": "form-control"}, React.createElement("small", {"className": "col-xs-6 help-inline"}, "請先按儲存後方可上傳圖片")));
        }
        else if (this.props.ParentEditType == 2) {
            imgButtonHtml = (React.createElement("div", {"className": "form-control"}, React.createElement("input", {"type": "file", "id": 'upload-btn-' + this.props.MainId + '-' + this.props.FileKind, "accept": "image/*"})));
        }
        ;
        outHtml = (React.createElement("div", null, imgButtonHtml, React.createElement("p", {"className": "help-block list-group", "ref": "SortImage"}, this.state.filelist.map(function (itemData, i) {
            var subOutHtml = React.createElement("span", {"className": "img-upload list-group-item", "key": i}, React.createElement("button", {"type": "button", "className": "close", "onClick": this.deleteFile.bind(this, itemData.fileName), "title": "刪除圖片"}, " × "), React.createElement("img", {"src": itemData.iconPath, "title": CommFunc.formatFileSize(itemData.size)}));
            return subOutHtml;
        }, this)), React.createElement("div", {"id": 'progressBox-' + this.props.MainId, "className": "progress-wrap"})));
        return outHtml;
    };
    MasterImageUpload.defaultProps = {
        MainId: 0,
        FileKind: 'F'
    };
    return MasterImageUpload;
})(React.Component);
exports.MasterImageUpload = MasterImageUpload;
var TwAddress = (function (_super) {
    __extends(TwAddress, _super);
    function TwAddress(props) {
        _super.call(this, props);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.onCityChange = this.onCityChange.bind(this);
        this.onCountryChange = this.onCountryChange.bind(this);
        this.listCountry = this.listCountry.bind(this);
        this.valueChange = this.valueChange.bind(this);
        this.render = this.render.bind(this);
        this.state = { country_list: [] };
    }
    TwAddress.prototype.componentDidMount = function () {
        if (this.props.city_value != null) {
            this.listCountry(this.props.city_value);
        }
    };
    TwAddress.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (this.props.city_value != null && this.props.city_value != prevProps.city_value) {
            this.listCountry(this.props.city_value);
        }
    };
    TwAddress.prototype.onCityChange = function (e) {
        var input = e.target;
        this.props.onChange(this.props.city_field, e);
        this.listCountry(input.value);
    };
    TwAddress.prototype.onCountryChange = function (e) {
        var input = e.target;
        this.props.onChange(this.props.country_field, e);
        for (var i in this.state.country_list) {
            var item = this.state.country_list[i];
            if (item.county == input.value) {
                this.props.setFDValue(this.props.zip_field, item.zip);
                break;
            }
        }
    };
    TwAddress.prototype.listCountry = function (value) {
        if (value == null || value == undefined || value == '') {
            this.setState({ country_list: [] });
        }
        else {
            for (var i in DT.twDistrict) {
                var item = DT.twDistrict[i];
                if (item.city == value) {
                    this.setState({ country_list: item.contain });
                    if (this.props.country_value != null) {
                    }
                    break;
                }
            }
        }
    };
    TwAddress.prototype.valueChange = function (f, e) {
        this.props.onChange(f, e);
    };
    TwAddress.prototype.render = function () {
        var out_html = null;
        if (this.props.ver == 1) {
            out_html = (React.createElement("div", null, React.createElement("div", {"className": "col-xs-1"}, React.createElement("input", {"type": "text", "className": "form-control", "value": this.props.zip_value, "onChange": this.valueChange.bind(this, this.props.zip_field), "maxLength": 5, "required": true, "disabled": true})), React.createElement("div", {"className": "col-xs-2"}, React.createElement("select", {"className": "form-control", "value": this.props.city_value, "onChange": this.onCityChange, "required": this.props.required, "disabled": this.props.disabled}, React.createElement("option", {"value": ""}), DT.twDistrict.map(function (itemData, i) {
                return React.createElement("option", {"key": itemData.city, "value": itemData.city}, itemData.city);
            }))), React.createElement("div", {"className": "col-xs-2"}, React.createElement("select", {"className": "form-control", "value": this.props.country_value, "onChange": this.onCountryChange, "required": this.props.required, "disabled": this.props.disabled}, React.createElement("option", {"value": ""}), this.state.country_list.map(function (itemData, i) {
                return React.createElement("option", {"key": itemData.county, "value": itemData.county}, itemData.county);
            }))), React.createElement("div", {"className": "col-xs-3"}, React.createElement("input", {"type": "text", "className": "form-control", "value": this.props.address_value, "onChange": this.valueChange.bind(this, this.props.address_field), "maxLength": 128, "required": this.props.required, "disabled": this.props.disabled}))));
        }
        else if (this.props.ver == 2) {
            out_html = (React.createElement("div", null, React.createElement("div", {"className": "col-1"}, React.createElement("input", {"type": "text", "className": "form-element", "value": this.props.zip_value, "onChange": this.valueChange.bind(this, this.props.zip_field), "maxLength": 5, "required": true, "disabled": true})), React.createElement("div", {"className": "col-2"}, React.createElement("select", {"className": "form-element", "value": this.props.city_value, "onChange": this.onCityChange, "required": this.props.required, "disabled": this.props.disabled}, React.createElement("option", {"value": ""}), DT.twDistrict.map(function (itemData, i) {
                return React.createElement("option", {"key": itemData.city, "value": itemData.city}, itemData.city);
            }))), React.createElement("div", {"className": "col-2"}, React.createElement("select", {"className": "form-element", "value": this.props.country_value, "onChange": this.onCountryChange, "required": this.props.required, "disabled": this.props.disabled}, React.createElement("option", {"value": ""}), this.state.country_list.map(function (itemData, i) {
                return React.createElement("option", {"key": itemData.county, "value": itemData.county}, itemData.county);
            }))), React.createElement("div", {"className": "col-5"}, React.createElement("input", {"type": "text", "className": "form-element", "value": this.props.address_value, "onChange": this.valueChange.bind(this, this.props.address_field), "maxLength": 128, "required": this.props.required, "disabled": this.props.disabled}))));
        }
        else if (this.props.ver == 3) {
            out_html = (React.createElement("div", null, React.createElement("div", {"className": "col-xs-1"}, React.createElement("input", {"type": "text", "className": "form-control", "value": this.props.zip_value, "onChange": this.valueChange.bind(this, this.props.zip_field), "maxLength": 5, "required": true, "disabled": true})), React.createElement("div", {"className": "col-xs-2"}, React.createElement("select", {"className": "form-control", "value": this.props.city_value, "onChange": this.onCityChange, "required": this.props.required, "disabled": this.props.disabled}, React.createElement("option", {"value": ""}), DT.twDistrict.map(function (itemData, i) {
                return React.createElement("option", {"key": itemData.city, "value": itemData.city}, itemData.city);
            }))), React.createElement("div", {"className": "col-xs-2"}, React.createElement("select", {"className": "form-control", "value": this.props.country_value, "onChange": this.onCountryChange, "required": this.props.required, "disabled": this.props.disabled}, React.createElement("option", {"value": ""}), this.state.country_list.map(function (itemData, i) {
                return React.createElement("option", {"key": itemData.county, "value": itemData.county}, itemData.county);
            }))), React.createElement("div", {"className": "col-xs-6"}, React.createElement("input", {"type": "text", "className": "form-control", "value": this.props.address_value, "onChange": this.valueChange.bind(this, this.props.address_field), "maxLength": 128, "required": this.props.required, "disabled": this.props.disabled}))));
        }
        return out_html;
    };
    TwAddress.defaultProps = {
        onChange: null,
        zip_value: null,
        zip_field: null,
        city_value: null,
        city_field: null,
        country_value: null,
        country_field: null,
        address_value: null,
        address_field: null,
        setFDValue: null,
        required: false,
        disabled: false,
        ver: 1
    };
    return TwAddress;
})(React.Component);
exports.TwAddress = TwAddress;
var StateForGird = (function (_super) {
    __extends(StateForGird, _super);
    function StateForGird() {
        _super.call(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
        this.render = this.render.bind(this);
        this.state = {
            setClass: null,
            label: null
        };
    }
    StateForGird.prototype.componentWillReceiveProps = function (nextProps) {
        for (var i in this.props.stateData) {
            var item = this.props.stateData[i];
            if (item.id == nextProps.id) {
                this.setState({ setClass: item.classNameforG, label: item.label });
                break;
            }
        }
    };
    StateForGird.prototype.componentDidMount = function () {
        for (var i in this.props.stateData) {
            var item = this.props.stateData[i];
            if (item.id == this.props.id) {
                this.setState({ setClass: item.classNameforG, label: item.label });
                break;
            }
        }
    };
    StateForGird.prototype.render = function () {
        var outHtml = null;
        outHtml = React.createElement("span", {"className": this.state.setClass}, this.state.label);
        return outHtml;
    };
    StateForGird.defaultProps = {
        stateData: [],
        id: null,
        ver: 1
    };
    return StateForGird;
})(React.Component);
exports.StateForGird = StateForGird;
