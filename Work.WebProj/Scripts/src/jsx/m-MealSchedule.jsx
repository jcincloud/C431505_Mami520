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
                <h3 className="title">{this.props.Caption} 列表</h3>

                <form onSubmit={this.handleSearch}>
                    <div className="table-responsive">
                        <div className="table-header">
                            <div className="table-filter">
                                <div className="form-inline">
                                    <div className="form-group">
                                        <label for="">用餐編號/媽媽姓名/身分證號/電話</label> { }
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
                                        <button className="btn-primary btn-sm" type="submit"><i className="fa-search"></i>{ }搜尋</button>
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
                <h3 className="title">{this.props.Caption} 編輯</h3>

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
            product_record_id={fieldData.product_record_id}
            record_deatil_id={fieldData.record_deatil_id}
            customer_id={fieldData.customer_id}
            born_id={fieldData.born_id}
            day={new Date(moment(fieldData.meal_start).format('YYYY/MM/DD'))}  />

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
            ChangeRecord_list:[],
            isHaveRecord:false,
            RecordDetailData:{},
            MealCount:{},
            CalendarGrid:{indexYear:(this.props.day).getFullYear(),
                          indexMonth:((this.props.day).getMonth()+1),
                          nextYear:0,
                          nextMonth:0,
                          prveYear:0,
                          prveMonth:0}
        };  
    },
    componentWillMount:function(){
        //在輸出前觸發，只執行一次如果您在這個方法中呼叫 setState() ，會發現雖然 render() 再次被觸發了但它還是只執行一次。
        this.setCalendarGrid();
    },
    componentDidMount:function(){
        this.queryChangeRecord();
        this.queryRecordDetail();
    },
    shouldComponentUpdate:function(nextProps,nextState){
        return true;
    },
    queryChangeRecord:function(){
        jqGet(gb_approot + 'api/GetAction/GetChangeRecord',{record_deatil_id:this.props.record_deatil_id})
        .done(function(data, textStatus, jqXHRdata) {
            this.setState({ChangeRecord_list:data.Data,isHaveRecord:data.isHaveRecord});
        }.bind(this))
        .fail(function( jqXHR, textStatus, errorThrown ) {
            showAjaxError(errorThrown);
        });     
    },
    queryRecordDetail:function(){
        jqGet(gb_approot + 'api/GetAction/GetRecordDetail',{record_deatil_id:this.props.record_deatil_id})
        .done(function(data, textStatus, jqXHRdata) {
            this.setState({RecordDetailData:data.record_detail,MealCount:data.meal_count});
        }.bind(this))
        .fail(function( jqXHR, textStatus, errorThrown ) {
            showAjaxError(errorThrown);
        });     
    },
    setCalendarGrid:function(){
        var CalendarGrid=this.state.CalendarGrid;

        if((CalendarGrid.indexMonth+1)>=13){
            CalendarGrid.nextYear=CalendarGrid.indexYear+1;
            CalendarGrid.nextMonth=1;
        }else{
            CalendarGrid.nextYear=CalendarGrid.indexYear;
            CalendarGrid.nextMonth=CalendarGrid.indexMonth+1;
        }

        if((CalendarGrid.indexMonth-1)<=1){
            CalendarGrid.prveYear=CalendarGrid.indexYear-1;
            CalendarGrid.prveMonth=12;
        }else{
            CalendarGrid.prveYear=CalendarGrid.indexYear;
            CalendarGrid.prveMonth=CalendarGrid.indexMonth-1;
        }
        this.setState({CalendarGrid:CalendarGrid});
    },
    setPrve3Month:function(){
        var CalendarGrid=this.state.CalendarGrid;
        var prve=1;
        //中
        if((CalendarGrid.indexMonth-prve)<=0){
            CalendarGrid.indexYear=CalendarGrid.indexYear-1;
            CalendarGrid.indexMonth=(CalendarGrid.indexMonth-prve)+12;
        }else{
            CalendarGrid.indexMonth=CalendarGrid.indexMonth-prve;
        }
        //上
        if((CalendarGrid.prveMonth-prve)<=0){
            CalendarGrid.prveYear=CalendarGrid.prveYear-1;
            CalendarGrid.prveMonth=(CalendarGrid.prveMonth-prve)+12;
        }else{
            CalendarGrid.prveMonth=CalendarGrid.prveMonth-prve;
        }
        //下
        if((CalendarGrid.nextMonth-prve)<=0){
            CalendarGrid.nextYear=CalendarGrid.nextYear-1;
            CalendarGrid.nextMonth=(CalendarGrid.nextMonth-prve)+12;
        }else{
            CalendarGrid.nextMonth=CalendarGrid.nextMonth-prve;
        }
        this.setState({CalendarGrid:CalendarGrid});
    },
    setNext3Month:function(){
        var CalendarGrid=this.state.CalendarGrid;
        var next=1;
        //中
        if((CalendarGrid.indexMonth+next)>=13){
            CalendarGrid.indexYear=CalendarGrid.indexYear+1;
            CalendarGrid.indexMonth=(CalendarGrid.indexMonth+next)-12;
        }else{
            CalendarGrid.indexMonth=CalendarGrid.indexMonth+next;
        }
        //上
        if((CalendarGrid.prveMonth+next)>=13){
            CalendarGrid.prveYear=CalendarGrid.prveYear+1;
            CalendarGrid.prveMonth=(CalendarGrid.prveMonth+next)-12;
        }else{
            CalendarGrid.prveMonth=CalendarGrid.prveMonth+next;
        }
        //下
        if((CalendarGrid.nextMonth+next)>=13){
            CalendarGrid.nextYear=CalendarGrid.nextYear+1;
            CalendarGrid.nextMonth=(CalendarGrid.nextMonth+next)-12;
        }else{
            CalendarGrid.nextMonth=CalendarGrid.nextMonth+next;
        }
        this.setState({CalendarGrid:CalendarGrid}); 
    },
    setProductRecord:function(){
        //返回產品銷售
        document.location.href = gb_approot + 'Active/Product/ProductRecord?product_record_id=' + this.props.product_record_id;
    },  
    render: function() {
        var outHtml = null;
        var change_record_html=null;
        if(this.state.isHaveRecord){
            change_record_html=(
                <table className="table-condensed">
                    <tr>
                        <th className="col-xs-4">異動時間</th>
                        <th className="col-xs-3">用餐日期</th>
                        <th className="col-xs-1 text-center">餐別</th>
                        <th className="col-xs-2 text-center">停／增餐</th>
                        <th className="col-xs-2 text-center">操作人員</th>
                    </tr>
                    <tbody>
                        {
                            this.state.ChangeRecord_list.map(function(itemData,i) {                                           
                                var product_out_html = 
                                    <tr key={itemData.change_record_id}>
                                        <td>{moment(itemData.change_time).format('YYYY/MM/DD HH:mm:ss')}</td>
                                        <td>{moment(itemData.meal_day).format('YYYY/MM/DD')}</td>
                                        <td className="text-center"><StateForGrid stateData={CommData.MealType} id={itemData.meal_type} /></td>
                                        <td className="text-center"><StateForGrid stateData={CommData.ChangeMealType} id={itemData.change_type} /></td>
                                        <td className="text-center">{itemData.user_name}</td>
                                    </tr>;
                                return product_out_html;
                            }.bind(this))
                        }
                    </tbody>
                </table>
                );
        }else{
            change_record_html=(
                <div className="alert alert-warning">
                    <i className="fa-exclamation-triangle"></i> 目前暫無資料
                </div>
                );
        }
        var RecordDetailData=this.state.RecordDetailData;
        var MealCount=this.state.MealCount;
            outHtml =
            (
                <div>
                {/*---用餐排程start---*/}
                    <hr className="condensed" />
                    <h4 className="title">用餐排程</h4>

                    <div className="alert alert-warning">
                        <p> 已停 <strong>{MealCount.pause_meal}</strong> 餐／
                            已增 <strong>{MealCount.add_meal}</strong> 餐／
                            應排 <strong>{MealCount.estimate_total}</strong> 餐／
                            已排 <strong>{MealCount.real_total}</strong> 餐／
                            已吃 <strong>{MealCount.already_eat}</strong> 餐／
                            未吃 <strong>{MealCount.not_eat}</strong> 餐</p>
                        <p><strong className="text-default">黑色：正常</strong>／<strong className="text-danger">紅色：停餐</strong>／<strong className="text-success">綠色：增餐</strong></p>
                    </div>

                    <ul className="pager">
                        <li className="previous">
                            <a onClick={this.setPrve3Month.bind(this)}>← 前 1 個月</a>
                        </li>
                        <li className="next">
                            <a onClick={this.setNext3Month.bind(this)}>後 1 個月 →</a>
                        </li>
                    </ul>

                    <hr className="condensed" />

                    <Calendar ref="Calendar1"
                    year={this.state.CalendarGrid.prveYear}
                    month={this.state.CalendarGrid.prveMonth}
                    record_deatil_id={this.props.record_deatil_id}
                    customer_id={this.props.customer_id}
                    born_id={this.props.born_id}
                    queryChangeRecord={this.queryChangeRecord}
                    queryRecordDetail={this.queryRecordDetail} />

                    <Calendar ref="Calendar2"
                    year={this.state.CalendarGrid.indexYear}
                    month={this.state.CalendarGrid.indexMonth}
                    record_deatil_id={this.props.record_deatil_id}
                    customer_id={this.props.customer_id}
                    born_id={this.props.born_id}
                    queryChangeRecord={this.queryChangeRecord}
                    queryRecordDetail={this.queryRecordDetail} />

                    <Calendar ref="Calendar3"
                    year={this.state.CalendarGrid.nextYear}
                    month={this.state.CalendarGrid.nextMonth}
                    record_deatil_id={this.props.record_deatil_id}
                    customer_id={this.props.customer_id}
                    born_id={this.props.born_id}
                    queryChangeRecord={this.queryChangeRecord}
                    queryRecordDetail={this.queryRecordDetail} />

                    <div className="clearfix">
                        <p className="pull-left"><strong>開始送餐後(含送餐當日) 請勿任意修改用餐排程，如有異動會留下紀錄!!</strong></p>
                        <p className="pull-right text-right">
                            <button type="button" onClick={this.props.noneType}><i className="fa-times"></i> 回列表</button> { }
                            <button type="button" className="btn-info" onClick={this.setProductRecord.bind(this)}><i className="fa-undo"></i> 回產品銷售</button>
                        </p>
                    </div>
                {/*---用餐排程end---*/}
                {/*---異動紀錄start---*/}
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
                                    {change_record_html}
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
                                            <td>{moment(RecordDetailData.meal_start).format('YYYY/MM/DD')}</td>
                                            <td>{moment(RecordDetailData.meal_end).format('YYYY/MM/DD')}</td>
                                            <td>早 {RecordDetailData.estimate_breakfast}／
                                                午 {RecordDetailData.estimate_lunch}／
                                                晚 {RecordDetailData.estimate_dinner}</td>
                                        </tr>
                                        <tr>
                                            <td className="text-right"><strong>實訂</strong></td>
                                            <td>{moment(RecordDetailData.real_estimate_meal_start).format('YYYY/MM/DD')}</td>
                                            <td>{moment(RecordDetailData.real_estimate_meal_end).format('YYYY/MM/DD')}</td>
                                            <td>早 {RecordDetailData.real_estimate_breakfast}／
                                                午 {RecordDetailData.real_estimate_lunch}／
                                                晚 {RecordDetailData.real_estimate_dinner}</td>
                                        </tr>
                                        <tr>
                                            <td className="text-right"><strong>實際</strong></td>
                                            <td>{moment(RecordDetailData.real_meal_start).format('YYYY/MM/DD')}</td>
                                            <td>{moment(RecordDetailData.real_meal_end).format('YYYY/MM/DD')}</td>
                                            <td>早 {RecordDetailData.real_breakfast}／
                                                午 {RecordDetailData.real_lunch}／
                                                晚 {RecordDetailData.real_dinner}</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>{/*table-content*/}
                        </div>
                    </div>
                {/*---異動紀錄end---*/}            
                </div>
            );

        return outHtml;
    }
});

