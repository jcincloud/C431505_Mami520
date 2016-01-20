var ReactTypeahead = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return {
		};  
	},
	getDefaultProps:function(){
		return{	
			value:null,
			fieldName:null,
			inputClass:null,
			onCompleteChange:null,
			index:0,
			apiPath:null,
			disabled:false
		};
	},
	componentDidMount:function(){
	},
	shouldComponentUpdate:function(nextProps,nextState){
		return true;
	},
	gridData:function(){
		var parms = {
			main_id:this.props.main_id
		};
		$.extend(parms, this.state.searchData);

		return jqGet(this.props.apiPathName,parms);
	},
	queryGridData:function(){
		this.gridData()
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({gridSearchData:data});
		}.bind(this))
		.fail(function(jqXHR, textStatus, errorThrown) {
			showAjaxError(errorThrown);
		});
	},
	changeGDValue:function(name,e){
		this.setInputValue(this.props.gdName,name,e);
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
		this.setState({searchData:obj});
	},
	render: function() {
		var outHtml = null;

			outHtml =
			(
				<div>
				</div>
			);

		return outHtml;
	}
});