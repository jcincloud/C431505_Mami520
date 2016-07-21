//主表單
var GirdForm = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return {
			gridData:{rows:[],page:1},
			fieldData:{},
			matters:{start_meal:{breakfast:[],lunch:[],dinner:[]},
					end_meal:{breakfast:[],lunch:[],dinner:[]},
					pause_meal:{breakfast:[],lunch:[],dinner:[]},
					tryout_meal:{breakfast:0,lunch:0,dinner:0}},
			special_diet:[],
			breakfast:{dishs:[],isHaveData:false,count:0},
			lunch:{dishs:[],isHaveData:false,count:0},
			dinner:{dishs:[],isHaveData:false,count:0},
			searchData:{meal_day:format_Date(getNowDate())}//預設帶今天
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
			this.setState({
				matters:data.matters,
				breakfast:data.breakfast,
				lunch:data.lunch,
				dinner:data.dinner,
				special_diet:data.special_diet
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
	excelPrint:function(e){
		e.preventDefault();

		var parms = {tid:uniqid()};
		$.extend(parms, this.state.searchData);

		var url_parms = $.param(parms);
		var print_url = gb_approot + 'Base/ExcelReport/downloadExcel_DailyMeal?' + url_parms;

		this.setState({download_src:print_url});
		return;
	},
	test:function(){
		jqPost(gb_approot + 'api/GetAction/test',{})
		.done(function(data, textStatus, jqXHRdata) {

		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});		
	},
	render: function() {
		var outHtml = null;
		var searchData=this.state.searchData;
		var matters=this.state.matters;
		//沒有排餐顯示之html
		var no_data_html=				
				(<tr>
					<td colSpan="2">
						<i className="fa-exclamation-triangle"></i> 目前尚無安排菜單
               		</td>
				</tr>);

		var breakfast=[];
		if(this.state.breakfast.isHaveData){
	        this.state.breakfast.dishs.map(function(itemData,i) {                                           
	            var dishs_out_html = 
	                <tr key={'breakfast-'+itemData.constitute_id}>
	                    <td><strong>{itemData.dish_name}</strong></td>
	                    <td>
			            {
			                itemData.meal_diet.map(function(meal_diet,i) {                                           
			                    return (
                                    <span key={meal_diet.dietary_need_id}>
                                    	{'  '+meal_diet.require_name+'('+meal_diet.count+')：'}
			                        {
			                            meal_diet.meal_id.map(function(meal_id,i) {                                           
			                                return (
			                                	<span>
			                                		<span className="label label-lg label-warning">{meal_id}</span> { }
			                                	</span>);
			                            }.bind(this))
			                        }
                                    </span>);
			                }.bind(this))
			            }	                    
	                    </td>                          	
	                </tr>;
	            breakfast.push(dishs_out_html);
	        }.bind(this))
		}else{
			breakfast.push(no_data_html);
		}
		var lunch=[];
		if(this.state.lunch.isHaveData){
	        this.state.lunch.dishs.map(function(itemData,i) {                                           
	            var dishs_out_html = 
	                <tr key={'lunch-'+itemData.constitute_id}>
	                    <td><strong>{itemData.dish_name}</strong></td>
	                    <td>
			            {
			                itemData.meal_diet.map(function(meal_diet,i) {                                           
			                    return (
                                    <span key={meal_diet.dietary_need_id}>
                                    	{'  '+meal_diet.require_name+'('+meal_diet.count+')：'}
			                        {
			                            meal_diet.meal_id.map(function(meal_id,i) {                                           
			                                return (
			                                	<span>
			                                		<span className="label label-lg label-warning">{meal_id}</span> { }
			                                	</span>);
			                            }.bind(this))
			                        }
                                    </span>);
			                }.bind(this))
			            }	                    
	                    </td>                          	
	                </tr>;
	            lunch.push(dishs_out_html);
	        }.bind(this))
		}else{
			lunch.push(no_data_html);
		}

		var dinner=[];
		if(this.state.dinner.isHaveData){
	        this.state.dinner.dishs.map(function(itemData,i) {                                           
	            var dishs_out_html = 
	                <tr key={'dinner-'+itemData.constitute_id}>
	                    <td><strong>{itemData.dish_name}</strong></td>
	                    <td>
			            {
			                itemData.meal_diet.map(function(meal_diet,i) {                                           
			                    return (
                                    <span key={meal_diet.dietary_need_id}>
                                    	{'  '+meal_diet.require_name+'('+meal_diet.count+')：'}
			                        {
			                            meal_diet.meal_id.map(function(meal_id,i) {                                           
			                                return (
			                                	<span>
			                                		<span className="label label-lg label-warning">{meal_id}</span> { }
			                                	</span>);
			                            }.bind(this))
			                        }
                                    </span>);
			                }.bind(this))
			            }	                    
	                    </td>                          	
	                </tr>;
	            dinner.push(dishs_out_html);
	        }.bind(this))
		}else{
			dinner.push(no_data_html);
		}
			outHtml =
			(
			<div>
			    <h3 className="h3">{this.props.Caption}</h3>
				{/*---搜尋start---*/}
				<form onSubmit={this.handleSearch}>
					<div className="table-header">
						<div className="table-filter">
							<div className="form-inline form-sm">
								<div className="form-group">
									<label className="text-sm">選擇日期</label> { }
									<InputDate id="meal_day" ver={2}
										onChange={this.changeGDValue} 
										field_name="meal_day" 
										value={searchData.meal_day} /> { }
								</div> { }
								<button className="btn btn-secondary btn-sm" type="submit"><i className="fa-search"></i> 搜尋</button> { }
								<button className="btn btn-info btn-sm" type="button" onClick={this.excelPrint}><i className="fa-print"></i> 列印</button>
							</div>
						</div>
					</div>
				</form>
				<hr />
				<h4 className="h4">{searchData.meal_day}</h4>
				{/*---搜尋end---*/}
				{/*---報表start---*/}
				<table className="table table-bordered table-striped">
					<tr className="table-success">
						<td><strong>當日事項</strong></td>
					</tr>
					<tr>
						<td>
						停早({matters.pause_meal.breakfast.length})：
			            {
			                matters.pause_meal.breakfast.map(function(meal_id,i) {                                           
			                    return (
			                        <span>
			                            <span className="label label-lg label-success">{meal_id}</span> { }
			                        </span>);
			                }.bind(this))
			            }
						停午({matters.pause_meal.lunch.length})：
			            {
			                matters.pause_meal.lunch.map(function(meal_id,i) {                                           
			                    return (
			                        <span>
			                            <span className="label label-lg label-success">{meal_id}</span> { }
			                        </span>);
			                }.bind(this))
			            }
						停晚({matters.pause_meal.dinner.length})：
			            {
			                matters.pause_meal.dinner.map(function(meal_id,i) {                                           
			                    return (
			                        <span>
			                            <span className="label label-lg label-success">{meal_id}</span> { }
			                        </span>);
			                }.bind(this))
			            }
						</td>
					</tr>
					<tr>
						<td>
						早開始({matters.start_meal.breakfast.length})：
			            {
			                matters.start_meal.breakfast.map(function(meal_id,i) {                                           
			                    return (
			                        <span>
			                            <span className="label label-lg label-success">{meal_id}</span> { }
			                        </span>);
			                }.bind(this))
			            }
						午開始({matters.start_meal.lunch.length})：
			            {
			                matters.start_meal.lunch.map(function(meal_id,i) {                                           
			                    return (
			                        <span>
			                            <span className="label label-lg label-success">{meal_id}</span> { }
			                        </span>);
			                }.bind(this))
			            }
						晚開始({matters.start_meal.dinner.length})：
			            {
			                matters.start_meal.dinner.map(function(meal_id,i) {                                           
			                    return (
			                        <span>
			                            <span className="label label-lg label-success">{meal_id}</span> { }
			                        </span>);
			                }.bind(this))
			            }
						</td>
					</tr>
					<tr>
						<td>
						早結束({matters.end_meal.breakfast.length})：
			            {
			                matters.end_meal.breakfast.map(function(meal_id,i) {                                           
			                    return (
			                        <span>
			                            <span className="label label-lg label-success">{meal_id}</span> { }
			                        </span>);
			                }.bind(this))
			            }
						午結束({matters.end_meal.lunch.length})：
			            {
			                matters.end_meal.lunch.map(function(meal_id,i) {                                           
			                    return (
			                        <span>
			                            <span className="label label-lg label-success">{meal_id}</span> { }
			                        </span>);
			                }.bind(this))
			            }
						晚結束({matters.end_meal.dinner.length})：
			            {
			                matters.end_meal.dinner.map(function(meal_id,i) {                                           
			                    return (
			                        <span>
			                            <span className="label label-lg label-success">{meal_id}</span> { }
			                        </span>);
			                }.bind(this))
			            }
						</td>
					</tr>
					<tr>
						<td>
						早試吃({matters.tryout_meal.breakfast})、
						午試吃({matters.tryout_meal.lunch})、
						晚試吃({matters.tryout_meal.dinner})
						</td>
					</tr>
				</table>
				<hr />
				<table className="table table-bordered table-striped">
					<tr className="table-danger">
						<td><strong>特殊飲食</strong></td>
					</tr>
					<tr>
						<td>
						{
                            this.state.special_diet.map(function(itemData,i) {                                           
                                var special_out_html = 
                                    <span key={itemData.dietary_need_id}>
                                    	{'  '+itemData.require_name+'('+itemData.count+')：'}
			                        {
			                            itemData.meal_id.map(function(meal_id,i) {                                           
			                                return (
			                                	<span>
			                                		<span className="label label-lg label-danger">{meal_id}</span> { }
			                                	</span>);
			                            }.bind(this))
			                        }
                                    </span>;
                                return special_out_html;
                            }.bind(this))
                        }
						</td>
					</tr>
				</table>
				<hr />
				<table className="table table-bordered table-striped">
					<tr className="table-warning">
						<td colSpan="2"><strong>早餐({this.state.breakfast.count})</strong></td>
					</tr>
					{breakfast}
				</table>
				<hr />
				<table className="table table-bordered table-striped">
					<tr className="table-warning">
						<td colSpan="2"><strong>午餐({this.state.lunch.count})</strong></td>
					</tr>
					{lunch}
				</table>
				<hr />
				<table className="table table-bordered table-striped">
					<tr className="table-warning">
						<td colSpan="2"><strong>晚餐({this.state.dinner.count})</strong></td>
					</tr>
					{dinner}
				</table>
				{/*---報表end---*/}
				<iframe src={this.state.download_src} style={ {visibility:'hidden',display:'none'} } />
			</div>
			);
		return outHtml;
	}
});
