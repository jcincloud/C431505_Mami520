var GridRow = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return { 
		};  
	},
	render:function(){
		return (

				<tr>
					<td>{this.props.itemData.record_sn}</td>
					<td>{moment(this.props.itemData.record_day).format('YYYY-MM-DD')}</td>
					<td>{this.props.itemData.customer_name}</td>
					<td>${formatMoney(this.props.itemData.estimate_payable,0)}</td>
					<td>${formatMoney(this.props.itemData.total_money,0)}</td>
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
			option_users:[]
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/GetAction/GetAccountsPayable'
		};
	},	
	componentDidMount:function(){
		this.queryGridData(1);
		//this.querySales();
	},
	shouldComponentUpdate:function(nextProps,nextState){
		return true;
	},
	handleSearch:function(e){
		e.preventDefault();
		this.queryGridData(0);
		return;
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
	querySales:function(){

			jqGet(gb_approot + 'api/GetAction/GetUsers',{})
			.done(function(data, textStatus, jqXHRdata) {
				this.setState({option_users:data});
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
	excelPrint:function(e){
		e.preventDefault();

		var parms = {tid:uniqid()};
		$.extend(parms, this.state.searchData);

		var url_parms = $.param(parms);
		var print_url = gb_approot + 'Base/ExcelReport/downloadExcel_AccountsPayable?' + url_parms;

		this.setState({download_src:print_url});
		return;
	},
	onUsersChange:function(e){
		var obj = this.state.searchData;
		obj['users_id'] = e.target.value;
		this.setState({searchData:obj});
	},
	render: function() {
		var outHtml = null;
		var managerHtml=null;

			var searchData = this.state.searchData;
			// if(!is_sales){
			// 	managerHtml=(
			// 		<span>
			// 			<label className="sr-only">選擇業務</label>
			// 			<select className="form-control"
			// 							id="Users"
			// 							onChange={this.onUsersChange}
			// 							value={searchData.users_id}>
			// 				<option value="">選擇業務</option>
			// 				{
			// 					this.state.option_users.map(function(itemData,i) {
			// 						var out_sub_html =                     
			// 							<option value={itemData.Id} key={itemData.Id}>{itemData.UserName}</option>;
			// 						return out_sub_html;
			// 					}.bind(this))
			// 				}
			// 			</select> { }
			// 		</span>);
			// }

			outHtml =
			(
			<div>
				<h3 className="h3">
					{this.props.Caption}
				</h3>
				<form onSubmit={this.handleSearch}>
					
						<div className="table-header">
							<div className="table-filter">
								<div className="form-inline form-sm">
									<div className="form-group">
										<label className="text-sm">日期區間</label> { }										
											<InputDate id="start_date" ver={2}
												onChange={this.changeGDValue} 
												field_name="start_date" 
												value={searchData.start_date} /> { }
										<label className="text-sm">~</label> { }
											<InputDate id="end_date" ver={2}
												onChange={this.changeGDValue} 
												field_name="end_date" 
												value={searchData.end_date} /> { }
										<label className="text-sm">銷售單號/客戶姓名</label> { }
										<input type="text" className="form-control" 
										value={searchData.word}
										onChange={this.changeGDValue.bind(this,'word')}
										placeholder="請擇一填寫" /> { }
										<button className="btn btn-sm btn-secondary" type="submit"><i className="fa-search"></i> 搜尋</button> { }
										<button className="btn btn-sm btn-info" type="button" onClick={this.excelPrint}><i className="fa-print"></i> 列印</button>
									</div>
								</div>
							</div>
						</div>
						<table className="table table-sm table-bordered table-striped">
							<thead>
								<tr>
									<th style={{"width":"15%;"}}>來源銷售單號</th>
									<th style={{"width":"15%;"}}>來源銷售日期</th>
									<th style={{"width":"20%;"}}>客戶名稱</th>
									<th style={{"width":"25%;"}}>實際應收金額</th>
									<th style={{"width":"25%;"}}>實際已收金額</th>
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
					<iframe src={this.state.download_src} style={ {visibility:'hidden',display:'none'} } />
				</form>
			</div>
			);
		return outHtml;
	}
});