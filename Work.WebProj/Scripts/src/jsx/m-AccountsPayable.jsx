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
					<td className="text-center"><GridButtonModify modify={this.modify}/></td>
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
				<h3 className="title">{this.props.Caption} 列表</h3>

				<form onSubmit={this.handleSearch}>
					
						<div className="table-header">
							<div className="table-filter">
								<div className="form-inline">
									<div className="form-group">
										<label>客戶名稱/身分證號/電話/來源銷售單號</label> { }
										<input type="text" className="form-control input-sm" 
										value={searchData.word}
										onChange={this.changeGDValue.bind(this,'word')}
										placeholder="請擇一填寫..." /> { }

										<button className="btn-primary btn-sm" type="submit"><i className="fa-search"></i>{ }搜尋</button>
									</div>
								</div>
							</div>
						</div>
						<table className="table-condensed">
							<thead>
								<tr>
									<th className="col-xs-1 text-center">修改</th>
					                <th className="col-xs-2">銷售單號</th>
					                <th className="col-xs-2">客戶名稱</th>
					                <th className="col-xs-2">身分證號</th>
					                <th className="col-xs-2">電話1</th>
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
				noneType={this.noneType} />;
			}

			outHtml=(
			<div>
				<h3 className="title">{this.props.Caption} 主檔</h3>

				<form className="form-horizontal clearfix" role="form" onSubmit={this.handleSubmit}>
					<div className="col-xs-9">
						<div className="form-group">
							<label className="col-xs-2 control-label">客戶姓名</label>
							<div className="col-xs-4">
								<input type="text"
                                className="form-control"
                                value={fieldData.customer_name}
                                onChange={this.changeFDValue.bind(this,'customer_name')}
                                maxLength="64"
                                disabled />
							</div>
							<label className="col-xs-2 control-label">來源銷售單號</label>
							<div className="col-xs-4">
								<input type="text"
                                className="form-control"
                                value={fieldData.record_sn}
                                onChange={this.changeFDValue.bind(this,'record_sn')}
                                maxLength="64"
                                disabled />
							</div>
						</div>
						<div className="form-group">
							<label className="col-xs-2 control-label">連絡電話1</label>
							<div className="col-xs-4">
								<input type="tel"
                                className="form-control"
                                value={fieldData.tel_1}
                                onChange={this.changeFDValue.bind(this,'tel_1')}
                                maxLength="16"
                                disabled />
							</div>
							<label className="col-xs-2 control-label">連絡電話2</label>
							<div className="col-xs-4">
								<input type="tel"
                                className="form-control"
                                value={fieldData.tel_2}
                                onChange={this.changeFDValue.bind(this,'tel_2')}
                                maxLength="16"
                                disabled />
							</div>
						</div>
						<div className="form-group">
							<label className="col-xs-2 control-label">預計應收</label>
							<div className="col-xs-4">
								<input type="number"
                                className="form-control"
                                value={fieldData.estimate_payable}
                                onChange={this.changeFDValue.bind(this,'estimate_payable')}
                                disabled />
							</div>
							<label className="col-xs-2 control-label">試算應收</label>
							<div className="col-xs-4">
								<input type="number"
                                className="form-control"
                                value={fieldData.trial_payable}
                                onChange={this.changeFDValue.bind(this,'trial_payable')}
                                disabled />
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
			Total_Money:0
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
		return;
	},
	insertSubType:function(){
		this.setState({fieldSubData:{
			accounts_payable_id:this.props.main_id,
			customer_id:this.props.customer_id,
			meal_type:0,
			receipt_person:1,
			receipt_item:1,
			receipt_sn:null,
			actual_receipt:0
		}});
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

			outHtml =
			(
				<div>
				{/*---新增收款明細start---*/}
					<hr className="condensed" />
					<h4 className="title">新增收款明細</h4>

					<form className="form-horizontal clearfix" role="form" id="detailForm" onSubmit={this.detailHandleSubmit}>
						<div className="col-xs-9">
							<div className="form-group">
								<label className="col-xs-2 control-label">收款日期</label>
								<div className="col-xs-4">
					                <span className="has-feedback">
										<InputDate id="receipt_day" 
										onChange={this.changeFDValue} 
										field_name="receipt_day" 
										value={fieldSubData.receipt_day}
										required={true} />
									</span>
								</div>
							</div>
							<div className="form-group">
								<label className="col-xs-2 control-label">收款餐別</label>
								<div className="col-xs-4">
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
							</div>
							<div className="form-group">
								<label className="col-xs-2 control-label">收款人員</label>
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
							<div className="form-group">
								<label className="col-xs-2 control-label">收款項目</label>
								<div className="col-xs-4">
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
							</div>
							<div className="form-group">
								<label className="col-xs-2 control-label">收款單號</label>
								<div className="col-xs-4">
									<input type="text"
                                    className="form-control"
                                    value={fieldSubData.receipt_sn}
                                    onChange={this.changeFDValue.bind(this,'receipt_sn')}
                                    maxLength="10"
                                    required />
								</div>
							</div>
							<div className="form-group">
								<label className="col-xs-2 control-label">本次實收</label>
								<div className="col-xs-4">
									<input type="number"
                                    className="form-control"
                                    value={fieldSubData.actual_receipt}
                                    onChange={this.changeFDValue.bind(this,'actual_receipt')}
                                    required />
								</div>
							</div>
							<div className="form-action">
								<p className="text-right">
									<button type="submit" form="detailForm" className="btn-primary"><i className="fa-check"></i> 存檔確認</button> { }
									<button type="button" onClick={this.props.noneType}><i className="fa-times"></i> 回列表</button> { }
                            		<button type="button" className="btn-info" onClick={this.setProductRecord.bind(this)}><i className="fa-undo"></i> 回產品銷售</button>
								</p>
							</div>
						</div>
					</form>
				{/*---新增收款明細end---*/}
					<hr className="condensed" />
				{/*---收款明細列表start---*/}
					<h4 className="title">
						收款明細：
						<span className="text-muted">
							實際已收 <strong className="text-danger">${formatMoney(this.state.Total_Money,0)}</strong>
						</span>
					</h4>

					<div className="row">
						<div className="col-xs-9">
							<table className="table-condensed">
								<tbody>
									<tr>
										<th className="col-xs-2 text-center">收款日期</th>
										<th className="col-xs-2 text-center">收款餐別</th>
										<th className="col-xs-2 text-center">收款人員</th>
										<th className="col-xs-2 text-center">收款項目</th>
										<th className="col-xs-2">收款單號</th>
										<th className="col-xs-2">本次實收</th>
									</tr>
									{
										this.state.gridSubData.map(function(itemData,i) {										
											var detail_out_html = 
												<tr key={itemData.accounts_payable_detail_id}>
													<td className="text-center">{moment(itemData.receipt_day).format('YYYY/MM/DD')}</td>
													<td className="text-center"><StateForGrid stateData={CommData.MealTypeByAccountsPayable} id={itemData.meal_type} /></td>
													<td className="text-center"><StateForGrid stateData={CommData.ReceiptPersonType} id={itemData.receipt_person} /></td>
													<td className="text-center"><StateForGrid stateData={CommData.ReceiptItemType} id={itemData.receipt_item} /></td>
													<td>{itemData.receipt_sn}</td>
													<td>${formatMoney(itemData.actual_receipt,0)}</td>
												</tr>;
											return detail_out_html;
										}.bind(this))
									}
								</tbody>
							</table>
						</div>
					</div>
				{/*---收款明細列表end---*/}

				</div>
			);

		return outHtml;
	}
});