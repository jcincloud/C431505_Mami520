var GridRow = React.createClass({
    mixins: [React.addons.LinkedStateMixin], 
    getInitialState: function() {  
        return { 
        };  
    },
    delCheck:function(i,chd){
        this.props.delCheck(i,chd);
    },
    modify:function(){
        this.props.updateType(this.props.primKey);
    },
    render:function(){
        return (

                <tr>
                    <td className="text-center"><GridButtonModify modify={this.modify} /></td>
                    <td>{this.props.itemData.meal_id}</td>
                    <td>{this.props.itemData.mom_name}</td>
                    <td>{this.props.itemData.sno}</td>
                    <td>{this.props.itemData.tel_1}</td>
                    <td>{moment(this.props.itemData.meal_start).format('YYYY/MM/DD')}</td>
                    <td>{moment(this.props.itemData.meal_end).format('YYYY/MM/DD')}</td>
                </tr>
            );
        }
});

//主表單
var GirdForm = React.createClass({
    mixins: [React.addons.LinkedStateMixin], 
    getInitialState: function() {  
        return {
            gridData:{rows:[],page:1},
            fieldData:{},
            searchData:{title:null},
            edit_type:0,
            checkAll:false
        };  
    },
    getDefaultProps:function(){
        return{ 
            fdName:'fieldData',
            gdName:'searchData',
            apiPathName:gb_approot+'api/RecordDetail'
        };
    },  
    componentDidMount:function(){
        if(gb_main_id==0){
            this.queryGridData(1);
        }else{//有帶id的話,直接進入修改頁面
            this.updateType(gb_main_id);
        }
    },
    shouldComponentUpdate:function(nextProps,nextState){
        return true;
    },
    deleteSubmit:function(e){

        if(!confirm('確定是否刪除?')){
            return;
        }

        var ids = [];
        for(var i in this.state.gridData.rows){
            if(this.state.gridData.rows[i].check_del){
                ids.push('ids='+this.state.gridData.rows[i].gift_record_id);
            }
        }

        if(ids.length==0){
            tosMessage(null,'未選擇刪除項',2);
            return;
        }

        jqDelete(this.props.apiPathName + '?' + ids.join('&'),{})           
        .done(function(data, textStatus, jqXHRdata) {
            if(data.result){
                tosMessage(null,'刪除完成',1);
                this.queryGridData(0);
            }else{
                tosMessage(null,data.message,3);
            }
        }.bind(this))
        .fail(function( jqXHR, textStatus, errorThrown ) {
            showAjaxError(errorThrown);
        });
    },
    handleSearch:function(e){
        e.preventDefault();
        this.queryGridData(0);
        return;
    },
    delCheck:function(i,chd){

        var newState = this.state;
        this.state.gridData.rows[i].check_del = !chd;
        this.setState(newState);
    },
    checkAll:function(){

        var newState = this.state;
        newState.checkAll = !newState.checkAll;
        for (var prop in this.state.gridData.rows) {
            this.state.gridData.rows[prop].check_del=newState.checkAll;
        }
        this.setState(newState);
    },
    gridData:function(page){

        var parms = {
            page:0
        };

        if(page==0){
            parms.page=this.state.gridData.page;
        }else{
            parms.page=page;
        }

        $.extend(parms, this.state.searchData);

        return jqGet(this.props.apiPathName,parms);
    },
    queryGridData:function(page){
        this.gridData(page)
        .done(function(data, textStatus, jqXHRdata) {
            this.setState({gridData:data});
        }.bind(this))
        .fail(function(jqXHR, textStatus, errorThrown) {
            showAjaxError(errorThrown);
        });
    },
    insertType:function(){
        this.setState({edit_type:1,fieldData:{}});
    },
    updateType:function(id){
        jqGet(this.props.apiPathName,{id:id})
        .done(function(data, textStatus, jqXHRdata) {
            this.setState({edit_type:2,fieldData:data.data});
        }.bind(this))
        .fail(function( jqXHR, textStatus, errorThrown ) {
            showAjaxError(errorThrown);
        });
    },
    noneType:function(){
        this.gridData(0)
        .done(function(data, textStatus, jqXHRdata) {
            this.setState({edit_type:0,gridData:data});
        }.bind(this))
        .fail(function(jqXHR, textStatus, errorThrown) {
            showAjaxError(errorThrown);
        });
    },
    changeFDValue:function(name,e){
        this.setInputValue(this.props.fdName,name,e);
    },
    changeGDValue:function(name,e){
        this.setInputValue(this.props.gdName,name,e);
    },
    setFDValue:function(fieldName,value){
        //此function提供給次元件調用，所以要以屬性往下傳。
        var obj = this.state[this.props.fdName];
        obj[fieldName] = value;
        this.setState({fieldData:obj});
    },
    setInputValue:function(collentName,name,e){

        var obj = this.state[collentName];
        if(e.target.value=='true'){
            obj[name] = true;
        }else if(e.target.value=='false'){
            obj[name] = false;
        }else{
            obj[name] = e.target.value;
        }
        this.setState({fieldData:obj});
    },
    queryAllActivity:function(){//選德目前所有贈品活動
        jqGet(gb_approot + 'api/GetAction/GetAllActivity',{})
        .done(function(data, textStatus, jqXHRdata) {
            this.setState({activity_list:data});
        }.bind(this))
        .fail(function( jqXHR, textStatus, errorThrown ) {
            showAjaxError(errorThrown);
        });     
    },
    render: function() {
        var outHtml = null;

        if(this.state.edit_type==0)
        {
            var searchData = this.state.searchData;

            outHtml =
            (
            <div>
                <h3 className="title">{this.props.Caption}</h3>
                <h4 className="title">{this.props.Caption} 列表</h4>
                <form onSubmit={this.handleSearch}>
                    <div className="table-responsive">
                        <div className="table-header">
                            <div className="table-filter">
                                <div className="form-inline">
                                    <div className="form-group">
                                        <label for="">用餐編號/媽媽姓名/身分證號/電話</label>
                                        <input type="text" className="form-control input-sm"
                                               value={searchData.word}
                                               onChange={this.changeGDValue.bind(this,'word')}
                                               placeholder="請擇一填寫" />
                                    </div>
                                    <div className="form-group">
                                        <label>送餐日期</label> { }                                     
                                            <span className="has-feedback">
                                                <InputDate id="start_date" 
                                                onChange={this.changeGDValue} 
                                                field_name="start_date" 
                                                value={searchData.start_date} />
                                            </span> { }
                                        <label>~</label> { }
                                            <span className="has-feedback">
                                                <InputDate id="end_date" 
                                                onChange={this.changeGDValue} 
                                                field_name="end_date" 
                                                value={searchData.end_date} />
                                            </span> { }                                    
                                    </div>
                                    <div className="form-group">
                                        <button className="btn-primary" type="submit"><i className="fa-search"></i>{ }搜尋</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <table className="table-condensed">
                            <thead>
                                <tr>
                                    <th className="col-xs-1 text-center">修改</th>
                                    <th className="col-xs-1">用餐編號</th>
                                    <th className="col-xs-1">媽媽姓名</th>
                                    <th className="col-xs-2">身分證號</th>
                                    <th className="col-xs-2">電話1</th>
                                    <th className="col-xs-2">送餐起日</th>
                                    <th className="col-xs-2">送餐迄日</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                this.state.gridData.rows.map(function(itemData,i) {
                                return <GridRow 
                                        key={i}
                                        ikey={i}
                                        primKey={itemData.record_deatil_id} 
                                        itemData={itemData} 
                                        delCheck={this.delCheck}
                                        updateType={this.updateType}/>;
                                }.bind(this))
                                }
                            </tbody>
                        </table>
                    </div>
                    <GridNavPage 
                    StartCount={this.state.gridData.startcount}
                    EndCount={this.state.gridData.endcount}
                    RecordCount={this.state.gridData.records}
                    TotalPage={this.state.gridData.total}
                    NowPage={this.state.gridData.page}
                    onQueryGridData={this.queryGridData}
                    InsertType={this.insertType}
                    deleteSubmit={this.deleteSubmit}
                    showAdd={false}
                    showDelete={false} />
                </form>
            </div>
            );
        }
        else if(this.state.edit_type==1 || this.state.edit_type==2)
        {
            var fieldData = this.state.fieldData;

            outHtml=(
            <div>
                <h3 className="title">{this.props.Caption}</h3>
                <h4 className="title">{this.props.Caption} 編輯</h4>

                <form className="form-horizontal clearfix" role="form">
                    <div className="col-xs-9">                    
                        <div className="form-group">
                            <label className="col-xs-2 control-label">用餐編號</label>
                            <div className="col-xs-3">
                                <input type="text" 
                                className="form-control"    
                                value={fieldData.meal_id}
                                onChange={this.changeFDValue.bind(this,'meal_id')}
                                required
                                disabled />
                            </div>
                            <label className="col-xs-2 control-label">媽媽姓名</label>
                            <div className="col-xs-3">
                                <input type="text"                          
                                className="form-control"    
                                value={fieldData.mom_name}
                                onChange={this.changeFDValue.bind(this,'mom_name')}
                                maxLength="64"
                                required 
                                disabled />
                            </div>  
                        </div>
                        <div className="bg-warning">
                            <div className="form-group">
                                <label className="col-xs-2 control-label">連絡電話1</label>
                                <div className="col-xs-3">
                                    <input type="tel" 
                                    className="form-control"    
                                    value={fieldData.tel_1}
                                    onChange={this.changeFDValue.bind(this,'tel_1')}
                                    maxLength="16"
                                    disabled />
                                </div>
                                <label className="col-xs-2 control-label">連絡電話2</label>
                                <div className="col-xs-3">
                                    <input type="tel" 
                                    className="form-control"    
                                    value={fieldData.tel_2}
                                    onChange={this.changeFDValue.bind(this,'tel_2')}
                                    maxLength="16"
                                    disabled />
                                </div>
                            </div>                      
                            <div className="form-group">
                                <label className="col-xs-2 control-label">身分證字號</label>
                                <div className="col-xs-3">
                                    <input type="text" 
                                    className="form-control"    
                                    value={fieldData.sno}
                                    onChange={this.changeFDValue.bind(this,'sno')}
                                    maxLength="10"
                                    disabled />
                                </div>
                                <label className="col-xs-2 control-label">生日</label>
                                <div className="col-xs-3">
                                    <span className="has-feedback">
                                        <InputDate id="birthday" 
                                        onChange={this.changeFDValue} 
                                        field_name="birthday" 
                                        value={fieldData.birthday}
                                        disabled={true} />
                                    </span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="col-xs-2 control-label">送餐地址</label>
                                    <TwAddress ver={1}
                                    onChange={this.changeFDValue}
                                    setFDValue={this.setFDValue}
                                    zip_value={fieldData.tw_zip_1} 
                                    city_value={fieldData.tw_city_1} 
                                    country_value={fieldData.tw_country_1}
                                    address_value={fieldData.tw_address_1}
                                    zip_field="tw_zip_1"
                                    city_field="tw_city_1"
                                    country_field="tw_country_1"
                                    address_field="tw_address_1"
                                    disabled={true}/>
                            </div>

                            <div className="form-group">
                                <label className="col-xs-2 control-label">備用地址</label>
                                    <TwAddress ver={1}
                                    onChange={this.changeFDValue}
                                    setFDValue={this.setFDValue}
                                    zip_value={fieldData.tw_zip_2} 
                                    city_value={fieldData.tw_city_2} 
                                    country_value={fieldData.tw_country_2}
                                    address_value={fieldData.tw_address_2}
                                    zip_field="tw_zip_2"
                                    city_field="tw_city_2"
                                    country_field="tw_country_2"
                                    address_field="tw_address_2"
                                    disabled={true}/>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="col-xs-2 control-label">用餐週期<br />說明</label>
                            <div className="col-xs-10">
                                <textarea col="30" row="2" className="form-control"
                                value={fieldData.meal_memo}
                                onChange={this.changeFDValue.bind(this,'meal_memo')}
                                maxLength="256" disabled></textarea>
                            </div>
                        </div>
                    </div>
                </form>

            {/*---用餐排程---*/}
            <MealCalendar ref="MealCalendar"
            noneType={this.noneType}
            product_record_id={fieldData.product_record_id}  />

            {/*---異動紀錄---*/}
            <ChangeRecord ref="ChangeRecord"
            fieldData={fieldData} />

            </div>
            );
        }else{
            outHtml=(<span>No Page</span>);
        }

        return outHtml;
    }
});

