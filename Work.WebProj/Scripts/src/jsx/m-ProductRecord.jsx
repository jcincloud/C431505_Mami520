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
					<td className="text-xs-center"><GridCheckDel iKey={this.props.ikey} chd={this.props.itemData.check_del} delCheck={this.delCheck} /></td>
					<td className="text-xs-center"><GridButtonModify modify={this.modify}/></td>
					<td>{this.props.itemData.record_sn}</td>
					<td>{moment(this.props.itemData.record_day).format('YYYY/MM/DD')}</td>
					<td><StateForGrid stateData={CommData.CustomerType} id={this.props.itemData.customer_type} /></td>
					<td>{this.props.itemData.meal_id}</td>
					<td>{this.props.itemData.name}</td>
					<td>{this.props.itemData.tel_1}</td>
					<td>{this.props.itemData.is_receipt?<span className="text-muted">已轉單</span>:<span className="text-indigo">未轉單</span>}</td>			
					<td>{this.props.itemData.is_close?<span className="text-muted">結案</span>:<span className="text-danger">未結案</span>}</td>			
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
			fieldData:{born_memo:null},
			searchData:{title:null},
			searchBornData:{word:null,customer_type:null,is_meal:false},
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
		if(gb_main_id==0){
            this.queryGridData(1);
        }else{//有帶id的話,直接進入修改頁面
            this.updateType(gb_main_id);
        }
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
			fieldData.born_memo=data.getBorn.memo;

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
		if(!this.state.fieldData.is_receipt){
			tosMessage(null, '未轉應收帳款前不可結案!!', 3);
			return;
		}

		jqPost(gb_approot + 'api/GetAction/closeRecord',{main_id:this.state.fieldData.product_record_id})
		.done(function(data, textStatus, jqXHRdata) {
			if(data.result){
				var fieldData = this.state.fieldData;
				fieldData.is_close=data.result;
				this.setState({fieldData:fieldData});
			}else{
				tosMessage(null,data.message,3);
			}
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
	insertAccountsPayable:function(){
		//轉 應收帳款
		if(!confirm('確定是否轉應收帳款?')){
			return;
		}
		var parms={
			product_record_id:this.state.fieldData.product_record_id,
			customer_id:this.state.fieldData.customer_id,
			record_sn:this.state.fieldData.record_sn
		};

		jqPost(gb_approot + 'api/GetAction/insertAccountsPayable',parms)
		.done(function(data, textStatus, jqXHRdata) {
			var fieldData = this.state.fieldData;
			fieldData.is_receipt=data.result;
			this.setState({fieldData:fieldData});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});	
	},
	onCustomerTypeChange:function(e){
		var obj = this.state.searchData;
		obj['customer_type'] = e.target.value;
		this.setState({searchData:obj});
		this.queryGridData(0);
	},
	setAccountsPayable:function(){
        //檢視 應收帳款
        document.location.href = gb_approot + 'Active/AccountsPayable?product_record_id=' + this.state.fieldData.product_record_id;
    },
	render: function() {
		var outHtml = null;

		if(this.state.edit_type==0)
		{
			var searchData = this.state.searchData;

			outHtml =
			(
			<div>
				<h3 className="h3">{this.props.Caption}</h3>
				<form onSubmit={this.handleSearch}>
					
						<div className="table-header">
							<div className="table-filter">
								<div className="form-inline form-sm">
									<div className="form-group">
										<label className="text-sm">訂單日期</label> { }										
											<InputDate id="start_date" ver={2}
												onChange={this.changeGDValue} 
												field_name="start_date" 
												value={searchData.start_date} /> { }
										<label className="text-sm">~</label> { }
											<InputDate id="end_date" ver={2}
												onChange={this.changeGDValue} 
												field_name="end_date" 
												value={searchData.end_date} /> { }
										<label className="text-sm">媽媽姓名/用餐編號/電話</label> { }
										<input type="text" className="form-control" 
										value={searchData.word}
										onChange={this.changeGDValue.bind(this,'word')}
										placeholder="請擇一填寫..." /> { }

										{/*<label>用餐編號</label> { }
										<input type="text" className="form-control input-sm" 
										value={searchData.meal_id}
										onChange={this.changeGDValue.bind(this,'meal_id')}
										placeholder="用餐編號..." /> { }*/}

										<div className="form-group">
											<label className="text-sm">客戶分類</label> { }
											<select className="form-control" 
													value={searchData.customer_type}
													onChange={this.onCustomerTypeChange}>
												<option value="">全部</option>
											{
												CommData.CustomerType.map(function(itemData,i) {
													return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
												})
											}
											</select>
										</div><br />

										<label className="text-sm">是否轉單</label> { }
										<select className="form-control" 
												value={searchData.is_receipt}
												onChange={this.onSelectChange.bind(this,'is_receipt')}>
											<option value="">是否轉單</option>
											<option value="true">已轉單</option>
											<option value="false">未轉單</option>
										</select> { }

										<label className="text-sm">是否結案</label> { }
										<select className="form-control" 
												value={searchData.is_close}
												onChange={this.onSelectChange.bind(this,'is_close')}>
											<option value="">是否結案</option>
											<option value="true">結案</option>
											<option value="false">未結案</option>
										</select> { }

										<button className="btn btn-secondary btn-sm" type="submit"><i className="fa-search"></i> { }搜尋</button>
									</div>
								</div>
							</div>
						</div>
						<table className="table table-sm table-bordered table-striped">
							<thead>
								<tr>
									<th style={{"width":"5%;"}} className="text-xs-center">
										<label className="c-input c-checkbox">
											<input type="checkbox" checked={this.state.checkAll} onChange={this.checkAll} />
											<span className="c-indicator"></span>
										</label>
									</th>
									<th style={{"width":"5%;"}} className="text-xs-center">修改</th>
									<th style={{"width":"12%;"}}>銷售單號</th>
									<th style={{"width":"12%;"}}>訂購時間</th>
									<th style={{"width":"10%;"}}>客戶分類</th>
									<th style={{"width":"10%;"}}>用餐編號</th>
									<th style={{"width":"14%;"}}>媽媽姓名</th>
									<th style={{"width":"12%;"}}>電話1</th>
									<th style={{"width":"10%;"}}>是否轉單</th>
									<th style={{"width":"10%;"}}>是否結案</th>
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
					<MdoalCustomerBornSelect bsSize="medium"  title="選擇客戶" onRequestHide={this.closeSelectCustomerBorn}>
							<div className="modal-body">
								<div className="table-header">
							        <div className="table-filter">
							            <div className="form-inline form-sm">
							                <div className="form-group">
							                    <label className="text-sm">客戶名稱/餐編/媽媽姓名</label> { }
							                    <input type="text" className="form-control"
							      			    value={searchBornData.word}
												onChange={this.changeGDBornValue.bind(this,'word')}
											 	placeholder="請擇一填寫" />
							                </div> { }
											<label className="text-sm">客戶分類</label> { }
											<select className="form-control" 
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
							                    <label className="text-sm">是否正在用餐</label> { }
							                    <select className="form-control"
							                    value={searchBornData.is_meal}
												onChange={this.changeGDBornValue.bind(this,'is_meal')}>
							                        <option value="">全部</option>
							                        <option value="true">是</option>
							                        <option value="false">否</option>
							                    </select>
							                </div> { }
							                <button className="btn btn-secondary btn-sm"><i className="fa-search"></i> 搜尋</button>
							            </div>
							        </div>
							    </div>
								<table className="table table-sm table-bordered table-striped">
									<tbody>
										<tr>
											<th style={{"width":"10%;"}} className="text-xs-center">選擇</th>
											<th style={{"width":"12%;"}}>客戶姓名</th>
											<th style={{"width":"12%;"}}>客戶類別</th>
											<th style={{"width":"12%;"}}>用餐編號</th>
											<th style={{"width":"20%;"}}>媽媽姓名</th>										
											<th style={{"width":"12%;"}}>電話1</th>
											<th style={{"width":"10%;"}}>備註</th>
											<th style={{"width":"12%;"}}>預產期</th>
										</tr>
										{
											this.state.born_list.map(function(itemData,i) {
												
												var born_out_html = 
													<tr key={itemData.born_id}>
														<td className="text-center">
															<label className="c-input c-checkbox">
										                        <input type="checkbox" onClick={this.selectCustomerBorn.bind(this,itemData.customer_id,itemData.born_id,itemData.meal_id)} />
										                        <span className="c-indicator"></span>
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

			var save_out_html=null;//儲存按鈕
			var close_out_html=null;//結案按鈕
			var receipt_out_html=null;//轉應收按鈕
			var detail_out_html=null;//明細檔
			if(this.state.edit_type==1){
				save_out_html=<button type="submit" className="btn btn-sm btn-primary col-xs-offset-1"><i className="fa-check"></i> 儲存</button>;
			}else{
				save_out_html=<strong className="col-xs-offset-1">主檔資料不可修改！</strong>;
				detail_out_html=
				<SubForm ref="SubForm" 
				main_id={fieldData.product_record_id}
				customer_id={fieldData.customer_id}
				born_id={fieldData.born_id}
				meal_id={fieldData.meal_id}
				is_close={fieldData.is_close} />;
				if(!fieldData.is_close){
					close_out_html=<button className="btn btn-success btn-block" type="button" onClick={this.closeRecord}><i className="fa-check"></i> 設為 已結案</button>;
				}
				if(fieldData.is_receipt){//轉應收後出現可檢視應收帳款按鈕
					receipt_out_html=<button className="btn btn-info btn-block" type="button" onClick={this.setAccountsPayable.bind(this)}><i className="fa-search"></i> 檢視 應收帳款</button>;
				}else{
					receipt_out_html=<button className="btn btn-success btn-block" type="button" onClick={this.insertAccountsPayable.bind(this)}><i className="fa-check"></i>轉 應收帳款</button>;
				}
			}
			var blankStyle={
				height: 100
			};
			outHtml=(
			<div>
				{born_select_out_html}
				<h3 className="h3">{this.props.Caption}<small className="sub"><i className="fa-angle-double-right"></i> 主檔</small></h3>
				<form className="form form-sm" onSubmit={this.handleSubmit}>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">銷售單號</label>
							<div className="col-xs-3">
								<input type="text" 							
								className="form-control"	
								value={fieldData.record_sn}
								onChange={this.changeFDValue.bind(this,'record_sn')}
								maxLength="64"
								disabled
								placeholder="系統自動產生" />
							</div>
							<small className="text-muted col-xs-6">系統自動產生，無法修改</small>
						</div>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">訂單日期</label>
							<div className="col-xs-3">
								<InputDate id="record_day" 
									onChange={this.changeFDValue} 
									field_name="record_day" 
									value={fieldData.record_day}
									disabled={true}
									placeholder="系統自動產生" />
							</div>
							<small className="text-muted col-xs-6">系統自動產生，無法修改</small>
						</div>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 選擇客戶</label>
							<div className="col-xs-3">
								<div className="input-group input-group-sm">
									<input type="text" 							
									className="form-control"	
									value={fieldData.customer_name}
									onChange={this.changeFDValue.bind(this,'customer_name')}
									maxLength="64"
									disabled />
									<span className="input-group-btn">
										<a className="btn btn-success"
										onClick={this.showSelectCustomerBorn}
										disabled={this.state.edit_type==2} ><i className="fa-plus"></i></a>
									</span>
								</div>
							</div>
							<small className="text-muted col-xs-6">請按 <i className="fa-plus"></i> 選取</small>
						</div>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">客戶類別</label>
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
							<label className="col-xs-1 form-control-label text-xs-right">客戶名稱</label>
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
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">用餐編號</label>
							<div className="col-xs-3">
								<input type="text" 
								className="form-control"	
								value={fieldData.meal_id}
								onChange={this.changeFDValue.bind(this,'meal_id')}
								required
								disabled />
							</div>
							<label className="col-xs-1 form-control-label text-xs-right">媽媽姓名</label>
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
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">連絡電話1</label>
							<div className="col-xs-3">
								<input type="tel" 
								className="form-control"	
								value={fieldData.tel_1}
								onChange={this.changeFDValue.bind(this,'tel_1')}
								maxLength="16"
								disabled />
							</div>
							<label className="col-xs-1 form-control-label text-xs-right">連絡電話2</label>
							<div className="col-xs-3">
								<input type="tel" 
								className="form-control"	
								value={fieldData.tel_2}
								onChange={this.changeFDValue.bind(this,'tel_2')}
								maxLength="16"
								disabled />
							</div>
						</div>						
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">身分證字號</label>
							<div className="col-xs-3">
								<input type="text" 
								className="form-control"	
								value={fieldData.sno}
								onChange={this.changeFDValue.bind(this,'sno')}
								maxLength="10"
								disabled />
							</div>
							<label className="col-xs-1 form-control-label text-xs-right">生日</label>
							<div className="col-xs-3">
								<InputDate id="birthday" 
									onChange={this.changeFDValue} 
									field_name="birthday" 
									value={fieldData.birthday}
									disabled={true} />
							</div>
						</div>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">送餐地址</label>
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
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">備用地址</label>
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
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">生產備註</label>
							<div className="col-xs-8">
								<input type="text" 							
								className="form-control"	
								value={fieldData.born_memo}
								onChange={this.changeFDValue.bind(this,'born_memo')}
								maxLength="256"
								disabled/>
							</div>
						</div>

						<div className="form-action">
							{save_out_html} { }
							<button type="button" className="btn btn-sm btn-blue-grey" onClick={this.noneType}><i className="fa-arrow-left"></i> 回前頁</button>
						</div>
				</form>
				<hr />
				{/* ---是否結案按鈕start--- */}
				<div className="row">
					<div className="col-xs-6">
						<div className="card">
							<div className="card-header"><i className="fa-file-text-o"></i> 訂單狀態【{fieldData.is_close?<strong>已結案</strong>:<strong className="text-danger">未結案</strong>}】</div>
							<div className="card-block">
								{close_out_html}
								<small className="text-muted">結案後，無法新增、修改及刪除產品明細</small>
							</div>
						</div>
					</div>
					<div className="col-xs-6">
						<div className="card">
							<div className="card-header"><i className="fa-dollar"></i> 帳務狀態【{fieldData.is_receipt?<strong>已轉應收帳款</strong>:<strong className="text-danger">未轉應收帳款</strong>}】</div>
							<div className="card-block">
								{receipt_out_html}
								<small className="text-muted">　</small>
							</div>
						</div>
					</div>
				</div>
				{/* ---是否結案按鈕end--- */}
				<hr />
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
			searchProductData:{name:null,product_type:null,born_id:this.props.born_id},
			searchMealIDData:{keyword:'A'},
			edit_sub_type:0,//預設皆為新增狀態
			checkAll:false,
			isShowProductSelect:false,//控制選取產品視窗顯示
			product_list:[],
			parm:{breakfast:0,lunch:0,dinner:0},//計算用
			isShowMealidSelect:false,//控制選取用餐編號顯示
			mealid_list:[],
			tryout_array:[
				{name:'breakfast',name_c:'早餐',value:false},
				{name:'lunch',name_c:'午餐',value:false},
				{name:'dinner',name_c:'晚餐',value:false}
			]
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldSubData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/RecordDetail',
			initPathName:gb_approot+'Active/Product/aj_Init',
			apiGridPathName:gb_approot+'api/GetAction/GetAllRecordDetail'
		};
	},
	componentDidMount:function(){
		this.queryGridData();
		this.insertSubType();//一開始載入預設為新增狀態
		//this.getAjaxInitData();//載入init資料
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
		var fieldSubData=this.state.fieldSubData;

		if(fieldSubData.product_id==null || fieldSubData.product_id==undefined){
			tosMessage(gb_title_from_invalid,'未選擇產品!!',3);
			return;
		}
		if(fieldSubData.product_type==1){
			if(!this.state.tryout_array[0]['value'] && !this.state.tryout_array[1]['value'] && !this.state.tryout_array[2]['value']){
				tosMessage(gb_title_from_invalid,'產品為試吃時,請選擇試吃的餐別!!',3);
				return;
			}
			if(fieldSubData.tryout_mealtype.indexOf(',')!=-1){
				tosMessage(gb_title_from_invalid,'試吃僅能選擇一項餐別!!',3);
				return;
			}
		}

		if(this.state.edit_sub_type==1){
			jqPost(this.props.apiPathName,fieldSubData)
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
			jqPut(this.props.apiPathName,fieldSubData)
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

		return jqGet(this.props.apiGridPathName,parms);
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
		var tryout_array=this.state.tryout_array;
		tryout_array.forEach(function(object, i){object.value=false;})

		this.setState({edit_sub_type:1,fieldSubData:{
			product_record_id:this.props.main_id,
			customer_id:this.props.customer_id,
			born_id:this.props.born_id,
			qty:1,
			subtotal:0,
			tryout_mealtype:null,
			meal_select_state:0,
			meal_id:null,
			meal_start:null,
			meal_end:null,
			isDailyMealAdd:false,
			set_start_meal:null,
			set_end_meal:null,
			diff_day:0
		},
		tryout_array:tryout_array
	});
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
			//試吃餐別
			var tryout_array=this.state.tryout_array;
			tryout_array.forEach(function(object, i){object.value=false;})//選之前先清空
			if(data.data.tryout_mealtype!=undefined){
				var array=data.data.tryout_mealtype.split(",");
				tryout_array.forEach(function(object, i){
					array.forEach(function(a_obj,j){
						if(object.name==a_obj){
							object.value=true;
						}
					})
	    		})
			}
			//console.log(data);
			this.setState({edit_sub_type:2,fieldSubData:data.data,tryout_array:tryout_array});
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
		var parm=this.state.parm;
		if(obj.isMealStart){
			tosMessage(gb_title_from_invalid,'已開始正式用餐後,請勿變更預計用餐起日及迄日!!',3);
		}else{
			var old_val=obj[name];//修改前
			obj[name] = e.target.value;//先變更修改後的日期在計算

			var diff_mealday=DiffDate(obj.meal_start,obj.meal_end);
			obj.diff_day=diff_mealday.diff_day;
			if(diff_mealday.result==-1){
				tosMessage(gb_title_from_invalid,'預計送餐起日不可大於預計送餐迄日!!',3);
				obj[name]=old_val;
			}else{
				if(parm.breakfast>0){obj.estimate_breakfast=diff_mealday.diff_day;}else{obj.estimate_breakfast=0;}
				if(parm.lunch>0){obj.estimate_lunch=diff_mealday.diff_day;}else{obj.estimate_lunch=0;}
				if(parm.dinner>0){obj.estimate_dinner=diff_mealday.diff_day;}else{obj.estimate_dinner=0;}
				
				obj.qty=diff_mealday.diff_day;
				obj.subtotal=obj.qty*obj.price;
			}
		}

		this.setState({fieldSubData:obj});
	},
	changeMealDayCount:function(e){
		var obj = this.state.fieldSubData;
		var parm=this.state.parm;
		if(obj.meal_start!=null & (e.target.value!=null & e.target.value!='')){
			var tmp_date = new Date(obj.meal_start);
			var end_date=addDate(tmp_date,parseInt(e.target.value)-1);

			obj.meal_end=format_Date(end_date);
			if(parm.breakfast>0){
				obj.estimate_breakfast=parseInt(e.target.value);
			}else{obj.estimate_breakfast=0;}
			if(parm.lunch>0){
				obj.estimate_lunch=parseInt(e.target.value);
			}else{obj.estimate_lunch=0;}
			if(parm.dinner>0){
				obj.estimate_dinner=parseInt(e.target.value);
			}else{obj.estimate_dinner=0;}
			obj.qty=parseInt(e.target.value);
			obj.subtotal=obj.qty*obj.price;
		}

		obj.diff_day=e.target.value;
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
		obj.qty=obj.estimate_count;
		obj.subtotal=obj.qty*obj.price;

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
		var tryout_array=this.state.tryout_array;
		var parm=this.state.parm;//用餐點數計算
		tryout_array.forEach(function(object, i){object.value=false;})//選之前先清空

		this.state.product_list.forEach(function(obj,i){
			if(obj.product_id==product_id){
				fSD.product_id=product_id;
				fSD.product_type=obj.product_type;
				fSD.product_name=obj.product_name;
				fSD.price=obj.price;
				fSD.standard=obj.standard;
				fSD.subtotal=fSD.qty*obj.price;
				if(obj.product_type==1 || obj.product_type==2){
					//parm:{breakfast:0,lunch:0,dinner:0}
					//依產品各餐別計算售價點數
					parm.breakfast=roundX(obj.breakfast_price/obj.price,4);
					parm.lunch=roundX(obj.lunch_price/obj.price,4);
					parm.dinner=roundX(obj.dinner_price/obj.price,4);

					fSD.tryout_mealtype=obj.meal_type;
					//依產品選擇餐別帶出餐別
					if(obj.meal_type!=undefined){
						var array=obj.meal_type.split(",");
						tryout_array.forEach(function(object, i){
							array.forEach(function(a_obj,j){
								if(object.name==a_obj){
									object.value=true;
								}
							})
			    		})
					}
				}
			}
		});
		if(fSD.product_type==2){//如果產品為月子餐就儲存用餐編號
			fSD.meal_id=this.props.meal_id;
		}
		this.setState({isShowProductSelect:false,fieldSubData:fSD,tryout_array:tryout_array,parm:parm});
	},
	setReleaseMealID:function(meal_id,record_deatil_id){
		if(!confirm('確定釋放用餐編號?')){
			return;
		}
		if(meal_id==null || meal_id==''){
			tosMessage('操作錯誤提示','無用餐編號無法釋放!!',3);
			return;
		}
		if(this.state.fieldSubData.is_release==true){
			tosMessage('操作錯誤提示','用餐編號已釋放!!',3);
			return;
		}

		jqPost(gb_approot + 'api/GetAction/releaseMealID',{record_deatil_id:record_deatil_id,meal_id:meal_id})
		.done(function(data, textStatus, jqXHRdata) {
			if(data.result){
				tosMessage(null,'完成用餐編號釋放',1);
				var fieldSubData = this.state.fieldSubData;
				fieldSubData.is_release=data.result;
				this.props.meal_id=null;
				this.setState({fieldSubData:fieldSubData});
			}else{
				tosMessage(null,data.message,3);
			}
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	setMealSchedule:function(record_deatil_id){
		//設定用餐排程
		document.location.href = gb_approot + 'Active/MealSchedule?record_deatil_id=' + record_deatil_id;
	},
	queryAllMealID:function(){//選取用餐編號-取得未使用的用餐編號List
		jqGet(gb_approot + 'api/GetAction/GetAllMealID',this.state.searchMealIDData)
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({mealid_list:data});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});		
	},
	changeGDMealIDValue:function(name,e){
		var obj = this.state.searchMealIDData;
		obj[name] = e.target.value;
		this.setState({searchMealIDData:obj});
		this.queryAllMealID();
	},
	showSelectMealid:function(){
		this.queryAllMealID();
		this.setState({isShowMealidSelect:true});
	},
	closeSelectMealid:function(){
		this.setState({isShowMealidSelect:false});
	},
	selectMealid:function(meal_id){
		var fieldSubData = this.state.fieldSubData;//選取後變更mealid
		// jqPost(gb_approot + 'api/GetAction/ChangeMealIDState',{old_id:fieldSubData.meal_id,new_id:meal_id})
		// .done(function(data, textStatus, jqXHRdata) {
		// 	if(!data.result){
		// 		alert(data.message);
		// 	}
		// }.bind(this))
		// .fail(function( jqXHR, textStatus, errorThrown ) {
		// 	//showAjaxError(errorThrown);
		// });

		fieldSubData.meal_id=meal_id;
		this.setState({isShowMealidSelect:false,fieldSubData:fieldSubData});
	},
	onMealChange:function(index,e){
		var obj = this.state.fieldSubData;
		var arrayObj=this.state.tryout_array;
		var item = arrayObj[index];
		item.value = !item.value;
		
		var array="";
		if(obj.product_type==1){//如果為試吃,只能有一個餐別
			array=item.name;
			arrayObj.forEach(function(object, i){
	        	if(item!=object){
	  				object.value=false;
	        	}
    		})
		}else{
			arrayObj.forEach(function(object, i){
	        	if(object.value){
	        		if(array.length==0){
						array=object.name;
	        		}else{
						array=array+","+object.name;
	        		}	  				
	        	}
    		})
		}
		obj.tryout_mealtype=array;
		this.setState({fieldSubData:obj,tryout_array:arrayObj});
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
							一筆生產紀錄只能對應一筆試吃
						</div>
							<div className="table-header">
			                    <div className="table-filter">
			                        <div className="form-inline form-sm">
			                            <div className="form-group">
			                                <label className="text-sm">產品名稱</label> { }
			                                <input type="text" className="form-control"
			                            	value={searchProductData.name}
											onChange={this.changeGDProductValue.bind(this,'name')} />
			                            </div> { }
			                            <div className="form-group">
			                                <label className="text-sm">產品分類</label> { }
			                                <select className="form-control"
			                                	value={searchProductData.product_type}
												onChange={this.changeGDProductValue.bind(this,'product_type')}>
			                                    <option value="">全部</option>
												{
													CommData.ProductType.map(function(itemData,i) {
														return <option  key={itemData.id} value={itemData.id}>{itemData.label}</option>;
													})
												}
			                                </select>
			                            </div> { }
			                            <button className="btn btn-secondary btn-sm" onClick={this.queryAllProduct}><i className="fa-search"></i> 搜尋</button>
			                        </div>
			                    </div>
			                </div>
			                <table className="table table-sm table-bordered table-striped">
			                <tbody>
				                    <tr>
				                        <th style={{"width":"10%;"}} className="text-xs-center">選擇</th>
				                        <th style={{"width":"20%;"}}>產品名稱</th>
				                        <th style={{"width":"20%;"}}>產品分類</th>
				                        <th style={{"width":"50%;"}}>售價</th>
				                    </tr>
				                    {
										this.state.product_list.map(function(itemData,i) {
											
											var product_out_html = 
												<tr key={itemData.product_id}>
													<td className="text-xs-center">
														<label className="c-input c-checkbox">
				                                			<input type="checkbox" onClick={this.selectProduct.bind(this,itemData.product_id)} />
				                                			<span className="c-indicator"></span>
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
						<div className="modal-footer form-action">
			                <button type="button" className="btn btn-sm btn-blue-grey" onClick={this.closeSelectProduct}><i className="fa-times"></i> 關閉</button>
			            </div>
				</ModalProductSelect>;
		}

		var MdoalMealidSelect=ReactBootstrap.Modal;//啟用選取用餐編號的視窗內容
		var mealid_select_out_html=null;//存放選取用餐編號的視窗內容
		var searchMealIDData=this.state.searchMealIDData;
		if(this.state.isShowMealidSelect){
			mealid_select_out_html = 					
				<MdoalMealidSelect bsSize="small" title="選擇用餐編號" onRequestHide={this.closeSelectMealid}>
						<div className="modal-body">
							<div className="alert alert-warning">僅列出尚未使用的用餐編號</div>
								<div className="table-header">
							        <div className="table-filter">
							            <div className="form-inline">
							                <div className="form-group">
							                    <label for="">用餐編號分類</label> { }
							                    <select className="form-control input-sm"
							                    value={searchMealIDData.keyword}
												onChange={this.changeGDMealIDValue.bind(this,'keyword')}>
							                        <option value="">全部</option>
							                        <option value="A">A</option>
							                        <option value="B">B</option>
							                        <option value="C">C</option>
							                        <option value="H">H</option>
							                        <option value="N">N</option>
							                        <option value="T">T</option>
							                    </select> { }
							                    <button type="button" className="btn-primary btn-sm"><i className="fa-search"></i> 搜尋</button>
							                </div>
							            </div>
							        </div>
							    </div>							
							<table>
								<tbody>
									<tr>
										<th className="col-xs-1 text-center">選擇</th>
										<th className="col-xs-4">用餐編號</th>
									</tr>
									{
										this.state.mealid_list.map(function(itemData,i) {
										
											var mealid_out_html = 
												<tr key={itemData.meal_id}>
													<td className="text-center"><input type="checkbox" onClick={this.selectMealid.bind(this,itemData.meal_id)} /></td>
													<td>{itemData.meal_id}</td>
												</tr>;
											return mealid_out_html;
										}.bind(this))
									}
								</tbody>
							</table>
						</div>
						<div className="modal-footer">
							<button onClick={this.closeSelectMealid}><i className="fa-times"></i> { } 關閉</button>
						</div>
				</MdoalMealidSelect>;
		}
		//月子餐用的用餐編號
		var meal_id_html=null;
		if(fieldSubData.product_type==2){
			meal_id_html=(
				<div className="form-group">
					{mealid_select_out_html}
					<label className="col-xs-1 form-control-label text-xs-right">用餐編號</label>
					<div className="col-xs-2">
						<div className="input-group">
				            <input type="text" 
							className="form-control"	
							value={fieldSubData.meal_id}
							onChange={this.changeFDValue.bind(this,'meal_id')}
							required
							disabled={true} />
			            	<span className="input-group-btn">
			         			<a className="btn"
								onClick={this.showSelectMealid}>
								{/*---disabled={this.state.edit_sub_type==2 & fieldSubData.meal_id!=null}---*/}
									<i className="fa-plus"></i>
								</a>
			            	</span>
			        	</div>
					</div>
					<small className="help-inline col-xs-2">請按 <i className="fa-plus"></i> 選取</small>
					<button className="btn-success" type="button" 
					onClick={this.setReleaseMealID.bind(this,fieldSubData.meal_id,fieldSubData.record_deatil_id)}
					disabled={this.state.edit_sub_type==1 || fieldSubData.meal_id==null}>
						<i className="fa-check"></i>釋放用餐編號
					</button>
				</div>
				);
		}

		var total=0;

			outHtml =
			(
				<div>
					{product_select_out_html}
				{/*---產品明細編輯start---*/}
					<h3 className="h3">新增產品明細</h3>
					<div className="row">
						<div className="col-xs-9">
							<div className="item-box">
								<div className="item-title">
									<h5>產品明細基本資料</h5>
								</div>
								<form className="form-horizontal" role="form" id="form2" onSubmit={this.detailHandleSubmit}>
								<div className="panel-body">
										<div className="form-group">
											<label className="col-xs-1 form-control-label text-xs-right">銷售日期</label>
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
											<label className="col-xs-1 form-control-label text-xs-right">選擇產品</label>
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
											<label className="col-xs-1 form-control-label text-xs-right">產品分類</label>
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
											<label className="col-xs-1 form-control-label text-xs-right">規格</label>
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
											<label className="col-xs-1 form-control-label text-xs-right">售價</label>
											<div className="col-xs-2">
												<input type="number" 
												className="form-control"	
												value={fieldSubData.price}
												onChange={this.changePriceCount.bind(this,'price')} />
											</div>
											<label className="col-xs-1 control-label">數量</label>
											<div className="col-xs-1">
												<input type="text"				
												className="form-control"	
												value={fieldSubData.qty}
												onChange={this.changePriceCount.bind(this,'qty')}
												required/>
											</div>
											<small className="help-inline col-xs-2 text-danger">(必填)</small>
										</div>
										<div className="form-group">
											<label className="col-xs-1 form-control-label text-xs-right">小計</label>
											<div className="col-xs-4">
												<input type="number" 							
												className="form-control"	
												value={fieldSubData.subtotal}
												onChange={this.changeFDValue.bind(this,'subtotal')}
												required disabled　/>
											</div>
										</div>
										<div className="form-group">
											<label className="col-xs-1 form-control-label text-xs-right">備註</label>
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
									{meal_id_html}
									<div className="form-group">
										<label className="col-xs-1 form-control-label text-xs-right">預計送餐起日</label>
										<div className="col-xs-6">
											<span className="has-feedback">
												<InputDate id="meal_start" 
												onChange={this.changeMealday} 
												field_name="meal_start" 
												value={fieldSubData.meal_start}
												required={(fieldSubData.product_type==2 & fieldSubData.meal_id!=null & fieldSubData.meal_id!=undefined & fieldSubData.meal_id!='')|| fieldSubData.product_type==1}
												disabled={(fieldSubData.product_type==2 & fieldSubData.isDailyMealAdd) & this.state.edit_sub_type==2} />
											</span>
										</div>
										{/*---早開始、午開始、晚開始---*/}
										<div className="col-xs-4">
											<div className="radio-inline">
												<label>
													<input type="radio" 
															name="set_start_meal"
															value={1}
															checked={fieldSubData.set_start_meal==1} 
															onChange={this.changeFDValue.bind(this,'set_start_meal')}
													/>
													<span>早開始</span>
												</label>
											</div>
											<div className="radio-inline">
												<label>
													<input type="radio" 
															name="set_start_meal"
															value={2}
															checked={fieldSubData.set_start_meal==2} 
															onChange={this.changeFDValue.bind(this,'set_start_meal')}
															/>
													<span>午開始</span>
												</label>
											</div>
											<div className="radio-inline">
												<label>
													<input type="radio" 
															name="set_start_meal"
															value={3}
															checked={fieldSubData.set_start_meal==3} 
															onChange={this.changeFDValue.bind(this,'set_start_meal')}
															/>
													<span>晚開始</span>
												</label>
											</div>											
										</div>
										{/*---早開始、午開始、晚開始---*/}								
									</div>
									<div className="form-group">
										<label className="col-xs-1 form-control-label text-xs-right">預計送餐迄日</label>
										<div className="col-xs-6">
											<span className="has-feedback">
												<InputDate id="meal_end" 
												onChange={this.changeMealday} 
												field_name="meal_end" 
												value={fieldSubData.meal_end}
												required={fieldSubData.product_type==2 & fieldSubData.meal_id!=null & fieldSubData.meal_id!=undefined & fieldSubData.meal_id!=''}
												disabled={(fieldSubData.product_type==2 & fieldSubData.isDailyMealAdd) & this.state.edit_sub_type==2} />
											</span>
										</div>
										{/*---早結束、午結束、晚結束---*/}
										<div className="col-xs-4">
											<div className="radio-inline">
												<label>
													<input type="radio" 
															name="set_end_meal"
															value={1}
															checked={fieldSubData.set_end_meal==1} 
															onChange={this.changeFDValue.bind(this,'set_end_meal')}
													/>
													<span>早結束</span>
												</label>
											</div>
											<div className="radio-inline">
												<label>
													<input type="radio" 
															name="set_end_meal"
															value={2}
															checked={fieldSubData.set_end_meal==2} 
															onChange={this.changeFDValue.bind(this,'set_end_meal')}
															/>
													<span>午結束</span>
												</label>
											</div>
											<div className="radio-inline">
												<label>
													<input type="radio" 
															name="set_end_meal"
															value={3}
															checked={fieldSubData.set_end_meal==3} 
															onChange={this.changeFDValue.bind(this,'set_end_meal')}
															/>
													<span>晚結束</span>
												</label>
											</div>											
										</div>
										{/*---早結束、午結束、晚結束---*/}																				
									</div>
									<div className="form-group">
										<label className="col-xs-1 form-control-label text-xs-right">預計天數</label>
										<div className="col-xs-6">
											<input type="number" 							
											className="form-control"	
											value={fieldSubData.diff_day}
											onChange={this.changeMealDayCount.bind(this)}
											min="0"
											disabled={fieldSubData.product_type!=2 || (this.state.edit_sub_type==2 & fieldSubData.isDailyMealAdd)}/>
										</div>
										<small className="help-inline col-xs-4">系統自動計算</small>
									</div>
									<div className="form-group">
										<label className="col-xs-1 form-control-label text-xs-right">餐別</label>
										<div className="col-xs-6">
										{
											this.state.tryout_array.map(function(itemData,i) {
												var out_check = 							
												<div className="checkbox-inline" key={i}>
													<label>
														<input  type="checkbox" 
																checked={itemData.value}
																onChange={this.onMealChange.bind(this,i)}
														 />
														{itemData.name_c}
													</label>
												</div>;
												return out_check;

											}.bind(this))
										}
										</div>
									</div>									
									<div className="form-group">
										<label className="col-xs-1 form-control-label text-xs-right">特殊排餐</label>
										<div className="col-xs-4">
											<select className="form-control" 
											value={fieldSubData.meal_select_state}
											onChange={this.changeFDValue.bind(this,'meal_select_state')}
											disabled={fieldSubData.product_type!=2 || (this.state.edit_sub_type==2 & fieldSubData.isDailyMealAdd)}>
											<option value="0">無</option>
											<option value="1">基數天排餐</option>
											<option value="2">偶數天排餐</option>
											</select>
										</div>
									</div>
									<div className="form-group">
										<label className="col-xs-1 form-control-label text-xs-right">預計餐數</label>
										<div className="col-xs-2">
											<div className="input-group">
												<span className="input-group-addon" id="meal1-1">早</span>
												<input type="number" 							
												className="form-control"	
												value={fieldSubData.estimate_breakfast}
												onChange={this.changeMealCount.bind(this,'estimate_breakfast')}
												required={fieldSubData.product_type==2 & fieldSubData.meal_id!=null & fieldSubData.meal_id!=undefined & fieldSubData.meal_id!=''}
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
												required={fieldSubData.product_type==2 & fieldSubData.meal_id!=null & fieldSubData.meal_id!=undefined & fieldSubData.meal_id!=''}
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
												required={fieldSubData.product_type==2 & fieldSubData.meal_id!=null & fieldSubData.meal_id!=undefined & fieldSubData.meal_id!=''}
												min="0"/>
											</div>
										</div>
									</div>
									<div className="form-group">
										<label className="col-xs-1 form-control-label text-xs-right">預計點數</label>
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
										<label className="col-xs-1 form-control-label text-xs-right">用餐週期<br />說明</label>
										<div className="col-xs-6">
											<textarea col="30" rows="3" className="form-control"
											value={fieldSubData.meal_memo}
											onChange={this.changeFDValue.bind(this,'meal_memo')}
											maxLength="256"></textarea>
										</div>
									</div>			
									<div className="bg-warning">							
									<div className="form-group">
										<label className="col-xs-1 form-control-label text-xs-right">實際餐數</label>
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
										<label className="col-xs-1 form-control-label text-xs-right">實際點數</label>
										<div className="col-xs-6">
											<input type="number" 							
											className="form-control"	
											value={fieldSubData.real_count}
											onChange={this.changeFDValue.bind(this,'real_count')}
											min="0" disabled/>
										</div>
									</div>
								</div>
								</div>
								</form>
								<div className="panel-footer text-right">
									<button className="btn-primary"
									disabled={this.props.is_close}
									type="submit" form="form2">
										<i className="fa-check"></i> 存檔確認
									</button> { }
									<button type="button" onClick={this.insertSubType}><i className="fa-times"></i> 取消</button>
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
										meal_detail_button=<button className="btn-info btn-sm" onClick={this.setMealSchedule.bind(this,itemData.record_deatil_id)}><i className="fa-search"></i> 查看</button>;
									}
									total+=itemData.subtotal;
									var sub_out_html = 
										<tr key={itemData.record_deatil_id}>
											<td className="text-center">
												<button className="btn-link" type="button" onClick={this.updateSubType.bind(this,itemData.record_deatil_id)}><i className="fa-pencil"></i></button>
												<button className="btn-link text-danger" onClick={this.detailDeleteSubmit.bind(this,itemData.record_deatil_id)} disabled={this.props.is_close}><i className="fa-trash"></i></button>
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
							<tr>
								<th className="col-xs-1 text-center text-danger" colSpan={5}>總計</th>
								<th className="col-xs-1 text-danger" colSpan={2}>{total}</th>
							</tr>
						</tbody>
					</table>
				{/*---產品明細列表end---*/}
				</div>
			);

		return outHtml;
	}
});