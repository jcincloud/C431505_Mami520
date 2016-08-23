import React = require('react');
import ReactDOM = require('react-dom');
import CommFunc = require('comm-func');
import ReactBootstrap = require('react-bootstrap');
import Moment = require('moment');
import pikaday = require("Pikaday");
import upload = require("simple-ajax-uploader");
import DT = require("dt");

export class GridButtonModify extends React.Component<{ modify(): void, ver?: number }, { className: string }> {
    constructor(props) {
        super(props)
        this.onClick = this.onClick.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.state = {
            className: 'fa-pencil'
        }
    }
    componentDidMount() {
        if (this.props.ver == 2) {
            this.setState({ className: 'fa-search-plus' });
        }
    }
    static defaultProps = {
        ver: 1
    };
    onClick() {
        this.props.modify();
    }
    render() {
        return <button type="button" className="btn-link btn-lg" onClick={this.onClick}><i  className={this.state.className}></i></button>
    }
}
export class GridCheckDel extends React.Component<
    { delCheck(p1: any, p2: any): void, iKey: number, chd: boolean, showAdd?: boolean, }, any>
{
    constructor() {
        super()
        this.onChange = this.onChange.bind(this);
    }
    onChange(e) {
        console.log('Test1');
        this.props.delCheck(this.props.iKey, this.props.chd);
    }
    render() {
        return <label className="cbox">
                    <input type="checkbox" checked={this.props.chd} onChange={this.onChange} />
                    <i className="fa-check"></i>
            </label>
    }
}
export class GridNavPage extends React.Component<GridNavPageProps, any> {
    constructor(props) {
        super(props)
        this.nextPage = this.nextPage.bind(this);
        this.prvePage = this.prvePage.bind(this);
        this.firstPage = this.firstPage.bind(this);
        this.lastPage = this.lastPage.bind(this);
    }
    static defaultProps = {
        showAdd: true,
        showDelete: true
    };
    firstPage() {
        this.props.onQueryGridData(1);
    }
    lastPage() {
        this.props.onQueryGridData(this.props.totalPage);
    }
    nextPage() {
        if (this.props.nowPage < this.props.totalPage) {
            this.props.onQueryGridData(this.props.nowPage + 1);
        }
    }
    prvePage() {
        if (this.props.nowPage > 1) {
            this.props.onQueryGridData(this.props.nowPage - 1);
        }
    }
    jumpPage() {

    }
    render() {
        var setAddButton = null, setDeleteButton = null;
        if (this.props.showAdd) {
            setAddButton = <button className="btn-link text-success"
                type="button"
                onClick={this.props.InsertType}>
                            <i className="fa-plus-circle"></i> 新增
                </button>;
        }

        if (this.props.showDelete) {
            setDeleteButton = <button className="btn-link text-danger" type="button"
                onClick={this.props.deleteSubmit}>
                                    <i className="fa-trash-o"></i> 刪除
                </button>;

        }
        var oper = null;

        oper = (
            <div className="table-footer">
                <div className="pull-left">
                    {setAddButton}
                    {setDeleteButton}
                    </div>
                <small className="pull-right">第{this.props.startCount}-{this.props.endCount}筆，共{this.props.recordCount}筆</small>

                <ul className="pager">
                    <li>
                        <a href="#" title="移至第一頁" tabIndex={-1} onClick={this.firstPage}>
                            <i className="fa-angle-double-left"></i>
                            </a>
                        </li> { }
                    <li>
                        <a href="#" title="上一頁" tabIndex={-1} onClick={this.prvePage}>
                            <i className="fa-angle-left"></i>
                            </a>
                        </li> { }
                    <li className="form-inline">
                        <div className="form-group">
                            <label>第</label>
                            {' '}
                            <input className="form-control text-center" type="number" min="1" tabIndex={-1} value={this.props.nowPage.toString() }
                                onChange={this.jumpPage} />
                            {' '}
                            <label>頁，共{this.props.totalPage}頁</label>
                            </div>
                        </li> { }
                    <li>
                        <a href="#" title="@Resources.Res.NextPage" tabIndex={-1} onClick={this.nextPage}>
                            <i className="fa-angle-right"></i>
                            </a>
                        </li> { }
                    <li>
                        <a href="#" title="移至最後一頁" tabIndex={-1} onClick={this.lastPage}>
                            <i className="fa-angle-double-right"></i>
                            </a>
                        </li>
                    </ul>
                </div>
        );

        return oper;
    }
}
export class InputDate extends React.Component<{
    id: string,
    value: Date,
    onChange(field_name: string, date_value: Date): void,
    field_name: string,
    required: boolean,
    disabled: boolean,
    ver: number
}, { pk?: any }>{

    constructor(props) {
        super(props)
        this.componentDidMount = this.componentDidMount.bind(this);
        //this.onChange = this.onChange.bind(this);
        this.render = this.render.bind(this);

        this.state = {
            pk: null
        }
    }
    static defaultProps = {
        id: null,
        value: null,
        onChange: null,
        field_name: null,
        required: false,
        disabled: false,
        ver: 1
    }

    componentDidMount() {
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
    }
    onChange(e) {
        //this.props.onChange(this.props.field_name, e);
    }

    render() {
        var out_html = null;
        if (this.props.ver == 1) {
            out_html = (
                <div>
                    <input
                        type="date"
                        className="form-control datetimepicker"
                        id={this.props.id}
                        name={this.props.field_name}
                        value={this.props.value != undefined ? Moment(this.props.value).format(DT.dateFT) : ''}
                        onChange={this.onChange}
                        required={this.props.required}
                        disabled={this.props.disabled} />
                    <i className="fa-calendar form-control-feedback"></i>
                    </div>
            );
        } else if (this.props.ver == 2) {
            out_html = (
                <div>
                    <input
                        type="date"
                        className="form-control input-sm datetimepicker"
                        id={this.props.id}
                        name={this.props.field_name}
                        value={this.props.value != undefined ? Moment(this.props.value).format(DT.dateFT) : ''}
                        onChange={this.onChange}
                        required={this.props.required}
                        disabled={this.props.disabled} />
                        <i className="fa-calendar form-control-feedback"></i>
                    </div>
            );
        } else if (this.props.ver == 3) {//前台歷史訂單查詢
            out_html = (
                <input
                    type="text"
                    className="form-element-inline datetimepicker"
                    id={this.props.id}
                    name={this.props.field_name}
                    value={this.props.value != undefined ? Moment(this.props.value).format(DT.dateFT) : ''}
                    onChange={this.onChange}
                    required={this.props.required}
                    disabled={this.props.disabled} />
            );
        } else if (this.props.ver == 4) {//前台已付款通知
            out_html = (
                <input
                    type="text"
                    className="form-element datetimepicker"
                    id={this.props.id}
                    name={this.props.field_name}
                    value={this.props.value != undefined ? Moment(this.props.value).format(DT.dateFT) : ''}
                    onChange={this.onChange}
                    required={this.props.required}
                    disabled={this.props.disabled} />
            );
        }

        return out_html;
    }
}