//用餐排程
var MealCalendar = React.createClass({ 
    mixins: [React.addons.LinkedStateMixin], 
    getInitialState: function() {  
        return {
 
        };  
    },
    getDefaultProps:function(){
        return{ 
            fdName:'fieldSubData',
            gdName:'searchData',
            apiPathName:gb_approot+'api/RecordDetail'
        };
    },
    componentDidMount:function(){
    },
    shouldComponentUpdate:function(nextProps,nextState){
        return true;
    },
    setProductRecord:function(){
        //返回產品銷售
        document.location.href = gb_approot + 'Active/Product/ProductRecord?product_record_id=' + this.props.product_record_id;
    },  
    render: function() {
        var outHtml = null;

            outHtml =
            (
                <div>
                    <hr className="condensed" />
                    <h4 className="title">用餐排程</h4>

                    <div className="alert alert-warning">
                        <p> 已停 <strong>6</strong> 餐／
                            已增 <strong>2</strong> 餐／
                            應排 <strong>77</strong> 餐／
                            已排 <strong>77</strong> 餐／
                            已吃 <strong>8</strong> 餐／
                            未吃 <strong>69</strong> 餐</p>
                        <p><strong className="text-default">黑色：正常</strong>／<strong className="text-danger">紅色：停餐</strong>／<strong className="text-success">綠色：增餐</strong></p>
                    </div>

                    <ul className="pager">
                        <li className="previous">
                            <a href="">← 前 3 個月</a>
                        </li>
                        <li className="next">
                            <a href="">後 3 個月 →</a>
                        </li>
                    </ul>

                    <hr className="condensed" />

                    <div className="panel-group">
                        <div className="panel">
                            <div className="panel-heading">
                                <h4 className="panel-title">
                                    <a data-toggle="collapse" href="#calendar1">
                                        <i className="fa-plus"></i> 2015 年 8 月
                                    </a>
                                </h4>
                            </div>
                            <div id="calendar1" className="panel-collapse collapse in">
                                <div className="panel-body">
                                    <table className="table-condensed">
                                        <tr>
                                            <th className="text-center">日</th>
                                            <th className="text-center">一</th>
                                            <th className="text-center">二</th>
                                            <th className="text-center">三</th>
                                            <th className="text-center">四</th>
                                            <th className="text-center">五</th>
                                            <th className="text-center">六</th>
                                        </tr>
                                        <tr>
                                            <td>
                                                <small className="text-muted">1</small>
                                                <div className="meal">
                                                    <div className="checkbox">
                                                        <label>
                                                            <input type="checkbox" checked />
                                                            <span>早</span>
                                                        </label>
                                                    </div>
                                                    <div className="checkbox">
                                                        <label>
                                                            <input type="checkbox" checked />
                                                            <span>午</span>
                                                        </label>
                                                    </div>
                                                    <div className="checkbox">
                                                        <label>
                                                            <input type="checkbox" checked />
                                                            <span>晚</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <small className="text-muted">2</small>
                                                <div className="meal">
                                                    <div className="checkbox">
                                                        <label>
                                                            <input type="checkbox" checked />
                                                            <span>早</span>
                                                        </label>
                                                    </div>
                                                    <div className="checkbox">
                                                        <label>
                                                            <input type="checkbox" checked />
                                                            <span>晚</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <small className="text-muted">3</small>
                                                <div className="meal">
                                                    <div className="checkbox">
                                                        <label>
                                                            <input type="checkbox" disabled checked />
                                                            <span>早 (已吃)</span>
                                                        </label>
                                                    </div>
                                                    <div className="checkbox">
                                                        <label>
                                                            <input type="checkbox" />
                                                            <span className="text-danger">午 (停)</span>
                                                        </label>
                                                    </div>
                                                    <div className="checkbox">
                                                        <label>
                                                            <input type="checkbox" checked />
                                                            <span className="text-success">晚 (增)</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <small className="text-muted">4</small>
                                                <div className="meal">
                                                    <div className="checkbox">
                                                        <label>
                                                            <input type="checkbox" checked />
                                                            <span>早</span>
                                                        </label>
                                                    </div>
                                                    <div className="checkbox">
                                                        <label>
                                                            <input type="checkbox" checked />
                                                            <span>午</span>
                                                        </label>
                                                    </div>
                                                    <div className="checkbox">
                                                        <label>
                                                            <input type="checkbox" checked />
                                                            <span>晚</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <small className="text-muted">5</small>
                                                <div className="meal">
                                                    <div className="checkbox">
                                                        <label>
                                                            <input type="checkbox" checked />
                                                            <span>早</span>
                                                        </label>
                                                    </div>
                                                    <div className="checkbox">
                                                        <label>
                                                            <input type="checkbox" checked />
                                                            <span>午</span>
                                                        </label>
                                                    </div>
                                                    <div className="checkbox">
                                                        <label>
                                                            <input type="checkbox" checked />
                                                            <span>晚</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <small className="text-muted">6</small>
                                                <div className="meal">
                                                    <div className="checkbox">
                                                        <label>
                                                            <input type="checkbox" checked />
                                                            <span>早</span>
                                                        </label>
                                                    </div>
                                                    <div className="checkbox">
                                                        <label>
                                                            <input type="checkbox" checked />
                                                            <span>午</span>
                                                        </label>
                                                    </div>
                                                    <div className="checkbox">
                                                        <label>
                                                            <input type="checkbox" checked />
                                                            <span>晚</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <small className="text-muted">7</small>
                                            </td>
                                        </tr>                                       
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="clearfix">
                        <p className="pull-left"><strong>開始送餐後(含送餐當日) 請勿任意修改用餐排程，如有異動會留下紀錄!!</strong></p>
                        <p className="pull-right text-right">
                            <button type="button" onClick={this.props.noneType}><i className="fa-times"></i> 回列表</button> { }
                            <button type="button" className="btn-info" onClick={this.setProductRecord.bind(this)}><i className="fa-undo"></i> 回產品銷售</button>
                        </p>
                    </div>

                </div>
            );

        return outHtml;
    }
});

