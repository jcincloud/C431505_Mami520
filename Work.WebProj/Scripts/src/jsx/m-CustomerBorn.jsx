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
					{/*<td className="text-center"><GridCheckDel iKey={this.props.ikey} chd={this.props.itemData.check_del} delCheck={this.delCheck} /></td>*/}
					<td className="text-center"><GridButtonModify modify={this.modify}/></td>
					<td>{this.props.itemData.customer_sn}</td>
					<td>{this.props.itemData.customer_name}</td>
					<td><StateForGrid stateData={CommData.CustomerType} id={this.props.itemData.customer_type} /></td>
					<td>{this.props.itemData.tw_city_1+this.props.itemData.tw_country_1+this.props.itemData.tw_address_1}</td>
					<td>{this.props.itemData.born_times}</td>
					<td>{this.props.itemData.tel_1}</td>
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
			country_list:[],
			details:[]
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/Customer',
			apiSubPathName:gb_approot+'api/CustomerBorn'
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

			//檢查電話格式
		   var check_tel_1=checkTelReg(this.state.fieldData['tel_1']);
		   var check_tel_2=checkTelReg(this.state.fieldData['tel_2']);
		   if(!check_tel_1.result){
		   	tosMessage(gb_title_from_invalid,'連絡電話1-'+check_tel_1.errMsg,3);
		   	return;
		   }
		   if(!check_tel_2.result){
		   	tosMessage(gb_title_from_invalid,'連絡電話1-'+check_tel_2.errMsg,3);
		   	return;
		   }

		   //檢查身分證字號
		   if(!checkTwID(this.state.fieldData['sno'])){
		   	tosMessage(gb_title_from_invalid,'身分證字號格式錯誤!!',3);
		   	return;
		   }
		   //檢查地址
		   	if(
				this.state.fieldData['tw_city_1'] == undefined || this.state.fieldData['tw_city_1'] == '' ||
				this.state.fieldData['tw_country_1'] == undefined || this.state.fieldData['tw_country_1'] == '' ||
				this.state.fieldData['tw_address_1'] == undefined || this.state.fieldData['tw_address_1'] == ''
				){

				tosMessage(gb_title_from_invalid,'送餐地址需填寫完整',3);
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
				ids.push('ids='+this.state.gridData.rows[i].customer_id);
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
		this.setState({
			edit_type:1,
			fieldData:{customer_type:1,tw_city_1:'桃園市',tw_country_1:'中壢區'},
			details:[]
		});
	},
	updateType:function(id){
		jqGet(this.props.apiPathName,{id:id})
		.done(function(data, textStatus, jqXHRdata) {

			jqGet(this.props.apiSubPathName,{main_id:id})
			.done(function(detail_data, textStatus, jqXHRdata) {
				this.setState({
					edit_type:2,
					fieldData:data.data,
					details:detail_data
				});
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});

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
	onCityChange:function(e){

		this.listCountry(e.target.value);
		var obj = this.state.searchData;
		obj['city'] = e.target.value;
		this.setState({searchData:obj});
	},
	onCountryChange:function(e){
		var obj = this.state.searchData;
		obj['country'] = e.target.value;
		this.setState({searchData:obj});
	},
	listCountry:function(value){
		for(var i in CommData.twDistrict){
			var item = CommData.twDistrict[i];
			if(item.city==value){
				this.setState({country_list:item.contain});
				break;
			}
		}
	},
	onCustomerTypeChange:function(e){
		var obj = this.state.searchData;
		obj['customer_type'] = e.target.value;
		this.setState({searchData:obj});
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

										<label className="sr-only">客戶名稱</label> { }
										<input type="text" className="form-control" 
										value={searchData.customer_name}
										onChange={this.changeGDValue.bind(this,'customer_name')}
										placeholder="客戶名稱..." /> { }

										<label className="sr-only">tel</label> { }
										<input type="text" className="form-control" 
										value={searchData.tel}
										onChange={this.changeGDValue.bind(this,'tel')}
										placeholder="電話..." /> { }

										<label className="sr-only">客戶分類</label> { }
										<select className="form-control" 
												value={searchData.customer_type}
												onChange={this.onCustomerTypeChange}>
											<option value="">選擇分類</option>
										{
											CommData.CustomerType.map(function(itemData,i) {
												return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
											})
										}
										</select> { }

										<label className="sr-only">縣市</label> { }
										<select className="form-control" 
											value={searchData.city}
											onChange={this.onCityChange}
										>
										<option value="">選擇縣市</option>
										{
											CommData.twDistrict.map(function(itemData,i) {
												return <option key={itemData.city} value={itemData.city}>{itemData.city}</option>;
											})
										}
										</select> { }

										<label className="sr-only">鄉鎮市區</label> { }
										<select className="form-control" 
												value={searchData.country}
												onChange={this.onCountryChange}>
											<option value="">選擇鄉鎮市區</option>
											{
												this.state.country_list.map(function(itemData,i) {
													return <option key={itemData.county} value={itemData.county}>{itemData.county}</option>;
												})
											}
										</select>
										<button className="btn-primary" type="submit"><i className="fa-search"></i>{ }搜尋</button>
									</div>
								</div>
							</div>
						</div>
						<table>
							<thead>
								<tr>
									{/*<th className="col-xs-1 text-center">
										<label className="cbox">
											<input type="checkbox" checked={this.state.checkAll} onChange={this.checkAll} />
											<i className="fa-check"></i>
										</label>
									</th>*/}
									<th className="col-xs-1 text-center">修改</th>
									<th className="col-xs-1">編號</th>
									<th className="col-xs-2">客戶名稱</th>
									<th className="col-xs-1">客戶分類</th>
									<th className="col-xs-4">送餐地址</th>
									<th className="col-xs-1">生產紀錄筆數</th>
									<th className="col-xs-1">電話1</th>
								</tr>
							</thead>
							<tbody>
								{
								this.state.gridData.rows.map(function(itemData,i) {
								return <GridRow 
								key={i}
								ikey={i}
								primKey={itemData.customer_id} 
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
					showAdd={false}
					showDelete={false}
					/>
				</form>
			</div>
			);
		}
		else if(this.state.edit_type==1 || this.state.edit_type==2)
		{
			var fieldData = this.state.fieldData;

			outHtml=(
			<div>
				<ul className="breadcrumb">
					<li><i className={this.props.IconClass}></i> {this.props.MenuName}</li>
				</ul>
				<h4 className="title">{this.props.Caption}</h4>		
				<form className="form-horizontal" onSubmit={this.handleSubmit}>
					<div className="form-group">
						<label className="col-xs-1 control-label">客戶編號</label>
						<div className="col-xs-2">
							<input type="text" 
							className="form-control"	
							value={fieldData.customer_sn}
							onChange={this.changeFDValue.bind(this,'customer_sn')}
							placeholder="系統自動產生"
							disabled={true}
							 />
						</div>

						<label className="col-xs-1 control-label">客戶名稱</label>
						<div className="col-xs-2">
							<input type="text" 							
							className="form-control"	
							value={fieldData.customer_name}
							onChange={this.changeFDValue.bind(this,'customer_name')}
							maxLength="64"
							required 
							disabled={true}/>
						</div>

						<label className="col-xs-1 control-label">客戶類別</label>
						<div className="col-xs-2">
							<select className="form-control" 
							value={fieldData.customer_type}
							onChange={this.changeFDValue.bind(this,'customer_type')}
							disabled={true}>
							{
								CommData.CustomerType.map(function(itemData,i) {
									return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
								})
							}
							</select>
						</div>
					</div>		
				</form>
				{/*---生產紀錄版面start---*/}
				<div>
					<hr className="expanded" />
					<h4 className="title">
						生產紀錄 { }
						<button type="button" onClick={this.addDetail} className="btn-link text-success"><i className="fa-plus-circle"></i> 新增生產紀錄</button>
					</h4>
					<table>
						<tbody>
							<tr>
								<th className="col-xs-1 text-center">編輯</th>
								<th className="col-xs-1">生產日期</th>
								<th className="col-xs-1">用餐編號</th>
								<th className="col-xs-1">媽媽姓名</th>
								<th className="col-xs-1">寶寶性別</th>
								<th className="col-xs-1">生產方式</th>
								<th className="col-xs-1">是否結案</th>
							</tr>
							{
								this.state.details.map(function(itemData,i) {
									var out_sub_button=null;
									if(itemData.is_close){//結案後僅能檢視生產紀錄
										out_sub_button=											
										    <td className="text-center">
												<button className="btn-link btn-lg" type="button"><i className="fa-search-plus"></i></button>
											</td>;
									}else{
										out_sub_button=											
										    <td className="text-center">
												<button className="btn-link btn-lg" type="button"><i className="fa-pencil"></i></button>
												<button className="btn-link btn-lg text-danger"><i className="fa-trash-o"></i></button>
											</td>;
									}
									var out_sub_html = 
										<tr key={i}>
											{out_sub_button}
											<td>{itemData.born_day}</td>
											<td>{itemData.meal_id}</td>
											<td>{itemData.mom_name}</td>
											<td><StateForGrid stateData={CommData.SexType} id={itemData.baby_sex} /></td>
											<td><StateForGrid stateData={CommData.BornType} id={itemData.born_type} /></td>
											<td>{itemData.is_close? <span className="label label-primary">結案</span>:<span className="label label-danger">未結案</span>}</td>			
										</tr>;
									return out_sub_html;
								}.bind(this))
							}
						</tbody>
					</table>
				</div>
				{/*---生產紀錄版面end---*/}
			</div>
			);
		}else{
			outHtml=(<span>No Page</span>);
		}

		return outHtml;
	}
});