interface GridNavPageProps {
    onQueryGridData(p1: number): void,
    InsertType(): void,
    deleteSubmit(): void,
    nowPage: number,
    totalPage: number,
    startCount: number,
    endCount: number,
    recordCount: number,
    showAdd?: boolean,
    showDelete?: boolean
}
interface ModalSalesProps {
    isShow: boolean,
    fieldSalesNo: string,
    fieldSalesName: string,
    setValue?(): void,
    close(): void
    updateView(sales_no: string, sales_name: string): void,
}
interface ModalSalesState {
    modalData?: Array<server.Sales>;
    keyword?: string;
}
export class ModalSales extends React.Component<ModalSalesProps, ModalSalesState>{
    constructor() {
        super();
        this.close = this.close.bind(this);
        this.queryModal = this.queryModal.bind(this);
        this.setModalKeyword = this.setModalKeyword.bind(this);
        this.selectModal = this.selectModal.bind(this);
        this.render = this.render.bind(this);
        this.onChange = this.onChange.bind(this);
        this.state = {
            modalData: [],
            keyword: null
        }
    }

    close() {
        this.props.close();
    }
    queryModal() {
        CommFunc.jqGet(gb_approot + 'api/GetAction/GetModalQuerySales', { keyword: this.state.keyword })
            .done((data, textStatus, jqXHRdata) => {
                var obj = this.state.modalData;
                obj = data;
                this.setState({ modalData: obj });
            })
            .fail((jqXHR, textStatus, errorThrown) => {
                CommFunc.showAjaxError(errorThrown);
            });
    }
    setModalKeyword(e: React.SyntheticEvent) {

        let input: HTMLInputElement = e.target as HTMLInputElement;
        let getObj = this.state.keyword;
        getObj = input.value;
        this.setState({ keyword: getObj });
    }
    selectModal(sales_no: string, e: React.SyntheticEvent) {

        let qObj = this.state.modalData;

        qObj.map((item, index, ary) => {
            if (item.sales_no == sales_no) {
                this.props.updateView(item.sales_no, item.sales_name);
            }
        });

        this.close();
    }
    onChange(e) {
        this.setState({ keyword: e.target.value });
    }
    render() {

        let Modal = ReactBootstrap.Modal;
        let out_html: JSX.Element = (
            <Modal onHide={this.close} show={this.props.isShow}>
    <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-lg">
            會員查詢</Modal.Title>
        </Modal.Header>
    <Modal.Body>

                <div className="form-inline">
                    <div className="form-group">
                        <label>會員編號</label> { }
                        <input type="text" className="form-control input-sm"
                            value={this.state.keyword}
                            onChange={this.onChange}
                            /> { }
                        <button className="btn-primary btn-sm" onClick={this.queryModal}><i className="fa-search"></i> 搜尋</button>
                        </div>
                    </div>

                <table className="table-condensed">
                    <tbody>
                        <tr>
                            <th className="col-xs-3">會員編號</th>
                            <th className="col-xs-3">會員姓名</th>
                            <th className="col-xs-6">加入日期</th>
                            </tr>
                        {
                        this.state.modalData.map((itemData, i) => {
                            var out_html =
                                <tr key={itemData.sales_no}>
                            <td>
                                <button type="button" className="btn btn-link" onClick={this.selectModal.bind(this, itemData.sales_no) }>{itemData.sales_no}</button>
                                </td>
                            <td>{itemData.sales_name}</td>
                            <td>{itemData.join_date}</td>
                                    </tr>
                                ;
                            return out_html;
                        })
                        }
                        </tbody>
                    </table>
        </Modal.Body>
                </Modal>
        );

        return out_html;
    }
}
export class Tips extends React.Component<{ comment: string, children?: any }, any>{
    render() {
        //
        var Tooltip = ReactBootstrap.Tooltip;
        var OverlayTrigger = ReactBootstrap.OverlayTrigger;
        const tooltipObj = (<Tooltip>{this.props.comment}</Tooltip>);
        var out_html = null;
        out_html = (<OverlayTrigger placement="top" overlay={tooltipObj}><span className="badge">?</span></OverlayTrigger>);

        return out_html;
    }
}

