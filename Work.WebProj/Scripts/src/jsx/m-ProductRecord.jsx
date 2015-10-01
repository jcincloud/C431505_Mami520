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
					<td>{this.props.itemData.record_sn}</td>
					<td>{moment(this.props.itemData.record_day).format('YYYY/MM/DD')}</td>
					<td>{this.props.itemData.meal_id}</td>
					<td>{this.props.itemData.name}</td>
					<td>{this.props.itemData.is_receipt?<span className="label label-primary">已轉單</span>:<span className="label label-danger">未轉單</span>}</td>			
					<td>{this.props.itemData.is_close?<span className="label label-primary">結案</span>:<span className="label label-danger">未結案</span>}</td>			
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
			apiPathName:gb_approot+'api/ProductRecord'
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
			tosMessage(gb_title_from_invalid,'未選擇客戶無法新增產品銷售資料!!',3);
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
				ids.push('ids='+this.state.gridData.rows[i].product_record_id);
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

			fieldData.name=data.getBorn.mom_name;
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

			this.setState({isShowCustomerBornSelect:false,fieldData:fieldData});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			//showAjaxError(errorThrown);
		});	
	},
	closeRecord:function(){
		if(!confirm('確定是否結案?')){
			return;
		}
		jqPost(gb_approot + 'api/GetAction/closeRecord',{main_id:this.state.fieldData.product_record_id})
		.done(function(data, textStatus, jqXHRdata) {
			var fieldData = this.state.fieldData;
			fieldData.is_close=data.result;
			this.setState({fieldData:fieldData});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
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
				<h3 className="title">{this.props.Caption}</h3>
				<h4 className="title">{this.props.Caption} 列表</h4>
				<form onSubmit={this.handleSearch}>
					<div className="table-responsive">
						<div className="table-header">
							<div className="table-filter">
								<div className="form-inline">
									<div className="form-group">
										<label>訂單日期</label> { }										
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

										<label>媽媽姓名</label> { }
										<input type="text" className="form-control input-sm" 
										value={searchData.name}
										onChange={this.changeGDValue.bind(this,'name')}
										placeholder="媽媽姓名..." /> { }

										<label>用餐編號</label> { }
										<input type="text" className="form-control input-sm" 
										value={searchData.meal_id}
										onChange={this.changeGDValue.bind(this,'meal_id')}
										placeholder="用餐編號..." /> { }

										<label>是否轉單</label> { }
										<select className="form-control input-sm" 
												value={searchData.is_receipt}
												onChange={this.onSelectChange.bind(this,'is_receipt')}>
											<option value="">是否轉單</option>
											<option value="true">已轉單</option>
											<option value="false">未轉單</option>
										</select> { }

										<label>是否結案</label> { }
										<select className="form-control input-sm" 
												value={searchData.is_close}
												onChange={this.onSelectChange.bind(this,'is_close')}>
											<option value="">是否結案</option>
											<option value="true">結案</option>
											<option value="false">未結案</option>
										</select> { }

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
									<th className="col-xs-2">銷售單號</th>
									<th className="col-xs-2">訂購時間</th>
									<th className="col-xs-2">用餐編號</th>
									<th className="col-xs-2">媽媽姓名</th>
									<th className="col-xs-1">是否轉單</th>
									<th className="col-xs-1">是否結案</th>
								</tr>
							</thead>
							<tbody>
								{
								this.state.gridData.rows.map(function(itemData,i) {
								return <GridRow 
								key={i}
								ikey={i}
								primKey={itemData.product_record_id} 
								itemData={itemData} 
								delCheck={this.delCheck}
								updateType={this.updateType}								
								/>;
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
							                    <label for="">客戶名稱/餐編/媽媽姓名</label> { }
							                    <input type="text" className="form-control input-sm"
							      			    value={searchBornData.word}
												onChange={this.changeGDBornValue.bind(this,'word')}
											 	placeholder="請擇一填寫" />
							                </div>
							                <div className="form-group">
							                    <label for="">是否結案</label> { }
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
			var close_out_html=null;
			var detail_out_html=null;
			if(this.state.edit_type==1){
				save_out_html=<button type="submit" className="btn-primary"><i className="fa-check"></i> 儲存</button>;
			}else{
				save_out_html=<strong>主檔資料不可修改！</strong>;
				detail_out_html=
				<SubForm ref="SubForm" 
				main_id={fieldData.product_record_id}
				customer_id={fieldData.customer_id}
				born_id={fieldData.born_id} />;
				if(!fieldData.is_close){
					close_out_html=<button className="btn-success" type="button" onClick={this.closeRecord}><i className="fa-check"></i> 設為 已結案</button>;
				}
			}

			outHtml=(
			<div>
				{born_select_out_html}
				<h3 className="title">{this.props.Caption}</h3>
				<h4 className="title">{this.props.Caption} 主檔</h4>
				<form className="form-horizontal clearfix" onSubmit={this.handleSubmit}>
					<div className="col-xs-9">
						<div className="form-group">
							<label className="col-xs-2 control-label">銷售單號</label>
							<div className="col-xs-3">
								<input type="text" 							
								className="form-control"	
								value={fieldData.record_sn}
								onChange={this.changeFDValue.bind(this,'record_sn')}
								maxLength="64"
								disabled
								placeholder="系統自動產生" />
							</div>
							<small className="help-inline col-xs-6">系統自動產生，無法修改</small>
						</div>
						<div className="form-group">
							<label className="col-xs-2 control-label">訂單日期</label>
							<div className="col-xs-3">
								<span className="has-feedback">
									<InputDate id="record_day" 
									onChange={this.changeFDValue} 
									field_name="record_day" 
									value={fieldData.record_day}
									disabled={true}
									placeholder="系統自動產生" />
								</span>
							</div>
							<small className="help-inline col-xs-6">系統自動產生，無法修改</small>
						</div>
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
								value={fieldData.name}
								onChange={this.changeFDValue.bind(this,'name')}
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
						<div className="form-action text-right">
							{save_out_html} { }
							<button type="button" onClick={this.noneType}><i className="fa-times"></i> 回前頁</button>
						</div>
					</div>
				</form>
				<hr className="condensed" />
				{/* ---是否結案按鈕start--- */}
				<h4 className="title">
					是否結案：{fieldData.is_close?<strong className="text-success">已結案</strong>:<strong className="text-danger">未結案</strong>} { }
					{/*<button className="btn-danger"><i className="fa-times"></i> 設為 未結案</button>*/}
					{close_out_html}
				</h4>
				{/* ---是否結案按鈕end--- */}
				
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
			searchProductData:{name:null,product_type:null},
			edit_sub_type:0,//預設皆為新增狀態
			checkAll:false,
			isShowProductSelect:false,//控制選取產品視窗顯示
			product_list:[],
			parm:{breakfast:0,lunch:0,dinner:0}//計算用		

		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldSubData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/RecordDetail',
			initPathName:gb_approot+'Active/Product/aj_Init'
		};
	},
	componentDidMount:function(){
		this.queryGridData();
		this.insertSubType();//一開始載入預設為新增狀態
		this.getAjaxInitData();//載入init資料
	},
	shouldComponentUpdate:function(nextProps,nextState){
		return true;
	},
	getAjaxInitData:function(){
		jqGet(this.props.initPathName)
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({parm:{breakfast:data.breakfast,lunch:data.lunch,dinner:data.dinner}});
			//載入用餐點數計算
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	detailHandleSubmit: function(e) {

		e.preventDefault();

		if(this.state.fieldSubData.product_id==null || this.state.fieldSubData.product_id==undefined){
			tosMessage(gb_title_from_invalid,'未選擇產品!!',3);
			return;
		}

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
			product_record_id:this.props.main_id,
			customer_id:this.props.customer_id,
			born_id:this.props.born_id,
			qty:1,
			subtotal:0
		}});
	},
	updateSubType:function(id,e){
		jqGet(this.props.apiPathName,{id:id})
		.done(function(data, textStatus, jqXHRdata) {
			//計算天數
			var diff_mealday=DiffDate(data.data.meal_start,data.data.meal_end);
			data.data.diff_day=diff_mealday.diff_day;
			//計算點數
			data.data.estimate_count=MealCount(this.state.parm,data.data.estimate_breakfast,data.data.estimate_lunch,data.data.estimate_dinner);
			data.data.real_count=MealCount(this.state.parm,data.data.real_breakfast,data.data.real_lunch,data.data.real_dinner);
			
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
	changeGDProductValue:function(name,e){
		var obj = this.state.searchProductData;
		obj[name] = e.target.value;
		this.setState({searchProductData:obj});
		this.queryAllProduct();
	},
	changeMealday:function(name,e){//計算日期天數
		var obj = this.state.fieldSubData;
		obj[name] = e.target.value;//先變更修改後的日期在計算

		var diff_mealday=DiffDate(obj.meal_start,obj.meal_end);
		obj.diff_day=diff_mealday.diff_day;
		if(diff_mealday.result==-1){
			tosMessage(gb_title_from_invalid,'預計送餐起日不可大於預計送餐迄日!!',3);
		}

		this.setState({fieldSubData:obj});
	},
	changePriceCount:function(name,e){
		var obj = this.state.fieldSubData;
		obj[name] = e.target.value;
		obj.subtotal=obj.qty*obj.price;
		this.setState({fieldSubData:obj});
	},
	changeMealCount:function(name,e){
		var obj = this.state.fieldSubData;
		obj[name] = e.target.value;

		obj.estimate_count=MealCount(this.state.parm,obj.estimate_breakfast,obj.estimate_lunch,obj.estimate_dinner);

		this.setState({fieldSubData:obj});
	},
	queryAllProduct:function(){//選取產品編號-
		jqGet(gb_approot + 'api/GetAction/GetAllProduct',this.state.searchProductData)
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({product_list:data});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});		
	},
	showSelectProduct:function(){
		this.queryAllProduct();
		this.setState({isShowProductSelect:true});
	},
	closeSelectProduct:function(){
		this.setState({isShowProductSelect:false});
	},
	selectProduct:function(product_id,e){
		var fSD = this.state.fieldSubData;
		this.state.product_list.forEach(function(obj,i){
			if(obj.product_id==product_id){
				fSD.product_id=product_id;
				fSD.product_type=obj.product_type;
				fSD.product_name=obj.product_name;
				fSD.price=obj.price;
				fSD.standard=obj.standard;
				fSD.is_modify=obj.is_modify;
				fSD.subtotal=fSD.qty*obj.price;
			}
		});
		this.setState({isShowProductSelect:false,fieldSubData:fSD});
	},
	render: function() {
		var outHtml = null;
		var fieldSubData = this.state.fieldSubData;//明細檔資料
		var searchProductData=this.state.searchProductData;//

		var ModalProductSelect=ReactBootstrap.Modal;//啟用產品選取的視窗內容
		var product_select_out_html=null;
		if(this.state.isShowProductSelect){
			product_select_out_html=
			<ModalProductSelect bsSize="medium" title="選擇產品" onRequestHide={this.closeSelectProduct}>
						<div className="modal-body">
						<div className="alert alert-warning">
							<p>1.一筆生產紀錄只能對應一筆試吃</p>
							<p>2.一筆生產紀錄只能對應一筆月子餐</p>
						</div>
							<div className="table-header">
			                    <div className="table-filter">
			                        <div className="form-inline">
			                            <div className="form-group">
			                                <label for="">產品名稱</label> { }
			                                <input type="text" className="form-control input-sm"
			                            	value={searchProductData.name}
											onChange={this.changeGDProductValue.bind(this,'name')} />
			                            </div>
			                            <div className="form-group">
			                                <label for="">產品分類</label> { }
			                                <select className="form-control input-sm"
			                                	value={searchProductData.product_type}
												onChange={this.changeGDProductValue.bind(this,'product_type')}>
			                                    <option value="">全部</option>
												{
													CommData.ProductType.map(function(itemData,i) {
														return <option  key={itemData.id} value={itemData.id}>{itemData.label}</option>;
													})
												}
			                                </select>
			                            </div>
			                            <div className="form-group">
			                                <button className="btn-primary btn-sm" onClick={this.queryAllProduct}><i className="fa-search"></i> 搜尋</button>
			                            </div>
			                        </div>
			                    </div>
			                </div>
			                <table className="table-condensed">
			                <tbody>
				                    <tr>
				                        <th className="col-xs-1 text-center">選擇</th>
				                        <th className="col-xs-3">產品名稱</th>
				                        <th className="col-xs-3">產品分類</th>
				                        <th className="col-xs-2">售價</th>
				                    </tr>
				                    {
										this.state.product_list.map(function(itemData,i) {
											
											var product_out_html = 
												<tr key={itemData.product_id}>
													<td className="text-center">
														<label className="cbox">
				                                			<input type="checkbox" onClick={this.selectProduct.bind(this,itemData.product_id)} />
				                                			<i className="fa-check"></i>
				                            			</label>
				                            		</td>
													<td>{itemData.product_name}</td>
													<td><StateForGrid stateData={CommData.ProductType} id={itemData.product_type} /></td>
													<td>{itemData.price}</td>
												</tr>;
											return product_out_html;
										}.bind(this))
									}
			                    </tbody>                   
			                </table>
						</div>
						<div className="modal-footer">
			                <button type="button" onClick={this.closeSelectProduct}><i className="fa-times"></i> 關閉</button>
			            </div>
				</ModalProductSelect>;
		}



			outHtml =
			(
				<div>
					{product_select_out_html}
			{/*---產品明細編輯start---*/}
					<h4 className="title">新增產品明細</h4>
					<div className="row">
						<div className="col-xs-9">
							<div className="item-box">
								<div className="item-title">
									<h5>產品明細基本資料</h5>
								</div>
								<form className="form-horizontal" role="form" id="form2" onSubmit={this.detailHandleSubmit}>
								<div className="panel-body">
										<div className="form-group">
											<label className="col-xs-2 control-label">銷售日期</label>
											<div className="col-xs-4">
												<span className="has-feedback">
													<InputDate id="sell_day" 
													onChange={this.changeFDValue} 
													field_name="sell_day" 
													value={fieldSubData.sell_day}
													disabled={true}
													placeholder="系統自動產生" />
												</span>
											</div>
											<small className="help-inline col-xs-6">系統自動產生，無法修改</small>
										</div>
										<div className="form-group">
											<label className="col-xs-2 control-label">選擇產品</label>
											<div className="col-xs-4">
												<div className="input-group">
													<input type="text" 							
													className="form-control"	
													value={fieldSubData.product_name}
													onChange={this.changeFDValue.bind(this,'product_name')}
													maxLength="64"
													required disabled　/>
													<span className="input-group-btn">
														<a className="btn" onClick={this.showSelectProduct}
														disabled={this.state.edit_sub_type==2} ><i className="fa-plus"></i></a>
													</span>
												</div>
											</div>
											<small className="help-inline col-xs-6"><span className="text-danger">(必填)</span> 請按 <i className="fa-plus"></i> 選取</small>
										</div>
										<div className="form-group">
											<label className="col-xs-2 control-label">產品分類</label>
											<div className="col-xs-4">
												<select className="form-control" 
												value={fieldSubData.product_type}
												onChange={this.changeFDValue.bind(this,'product_type')}
												disabled>
												{
													CommData.ProductType.map(function(itemData,i) {
														return <option  key={itemData.id} value={itemData.id}>{itemData.label}</option>;
													})
												}
												</select>
											</div>
										</div>
										<div className="form-group">
											<label className="col-xs-2 control-label">規格</label>
											<div className="col-xs-4">
												<input type="text" 							
												className="form-control"	
												value={fieldSubData.standard}
												onChange={this.changeFDValue.bind(this,'standard')}
												maxLength="64"
												required disabled　/>
											</div>
										</div>
										<div className="form-group">
											<label className="col-xs-2 control-label">售價</label>
											<div className="col-xs-2">
												<input type="number" 
												className="form-control"	
												value={fieldSubData.price}
												disabled={!fieldSubData.is_modify}
												onChange={this.changePriceCount.bind(this,'price')} />
											</div>
											<label className="col-xs-1 control-label">數量</label>
											<div className="col-xs-1">
												<input type="number" 							
												className="form-control"	
												value={fieldSubData.qty}
												onChange={this.changePriceCount.bind(this,'qty')}
												min="1"
												required/>
											</div>
											<small className="help-inline col-xs-2 text-danger">(必填)</small>
										</div>
										<div className="form-group">
											<label className="col-xs-2 control-label">小計</label>
											<div className="col-xs-4">
												<input type="number" 							
												className="form-control"	
												value={fieldSubData.subtotal}
												onChange={this.changeFDValue.bind(this,'subtotal')}
												required disabled　/>
											</div>
										</div>
										<div className="form-group">
											<label className="col-xs-2 control-label">備註</label>
											<div className="col-xs-4">
												<textarea col="30" row="2" className="form-control"
												value={fieldSubData.memo}
												onChange={this.changeFDValue.bind(this,'memo')}
												maxLength="256"></textarea>
											</div>
										</div>
								</div>
								<div className="item-title">
									<h5>
										用餐排程 &amp; 試算
										<small className="text-muted">產品分類為 "月子餐" 才需填寫!!</small>
									</h5>
								</div>
								<div className="panel-body">
									<div className="form-group">
										<label className="col-xs-2 control-label">預計送餐起日</label>
										<div className="col-xs-6">
											<span className="has-feedback">
												<InputDate id="meal_start" 
												onChange={this.changeMealday} 
												field_name="meal_start" 
												value={fieldSubData.meal_start}
												required={fieldSubData.product_type==2} />
											</span>
										</div>										
									</div>
									<div className="form-group">
										<label className="col-xs-2 control-label">預計送餐迄日</label>
										<div className="col-xs-6">
											<span className="has-feedback">
												<InputDate id="meal_end" 
												onChange={this.changeMealday} 
												field_name="meal_end" 
												value={fieldSubData.meal_end}
												required={fieldSubData.product_type==2} />
											</span>
										</div>										
									</div>
									<div className="form-group">
										<label className="col-xs-2 control-label">預計天數</label>
										<div className="col-xs-6">
											<input type="number" 							
											className="form-control"	
											value={fieldSubData.diff_day}
											onChange={this.changeFDValue.bind(this,'diff_day')}
											min="0" disabled/>
										</div>
										<small className="help-inline col-xs-4">系統自動計算</small>
									</div>
									<div className="form-group">
										<label className="col-xs-2 control-label">預計餐數</label>
										<div className="col-xs-2">
											<div className="input-group">
												<span className="input-group-addon" id="meal1-1">早</span>
												<input type="number" 							
												className="form-control"	
												value={fieldSubData.estimate_breakfast}
												onChange={this.changeMealCount.bind(this,'estimate_breakfast')}
												min="0"/>
											</div>
										</div>
										<div className="col-xs-2">
											<div className="input-group">
												<span className="input-group-addon" id="meal1-2">午</span>
												<input type="number" 							
												className="form-control"	
												value={fieldSubData.estimate_lunch}
												onChange={this.changeMealCount.bind(this,'estimate_lunch')}
												min="0"/>
											</div>
										</div>
										<div className="col-xs-2">
											<div className="input-group">
												<span className="input-group-addon" id="meal1-3">晚</span>
												<input type="number" 							
												className="form-control"	
												value={fieldSubData.estimate_dinner}
												onChange={this.changeMealCount.bind(this,'estimate_dinner')}
												min="0"/>
											</div>
										</div>
									</div>
									<div className="form-group">
										<label className="col-xs-2 control-label">預計點數</label>
										<div className="col-xs-6">
											<input type="number" 							
											className="form-control"	
											value={fieldSubData.estimate_count}
											onChange={this.changeFDValue.bind(this,'estimate_count')}
											min="0" disabled/>
										</div>
										<small className="help-inline col-xs-4">系統自動計算</small>
									</div>
									<div className="form-group">
										<label className="col-xs-2 control-label">實際餐數</label>
										<div className="col-xs-2">
											<div className="input-group">
												<span className="input-group-addon" id="meal2-1">早</span>
												<input type="number" 							
												className="form-control"	
												value={fieldSubData.real_breakfast}
												onChange={this.changeFDValue.bind(this,'real_breakfast')}
												min="0" disabled/>
											</div>
										</div>
										<div className="col-xs-2">
											<div className="input-group">
												<span className="input-group-addon" id="meal2-2">午</span>
												<input type="number" 							
												className="form-control"	
												value={fieldSubData.real_lunch}
												onChange={this.changeFDValue.bind(this,'real_lunch')}
												min="0" disabled/>
											</div>
										</div>
										<div className="col-xs-2">
											<div className="input-group">
												<span className="input-group-addon" id="meal2-3">晚</span>
												<input type="number" 							
												className="form-control"	
												value={fieldSubData.real_dinner}
												onChange={this.changeFDValue.bind(this,'real_dinner')}
												min="0" disabled/>
											</div>
										</div>
									</div>
									<div className="form-group">
										<label className="col-xs-2 control-label">實際點數</label>
										<div className="col-xs-6">
											<input type="number" 							
											className="form-control"	
											value={fieldSubData.real_count}
											onChange={this.changeFDValue.bind(this,'real_count')}
											min="0" disabled/>
										</div>
									</div>										
									<div className="form-group">
										<label className="col-xs-2 control-label">用餐週期<br />說明</label>
										<div className="col-xs-6">
											<textarea col="30" rows="3" className="form-control"
											value={fieldSubData.meal_memo}
											onChange={this.changeFDValue.bind(this,'meal_memo')}
											maxLength="256"></textarea>
										</div>
									</div>	
								</div>
								</form>
								<div className="panel-footer text-right">
									<button className="btn-primary"
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
					<h4 className="title">產品明細列表</h4>
					<table className="table-condensed">
						<tbody>
							<tr>
								<th className="col-xs-1 text-center">編輯</th>
								<th className="col-xs-2">產品分類</th>
								<th className="col-xs-4">產品名稱</th>
								<th className="col-xs-1">單價</th>
								<th className="col-xs-1">數量</th>
								<th className="col-xs-1">小計</th>
								<th className="col-xs-2 text-center">用餐明細</th>
							</tr>
							{
								this.state.gridSubData.map(function(itemData,i) {
									var meal_detail_button=null;
									if(itemData.product_type==2)//產品為月子餐才有用餐明細
									{
										meal_detail_button=<button className="btn-info btn-sm"><i className="fa-search"></i> 查看</button>;
									}
									var sub_out_html = 
										<tr key={itemData.record_deatil_id}>
											<td className="text-center">
												<button className="btn-link" type="button" onClick={this.updateSubType.bind(this,itemData.record_deatil_id)}><i className="fa-pencil"></i></button>
												<button className="btn-link text-danger" onClick={this.detailDeleteSubmit.bind(this,itemData.record_deatil_id)}><i className="fa-trash"></i></button>
											</td>
											<td><StateForGrid stateData={CommData.ProductType} id={itemData.product_type} /></td>
											<td>{itemData.product_name}</td>
											<td>{itemData.price}</td>
											<td>{itemData.qty}</td>
											<td>{itemData.subtotal}</td>
											<td className="text-center">{meal_detail_button}</td>			
										</tr>;
										return sub_out_html;
								}.bind(this))
							}
						</tbody>
					</table>
				{/*---產品明細列表end---*/}
				</div>
			);

		return outHtml;
	}
});