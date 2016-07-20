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
					<td className="text-xs-center"><GridButtonModify modify={this.modify}/></td>
					<td>{this.props.itemData.record_sn}</td>
					<td>{this.props.itemData.customer_name}</td>
					<td>{this.props.itemData.sno}</td>
					<td>{this.props.itemData.tel_1}</td>		
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
			apiPathName:gb_approot+'api/AccountsPayable'
		};
	},	
	componentDidMount:function(){
		if(gb_main_id==0){
            this.queryGridData(1);
        }else{//有帶id的話,直接進入修改頁面
            this.updateType(gb_main_id);
        }
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
				ids.push('ids='+this.state.gridData.rows[i].accounts_payable_id);
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
	onSelectChange:function(name,e){
		var obj = this.state.searchData;
		obj[name] = e.target.value;
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
										<label className="text-sm">客戶名稱/身分證號/電話/來源銷售單號</label> { }
										<input type="text" className="form-control input-sm" 
										value={searchData.word}
										onChange={this.changeGDValue.bind(this,'word')}
										placeholder="請擇一填寫..." /> { }

										<button className="btn btn-secondary btn-sm" type="submit"><i className="fa-search"></i>{ }搜尋</button>
									</div>
								</div>
							</div>
						</div>
						<table className="table table-sm table-bordered table-striped">
							<thead>
								<tr>
									<th style={{"width":"10%;"}} className="text-xs-center">修改</th>
					                <th style={{"width":"20%;"}}>銷售單號</th>
					                <th style={{"width":"25%;"}}>客戶名稱</th>
					                <th style={{"width":"25%;"}}>身分證號</th>
					                <th style={{"width":"20%;"}}>電話1</th>
								</tr>
							</thead>
							<tbody>
								{
								this.state.gridData.rows.map(function(itemData,i) {
								return <GridRow 
								key={i}
								ikey={i}
								primKey={itemData.accounts_payable_id} 
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
					showAdd={false}
					showDelete={false}
					/>
				</form>
			</div>
			);
		}
		else if(this.state.edit_type==1 || this.state.edit_type==2)
		{
			var fieldData = this.state.fieldData;

			var detail_out_html=null;
			if(this.state.edit_type==2){
				detail_out_html=
				<SubForm ref="SubForm" 
				main_id={fieldData.accounts_payable_id}
				customer_id={fieldData.customer_id}
				product_record_id={fieldData.product_record_id}
				noneType={this.noneType}
				main_total={fieldData.estimate_payable} />;
			}

			outHtml=(
			<div>
				<h3 className="h3">{this.props.Caption}<small className="sub"><i className="fa-angle-double-right"></i> 主檔</small></h3>

				<form className="form form-sm" role="form" onSubmit={this.handleSubmit}>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">客戶姓名</label>
							<div className="col-xs-4">
								<input type="text"
                                className="form-control"
                                value={fieldData.customer_name}
                                onChange={this.changeFDValue.bind(this,'customer_name')}
                                maxLength="64"
                                disabled />
							</div>
							<label className="col-xs-2 form-control-label text-xs-right">來源銷售單號</label>
							<div className="col-xs-4">
								<input type="text"
                                className="form-control"
                                value={fieldData.record_sn}
                                onChange={this.changeFDValue.bind(this,'record_sn')}
                                maxLength="64"
                                disabled />
							</div>
						</div>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">連絡電話1</label>
							<div className="col-xs-4">
								<input type="tel"
                                className="form-control"
                                value={fieldData.tel_1}
                                onChange={this.changeFDValue.bind(this,'tel_1')}
                                maxLength="16"
                                disabled />
							</div>
							<label className="col-xs-2 form-control-label text-xs-right">連絡電話2</label>
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
							<label className="col-xs-1 form-control-label text-xs-right">預計應收</label>
							<div className="col-xs-4">
								<div className="input-group input-group-sm">
									<input type="number"
	                                className="form-control"
	                                value={fieldData.estimate_payable}
	                                onChange={this.changeFDValue.bind(this,'estimate_payable')}
	                                disabled />
	                                <span className="input-group-addon">元</span>
								</div>
							</div>
							<label className="col-xs-2 form-control-label text-xs-right">試算應收</label>
							<div className="col-xs-4">
                                <div className="input-group input-group-sm">
									<input type="number"
	                                className="form-control"
	                                value={fieldData.trial_payable}
	                                onChange={this.changeFDValue.bind(this,'trial_payable')}
	                                disabled />
	                                <span className="input-group-addon">元</span>
								</div>
							</div>
						</div>
				</form>
				
				{/*---應收帳款明細---*/}
				{detail_out_html}


			</div>
			);
		}else{
			outHtml=(<span>No Page</span>);
		}

		return outHtml;
	}
});