interface FileUpProps {
    url_upload?: string,
    url_list?: string,
    url_delete?: string,
    url_download?: string,
    url_sort?: string,
    FileKind: string,
    MainId: number | string,
    ParentEditType?: number
}
export class MasterImageUpload extends React.Component<FileUpProps, any>{

    constructor() {
        super();
        this.createFileUpLoadObject = this.createFileUpLoadObject.bind(this);
        this.deleteFile = this.deleteFile.bind(this);
        this.getFileList = this.getFileList.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.render = this.render.bind(this);
        this.state = {
            filelist: []
        }
    }
    static defaultProps: FileUpProps = {
        MainId: 0,
        FileKind: 'F'
    }

    componentDidMount() {
        if (typeof this.props.MainId === 'string') {
            if (this.props.MainId != null) {
                this.createFileUpLoadObject();
                this.getFileList();
            }
        } else if (typeof this.props.MainId === 'number') {
            if (this.props.MainId > 0) {
                this.createFileUpLoadObject();
                this.getFileList();
            }
        }
    }
    componentDidUpdate(prevProps, prevState) {
        if (typeof this.props.MainId === 'string') {
            if (this.props.MainId != null && prevProps.MainId == null) {
                this.createFileUpLoadObject();
                this.getFileList();
            }
        } else if (typeof this.props.MainId === 'number') {
            if (this.props.MainId > 0 && prevProps.MainId == 0) {
                this.createFileUpLoadObject();
                this.getFileList();
            }
        }
    }
    deleteFile(filename) {
        CommFunc.jqPost(this.props.url_delete, {
            id: this.props.MainId,
            fileKind: this.props.FileKind,
            filename: filename
        })
            .done(function (data, textStatus, jqXHRdata) {
                if (data.result) {
                    this.getFileList();
                } else {
                    alert(data.message);
                }
            }.bind(this))
            .fail(function (jqXHR, textStatus, errorThrown) {
                CommFunc.showAjaxError(errorThrown);
            });
    }
    createFileUpLoadObject() {

        if (this.props.ParentEditType == 1)
            return;

        let btn = document.getElementById('upload-btn-' + this.props.MainId + '-' + this.props.FileKind);
        let _this = this;

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
                    alert('此筆資料未完成新增，無法上傳檔案!')
                    return false;
                }