//每月日曆
var Calendar = React.createClass({ 
    mixins: [React.addons.LinkedStateMixin], 
    getInitialState: function() {  
        return {            
            MonthObj:{weekInfo:[]},
            Calendar_id:'calendar-'+this.props.month,
            searchData:{record_deatil_id:this.props.record_deatil_id,month:this.props.month,year:this.props.year},
            dailyMealData:{ record_deatil_id:this.props.record_deatil_id,
                            customer_id:this.props.customer_id,
                            born_id:this.props.born_id,
                            meal_day:null}
        };  
    },
    getDefaultProps:function(){
        return{ 
            year:null,
            month:null
        };
    },
    componentDidMount:function(){
        this.queryMonthObj(this.props.year,this.props.month);
    },
    shouldComponentUpdate:function(nextProps,nextState){
        return true;
    },
    componentWillReceiveProps:function(nextProps){
        //當元件收到新的 props 時被執行，這個方法在初始化時並不會被執行。使用的時機是在我們使用 setState() 並且呼叫 render() 之前您可以比對 props，舊的值在 this.props，而新值就從 nextProps 來。
        if(nextProps.month!=this.props.month){
            this.queryMonthObj(nextProps.year,nextProps.month);
        }
    },
    queryMonthObj:function(year,month){
        var searchData=this.state.searchData;
        searchData.month=month;
        searchData.year=year;

        jqGet(gb_approot + 'api/GetAction/GetMealCalendar',searchData)
        .done(function(data, textStatus, jqXHRdata) {
            console.log(data);
            this.setState({MonthObj:data,searchData:searchData});
        }.bind(this))
        .fail(function( jqXHR, textStatus, errorThrown ) {
            showAjaxError(errorThrown);
        });     
    },
    addDailyMeal:function(meal_day,e){
        var meal_day_f=new Date(moment(meal_day).format('YYYY/MM/DD'));//轉換日期格式
        if(getNowDate()>=meal_day_f)
        {//今天 >= 用餐日期 不可編輯
            return;
        }
        if(!confirm('是否增加此天用餐排程?')){
            return;
        }
        this.state.dailyMealData.meal_day=meal_day;

        jqPost(gb_approot + 'api/GetAction/AddDailyMeal',this.state.dailyMealData)
        .done(function(data, textStatus, jqXHRdata) {
            if(data.result){
                this.queryMonthObj(this.props.year,this.props.month);
                this.props.queryRecordDetail();
            }
        }.bind(this))
        .fail(function( jqXHR, textStatus, errorThrown ) {
            //showAjaxError(errorThrown);
        }); 
    },
    render: function() {
        var outHtml = null;
        var MonthObj=this.state.MonthObj;
            outHtml =
            (
                <div className="panel-group">
                   <div className="panel">
                        <div className="panel-heading">
                            <h4 className="panel-title">
                                <a data-toggle="collapse"  href={'#'+this.state.Calendar_id}>
                                    <i className="fa-plus"></i> {MonthObj.year} 年 {MonthObj.month} 月
                                </a>
                            </h4>
                        </div>
                        <div id={this.state.Calendar_id} className="panel-collapse collapse in">
                            <div className="panel-body">
                                <table className="table-condensed calendar">
                                    <tbody>
                                        <tr>
                                            <th className="text-center">日</th>
                                            <th className="text-center">一</th>
                                            <th className="text-center">二</th>
                                            <th className="text-center">三</th>
                                            <th className="text-center">四</th>
                                            <th className="text-center">五</th>
                                            <th className="text-center">六</th>
                                        </tr>
                                        {
                                            MonthObj.weekInfo.map(function(weekObj,i) {                                                    
                                                var week_out_html = 
                                                    <tr key={MonthObj.month+'-'+i}>
                                                    {
                                                        weekObj.dayInfo.map(function(dayObj,i) {
                                                            var day_out_html=null;
                                                            if(dayObj.isNowMonth && dayObj.isHaveMeal){                                                                                                                                    day_out_html = 
                                                                day_out_html=
                                                                <td key={moment(dayObj.meal_day).format('MM-DD')}> {/* 非當月的日期 class="disabled" */}
                                                                    <small className="text-muted">{moment(dayObj.meal_day).format('MM/DD')}</small>
                                                                    <div className="meal">
                                                                        <MealCheckBox
                                                                        meal_type={1}
                                                                        meal_day={dayObj.meal_day}
                                                                        meal_name={'早'}
                                                                        meal_state={dayObj.breakfast}
                                                                        daily_meal_id={dayObj.daily_meal_id}
                                                                        record_deatil_id={dayObj.record_deatil_id}
                                                                        isMealStart={MonthObj.isMealStart}
                                                                        queryChangeRecord={this.props.queryChangeRecord}
                                                                        queryRecordDetail={this.props.queryRecordDetail} />

                                                                        <MealCheckBox
                                                                        meal_type={2}
                                                                        meal_day={dayObj.meal_day}
                                                                        meal_name={'午'}
                                                                        meal_state={dayObj.lunch}
                                                                        daily_meal_id={dayObj.daily_meal_id}
                                                                        record_deatil_id={dayObj.record_deatil_id}
                                                                        isMealStart={MonthObj.isMealStart}
                                                                        queryChangeRecord={this.props.queryChangeRecord}
                                                                        queryRecordDetail={this.props.queryRecordDetail} />
                                                                        
                                                                        <MealCheckBox
                                                                        meal_type={3}
                                                                        meal_day={dayObj.meal_day}
                                                                        meal_name={'晚'}
                                                                        meal_state={dayObj.dinner}
                                                                        daily_meal_id={dayObj.daily_meal_id}
                                                                        record_deatil_id={dayObj.record_deatil_id}
                                                                        isMealStart={MonthObj.isMealStart}
                                                                        queryChangeRecord={this.props.queryChangeRecord}
                                                                        queryRecordDetail={this.props.queryRecordDetail} />
                                                                    </div>
                                                                </td>;
                                                            }else if(dayObj.isNowMonth){
                                                                day_out_html=
                                                                <td key={moment(dayObj.meal_day).format('MM-DD')} onClick={this.addDailyMeal.bind(this,dayObj.meal_day)}>
                                                                    <small className="text-muted">{moment(dayObj.meal_day).format('MM/DD')}</small>
                                                                </td>;
                                                            }else{//非當月日期
                                                                day_out_html=                                                                                                               day_out_html=
                                                                <td key={moment(dayObj.meal_day).format('MM-DD')} className="disabled">
                                                                    <small className="text-muted">{moment(dayObj.meal_day).format('MM/DD')}</small>
                                                                </td>;
                                                            }                                    

                                                            return day_out_html;
                                                        }.bind(this))
                                                    }
      
                                                    </tr>;
                                                return week_out_html;
                                            }.bind(this))
                                        }
                                        
                                    </tbody>                                     
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            );

        return outHtml;
    }
});

