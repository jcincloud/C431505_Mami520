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
					<td className="text-center"><GridCheckDel iKey={this.props.ikey} chd={this.props.itemData.check_del} delCheck={this.delCheck} /></td>
					<td className="text-center"><GridButtonModify modify={this.modify}/></td>
					<td>{moment(this.props.itemData.send_day).format('YYYY/MM/DD')}</td>
					<td>{this.props.itemData.title}</td>
					<td>{this.props.itemData.is_complete?<span className="label label-success">完稿</span>:<span className="label label-default">草稿</span>}</td>
					<td>{this.props.itemData.is_send?<span className="label label-success">發佈成功</span>:<span className="label label-warning">待發佈</span>}</td>
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
			searchData:{title:null,send_type:1},
			edit_type:0,
			checkAll:false,
			draft_list:[]
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldData',
			gdName:'searchData',
			apiPathName: gb_approot + 'api/SendMsg',
			initPathName: gb_approot + 'Active/Communication/aj_Init'
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
			this.setState({draft_list:data.options_draft});
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
			    ids.push('ids=' + this.state.gridData.rows[i].send_msg_id);
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
		this.setState({edit_type:1,fieldData:{send_type:1}});
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
	changeDraftValue:function(e){
		jqGet(gb_approot + 'api/GetAction/GetDraftData',{draft_id:e.target.value})
		.done(function(data, textStatus, jqXHRdata) {
			var obj = this.state.fieldData;
			obj.draft_id = data.draft_id;
			obj.title=data.title;
			obj.send_content=data.content;
			this.setState({fieldData:obj});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
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
                <h3 className="title">{this.props.Caption}</h3>
                <h4 className="title">{this.props.Caption} 列表</h4>
				<form onSubmit={this.handleSearch}>
					<div className="table-responsive">
						<div className="table-header">
							<div className="table-filter">
								<div className="form-inline">
									<div className="form-group">

										<label className="sr-only">標題</label> { }
										<input type="text" className="form-control" 
										value={searchData.title}
										onChange={this.changeGDValue.bind(this,'title')}
										placeholder="標題名稱..." /> { }

										<label className="sr-only">狀態</label> { }
										<select className="form-control" 
												value={searchData.is_complete}
												onChange={this.changeGDValue.bind(this,'is_complete')}>
											<option value="">選擇狀態</option>
											<option value="true">完稿</option>
											<option value="false">草稿</option>

										</select> { }

										<label className="sr-only">發佈狀態</label> { }
										<select className="form-control" 
												value={searchData.is_send}
												onChange={this.changeGDValue.bind(this,'is_send')}>
											<option value="">選擇發佈狀態</option>
											<option value="true">發佈成功</option>
											<option value="false">發佈待</option>

										</select> { }

										<button className="btn-primary" type="submit"><i className="fa-search"></i>{ }搜尋</button>
									</div>
								</div>
							</div>
						</div>
						<table>
							<thead>
								<tr>
									<th className="col-xs-1 text-center">
										<label className="cbox">
											<input type="checkbox" checked={this.state.checkAll} onChange={this.checkAll} />
											<i className="fa-check"></i>
										</label>
									</th>
									<th className="col-xs-1 text-center">修改</th>
									<th className="col-xs-1">發佈日期</th>
									<th className="col-xs-2">標題</th>
									<th className="col-xs-1">狀態</th>
									<th className="col-xs-1">發佈狀態</th>
								</tr>
							</thead>
							<tbody>
								{
								this.state.gridData.rows.map(function(itemData,i) {
								return <GridRow 
								key={i}
								ikey={i}
								primKey={itemData.send_msg_id} 
								itemData={itemData} 
								delCheck={this.delCheck}
								updateType={this.updateType}
								category={this.state.category}								
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
				map_out_html=(<GirdSofC main_id={fieldData.send_msg_id} is_send={fieldData.is_send} />);
			}else{
				map_out_html=(
					<div className="col-xs-12">
					<hr className="expanded" />
					<strong className="col-xs-12 help-inline text-center">請確認新增完成後再選取對應!</strong>
					</div>
					);
			}

			outHtml=(
			<div>
                <h3 className="title">{this.props.Caption}</h3>
                <h4 className="title">{this.props.Caption} 編輯</h4>
				
				<form className="form-horizontal" onSubmit={this.handleSubmit}>
				<div className="col-xs-9">
				    <div className="form-group">
				        <label className="col-xs-2 control-label">發送日期</label>
				            <div className="col-xs-3">
					           	<span className="has-feedback">
								<InputDate id="send_day" 
									onChange={this.changeFDValue} 
									field_name="send_day" 
									value={fieldData.send_day}
									required={true} 
									disabled={fieldData.is_send}/>
								</span>
				            </div>
				        <small className="help-inline col-xs-2 text-danger">(必填)</small>
				    </div>
				    <div className="form-group">
						<label className="col-xs-2 control-label">狀態</label>
						<div className="col-xs-3">
							<div className="radio-inline">
								<label>
									<input type="radio" 
											name="is_complete"
											value={true}
											checked={fieldData.is_complete===true}
											disabled={fieldData.is_send} 
											onChange={this.changeFDValue.bind(this,'is_complete')}
									/>
									<span>完稿</span>
								</label>
							</div>
							<div className="radio-inline">
								<label>
									<input type="radio" 
											name="is_complete"
											value={false}
											checked={fieldData.is_complete===false}
											disabled={fieldData.is_send}
											onChange={this.changeFDValue.bind(this,'is_complete')}
											/>
									<span>草稿</span>
								</label>
							</div>
						</div>	
					</div>
					<div className="form-group">
						<label className="col-xs-2 control-label">排序</label>
						<div className="col-xs-3">
							<input type="number" 
							className="form-control"	
							value={fieldData.sort}
							disabled={fieldData.is_send}
							onChange={this.changeFDValue.bind(this,'sort')}
							 />
						</div>
						<small className="col-xs-2 help-inline">數字越大越前面</small>					
					</div>
					<div className="form-group">
						<label className="col-xs-2 control-label">選擇文案</label>
						<div className="col-xs-5">
							<select className="form-control" 
							value={fieldData.draft_id}
							disabled={fieldData.is_send}
							onChange={this.changeDraftValue.bind(this)}>
							<option value="">無</option>
							{
								this.state.draft_list.map(function(itemData,i) {
									return <option key={i} value={itemData.val}>{itemData.Lname}</option>;
								})
							}
							</select>
						</div>
					</div>					
					<div className="form-group">
						<label className="col-xs-2 control-label">標題</label>
						<div className="col-xs-5">
							<input type="text" 							
							className="form-control"	
							value={fieldData.title}
							onChange={this.changeFDValue.bind(this,'title')}
							maxLength="64"
							required
							disabled={fieldData.is_send} />
						</div>
						<small className="help-inline col-xs-2 text-danger">(必填)</small>
					</div>



					<div className="form-group">

					</div>
					<div className="form-group">
						<label className="col-xs-2 control-label">內容</label>
						<div className="col-xs-5">
							<textarea col="30" rows="5" className="form-control"
							value={fieldData.send_content}
							onChange={this.changeFDValue.bind(this,'send_content')}
							disabled={fieldData.is_send}
							maxLength="256"></textarea>
						</div>
					</div>

				</div>
				<div className="col-xs-12"></div>
				<div className="col-xs-5">
					<div className="text-right">
						<button type="submit" className="btn-primary" name="btn-1"><i className="fa-check"></i> 儲存</button> { }
						<button type="button" onClick={this.noneType}><i className="fa-times"></i> 回前頁</button>
					</div>
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
var GirdSofC = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return {
			gridData:{rows:[],page:1},
			fieldData:{},
			searchData:{main_id:this.props.main_id,name:null},
			edit_type:0,
			checkAll:false,
			grid_right_customer:[],
			grid_left_customer:{rows:[]},
			LeftGridPageIndex:1//左邊元素換頁用參數
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/Product'
		};
	},	
	componentDidMount:function(){
		this.queryLeftCustomer();
		this.queryRightCustomer();
	},
	queryLeftCustomer:function(){
		var parms = {
			page:this.state.LeftGridPageIndex
		};

		$.extend(parms, this.state.searchData);

			jqGet(gb_approot + 'api/GetAction/GetLeftCustomer',parms)
			.done(function(data, textStatus, jqXHRdata) {
				this.setState({grid_left_customer:data});
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
	},	
	queryRightCustomer:function(){
			jqGet(gb_approot + 'api/GetAction/GetRightCustomer',{main_id:this.props.main_id})
			.done(function(data, textStatus, jqXHRdata) {
				this.setState({grid_right_customer:data});
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
	},
	queryChangeElementParam:function(name,e){
		var obj = this.state.searchData;
		obj[name] = e.target.value;
		this.setState({searchData:obj});
		this.queryLeftCustomer();			
	},
	addCustomer:function(customer_id){
			jqPost(gb_approot + 'api/GetAction/PostSendMsgOfCustomer',{send_msg_id:this.props.main_id,customer_id:customer_id})
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					this.queryLeftCustomer();
					this.queryRightCustomer();
				}else{
					alert(data.message);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});		
	},
	removeCustomer:function(customer_id){
			jqDelete(gb_approot + 'api/GetAction/DeleteSendMsgOfCustomer',{send_msg_id:this.props.main_id,customer_id:customer_id})
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					this.queryLeftCustomer();
					this.queryRightCustomer();
				}else{
					alert(data.message);
				}

			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});	
	},
	LeftGridPrev:function(){
		if(this.state.LeftGridPageIndex>1){
			this.state.LeftGridPageIndex --;
			this.queryLeftCustomer();
		}
	},
	LeftGridNext:function() {
		if(this.state.LeftGridPageIndex < this.state.grid_left_customer.total){
			this.state.LeftGridPageIndex ++;
			this.queryLeftCustomer();
		}
	},
	render: function() {
		var outHtml = null;
		var fieldData = {};
		var searchData=this.state.searchData;

		outHtml =(
			<div className="col-xs-12">
			<hr className="expanded" />
				<div className="row">
					<div className="col-xs-6">
						<div className="table-responsive">
							<table className="table-condensed">
								<caption>
								    <div className="form-inline break pull-right">
				                        <div className="form-group">
				                            <input type="text" className="form-control input-sm" placeholder="請輸入關鍵字..."
				                           	value={searchData.name} 
	                						onChange={this.queryChangeElementParam.bind(this,'name')} /> { }
	                						<select name="" id="" className="form-control input-sm"
				                            onChange={this.queryChangeElementParam.bind(this,'customer_type')}
											value={searchData.customer_type}> { }
												<option value="">全部</option>
											    {
												    CommData.CustomerType.map(function(itemData,i) {
												    return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
												    })
											    }
				                            </select> { }	     
				                        </div>
				                    </div>
				                    全部客戶
								</caption>
								<tbody>
									<tr>
										<th className="text-center">分類</th>
										<th>名稱</th>
					                	<th className="text-center">加入</th>
									</tr>
									{
										this.state.grid_left_customer.rows.map(function(itemData,i) {
											var out_sub_html =                     
												<tr key={itemData.customer_id}>
													<td className="text-center"><StateForGrid stateData={CommData.CustomerType} id={itemData.customer_type} /></td>
							                        <td>{itemData.customer_name}</td>
				                        			<td className="text-center">
														<button className="btn-link text-success" type="button" onClick={this.addCustomer.bind(this,itemData.customer_id)}
																disabled={this.props.is_send}>
															<i className="fa-plus"></i>
														</button>
							                        </td>
												</tr>;
											return out_sub_html;
										}.bind(this))
									}
								</tbody>
	        				</table>
	        				<div className="form-inline text-center">
								<ul className="pager list-inline list-unstyled">
									<li><a href="#" onClick={this.LeftGridPrev}><i className="glyphicon glyphicon-arrow-left"></i> 上一頁</a></li>
									<li>{this.state.LeftGridPageIndex +'/' + this.state.grid_left_customer.total}</li>
									<li><a href="#" onClick={this.LeftGridNext}>下一頁 <i className="glyphicon glyphicon-arrow-right"></i></a></li>
								</ul>
							</div>
	        			</div>
        			</div>
					<div className="col-xs-6">
						<div className="table-responsive">
							<table className="table-condensed">
								<caption>已加入發送清單</caption>
								<tbody>
									<tr>
										<th className="text-center">分類</th>
										<th>名稱</th>
					                	<th className="text-center">刪除</th>
									</tr>
									{
										this.state.grid_right_customer.map(function(itemData,i) {
											var out_sub_html =                     
												<tr key={itemData.customer_id}>
													<td className="text-center"><StateForGrid stateData={CommData.CustomerType} id={itemData.customer_type} /></td>
							                        <td>{itemData.customer_name}</td>
				                        			<td className="text-center">
														<button className="btn-link text-danger" type="button" onClick={this.removeCustomer.bind(this,itemData.customer_id)}
																disabled={this.props.is_send}>
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
			</div>

		);

		return outHtml;
	}
});