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
					{/*<td>{this.props.itemData.name}</td>*/}
					<td>{this.props.itemData.short_name}</td>
					{/*<td>{this.props.itemData.sort}</td>*/}
					<td>{this.props.itemData.i_Hide?<span className="text-muted">隱藏</span>:<span className="text-success">顯示</span>}</td>
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
			apiPathName: gb_approot + 'api/DietaryNeed',
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
			    ids.push('ids=' + this.state.gridData.rows[i].dietary_need_id);
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
		this.setState({edit_type:1,fieldData:{is_breakfast:true,is_lunch:true,is_dinner:true,sort:0}});
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
	onCorrespondChange:function(e){
		var obj = this.state.fieldData;
		if(this.state.edit_type==2){//修改時才判斷
			var size=this.refs.SubFrom.state.grid_right_element.length;		

			if(obj.is_correspond && e.target.value=='false'){//從"須對應"切換為"不須對應"
				if(size>0){
					alert("下方已有加入對應的元素!\n請先將下方對應元素刪除再修改「元素對應」．");
					return;
				}
			}
		}

		if(e.target.value=='true'){
			obj.is_correspond = true;
		}else if(e.target.value=='false'){
			obj.is_correspond = false;
		}
		this.setState({fieldData:obj});
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
										<label className="text-sm">名稱/簡稱</label> { }
										<input type="text" className="form-control" 
										value={searchData.name}
										onChange={this.changeGDValue.bind(this,'name')}
										placeholder="名稱/簡稱..." /> { }

										<label className="text-sm">狀態</label> { }
										<select className="form-control" 
												value={searchData.i_Hide}
												onChange={this.onHideChange}>
											<option value="">全部</option>
											<option value="true">隱藏</option>
											<option value="false">顯示</option>

										</select>
									</div> { }
									<button className="btn btn-secondary btn-sm" type="submit"><i className="fa-search"></i> { }搜尋</button>
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
									{/*<th className="col-xs-3">需求元素名稱</th>*/}
									<th style={{"width":"40%;"}}>需求元素簡稱</th>
									{/*<th className="col-xs-2">排序</th>*/}
									<th style={{"width":"40%;"}}>狀態</th>
								</tr>
							</thead>
							<tbody>
								{
								this.state.gridData.rows.map(function(itemData,i) {
								return <GridRow 
								key={i}
								ikey={i}
								primKey={itemData.dietary_need_id} 
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
			var map_out_html=null;
			if(this.state.edit_type==2){//只在修改時顯示下方對應程式
				map_out_html=(<GirdCofE ref="SubFrom" main_id={fieldData.dietary_need_id} is_correspond={fieldData.is_correspond}/>);
			}else{
				map_out_html=(
					<div>
						<hr className="lg" />
						<h3 className="h3">需求元素對應設定 <small className="sub">需求元素設為【有對應】才需填寫！</small></h3>
						<div className="alert alert-warning">請先按上方的 <strong>存檔確認</strong>，再進行設定。</div>
					</div>
					);
			}

			outHtml=(
			<div>
                <h3 className="h3">{this.props.Caption}<small className="sub"><i className="fa-angle-double-right"></i> 編輯</small></h3>

				<form className="form form-sm" onSubmit={this.handleSubmit}>
					{/*<div className="form-group">
						<label className="col-xs-1 form-control-label text-xs-right">名稱</label>
						<div className="col-xs-4">
							<input type="text" 							
							className="form-control"	
							value={fieldData.name}
							onChange={this.changeFDValue.bind(this,'name')}
							maxLength="128"
							required />
						</div>
						<small className="text-muted col-xs-6 text-danger">(必填)</small>
					</div>*/}

					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 簡稱</label>
						<div className="col-xs-4">
							<input type="text" 							
							className="form-control"	
							value={fieldData.short_name}
							onChange={this.changeFDValue.bind(this,'short_name')}
							maxLength="64"
							required />
						</div>
						<small className="col-xs-4 text-muted">列印【每日菜單報表】時顯示</small>
					</div>

					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">元素對應</label>
						<div className="col-xs-4">
							<label className="c-input c-radio">
								<input type="radio"
										name="is_correspond"
										value={true}
										checked={fieldData.is_correspond===true} 
										onChange={this.onCorrespondChange.bind(this)}
								/>
								<span className="c-indicator"></span>
								<span className="text-sm">須對應</span>
							</label>
							<label className="c-input c-radio">
								<input type="radio" 
										name="is_correspond"
										value={false}
										checked={fieldData.is_correspond===false} 
										onChange={this.onCorrespondChange.bind(this)}
										/>
								<span className="c-indicator"></span>
								<span className="text-sm">不須對應</span>
							</label>
						</div>
						<small className="col-xs-4 text-muted">ex. 不薑 / 不酒 (須對應)、清淡 / 素食 (不須對應)</small>
					</div>

					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">適用餐別</label>
						<div className="col-xs-4">
							<label className="c-input c-checkbox">
								<input type="checkbox" 
										id="is_breakfast"
										checked={fieldData.is_breakfast}
										onChange={this.onMealChange.bind(this,'is_breakfast')}
								/>
								<span className="c-indicator"></span>
								<span className="text-sm">早餐</span>
							</label>
							<label className="c-input c-checkbox">
								<input type="checkbox" 
										id="is_lunch"
										checked={fieldData.is_lunch}
										onChange={this.onMealChange.bind(this,'is_lunch')}
										/>
								<span className="c-indicator"></span>
								<span className="text-sm">午餐</span>
							</label>
							<label className="c-input c-checkbox">
								<input type="checkbox" 
										id="is_dinner"
										checked={fieldData.is_dinner}
										onChange={this.onMealChange.bind(this,'is_dinner')}
										/>
								<span className="c-indicator"></span>
								<span className="text-sm">晚餐</span>
							</label>
						</div>
						<small className="col-xs-4 text-muted">需求元素設為【須對應】才需填寫！</small>
					</div>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">狀態</label>
						<div className="col-xs-3">
							<label className="c-input c-radio">
								<input type="radio" 
										name="i_Hide"
										value={false}
										checked={fieldData.i_Hide===false} 
										onChange={this.changeFDValue.bind(this,'i_Hide')}
										/>
								<span className="c-indicator"></span>
								<span className="text-sm">顯示</span>
							</label>
							<label className="c-input c-radio">
								<input type="radio" 
										name="i_Hide"
										value={true}
										checked={fieldData.i_Hide===true} 
										onChange={this.changeFDValue.bind(this,'i_Hide')}
								/>
								<span className="c-indicator"></span>
								<span className="text-sm">隱藏</span>
							</label>
						</div>
					</div>
					{/*<div className="form-group">
						<label className="col-xs-1 form-control-label text-xs-right">排序</label>
						<div className="col-xs-4">
							<input type="number" 
							className="form-control"	
							value={fieldData.sort}
							onChange={this.changeFDValue.bind(this,'sort')}
							 />
						</div>
						<small className="col-xs-6 text-muted">數字越大越前面</small>
					</div>*/}

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
						<button type="button" onClick={this.noneType} className="btn btn-sm btn-blue-grey"><i className="fa-times"></i> 回前頁</button>
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
			searchData:{main_id:this.props.main_id,name:null,category_id:null},
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
		this.getAjaxInitData();//載入init資料
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
			jqGet(gb_approot + 'api/GetAction/GetLeftElement_byNeed',parms)
			.done(function(data, textStatus, jqXHRdata) {
				this.setState({grid_left_element:data});
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
	},	
	queryRightElement:function(){
			jqGet(gb_approot + 'api/GetAction/GetRightElement_byNeed',{main_id:this.props.main_id})
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
	addElement:function(element_id){
			if(!this.props.is_correspond){
				alert("「元素對應」設定為不須對應!不可加入對應!!");
				return;
			}
			jqPost(gb_approot + 'api/GetAction/PostDietaryNeedOfElement',{dietary_need_id:this.props.main_id,element_id:element_id})
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
	removeElement:function(element_id){
			jqDelete(gb_approot + 'api/GetAction/DeleteDietaryNeedOfElement',{dietary_need_id:this.props.main_id,element_id:element_id})
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
	render: function() {
		var outHtml = null;
		var fieldData = {};
		var searchData=this.state.searchData;

		outHtml =(
			<div>
			<hr className="lg" />
			<h3 className="h3">需求元素對應設定 <small className="sub">需求元素設為【須對應】才需填寫！</small></h3>
				<div className="row">
					<div className="col-xs-6">
						<div className="table-header">
							<div className="form-inline form-sm">
		                        <div className="form-group">
		                            <select name="" id="" className="form-control"
		                            onChange={this.queryChangeElementParam.bind(this,'category_id')}
									value={searchData.category_id}> { }
		                                <option value="">全部分類</option>
									{
										this.state.category_element.map(function(itemData,i) {
											return <option key={i} value={itemData.val}>{itemData.Lname}</option>;
										})
									}
		                            </select> { }
		                            <input type="text" className="form-control" placeholder="搜尋食材名稱..."
		                           	value={searchData.name} 
            						onChange={this.queryChangeElementParam.bind(this,'name')} />
		                        </div>
		                    </div>
						</div>
							<table className="table table-sm table-bordered table-striped">
								<thead>
									<tr>
										<th>分類</th>
										<th>食材名稱</th>
					                	<th className="text-xs-center">加入</th>
									</tr>
								</thead>
								<tbody>
									{
										this.state.grid_left_element.rows.map(function(itemData,i) {
											var out_sub_html =                     
												<tr key={itemData.element_id}>
													<td>{this.Filter(itemData.category_id,'category_element')}</td>
							                        <td>{itemData.element_name}</td>
				                        			<td className="text-xs-center">
														<button className="btn btn-link text-success" type="button" onClick={this.addElement.bind(this,itemData.element_id)}>
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
									<li><a href="#" onClick={this.LeftGridPrev}><i className="fa-angle-double-left"></i> 上一頁</a></li>
									<li>{this.state.LeftGridPageIndex +' / ' + this.state.grid_left_element.total}</li>
									<li><a href="#" onClick={this.LeftGridNext}>下一頁 <i className="fa-angle-double-right"></i></a></li>
								</ul>
	        				</div>
        			</div>
					<div className="col-xs-6">
							
						<div className="table-header"><span className="text-secondary">已加入對應的食材：</span></div>
							<table className="table table-sm table-bordered table-striped">
								<thead>
									<tr>
										<th>分類</th>
										<th>食材名稱</th>
					                	<th className="text-xs-center">刪除</th>
									</tr>
								</thead>
								<tbody>
									{
										this.state.grid_right_element.map(function(itemData,i) {
											var out_sub_html =                     
												<tr key={itemData.element_id}>
													<td>{this.Filter(itemData.category_id,'category_element')}</td>
							                        <td>{itemData.element_name}</td>
				                        			<td className="text-xs-center">
														<button className="btn btn-link text-danger" type="button" onClick={this.removeElement.bind(this,itemData.element_id)}>
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