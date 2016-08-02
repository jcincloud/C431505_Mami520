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
					<td>{this.props.itemData.menu_id}</td>
					<td>{this.props.itemData.parent_menu_id}</td>
					<td>{this.props.itemData.menu_name}</td>
					<td>{this.props.itemData.area}</td>
					<td>{this.props.itemData.controller}</td>
					<td>{this.props.itemData.action}</td>
					<td>{this.props.itemData.icon_class}</td>
					<td>{this.props.itemData.sort}</td>
					<td>{this.props.itemData.is_folder?<span className="label label-success">父選單</span>:<span className="label label-primary">子選單</span>}</td>
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
			fieldData:{
				role_array:[]
			},
			searchData:{title:null},
			edit_type:0,
			checkAll:false,
			folder:[]
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/Menu',
			initPathName:gb_approot+'Base/Menu/aj_Init'
		};
	},	
	componentDidMount:function(){
		this.queryGridData(1);
		this.getAjaxInitData();
	},
	shouldComponentUpdate:function(nextProps,nextState){
		return true;
	},
	getAjaxInitData:function(){
		jqGet(this.props.initPathName)
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({folder:data.options_folder});
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
				ids.push('ids='+this.state.gridData.rows[i].menu_id);
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
		jqGet(gb_approot + 'api/GetAction/GetInsertRoles',{})
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({edit_type:1,fieldData:{role_array:data,parent_menu_id:0}});
		}.bind(this))
		.fail(function(jqXHR, textStatus, errorThrown) {
			showAjaxError(errorThrown);
		});
	},
	updateType:function(id){
		jqGet(this.props.apiPathName,{id:id})
		.done(function(data, textStatus, jqXHRdata) {
			console.log(data)
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
		obj['is_folder'] = e.target.value;
		this.setState({searchData:obj});
	},
	setRolesCheck:function(index,e){
		var obj = this.state[this.props.fdName];
		var roleObj = obj['role_array'];
		var item = roleObj[index];
		item.role_use = !item.role_use;

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
                <h3 className="h3">{this.props.Caption} 列表</h3>

				<form onSubmit={this.handleSearch}>
					
						<div className="table-header">
							<div className="table-filter">
								<div className="form-inline form-sm">
									<div className="form-group">

										<label className="text-sm">選單名稱</label> { }
										<input type="text" className="form-control" 
										value={searchData.word}
										onChange={this.changeGDValue.bind(this,'word')}
										placeholder="搜尋選單..." /> { }
										<label className="text-sm">狀態</label> { }
										<select className="form-control" 
												value={searchData.is_folder}
												onChange={this.onHideChange}>
											<option value="">全部</option>
											<option value="true">父選單</option>
											<option value="false">子選單</option>

										</select> { }
										<button className="btn btn-sm btn-secondary" type="submit"><i className="fa-search"></i> 搜尋</button>
									</div>
								</div>
							</div>
						</div>
						<table className="table table-sm table-bordered table-striped">
							<thead>
								<tr>
									<th className="text-xs-center">
										<label className="c-input c-checkbox">
											<input type="checkbox" checked={this.state.checkAll} onChange={this.checkAll} />
											<span className="c-indicator"></span>
										</label>
									</th>
									<th className="text-xs-center">修改</th>
									<th>編號</th>
									<th>對應父選單</th>
									<th>選單名稱</th>
									<th>area</th>
									<th>controller</th>
									<th>action</th>
									<th>icon_class</th>
									<th>排序</th>
									<th>選單狀態</th>
								</tr>
							</thead>
							<tbody>
								{
								this.state.gridData.rows.map(function(itemData,i) {
								return <GridRow 
								key={i}
								ikey={i}
								primKey={itemData.menu_id} 
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

			outHtml=(
			<div>
                <h3 className="h3">{this.props.Caption}<small className="sub"><i className="fa-angle-double-right"></i> 編輯</small></h3>

				<form className="form form-sm" onSubmit={this.handleSubmit}>
					<div className="form-group row">
						<label className="col-xs-2 form-control-label text-xs-right">編號</label>
						<div className="col-xs-4">
							<input type="number" 							
							className="form-control"	
							value={fieldData.menu_id}
							onChange={this.changeFDValue.bind(this,'menu_id')}
                            placeholder="系統自動產生"
                            disabled={true} />
						</div>
					</div>
					<div className="form-group row">
						<label className="col-xs-2 form-control-label text-xs-right"><span className="text-danger">*</span> 選擇父選單</label>
						<div className="col-xs-4">
							<select className="form-control" 
							value={fieldData.parent_menu_id}
							onChange={this.changeFDValue.bind(this,'parent_menu_id')}>
							<option value="0">無</option>
							{
								this.state.folder.map(function(itemData,i) {
									return <option key={i} value={itemData.val}>{itemData.Lname}</option>;
								})
							}
							</select>
						</div>
					</div>					
					<div className="form-group row">
						<label className="col-xs-2 form-control-label text-xs-right"><span className="text-danger">*</span> 選單名稱</label>
						<div className="col-xs-4">
							<input type="text" 							
							className="form-control"	
							value={fieldData.menu_name}
							onChange={this.changeFDValue.bind(this,'menu_name')}
							maxLength="64"
							required />
						</div>
					</div>
					<div className="form-group row">
						<label className="col-xs-2 form-control-label text-xs-right">area</label>
						<div className="col-xs-4">
							<input type="text" 							
							className="form-control"	
							value={fieldData.area}
							onChange={this.changeFDValue.bind(this,'area')}
							maxLength="64" />
						</div>
					</div>
					<div className="form-group row">
						<label className="col-xs-2 form-control-label text-xs-right">controller</label>
						<div className="col-xs-4">
							<input type="text" 							
							className="form-control"	
							value={fieldData.controller}
							onChange={this.changeFDValue.bind(this,'controller')}
							maxLength="16" />
						</div>
					</div>
					<div className="form-group row">
						<label className="col-xs-2 form-control-label text-xs-right">action</label>
						<div className="col-xs-4">
							<input type="text" 							
							className="form-control"	
							value={fieldData.action}
							onChange={this.changeFDValue.bind(this,'action')}
							maxLength="16" />
						</div>
					</div>
					<div className="form-group row">
						<label className="col-xs-2 form-control-label text-xs-right">icon_class</label>
						<div className="col-xs-4">
							<input type="text" 							
							className="form-control"	
							value={fieldData.icon_class}
							onChange={this.changeFDValue.bind(this,'icon_class')}
							maxLength="16" />
						</div>
					</div>
					<div className="form-group row">
						<label className="col-xs-2 form-control-label text-xs-right"><span className="text-danger">*</span> 排序</label>
						<div className="col-xs-4">
							<input type="number" 
							className="form-control"	
							value={fieldData.sort}
							onChange={this.changeFDValue.bind(this,'sort')}
							required />
						</div>
						<small className="col-xs-6 text-muted">數字愈大愈前面，未填寫視為 0</small>
					</div>				
					<div className="form-group row">
						<label className="col-xs-2 form-control-label text-xs-right">選單狀態</label>
						<div className="col-xs-4">
								<label className="c-input c-radio">
									<input type="radio" 
											name="is_folder"
											value={true}
											checked={fieldData.is_folder===true} 
											onChange={this.changeFDValue.bind(this,'is_folder')}
									/>
									<span className="c-indicator"></span>
									<span className="text-sm">父選單</span>
								</label>
								<label className="c-input c-radio">
									<input type="radio" 
											name="is_folder"
											value={false}
											checked={fieldData.is_folder===false} 
											onChange={this.changeFDValue.bind(this,'is_folder')}
											/>
									<span className="c-indicator"></span>
									<span className="text-sm">子選單</span>
								</label>
						</div>
					</div>
					<div className="form-group row">
						<label className="col-xs-2 form-control-label text-xs-right">使用狀態</label>
						<div className="col-xs-4">
								<label className="c-input c-radio">
									<input type="radio" 
											name="is_use"
											value={true}
											checked={fieldData.is_use===true} 
											onChange={this.changeFDValue.bind(this,'is_use')}
									/>
									<span className="c-indicator"></span>
									<span className="text-sm">使用中</span>
								</label>
								<label className="c-input c-radio">
									<input type="radio" 
											name="is_use"
											value={false}
											checked={fieldData.is_use===false} 
											onChange={this.changeFDValue.bind(this,'is_use')}
											/>
									<span className="c-indicator"></span>
									<span className="text-sm">未使用</span>
								</label>
						</div>
					</div>
					<div className="form-group row">
						<label className="col-xs-2 form-control-label text-xs-right">可檢視角色</label>
						<div className="col-xs-10">
							{
								fieldData.role_array.map(function(itemData,i) {
									var out_check = 							
									<label className="c-input c-checkbox" key={itemData.role_id}>
											<input  type="checkbox" 
													checked={itemData.role_use}
													onChange={this.setRolesCheck.bind(this,i)}
											 />
											 <span className="c-indicator"></span>
											<span className="text-sm">{itemData.role_name}</span>
									</label>;
									return out_check;

								}.bind(this))
							}
						</div>
					</div>					

					<div className="form-action">
						<button type="submit" className="btn btn-sm btn-primary col-xs-offset-2" name="btn-1"><i className="fa-check"></i> 儲存</button> { }
						<button type="button" className="btn btn-sm btn-blue-grey" onClick={this.noneType}><i className="fa-times"></i> 回前頁</button>
					</div>
				</form>
			</div>
			);
		}else{
			outHtml=(<span>No Page</span>);
		}

		return outHtml;
	}
});