                var progress = document.createElement('div'), // container for progress bar
                    bar = document.createElement('div'), // actual progress bar
                    fileSize = document.createElement('div'), // container for upload file size
                    wrapper = document.createElement('div'), // container for this progress bar
                    progressBox = document.getElementById('progressBox-' + _this.props.MainId); // on page container for progress bars

                // Assign each element its corresponding class
                progress.className = 'progress';
                bar.className = 'progress-bar progress-bar-success progress-bar-striped active';
                fileSize.className = 'size';
                wrapper.className = 'wrapper';

                // Assemble the progress bar and add it to the page
                progress.appendChild(bar);
                wrapper.innerHTML = '<div class="name">' + filename + '</div>'; // filename is passed to onSubmit()
                wrapper.appendChild(fileSize);
                wrapper.appendChild(progress);
                progressBox.appendChild(wrapper); // just an element on the page to hold the progress bars    

                // Assign roles to the elements of the progress bar
                this.setProgressBar(bar); // will serve as the actual progress bar
                this.setFileSizeBox(fileSize); // display file size beside progress bar
                this.setProgressContainer(wrapper); // designate the containing div to be removed after upload	
            },
            onSizeError: function () {
                //errBox.innerHTML = 'Files may not exceed 500K.';
            },
            onExtError: function () {
                //errBox.innerHTML = 'Invalid file type. Please select a PNG, JPG, GIF image.';
            },
            onComplete: function (file, response) {
                if (response.result) {
                    _this.getFileList();
                } else {
                    alert(response.message);
                }
            }
        });
    }
    getFileList() {
        CommFunc.jqPost(this.props.url_list, {
            id: this.props.MainId,
            fileKind: this.props.FileKind
        })
            .done(function (data, textStatus, jqXHRdata) {
                if (data.result) {
                    this.setState({ filelist: data.files })
                } else {
                    alert(data.message);
                }
            }.bind(this))
            .fail(function (jqXHR, textStatus, errorThrown) {
                CommFunc.showAjaxError(errorThrown);
            });
    }
    render() {

        var outHtml = null;
        var imgButtonHtml = null;
        if (this.props.ParentEditType == 1) {
            imgButtonHtml = (
                <div className="form-control">
                <small className="col-xs-6 help-inline">請先按儲存後方可上傳圖片</small>
                    </div>
            );
        } else if (this.props.ParentEditType == 2) {
            imgButtonHtml = (
                <div className="form-control">
                <input type="file" id={'upload-btn-' + this.props.MainId + '-' + this.props.FileKind} accept="image/*" />
                    </div>
            );
        };
        outHtml = (
            <div>
            {imgButtonHtml}
            <p className="help-block list-group" ref="SortImage">
            {
            this.state.filelist.map(function (itemData, i) {
                var subOutHtml =
                    <span className="img-upload list-group-item" key={i}>
                        <button type="button"
                            className="close"
                            onClick={this.deleteFile.bind(this, itemData.fileName) }
                            title="刪除圖片"> &times; </button>
                        <img src={itemData.iconPath} title={CommFunc.formatFileSize(itemData.size) } />
                        </span>;
                return subOutHtml;
            }, this)
            }
                </p>
            <div id={'progressBox-' + this.props.MainId} className="progress-wrap"></div>
                </div>
        );
        return outHtml;
    }
}


