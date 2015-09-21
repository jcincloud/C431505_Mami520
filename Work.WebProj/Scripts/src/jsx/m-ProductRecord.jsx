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
		jqGet(gb_approot + 'api/GetAction/GetAllBorn',{})
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
	render: function() {
		var outHtml = null;

		if(this.state.edit_type==0)
		{
			var searchData = this.state.searchData;

			outHtml =
			(
			<div>
				<ul className="breadcrumb">
					<li><i className={this.props.IconClass}></i> {this.props.MenuName}</li>
				</ul>
				<h3 className="title">
					{this.props.Caption}
				</h3>
				<form onSubmit={this.handleSearch}>
					<div className="table-responsive">
						<div className="table-header">
							<div className="table-filter">
								<div className="form-inline">
									<div className="form-group">
										<label>日期區間</label> { }										
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

										<label className="sr-only">媽媽姓名</label> { }
										<input type="text" className="form-control" 
										value={searchData.name}
										onChange={this.changeGDValue.bind(this,'name')}
										placeholder="媽媽姓名..." /> { }

										<label className="sr-only">用餐編號</label> { }
										<input type="text" className="form-control" 
										value={searchData.meal_id}
										onChange={this.changeGDValue.bind(this,'meal_id')}
										placeholder="用餐編號..." /> { }

										<label className="sr-only">是否轉單</label> { }
										<select className="form-control" 
												value={searchData.is_receipt}
												onChange={this.onSelectChange.bind(this,'is_receipt')}>
											<option value="">是否轉單</option>
											<option value="true">已轉單</option>
											<option value="false">未轉單</option>
										</select> { }

										<label className="sr-only">是否結案</label> { }
										<select className="form-control" 
												value={searchData.is_close}
												onChange={this.onSelectChange.bind(this,'is_close')}>
											<option value="">是否結案</option>
											<option value="true">結案</option>
											<option value="false">未結案</option>
										</select> { }

										<button className="btn-primary" type="submit"><i className="fa-search"></i>{ }搜尋</button>
									</div>
								</div>
							</div>
						</div>
						<table>
							<thead>
								<tr>
									<th className="col-xs-1 text-center">
										<label className="cbox">
											<input type="checkbox" checked={this.state.checkAll} onChange={this.checkAll} />
											<i className="fa-check"></i>
										</label>
									</th>
									<th className="col-xs-1 text-center">修改</th>
									<th className="col-xs-1">銷售單號</th>
									<th className="col-xs-1">訂購時間</th>
									<th className="col-xs-1">用餐編號</th>
									<th className="col-xs-1">媽媽姓名</th>
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

			var MdoalCustomerBornSelect=ReactBootstrap.Modal;//啟用選取用餐編號的視窗內容
			var born_select_out_html=null;//存放選取用餐編號的視窗內容
			if(this.state.isShowCustomerBornSelect){
				born_select_out_html = 					
					<MdoalCustomerBornSelect bsSize="xsmall" onRequestHide={this.closeSelectCustomerBorn}>
							<div className="modal-header light">
								<div className="pull-right">
									<button onClick={this.closeSelectCustomerBorn} type="button"><i className="fa-times"></i></button>
								</div>
								<h4 className="modal-title">請選擇客戶 { }</h4>
							</div>
							<div className="modal-body">
								<table>
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
														<td className="text-center"><input type="checkbox" onClick={this.selectCustomerBorn.bind(this,itemData.customer_id,itemData.born_id,itemData.meal_id)} /></td>
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
			if(this.state.edit_type==1){
				save_out_html=<button type="submit" className="btn-primary"><i className="fa-check"></i> 儲存</button>;
			}else{
				save_out_html=<strong>主檔資料不可修改！</strong>;
				if(!fieldData.is_close){
					close_out_html=<button className="btn-success" type="button" onClick={this.closeRecord}><i className="fa-check"></i> 設為 已結案</button>;
				}
			}

			outHtml=(
			<div>
				{born_select_out_html}
				<ul className="breadcrumb">
					<li><i className={this.props.IconClass}></i> {this.props.MenuName}</li>
				</ul>
				<h3 className="title">{this.props.Caption}</h3>
				<h4 className="title">產品銷售資料主檔</h4>
				<form className="form-horizontal" onSubmit={this.handleSubmit}>
					<div className="col-xs-8">
						<div className="form-group">
							<label className="col-xs-2 control-label text-danger">訂單日期</label>
							<div className="col-xs-4">
								<span className="has-feedback">
									<InputDate id="record_day" 
									onChange={this.changeFDValue} 
									field_name="record_day" 
									value={fieldData.record_day}
									disabled={true}
									placeholder="系統自動產生" />
								</span>
							</div>
							<label className="col-xs-2 control-label text-danger">銷售單號</label>
							<div className="col-xs-4">
								<input type="text" 							
								className="form-control"	
								value={fieldData.record_sn}
								onChange={this.changeFDValue.bind(this,'record_sn')}
								maxLength="64"
								disabled
								placeholder="系統自動產生" />
							</div>
						</div>

						<div className="form-group">
							<label className="col-xs-2 control-label text-danger">選擇客戶</label>
							<div className="col-xs-4">
								<div className="input-group">
									<input type="text" 							
									className="form-control"	
									value={fieldData.customer_name}
									onChange={this.changeFDValue.bind(this,'customer_name')}
									maxLength="64"
									disabled />
									<span className="input-group-btn">
										<button type="button" 
										onClick={this.showSelectCustomerBorn}
										disabled={this.state.edit_type==2} >...</button>
									</span>
								</div>
							</div>
							<label className="col-xs-2 control-label">媽媽姓名</label>
							<div className="col-xs-4">
								<input type="text" 							
								className="form-control"	
								value={fieldData.name}
								onChange={this.changeFDValue.bind(this,'name')}
								maxLength="64"
								required 
								disabled />
							</div>
						</div>

						<div className="form-group">
							<label className="col-xs-2 control-label">用餐編號</label>
							<div className="col-xs-4">
								<input type="text" 
								className="form-control"	
								value={fieldData.meal_id}
								onChange={this.changeFDValue.bind(this,'meal_id')}
								required
								disabled />
							</div>
							<label className="col-xs-2 control-label">客戶類別</label>
							<div className="col-xs-4">
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
						</div>
						<div className="form-group">
							<label className="col-xs-2 control-label">連絡電話1</label>
							<div className="col-xs-4">
								<input type="tel" 
								className="form-control"	
								value={fieldData.tel_1}
								onChange={this.changeFDValue.bind(this,'tel_1')}
								maxLength="16"
								disabled />
							</div>
							<label className="col-xs-2 control-label">連絡電話2</label>
							<div className="col-xs-4">
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
							<div className="col-xs-4">
								<input type="text" 
								className="form-control"	
								value={fieldData.sno}
								onChange={this.changeFDValue.bind(this,'sno')}
								maxLength="10"
								disabled />
							</div>
							<label className="col-xs-2 control-label">生日</label>
							<div className="col-xs-4">
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
					<div className="col-xs-8">
						<p className="text-right">
							{save_out_html} { }
							<button type="button" onClick={this.noneType}><i className="fa-times"></i> 回前頁</button>
						</p>
					</div>
				</form>
				<div className="col-xs-12">
					<hr className="condensed" />
				</div>
				{/* ---是否結案按鈕--- */}
				<h4 className="title clearfix">
					<div className="col-xs-8">
						<span className="pull-left">是否結案：{fieldData.is_close?<strong className="text-primary">已結案</strong>:<strong className="text-danger">未結案</strong>}</span>
						<span className="pull-right">
							{/*<button className="btn-danger"><i className="fa-times"></i> 設為 未結案</button>*/}
							{close_out_html}
						</span>
					</div>
				</h4>
				{/* ---是否結案按鈕--- */}
				
			</div>
			);
		}else{
			outHtml=(<span>No Page</span>);
		}

		return outHtml;
	}
});