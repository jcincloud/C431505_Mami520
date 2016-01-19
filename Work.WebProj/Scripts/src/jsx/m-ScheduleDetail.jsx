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
			fieldData:{},
			searchData:{title:null,start_date:moment(Date()).format('YYYY/MM/DD'),end_date:moment(Date()).format('YYYY/MM/DD')},
			searchBornData:{word:null,is_close:null},
			edit_type:0,
			checkAll:false,
			isShowCustomerBornSelect:false,
			born_list:[]
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
		for(var i in this.state.gridData.rows){
			if(this.state.gridData.rows[i].check_del){
				ids.push('ids='+this.state.gridData.rows[i].schedule_detail_id);
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
		this.setState({edit_type:1,fieldData:{tel_reason:1,is_detailInsert:true}});
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
	onSelectChange:function(name,e){
		var obj = this.state.searchData;
		obj[name] = e.target.value;
		this.setState({searchData:obj});
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

		if(this.state.edit_type==0)
		{
			var searchData = this.state.searchData;

			outHtml =
			(
			<div>
				<h3 className="title">{this.props.Caption} 列表</h3>

				<form onSubmit={this.handleSearch}>
					
						<div className="table-header">
							<div className="table-filter">
								<div className="form-inline">
									<div className="form-group">
										<label>用餐編號/媽媽姓名/電話</label> { }
										<input type="text" className="form-control input-sm" 
										value={searchData.word}
										onChange={this.changeGDValue.bind(this,'word')}
										placeholder="請擇一填寫..." /> { }

							            <label for="">電訪原因</label>
							            <select className="form-control input-sm"
							            value={searchData.tel_reason}
										onChange={this.changeGDValue.bind(this,'tel_reason')}>
							                <option value="">全部</option>
						                {
											CommData.TelReasonByDetail.map(function(itemData,i) {
											return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
											})
										}
							            </select>
							            <br />
					                    <label for="">預計電訪日期</label>
										<span className="has-feedback">
											<InputDate id="start_date" ver={2}
											onChange={this.changeGDValue} 
											field_name="start_date" 
											value={searchData.start_date} />
										</span> { }
										<label>~</label> { }
										<span className="has-feedback">
											<InputDate id="end_date" ver={2}
											onChange={this.changeGDValue} 
											field_name="end_date" 
											value={searchData.end_date} />
										</span> { }
										<button className="btn-primary btn-sm" type="submit"><i className="fa-search"></i>{ }搜尋</button>
					                </div>					                
								</div>
							</div>
						</div>
						<table className="table-condensed">
							<thead>
								<tr>
									<th className="col-xs-1 text-center">
										<label className="cbox">
											<input type="checkbox" checked={this.state.checkAll} onChange={this.checkAll} />
											<i className="fa-check"></i>
										</label>
									</th>
									<th className="col-xs-1 text-center">修改</th>
									<th className="col-xs-1 text-center">電訪日期</th>
					                <th className="col-xs-1">用餐編號</th>
					                <th className="col-xs-1">媽媽姓名</th>
					                <th className="col-xs-1">電話1</th>
					                <th className="col-xs-1">電話2</th>
					                <th className="col-xs-1 text-center">電訪原因</th>
								</tr>
							</thead>
							<tbody>
								{
								this.state.gridData.rows.map(function(itemData,i) {
								return <GridRow 
								key={i}
								ikey={i}
								primKey={itemData.schedule_detail_id} 
								itemData={itemData} 
								delCheck={this.delCheck}
								updateType={this.updateType}								
								/>;
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
					/>
				</form>
			</div>
			);
		}
		else if(this.state.edit_type==1 || this.state.edit_type==2)
		{
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
							                    <label for="">客戶名稱/餐編/媽媽姓名</label>
							                    <input type="text" className="form-control input-sm"
							      			    value={searchBornData.word}
												onChange={this.changeGDBornValue.bind(this,'word')}
											 	placeholder="請擇一填寫" />
							                </div>
							                <div className="form-group">
							                    <label for="">是否結案</label>
							                    <select className="form-control input-sm"
							                    value={searchBornData.is_close}
												onChange={this.changeGDBornValue.bind(this,'is_close')}>
							                        <option value="">全部</option>
							                        <option value="true">已結案</option>
							                        <option value="false">未結案</option>
							                    </select>
							                </div>
							                <div className="form-group">
							                    <button className="btn-primary btn-sm"><i className="fa-search"></i> 搜尋</button>
							                </div>
							            </div>
							        </div>
							    </div>
								<table className="table-condensed">
									<tbody>
										<tr>
											<th className="col-xs-1 text-center">選擇</th>
											<th className="col-xs-1">客戶姓名</th>
											<th className="col-xs-1">用餐編號</th>
											<th className="col-xs-1">媽媽姓名</th>
											<th className="col-xs-1">第幾胎</th>
											<th className="col-xs-1">是否結案</th>
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
														<td>{itemData.meal_id}</td>
														<td>{itemData.mom_name}</td>
														<td>{itemData.born_frequency}</td>
														<td>{itemData.is_close? <span className="label label-primary">結案</span>:<span className="label label-danger">未結案</span>}</td>			
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
				save_out_html=<button type="submit" className="btn-primary"><i className="fa-check"></i> 儲存</button>;
			}else{
				save_out_html=<strong>主檔資料不可修改！</strong>;
				detail_out_html=
				<SubForm ref="SubForm" 
				main_id={fieldData.schedule_detail_id}
				tel_reason={fieldData.tel_reason} />;
			}

			outHtml=(
			<div>
				{born_select_out_html}
				<h3 className="title">{this.props.Caption} 主檔</h3>

				<form className="form-horizontal clearfix" onSubmit={this.handleSubmit}>
					<div className="col-xs-9">
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
						<div className="form-group">
							<label className="col-xs-2 control-label">客戶類別</label>
							<div className="col-xs-3">
								<select className="form-control" 
								value={fieldData.customer_type}
								disabled
								onChange={this.changeFDValue.bind(this,'customer_type')}>
								{
									CommData.CustomerType.map(function(itemData,i) {
										return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
									})
								}
								</select>
							</div>
							<label className="col-xs-2 control-label">客戶名稱</label>
							<div className="col-xs-3">
								<input type="text" 							
								className="form-control"	
								value={fieldData.customer_name}
								onChange={this.changeFDValue.bind(this,'customer_name')}
								maxLength="64"
								required 
								disabled />
							</div>				
						</div>
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
						<div className="form-group">
							<label className="col-xs-2 control-label">生產方式</label>
							<div className="col-xs-3">
								<select className="form-control" 
								value={fieldData.born_type}
								onChange={this.changeFDValue.bind(this,'born_type')}
								disabled>
								{
									CommData.BornType.map(function(itemData,i) {
									return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
									})
								}
								</select>
							</div>
							<label className="col-xs-2 control-label">生產日期</label>
							<div className="col-xs-3">
								<span className="has-feedback">
									<InputDate id="born_day" 
									onChange={this.changeFDValue} 
									field_name="born_day" 
									value={fieldData.born_day}
									required={true}
									disabled={true} />
								</span>
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
					<div className="form-action text-right">
			            {save_out_html} { }
			            <button type="button" onClick={this.noneType}><i className="fa-times"></i> 回前頁</button>
			        </div>

					</div>
				</form>

				<hr className="condensed" />

				
				{/*---產品明細---*/}
				{detail_out_html}


			</div>
			);
		}else{
			outHtml=(<span>No Page</span>);
		}

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
					<h4 className="title">新增電訪明細</h4>
					<div className="row">
						<div className="col-xs-9">
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
						<div className="col-xs-9">
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