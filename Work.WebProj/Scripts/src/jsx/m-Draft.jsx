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
					<td>{this.props.itemData.draft_name}</td>
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
			checkAll:false
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/Draft'
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
				ids.push('ids='+this.state.gridData.rows[i].draft_id);
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

										<label className="text-sm">文案名稱</label> { }
										<input type="text" className="form-control" 
										value={searchData.name}
										onChange={this.changeGDValue.bind(this,'name')}
										placeholder="文案名稱..." /> { }

										<label className="text-sm">狀態</label> { }
										<select className="form-control" 
												value={searchData.i_Hide}
												onChange={this.onHideChange}>
											<option value="">全部</option>
											<option value="true">隱藏</option>
											<option value="false">顯示</option>

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
									<th style={{"width":"50%;"}}>文案名稱</th>
									<th style={{"width":"30%;"}}>狀態</th>
								</tr>
							</thead>
							<tbody>
								{
								this.state.gridData.rows.map(function(itemData,i) {
								return <GridRow 
								key={i}
								ikey={i}
								primKey={itemData.draft_id} 
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
						<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 文案名稱</label>
						<div className="col-xs-4">
							<input type="text" 							
							className="form-control"	
							value={fieldData.draft_name}
							onChange={this.changeFDValue.bind(this,'draft_name')}
							maxLength="64"
							required />
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
						<small className="col-xs-2 text-muted">數字越大越前面</small>
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
									<span className="text-sm">隱藏</span>
								</label>
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
						</div>
					</div>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">標題</label>
						<div className="col-xs-7">
							<input type="text" 							
							className="form-control"	
							value={fieldData.draft_title}
							onChange={this.changeFDValue.bind(this,'draft_title')}
							maxLength="64" />
						</div>
					</div>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">內容</label>
						<div className="col-xs-7">
							<textarea col="30" rows="3" className="form-control"
							value={fieldData.draft_content}
							onChange={this.changeFDValue.bind(this,'draft_content')}
							maxLength="500"></textarea>
						</div>
					</div>

					<div className="form-action">
						<button type="submit" className="btn btn-sm btn-primary col-xs-offset-1" name="btn-1"><i className="fa-check"></i> 儲存</button> { }
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