//異動紀錄
var ChangeRecord = React.createClass({ 
    mixins: [React.addons.LinkedStateMixin], 
    getInitialState: function() {  
        return {
 
        };  
    },
    getDefaultProps:function(){
        return{ 

        };
    },
    componentDidMount:function(){
    },
    shouldComponentUpdate:function(nextProps,nextState){
        return true;
    },
    render: function() {
        var outHtml = null;

            outHtml =
            (
                <div>
                    <hr className="condensed" />

                    <h4 className="title">異動紀錄</h4>

                    <div className="row">
                        <div className="col-xs-9">
                            <ul className="nav nav-tabs" role="tablist">
                                <li className="active"><a href="#changeLog1" role="tab" data-toggle="tab">用餐排程異動紀錄</a></li>
                                <li><a href="#changeLog2" role="tab" data-toggle="tab">訂餐日期及餐數異動紀錄</a></li>
                            </ul>{/*---tab-nav---*/}
                            <div className="tab-content">
                                <div className="tab-pane active" id="changeLog1">
                                
                                    {/*---沒有資料的話，會出現這個---*/}
                                    <div className="alert alert-warning">
                                        <i className="fa-exclamation-triangle"></i> 目前暫無資料
                                    </div>

                                    <table className="table-condensed">
                                        <tr>
                                            <th className="col-xs-4">異動時間</th>
                                            <th className="col-xs-3">用餐日期</th>
                                            <th className="col-xs-1 text-center">餐別</th>
                                            <th className="col-xs-2 text-center">停／增餐</th>
                                            <th className="col-xs-2 text-center">操作人員</th>
                                        </tr>
                                        <tr>
                                            <td>2015/00/00 00:00</td>
                                            <td>2015/00/00</td>
                                            <td className="text-center">早餐</td>
                                            <td className="text-center">停餐</td>
                                            <td className="text-center">XXX</td>
                                        </tr>
                                        <tr>
                                            <td>2015/00/00 00:00</td>
                                            <td>2015/00/00</td>
                                            <td className="text-center">早餐</td>
                                            <td className="text-center">停餐</td>
                                            <td className="text-center">XXX</td>
                                        </tr>
                                    </table>
                                </div>
                                <div className="tab-pane" id="changeLog2">
                                    <table className="table-condensed">
                                        <tr>
                                            <th className="col-xs-2"></th>
                                            <th className="col-xs-3">送餐起日</th>
                                            <th className="col-xs-3">送餐迄日</th>
                                            <th className="col-xs-4">餐數</th>
                                        </tr>
                                        <tr>
                                            <td className="text-right"><strong>原訂</strong></td>
                                            <td>{moment(this.props.fieldData.meal_start).format('YYYY/MM/DD')}</td>
                                            <td>{moment(this.props.fieldData.meal_end).format('YYYY/MM/DD')}</td>
                                            <td>早 {this.props.fieldData.estimate_breakfast}／
                                                午 {this.props.fieldData.estimate_lunch}／
                                                晚 {this.props.fieldData.estimate_dinner}</td>
                                        </tr>
                                        <tr>
                                            <td className="text-right"><strong>實訂</strong></td>
                                            <td>{moment(this.props.fieldData.real_estimate_meal_start).format('YYYY/MM/DD')}</td>
                                            <td>{moment(this.props.fieldData.real_estimate_meal_end).format('YYYY/MM/DD')}</td>
                                            <td>早 {this.props.fieldData.real_estimate_breakfast}／
                                                午 {this.props.fieldData.real_estimate_lunch}／
                                                晚 {this.props.fieldData.real_estimate_dinner}</td>
                                        </tr>
                                        <tr>
                                            <td className="text-right"><strong>實際</strong></td>
                                            <td>{moment(this.props.fieldData.real_meal_start).format('YYYY/MM/DD')}</td>
                                            <td>{moment(this.props.fieldData.real_meal_end).format('YYYY/MM/DD')}</td>
                                            <td>早 {this.props.fieldData.real_breakfast}／
                                                午 {this.props.fieldData.real_lunch}／
                                                晚 {this.props.fieldData.real_dinner}</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>{/*table-content*/}
                        </div>
                    </div>

                </div>
            );

        return outHtml;
    }
});