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
					<td>{this.props.itemData.product_name}</td>
					<td><StateForGrid stateData={CommData.ProductType} id={this.props.itemData.product_type} /></td>
					<td>{this.props.itemData.price}</td>
					<td>{this.props.itemData.standard}</td>
					<td>{this.props.itemData.i_Hide?<span className="text-muted">停用</span>:<span className="text-success">啟用</span>}</td>
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
			country_list:[],
			next_id:null,
			meal_array:[
				{name:'breakfast',name_c:'早餐',value:false},
				{name:'lunch',name_c:'午餐',value:false},
				{name:'dinner',name_c:'晚餐',value:false}
			]
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
				ids.push('ids='+this.state.gridData.rows[i].product_id);
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
		this.setState({edit_type:1,fieldData:{product_type:1}});
	},
	updateType:function(id){
		jqGet(this.props.apiPathName,{id:id})
		.done(function(data, textStatus, jqXHRdata) {
			//排餐餐別
			var meal_array=this.state.meal_array;
			if(data.data.meal_type!=undefined){
				var array=data.data.meal_type.split(",");
				meal_array.forEach(function(object, i){
					array.forEach(function(a_obj,j){
						if(object.name==a_obj){
							object.value=true;
						}
					})
	    		})
			}
			this.setState({edit_type:2,fieldData:data.data,meal_array:meal_array});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	noneType:function(){
		var meal_array=this.state.meal_array;
		meal_array.forEach(function(object, i){object.value=false;})

		this.gridData(0)
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({edit_type:0,gridData:data,meal_array:meal_array});
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
	onCityChange:function(e){

		this.listCountry(e.target.value);
		var obj = this.state.searchData;
		obj['city'] = e.target.value;
		this.setState({searchData:obj});
	},
	onCountryChange:function(e){
		var obj = this.state.searchData;
		obj['country'] = e.target.value;
		this.setState({searchData:obj});
	},
	listCountry:function(value){
		for(var i in CommData.twDistrict){
			var item = CommData.twDistrict[i];
			if(item.city==value){
				this.setState({country_list:item.contain});
				break;
			}
		}
	},
	onProductTypeChange:function(e){
		var obj = this.state.searchData;
		obj['product_type'] = e.target.value;
		this.setState({searchData:obj});
		this.queryGridData(0);
	},
	onMealChange:function(index,e){
		var obj = this.state.fieldData;
		var arrayObj=this.state.meal_array;
		var item = arrayObj[index];
		item.value = !item.value;
		
		var array="";
		if(obj.product_type==1){//如果為試吃,只能有一個餐別
			array=item.name;
			arrayObj.forEach(function(object, i){
	        	if(item!=object){
	  				object.value=false;
	        	}
    		})
		}else{
			arrayObj.forEach(function(object, i){
	        	if(object.value){
	        		if(array.length==0){
						array=object.name;
	        		}else{
						array=array+","+object.name;
	        		}	  				
	        	}
    		})
		}
		obj.meal_type=array;
		this.setState({fieldData:obj,meal_array:arrayObj});
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

										 <label className="text-sm">產品名稱</label> { }
										<input type="text" className="form-control" 
										value={searchData.product_name}
										onChange={this.changeGDValue.bind(this,'product_name')}
										placeholder="產品名稱..." /> { }

										<label className="text-sm">產品分類</label> { }
										<select className="form-control" 
												value={searchData.product_type}
												onChange={this.onProductTypeChange}>
											<option value="">全部</option>
										{
											CommData.ProductType.map(function(itemData,i) {
												return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
											})
										}
										</select> { }


										<button className="btn btn-secondary btn-sm" type="submit"><i className="fa-search"></i>{ }搜尋</button>
									</div>
								</div>
							</div>
						</div>
						<table className="table table-sm table-bordered table-striped">
							<thead>
								<tr>
									<th style={{"width":"5%;"}} className="text-xs-center">
										<label className="c-input c-checkbox">
											<input type="checkbox" checked={this.state.checkAll} onChange={this.checkAll} />
											<span className="c-indicator"></span>
										</label>
									</th>
									<th style={{"width":"5%;"}} className="text-xs-center">修改</th>
									<th style={{"width":"25%;"}}>產品名稱</th>
									<th style={{"width":"15%;"}}>產品分類</th>
									<th style={{"width":"15%;"}}>售價</th>
									<th style={{"width":"25%;"}}>規格</th>
									<th style={{"width":"10%;"}}>狀態</th>
								</tr>
							</thead>
							<tbody>
								{
								this.state.gridData.rows.map(function(itemData,i) {
								return <GridRow 
								key={i}
								ikey={i}
								primKey={itemData.product_id} 
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
			var mealHtml=null;
			if(fieldData.product_type==1 || fieldData.product_type==2){
				mealHtml=(
					<div>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">餐別售價</label>
							<div className="col-xs-2">
								<div className="input-group input-group-sm">
									<span className="input-group-addon" id="meal1-1">早</span>
									<input type="number" 							
									className="form-control"	
									value={fieldData.breakfast_price}
									onChange={this.changeFDValue.bind(this,'breakfast_price')}
									required={true}
									min="0"/>
									<span className="input-group-addon">元</span>
								</div>
							</div>
							<div className="col-xs-2">
								<div className="input-group input-group-sm">
									<span className="input-group-addon" id="meal1-2">午</span>
									<input type="number" 							
									className="form-control"	
									value={fieldData.lunch_price}
									onChange={this.changeFDValue.bind(this,'lunch_price')}
									required={true}
									min="0"/>
									<span className="input-group-addon">元</span>
								</div>
							</div>
							<div className="col-xs-2">
								<div className="input-group input-group-sm">
								<span className="input-group-addon" id="meal1-3">晚</span>
								<input type="number" 							
								className="form-control"	
								value={fieldData.dinner_price}
								onChange={this.changeFDValue.bind(this,'dinner_price')}
								required={true}
								min="0"/>
								<span className="input-group-addon">元</span>
							</div>
							</div>
						</div>				
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">用餐餐別</label>
							<div className="col-xs-6">
							{
								this.state.meal_array.map(function(itemData,i) {
									var out_check =<label className="c-input c-checkbox" key={i}>
											<input type="checkbox" 
											checked={itemData.value}
											onChange={this.onMealChange.bind(this,i)}
											/>
											<span className="c-indicator"></span>
											<span className="text-sm">{itemData.name_c}</span>
										</label>;
									return out_check;

								}.bind(this))
							}
							</div>
						</div>
					</div>);
			}
			outHtml=(
			<div>
				<h3 className="h3">{this.props.Caption}<small className="sub"><i className="fa-angle-double-right"></i> 編輯</small></h3>

				<form className="form form-sm" onSubmit={this.handleSubmit}>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 產品分類</label>
						<div className="col-xs-6">
							<select className="form-control" 
							value={fieldData.product_type}
							onChange={this.changeFDValue.bind(this,'product_type')}>
							{
								CommData.ProductType.map(function(itemData,i) {
									return <option  key={itemData.id} value={itemData.id}>{itemData.label}</option>;
								})
							}
							</select>
						</div>
					</div>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 產品名稱</label>
						<div className="col-xs-6">
							<div className="input-group input-group-sm">
								<input type="text" 							
								className="form-control"	
								value={fieldData.product_name}
								onChange={this.changeFDValue.bind(this,'product_name')}
								maxLength="64"
								required />
								<span className="input-group-addon">元</span>
							</div>
						</div>
					</div>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 產品規格</label>
						<div className="col-xs-6">
							<input type="text" 							
							className="form-control"	
							value={fieldData.standard}
							onChange={this.changeFDValue.bind(this,'standard')}
							maxLength="64"
							required />
						</div>
					</div>
					<div className="form-group row"> 
						<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 售價</label>
						<div className="col-xs-6">
							<input type="number" 
							className="form-control"	
							value={fieldData.price}
							onChange={this.changeFDValue.bind(this,'price')} />
						</div>
					</div>
					{mealHtml}
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">排序</label>
						<div className="col-xs-4">
							<input type="number" 
							className="form-control"	
							value={fieldData.sort}
							onChange={this.changeFDValue.bind(this,'sort')}
							 />
						</div>
						<small className="col-xs-6 text-muted">數字愈大愈前面，未填寫視為 0</small>
					</div>			
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">狀態</label>
						<div className="col-xs-4">
							<label className="c-input c-radio">
								<input type="radio" 
										name="i_Hide"
										value={false}
										checked={fieldData.i_Hide===false} 
										onChange={this.changeFDValue.bind(this,'i_Hide')}
										/>
								<span className="c-indicator"></span>
								<span className="text-sm">啟用</span>
							</label>
							<label className="c-input c-radio">
								<input type="radio" 
										name="i_Hide"
										value={true}
										checked={fieldData.i_Hide===true} 
										onChange={this.changeFDValue.bind(this,'i_Hide')}
								/>
								<span className="c-indicator"></span>
								<span className="text-sm">停用</span>
							</label>
						</div>
					</div>					
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">備註</label>
						<div className="col-xs-6">
							<textarea col="30" row="2" className="form-control"
							value={fieldData.memo}
							onChange={this.changeFDValue.bind(this,'memo')}
							maxLength="256"></textarea>
						</div>
					</div>

					<div className="form-action">
						<button type="submit" className="btn btn-sm btn-primary col-xs-offset-1" name="btn-1"><i className="fa-check"></i> 存檔確認</button> { }
						<button type="button" className="btn btn-sm btn-blue-grey" onClick={this.noneType}><i className="fa-times"></i> 回列表</button>
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