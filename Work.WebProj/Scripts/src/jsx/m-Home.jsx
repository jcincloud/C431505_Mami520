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
					<td className="text-center"><GridCheckDel iKey={this.props.ikey} chd={this.props.itemData.check_del} delCheck={this.delCheck} /></td>
					<td className="text-center"><GridButtonModify modify={this.modify}/></td>
					<td className="text-center">{moment(this.props.itemData.tel_day).format('YYYY/MM/DD')}</td>
					<td>{this.props.itemData.meal_id}</td>
					<td>{this.props.itemData.mom_name}</td>
					<td>{this.props.itemData.tel_1}</td>
					<td>{this.props.itemData.tel_2}</td>
					<td className="text-center"><StateForGrid stateData={CommData.TelReasonByDetail} id={this.props.itemData.tel_reason} /></td>		
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
			fieldData:{tel_reason:1,is_detailInsert:true},
			searchData:{title:null,start_date:moment(Date()).format('YYYY/MM/DD'),end_date:moment(Date()).format('YYYY/MM/DD')},
			searchBornData:{word:null,is_close:null},
			edit_type:1,
			checkAll:false,
			isShowCustomerBornSelect:false,
			born_list:[],
			searchCustomer:{}
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/ScheduleDetail'
		};
	},	
	componentDidMount:function(){
		this.queryGridData(1);
	},
	shouldComponentUpdate:function(nextProps,nextState){
		return true;
	},
	handleSubmit: function(e) {

		e.preventDefault();
		if(this.state.fieldData.customer_id==null || this.state.fieldData.customer_id==undefined){
			tosMessage(gb_title_from_invalid,'未選擇客戶無法新增電訪名單資料!!',3);
			return;
		}

		if(this.state.edit_type==1){
			jqPost(this.props.apiPathName,this.state.fieldData)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					if(data.message!=null){
						tosMessage(null,'新增完成'+data.message,1);
					}else{
						tosMessage(null,'新增完成',1);
					}
					this.updateType(data.id);
					this.queryGridData(0);
				}else{
					tosMessage(null,data.message,3);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
		}		
		else if(this.state.edit_type==2){
			jqPut(this.props.apiPathName,this.state.fieldData)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					if(data.message!=null){
						tosMessage(null,'修改完成'+data.message,1);
					}else{
						tosMessage(null,'修改完成',1);
					}
				}else{
					tosMessage(null,data.message,3);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
		};

		return;
	},
	deleteSubmit:function(e){

		if(!confirm('確定是否刪除?')){
			return;
		}

		var ids = [];
		var check_id=false;
		for(var i in this.state.gridData.rows){
			if(this.state.gridData.rows[i].check_del){
				ids.push('ids='+this.state.gridData.rows[i].schedule_detail_id);
				if(this.state.gridData.rows[i].schedule_detail_id==this.state.fieldData.schedule_detail_id){
					check_id=true;
				}
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
				if(check_id){
					this.insertType();
				}
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
		this.setState({edit_type:1,fieldData:{tel_reason:1,is_detailInsert:true}});
	},
	updateType:function(id){
		jqGet(this.props.apiPathName,{id:id})
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({edit_type:2,fieldData:data.data});
			this.refs.SubForm.queryGridData();
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
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
	setSearchVal:function(name,e){
		var obj = this.state.searchData;
		obj[name] = e.target.value;
		if(name=='start_date'){
			obj['end_date'] = e.target.value;
		}
		this.setState({searchData:obj});
		this.queryGridData(0);
	},
	queryAllCustomerBorn:function(){//選取用餐編號-取得全部客戶生產資料(已結/未結)list
		jqGet(gb_approot + 'api/GetAction/GetAllBorn',this.state.searchBornData)
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({born_list:data});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});		
	},
	showSelectCustomerBorn:function(){
		this.queryAllCustomerBorn();
		this.setState({isShowCustomerBornSelect:true});
	},
	closeSelectCustomerBorn:function(){
		this.setState({isShowCustomerBornSelect:false});
	},
	selectCustomerBorn:function(customer_id,born_id,meal_id){
		jqGet(gb_approot + 'api/GetAction/GetCustomerAndBorn',{born_id:born_id,customer_id:customer_id})
		.done(function(data, textStatus, jqXHRdata) {
			var fieldData = this.state.fieldData;//選取後變更customer_id,born_id,mealid
			fieldData.customer_id=customer_id;
			fieldData.born_id=born_id;
			fieldData.meal_id=meal_id;

			//客戶編號改變下方帶入的資料要一起變更
			fieldData.customer_type=data.getCustomer.customer_type;
			fieldData.customer_name=data.getCustomer.customer_name;

			fieldData.mom_name=data.getBorn.mom_name;
			fieldData.sno=data.getBorn.sno;
			fieldData.birthday=data.getBorn.birthday;
			fieldData.tel_1=data.getBorn.tel_1;
			fieldData.tel_2=data.getBorn.tel_2;
			fieldData.tw_zip_1=data.getBorn.tw_zip_1;
			fieldData.tw_city_1=data.getBorn.tw_city_1;
			fieldData.tw_country_1=data.getBorn.tw_country_1;
			fieldData.tw_address_1=data.getBorn.tw_address_1;
			fieldData.tw_zip_2=data.getBorn.tw_zip_2;
			fieldData.tw_city_2=data.getBorn.tw_city_2;
			fieldData.tw_country_2=data.getBorn.tw_country_2;
			fieldData.tw_address_2=data.getBorn.tw_address_2;
			fieldData.born_type=data.getBorn.born_type;
			fieldData.born_day=data.getBorn.born_day;

			this.setState({isShowCustomerBornSelect:false,fieldData:fieldData});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			//showAjaxError(errorThrown);
		});	
	},
	changeGDBornValue:function(name,e){
		var obj = this.state.searchBornData;
		obj[name] = e.target.value;
		this.setState({searchBornData:obj});
		this.queryAllCustomerBorn();
	},
	render: function() {
		var outHtml = null;

			var searchData = this.state.searchData;
			var fieldData = this.state.fieldData;
			var searchBornData=this.state.searchBornData;

			var MdoalCustomerBornSelect=ReactBootstrap.Modal;//啟用選取用餐編號的視窗內容
			var born_select_out_html=null;//存放選取用餐編號的視窗內容
			if(this.state.isShowCustomerBornSelect){
				born_select_out_html = 					
					<MdoalCustomerBornSelect bsSize="xsmall"  title="選擇客戶" onRequestHide={this.closeSelectCustomerBorn}>
							<div className="modal-body">
								<div className="table-header">
							        <div className="table-filter">
							            <div className="form-inline">
							                <div className="form-group">
							                    <label for="">客戶名稱/餐編/媽媽姓名</label> { }
							                    <input type="text" className="form-control input-sm"
							      			    value={searchBornData.word}
												onChange={this.changeGDBornValue.bind(this,'word')}
											 	placeholder="請擇一填寫" />
							                </div>
											<label>客戶分類</label> { }
											<select className="form-control input-sm" 
													value={searchBornData.customer_type}
													onChange={this.changeGDBornValue.bind(this,'customer_type')}>
												<option value="">全部</option>
											{
												CommData.CustomerType.map(function(itemData,i) {
													return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
												})
											}
											</select> { }							                
							                <div className="form-group">
							                    <label for="">正在用餐</label> { }
							                    <select className="form-control input-sm"
							                    value={searchBornData.is_meal}
												onChange={this.changeGDBornValue.bind(this,'is_meal')}>
							                        <option value="">全部</option>
							                        <option value="true">是</option>
							                        <option value="false">否</option>
							                    </select>
							                </div>
							                {/*<div className="form-group">
							                    <button className="btn-primary btn-sm"><i className="fa-search"></i> 搜尋</button>
							                </div>*/}
							            </div>
							        </div>
							    </div>
								<table className="table-condensed">
									<tbody>
										<tr>
											<th className="col-xs-1 text-center">選擇</th>
											<th className="col-xs-1">客戶姓名</th>
											<th className="col-xs-1">客戶類別</th>
											<th className="col-xs-1">用餐編號</th>
											<th className="col-xs-1">媽媽姓名</th>										
											<th className="col-xs-1">電話1</th>
											<th className="col-xs-1">備註</th>
											<th className="col-xs-1">預產期</th>
										</tr>
										{
											this.state.born_list.map(function(itemData,i) {
												
												var born_out_html = 
													<tr key={itemData.born_id}>
														<td className="text-center">
															<label className="cbox">
										                        <input type="checkbox" onClick={this.selectCustomerBorn.bind(this,itemData.customer_id,itemData.born_id,itemData.meal_id)} />
										                        <i className="fa-check"></i>
										                    </label>
														</td>
														<td>{itemData.customer_name}</td>
														<td><StateForGrid stateData={CommData.CustomerType} id={itemData.customer_type} /></td>
														<td>{itemData.meal_id}</td>
														<td>{itemData.mom_name}</td>
														<td>{itemData.tel_1}</td>
														<td>{itemData.memo}</td>
														<td>{moment(itemData.expected_born_day).format('YYYY/MM/DD')}</td>			
													</tr>;
												return born_out_html;
											}.bind(this))
										}
									</tbody>
								</table>
							</div>
							<div className="modal-footer">
								<button onClick={this.closeSelectCustomerBorn}><i className="fa-times"></i> { } 關閉</button>
							</div>
					</MdoalCustomerBornSelect>;
			}

			var save_out_html=null;
			var detail_out_html=null;
			if(this.state.edit_type==1){
				save_out_html=<button className="btn-primary col-xs-offset-6" type="submit" form="main-form"><i className="fa-check"></i> 存檔主檔</button>;
			}else if(this.state.edit_type==2){
				save_out_html=<strong className="col-xs-offset-6">主檔資料不可修改！</strong>;
				detail_out_html=
				<SubForm ref="SubForm" 
				main_id={fieldData.schedule_detail_id}
				tel_reason={fieldData.tel_reason} />;
			}

			outHtml =
			(
			<div>
				<h3 className="title">首頁</h3>
			    <ul className="nav nav-tabs" role="tablist">
			        <li role="presentation" className="active">
			            <a href="#tel" aria-controls="home" role="tab" data-toggle="tab" id="tabAddNew">
			            	<i className="fa-phone"></i> 電訪名單
			            </a>
			        </li>
			        <li role="presentation">
			            <a href="#search" aria-controls="profile" role="tab" data-toggle="tab" id="tabAddView">
			                <i className="glyphicon glyphicon-user"></i> 搜尋客戶
			            </a>
			        </li>
			    </ul>					

				<div className="tab-content">
				{/*頁籤1*/}
					<div role="tabpanel" className="tab-pane active" id="tel">

						<div className="row">
							{/*---左半邊start---*/}
							<div className="col-xs-6">
					            <form className="form-horizontal" onSubmit={this.handleSearch} id="search-form">
									<div className="table-header">
										<div className="table-filter">
											<div className="form-inline">
												<div className="form-group">
													<label for="">電訪日期</label>
													<span className="has-feedback">
														<InputDate id="start_date" ver={2}
														onChange={this.setSearchVal} 
														field_name="start_date" 
														value={searchData.start_date} />
													</span> { }												
										            <label for="">電訪原因</label>
										            <select className="form-control input-sm"
										            value={searchData.tel_reason}
													onChange={this.setSearchVal.bind(this,'tel_reason')}>
										                <option value="">全部</option>
									                {
														CommData.TelReasonByDetail.map(function(itemData,i) {
														return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
														})
													}
										            </select> { }
								                </div>					                
											</div>
										</div>
									</div>					            
					                <table className="table-condensed">
					                	<tbody>
											<tr>
												<th className="col-xs-1 text-center">刪除</th>
												<th className="col-xs-1 text-center">修改</th>
												<th className="col-xs-1 text-center">電訪日期</th>
								                <th className="col-xs-1">用餐編號</th>
								                <th className="col-xs-1">媽媽姓名</th>
								                <th className="col-xs-1">電話1</th>
								                <th className="col-xs-1">電話2</th>
								                <th className="col-xs-1 text-center">電訪原因</th>
											</tr>
											{
											this.state.gridData.rows.map(function(itemData,i) {
												return <GridRow 
												key={i}
												ikey={i}
												primKey={itemData.schedule_detail_id} 
												itemData={itemData} 
												delCheck={this.delCheck}
												updateType={this.updateType}/>;
												}.bind(this))
											}
										</tbody>
					                </table>
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
									ver={2}
									/>					                
					            </form>
					        </div>							
							{/*---左半邊end---*/}
							{/*---右半邊start---*/}
							<div className="col-xs-6">
					        	{born_select_out_html}
					        	{/* 電訪主檔*/}
								<div className="item-box">
									<div className="item-title">
										<h5>電訪名單 主檔</h5>
									</div>
									<form className="form-horizontal" role="form" id="main-form" onSubmit={this.handleSubmit}>
									<div className="panel-body">
										<div className="form-group">
											<label className="col-xs-2 control-label">選擇客戶</label>
											<div className="col-xs-3">
												<div className="input-group">
													<input type="text" 							
													className="form-control"	
													value={fieldData.customer_name}
													onChange={this.changeFDValue.bind(this,'customer_name')}
													maxLength="64"
													disabled />
													<span className="input-group-btn">
														<a className="btn"
														onClick={this.showSelectCustomerBorn}
														disabled={this.state.edit_type==2} ><i className="fa-plus"></i></a>
													</span>
												</div>
											</div>
											<small className="help-inline col-xs-6"><span className="text-danger">(必填)</span> 請按 <i className="fa-plus"></i> 選取</small>
										</div>
										<div className="form-group">
											<label className="col-xs-2 control-label">電訪日期</label>
											<div className="col-xs-3">
									            <span className="has-feedback">
													<InputDate id="tel_day" 
													onChange={this.changeFDValue} 
													field_name="tel_day" 
													value={fieldData.tel_day}
													required={true}
													disabled={true} />
												</span>
											</div>
											<small className="help-inline col-xs-6">系統自動產生，無法修改</small>
										</div>
										<div className="form-group">
											<label className="col-xs-2 control-label">電訪原因</label>
											<div className="col-xs-3">
								                <select className="form-control"
								                value={fieldData.tel_reason}
								                onChange={this.changeFDValue.bind(this,'tel_reason')}
								                disabled={this.state.edit_type==2}>
										            {
														CommData.TelReasonByDetail.map(function(itemData,i) {
														return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
														})
													}
								                </select>
											</div>
											<small className="text-danger col-xs-6">(必填)</small>
										</div>
									</div>								
									</form>
								
									<hr className="condensed" />
								{/*電訪明細檔*/}
									{detail_out_html}
								{/*電訪明細檔*/}

									<div className="panel-footer">
										{save_out_html} { }
										<button type="button" onClick={this.insertType}><i className="fa-times"></i> 取消</button>
									</div>
								</div>
								{/* 電訪主檔*/}
					        </div>						    					        
					        {/*---右半邊end---*/}
				        </div>						
			        </div>
				{/*頁籤1*/}
				{/*頁籤2*/}
					<div role="tabpanel" className="tab-pane" id="search">
						{/*<SubSearchCustomer />*/}
					</div>
				{/*頁籤2*/}
			    </div>		

			</div>
			);

		return outHtml;
	}
});

