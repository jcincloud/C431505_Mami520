﻿//主表單
var GirdForm = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return {
			gridData:{rows:[],page:1},
			fieldData:{},
			special_diet:[],
			breakfast:{dishs:[],isHaveData:false},
			lunch:{dishs:[],isHaveData:false},
			dinner:{dishs:[],isHaveData:false},
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
			this.setState({breakfast:data.breakfast,lunch:data.lunch,dinner:data.dinner,special_diet:data.special_diet});
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
		//沒有排餐顯示之html
		var no_data_html=				
				(<tr>
					<td colSpan="2">
						<div className="alert alert-default text-warning">
			                <i className="fa-exclamation-triangle"></i> 目前尚無安排菜單
			            </div>
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
			                                		<span className="label label-warning">{meal_id}</span> { }
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
			                                		<span className="label label-warning">{meal_id}</span> { }
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
			                                		<span className="label label-warning">{meal_id}</span> { }
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
			    <h3 className="title">{this.props.Caption}</h3>
				{/*---搜尋start---*/}
				<form onSubmit={this.handleSearch}>
					<div className="table-header">
						<div className="table-filter">
							<div className="form-inline">
								<div className="form-group">
									<label for="">選擇日期</label>
									<span className="has-feedback">
										<InputDate id="meal_day" ver={2}
										onChange={this.changeGDValue} 
										field_name="meal_day" 
										value={searchData.meal_day} />
									</span> { }
								</div>
								<button className="btn-primary btn-sm" type="submit"><i className="fa-search"></i>{ }搜尋</button> { }
								<button className="btn-success btn-sm" type="button"><i className="fa-print"></i> 列印</button>
							</div>
						</div>
					</div>
				</form>
				<hr />
				<h4 className="title">{searchData.meal_day}</h4>
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
			                                		<span className="label label-danger">{meal_id}</span> { }
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
				<table>
					<tr className="warning">
						<td colSpan="2"><strong>早餐</strong></td>
					</tr>
					<tbody>{breakfast}</tbody>
				</table>
				<hr />
				<table>
					<tr className="warning">
						<td colSpan="2"><strong>午餐</strong></td>
					</tr>
					<tbody>{lunch}</tbody>
				</table>
				<hr />
				<table>
					<tr className="warning">
						<td colSpan="2"><strong>晚餐</strong></td>
					</tr>
					<tbody>{dinner}</tbody>
				</table>
				{/*---報表end---*/}
			</div>
			);
		return outHtml;
	}
});
