//主表單
var GirdForm = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return {
			gridData:{rows:[],page:1},
			fieldData:{},
			searchData:{meal_day:moment(Date()).format('YYYY/MM/DD')}//預設帶今天
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/GetAction/GetDailyMealInfo'
		};
	},	
	componentDidMount:function(){
		this.queryGridData();
	},
	shouldComponentUpdate:function(nextProps,nextState){
		return true;
	},
	handleSearch:function(e){
		e.preventDefault();
		this.queryGridData();
		return;
	},
	queryGridData:function(){
		jqGet(this.props.apiPathName,this.state.searchData)
		.done(function(data, textStatus, jqXHRdata) {
			console.log(data);
			this.setState({fieldData:data});
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
	excelPrint:function(e){
		e.preventDefault();

		var parms = {tid:uniqid()};
		$.extend(parms, this.state.searchData);

		var url_parms = $.param(parms);
		var print_url = gb_approot + 'Base/ExcelReport/downloadExcel_CustomerVisit?' + url_parms;

		this.setState({download_src:print_url});
		return;
	},
	render: function() {
		var outHtml = null;
		var searchData=this.state.searchData;
		var fieldData=this.state.fieldData;
			outHtml =
			(
			<div>
			    <h3 className="title">{this.props.Caption}</h3>
				{/*---搜尋start---*/}
				<div className="table-header">
					<div className="table-filter">
						<div className="form-inline">
							<div className="form-group">
								<label for="">選擇日期</label>
								<span className="has-feedback">
									<InputDate id="meal_day" 
									onChange={this.changeGDValue} 
									field_name="meal_day" 
									value={searchData.meal_day} />
								</span> { }
							</div>
							<button className="btn-success btn-sm"><i className="fa-print"></i> 列印</button>
						</div>
					</div>
				</div>
				<hr />
				<h4 className="title">{moment(searchData.meal_day).format('YYYY/MM/DD')}</h4>
				{/*---搜尋end---*/}
				{/*---報表start---*/}
				<table>
					<tr className="success">
						<td><strong>當日事項</strong></td>
					</tr>
					<tr>
						<td>停早(2)：<span className="label label-success">A001</span>　停午(2)：<span className="label label-success">A001</span>　停晚(2)：<span className="label label-success">A001</span></td>
					</tr>
					<tr>
						<td>早開始(2)：<span className="label label-success">A001</span>　午開始(2)：<span className="label label-success">A001</span>　晚開始(2)：<span className="label label-success">A001</span></td>
					</tr>
					<tr>
						<td>早結束(2)：<span className="label label-success">A001</span>　午結束(2)：<span className="label label-success">A001</span>　晚結束(2)：<span className="label label-success">A001</span></td>
					</tr>
				</table>
				<hr />
				<table>
					<tr className="danger">
						<td><strong>特殊飲食</strong></td>
					</tr>
					<tr>
						<td>去油(2)：<span className="label label-danger">A001</span>　清淡(2)：<span className="label label-danger">A001</span>　蛋奶素(2)：<span className="label label-danger">A001</span></td>
					</tr>
				</table>
				<hr />
				<MealDiet ref="Breakfast"
				MealDietData={fieldData.breakfast}
				MealName={'早餐'} />
				<hr />
				<MealDiet ref="Lunch"
				MealDietData={fieldData.lunch}
				MealName={'午餐'} />
				<hr />
				<MealDiet ref="Dinner"
				MealDietData={fieldData.dinner}
				MealName={'晚餐'} />
				{/*---報表end---*/}
			</div>
			);
		return outHtml;
	}
});

//每日菜單-早餐、午餐、晚餐
var MealDiet = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return {
		};  
	},
	getDefaultProps:function(){
		return{	
			MealName:null,
			MealDietData:{isHaveData:false}
		};
	},	
	componentDidMount:function(){
		console.log(this.props.MealDietData);
	},
	shouldComponentUpdate:function(nextProps,nextState){
		return true;
	},
	render: function() {
		var outHtml = null;
		var MealDietData=this.props.MealDietData;
		if(MealDietData.isHaveData){//先判斷有無資料
			outHtml =
			(
			<div>
				<table>
					<tr className="warning">
						<td colSpan="2"><strong>{this.props.MealName}</strong></td>
					</tr>
					<tr>
						<td><strong>麻油雞</strong></td>
						<td>不薑(2)：<span className="label label-warning">A001</span>　不酒(2)：<span className="label label-warning">A001</span></td>
					</tr>
					<tr>
						<td><strong>麻油雞</strong></td>
						<td>不薑(2)：<span className="label label-warning">A001</span>　不酒(2)：<span className="label label-warning">A001</span></td>
					</tr>
				</table>
			</div>
			);
		}else{
			outHtml =
			(
			<div>
				<table>
					<tr className="warning">
						<td colSpan="2"><strong>{this.props.MealName}</strong></td>
					</tr>
					<tr>
						<td>
							<div className="alert alert-default">
			                    <i className="fa-exclamation-triangle"></i> 目前尚無安排菜單
			                </div>
                		</td>
					</tr>
				</table>
			</div>
			);
		}
		return outHtml;
	}
});