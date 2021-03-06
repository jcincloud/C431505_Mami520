﻿var GridRow = React.createClass({
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
					<td>{this.props.itemData.meal_id}</td>
					<td>{this.props.itemData.name}</td>
					<td>{this.props.itemData.tel_1}</td>
					<td>{this.props.itemData.tel_2}</td>				
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
			searchData:{name:null},
			edit_type:0,
			checkAll:false,
			category:[],
			isShowMealidSelect:false,
			mealid_list:[]
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldData',
			gdName:'searchData',
			apiPathName: gb_approot + 'api/CustomerNeed',
			initPathName: gb_approot + 'Active/Food/constitute_food_Init'
		};
	},	
	componentDidMount:function(){
		this.queryGridData(1);
		//this.getAjaxInitData();//載入init資料
	},
	shouldComponentUpdate:function(nextProps,nextState){
		return true;
	},
	getAjaxInitData:function(){
		jqGet(this.props.initPathName)
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({category:data.options_category});
			//載入下拉是選單內容
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	handleSubmit: function(e) {

		e.preventDefault();
		var fieldData=this.state.fieldData;
		//if(fieldData.customer_id==null || fieldData.born_id==null || fieldData.meal_id==null){
		if(fieldData.customer_id==null || fieldData.born_id==null){
			tosMessage(gb_title_from_invalid,'請選取客戶生產紀錄在儲存!',3);
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
			    ids.push('ids=' + this.state.gridData.rows[i].customer_need_id);
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
		this.setState({edit_type:1,fieldData:{born_id:null,
											  customer_need_id:null,
											  customer_id:null,
											  meal_id:null}});
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
	onHideChange:function(e){
		var obj = this.state.searchData;
		obj['i_Hide'] = e.target.value;
		this.setState({searchData:obj});
	},
	onMealChange:function(name,e){
		var obj = this.state.fieldData;
		if(e.target.checked){
			obj[name]=true;
			
		}else{
			obj[name]=false;
		}
		this.setState({fieldData:obj});
	},
	queryAllMealID:function(){//選取用餐編號-取得未結案客戶生產的用餐編號List
		//mealid 列表 要過濾目前已選取的資料
		var parms = {
			old_id:this.state.fieldData.born_id,
			main_id:this.state.fieldData.customer_need_id
		};

		jqGet(gb_approot + 'api/GetAction/GetNotCloseMealID',parms)
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
	selectMealid:function(customer_id,born_id,meal_id){
		jqGet(gb_approot + 'api/GetAction/GetBornData',{born_id:born_id})
		.done(function(data, textStatus, jqXHRdata) {
			var fieldData = this.state.fieldData;//選取後變更customer_id,born_id,mealid
			fieldData.customer_id=customer_id;
			fieldData.born_id=born_id;
			fieldData.meal_id=meal_id;

			//用餐編號改變下方帶入的資料要一起變更
			fieldData.name=data.mom_name;
			fieldData.tel_1=data.tel_1;
			fieldData.tel_2=data.tel_2;
			fieldData.tw_zip_1=data.tw_zip_1;
			fieldData.tw_city_1=data.tw_city_1;
			fieldData.tw_country_1=data.tw_country_1;
			fieldData.tw_address_1=data.tw_address_1;

			this.setState({isShowMealidSelect:false,fieldData:fieldData});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			//showAjaxError(errorThrown);
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
                <h3 className="h3">{this.props.Caption}</h3>

				<form onSubmit={this.handleSearch}>
					
						<div className="table-header">
							<div className="table-filter">
								<div className="form-inline form-sm">
									<div className="form-group">

										<label className="text-sm">媽媽姓名</label> { }
										<input type="text" className="form-control" 
										value={searchData.name}
										onChange={this.changeGDValue.bind(this,'name')}
										placeholder="媽媽姓名..." /> { }

										<label className="text-sm">用餐編號</label> { }
										<input type="text" className="form-control" 
										value={searchData.meal_id}
										onChange={this.changeGDValue.bind(this,'meal_id')}
										placeholder="用餐編號..." /> { }

										<button className="btn btn-secondary btn-sm" type="submit"><i className="fa-search"></i>{ }搜尋</button>
									</div>
								</div>
							</div>
						</div>
						<table className="table table-sm table-bordered table-striped">
							<thead>
								<tr>
									<th style={{"width":"7%;"}} className="text-xs-center">
										<label className="c-input c-checkbox">
											<input type="checkbox" checked={this.state.checkAll} onChange={this.checkAll} />
											<span className="c-indicator"></span>
										</label>
									</th>
									<th style={{"width":"7%;"}} className="text-xs-center">修改</th>
									<th style={{"width":"16%;"}}>用餐編號</th>
									<th style={{"width":"20%;"}}>媽媽姓名</th>
									<th style={{"width":"25%;"}}>電話1</th>
									<th style={{"width":"25%;"}}>電話2</th>
								</tr>
							</thead>
							<tbody>
								{
								this.state.gridData.rows.map(function(itemData,i) {
								return <GridRow 
								key={i}
								ikey={i}
								primKey={itemData.customer_need_id} 
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

			var MdoalMealidSelect=ReactBootstrap.Modal;//啟用選取用餐編號的視窗內容
			var mealid_select_out_html=null;//存放選取用餐編號的視窗內容
			if(this.state.isShowMealidSelect){
				mealid_select_out_html = 					
					<MdoalMealidSelect bsSize="xsmall" animation={false} onRequestHide={this.closeSelectMealid}>
                        <div className="modal-header">
                            <button className="close" onClick={this.closeSelectMealid}>&times;</button>
                            <h5 className="modal-title text-secondary">選擇產品</h5>
                        </div>
							<div className="modal-body">
								<div className="alert alert-warning"><p>此列表僅列出<strong className="text-danger">未結案且無客戶需求</strong>的客戶生產紀錄。</p></div>
								<table className="table table-sm table-bordered table-striped">
									<tbody>
										<tr>
											<th style={{"width":"15%;"}} className="text-xs-center">選擇</th>
											<th style={{"width":"25%;"}}>用餐編號</th>
											<th style={{"width":"30%;"}}>媽媽姓名</th>
											<th style={{"width":"30%;"}}>第幾胎</th>
										</tr>
										{
											this.state.mealid_list.map(function(itemData,i) {
												
												var mealid_out_html = 
													<tr key={itemData.born_id}>
														<td className="text-xs-center"><input type="checkbox" onClick={this.selectMealid.bind(this,itemData.customer_id,itemData.born_id,itemData.meal_id)} /></td>
														<td>{itemData.meal_id}</td>
														<td>{itemData.mom_name}</td>
														<td>{itemData.born_frequency}</td>
													</tr>;
												return mealid_out_html;
											}.bind(this))
										}
									</tbody>
								</table>
							</div>
							<div className="modal-footer form-action">
								<button className="btn btn-sm btn-blue-grey" onClick={this.closeSelectMealid}><i className="fa-times"></i> { } 關閉</button>
							</div>
					</MdoalMealidSelect>;
			}
			var map_out_html=null;
			if(this.state.edit_type==2){//只在修改時顯示下方對應程式
				map_out_html=(<GirdCofE main_id={fieldData.customer_need_id} />);
			}else{
				map_out_html=(
					<div>
						<hr className="lg" />
						<h3 className="h3">飲食需求設定</h3>
						<div className="alert alert-warning">
							請先按上方的 <strong>存檔確認</strong>，再進行設定。
						</div>
					</div>
					);
			}

			outHtml=(
			<div>
				{mealid_select_out_html}
                <h3 className="h3">{this.props.Caption}<small className="sub"><i className="fa-angle-double-right"></i> 編輯</small></h3>
                
				<form className="form form-sm" onSubmit={this.handleSubmit}>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 用餐編號</label>
						<div className="col-xs-3">
							<div className="input-group input-group-sm">
								<input type="text" 
								className="form-control"	
								value={fieldData.meal_id}
								onChange={this.changeFDValue.bind(this,'meal_id')}
								required
								disabled={true} />
								<span className="input-group-btn">
									<button className="btn btn-success" type="button" onClick={this.showSelectMealid}>
										<i className="fa-plus"></i>
									</button>
								</span>
							</div>
							<small className="text-muted">請按 <i className="fa-plus"></i> 選取</small>
						</div>
						
					</div>
					<div className="form-group row">
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
							<input type="text" 							
							className="form-control"	
							value={fieldData.tel_1}
							onChange={this.changeFDValue.bind(this,'tel_1')}
							maxLength="15"
							required
							disabled />
						</div>
					</div>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">連絡電話2</label>
						<div className="col-xs-3">
							<input type="text" 							
							className="form-control"
							value={fieldData.tel_2}
							onChange={this.changeFDValue.bind(this,'tel_2')}
							maxLength="15"
							required
							disabled />
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
						<label className="col-xs-1 form-control-label text-xs-right">備註</label>
						<div className="col-xs-8">
							<textarea col="30" row="2" className="form-control"
							value={fieldData.memo}
							onChange={this.changeFDValue.bind(this,'memo')}
							maxLength="256"></textarea>
						</div>
					</div>
					<div className="form-action">
						<button type="submit" className="btn btn-sm btn-primary col-xs-offset-1" name="btn-1"><i className="fa-check"></i> 存檔確認</button> { }
						<button type="button" className="btn btn-sm btn-blue-grey" onClick={this.noneType}><i className="fa-times"></i> 回前頁</button>
					</div>
				</form>
			{/* 組合菜單對應的基礎元素 */}
				{map_out_html}
			</div>
			);
		}else{
			outHtml=(<span>No Page</span>);
		}

		return outHtml;
	}
});

//主表單
var GirdCofE = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return {
			gridData:{rows:[],page:1},
			fieldData:{},
			searchData:{main_id:this.props.main_id,name:null,is_correspond:null,is_breakfast:null,is_lunch:null,is_dinner:null},
			edit_type:0,
			checkAll:false,
			grid_right_element:[],
			grid_left_element:{rows:[]},
			category_element:[],
			LeftGridPageIndex:1//左邊元素換頁用參數
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/Product',
			initPathName:gb_approot+'Active/Food/element_food_Init'

		};
	},	
	componentDidMount:function(){
		//this.getAjaxInitData();//載入init資料
		this.queryLeftElement();
		this.queryRightElement();
	},
	getAjaxInitData:function(){
		jqGet(this.props.initPathName)
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({category_element:data.options_category});
			//載入下拉是選單內容
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	queryLeftElement:function(){
		var parms = {
			page:this.state.LeftGridPageIndex
		};

		$.extend(parms, this.state.searchData);
			jqGet(gb_approot + 'api/GetAction/GetLeftDietaryNeed',parms)
			.done(function(data, textStatus, jqXHRdata) {
				this.setState({grid_left_element:data});
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
	},	
	queryRightElement:function(){
			jqGet(gb_approot + 'api/GetAction/GetRightDietaryNeed',{main_id:this.props.main_id})
			.done(function(data, textStatus, jqXHRdata) {
				this.setState({grid_right_element:data});
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
	},
	queryChangeElementParam:function(name,e){
		var obj = this.state.searchData;
		obj[name] = e.target.value;
		this.setState({searchData:obj});
		this.queryLeftElement();			
	},
	queryMealParam:function(name,e){
		var obj = this.state.searchData;
		if(e.target.checked){
			obj[name]=true;
			
		}else{
			obj[name]=false;
		}
		this.setState({searchData:obj});
		this.queryLeftElement();
	},
	addElement:function(dietary_need_id){
			jqPost(gb_approot + 'api/GetAction/PostCustomerOfDietaryNeed',{customer_need_id:this.props.main_id,dietary_need_id:dietary_need_id})
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					this.queryLeftElement();
					this.queryRightElement();
				}else{
					alert(data.message);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});		
	},
	removeElement:function(dietary_need_id){
			jqDelete(gb_approot + 'api/GetAction/DeleteCustomerOfDietaryNeed',{customer_need_id:this.props.main_id,dietary_need_id:dietary_need_id})
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					this.queryLeftElement();
					this.queryRightElement();
				}else{
					alert(data.message);
				}

			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});	
	},
	Filter:function(value,CName){
		var val="";
		this.state[CName].forEach(function(object, i){
        	if(value==object.val){
  				val=object.Lname;
        	}
    	})
		return val;
	},
	LeftGridPrev:function(){
		if(this.state.LeftGridPageIndex>1){
			this.state.LeftGridPageIndex --;
			this.queryLeftElement();
		}
	},
	LeftGridNext:function() {
		if(this.state.LeftGridPageIndex < this.state.grid_left_element.total){
			this.state.LeftGridPageIndex ++;
			this.queryLeftElement();
		}
	},
	showMealType:function(breakfast,lunch,dinner){
		var val="";
		if(!breakfast & !lunch & !dinner){
			val="無";
		}else{
			if(breakfast){
				val+="早";
			}
			if(lunch){
				val+="午";
			}
			if(dinner){
				val+="晚";
			}
		}

		return val;
	},
	render: function() {
		var outHtml = null;
		var fieldData = {};
		var searchData=this.state.searchData;

		outHtml =(
			<div>
				<hr className="lg" />
				<h3 className="h3">飲食需求設定</h3>
				<div className="row">
					<div className="col-xs-6">
						<div className="table-header">
							<div className="form-inline form-sm">
		                        <div className="form-group">
		                        	<select name="" id="" className="form-control"
		                            onChange={this.queryChangeElementParam.bind(this,'is_correspond')}
									value={searchData.is_correspond}> { }
		                                <option value="">全部</option>
		                                <option value="true">有對應</option>
		                                <option value="false">無對應</option>

		                            </select> { }
		                            <input type="text" className="form-control" placeholder="需求元素名稱"
		                           	value={searchData.name} onChange={this.queryChangeElementParam.bind(this,'name')} />
		                        </div> { }
		                        <div className="form-group">
									<label className="c-input c-checkbox">
										<input type="checkbox" 
												id="is_breakfast"
												checked={searchData.is_breakfast}
												onChange={this.queryMealParam.bind(this,'is_breakfast')}
										/>
										<span className="c-indicator"></span>
										<span className="text-sm">早餐</span>
									</label>
									<label className="c-input c-checkbox">
										<input type="checkbox" 
												id="is_lunch"
												checked={searchData.is_lunch}
												onChange={this.queryMealParam.bind(this,'is_lunch')}
												/>
										<span className="c-indicator"></span>
										<span className="text-sm">午餐</span>
									</label>
									<label className="c-input c-checkbox">
										<input type="checkbox" 
												id="is_dinner"
												checked={searchData.is_dinner}
												onChange={this.queryMealParam.bind(this,'is_dinner')}
												/>
										<span className="c-indicator"></span>
										<span className="text-sm">晚餐</span>
									</label>
		                        </div>
				            </div>
						</div>
						<table className="table table-sm table-bordered table-striped">
							<thead>
								<tr>
									<th>元素對應</th>
									<th>餐別</th>
									<th>需求元素</th>
				                	<th className="text-xs-center">加入</th>
								</tr>
							</thead>
							<tbody>
								{
									this.state.grid_left_element.rows.map(function(itemData,i) {
										var out_sub_html =                     
											<tr key={itemData.dietary_need_id}>
												<td>{itemData.is_correspond ? "有對應":"無對應"}</td>
												<td>{this.showMealType(itemData.is_breakfast,itemData.is_lunch,itemData.is_dinner)}</td>
						                        <td>{itemData.name}</td>
			                        			<td className="text-xs-center">
													<button className="btn btn-link text-success" type="button" onClick={this.addElement.bind(this,itemData.dietary_need_id)}>
														<i className="fa-plus"></i>
													</button>
						                        </td>
											</tr>;
										return out_sub_html;
									}.bind(this))
								}
							</tbody>
        				</table>
						<div className="table-footer">
							<ul className="pager pager-sm list-inline">
								<li><a href="#" onClick={this.LeftGridPrev}><i className="fa-double-arrow-left"></i> 上一頁</a></li>
								<li>{this.state.LeftGridPageIndex +' / ' + this.state.grid_left_element.total}</li>
								<li><a href="#" onClick={this.LeftGridNext}>下一頁 <i className="fa-double-arrow-right"></i></a></li>
							</ul>
						</div>
        			</div>
					<div className="col-xs-6">
						<div className="table-header"><span className="text-secondary">已加入飲食需求：</span></div>
						<table className="table table-sm table-bordered table-striped">
							<thead>
								<tr>
									<th>元素對應</th>
									<th>餐別</th>
									<th>需求元素</th>
				                	<th className="text-xs-center">刪除</th>
								</tr>
							</thead>
							<tbody>
								{
									this.state.grid_right_element.map(function(itemData,i) {
										var out_sub_html =                     
											<tr key={itemData.dietary_need_id}>
												<td>{itemData.is_correspond ? "有對應":"無對應"}</td>
												<td>{this.showMealType(itemData.is_breakfast,itemData.is_lunch,itemData.is_dinner)}</td>
						                        <td>{itemData.name}</td>
			                        			<td className="text-xs-center">
													<button className="btn btn-link text-danger" type="button" onClick={this.removeElement.bind(this,itemData.dietary_need_id)}>
														<i className="fa-times"></i>
													</button>
						                        </td>
											</tr>;
										return out_sub_html;
									}.bind(this))
								}
							</tbody>
        				</table>
        			</div>
				</div>
			</div>

		);

		return outHtml;
	}
});