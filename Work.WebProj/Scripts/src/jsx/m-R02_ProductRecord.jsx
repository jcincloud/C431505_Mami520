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
					<td>{moment(this.props.itemData.sell_day).format('YYYY-MM-DD')}</td>
					<td>{this.props.itemData.customer_name}</td>
					<td><StateForGrid stateData={CommData.ProductType} id={this.props.itemData.product_type} /></td>
					<td>{this.props.itemData.product_name}</td>
					<td>{this.props.itemData.qty}</td>
					<td>${formatMoney(this.props.itemData.price,0)}</td>
					<td>${formatMoney(this.props.itemData.subtotal,0)}</td>
					<td>{this.props.itemData.user_name}</td>
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
			apiPathName:gb_approot+'api/GetAction/GetProductRecord'
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
		var print_url = gb_approot + 'Base/ExcelReport/downloadExcel_ProductRecord?' + url_parms;

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
				<h3 className="title">
					{this.props.Caption}
				</h3>
				<form onSubmit={this.handleSearch}>
					
						<div className="table-header">
							<div className="table-filter">
								<div className="form-inline break">
									<div className="form-group">
										<label>日期區間</label> { }										
											<span className="has-feedback">
												<InputDate id="start_date" ver={2}
												onChange={this.changeGDValue} 
												field_name="start_date" 
												value={searchData.start_date} />
											</span> { }
										<label>~</label> { }
											<span className="has-feedback">
												<InputDate id="end_date" ver={2}
												onChange={this.changeGDValue} 
												field_name="end_date" 
												value={searchData.end_date} />
											</span> { }
										
										<label>產品分類</label>
										<select className="form-control input-sm"
										onChange={this.changeGDValue.bind(this,'product_type')}
										value={searchData.product_type}>
											<option value="">全部</option>
										{
											CommData.ProductType.map(function(itemData,i) {
												return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
											})
										}
										</select>

										<label>銷售單號/客戶姓名</label> { }
										<input type="text" className="form-control input-sm" 
										value={searchData.word}
										onChange={this.changeGDValue.bind(this,'word')}
										placeholder="請擇一填寫" /> { }

										{/*<label>產品名稱</label> { }
										<input type="text" className="form-control input-sm" 
										value={searchData.product_name}
										onChange={this.changeGDValue.bind(this,'product_name')}
										placeholder="產品名稱..." /> { }*/}

										<button className="btn-primary" type="submit"><i className="fa-search"></i>{ }搜尋</button> { }
										<button className="btn-success" type="button" onClick={this.excelPrint}><i className="fa-print"></i> 列印</button>
									</div>
								</div>
							</div>
						</div>
						<table className="table-condensed">
							<thead>
								<tr>
									<th className="col-xs-1">銷售單號</th>
									<th className="col-xs-1">銷售日期</th>
									<th className="col-xs-1">客戶名稱</th>
									<th className="col-xs-1">產品分類</th>
									<th className="col-xs-1">產品名稱</th>
									<th className="col-xs-1">數量</th>
									<th className="col-xs-1">售價</th>
									<th className="col-xs-1">小計</th>
									<th className="col-xs-1">經手人</th>
								</tr>
							</thead>
							<tbody>
								{
								this.state.gridData.rows.map(function(itemData,i) {
								return <GridRow 
								key={i}
								ikey={i}
								primKey={itemData.record_deatil_id} 
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