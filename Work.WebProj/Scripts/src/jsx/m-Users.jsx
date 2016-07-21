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
					<td>{this.props.itemData.user_name_c}</td>					
					<td>{this.props.itemData.UserName}</td>
					<td>{this.props.itemData.Email}</td>
					<td>{this.props.itemData.company_name}</td>
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
			company:[]
		};  
	},
	getDefaultProps:function(){

		var role_description = [];
		role_description['Managers'] = '管理者:所有功能';
		role_description['Sales'] = '櫃台:基本資料維護';
		return{	
			fdName:'fieldData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/Users',
			initPathName:gb_approot+'Base/Users/aj_Init',
			roleDescription:role_description
		};
	},	
	componentDidMount:function(){
		//只在客戶端執行一次，當渲染完成後立即執行。當生命週期執行到這一步，元件已經俱有 DOM 所以我們可以透過 this.getDOMNode() 來取得 DOM 。
		//如果您想整和其他 Javascript framework ，使用 setTimeout, setInterval, 或者是發動 AJAX 請在這個方法中執行這些動作。
		this.queryGridData(1);
		this.getAjaxInitData();
	},
	getAjaxInitData:function(){
		jqGet(this.props.initPathName)
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({company:data.options_company});
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
					tosMessage(null,'新增完成',1);
					this.updateType(data.aspnetid);
				}else{
					alert(data.message);
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
					tosMessage(null,'修改完成',1);
				}else{
					alert(data.message);
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
				ids.push('ids='+this.state.gridData.rows[i].Id);
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
				alert(data.message);
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
			this.setState({edit_type:1,fieldData:{role_array:data,company_id:1}});
		}.bind(this))
		.fail(function(jqXHR, textStatus, errorThrown) {
			showAjaxError(errorThrown);
		});
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
	setRolesCheck:function(index,e){
		var obj = this.state[this.props.fdName];
		var roleObj = obj['role_array'];
		var item = roleObj[index];
		item.role_use = !item.role_use;
		if(item.role_use){//只能有一個role
			roleObj.forEach(function(object, i){
	        	if(item!=object){
	  				object.role_use=false;
	        	}
    		})
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
				<ul className="breadcrumb">
					<li><i className="fa-list-alt"></i> {this.props.MenuName}</li>
				</ul>
				<h3 className="h3">
					{this.props.Caption}
				</h3>
				<form onSubmit={this.handleSearch}>
					
						<div className="table-header">
							<div className="table-filter">
								<div className="form-inline form-sm">
									<div className="form-group">
										<label className="text-sm">使用者名稱</label> { }
										<input type="text" className="form-control" 
										value={searchData.UserName}
										onChange={this.changeGDValue.bind(this,'UserName')}
										placeholder="請輸入關鍵字..." /> { }
										<button className="btn btn-sm btn-secondary" type="submit"><i className="fa-search"></i> 搜尋</button>
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
									<th style={{"width":"20%;"}} >姓名</th>
									<th style={{"width":"20%;"}} >帳號</th>
									<th style={{"width":"20%;"}} >Email</th>
									<th style={{"width":"20%;"}} >公司名稱</th>
								</tr>
							</thead>
							<tbody>
								{
								this.state.gridData.rows.map(function(itemData,i) {
								return <GridRow 
										key={i}
										ikey={i}
										primKey={itemData.Id} 
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
			var company_html=null;
			if(Role=="Admins"){
				company_html=
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 選擇分公司</label>
						<div className="col-xs-4">
							<select className="form-control" 
							value={fieldData.company_id}
							onChange={this.changeFDValue.bind(this,'company_id')}>
							{
								this.state.company.map(function(itemData,i) {
									return <option key={i} value={itemData.val}>{itemData.Lname}</option>;
								})
							}
							</select>
						</div>
					</div>;
			}
			outHtml=(
			<div>
				<ul className="breadcrumb">
					<li><i className="fa-list-alt"></i> {this.props.MenuName}</li>
				</ul>
				<h3 className="h3">{this.props.Caption}<small className="sub"><i className="fa-angle-double-right"></i> 編輯</small></h3>
				<form className="form form-sm" onSubmit={this.handleSubmit}>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 帳號</label>
							<div className="col-xs-6">
								<input type="text" 							
								className="form-control"	
								value={fieldData.UserName}
								onChange={this.changeFDValue.bind(this,'UserName')}
								maxLength="256"
								required />
							</div>
						</div>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 密碼</label>
							<div className="col-xs-6">
								<input type="password" 							
								className="form-control"	
								value={fieldData.PasswordHash}
								onChange={this.changeFDValue.bind(this,'PasswordHash')}
								maxLength="256"
								required />
							</div>
							<small className="col-xs-4 text-muted">至少6個字元</small>
						</div>

						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 姓名</label>
							<div className="col-xs-6">
								<input type="text" 							
								className="form-control"	
								value={fieldData.user_name_c}
								onChange={this.changeFDValue.bind(this,'user_name_c')}
								maxLength="32"
								required />
							</div>
							<label className="col-xs-1 form-control-label text-xs-right">排序</label>
							<div className="col-xs-2">
								<input type="number" 
								className="form-control"
								value={fieldData.sort}
								onChange={this.changeFDValue.bind(this,'sort')} />
							</div>
						</div>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> Email</label>
							<div className="col-xs-9">
								<input type="email" 
								className="form-control"	
								value={fieldData.Email}
								onChange={this.changeFDValue.bind(this,'Email')}
								maxLength="256"
								required
								 />
							</div>
						</div>
						{company_html}
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">角色</label>
							<div className="col-xs-10">
								<div className="c-inputs-stacked">
								{
									fieldData.role_array.map(function(itemData,i) {

										var out_check = 							
										<label className="c-input c-checkbox" key={itemData.role_id}>
												<input  type="checkbox" 
														checked={itemData.role_use}
														onChange={this.setRolesCheck.bind(this,i)}
												 />
												 <span className="c-indicator"></span>
												<span className="text-sm">{itemData.role_name + '(' + this.props.roleDescription[itemData.role_name] + ')'}</span>
										</label>;
										return out_check;

									}.bind(this))
								}
								</div>
							</div>
						</div>

						<div className="form-action">
							<button type="submit" className="btn btn-sm btn-primary col-xs-offset-1"><i className="fa-check"></i> 存檔確認</button> { }
							<button type="button" className="btn btn-sm btn-blue-grey" onClick={this.noneType}><i className="fa-arrow-left"></i> 回前頁</button>
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