interface TwAddressProps {
    onChange(fieldName: string, e: React.SyntheticEvent): void,
    setFDValue(fieldName: string, e: React.SyntheticEvent): void,
    zip_value: string,
    zip_field: string,
    city_value: string,
    city_field: string,
    country_value: string,
    country_field: string,
    address_value: string,
    address_field: string,
    required?: boolean,
    disabled?: boolean,
    ver?: number
}
export class TwAddress extends React.Component<TwAddressProps, { country_list: Array<any> }>{
    constructor(props) {
        super(props)
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentDidUpdate = this.componentDidUpdate.bind(this);
        this.onCityChange = this.onCityChange.bind(this);
        this.onCountryChange = this.onCountryChange.bind(this);
        this.listCountry = this.listCountry.bind(this);
        this.valueChange = this.valueChange.bind(this);
        this.render = this.render.bind(this);
        this.state = { country_list: [] };
    }
    static defaultProps = {
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
    }

    componentDidMount() {
        if (this.props.city_value != null) {
            this.listCountry(this.props.city_value);
        }
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.props.city_value != null && this.props.city_value != prevProps.city_value) {
            this.listCountry(this.props.city_value);
        }
    }
    onCityChange(e: React.SyntheticEvent) {
        let input: HTMLSelectElement = e.target as HTMLSelectElement;
        this.props.onChange(this.props.city_field, e);
        this.listCountry(input.value);
    }
    onCountryChange(e: React.SyntheticEvent) {
        let input: HTMLInputElement = e.target as HTMLInputElement;
        this.props.onChange(this.props.country_field, e);
        for (var i in this.state.country_list) {
            var item = this.state.country_list[i];
            if (item.county == input.value) {
                this.props.setFDValue(this.props.zip_field, item.zip);
                break;
            }
        }
    }
    listCountry(value) {

        if (value == null || value == undefined || value == '') {
            this.setState({ country_list: [] });
        }
        else {
            for (var i in DT.twDistrict) {
                var item = DT.twDistrict[i];
                if (item.city == value) {
                    this.setState({ country_list: item.contain });
                    if (this.props.country_value != null) {
                        //console.log('country_value');
                        //this.setState({a:1});
                    }
                    //console.log('country value:',this.props.country_value);

                    //切換完成預設設為第一個
                    //var item_1 = item.contain[0];
                    //this.props.setFDValue(this.props.country_field,item_1.county);
                    //this.props.setFDValue(this.props.zip_field,item_1.zip);
                    break;
                }
            }
        }
    }
    valueChange(f, e) {
        this.props.onChange(f, e);
    }
    render() {
        var out_html = null;
        if (this.props.ver == 1) {
            out_html = (
                <div>
                    <div className="col-xs-1">
                        <input 	type="text"
                            className="form-control"
                            value={this.props.zip_value}
                            onChange={this.valueChange.bind(this, this.props.zip_field) }
                            maxLength={5}
                            required disabled />
                        </div>
                    <div className="col-xs-2">
                        <select className="form-control"
                            value={this.props.city_value}
                            onChange={this.onCityChange}
                            required={this.props.required}
                            disabled={this.props.disabled}>
                                <option value=""></option>
                                {
                                DT.twDistrict.map(function (itemData, i) {
                                    return <option key={itemData.city} value={itemData.city}>{itemData.city}</option>;
                                })
                                }
                            </select>
                        </div>
                    <div className="col-xs-2">
                        <select className="form-control"
                            value={this.props.country_value}
                            onChange={this.onCountryChange}
                            required={this.props.required}
                            disabled={this.props.disabled}>
                                <option value=""></option>
                                {
                                this.state.country_list.map(function (itemData, i) {
                                    return <option key={itemData.county} value={itemData.county}>{itemData.county}</option>;
                                })
                                }
                            </select>
                        </div>
                    <div className="col-xs-3">
                        <input 	type="text"
                            className="form-control"
                            value={this.props.address_value}
                            onChange={this.valueChange.bind(this, this.props.address_field) }
                            maxLength={128}
                            required={this.props.required}
                            disabled={this.props.disabled}/>
                        </div>
                    </div>
            );
        } else if (this.props.ver == 2) {
            out_html = (
                <div>
                    <div className="col-1">
                        <input type="text" className="form-element"
                            value={this.props.zip_value}
                            onChange={this.valueChange.bind(this, this.props.zip_field) }
                            maxLength={5}
                            required disabled /></div>
                    <div className="col-2">
                        <select className="form-element"
                            value={this.props.city_value}
                            onChange={this.onCityChange}
                            required={this.props.required}
                            disabled={this.props.disabled}>
                                <option value=""></option>
                                {
                                DT.twDistrict.map(function (itemData, i) {
                                    return <option key={itemData.city} value={itemData.city}>{itemData.city}</option>;
                                })
                                }
                            </select>
                        </div>
                    <div className="col-2">
                        <select className="form-element"
                            value={this.props.country_value}
                            onChange={this.onCountryChange}
                            required={this.props.required}
                            disabled={this.props.disabled}>
                                <option value=""></option>
                                {
                                this.state.country_list.map(function (itemData, i) {
                                    return <option key={itemData.county} value={itemData.county}>{itemData.county}</option>;
                                })
                                }
                            </select>
                        </div>
                    <div className="col-5">
                        <input 	type="text"
                            className="form-element"
                            value={this.props.address_value}
                            onChange={this.valueChange.bind(this, this.props.address_field) }
                            maxLength={128}
                            required={this.props.required}
                            disabled={this.props.disabled}/>
                        </div>
                    </div>
            );
        } else if (this.props.ver == 3) {
            out_html = (
                <div>
                    <div className="col-xs-1">
                        <input 	type="text"
                            className="form-control"
                            value={this.props.zip_value}
                            onChange={this.valueChange.bind(this, this.props.zip_field) }
                            maxLength={5}
                            required disabled />
                        </div>
                    <div className="col-xs-2">
                        <select className="form-control"
                            value={this.props.city_value}
                            onChange={this.onCityChange}
                            required={this.props.required}
                            disabled={this.props.disabled}>
                                <option value=""></option>
                                {
                                DT.twDistrict.map(function (itemData, i) {
                                    return <option key={itemData.city} value={itemData.city}>{itemData.city}</option>;
                                })
                                }
                            </select>
                        </div>
                    <div className="col-xs-2">
                        <select className="form-control"
                            value={this.props.country_value}
                            onChange={this.onCountryChange}
                            required={this.props.required}
                            disabled={this.props.disabled}>
                                <option value=""></option>
                                {
                                this.state.country_list.map(function (itemData, i) {
                                    return <option key={itemData.county} value={itemData.county}>{itemData.county}</option>;
                                })
                                }
                            </select>
                        </div>
                    <div className="col-xs-6">
                        <input 	type="text"
                            className="form-control"
                            value={this.props.address_value}
                            onChange={this.valueChange.bind(this, this.props.address_field) }
                            maxLength={128}
                            required={this.props.required}
                            disabled={this.props.disabled}/>
                        </div>
                    </div>
            );
        }

        return out_html;
    }
}

