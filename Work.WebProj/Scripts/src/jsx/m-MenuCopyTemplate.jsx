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
					<td>{this.props.itemData.template_name}</td>
					<td>{this.props.itemData.memo}</td>
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
			err_list:[],
			copyData:{copy_start:null,copy_end:null,range_day:null}
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldData',
			gdName:'searchData',
			apiPathName: gb_approot + 'api/MenuCopyTemplate'
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
			    ids.push('ids=' + this.state.gridData.rows[i].menu_copy_template_id);
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
			fieldData:{meal_type:1}
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
			this.setState({
				edit_type:0,
				gridData:data,
				err_list:[],
				copyData:{copy_start:null,copy_end:null,range_day:null}
			});
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
	setCopyVal:function(name,e){
		this.checkMenuCopyList();
		var obj = this.state.copyData;
		if(e.target.value!=null & e.target.value!=''){

			obj.copy_start=e.target.value;
			var tmp_date = new Date(obj.copy_start);
			if(obj.range_day!=null){
				var end_date=addDate(tmp_date,parseInt(obj.range_day)-1);
				obj.copy_end=format_Date(end_date);
			}else{
				obj.copy_end=e.target.value;
			}

		}
		this.setState({copyData:obj});
	},
	checkMenuCopyList:function(){
			jqGet(gb_approot + 'api/GetAction/GetTempRangeCount',{main_id:this.state.fieldData.menu_copy_template_id})
			.done(function(data, textStatus, jqXHRdata) {
				var copyData=this.state.copyData;
				copyData.range_day=data.range_day;
				this.setState({copyData:copyData,err_list:data.list});
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
	},
	CopySubmit: function(e) {

		e.preventDefault();
		if(!confirm('確定是否複製?')){
			return;
		}
		var copyData = this.state.copyData;

			jqPost(gb_approot + 'api/GetAction/CopyMenuData',
				{main_id:this.state.fieldData.menu_copy_template_id,
					copy_start:copyData.copy_start,
					copy_end:copyData.copy_end
				})
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					tosMessage(null,'複製完成',1);
				}else{
					alert(data.msg);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});	
		return;
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
					                    <label className="text-sm">版型名稱</label> { }
					                    <input type="text" className="form-control"
                                               value={searchData.word}
                                               onChange={this.changeGDValue.bind(this,'word')}
                                               placeholder="請擇一填寫" /> { }
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
									<th  style={{"width":"10%;"}} className="text-xs-center">修改</th>
									<th  style={{"width":"30%;"}}>版型名稱</th>
									<th  style={{"width":"50%;"}}>備註說明</th>
								</tr>
							</thead>
							<tbody>
								{
								this.state.gridData.rows.map(function(itemData,i) {
								return <GridRow 
								key={i}
								ikey={i}
								primKey={itemData.menu_copy_template_id} 
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
			var copyData=this.state.copyData;

			var sub_out_html=null;
			var copy_out_html=null;
			if(this.state.edit_type==2){//只在修改時顯示下方對應程式
				sub_out_html=(<MenuCopy ref="SubFrom" main_id={fieldData.menu_copy_template_id} />);
				var err_out_html=null;
				if(this.state.err_list.length>0){
					err_out_html=(
						<div className="alert alert-warning">
							<p><strong>目前樣板還缺少下列餐別:</strong></p>
							<ul className="list-unstyled text-sm">
							{
								this.state.err_list.map(function(itemData,i) {
									var error_html=
										<li key={i}>
											<i className="fa-angle-double-right"></i> <strong>第 {itemData.day} 天：</strong> { }
											<StateForGrid stateData={CommData.MealType} id={itemData.meal_type} />
										</li>;
									return error_html;
								})
							}
							</ul>
						</div>
						);
				}
				copy_out_html=(				
					<form className="form form-sm" id="copy-form" onSubmit={this.CopySubmit}>
							<div className="card">
								<div className="card-header bg-primary-light text-secondary"><i className="fa-copy"></i> 複製此樣板至每日菜單</div>
								<div className="card-block">
									<div className="form-group row">
										<label className="col-xs-1 form-control-label">起始日期</label>
										<div className="col-xs-3">
												<InputDate id="copy_start" 
												onChange={this.setCopyVal} 
												field_name="copy_start" 
												value={copyData.copy_start}
												required={true}
												disabled={false} />
										</div>
									</div>
									<div className="form-group row">
										<label className="col-xs-1 form-control-label">結束日期</label>
										<div className="col-xs-3">
											<InputDate id="copy_end" 
											onChange={this.setCopyVal} 
											field_name="copy_end" 
											value={copyData.copy_end}
											required={true}
											disabled={true} />
										</div>
									</div>
									{err_out_html}
								</div>
								<div className="card-footer">
									<button type="submit" className="btn btn-sm btn-indigo" form="copy-form" disabled={this.state.err_list.length>0}><i className="fa-check"></i> 複製</button> { }
									<strong className="text-danger">【此樣板共 {copyData.range_day} 天】</strong>
								</div>
							</div>
					</form>);
			}else{
				sub_out_html=(
					<div>
						<h3 className="h3">每日菜單樣板</h3>
						<div className="alert alert-warning">請先按上方的 <strong>儲存</strong>，再進行設定。</div>
					</div>
					);
			}


			outHtml=(
			<div>
                <h3 className="h3">{this.props.Caption}<small className="sub"><i className="fa-angle-double-right"></i> 編輯</small></h3>
				<form className="form form-sm" onSubmit={this.handleSubmit} id="main-form">
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 版型名稱</label>
						<div className="col-xs-6">
							<input type="text"
                                   className="form-control"
                                   value={fieldData.template_name}
                                   onChange={this.changeFDValue.bind(this,'template_name')}
                                   maxLength="64"
                                   required />
						</div>					
					</div>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 備註說明</label>
						<div className="col-xs-6">
							<textarea col="30" row="3" className="form-control"
                                      value={fieldData.memo}
                                      onChange={this.changeFDValue.bind(this,'memo')}
                                      maxLength="256"></textarea>
						</div>
					</div>
					<div className="form-action">
						<button type="submit" className="btn btn-sm btn-primary col-xs-offset-1" name="btn-1" form="main-form"><i className="fa-check"></i> 存檔確認</button> { }
						<button type="button" className="btn btn-sm btn-blue-grey" onClick={this.noneType}><i className="fa-arrow-left"></i> 回前頁</button>
					</div>
				</form>

				<hr className="lg" />
				{/*複製樣板*/}
				{copy_out_html}
				{/*複製樣板*/}

				<hr className="lg" />
				{/* 版型菜單內容 */}
				{sub_out_html}
			</div>
			);
		}else{
			outHtml=(<span>No Page</span>);
		}

		return outHtml;
	}
});



