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
			country_list:[]
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/Customer'
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
		   	tosMessage(gb_title_from_invalid,'連絡電話2-'+check_tel_2.errMsg,3);
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
	insertType:function(){//未使用
		this.setState({
			edit_type:1,
			fieldData:{customer_type:1,tw_city_1:'桃園市',tw_country_1:'中壢區'},
			gridDetailData:[]
		});
	},
	updateType:function(id){
		jqGet(this.props.apiPathName,{id:id})
		.done(function(data, textStatus, jqXHRdata) {
				this.setState({
					edit_type:2,
					fieldData:data.data
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
			var fieldData = this.state.fieldData;//主檔-客戶資料

			outHtml=(
			<div>
				<ul className="breadcrumb">
					<li><i className={this.props.IconClass}></i> {this.props.MenuName}</li>
				</ul>
				<h4 className="title">{this.props.Caption}</h4>		
				<form className="form-horizontal" onSubmit={this.handleSubmit} id="form1">
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
						<div className="col-xs-1 pull-right">
							<button type="button" onClick={this.noneType}><i className="fa-times"></i> 回前頁</button>
						</div>	
					</div>
				</form>
				{/*---生產紀錄版面---*/}
				<GirdSubForm 
				main_id={fieldData.customer_id} 
				customer_type={fieldData.customer_type} 
				fiedlData={fieldData} />

			</div>
			);
		}else{
			outHtml=(<span>No Page</span>);
		}

		return outHtml;
	}
});

//次表單
var GirdSubForm = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return {
			gridData:{rows:[],page:1},
			gridDetailData:[],//生產紀錄list
			fieldDetailData:{},
			searchData:{title:null},
			detail_edit_type:0,//生產紀錄edit
			checkAll:false,
			mealid_list:[],
			isShowCustomerBornEdit:false,//控制生產紀錄編輯視窗顯示
			isShowMealidSelect:false//控制選取用餐編號視窗顯示
		};  
	},
	getDefaultProps:function(){
		return{	
			fddName:'fieldDetailData',
			gdName:'searchData',
			apiSubPathName:gb_approot+'api/CustomerBorn'
		};
	},	
	componentDidMount:function(){
		this.queryGridDetailData(1);
		console.log(this.props.main_id);
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
	detailHandleSubmit:function(e){//新增及修改 生產編輯
		e.preventDefault();

			//檢查電話格式
		   var check_tel_1=checkTelReg(this.state.fieldDetailData['tel_1']);
		   var check_tel_2=checkTelReg(this.state.fieldDetailData['tel_2']);
		   if(!check_tel_1.result){
		   	tosMessage(gb_title_from_invalid,'連絡電話1-'+check_tel_1.errMsg,3);
		   	return;
		   }
		   if(!check_tel_2.result){
		   	tosMessage(gb_title_from_invalid,'連絡電話2-'+check_tel_2.errMsg,3);
		   	return;
		   }
		   //檢查身分證字號
		   if(!checkTwID(this.state.fieldDetailData['sno'])){
		   	tosMessage(gb_title_from_invalid,'身分證字號格式錯誤!!',3);
		   	return;
		   }
		   //檢查地址
		   	if(
				this.state.fieldDetailData['tw_city_1'] == undefined || this.state.fieldDetailData['tw_city_1'] == '' ||
				this.state.fieldDetailData['tw_country_1'] == undefined || this.state.fieldDetailData['tw_country_1'] == '' ||
				this.state.fieldDetailData['tw_address_1'] == undefined || this.state.fieldDetailData['tw_address_1'] == ''
				){

				tosMessage(gb_title_from_invalid,'送餐地址需填寫完整',3);
				return;
			}

		if(this.state.detail_edit_type==1){
			jqPost(this.props.apiSubPathName,this.state.fieldDetailData)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					if(data.message!=null){
						tosMessage(null,'新增完成'+data.message,1);
					}else{
						tosMessage(null,'新增完成',1);
					}
					this.updateDetailType(data.id);
				}else{
					tosMessage(null,data.message,3);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
		}		
		else if(this.state.detail_edit_type==2){
			jqPut(this.props.apiSubPathName,this.state.fieldDetailData)
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
	gridDetailData:function(page){

		var parms = {
			main_id:this.props.main_id
		};

		$.extend(parms, this.state.searchData);

		return jqGet(this.props.apiSubPathName,parms);
	},
	queryGridDetailData:function(page){
		this.gridDetailData(page)
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({gridDetailData:data});
		}.bind(this))
		.fail(function(jqXHR, textStatus, errorThrown) {
			showAjaxError(errorThrown);
		});
	},
	insertDetailType:function(){//新增明細檔
		var fiedlData=this.props.fiedlData;
		if(this.props.customer_type==1)
		{//自有客戶新增要自動帶資料
			this.setState({
				detail_edit_type:1,
				fieldDetailData:{
					customer_id:fiedlData.customer_id,
					mom_name:fiedlData.customer_name,
					sno:fiedlData.sno,
					birthday:fiedlData.birthday,
					tel_1:fiedlData.tel_1,
					tel_2:fiedlData.tel_2,
					tw_zip_1:fiedlData.tw_zip_1,
					tw_zip_2:fiedlData.tw_zip_2,
					tw_city_1:fiedlData.tw_city_1,
					tw_city_2:fiedlData.tw_city_2,
					tw_country_1:fiedlData.tw_country_1,
					tw_country_2:fiedlData.tw_country_2,
					tw_address_1:fiedlData.tw_address_1,
					tw_address_2:fiedlData.tw_address_2,
					born_type:1
				}
			});
		}else{
			this.setState({
				detail_edit_type:1,
				fieldDetailData:{customer_id:fiedlData.customer_id,born_type:1}
			});
		}
	},
	updateDetailType:function(id){//修改明細檔
		jqGet(this.props.apiSubPathName,{id:id})
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({detail_edit_type:2,fieldDetailData:data.data});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	viewDetailType:function(id){//檢視明細檔
		jqGet(this.props.apiSubPathName,{id:id})
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({detail_edit_type:3,fieldDetailData:data.data});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	changeFDDValue:function(name,e){
		this.setInputValue(this.props.fddName,name,e);
	},
	changeGDValue:function(name,e){
		this.setInputValue(this.props.gdName,name,e);
	},
	setFDValue:function(fieldName,value){
		//此function提供給次元件調用，所以要以屬性往下傳。
		var obj = this.state[this.props.fddName];
		obj[fieldName] = value;
		this.setState({fieldDetailData:obj});
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
		this.setState({fieldDetailData:obj});
	},
	addDetail:function(e){
		//新增生產紀錄
		this.insertDetailType();
		this.setState({isShowCustomerBornEdit:true});
	},
	editDetail:function(detail_id,e){
		//修改生產紀錄
		this.updateDetailType(detail_id);
		this.setState({isShowCustomerBornEdit:true});
	},
	viewDetail:function(detail_id,e){
		//修改生產紀錄
		this.viewDetailType(detail_id);
		this.setState({isShowCustomerBornEdit:true});
	},
	deleteDetail:function(detail_id,e){

		if(!confirm('確定是否刪除?')){
			return;
		}

		jqDelete(this.props.apiSubPathName + '?ids=' + detail_id,{})			
		.done(function(data, textStatus, jqXHRdata) {
			if(data.result){
				tosMessage(null,'刪除完成',1);
				this.queryGridDetailData(0);
			}else{
				tosMessage(null,data.message,3);
			}
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	closeEditDetail:function(){
		//關閉生產紀錄視窗並更新list
		this.gridDetailData(0)
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({isShowCustomerBornEdit:false,detail_edit_type:0,gridDetailData:data});
		}.bind(this))
		.fail(function(jqXHR, textStatus, errorThrown) {
			showAjaxError(errorThrown);
		});
		//檢查mealID
		var fDData = this.state.fieldDetailData;
		jqPost(gb_approot + 'api/GetAction/CheckMealID',{born_id:fDData.born_id,meal_id:fDData.meal_id})
		.done(function(data, textStatus, jqXHRdata) {
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			//showAjaxError(errorThrown);
		});	

	},
	queryAllMealID:function(){//選取用餐編號-取得未使用的用餐編號List
		jqGet(gb_approot + 'api/GetAction/GetAllMealID',{})
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({mealid_list:data});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});		
	},
	showSelectMealid:function(){
		this.queryAllMealID();
		this.setState({isShowMealidSelect:true});
	},
	closeSelectMealid:function(){
		this.setState({isShowMealidSelect:false});
	},
	selectMealid:function(meal_id){
		var fieldDetailData = this.state.fieldDetailData;//選取後變更mealid
		jqPost(gb_approot + 'api/GetAction/ChangeMealIDState',{old_id:fieldDetailData.meal_id,new_id:meal_id})
		.done(function(data, textStatus, jqXHRdata) {
			if(!data.result){
				alert(data.message);
			}
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			//showAjaxError(errorThrown);
		});

		fieldDetailData.meal_id=meal_id;
		this.setState({isShowMealidSelect:false,fieldDetailData:fieldDetailData});
	},
	render: function() {
		var outHtml = null;
		var fieldDetailData = this.state.fieldDetailData;//明細檔-客戶生產資料

		var MdoaleditCustomerBorn=ReactBootstrap.Modal;//啟用生產編輯的視窗內容
		var MdoalMealidSelect=ReactBootstrap.Modal;//啟用選取用餐編號的視窗內容
			
		var error_out_html=null;//如果生產資料有對應的產品銷售主檔就出現警告訊息
		if(fieldDetailData.have_record){
			error_out_html=<div className="alert alert-warning"><p>已有對應的產品銷售資料，<strong className="text-danger">不可隨意變更用餐編號</strong> 。</p></div>;
		}


		var customer_born_out_html=null;//存放生產編輯的視窗內容
		var mealid_select_out_html=null;//存放選取用餐編號的視窗內容
			if(this.state.isShowMealidSelect){
				mealid_select_out_html = 					
					<MdoalMealidSelect bsSize="xsmall" onRequestHide={this.closeSelectMealid}>
							<div className="modal-header light">
								<div className="pull-right">
									<button onClick={this.closeSelectMealid} type="button"><i className="fa-times"></i></button>
								</div>
								<h4 className="modal-title">請選擇用餐編號 { } (僅列出未使用的用餐編號)</h4>
							</div>
							<div className="modal-body">
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
		if(this.state.isShowCustomerBornEdit){
			customer_born_out_html = 					
					<MdoaleditCustomerBorn bsSize="large" title="編輯  生產紀錄" onRequestHide={this.closeEditDetail}>
						{/*<div className="modal-header light">
							<div className="pull-right">
								<button onClick={this.closeEditDetail} type="button"><i className="fa-times"></i></button>
							</div>
							<h4 className="modal-title">編輯 { } 生產紀錄</h4>
						</div>*/}
						<div className="modal-body">
								{mealid_select_out_html}
							<form className="form-horizontal"  onSubmit={this.detailHandleSubmit} id="form2">
									{error_out_html}
									<div className="form-group">
										<label className="col-xs-2 control-label text-danger">用餐編號</label>
										<div className="col-xs-3">
											<input type="text" 
											className="form-control"	
											value={fieldDetailData.meal_id}
											onChange={this.changeFDDValue.bind(this,'meal_id')}
											required
											disabled={this.state.detail_edit_type==3 || true} />
										</div>
										<div className="col-xs-1">
											<button type="button" 
											onClick={this.showSelectMealid}
											disabled={this.state.detail_edit_type==3 || fieldDetailData.have_record}>...</button>
										</div>
										<label className="col-xs-2 control-label text-danger">媽媽姓名</label>
										<div className="col-xs-4">
											<input type="text" 							
											className="form-control"	
											value={fieldDetailData.mom_name}
											onChange={this.changeFDDValue.bind(this,'mom_name')}
											maxLength="64"
											required 
											disabled={this.state.detail_edit_type==3}/>
										</div>
									</div>

									<div className="form-group">
										<label className="col-xs-2 control-label">連絡電話1</label>
										<div className="col-xs-4">
											<input type="tel" 
											className="form-control"	
											value={fieldDetailData.tel_1}
											onChange={this.changeFDDValue.bind(this,'tel_1')}
											maxLength="16"
											disabled={this.state.detail_edit_type==3} />
										</div>
										<label className="col-xs-2 control-label">連絡電話2</label>
										<div className="col-xs-4">
											<input type="tel" 
											className="form-control"	
											value={fieldDetailData.tel_2}
											onChange={this.changeFDDValue.bind(this,'tel_2')}
											maxLength="16"
											disabled={this.state.detail_edit_type==3} />
										</div>
									</div>

									<div className="form-group">
										<label className="col-xs-2 control-label">身分證字號</label>
										<div className="col-xs-4">
											<input type="text" 
											className="form-control"	
											value={fieldDetailData.sno}
											onChange={this.changeFDDValue.bind(this,'sno')}
											maxLength="10"
											disabled={this.state.detail_edit_type==3} />
										</div>
										<label className="col-xs-2 control-label">生日</label>
										<div className="col-xs-4">
											<span className="has-feedback">
												<InputDate id="birthday" 
												onChange={this.changeFDDValue} 
												field_name="birthday" 
												value={fieldDetailData.birthday}
												disabled={this.state.detail_edit_type==3} />
											</span>
										</div>
									</div>

									<div className="form-group">
										<label className="col-xs-2 control-label text-danger">送餐地址</label>
										<TwAddress ver={1}
										onChange={this.changeFDDValue}
										setFDValue={this.setFDValue}
										zip_value={fieldDetailData.tw_zip_1} 
										city_value={fieldDetailData.tw_city_1} 
										country_value={fieldDetailData.tw_country_1}
										address_value={fieldDetailData.tw_address_1}
										zip_field="tw_zip_1"
										city_field="tw_city_1"
										country_field="tw_country_1"
										address_field="tw_address_1"
										disabled={this.state.detail_edit_type==3}/>
									</div>

									<div className="form-group">
										<label className="col-xs-2 control-label">備用地址</label>
										<TwAddress ver={1}
										onChange={this.changeFDDValue}
										setFDValue={this.setFDValue}
										zip_value={fieldDetailData.tw_zip_2} 
										city_value={fieldDetailData.tw_city_2} 
										country_value={fieldDetailData.tw_country_2}
										address_value={fieldDetailData.tw_address_2}
										zip_field="tw_zip_2"
										city_field="tw_city_2"
										country_field="tw_country_2"
										address_field="tw_address_2"
										disabled={this.state.detail_edit_type==3}/>
									</div>
									
									<div className="form-group">
										<label className="col-xs-2 control-label">第幾胎</label>
										<div className="col-xs-4">
											<input type="text" 
											className="form-control"	
											value={fieldDetailData.born_frequency}
											onChange={this.changeFDDValue.bind(this,'born_frequency')}
											maxLength="5"
											disabled={this.state.detail_edit_type==3} />
										</div>
										<label className="col-xs-2 control-label">寶寶性別</label>
										<div className="col-xs-4">
											<select className="form-control" 
											value={fieldDetailData.baby_sex}
											onChange={this.changeFDDValue.bind(this,'baby_sex')}
											disabled={this.state.detail_edit_type==3}>
											{
												CommData.SexType.map(function(itemData,i) {
													return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
												})
											}
											</select>
										</div>
									</div>

									<div className="form-group">
										<label className="col-xs-2 control-label text-danger">生產日期</label>
										<div className="col-xs-4">
											<span className="has-feedback">
												<InputDate id="born_day" 
												onChange={this.changeFDDValue} 
												field_name="born_day" 
												value={fieldDetailData.born_day}
												required={true}
												disabled={this.state.detail_edit_type==3} />
											</span>
										</div>
										<label className="col-xs-2 control-label">預產期</label>
										<div className="col-xs-4">
											<span className="has-feedback">
												<InputDate id="expected_born_day" 
												onChange={this.changeFDDValue} 
												field_name="expected_born_day" 
												value={fieldDetailData.expected_born_day}
												disabled={this.state.detail_edit_type==3} />
											</span>
										</div>
									</div>

									<div className="form-group">
										<label className="col-xs-2 control-label">生產方式</label>
										<div className="col-xs-2">
											<select className="form-control" 
											value={fieldDetailData.born_type}
											onChange={this.changeFDDValue.bind(this,'born_type')}
											disabled={this.state.detail_edit_type==3}>
											{
												CommData.BornType.map(function(itemData,i) {
													return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
												})
											}
											</select>
										</div>
										<label className="col-xs-2 control-label">產檢醫院</label>
										<div className="col-xs-2">
											<input type="text" 
											className="form-control"	
											value={fieldDetailData.checkup_hospital}
											onChange={this.changeFDDValue.bind(this,'checkup_hospital')}
											maxLength="50"
											disabled={this.state.detail_edit_type==3} />
										</div>
										<label className="col-xs-2 control-label">生產醫院</label>
										<div className="col-xs-2">
											<input type="text" 
											className="form-control"	
											value={fieldDetailData.born_hospital}
											onChange={this.changeFDDValue.bind(this,'born_hospital')}
											maxLength="50"
											disabled={this.state.detail_edit_type==3} />
										</div>
									</div>

									<div className="form-group">
										<label className="col-xs-2 control-label">備註</label>
										<div className="col-xs-10">
											<textarea col="30" row="2" className="form-control"
											value={fieldDetailData.memo}
											onChange={this.changeFDDValue.bind(this,'memo')}
											maxLength="256"
											disabled={this.state.detail_edit_type==3}></textarea>
										</div>
									</div>

						<div className="modal-footer">
							<div className="col-xs-4 col-xs-offset-3">
		        				<button  type="submit" form="form2" className="btn-primary"><i className="fa-check"></i> 儲存</button>
		       					<button className="col-xs-offset-1" type="button" onClick={this.closeEditDetail}><i className="fa-times"></i>關閉</button>
		   					</div>
						</div>

							</form>

						</div>
				</MdoaleditCustomerBorn>;
			}

			outHtml=(
				<div>
					{customer_born_out_html}
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
								this.state.gridDetailData.map(function(itemData,i) {
									var out_sub_button=null;
									if(itemData.is_close){//結案後僅能檢視生產紀錄
										out_sub_button=											
										    <td className="text-center">
												<button className="btn-link btn-lg" type="button" onClick={this.viewDetail.bind(this,itemData.born_id)}><i className="fa-search-plus"></i></button>
											</td>;
									}else{
										out_sub_button=											
										    <td className="text-center">
												<button className="btn-link btn-lg" type="button" onClick={this.editDetail.bind(this,itemData.born_id)}><i className="fa-pencil"></i></button>
												<button className="btn-link btn-lg text-danger" type="button" onClick={this.deleteDetail.bind(this,itemData.born_id)}><i className="fa-trash-o"></i></button>
											</td>;
									}
									var out_sub_html = 
										<tr key={i}>
											{out_sub_button}
											<td>{moment(itemData.born_day).format('YYYY/MM/DD')}</td>
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
			);
		return outHtml;
	}
});