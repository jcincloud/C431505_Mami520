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
	Filter:function(value,CName){
		var val="";
		this.props[CName].forEach(function(object, i){
        	if(value==object.val){
  				val=object.Lname;
        	}
    	})
		return val;
	},
	render:function(){
		return (

				<tr>
					<td className="text-xs-center"><GridCheckDel iKey={this.props.ikey} chd={this.props.itemData.check_del} delCheck={this.delCheck} /></td>
					<td className="text-xs-center"><GridButtonModify modify={this.modify}/></td>
					<td>{this.Filter(this.props.itemData.category_id,'category')}</td>
					<td>{this.props.itemData.constitute_name}</td>
					<td>{this.props.itemData.i_Hide?<span className="text-muted">停用</span>:<span className="text-success">啟用</span>}</td>
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
			apiPathName: gb_approot + 'api/ConstituteFood',
			initPathName: gb_approot + 'Active/Food/constitute_food_Init'
		};
	},	
	componentDidMount:function(){
		this.queryGridData(1);
		this.getAjaxInitData();//載入init資料
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
			    ids.push('ids=' + this.state.gridData.rows[i].constitute_id);
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
		var defaultC=this.state.category;
		this.setState({edit_type:1,fieldData:{category_id:defaultC[0].val}});
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
		obj['category_id'] = e.target.value;
		this.setState({searchData:obj});
	},
	onHideChange:function(e){
		var obj = this.state.searchData;
		obj['i_Hide'] = e.target.value;
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

										<label className="text-sm">菜色名稱</label> { }
										<input type="text" className="form-control" 
										value={searchData.constitute_name}
										onChange={this.changeGDValue.bind(this,'constitute_name')}
										placeholder="菜色名稱..." /> { }

										<label className="text-sm">分類</label> { }
										<select className="form-control" 
												value={searchData.category_id}
												onChange={this.onCategoryChange}>
											<option value="">全部</option>
										{
											this.state.category.map(function(itemData,i) {
												return <option key={i} value={itemData.val}>{itemData.Lname}</option>
											})
										}
										</select> { }

										<label className="text-sm">狀態</label> { }
										<select className="form-control" 
												value={searchData.i_Hide}
												onChange={this.onHideChange}>
											<option value="">全部</option>
											<option value="true">停用</option>
											<option value="false">啟用</option>

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
									<th style={{"width":"15%;"}}>分類</th>
									<th style={{"width":"20%;"}}>菜色名稱</th>
									<th style={{"width":"45%;"}}>狀態</th>
								</tr>
							</thead>
							<tbody>
								{
								this.state.gridData.rows.map(function(itemData,i) {
								return <GridRow 
								key={i}
								ikey={i}
								primKey={itemData.constitute_id} 
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
				map_out_html=(<GirdCofE main_id={fieldData.constitute_id} main_name={fieldData.constitute_name}/>);
			}else{
				map_out_html=(
					<div>
						<hr className="condensed" />
						<h4 className="title">菜色內容對應設定</h4>
						<div className="alert alert-warning">請先按上方的 <strong>存檔確認</strong>，再進行設定。</div>
					</div>
					);
			}
            
			outHtml=(
			<div>
                <h3 className="h3">{this.props.Caption}<small className="sub"><i className="fa-angle-double-right"></i> 編輯</small></h3>

				<form className="form form-sm" onSubmit={this.handleSubmit}>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 分類</label>
						<div className="col-xs-4">
							<select className="form-control" 
							value={fieldData.category_id}
							onChange={this.changeFDValue.bind(this,'category_id')}>
							{
								this.state.category.map(function(itemData,i) {
									return <option key={i} value={itemData.val}>{itemData.Lname}</option>;
								})
							}
							</select>
						</div>
					</div>

					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 名稱</label>
						<div className="col-xs-4">
							<input type="text" 							
							className="form-control"	
							value={fieldData.constitute_name}
							onChange={this.changeFDValue.bind(this,'constitute_name')}
							maxLength="64"
							required />
						</div>
					</div>

					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">狀態</label>
						<div className="col-xs-4">
							<label className="c-input c-radio">
								<input type="radio" 
										name="i_Hide"
										value={true}
										checked={fieldData.i_Hide===true} 
										onChange={this.changeFDValue.bind(this,'i_Hide')}
								/>
								<span className="c-indicator"></span>
								<span className="text-sm">停用</span>
							</label>
							<label className="c-input c-radio">
								<input type="radio" 
										name="i_Hide"
										value={false}
										checked={fieldData.i_Hide===false} 
										onChange={this.changeFDValue.bind(this,'i_Hide')}
										/>
								<span className="c-indicator"></span>
								<span className="text-sm">啟用</span>
							</label>
						</div>
					</div>

					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">排序</label>
						<div className="col-xs-4">
							<input type="number" 
							className="form-control"	
							value={fieldData.sort}
							onChange={this.changeFDValue.bind(this,'sort')}
							 />
						</div>
						<small className="col-xs-4 text-muted">數字越大越前面</small>
					</div>

					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">備註</label>
						<div className="col-xs-4">
							<textarea col="30" rows="4" className="form-control"
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
			{/* 菜色對應的食材 */}
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

			jqGet(gb_approot + 'api/GetAction/GetLeftElement',parms)
			.done(function(data, textStatus, jqXHRdata) {
				this.setState({grid_left_element:data});
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
	},	
	queryRightElement:function(){
			jqGet(gb_approot + 'api/GetAction/GetRightElement',{main_id:this.props.main_id})
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
			jqPost(gb_approot + 'api/GetAction/PostConstituteOfElement',{constitute_id:this.props.main_id,element_id:element_id})
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
			jqDelete(gb_approot + 'api/GetAction/DeleteConstituteOfElement',{constitute_id:this.props.main_id,element_id:element_id})
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
				<h3 className="h3">菜色內容對應設定</h3>
				<div className="row">
					<div className="col-xs-6">
						<div className="table-header">
							<div className="form-inline form-sm">
								<div className="form-group">
									<input type="text" className="form-control input-sm" placeholder="搜尋食材..."
									value={searchData.name} 
									onChange={this.queryChangeElementParam.bind(this,'name')} /> { }
									<select name="" id="" className="form-control"
									onChange={this.queryChangeElementParam.bind(this,'category_id')}
									value={searchData.category_id}> { }
									<option value="">分類</option>
									{
										this.state.category_element.map(function(itemData,i) {
											return <option key={i} value={itemData.val}>{itemData.Lname}</option>;
										})
									}
									</select>
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
						<div className="table-header"><span className="text-secondary">已加入的食材：</span></div>
							<table className="table table-sm table-bordered table-striped">
								<thead>
									<tr>
										<th>分類</th>
										<th>名稱</th>
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