//用餐checkbox
var MealCheckBox = React.createClass({ 
    mixins: [React.addons.LinkedStateMixin], 
    getInitialState: function() {  
        return {            
            MealData:{  daily_meal_id:this.props.daily_meal_id,
                        record_deatil_id:this.props.record_deatil_id,
                        meal_type:this.props.meal_type,
                        meal_state:this.props.meal_state,
                        isMealStart:this.props.isMealStart},
            isMealFinished:false //此日期已經用餐完畢
        };  
    },
    getDefaultProps:function(){
        return{ 
            today:getNowDate(),
            Yesterday:addDate(getNowDate(),-1),
            meal_day:null,
            meal_state:0,
            meal_type:0,//判斷 早餐:1 / 午餐:2 / 晚餐:3
            meal_name:null,
            daily_meal_id:0,
            record_deatil_id:0,
            isMealStart:false
        };
    },
    componentDidMount:function(){
    },
    shouldComponentUpdate:function(nextProps,nextState){
        return true;
    },
    changeMealValue:function(e){
        var obj = this.state.MealData;
        if(!this.props.isMealStart)
        {//正式開始用餐前怎麼修改都不會出現異動紀錄
            if(e.target.checked){
                obj.meal_state=1;
            }else{
                obj.meal_state=-1;
            }
        }else{
            if(!confirm('是否變更此天用餐排程?')){
                return;
            }
            if(e.target.checked){
                obj.meal_state=2;
            }else{
                obj.meal_state=-2;
            }
        }
        jqPost(gb_approot + 'api/GetAction/PostDailyMealState',this.state.MealData)
        .done(function(data, textStatus, jqXHRdata) {
            if(data.result){
                if(this.props.isMealStart){
                    this.props.queryChangeRecord();
                }
                this.props.queryRecordDetail();
            }
        }.bind(this))
        .fail(function( jqXHR, textStatus, errorThrown ) {
            //showAjaxError(errorThrown);
        }); 


        this.setState({MealData:obj});
    },
    render: function() {
        var outHtml = null;
        var name_out_html=null;
        var MealData=this.state.MealData;
        var meal_day=new Date(moment(this.props.meal_day).format('YYYY/MM/DD'));

        if(this.props.today>=meal_day && this.props.meal_state>0)
        {
            name_out_html=(<span className="disabled">{this.props.meal_name +'(已吃)'}</span>);
        }
        else if(MealData.meal_state==2)
        {
            name_out_html=(<span className="text-success">{this.props.meal_name +'(增)'}</span>);
        }
        else if(MealData.meal_state==-2)
        {
            name_out_html=(<span className="text-danger">{this.props.meal_name +'(停)'}</span>);
        }
        else
        {
            name_out_html=(<span>{this.props.meal_name}</span>);
        }
        if(this.props.today>=meal_day)
        {//用餐日期 < 今天 不可編輯
            this.state.isMealFinished=true;
        }
            
            outHtml =
            (
                <div className="checkbox">
                    <label>
                        <input type="checkbox"                             
                        onChange={this.changeMealValue.bind(this)}
                        checked={MealData.meal_state > 0}
                        disabled={this.state.isMealFinished}  />
                        {name_out_html}
                     </label>
                </div>
            );

        return outHtml;
    }
});