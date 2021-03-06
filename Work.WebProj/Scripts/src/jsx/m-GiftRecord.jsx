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
					<td>{this.props.itemData.record_sn}</td>
					<td>{this.props.itemData.activity_name}</td>
					<td>{this.props.itemData.mom_name}</td>
					<td>{this.props.itemData.sno}</td>
					<td>{this.props.itemData.tel_1}</td>
					<td><StateForGrid stateData={CommData.ReceiveState} id={this.props.itemData.receive_state} /></td>
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
			searchRecordData:{is_close:false},
			edit_type:0,
			checkAll:false,
			activity_list:[],
			isShowRecordSelect:false,
			record_list:[]
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/GiftRecord'
		};
	},	
	componentDidMount:function(){
		this.queryGridData(1);
		this.queryAllActivity();
	},
	shouldComponentUpdate:function(nextProps,nextState){
		return true;
	},
	handleSubmit: function(e) {

		e.preventDefault();
		if(this.state.fieldData.start_date > this.state.fieldData.end_date){
			tosMessage(gb_title_from_invalid,'活動起日不可大於活動迄日!!',3);
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
				ids.push('ids='+this.state.gridData.rows[i].gift_record_id);
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
		var defaultA=this.state.activity_list;
		this.setState({edit_type:1,fieldData:{receive_state:1,activity_id:defaultA[0].val,product_record_id:null}});
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
	queryAllActivity:function(){//選德目前所有贈品活動
		jqGet(gb_approot + 'api/GetAction/GetAllActivity',{})
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({activity_list:data});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});		
	},
	queryAllRecord:function(){//選取產品銷售紀錄主檔list
		var searchRecordData=this.state.searchRecordData;
		searchRecordData.old_id=this.state.fieldData.product_record_id;

		jqGet(gb_approot + 'api/GetAction/GetAllRecord',searchRecordData)
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({record_list:data});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});		
	},
	showSelectRecord:function(){
		this.queryAllRecord();
		this.setState({isShowRecordSelect:true});
	},
	closeSelectRecord:function(){
		this.setState({isShowRecordSelect:false});
	},
	selectRecord:function(product_record_id,customer_id,born_id){
			var fieldData = this.state.fieldData;//選取後變更customer_id,born_id,mealid

			this.state.record_list.forEach(function(obj,i){
				if(product_record_id==obj.product_record_id){
					fieldData.product_record_id=product_record_id;
					fieldData.record_sn=obj.record_sn;
					fieldData.customer_id=customer_id;
					fieldData.born_id=born_id;

					fieldData.customer_name=obj.customer_name;
					fieldData.name=obj.mom_name;
					fieldData.record_day=obj.record_day;
					fieldData.tel_1=obj.tel_1;
					fieldData.tel_2=obj.tel_2;
					fieldData.sno=obj.sno;
					fieldData.birthday=obj.birthday;
					fieldData.tw_zip_1=obj.tw_zip_1;
					fieldData.tw_city_1=obj.tw_city_1;
					fieldData.tw_country_1=obj.tw_country_1;
					fieldData.tw_address_1=obj.tw_address_1;
					fieldData.tw_zip_2=obj.tw_zip_2;
					fieldData.tw_city_2=obj.tw_city_2;
					fieldData.tw_country_2=obj.tw_country_2;
					fieldData.tw_address_2=obj.tw_address_2;
				}
			});

			this.setState({isShowRecordSelect:false,fieldData:fieldData});

	},
	changeGDRecordValue:function(name,e){
		var obj = this.state.searchRecordData;
		obj[name] = e.target.value;
		this.setState({searchRecordData:obj});
		this.queryAllRecord();
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
										<label className="text-sm">銷售單號/媽媽姓名/身分證號/電話</label> { }
										<input type="text" className="form-control" 
										value={searchData.name}
										onChange={this.changeGDValue.bind(this,'name')}
										placeholder="請擇一填寫..." /> { }
						                <label className="text-sm">是否領取</label> { }
						                <select className="form-control"
						                    	value={searchData.receive_state}
												onChange={this.changeGDValue.bind(this,'receive_state')}>
						                        <option value="">全部</option>
												{
													CommData.ReceiveState.map(function(itemData,i) {
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
									<th style={{"width":"7%;"}} className="text-xs-center">
										<label className="c-input c-checkbox">
											<input type="checkbox" checked={this.state.checkAll} onChange={this.checkAll} />
											<span className="c-indicator"></span>
										</label>
									</th>
									<th style={{"width":"7%;"}} className="text-xs-center">修改</th>
					                <th style={{"width":"16%;"}}>銷售單號</th>
					                <th style={{"width":"20%;"}}>活動名稱</th>
					                <th style={{"width":"15%;"}}>媽媽姓名</th>
					                <th style={{"width":"15%;"}}>身分證號</th>
					                <th style={{"width":"13%;"}}>電話1</th>
					                <th style={{"width":"7%;"}}>是否領取</th>
								</tr>
							</thead>
							<tbody>
								{
								this.state.gridData.rows.map(function(itemData,i) {
								return <GridRow 
								key={i}
								ikey={i}
								primKey={itemData.gift_record_id} 
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
			var searchRecordData=this.state.searchRecordData;

			var MdoalRecordSelect=ReactBootstrap.Modal;//啟用選取用餐編號的視窗內容
			var record_select_out_html=null;//存放選取用餐編號的視窗內容
			if(this.state.isShowRecordSelect){
				record_select_out_html =
					<MdoalRecordSelect bsSize="medium" animation={false} onRequestHide={this.closeSelectRecord}>
                        <div className="modal-header">
                            <button className="close" onClick={this.closeSelectRecord}>&times;</button>
                            <h5 className="modal-title text-secondary">選擇產品銷售紀錄</h5>
                        </div>
							<div className="modal-body">
								<div className="alert alert-warning"><p>此列表僅列出<strong className="text-danger">未有過禮品贈送紀錄</strong>的客戶生產紀錄之銷售。</p></div>
							    <div className="table-header">
							        <div className="table-filter">
							            <div className="form-inline form-sm">
							                <div className="form-group">
							                    <label className="text-sm">銷售單號/客戶名稱/媽媽姓名/身分證號</label> { }
							                    <input type="text" className="form-control"
							                    value={searchRecordData.word}
												onChange={this.changeGDRecordValue.bind(this,'word')}
										 		placeholder="請擇一填寫" />
							                </div> { }
							                <div className="form-group">
							                    <label className="text-sm">是否結案</label> { }
							                    <select className="form-control"
							                    value={searchRecordData.is_close}
												onChange={this.changeGDRecordValue.bind(this,'is_close')}>
							                        <option value="">全部</option>
							                        <option value="true">已結案</option>
							                        <option value="false">未結案</option>
							                    </select>
							                </div> { }
							                <div className="form-group">
							                    <label className="text-sm">訂單日期</label> { }
													<InputDate id="start_date" 
													onChange={this.changeGDRecordValue} 
													field_name="start_date" 
													value={searchRecordData.start_date} /> { }
												<label className="text-sm">~</label> { }
													<InputDate id="end_date" 
													onChange={this.changeGDRecordValue} 
													field_name="end_date" 
													value={searchRecordData.end_date} />
							                </div> { }
							                <button className="btn btn-secondary btn-sm" onClick={this.queryAllRecord.bind(this)}><i className="fa-search"></i> 搜尋</button>
							            </div>
							        </div>
							    </div>
								<table className="table table-sm table-bordered table-striped">
									<thead>
										<tr>
											<th style={{"width":"10%;"}} className="text-xs-center">選擇</th>
					            			<th style={{"width":"15%;"}}>銷售單號</th>
					            			<th style={{"width":"15%;"}}>訂單日期</th>
					            			<th style={{"width":"20%;"}}>客戶名稱</th>
					            			<th style={{"width":"15%;"}}>媽媽姓名</th>
					            			<th style={{"width":"15%;"}}>身分證號</th>
					            			<th style={{"width":"10%;"}}>結案?</th>
										</tr>
									</thead>
									<tbody>
										{
											this.state.record_list.map(function(itemData,i) {
												
												var born_out_html = 
													<tr key={itemData.product_record_id}>
														<td className="text-xs-center">
															<label className="c-input c-checkbox">
																<input type="checkbox" onClick={this.selectRecord.bind(this,itemData.product_record_id,itemData.customer_id,itemData.born_id)} />
																<span className="c-indicator"></span>
															</label>
														</td>
														<td>{itemData.record_sn}</td>
														<td>{moment(itemData.record_day).format('YYYY/MM/DD')}</td>
														<td>{itemData.customer_name}</td>
														<td>{itemData.mom_name}</td>
														<td>{itemData.sno}</td>
														<td>{itemData.is_close? <span className="text-muted">結案</span>:<span className="text-danger">未結案</span>}</td>			
													</tr>;
												return born_out_html;
											}.bind(this))
										}
									</tbody>
								</table>
							</div>
							<div className="modal-footer">
								<button className="btn btn-sm btn-blue-grey" onClick={this.closeSelectRecord}><i className="fa-times"></i> { } 關閉</button>
							</div>
					</MdoalRecordSelect>;
			}

			outHtml=(
			<div>
				{record_select_out_html}
                <h3 className="h3">{this.props.Caption}<small className="sub"><i className="fa-angle-double-right"></i> 編輯</small></h3>

				<form className="form form-sm" onSubmit={this.handleSubmit}>

					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 銷售單號</label>
						<div className="col-xs-3">
							<div className="input-group input-group-sm">
								<input type="text" 							
								className="form-control"	
								value={fieldData.record_sn}
								onChange={this.changeFDValue.bind(this,'record_sn')}
								maxLength="128"
								required disabled />
								<span className="input-group-btn">
									<a className="btn btn-success" data-toggle="modal" onClick={this.showSelectRecord} disabled={this.state.edit_type==2} ><i className="fa-plus"></i></a>
								</span>
							</div>
						</div>
						<small className="text-muted col-xs-6">請按 <i className="fa-plus"></i> 選取</small>
					</div>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">訂單日期</label>
						<div className="col-xs-3">
							<InputDate id="record_day" 
								onChange={this.changeFDValue} 
								field_name="record_day" 
								value={fieldData.record_day}
								disabled={true} />
						</div>
						<label className="col-xs-1 form-control-label text-xs-right">訂購總金額</label>
						<div className="col-xs-4">
							<div className="input-group input-group-sm">
								<input type="number" 
									className="form-control"	
									value={fieldData.totle_price}
									onChange={this.changeFDValue.bind(this,'totle_price')}
									disabled />
								<span className="input-group-addon">元</span>
							</div>
						</div>
					</div>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">客戶姓名</label>
						<div className="col-xs-3">
							<input type="text" 
							className="form-control"	
							value={fieldData.customer_name}
							onChange={this.changeFDValue.bind(this,'customer_name')}
							maxLength="64"
							disabled />
						</div>
						<label className="col-xs-1 form-control-label text-xs-right">媽媽姓名</label>
						<div className="col-xs-4">
							<input type="text" 
							className="form-control"	
							value={fieldData.name}
							onChange={this.changeFDValue.bind(this,'name')}
							maxLength="64"
							disabled />
						</div>
					</div>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">聯絡電話1</label>
						<div className="col-xs-3">
							<input type="tel"
                                   className="form-control"
                                   value={fieldData.tel_1}
                                   onChange={this.changeFDValue.bind(this,'tel_1')}
                                   maxLength="16"
                                   disabled />
						</div>
						<label className="col-xs-1 form-control-label text-xs-right">聯絡電話2</label>
						<div className="col-xs-4">
							<input type="tel"
                                   className="form-control"
                                   value={fieldData.tel_2}
                                   onChange={this.changeFDValue.bind(this,'tel_2')}
                                   maxLength="16"
                                   disabled />
						</div>
					</div>

					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">身分證號</label>
						<div className="col-xs-3">
							<input type="text"
                                   className="form-control"
                                   value={fieldData.sno}
                                   onChange={this.changeFDValue.bind(this,'sno')}
                                   maxLength="10"
                                   disabled />
						</div>
						<label className="col-xs-1 form-control-label text-xs-right">生日</label>
						<div className="col-xs-4">
							<span className="has-feedback">
								<InputDate id="birthday"
                                           onChange={this.changeFDValue}
                                           field_name="birthday"
                                           value={fieldData.birthday}
                                           disabled={true} />
							</span>
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
                                   disabled={true} />
					</div>

					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">備用地址</label>
						<TwAddress ver={1}
                                   onChange={this.changeFDValue}
                                   setFDValue={this.setFDValue}
                                   zip_value={fieldData.tw_zip_2}
                                   city_value={fieldData.tw_city_2}
                                   country_value={fieldData.tw_country_2}
                                   address_value={fieldData.tw_address_2}
                                   zip_field="tw_zip_2"
                                   city_field="tw_city_2"
                                   country_field="tw_country_2"
                                   address_field="tw_address_2"
                                   disabled={true} />
					</div>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 參與活動</label>
						<div className="col-xs-8">
							<select className="form-control" 
							value={fieldData.activity_id}
							onChange={this.changeFDValue.bind(this,'activity_id')}>
							{
								this.state.activity_list.map(function(itemData,i) {
									return <option key={itemData.val} value={itemData.val}>{itemData.Lname}</option>;
								})
							}
							</select>
						</div>
					</div>

					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 領取狀態</label>
						<div className="col-xs-8">
								<label className="c-input c-radio">
									<input type="radio" 
											name="receive_state"
											value={1}
											checked={fieldData.receive_state==1} 
											onChange={this.changeFDValue.bind(this,'receive_state')}
									/>
									<span className="c-indicator"></span>
									<span className="text-sm">未領取</span>
								</label>
								<label className="c-input c-radio">
									<input type="radio" 
											name="receive_state"
											value={2}
											checked={fieldData.receive_state==2} 
											onChange={this.changeFDValue.bind(this,'receive_state')}
											/>
									<span className="c-indicator"></span>
									<span className="text-sm">領取部分</span>
								</label>
								<label className="c-input c-radio">
									<input type="radio" 
											name="receive_state"
											value={3}
											checked={fieldData.receive_state==3} 
											onChange={this.changeFDValue.bind(this,'receive_state')}
											/>
									<span className="c-indicator"></span>
									<span className="text-sm">已領完</span>
								</label>
						</div>
					</div>

					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">備註</label>
						<div className="col-xs-8">
							<textarea col="30" rows="3" className="form-control"
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
			</div>
			);
		}else{
			outHtml=(<span>No Page</span>);
		}

		return outHtml;
	}
});