//明細檔編輯
var SubForm = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return {
			gridSubData:[],
			fieldSubData:{},
			searchData:{name:null,product_type:null},
			Total_Money:0,
			edit_sub_type:1
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldSubData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/AccountsPayableDetail'
		};
	},
	componentDidMount:function(){
		this.queryAccountsPayableDetail();
		this.insertSubType();
	},
	shouldComponentUpdate:function(nextProps,nextState){
		return true;
	},
	queryAccountsPayableDetail:function(){
		jqGet(gb_approot + 'api/GetAction/GetAccountsPayableDetail',{main_id:this.props.main_id})
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({gridSubData:data.items,Total_Money:data.total});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});		
	},
	detailHandleSubmit:function(e){//新增 
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
					this.queryAccountsPayableDetail();
					this.insertSubType();
				}else{
					tosMessage(null,data.message,3);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
	    }else if(this.state.edit_sub_type==2){
			jqPut(this.props.apiPathName,this.state.fieldSubData)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					if(data.message!=null){
						tosMessage(null,'修改完成'+data.message,1);
					}else{
						tosMessage(null,'修改完成',1);
					}
					this.queryAccountsPayableDetail();
					this.insertSubType();
				}else{
					tosMessage(null,data.message,3);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
	    }

		return;
	},
	detailDeleteSubmit:function(id,e){

		if(!confirm('確定是否刪除?')){
			return;
		}
		jqDelete(this.props.apiPathName + '?ids=' +id ,{})			
		.done(function(data, textStatus, jqXHRdata) {
			if(data.result){
				tosMessage(null,'刪除完成',1);
				this.queryAccountsPayableDetail();
				this.insertSubType();
			}else{
				tosMessage(null,data.message,3);
			}
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	insertSubType:function(){
		this.setState({
			edit_sub_type:1,
			fieldSubData:{
			accounts_payable_id:this.props.main_id,
			customer_id:this.props.customer_id,
			meal_type:0,
			receipt_day:format_Date(getNowDate()),
			receipt_person:1,
			receipt_item:1,
			receipt_sn:null,
			actual_receipt:0
		}});
	},
	updateSubType:function(id,e){
		jqGet(this.props.apiPathName,{id:id})
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({edit_sub_type:2,fieldSubData:data.data});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	changeFDValue:function(name,e){
		var obj = this.state.fieldSubData;
		obj[name] = e.target.value;

		this.setState({fieldSubData:obj});
	},
	setProductRecord:function(){
        //返回產品銷售
        document.location.href = gb_approot + 'Active/Product/ProductRecord?product_record_id=' + this.props.product_record_id;
    },  
	render: function() {
		var outHtml = null;
		var fieldSubData=this.state.fieldSubData;
		var editor_html=null;
		var editor_colspan=4;
		if(gb_roles=='Managers'){
			editor_html=<th style={{"width":"10%;"}} className="text-xs-center">編輯</th>;
			editor_colspan=5;
		}
			outHtml =
			(
				<div>
				{/*---新增收款明細start---*/}
					<hr className="lg" />
					<h3 className="h3">新增收款明細</h3>

					<form className="form form-sm" role="form" id="detailForm" onSubmit={this.detailHandleSubmit}>
							<div className="form-group row">
								<label className="col-xs-1 form-control-label text-xs-right">收款日期</label>
								<div className="col-xs-5">
					                <span className="has-feedback">
										<InputDate id="receipt_day" 
										onChange={this.changeFDValue} 
										field_name="receipt_day" 
										value={fieldSubData.receipt_day}
										required={true} />
									</span>
								</div>
								<label className="col-xs-1 form-control-label text-xs-right">收款單號</label>
								<div className="col-xs-4">
									<input type="text"
                                    className="form-control"
                                    value={fieldSubData.receipt_sn}
                                    onChange={this.changeFDValue.bind(this,'receipt_sn')}
                                    maxLength="10"
                                    required />
								</div>
							</div>
							<div className="form-group row">
								<label className="col-xs-1 form-control-label text-xs-right">收款餐別</label>
								<div className="col-xs-2">
				                    <select className="form-control"
				                    value={fieldSubData.meal_type}
				                    onChange={this.changeFDValue.bind(this,'meal_type')}>
						                {
											CommData.MealTypeByAccountsPayable.map(function(itemData,i) {
											return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
											})
										}
				                    </select>
								</div>
								<label className="col-xs-1 form-control-label text-xs-right">項目</label>
								<div className="col-xs-2">
				                    <select className="form-control"
				                    value={fieldSubData.receipt_item}
				                    onChange={this.changeFDValue.bind(this,'receipt_item')}>
						                {
											CommData.ReceiptItemType.map(function(itemData,i) {
											return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
											})
										}
				                    </select>
								</div>
								<label className="col-xs-1 form-control-label text-xs-right">收款人員</label>
								<div className="col-xs-4">
				                    <select className="form-control"
				                    value={fieldSubData.receipt_person}
				                    onChange={this.changeFDValue.bind(this,'receipt_person')}>
						                {
											CommData.ReceiptPersonType.map(function(itemData,i) {
											return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
											})
										}
				                    </select>
								</div>
							</div>
							<div className="form-group row">
								<label className="col-xs-1 form-control-label text-xs-right">本次實收</label>
								<div className="col-xs-10">
									<div className="input-group input-group-sm">
										<input type="number"
	                                    className="form-control"
	                                    value={fieldSubData.actual_receipt}
	                                    onChange={this.changeFDValue.bind(this,'actual_receipt')}
	                                    required />
	                                    <span className="input-group-addon">元</span>
									</div>
								</div>
							</div>
							<div className="form-action">
								<button type="submit" form="detailForm" className="btn btn-sm btn-primary col-xs-offset-1"><i className="fa-check"></i> 存檔確認</button> { }
								<button type="button" className="btn btn-sm btn-blue-grey" onClick={this.insertSubType}><i className="fa-times"></i> 取消</button> { }
								<button type="button" className="btn btn-sm btn-blue-grey col-xs-offset-6" onClick={this.props.noneType}><i className="fa-arrow-left"></i> 回列表</button> { }
                            	<button type="button" className="btn btn-sm btn-info" onClick={this.setProductRecord.bind(this)}><i className="fa-undo"></i> 回產品銷售</button>
							</div>
					</form>
				{/*---新增收款明細end---*/}
					<hr className="lg" />
				{/*---收款明細列表start---*/}
					<h3 className="h3">收款明細</h3>
					<div className="table-header">
						【實收 <strong className="text-danger">${formatMoney(this.state.Total_Money,0)}</strong>】 { }
						【未收 <strong className="text-danger">${formatMoney(this.props.main_total-this.state.Total_Money,0)}</strong>】
					</div>
					<table className="table table-sm table-bordered table-striped">
								<thead>
									<tr>
										{editor_html}
										<th style={{"width":"15%;"}}>收款日期</th>
										<th style={{"width":"10%;"}} className="text-xs-center">收款餐別</th>
										<th style={{"width":"15%;"}}>收款人員</th>
										<th style={{"width":"10%;"}}>收款項目</th>
										<th style={{"width":"20%;"}}>收款單號</th>
										<th style={{"width":"20%;"}}>本次實收</th>
									</tr>
								</thead>
								<tbody>
									{
										this.state.gridSubData.map(function(itemData,i) {
											var button_html=null;
											if(gb_roles=='Managers'){
												button_html=(
													<td className="text-xs-center">
														<button className="btn btn-link btn-lg text-info" type="button" onClick={this.updateSubType.bind(this,itemData.accounts_payable_detail_id)}><i className="fa-pencil"></i></button> { }
														<button className="btn btn-link btn-lg text-danger" onClick={this.detailDeleteSubmit.bind(this,itemData.accounts_payable_detail_id)} disabled={this.props.is_close}><i className="fa-trash"></i></button>
													</td>
													);
											}								
											var detail_out_html = 
												<tr key={itemData.accounts_payable_detail_id}>
													{button_html}												
													<td>{moment(itemData.receipt_day).format('YYYY/MM/DD')}</td>
													<td className="text-xs-center"><StateForGrid stateData={CommData.MealTypeByAccountsPayable} id={itemData.meal_type} /></td>
													<td><StateForGrid stateData={CommData.ReceiptPersonType} id={itemData.receipt_person} /></td>
													<td><StateForGrid stateData={CommData.ReceiptItemType} id={itemData.receipt_item} /></td>
													<td>{itemData.receipt_sn}</td>
													<td>${formatMoney(itemData.actual_receipt,0)}</td>
												</tr>;
											return detail_out_html;
										}.bind(this))
									}
									<tr className="table-warning">
										<th className="text-xs-center text-danger" colSpan={editor_colspan}>總計</th>
										<th>未收：<span className="text-danger">${formatMoney(this.props.main_total-this.state.Total_Money,0)}</span></th>
										<th>實收：<span className="text-danger">${formatMoney(this.state.Total_Money,0)}</span></th>
									</tr>
								</tbody>
					</table>
				{/*---收款明細列表end---*/}

				</div>
			);

		return outHtml;
	}
});