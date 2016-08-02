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
					<td>{moment(this.props.itemData.day).format('YYYY/MM/DD')}</td>
                    <td><StateForGrid stateData={CommData.MealType} id={this.props.itemData.meal_type} /></td>
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
			category:[]
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldData',
			gdName:'searchData',
			apiPathName: gb_approot + 'api/DailyMenu',
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
			    ids.push('ids=' + this.state.gridData.rows[i].dail_menu_id);
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
		this.setState({edit_type:1,fieldData:{meal_type:1}});
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
	onCategoryChange:function(e){
		var obj = this.state.searchData;
		obj['meal_type'] = e.target.value;
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
                <h3 className="h3">{this.props.Caption}</h3>
				<form onSubmit={this.handleSearch}>
					
						<div className="table-header">
							<div className="table-filter">
								<div className="form-inline form-sm">
									<div className="form-group">

										<label className="text-sm">日期區間</label> { }										
												<InputDate id="start_date" ver={2}
												onChange={this.changeGDValue} 
												field_name="start_date" 
												value={searchData.start_date} /> { }
										<label className="text-sm">~</label> { }
												<InputDate id="end_date" ver={2}
												onChange={this.changeGDValue} 
												field_name="end_date" 
												value={searchData.end_date} /> { }

										<label className="text-sm">餐別</label> { }
										<select className="form-control" 
												value={searchData.meal_type}
												onChange={this.onCategoryChange}>
											<option value="">全部</option>
										{
											CommData.MealType.map(function(itemData,i) {
												return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
											})
										}
										</select> { }
										<button className="btn btn-sm btn-secondary" type="submit"><i className="fa-search"></i>{ }搜尋</button>
									</div>
								</div>
							</div>
						</div>
						<table className="table table-sm table-bordered table-striped">
							<thead>
								<tr>
									<th style={{"width":"10%;"}} className="text-xs-center">
										<label className="c-input c-checkbox">
											<input type="checkbox" checked={this.state.checkAll} onChange={this.checkAll} />
											<span className="c-indicator"></span>
										</label>
									</th>
									<th style={{"width":"10%;"}} className="text-xs-center">修改</th>
									<th style={{"width":"20%;"}}>日期</th>
									<th style={{"width":"60%;"}}>餐別</th>
								</tr>
							</thead>
							<tbody>
								{
								this.state.gridData.rows.map(function(itemData,i) {
								return <GridRow 
								key={i}
								ikey={i}
								primKey={itemData.dail_menu_id} 
								itemData={itemData} 
								delCheck={this.delCheck}
								updateType={this.updateType}
								category={this.state.category}								
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
			var map_out_html=null;
			if(this.state.edit_type==2){//只在修改時顯示下方對應程式
				map_out_html=(<GirdDofC main_id={fieldData.dail_menu_id} main_name={fieldData.meal_type} />);
			}else{
				map_out_html=(
					<div>
						<hr className="lg" />
						<h3 className="h3">每日菜單對應設定</h3>
						<div className="alert alert-warning">請先按上方的 <strong>存檔確認</strong>，再進行設定。</div>
					</div>
					);
			}

			outHtml=(
			<div>
                <h3 className="h3">{this.props.Caption}<small className="sub"><i className="fa-angle-double-right"></i> 編輯</small></h3>
				<form className="form form-sm" onSubmit={this.handleSubmit}>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 選擇日期</label>
						<div className="col-xs-2">
								<InputDate id="day" 
								onChange={this.changeFDValue} 
								field_name="day" 
								value={fieldData.day} />
						</div>
						<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 選擇餐別</label>
						<div className="col-xs-2">
							<select className="form-control" 
							value={fieldData.meal_type}
							onChange={this.changeFDValue.bind(this,'meal_type')}
							required>
							{
								CommData.MealType.map(function(itemData,i) {
									return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
								})
							}
							</select>
						</div>
						<div className="col-xs-6 text-xs-right">
							<button type="submit" className="btn btn-sm btn-primary" name="btn-1"><i className="fa-check"></i> 存檔確認</button> { }
							<button type="button" className="btn btn-sm btn-blue-grey" onClick={this.noneType}><i className="fa-arrow-left"></i> 回前頁</button>
						</div>	
					</div>
				</form>
			{/* 每日菜單對應的組合菜單 */}
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
var GirdDofC = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return {
			gridData:{rows:[],page:1},
			fieldData:{},
			searchData:{main_id:this.props.main_id,name:null,category_id:null},
			edit_type:0,
			checkAll:false,
			grid_right_constitute:[],
			grid_left_constitute:{rows:[]},
			category_element:[],
			LeftGridPageIndex:1//左邊換頁用參數
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/Product',
			initPathName:gb_approot+'Active/Food/constitute_food_Init'

		};
	},	
	componentDidMount:function(){
		this.getAjaxInitData();//載入init資料
		this.queryLeftConstitute();
		this.queryRightConstitute();
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
	queryLeftConstitute:function(){
		var parms = {
			page:this.state.LeftGridPageIndex
		};

		$.extend(parms, this.state.searchData);

			jqGet(gb_approot + 'api/GetAction/GetLeftConstitute',parms)
			.done(function(data, textStatus, jqXHRdata) {
				this.setState({grid_left_constitute:data});
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
	},	
	queryRightConstitute:function(){
			jqGet(gb_approot + 'api/GetAction/GetRightConstitute',{main_id:this.props.main_id})
			.done(function(data, textStatus, jqXHRdata) {
				this.setState({grid_right_constitute:data});
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
	},
	queryChangeConstituteParam:function(name,e){
		var obj = this.state.searchData;
		obj[name] = e.target.value;
		this.setState({searchData:obj});
		this.queryLeftConstitute();			
	},
	addConstitute:function(constitute_id){
			jqPost(gb_approot + 'api/GetAction/PostDailyMenuOfConstitute',{dail_menu_id:this.props.main_id,constitute_id:constitute_id})
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					this.queryLeftConstitute();
					this.queryRightConstitute();
				}else{
					alert(data.message);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});		
	},
	removeConstitute:function(constitute_id){
			jqDelete(gb_approot + 'api/GetAction/DeleteDailyMenuOfConstitute',{dail_menu_id:this.props.main_id,constitute_id:constitute_id})
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					this.queryLeftConstitute();
					this.queryRightConstitute();
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
	FilterCommData:function(value,CName){
		var val="";
		CommData[CName].forEach(function(object, i){
        	if(value==object.id){
  				val=object.label;
        	}
    	})
		return val;
	},
	LeftGridPrev:function(){
		if(this.state.LeftGridPageIndex>1){
			this.state.LeftGridPageIndex --;
			this.queryLeftConstitute();
		}
	},
	LeftGridNext:function() {
		if(this.state.LeftGridPageIndex < this.state.grid_left_constitute.total){
			this.state.LeftGridPageIndex ++;
			this.queryLeftConstitute();
		}
	},
	render: function() {
		var outHtml = null;
		var fieldData = {};
		var searchData=this.state.searchData;

		outHtml =(
			<div>
				<hr className="lg" />
				<h3 className="h3">每日菜單對應設定</h3>
				<div className="row">
					<div className="col-xs-6">
						<div className="table-header">
							<div className="form-inline form-sm">
								<div className="form-group">
									<input type="text" className="form-control" placeholder="搜尋菜色..."
									value={searchData.name} 
									onChange={this.queryChangeConstituteParam.bind(this,'name')} /> { }
									<select name="" id="" className="form-control input-sm"
									onChange={this.queryChangeConstituteParam.bind(this,'category_id')}
									value={searchData.category_id}> { }
										<option value="">分類</option>
										{
											this.state.category_element.map(function(itemData,i) {
												return <option key={i} value={itemData.val}>{itemData.Lname}</option>;
											})
										}
									</select> { }
				                </div>
		                    </div>
						</div>
							<table className="table table-sm table-bordered table-striped">
								<thead>
									<tr>
										<th>分類</th>
										<th>名稱</th>
					                	<th className="text-xs-center">加入</th>
									</tr>
								</thead>
								<tbody>
									{
										this.state.grid_left_constitute.rows.map(function(itemData,i) {
											var out_sub_html =                     
												<tr key={itemData.constitute_id}>
													<td>{this.Filter(itemData.category_id,'category_element')}</td>
							                        <td>{itemData.constitute_name}</td>
				                        			<td className="text-xs-center">
														<button className="btn btn-link text-success" type="button" onClick={this.addConstitute.bind(this,itemData.constitute_id)}>
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
									<li><a href="#" onClick={this.LeftGridPrev}><i className="fa-angle-left"></i> 上一頁</a></li>
									<li>{this.state.LeftGridPageIndex +' / ' + this.state.grid_left_constitute.total}</li>
									<li><a href="#" onClick={this.LeftGridNext}>下一頁 <i className="fa-angle-right"></i></a></li>
								</ul>
	        				</div>
        			</div>
					<div className="col-xs-6">
						<div className="table-header">
							<span className="text-secondary">已排入今日 {this.FilterCommData(this.props.main_name,'MealType')} 菜單：</span>
						</div>
							<table className="table table-sm table-bordered table-striped">
								<tbody>
									<tr>
										<th>分類</th>
										<th>名稱</th>
					                	<th className="text-xs-center">刪除</th>
									</tr>
									{
										this.state.grid_right_constitute.map(function(itemData,i) {
											var out_sub_html =                     
												<tr key={itemData.constitute_id}>
													<td>{this.Filter(itemData.category_id,'category_element')}</td>
							                        <td>{itemData.constitute_name}</td>
				                        			<td className="text-xs-center">
														<button className="btn btn-link text-danger" type="button" onClick={this.removeConstitute.bind(this,itemData.constitute_id)}>
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