//明細檔編輯
var SubForm = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return {
			gridSubData:[],
			fieldSubData:{},
			edit_sub_type:0,//預設皆為新增狀態
			checkAll:false
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldSubData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/DeatilTelRecord'
		};
	},
	componentDidMount:function(){
		this.queryGridData();
		this.insertSubType();//一開始載入預設為新增狀態
	},
	shouldComponentUpdate:function(nextProps,nextState){
		return true;
	},
	detailHandleSubmit: function(e) {
		e.preventDefault();
		this.state.fieldSubData.schedule_detail_id=this.props.main_id;
		if(this.state.edit_sub_type==1){
			jqPost(this.props.apiPathName,this.state.fieldSubData)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					if(data.message!=null){
						tosMessage(null,'新增完成'+data.message,1);
					}else{
						tosMessage(null,'新增完成',1);
					}
					//儲存後更新下分list
					this.queryGridData();
					this.insertSubType();
				}else{
					tosMessage(null,data.message,3);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
		}		
		else if(this.state.edit_sub_type==2){
			jqPut(this.props.apiPathName,this.state.fieldSubData)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					if(data.message!=null){
						tosMessage(null,'修改完成'+data.message,1);
					}else{
						tosMessage(null,'修改完成',1);
					}
					//儲存後更新下分list
					this.queryGridData();
					this.insertSubType();
				}else{
					tosMessage(null,data.message,3);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
		};
		return;
	},
	detailDeleteSubmit:function(id,e){

		if(!confirm('確定是否刪除?')){
			return;
		}
		jqDelete(this.props.apiPathName + '?ids=' +id ,{})			
		.done(function(data, textStatus, jqXHRdata) {
			if(data.result){
				tosMessage(null,'刪除完成',1);
				this.queryGridData();
				this.insertSubType();
			}else{
				tosMessage(null,data.message,3);
			}
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	gridData:function(){
		var parms = {
			main_id:this.props.main_id
		};
		$.extend(parms, this.state.searchData);

		return jqGet(this.props.apiPathName,parms);
	},
	queryGridData:function(){
		this.gridData()
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({gridSubData:data});
		}.bind(this))
		.fail(function(jqXHR, textStatus, errorThrown) {
			showAjaxError(errorThrown);
		});
	},
	insertSubType:function(){
		$('textarea').val("");
		this.setState({edit_sub_type:1,fieldSubData:{
			schedule_detail_id:this.props.main_id,
			tel_state:1
		}});
	},
	updateSubType:function(id,e){
		jqGet(this.props.apiPathName,{id:id})
		.done(function(data, textStatus, jqXHRdata) {
			data.data.tel_datetime=moment(data.data.tel_datetime).format('YYYY/MM/DD hh:mm:ss');
			this.setState({edit_sub_type:2,fieldSubData:data.data});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	changeFDValue:function(name,e){
		this.setInputValue(this.props.fdName,name,e);
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
		this.setState({fieldSubData:obj});
	},
	render: function() {
		var outHtml = null;
		var fieldSubData = this.state.fieldSubData;//明細檔資料

			outHtml =
			(
				<div>
			{/*---產品明細編輯start---*/}
					<div className="row">
						<div className="col-xs-10 col-xs-offset-1">
							<div className="item-box">
								<div className="item-title">
									<h5>新增電訪紀錄</h5>
								</div>
								<form className="form-horizontal" role="form" id="form2" onSubmit={this.detailHandleSubmit}>
								<div className="panel-body">
										<div className="form-group">
											<label className="col-xs-2 control-label">電訪時間</label>
											<div className="col-xs-4">
												<input type="datetime" 							
												className="form-control"	
												value={fieldSubData.tel_datetime}
												onChange={this.changeFDValue.bind(this,'tel_datetime')}
												maxLength="30"
												required disabled　/>
											</div>
											<small className="help-inline col-xs-6">系統自動產生，無法修改</small>
										</div>
										<div className="form-group">
											<label className="col-xs-2 control-label">電訪狀態</label>
											<div className="col-xs-4">
												<select className="form-control" 
												value={fieldSubData.tel_state}
												onChange={this.changeFDValue.bind(this,'tel_state')}>
												{
													CommData.TelState.map(function(itemData,i) {
														return <option  key={itemData.id} value={itemData.id}>{itemData.label}</option>;
													})
												}
												</select>
											</div>
											<small className="help-inline text-danger col-xs-6">(必填)</small>
										</div>
										<div className="form-group">
											<label className="col-xs-2 control-label">電訪內容(備註)</label>
											<div className="col-xs-8">
												<textarea col="30" rows="5" className="form-control"
												value={fieldSubData.memo}
												onChange={this.changeFDValue.bind(this,'memo')}
												maxLength="256"></textarea>
											</div>
										</div>
								</div>								
								</form>
								<div className="panel-footer">
									<button className="btn-primary col-xs-offset-9"
									type="submit" form="form2">
										<i className="fa-check"></i> 存檔確認
									</button>
								</div>
							</div>
						</div>
					</div>			
				{/*---產品明細編輯end---*/}

					<hr className="condensed" />

				{/*---產谝明細列表start---*/}
					<h4 className="title">電訪紀錄</h4>
					<div className="row">
						<div className="col-xs-12">
							<table className="table-condensed">
								<tbody>
									<tr>
										{/*<th className="col-xs-1 text-center">編輯</th>*/}
										<th className="col-xs-3 text-center">時間</th>
										<th className="col-xs-2 text-center">原因</th>
										<th className="col-xs-4">內容</th>
										<th className="col-xs-1 text-center">狀態</th>
										<th className="col-xs-2">人員</th>
									</tr>
									{
										this.state.gridSubData.map(function(itemData,i) {
											var sub_out_html = 
												<tr key={itemData.deatil_tel_record_id}>
													{/*<td className="text-center">
														<button className="btn-link" type="button" onClick={this.updateSubType.bind(this,itemData.deatil_tel_record_id)}><i className="fa-pencil"></i></button>
														<button className="btn-link text-danger" onClick={this.detailDeleteSubmit.bind(this,itemData.deatil_tel_record_id)}><i className="fa-trash"></i></button>
													</td>*/}
													<td className="text-center"><strong>{moment(itemData.tel_datetime).format('YYYY/MM/DD hh:mm:ss')}</strong></td>
													<td className="text-center"><StateForGrid stateData={CommData.TelReasonByDetail} id={this.props.tel_reason} /></td>
													<td>{itemData.memo}</td>
													<td className="text-center"><StateForGrid stateData={CommData.TelState} id={itemData.tel_state} /></td>
													<td>{itemData.user_name}</td>			
												</tr>;
												return sub_out_html;
										}.bind(this))
									}
								</tbody>
							</table>
						</div>
					</div>
				{/*---產品明細列表end---*/}
				</div>
			);

		return outHtml;
	}
});

//頁籤2搜尋功能
var SubSearchCustomer = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return {
			searchData:{},
			gridSearchData:[],
			edit_sub_type:0,//預設皆為新增狀態
			checkAll:false
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldSubData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/GetAction/DeatilTelRecord'
		};
	},
	componentDidMount:function(){
	},
	shouldComponentUpdate:function(nextProps,nextState){
		return true;
	},
	gridData:function(){
		var parms = {
			main_id:this.props.main_id
		};
		$.extend(parms, this.state.searchData);

		return jqGet(this.props.apiPathName,parms);
	},
	queryGridData:function(){
		this.gridData()
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({gridSearchData:data});
		}.bind(this))
		.fail(function(jqXHR, textStatus, errorThrown) {
			showAjaxError(errorThrown);
		});
	},
	changeGDValue:function(name,e){
		this.setInputValue(this.props.gdName,name,e);
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
		this.setState({searchData:obj});
	},
	render: function() {
		var outHtml = null;
		var searchData = this.state.searchData;//明細檔資料

			outHtml =
			(
				<div className="row">
			{/*---客戶搜尋start---*/}
					<div className="col-xs-12">
						<div className="col-xs-6 col-xs-offset-3">
							<div className="form-group">
			                    <label for="">搜尋客戶</label> { }
					            <input type="text" className="form-control input-sm"
					      		value={searchData.word}
								onChange={this.changeGDValue.bind(this,'word')}
							 	placeholder="請擇一填寫" />
				            </div>
						</div>
						<div className="col-xs-10 col-xs-offset-1">
							<table className="table-condensed">
									<tbody>
										<tr>
											<th className="col-xs-2">A01客戶基本資料</th>
											<th className="col-xs-2">B02產品基本資料</th>
											<th className="col-xs-2">C02客戶需求</th>
											<th className="col-xs-2">D01客戶用餐紀錄</th>
											<th className="col-xs-2">G02電訪名單</th>
											<th className="col-xs-2">F01應收帳款</th>
										</tr>
									</tbody>
								</table>
						</div>
					</div>
			{/*---客戶搜尋end---*/}
				</div>
			);

		return outHtml;
	}
});