//菜單編輯list
var MenuCopyGridRow = React.createClass({
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
					<td>{'第'+this.props.itemData.day+'天'}</td>
                    <td><StateForGrid stateData={CommData.MealType} id={this.props.itemData.meal_type} /></td>
				</tr>
			);
		}
});

//菜單編輯主表單
var MenuCopy = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return {
			gridSubData:{rows:[],page:1},
			fieldSubData:{meal_type:1,menu_copy_template_id:this.props.main_id},
			searchSubData:{main_id:this.props.main_id,start_day:1},
			edit_sub_type:1,//一開始就新增狀態
			checkAll:false,
			category:[]
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldSubData',
			gdName:'searchSubData',
			apiPathName:gb_approot+'api/MenuCopy'
		};
	},	
	componentDidMount:function(){
		this.queryGridSubData(1);
	},
	handleSubSubmit: function(e) {

		e.preventDefault();

		if(this.state.edit_sub_type==1){
			jqPost(this.props.apiPathName,this.state.fieldSubData)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					if(data.message!=null){
						tosMessage(null,'新增完成'+data.message,1);
					}else{
						tosMessage(null,'新增完成',1);
					}
					this.updateSubType(data.id);
					this.queryGridSubData(0);
				}else{
					tosMessage(null,data.message,3);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
		}		
		else if(this.state.edit_sub_type==2){
			jqPut(this.props.apiPathName,this.state.fieldSubData)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					if(data.message!=null){
						tosMessage(null,'修改完成'+data.message,1);
					}else{
						tosMessage(null,'修改完成',1);
					}
					this.queryGridSubData(0);
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
	deleteSubSubmit:function(e){

		if(!confirm('確定是否刪除?')){
			return;
		}
		var ids = [];
		var check_id=false;
		for(var i in this.state.gridSubData.rows){
			if(this.state.gridSubData.rows[i].check_del){
			    ids.push('ids=' + this.state.gridSubData.rows[i].menu_copy_id);
			    if(this.state.gridSubData.rows[i].menu_copy_id==this.state.fieldSubData.menu_copy_id){
					check_id=true;
				}
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
				this.queryGridSubData(0);
				if(check_id){
					this.setState({edit_sub_type:1,fieldSubData:{meal_type:1,menu_copy_template_id:this.props.main_id}});
				}
			}else{
				tosMessage(null,data.message,3);
			}
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	handleSubSearch:function(e){
		e.preventDefault();
		this.queryGridSubData(0);
		return;
	},
	delCheck:function(i,chd){

		var newState = this.state;
		this.state.gridSubData.rows[i].check_del = !chd;
		this.setState(newState);
	},
	checkAll:function(){

		var newState = this.state;
		newState.checkAll = !newState.checkAll;
		for (var prop in this.state.gridSubData.rows) {
			this.state.gridSubData.rows[prop].check_del=newState.checkAll;
		}
		this.setState(newState);
	},
	gridSubData:function(page){

		var parms = {
			page:0
		};

		if(page==0){
			parms.page=this.state.gridSubData.page;
		}else{
			parms.page=page;
		}

		$.extend(parms, this.state.searchSubData);

		return jqGet(this.props.apiPathName,parms);
	},
	queryGridSubData:function(page){
		this.gridSubData(page)
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({gridSubData:data});
		}.bind(this))
		.fail(function(jqXHR, textStatus, errorThrown) {
			showAjaxError(errorThrown);
		});
	},
	insertSubType:function(){
		this.setState({edit_sub_type:1,fieldSubData:{meal_type:1,menu_copy_template_id:this.props.main_id}});
		$('a[href="#edit"]').tab('show');
	},
	updateSubType:function(id){
		jqGet(this.props.apiPathName,{id:id})
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({edit_sub_type:2,fieldSubData:data.data});
			$('a[href="#edit"]').tab('show');
			this.refs.GridDofC.queryLeftConstitute();
			this.refs.GridDofC.queryRightConstitute();
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
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
	setSearchVal:function(name,e){
		var obj = this.state.searchSubData;
		if(e.target.value=='true'){
			obj[name] = true;
		}else if(e.target.value=='false'){
			obj[name] = false;
		}else{
			obj[name] = e.target.value;
		}
		this.setState({searchSubData:obj});
		this.queryGridSubData(0);
	},
	render: function() {
		var outHtml = null;
		var searchSubData=this.state.searchSubData;
		var fieldSubData=this.state.fieldSubData;
		var map_out_html=null;
		if(this.state.edit_sub_type==2){//只在修改時顯示下方對應程式
			map_out_html=(<GirdDofC ref="GridDofC" main_id={fieldSubData.menu_copy_id} main_name={fieldSubData.meal_type} />);
		}else{
			map_out_html=(
				<div>
					<hr />
					<h3 className="h3">每日菜單樣板對應設定</h3>
					<div className="alert alert-warning">請先按上方的 <strong>存檔確認</strong>，再進行設定。</div>
				</div>
				);
		}
		outHtml =(
			<div>
				<h3 className="h3">每日菜單樣板</h3>
			    <ul className="nav nav-tabs" role="tablist">
			        <li role="presentation" className="nav-item">
			            <a className="nav-link active" href="#list" aria-controls="home" role="tab" data-toggle="tab" id="tabAddNew">
			            	<i className="fa-list-alt"></i> 清單
			            </a>
			        </li>
			        <li role="presentation" className="nav-item">
			            <a className="nav-link" href="#edit" aria-controls="profile" role="tab" data-toggle="tab" id="tabAddView">
			                <i className="fa-pencil-square-o"></i> 編輯
			            </a>
			        </li>
			    </ul>					

				<div className="tab-content">
				{/*頁籤1*/}
					<div role="tabpanel" className="tab-pane active" id="list">
								<form onSubmit={this.handleSubSearch} id="search-subfrom">
								
									<div className="table-header">
										<div className="table-filter">
											<div className="form-inline form-sm">
												<div className="form-group">

													<label className="text-sm">天數區間</label> { }										
														<input type="number" className="form-control"
							                            value={searchSubData.start_day}
							                            onChange={this.setSearchVal.bind(this,'start_day')}
							                            min="1" />{ }
													<label className="text-sm">~</label> { }
													<div className="input-group input-group-sm">
														<input type="number" className="form-control"
								                            value={searchSubData.end_day}
								                            onChange={this.setSearchVal.bind(this,'end_day')}
								                            min="1" />
														<span className="input-group-addon">天</span>
													</div> { }
													<label className="text-sm">餐別</label> { }
													<select className="form-control" 
															value={searchSubData.meal_type}
															onChange={this.setSearchVal.bind(this,'meal_type')}>
														<option value="">全部</option>
													{
														CommData.MealType.map(function(itemData,i) {
															return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
														})
													}
													</select> { }
												</div>
											</div>
										</div>
									</div>
									<div className="row">
										{/*左邊list*/}
										<div className="col-xs-6">
											<table className="table table-sm table-bordered table-striped">
												<thead>
													<tr>
														<th style={{"width":"20%;"}} className="text-xs-center">
															<label className="c-input c-checkbox">
																<input type="checkbox" checked={this.state.checkAll} onChange={this.checkAll} />
																<span className="c-indicator"></span>
															</label>
														</th>
														<th style={{"width":"20%;"}} className="text-xs-center">修改</th>
														<th style={{"width":"30%;"}}>天數</th>
														<th style={{"width":"30%;"}}>餐別</th>
													</tr>
												</thead>
												<tbody>
													{
													this.state.gridSubData.rows.map(function(itemData,i) {
														if(i>=0 && i<=9){
														return <MenuCopyGridRow 
														key={i}
														ikey={i}
														primKey={itemData.menu_copy_id} 
														itemData={itemData} 
														delCheck={this.delCheck}
														updateType={this.updateSubType}
														category={this.state.category}								
														/>;
														}
													}.bind(this))
													}
												</tbody>
											</table>
										</div>
										{/*左邊list*/}
										{/*右邊list*/}
										<div className="col-xs-6">
											<table className="table table-sm table-bordered table-striped">
												<thead>
													<tr>
														<th style={{"width":"20%;"}} className="text-xs-center">
															<label className="c-input c-checkbox">
																<input type="checkbox" checked={this.state.checkAll} onChange={this.checkAll} />
																<span className="c-indicator"></span>
															</label>
														</th>
														<th style={{"width":"20%;"}} className="text-xs-center">修改</th>
														<th style={{"width":"30%;"}} className="">天數</th>
														<th style={{"width":"30%;"}} className="">餐別</th>
													</tr>
												</thead>
												<tbody>
													{
													this.state.gridSubData.rows.map(function(itemData,i) {
														if(i>=10 && i<=19){
														return <MenuCopyGridRow 
														key={i}
														ikey={i}
														primKey={itemData.menu_copy_id} 
														itemData={itemData} 
														delCheck={this.delCheck}
														updateType={this.updateSubType}
														category={this.state.category}								
														/>;
														}
													}.bind(this))
													}
												</tbody>
											</table>
										</div>
										{/*右邊list*/}										
									</div>
								<GridNavPage 
								StartCount={this.state.gridSubData.startcount}
								EndCount={this.state.gridSubData.endcount}
								RecordCount={this.state.gridSubData.records}
								TotalPage={this.state.gridSubData.total}
								NowPage={this.state.gridSubData.page}
								onQueryGridData={this.queryGridSubData}
								InsertType={this.insertSubType}
								deleteSubmit={this.deleteSubSubmit}
								/>
							</form>												
			        </div>
				{/*頁籤1*/}
				{/*頁籤2*/}
					<div role="tabpanel" className="tab-pane" id="edit">
								<form className="form form-sm" onSubmit={this.handleSubSubmit} id="sub-form">
									<div className="form-group row m-b-0">
										<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 選擇天數</label>
										<div className="col-xs-2">
											<input type="number" className="form-control"
							                value={fieldSubData.day}
							                onChange={this.changeFDValue.bind(this,'day')}
							                min="1" required/>{ }
										</div>
										<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 選擇餐別</label>
										<div className="col-xs-2">
											<select className="form-control" 
											value={fieldSubData.meal_type}
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
											<button type="submit" className="btn btn-sm btn-primary" name="btn-1" form="sub-form"><i className="fa-check"></i> 存檔確認</button> { }
											<button type="button" className="btn btn-sm btn-blue-grey" onClick={this.insertSubType}><i className="fa-times"></i> 取消</button>
										</div>	
									</div>
								</form>

								{/* 每日菜單對應的組合菜單 */}
								<div>
									{map_out_html}
								</div>

					</div>
				{/*頁籤2*/}
			    </div>		

			</div>

		);

		return outHtml;
	}
});


//對應設定
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

			jqGet(gb_approot + 'api/GetAction/GetLeftConstituteByT',parms)
			.done(function(data, textStatus, jqXHRdata) {
				this.setState({grid_left_constitute:data});
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
	},	
	queryRightConstitute:function(){
			jqGet(gb_approot + 'api/GetAction/GetRightConstituteByT',{main_id:this.props.main_id})
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
			jqPost(gb_approot + 'api/GetAction/PostMenuCopyOfConstitute',{menu_copy_id:this.props.main_id,constitute_id:constitute_id})
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
			jqDelete(gb_approot + 'api/GetAction/DeleteMenuCopyOfConstitute',{menu_copy_id:this.props.main_id,constitute_id:constitute_id})
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
				<hr />
				<h3 className="h3">每日菜單樣板對應設定</h3>
				<div className="row">
					<div className="col-xs-6">
						<div className="table-header">
							<div className="form-inline form-sm">
								<div className="form-group">
									<input type="text" className="form-control" placeholder="搜尋菜單"
									value={searchData.name} 
									onChange={this.queryChangeConstituteParam.bind(this,'name')} /> { }
									<select name="" id="" className="form-control"
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
									<li><a href="#" onClick={this.LeftGridPrev}><i className="fa-angle-double-left"></i> 上一頁</a></li>
									<li>{this.state.LeftGridPageIndex +'/' + this.state.grid_left_constitute.total}</li>
									<li><a href="#" onClick={this.LeftGridNext}>下一頁 <i className="fa-angle-double-right"></i></a></li>
								</ul>
	        				</div>
        			</div>
					<div className="col-xs-6">
						<div className="table-header"><span className="text-secondary">已排入今日 {this.FilterCommData(this.props.main_name,'MealType')} 菜單：</span></div>
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