export class StateForGird extends React.Component<{ stateData: Array<server.StateTemplate>, id: number, ver?: number }, { setClass: string, label: string }>{
    constructor() {

        super();
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillReceiveProps = this.componentWillReceiveProps.bind(this);
        this.render = this.render.bind(this);

        this.state = {
            setClass: null,
            label: null
        }
    }
    static defaultProps = {
        stateData: [],
        id: null,
        ver: 1
    }
    componentWillReceiveProps(nextProps) {
        //當元件收到新的 props 時被執行，這個方法在初始化時並不會被執行。使用的時機是在我們使用 setState() 並且呼叫 render() 之前您可以比對 props，舊的值在 this.props，而新值就從 nextProps 來。
        for (var i in this.props.stateData) {
            var item = this.props.stateData[i];
            if (item.id == nextProps.id) {
                this.setState({ setClass: item.classNameforG, label: item.label });
                break;
            }
        }
    }
    componentDidMount() {
        for (var i in this.props.stateData) {
            var item = this.props.stateData[i];
            if (item.id == this.props.id) {
                this.setState({ setClass: item.classNameforG, label: item.label });
                break;
            }
        }
    }
    render() {
        let outHtml: JSX.Element = null;
        outHtml = <span className={this.state.setClass}>
                    {this.state.label}
            </span>;
        return outHtml;
    }
} 