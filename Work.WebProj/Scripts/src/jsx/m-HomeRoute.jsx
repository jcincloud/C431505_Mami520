//主表單
var GirdForm = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function () {
        return {
            gridData: { rows: [], page: 1 },
            fieldData: {customer_sn:null},
            searchData: { title: null },
            edit_type: 0,
            checkAll: false,
            data: [],
            name: [],
            searchBornData:{customer_sn:null},
            born_id:null,
            customer_id:null,
            meal_id:null
        };
    },
    getDefaultProps: function () {
        return {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPathName: gb_approot + 'api/Draft'
        };
    },
    componentDidMount: function () {
        //this.queryGridData(1);
        this.getMealID();
        this.getmomName();
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
    },
    getMealID: function () {
        jqGet(gb_approot + 'api/GetAction/GetMealID', {})
        .done(function (data, textStatus, jqXHRdata) {
            this.setState({ data: data });
        }.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    getmomName: function () {
        jqGet(gb_approot + 'api/GetAction/GetMomName', {})
       .done(function (data, textStatus, jqXHRdata) {
           this.setState({ name: data });
       }.bind(this))
       .fail(function (jqXHR, textStatus, errorThrown) {
           showAjaxError(errorThrown);
       });
    },
    changeGDBornValue: function (name, e) {
        var obj = this.state.searchBornData;
        obj[name] = e.target.value;
        this.setState({ searchBornData: obj });
        this.queryAllCustomerBorn();
    },
    queryAllCustomerBorn: function () {//選取用餐編號-取得全部客戶生產資料(已結/未結)list
        jqGet(gb_approot + 'api/GetAction/GetAllBorn', this.state.searchBornData)
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ born_list: data });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    showSelectCustomerBorn: function (born_id,customer_id,meal_id,customer_need_id,schedule_id) {
        window.open("Home/Next?born_id="+born_id+"&customer_id="+customer_id);
    },
    closeSelectCustomerBorn: function () {
    },
    selectCustomerBorn: function (customer_id, born_id, meal_id,customer_need_id,schedule_id) {
        jqGet(gb_approot + 'api/GetAction/GetCustomerAndBorn', { born_id: born_id, customer_id: customer_id ,customer_need_id:customer_need_id,schedule_id:schedule_id})
		.done(function (data, textStatus, jqXHRdata) {
		    var fieldData = this.state.fieldData;//選取後變更customer_id,born_id,mealid
		    fieldData.customer_id = customer_id;
		    fieldData.born_id = born_id;
		    fieldData.meal_id = meal_id;

		    //客戶編號改變下方帶入的資料要一起變更
		    fieldData.customer_type = data.getCustomer.customer_type;
		    fieldData.customer_name = data.getCustomer.customer_name;

		    fieldData.mom_name = data.getBorn.mom_name;
		    fieldData.sno = data.getBorn.sno;
		    fieldData.birthday = data.getBorn.birthday;
		    fieldData.tel_1 = data.getBorn.tel_1;
		    fieldData.tel_2 = data.getBorn.tel_2;
		    fieldData.tw_zip_1 = data.getBorn.tw_zip_1;
		    fieldData.tw_city_1 = data.getBorn.tw_city_1;
		    fieldData.tw_country_1 = data.getBorn.tw_country_1;
		    fieldData.tw_address_1 = data.getBorn.tw_address_1;
		    fieldData.tw_zip_2 = data.getBorn.tw_zip_2;
		    fieldData.tw_city_2 = data.getBorn.tw_city_2;
		    fieldData.tw_country_2 = data.getBorn.tw_country_2;
		    fieldData.tw_address_2 = data.getBorn.tw_address_2;
		    fieldData.born_type = data.getBorn.born_type;
		    fieldData.born_day = data.getBorn.born_day;

		    this.setState({ isShowCustomerBornSelect: false, fieldData: fieldData });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    //showAjaxError(errorThrown);
		});
    },
    render: function () {
        var outHtml = null;
        var fieldData=this.state.fieldData;
        outHtml = (
                    <div>
                        <ul className="breadcrumb">
                        <li>
                            <i className="fa-caret-right"></i>
                            首頁
                        </li>
                        </ul> 
                        <h3 className="h3">首頁</h3>
                         <ul className="nav nav-tabs active" role="tablist">
                            <li className="nav-item">
                                <a className="nav-link b active" data-toggle="tab" href="#Meal" role="tab"><i className="fa-spoon"></i> 用餐列表</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link b" data-toggle="tab" href="#Call" role="tab"><i className="fa-phone"></i> 今日電訪</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link b" data-toggle="tab" href="#Search" role="tab"><i className="fa-search"></i> 快速搜尋</a>
                            </li>
                         </ul>

                           <div className="tab-content">

                        <div className="tab-pane active" id="Meal" role="tabpanel">
                             <div className="row">

                                 {this.state.data.map(function (itemData, i) {
                                     return <div className="col-xs-2">
                               <ul className="list-unstyled" id={itemData.key}>
                                   {
                                        itemData.meal_idlist.map(function (itemArry, j) {
                                            var is_disabled = true;
                                            var mom_html = null;
                                            var born_id =null;
                                            var mom_id=null;
                                            return (
                                            <li>
                                                {this.state.name.map(function (itemName, k) {
                                                    if (itemArry == itemName.meal_id) {
                                                        mom_html = <tl>{itemName.mom_name}</tl>;
                                                        is_disabled = false;
                                                        born_id=itemName.born_id;
                                                        mom_id=itemName.customer_id;
                                                    }
                                                }.bind(this))}
                                                <button className="btn btn-block btn-blue-grey-outline text-xs-left"
                                                        type="button" disabled={is_disabled} onClick={this.showSelectCustomerBorn.bind(this,born_id,mom_id)}>
                                                    {itemArry}{mom_html}
                                                </button>
                                            </li>);
                                        }.bind(this))
                                   }
                               </ul>
                                     </div>;
                                 }.bind(this))}
                             </div>
                        </div>
                                <div className="tab-pane" id="Call" role="tabpanel">
                                    <TelRecord openAllEdit={this.showSelectCustomerBorn} />
                                </div>
                                <div className="tab-pane" id="Search" role="tabpanel">
                                    <QuickSearch openAllEdit={this.showSelectCustomerBorn} />
                                </div>
                           </div>

                    </div>
                    );
        return outHtml;
    }
});
//電訪記錄編輯list
var GridRow = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function () {
        return {
        };
    },
    delCheck: function (i, chd) {
        this.props.delCheck(i, chd);
    },
    modify: function () {
        this.props.updateType(this.props.primKey);
    },
    render: function () {
        return (

				<tr>
					<td className="text-xs-center"><GridCheckDel iKey={this.props.ikey} chd={this.props.itemData.check_del} delCheck={this.delCheck} /></td>
					<td className="text-xs-center"><GridButtonModify modify={this.modify} /></td>
					<td><button type="button" onClick={this.props.openAllEdit.bind(this,this.props.itemData.born_id,this.props.itemData.customer_id)} >{this.props.itemData.mom_name}</button></td>
					<td>{this.props.itemData.meal_id}</td>
					<td>{this.props.itemData.tel_1}</td>
					<td>{this.props.itemData.tel_2}</td>
					<td className="text-xs-center"><StateForGrid stateData={CommData.TelReasonByDetail} id={this.props.itemData.tel_reason} /></td>
				</tr>
			);
    }
});
//電訪紀錄內容
var TelRecord = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function () {
        return {
            gridData: { rows: [], page: 1 },
            fieldData: {},
            edit_type: 0,
            checkAll: false,
            isShowCustomerBornEdit: false,
            searchData: { title: null, start_date: moment(Date()).format('YYYY/MM/DD'), end_date: moment(Date()).format('YYYY/MM/DD') },
            searchBornData: { word: null, is_close: null },
            born_list: [],
            isShowTelRecordEdit: false,
            isShowCustomerBornSelect: false
        };
    },
    getDefaultProps: function () {
        return {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPathName: gb_approot + 'api/ScheduleDetail'
        };
    },
    componentDidMount: function () {
        this.queryGridData(0);
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
    },
    gridData: function (page) {

        var parms = {
            page: 0
        };

        if (page == 0) {
            parms.page = this.state.gridData.page;
        } else {
            parms.page = page;
        }

        $.extend(parms, this.state.searchData);

        return jqGet(this.props.apiPathName, parms);
    },
    onSelectChange: function (name, e) {
        var obj = this.state.searchData;
        obj[name] = e.target.value;
        this.setState({ searchData: obj });
    },
    queryGridData: function (page) {
        this.gridData(page)
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ gridData: data });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    changeGDValue: function (name, e) {
        this.setInputValue(this.props.gdName, name, e);
    },
    setInputValue: function (collentName, name, e) {

        var obj = this.state[collentName];


        if (e.target.value == 'true') {
            obj[name] = true;
        } else if (e.target.value == 'false') {
            obj[name] = false;
        } else {
            obj[name] = e.target.value;
        }
        if (collentName == this.props.gdName & name == 'start_date') {
            obj['end_date'] = e.target.value;
        }
        this.setState({ fieldData: obj });
    },
    insertType: function () {
        this.setState({
            edit_type: 1,
            fieldData: { tel_reason: 1, is_detailInsert: true, customer_type: 1 },
            isShowCustomerBornEdit: true,
            searchData: { tel_reason: 1, is_detailInsert: true, customer_type: 1 }
        });
    },
    updateType: function (id) {
        jqGet(this.props.apiPathName, { id: id })
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ edit_type: 2, fieldData: data.data, isShowCustomerBornEdit: true });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    deleteSubmit: function (e) {

        if (!confirm('確定是否刪除?')) {
            return;
        }

        var ids = [];
        for (var i in this.state.gridData.rows) {
            if (this.state.gridData.rows[i].check_del) {
                ids.push('ids=' + this.state.gridData.rows[i].schedule_detail_id);
            }
        }

        if (ids.length == 0) {
            tosMessage(null, '未選擇刪除項', 2);
            return;
        }

        jqDelete(this.props.apiPathName + '?' + ids.join('&'), {})
		.done(function (data, textStatus, jqXHRdata) {
		    if (data.result) {
		        tosMessage(null, '刪除完成', 1);
		        this.queryGridData(0);
		    } else {
		        tosMessage(null, data.message, 3);
		    }
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    delCheck: function (i, chd) {
        var newState = this.state;
        this.state.gridData.rows[i].check_del = !chd;
        this.setState(newState);
    },
    checkAll: function () {

        var newState = this.state;
        newState.checkAll = !newState.checkAll;
        for (var prop in this.state.gridData.rows) {
            this.state.gridData.rows[prop].check_del = newState.checkAll;
        }
        this.setState(newState);
    },
    handleSearch: function (e) {
        e.preventDefault();
        this.queryGridData(0);
        return;
    },
    addDetail: function (e) {
        //新增生產紀錄
        this.insertDetailType();
        this.setState({ isShowCustomerBornEdit: true });
    },
    editDetail: function (detail_id, e) {
        //修改生產紀錄
        this.updateDetailType(detail_id);
        this.setState({ isShowCustomerBornEdit: true });
    },
    viewDetail: function (detail_id, e) {
        //修改生產紀錄
        this.viewDetailType(detail_id);
        this.setState({ isShowCustomerBornEdit: true });
    },
    closeEditDetail: function () {
        this.setState({ isShowCustomerBornEdit: false })

    },
    handleSubmit: function (e) {

        e.preventDefault();

        if (this.state.fieldData.customer_id == null || this.state.fieldData.customer_id == undefined) {
            tosMessage(gb_title_from_invalid, '未選擇客戶無法新增電訪名單資料!!', 3);
            return;
        }

        if (this.state.edit_type == 1) {
            jqPost(this.props.apiPathName, this.state.fieldData)
			.done(function (data, textStatus, jqXHRdata) {
			    if (data.result) {
			        if (data.message != null) {
			            tosMessage(null, '新增完成' + data.message, 1);
			        } else {
			            tosMessage(null, '新增完成', 1);
			        }
			        this.updateType(data.id);
			    } else {
			        tosMessage(null, data.message, 3);
			    }
			}.bind(this))
			.fail(function (jqXHR, textStatus, errorThrown) {
			    showAjaxError(errorThrown);
			});
        }
        else if (this.state.edit_type == 2) {
            jqPut(this.props.apiPathName, this.state.fieldData)
			.done(function (data, textStatus, jqXHRdata) {
			    if (data.result) {
			        if (data.message != null) {
			            tosMessage(null, '修改完成' + data.message, 1);
			        } else {
			            tosMessage(null, '修改完成', 1);
			        }
			    } else {
			        tosMessage(null, data.message, 3);
			    }
			}.bind(this))
			.fail(function (jqXHR, textStatus, errorThrown) {
			    showAjaxError(errorThrown);
			});
        };
        return;
    },
    selectMealid: function (meal_id) {
        var fieldDetailData = this.state.fieldDetailData;//選取後變更mealid
        jqPost(gb_approot + 'api/ScheduleDetail', { old_id: fieldDetailData.meal_id, new_id: meal_id })
		.done(function (data, textStatus, jqXHRdata) {
		    if (!data.result) {
		        alert(data.message);
		    }
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    //showAjaxError(errorThrown);
		});

        fieldDetailData.meal_id = meal_id;
        this.setState({ isShowMealidSelect: false, fieldDetailData: fieldDetailData });
    },
    setFDValue: function (fieldName, value) {
        //此function提供給次元件調用，所以要以屬性往下傳。
        var obj = this.state[this.props.fddName];
        obj[fieldName] = value;
        this.setState({ fieldDetailData: obj });
    },
    changeGDBornValue: function (name, e) {
        var obj = this.state.searchBornData;
        obj[name] = e.target.value;
        this.setState({ searchBornData: obj });
        this.queryAllCustomerBorn();
    },
    queryAllCustomerBorn: function () {//選取用餐編號-取得全部客戶生產資料(已結/未結)list
        jqGet(gb_approot + 'api/GetAction/GetAllBorn', this.state.searchBornData)
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ born_list: data });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    showSelectCustomerBorn: function () {
        this.queryAllCustomerBorn();
        this.setState({ isShowCustomerBornSelect: true });
    },
    closeSelectCustomerBorn: function () {
        this.setState({ isShowCustomerBornSelect: false });
    },
    selectCustomerBorn: function (customer_id, born_id, meal_id) {
        jqGet(gb_approot + 'api/GetAction/GetCustomerAndBorn', { born_id: born_id, customer_id: customer_id })
		.done(function (data, textStatus, jqXHRdata) {
		    var fieldData = this.state.fieldData;//選取後變更customer_id,born_id,mealid
		    fieldData.customer_id = customer_id;
		    fieldData.born_id = born_id;
		    fieldData.meal_id = meal_id;

		    //客戶編號改變下方帶入的資料要一起變更
		    fieldData.customer_type = data.getCustomer.customer_type;
		    fieldData.customer_name = data.getCustomer.customer_name;

		    fieldData.mom_name = data.getBorn.mom_name;
		    fieldData.sno = data.getBorn.sno;
		    fieldData.birthday = data.getBorn.birthday;
		    fieldData.tel_1 = data.getBorn.tel_1;
		    fieldData.tel_2 = data.getBorn.tel_2;
		    fieldData.tw_zip_1 = data.getBorn.tw_zip_1;
		    fieldData.tw_city_1 = data.getBorn.tw_city_1;
		    fieldData.tw_country_1 = data.getBorn.tw_country_1;
		    fieldData.tw_address_1 = data.getBorn.tw_address_1;
		    fieldData.tw_zip_2 = data.getBorn.tw_zip_2;
		    fieldData.tw_city_2 = data.getBorn.tw_city_2;
		    fieldData.tw_country_2 = data.getBorn.tw_country_2;
		    fieldData.tw_address_2 = data.getBorn.tw_address_2;
		    fieldData.born_type = data.getBorn.born_type;
		    fieldData.born_day = data.getBorn.born_day;

		    this.setState({ isShowCustomerBornSelect: false, fieldData: fieldData });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    //showAjaxError(errorThrown);
		});
    },
    render: function () {
        var outHtml = null;
        var searchData = this.state.searchData;
        var fieldData = this.state.fieldData;
        var customer_born_out_html = null;
        var MdoaleditCustomerBorn = ReactBootstrap.Modal;
        var fieldDetailData = this.state.fieldDetailData;
        var born_select_out_html = null;
        //二次視窗
        var MdoalCustomerBornSelect = ReactBootstrap.Modal;
        var searchBornData = this.state.searchBornData;


        if (this.state.isShowCustomerBornSelect) {
            born_select_out_html =
                <MdoalCustomerBornSelect bsSize="large" animation={false} onRequestHide={this.closeSelectCustomerBorn}>
                    <div className="modal-header">
                        <button className="close" onClick={this.closeSelectCustomerBorn}>&times;</button>
                        <h5 className="modal-title text-secondary">選擇客戶</h5>
                    </div>
                        <div className="modal-body">
                            <div className="table-header">
                                <div className="table-filter">
                                    <div className="form-inline form-sm">
                                        <div className="form-group">
                                            <label className="text-sm" for="">客戶名稱/餐編/媽媽姓名</label> { }
                                            <input type="text" className="form-control"
                                                   value={searchBornData.word}
                                                   onChange={this.changeGDBornValue.bind(this,'word')}
                                                   placeholder="請擇一填寫" /> { }
                                            <label className="text-sm">客戶分類</label> { }
                                            <select className="form-control"
                                                    value={searchBornData.customer_type}
                                                    onChange={this.changeGDBornValue.bind(this,'customer_type')}>
                                                <option value="">全部</option>
                                                {
                                                    CommData.CustomerType.map(function (itemData, i) {
                                                        return  (
                                                        <option key={itemData.id} value={itemData.id }>{itemData.label}</option>);
                                                    })
                                                }
                                            </select> { }
                                            <label className="text-sm" for="">正在用餐</label> { }
                                            <select className="form-control"
                                                        value={searchBornData.is_meal}
                                                        onChange={this.changeGDBornValue.bind(this,'is_meal')}>
    							                        <option value="">全部</option>
                                                        <option value="true">是</option>
                                                        <option value="false">否</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <table className="table table-sm table-bordered table-striped">
                                <tbody>
                                    <tr>
                                        <th style={{"width":"5%;"}} className="text-xs-center">選擇</th>
                                        <th style={{"width":"15%;"}} >客戶姓名</th>
                                        <th style={{"width":"10%;"}} >客戶類別</th>
                                        <th style={{"width":"10%;"}} >用餐編號</th>
                                        <th style={{"width":"15%;"}} >媽媽姓名</th>
                                        <th style={{"width":"15%;"}} >電話1</th>
                                        <th style={{"width":"15%;"}} >備註</th>
                                        <th style={{"width":"15%;"}} >預產期</th>
                                    </tr>
                                    {
                                this.state.born_list.map(function (itemData, i) {

                                    var born_out_html =
                                        <tr key={itemData.born_id}>
                                            <td className="text-xs-center">
                                                <label className="c-input c-checkbox">
                                                    <input type="checkbox" onClick={this.selectCustomerBorn.bind(this,itemData.customer_id,itemData.born_id,itemData.meal_id)} />
                                                    <span className="c-indicator"></span>
                                                </label>
                                            </td>
                                            <td><button className="btn btn-link btn-sm" onClick={this.props.openAllEdit}>{itemData.customer_name}</button></td>
                                            <td><StateForGrid stateData={CommData.CustomerType} id={itemData.customer_type} /></td>
                                            <td>{itemData.meal_id}</td>
                                            <td>{itemData.mom_name}</td>
                                            <td>{itemData.tel_1}</td>
                                            <td>{itemData.memo}</td>
                                            <td>{moment(itemData.expected_born_day).format('YYYY/MM/DD')}</td>
                                        </tr>;
                                    return born_out_html;
                                }.bind(this))
                                    }
                                </tbody>
                            </table>
                        </div>
                    <div className="modal-footer">
                        <button className="btn btn-blue-grey btn-sm" onClick={this.closeSelectCustomerBorn}><i className="fa-times"></i> 關閉</button>
                    </div>
                </MdoalCustomerBornSelect>;
        }
        //二次視窗
        var save_out_html=null;
        if(this.state.edit_type==1){
				save_out_html=<button type="submit" className="btn btn-sm btn-primary col-xs-offset-1"><i className="fa-check"></i> 存檔確認</button>;
			}
        var detail_out_html = null;
        if (this.state.edit_type == 2) {
            detail_out_html =
            <SubForm ref="SubForm"
                     main_id={fieldData.schedule_detail_id}
                     tel_reason={fieldData.tel_reason} />;
        }
        //一次視窗
        if (this.state.isShowCustomerBornEdit) {

            customer_born_out_html =
			<MdoaleditCustomerBorn bsSize="medium" animation={false} onRequestHide={this.closeEditDetail}>
                <div className="modal-header">
                    <button className="close" onClick={this.closeEditDetail}>&times;</button>
                    <h5 className="modal-title text-secondary">電訪紀錄 <small><i className="fa-angle-double-right"></i> 編輯</small></h5>
                </div>
				<div className="modal-body">
				    <form className="form form-sm" onSubmit={this.handleSubmit}>
						<div className="form-group row">
							<label className="col-xs-2 form-control-label text-xs-right"><span className="text-danger">*</span> 選擇客戶</label>
							<div className="col-xs-6">
								<div className="input-group input-group-sm">
									<input type="text"
                                           className="form-control"
                                           value={fieldData.mom_name}
                                           onChange={this.changeGDValue}
                                           maxLength="64"
                                           disabled />
                                         <span className="input-group-btn">
                                             <a className="btn btn-success"
                                                onClick={this.showSelectCustomerBorn}
                                                disabled={this.state.edit_type ==2}><i className="fa-plus"></i></a>
                                         </span>
								</div>
							</div>
                            <small className="col-xs-4 text-muted"> 請按 <i className="fa-plus"></i> 選取</small>
						</div>
                        <div className="form-group row">
                            <label className="col-xs-2 form-control-label text-xs-right">電訪日期</label>
                            <div className="col-xs-6">
                                    <InputDate id="tel_day"
                                               onChange={this.changeGDValue}
                                               field_name="tel_day"
                                               value={fieldData.tel_day}
                                               required={true}
                                               disabled={true} />
                            </div>
                        <small className="col-xs-4 text-muted">系統自動產生，無法修改</small>
                        </div>
                        <div className="form-group row">
                            <label className="col-xs-2 form-control-label text-xs-right"><span className="text-danger">*</span> 電訪原因</label>
                            <div className="col-xs-6">
                                <select className="form-control"
                                        value={searchData.tel_reason}
                                        onChange={this.changeGDValue.bind(this, 'tel_reason')}
                                        disabled={this.state.edit_type ==2}>
                                    {
                                        CommData.TelReasonByDetail.map(function (itemData, i) {
                                            return (
                                            <option key={itemData.id} value={itemData.id }>{itemData.label}</option>);
                                        })
                                    }
                                </select>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-xs-2 form-control-label text-xs-right">客戶類別</label>
                            <div className="col-xs-6">
                                <select className="form-control"
                                        value={searchData.customer_type}
                                        disabled
                                        onChange={this.changeGDValue.bind(this, 'customer_type')}>
                                    {
                                    CommData.CustomerType.map(function (itemData, i) {
                                        return (
                                        <option key={itemData.id} value={itemData.id }>{itemData.label}</option>);
                                    })
                                    }
                                </select>
                            </div>
                            {save_out_html}
                        </div>
				    </form>
				</div>
			    {/*---產品明細---*/}{}{detail_out_html}
			</MdoaleditCustomerBorn>;
        }
        //一次視窗


        outHtml = (

                    <div className="tab-pane" id="Call" role="tabpanel">
                        {customer_born_out_html}
                        {born_select_out_html}
                        <form onSubmit={this.handleSearch}>
                        <div className="table-header">
                                <div className="table-filter">
                                    <div className="form form-inline form-sm">
                                        <div className="form-group">
                                            <label className="text-sm" for="">電訪日期</label> { }
											<InputDate id="start_date" ver={1}
                                                       onChange={this.changeGDValue}
                                                       field_name="start_date"
                                                       value={searchData.start_date} /> { }
                                            <label className="text-sm">電訪原因</label> { }
                                            <select className="form-control"
                                                value={searchData.tel_reason}
                                                onChange={this.changeGDValue.bind(this, 'tel_reason')}>
    							                <option value="">全部</option>
    							                {
    							                CommData.TelReasonByDetail.map(function (itemData, i) {
    							                    return (
    							                    <option key={itemData.id} value={itemData.id }>{itemData.label}</option>);
    							                })
    							                }
    							            </select> { }
                                            <button className="btn btn-secondary btn-sm" type="submit"><i className="fa-search"></i> 搜尋</button>
                                        </div>
                                    </div>
                                </div>
                        </div>
                        <table className="table table-sm table-bordered table-striped">
                            <thead>
                                    <tr>
                                        <th className="text-xs-center" style={{ width: "7%" }}>
                                            <label className="c-input c-checkbox">
                                                <input type="checkbox" checked={this.state.checkAll} onChange={this.checkAll} />
                                                <span className="c-indicator"></span>
                                            </label>
                                        </th>
                                        <th className="text-xs-center" style={{ width: "7%" }}>修改</th>
                                        <th style={{ width: "17%" }}>姓名</th>
                                        <th style={{ width: "15%" }}>用餐編號</th>
                                        <th style={{ width: "18%" }}>電話1</th>
                                        <th style={{ width: "18%" }}>電話2</th>
                                        <th style={{ width: "18%" }}>電訪原因</th>
                                    </tr>
                            </thead>
                            <tbody>
                                {this.state.gridData.rows.map(function (itemData, i) {
                                    return (
                                    <GridRow key={i}
                                             ikey={i}
                                             primKey={itemData.schedule_detail_id}
                                             itemData={itemData}
                                             delCheck={this.delCheck}
                                             updateType={this.updateType}
                                             openAllEdit={this.props.openAllEdit} />);
                                }.bind(this))
                                }
                            </tbody>
                        </table>
                         <GridNavPage StartCount={this.state.gridData.startcount}
                                      EndCount={this.state.gridData.endcount}
                                      RecordCount={this.state.gridData.records}
                                      TotalPage={this.state.gridData.total}
                                      NowPage={this.state.gridData.page}
                                      onQueryGridData={this.queryGridData}
                                      InsertType={this.insertType}
                                      deleteSubmit={this.deleteSubmit} />


                        </form>


                    </div>
                    );

        return outHtml;
    }
});

//電訪明細檔編輯
var SubForm = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function () {
        return {
            gridSubData: [],
            fieldSubData: {},
            edit_sub_type: 0,//預設皆為新增狀態
            checkAll: false
        };
    },
    getDefaultProps: function () {
        return {
            fdName: 'fieldSubData',
            gdName: 'searchData',
            apiPathName: gb_approot + 'api/DeatilTelRecord'
        };
    },
    componentDidMount: function () {
        this.queryGridData();
        this.insertSubType();//一開始載入預設為新增狀態
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
    },
    detailHandleSubmit: function (e) {
        e.preventDefault();

        if (this.state.edit_sub_type == 1) {
            jqPost(this.props.apiPathName, this.state.fieldSubData)
			.done(function (data, textStatus, jqXHRdata) {
			    if (data.result) {
			        if (data.message != null) {
			            tosMessage(null, '新增完成' + data.message, 1);
			        } else {
			            tosMessage(null, '新增完成', 1);
			        }
			        //儲存後更新下分list
			        this.queryGridData();
			        this.insertSubType();
			    } else {
			        tosMessage(null, data.message, 3);
			    }
			}.bind(this))
			.fail(function (jqXHR, textStatus, errorThrown) {
			    showAjaxError(errorThrown);
			});
        }
        else if (this.state.edit_sub_type == 2) {
            jqPut(this.props.apiPathName, this.state.fieldSubData)
			.done(function (data, textStatus, jqXHRdata) {
			    if (data.result) {
			        if (data.message != null) {
			            tosMessage(null, '修改完成' + data.message, 1);
			        } else {
			            tosMessage(null, '修改完成', 1);
			        }
			        //儲存後更新下分list
			        this.queryGridData();
			        this.insertSubType();
			    } else {
			        tosMessage(null, data.message, 3);
			    }
			}.bind(this))
			.fail(function (jqXHR, textStatus, errorThrown) {
			    showAjaxError(errorThrown);
			});
        };
        return;
    },
    detailDeleteSubmit: function (id, e) {

        if (!confirm('確定是否刪除?')) {
            return;
        }
        jqDelete(this.props.apiPathName + '?ids=' + id, {})
		.done(function (data, textStatus, jqXHRdata) {
		    if (data.result) {
		        tosMessage(null, '刪除完成', 1);
		        this.queryGridData();
		        this.insertSubType();
		    } else {
		        tosMessage(null, data.message, 3);
		    }
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    gridData: function () {
        var parms = {
            main_id: this.props.main_id
        };
        $.extend(parms, this.state.searchData);

        return jqGet(this.props.apiPathName, parms);
    },
    queryGridData: function () {
        this.gridData()
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ gridSubData: data });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    insertSubType: function () {
        $('textarea').val("");
        this.setState({
            edit_sub_type: 1, fieldSubData: {
                schedule_detail_id: this.props.main_id,
                tel_state: 1,
                i_Lang:'zh-TW'
            }
        });
    },
    updateSubType: function (id, e) {
        jqGet(this.props.apiPathName, { id: id })
		.done(function (data, textStatus, jqXHRdata) {
		    data.data.tel_datetime = moment(data.data.tel_datetime).format('YYYY/MM/DD hh:mm:ss');
		    this.setState({ edit_sub_type: 2, fieldSubData: data.data });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    changeFDValue: function (name, e) {
        this.setInputValue(this.props.fdName, name, e);
    },
    setInputValue: function (collentName, name, e) {

        var obj = this.state[collentName];
        if (e.target.value == 'true') {
            obj[name] = true;
        } else if (e.target.value == 'false') {
            obj[name] = false;
        } else {
            obj[name] = e.target.value;
        }
        this.setState({ fieldSubData: obj });
    },
    render: function () {
        var outHtml = null;
        var fieldSubData = this.state.fieldSubData;//明細檔資料
        outHtml =
        (
            <div>
                {/*---產品明細編輯start---*/}
                <h4 className="title">新增電訪明細</h4>
                <div className="row">
                    <div className="col-xs-9">
                        <div className="item-box">
                            <div className="item-title">
                                <h5>新增電訪紀錄</h5>
                            </div>
                            <form className="form-horizontal" role="form" id="form2" onSubmit={this.detailHandleSubmit}>
                            <div className="panel-body">
                                    <div className="form-group">
                                        <label className="col-xs-2 control-label">電訪時間</label>
                                        <div className="col-xs-4">
                                            <input type="datetime"
                                                   className="form-control"
                                                   value={fieldSubData.tel_datetime}
                                                   onChange={this.changeFDValue.bind(this,'tel_datetime')}
                                                   maxLength="30"
                                                   required disabled　 />
                                        </div>
    <small className="help-inline col-xs-6">系統自動產生，無法修改</small>
                                    </div>
<div className="form-group">
    <label className="col-xs-2 control-label">電訪狀態</label>
    <div className="col-xs-4">
        <select className="form-control"
                value={fieldSubData.tel_state}
                onChange={this.changeFDValue.bind(this,'tel_state')}>
            {
            CommData.TelState.map(function (itemData, i) {
                return(
                <option key={itemData.id} value={itemData.id}>{itemData.label}</option>);
            })
            }
        </select>
    </div>
    <small className="help-inline text-danger col-xs-6">(必填)</small>
</div>
<div className="form-group">
    <label className="col-xs-2 control-label">電訪內容(備註)</label>
    <div className="col-xs-8">
        <textarea col="30" rows="5" className="form-control"
                  value={fieldSubData.memo}
                  onChange={this.changeFDValue.bind(this,'memo')}
                  maxLength="256"></textarea>
    </div>
</div>
                            </div>
                            </form>
<div className="panel-footer">
    <button className="btn-primary col-xs-offset-9"
            type="submit" form="form2">
            <i className="fa-check"></i> 存檔確認
    </button>
</div>
                        </div>
                    </div>
                </div>
                {/*---產品明細編輯end---*/}

					<hr className="condensed" />

                {/*---產谝明細列表start---*/}
					<h4 className="title">電訪紀錄</h4>
					<div className="row">
						<div className="col-xs-9">
							<table className="table-condensed">
								<tbody>
									<tr>
									    {/*<th className="col-xs-1 text-center">編輯</th>*/}
										<th className="col-xs-3 text-xs-center">時間</th>
										<th className="col-xs-2 text-xs-center">原因</th>
										<th className="col-xs-4">內容</th>
										<th className="col-xs-1 text-xs-center">狀態</th>
										<th className="col-xs-2">人員</th>
									</tr>
								    {
										this.state.gridSubData.map(function (itemData, i) {
										    var sub_out_html =
												<tr key={itemData.deatil_tel_record_id}>
													<td className="text-xs-center"><strong>{moment(itemData.tel_datetime).format('YYYY/MM/DD hh:mm:ss')}</strong></td>
													<td className="text-xs-center"><StateForGrid stateData={CommData.TelReasonByDetail} id={this.props.tel_reason} /></td>
													<td>{itemData.memo}</td>
													<td className="text-xs-center"><StateForGrid stateData={CommData.TelState} id={itemData.tel_state} /></td>
													<td>{itemData.user_name}</td>
												</tr>;
										    return sub_out_html;
										}.bind(this))
								    }
								</tbody>
							</table>
						</div>
					</div>
                {/*---產品明細列表end---*/}
            </div>
			);

        return outHtml;
    }
});
//快速搜尋編輯list
var GridRowForQuick = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function () {
        return {
        };
    },
    delCheck: function (i, chd) {
        this.props.delCheck(i, chd);
    },
    modify: function () {
        this.props.updateType(this.props.primKey);
    },
    render: function () {
        return (

				<tr>
					<td className="text-xs-center"><GridCheckDel iKey={this.props.ikey} chd={this.props.itemData.check_del} delCheck={this.delCheck} /></td>
					<td className="text-xs-center"><GridButtonModify modify={this.modify} /></td>
					<td>{this.props.itemData.customer_name}</td>
					<td><StateForGrid stateData={CommData.CustomerType} id={this.props.itemData.customer_type} /></td>
					<td>{this.props.itemData.sno}</td>
                    <td>{this.props.itemData.tel_1}</td>
					<td>{this.props.itemData.tel_2}</td>
					<td>{this.props.itemData.tw_city_1 + this.props.itemData.tw_country_1 + this.props.itemData.tw_address_1}</td>
				</tr>
			);
    }
});

//快速搜尋
var QuickSearch = React.createClass({
    mixins: [React.addons.LinkedStateMixin],    
   getInitialState: function () {
        return {
            gridData: { rows: [], page: 1 },
            fieldData: { customer_sn: null },
            gridDetailData: [],
            fieldDetailData: {},
            searchData: { title: null },
            detail_edit_type: 0,//生產紀錄edit
            edit_type: 0,
            checkAll: false,
            country_list: [],
            next_id: null,
            isShowCustomerEdit: false,
            isShowCustomerBornEdit: false
        };
    },
    getDefaultProps: function () {
        return {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPathName: gb_approot + 'api/Customer',
            apiSubPathName: gb_approot + 'api/CustomerBorn',
            fddName: 'fieldDetailData'
        };
    },    
    componentDidMount: function () {
        this.queryGridData(1);
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
    },
    handleSubmit: function (e) {

        e.preventDefault();

        //檢查電話格式
        var check_tel_1 = checkTelReg(this.state.fieldData['tel_1']);
        var check_tel_2 = checkTelReg(this.state.fieldData['tel_2']);
        if (!check_tel_1.result) {
            tosMessage(gb_title_from_invalid, '連絡電話1-' + check_tel_1.errMsg, 3);
            return;
        }
        if (!check_tel_2.result) {
            tosMessage(gb_title_from_invalid, '連絡電話2-' + check_tel_2.errMsg, 3);
            return;
        }

        //檢查身分證字號
        if (!checkTwID(this.state.fieldData['sno'])) {
            tosMessage(gb_title_from_invalid, '身分證字號格式錯誤!!', 3);
            return;
        }
        //檢查地址
        if (
            this.state.fieldData['tw_city_1'] == undefined || this.state.fieldData['tw_city_1'] == '' ||
            this.state.fieldData['tw_country_1'] == undefined || this.state.fieldData['tw_country_1'] == '' ||
            this.state.fieldData['tw_address_1'] == undefined || this.state.fieldData['tw_address_1'] == ''
            ) {

            tosMessage(gb_title_from_invalid, '送餐地址需填寫完整', 3);
            return;
        }


        if (this.state.edit_type == 1) {
            jqPost(this.props.apiPathName, this.state.fieldData)
			.done(function (data, textStatus, jqXHRdata) {
			    if (data.result) {
			        if (data.message != null) {
			            tosMessage(null, '新增完成' + data.message, 1);
			        } else {
			            tosMessage(null, '新增完成', 1);
			        }
			        this.updateType(data.id);
			    } else {
			        tosMessage(null, data.message, 3);
			    }
			}.bind(this))
			.fail(function (jqXHR, textStatus, errorThrown) {
			    showAjaxError(errorThrown);
			});
        }
        else if (this.state.edit_type == 2) {
            jqPut(this.props.apiPathName, this.state.fieldData)
			.done(function (data, textStatus, jqXHRdata) {
			    if (data.result) {
			        if (data.message != null) {
			            tosMessage(null, '修改完成' + data.message, 1);
			        } else {
			            tosMessage(null, '修改完成', 1);
			        }
			    } else {
			        tosMessage(null, data.message, 3);
			    }
			}.bind(this))
			.fail(function (jqXHR, textStatus, errorThrown) {
			    showAjaxError(errorThrown);
			});
        };
        return;
    },
    deleteSubmit: function (e) {

        if (!confirm('確定是否刪除?')) {
            return;
        }

        var ids = [];
        for (var i in this.state.gridData.rows) {
            if (this.state.gridData.rows[i].check_del) {
                ids.push('ids=' + this.state.gridData.rows[i].customer_id);
            }
        }

        if (ids.length == 0) {
            tosMessage(null, '未選擇刪除項', 2);
            return;
        }

        jqDelete(this.props.apiPathName + '?' + ids.join('&'), {})
		.done(function (data, textStatus, jqXHRdata) {
		    if (data.result) {
		        tosMessage(null, '刪除完成', 1);
		        this.queryGridData(0);
		    } else {
		        tosMessage(null, data.message, 3);
		    }
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    handleSearch: function (e) {
        e.preventDefault();
        this.queryGridData(0);
        return;
    },
    delCheck: function (i, chd) {

        var newState = this.state;
        this.state.gridData.rows[i].check_del = !chd;
        this.setState(newState);
    },
    checkAll: function () {

        var newState = this.state;
        newState.checkAll = !newState.checkAll;
        for (var prop in this.state.gridData.rows) {
            this.state.gridData.rows[prop].check_del = newState.checkAll;
        }
        this.setState(newState);
    },
    gridData: function (page) {
        var parms = {
            main_id: this.props.main_id,
            page:0
        };
        if(page==0){
			parms.page=this.state.gridData.page;
		}else{
			parms.page=page;
		}
        $.extend(parms, this.state.searchData);

        return jqGet(this.props.apiPathName, parms);
    },
    queryGridData: function (page) {
        this.gridData(page)
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ gridData: data });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    queryGridDetailData: function (page) {
        this.gridDetailData(page)
        .done(function (data, textStatus, jqXHRdata) {
            this.setState({ gridDetailData: data });
        }.bind(this))
        .fail(function (jqXHR, textStatus, errorThrown) {
            showAjaxError(errorThrown);
        });
    },
    insertType: function () {
        this.setState({
            edit_type: 1,
            fieldData: { tel_reason: 1, is_detailInsert: true, customer_type: 1 },
            isShowCustomerEdit: true,
            searchData: { tel_reason: 1, is_detailInsert: true, customer_type: 1 },
        });
    },
   updateType: function (id) {
        jqGet(this.props.apiPathName, { id: id })
		.done(function (data, textStatus, jqXHRdata) {
		    this.queryGridDetailData(data.data.customer_id);
		    this.setState({ edit_type: 2, fieldData: data.data, isShowCustomerEdit: true });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    noneType: function () {
        this.gridData(0)
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ edit_type: 0, gridData: data });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    changeFDValue: function (name, e) {
        this.setInputValue(this.props.fdName, name, e);
    },
    changeGDValue: function (name, e) {
        this.setInputValue(this.props.gdName, name, e);
    },
    setFDValue: function (fieldName, value) {
        //此function提供給次元件調用，所以要以屬性往下傳。
        var obj = this.state[this.props.fdName];
        obj[fieldName] = value;
        this.setState({ fieldData: obj });
    },
    setInputValue: function (collentName, name, e) {

        var obj = this.state[collentName];
        if (e.target.value == 'true') {
            obj[name] = true;
        } else if (e.target.value == 'false') {
            obj[name] = false;
        } else {
            obj[name] = e.target.value;
        }
        this.setState({ fieldData: obj });
    },
    onCityChange: function (e) {

        this.listCountry(e.target.value);
        var obj = this.state.searchData;
        obj['city'] = e.target.value;
        this.setState({ searchData: obj });
        this.queryGridData(0);
    },
    onCountryChange: function (e) {
        var obj = this.state.searchData;
        obj['country'] = e.target.value;
        this.setState({ searchData: obj });
        this.queryGridData(0);
    },
    listCountry: function (value) {
        for (var i in CommData.twDistrict) {
            var item = CommData.twDistrict[i];
            if (item.city == value) {
                this.setState({ country_list: item.contain });
                break;
            }
        }
    },
    onCustomerTypeChange: function (e) {
        var obj = this.state.searchData;
        obj['customer_type'] = e.target.value;
        this.setState({ searchData: obj });
        this.queryGridData(0);
    },
    selectCustomerBorn: function (customer_id, born_id, meal_id) {
        jqGet(gb_approot + 'api/GetAction/GetCustomerAndBorn', { born_id: born_id, customer_id: customer_id })
		.done(function (data, textStatus, jqXHRdata) {
		    var fieldData = this.state.fieldData;//選取後變更customer_id,born_id,mealid
		    fieldData.customer_id = customer_id;
		    fieldData.born_id = born_id;
		    fieldData.meal_id = meal_id;

		    //客戶編號改變下方帶入的資料要一起變更
		    fieldData.customer_type = data.getCustomer.customer_type;
		    fieldData.customer_name = data.getCustomer.customer_name;

		    fieldData.mom_name = data.getBorn.mom_name;
		    fieldData.sno = data.getBorn.sno;
		    fieldData.birthday = data.getBorn.birthday;
		    fieldData.tel_1 = data.getBorn.tel_1;
		    fieldData.tel_2 = data.getBorn.tel_2;
		    fieldData.tw_zip_1 = data.getBorn.tw_zip_1;
		    fieldData.tw_city_1 = data.getBorn.tw_city_1;
		    fieldData.tw_country_1 = data.getBorn.tw_country_1;
		    fieldData.tw_address_1 = data.getBorn.tw_address_1;
		    fieldData.tw_zip_2 = data.getBorn.tw_zip_2;
		    fieldData.tw_city_2 = data.getBorn.tw_city_2;
		    fieldData.tw_country_2 = data.getBorn.tw_country_2;
		    fieldData.tw_address_2 = data.getBorn.tw_address_2;
		    fieldData.born_type = data.getBorn.born_type;
		    fieldData.born_day = data.getBorn.born_day;

		    this.setState({ isShowCustomerBornSelect: false, fieldData: fieldData });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    //showAjaxError(errorThrown);
		});
    },
    addDetail: function (e) {
        //新增生產紀錄
        this.insertDetailType();
        this.setState({ isShowCustomerBornEdit: true });
    },
    editDetail: function (detail_id, e) {
        //修改生產紀錄
        this.updateDetailType(detail_id);
        this.setState({ isShowCustomerEdit: true });
        this.setState({ isShowCustomerBornEdit: true });
    },
    viewDetail: function (detail_id, e) {
        //修改生產紀錄
        this.viewDetailType(detail_id);
        this.setState({ isShowCustomerEdit: true });
        this.setState({ isShowCustomerBornEdit: true });
    },
    queryAllCustomer: function () {//選取用餐編號-取得全部客戶生產資料(已結/未結)list
        jqGet(gb_approot + 'api/Customer', this.state.searchData)
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ country_list: data });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    gridDetailData: function (main_id) {

        var parms = {
            main_id: main_id
        };

        $.extend(parms, this.state.searchData);

        return jqGet(this.props.apiSubPathName, parms);
    },
    changeFDDValue: function (name, e) {
        this.setInputValue(this.props.fddName, name, e);
    },
    detailHandleSubmit: function (e) {//新增及修改 生產編輯
        e.preventDefault();

        //檢查電話格式
        var check_tel_1 = checkTelReg(this.state.fieldDetailData['tel_1']);
        var check_tel_2 = checkTelReg(this.state.fieldDetailData['tel_2']);
        if (!check_tel_1.result) {
            tosMessage(gb_title_from_invalid, '連絡電話1-' + check_tel_1.errMsg, 3);
            return;
        }
        if (!check_tel_2.result) {
            tosMessage(gb_title_from_invalid, '連絡電話2-' + check_tel_2.errMsg, 3);
            return;
        }
        //檢查身分證字號
        if (!checkTwID(this.state.fieldDetailData['sno'])) {
            tosMessage(gb_title_from_invalid, '身分證字號格式錯誤!!', 3);
            return;
        }
        //檢查地址
        if (
            this.state.fieldDetailData['tw_city_1'] == undefined || this.state.fieldDetailData['tw_city_1'] == '' ||
            this.state.fieldDetailData['tw_country_1'] == undefined || this.state.fieldDetailData['tw_country_1'] == '' ||
            this.state.fieldDetailData['tw_address_1'] == undefined || this.state.fieldDetailData['tw_address_1'] == ''
            ) {

            tosMessage(gb_title_from_invalid, '送餐地址需填寫完整', 3);
            return;
        }

        if (this.state.detail_edit_type == 1) {
            jqPost(this.props.apiSubPathName, this.state.fieldDetailData)
            .done(function (data, textStatus, jqXHRdata) {
                if (data.result) {
                    if (data.message != null) {
                        tosMessage(null, '新增完成' + data.message, 1);
                    } else {
                        tosMessage(null, '新增完成', 1);
                    }
                    //this.updateDetailType(data.id);
                    this.closeEditDetail();//新增完直接關閉
                } else {
                    tosMessage(null, data.message, 3);
                }
            }.bind(this))
            .fail(function (jqXHR, textStatus, errorThrown) {
                showAjaxError(errorThrown);
            });
        }
        else if (this.state.detail_edit_type == 2) {
            jqPut(this.props.apiSubPathName, this.state.fieldDetailData)
            .done(function (data, textStatus, jqXHRdata) {
                if (data.result) {
                    if (data.message != null) {
                        tosMessage(null, '修改完成' + data.message, 1);
                    } else {
                        tosMessage(null, '修改完成', 1);
                    }
                    this.closeEditDetail();//修改完直接關閉
                } else {
                    tosMessage(null, data.message, 3);
                }
            }.bind(this))
            .fail(function (jqXHR, textStatus, errorThrown) {
                showAjaxError(errorThrown);
            });
        };
        return;
    },
    updateDetailType: function (id) {//修改明細檔
        jqGet(this.props.apiSubPathName, { id: id })
        .done(function (data, textStatus, jqXHRdata) {
            this.setState({ detail_edit_type: 2, fieldDetailData: data.data });
        }.bind(this))
        .fail(function (jqXHR, textStatus, errorThrown) {
            showAjaxError(errorThrown);
        });
    },
    viewDetailType: function (id) {//檢視明細檔
        jqGet(this.props.apiSubPathName, { id: id })
        .done(function (data, textStatus, jqXHRdata) {
            this.setState({ detail_edit_type: 3, fieldDetailData: data.data });
        }.bind(this))
        .fail(function (jqXHR, textStatus, errorThrown) {
            showAjaxError(errorThrown);
        });
    },
    closeQuickSearchForAllEdit: function(born_id,customer_id){
        //此function為按下修改內姓名按鈕後，關閉修改視窗，開啟總覽視窗
        this.props.openAllEdit(born_id,customer_id);
        this.setState({ isShowCustomerEdit: false });
    },
    closeEditDetail: function () {
        //關閉生產紀錄視窗並更新list 
        this.gridDetailData(this.state.fieldData.customer_id)
        .done(function (data, textStatus, jqXHRdata) {
            this.setState({isShowCustomerBornEdit: false ,detail_edit_type: 0, gridDetailData: data});
        }.bind(this))
        .fail(function (jqXHR, textStatus, errorThrown) {
            showAjaxError(errorThrown);
        });
    },
    closeDetail: function () {     
        //關閉基本資料視窗
        this.queryGridData(0);
        this.gridDetailData(0)
        .done(function (data, textStatus, jqXHRdata) {
            this.setState({ isShowCustomerEdit: false, detail_edit_type: 0, gridDetailData: data});
        }.bind(this))
        .fail(function (jqXHR, textStatus, errorThrown) {
            showAjaxError(errorThrown);
        });
    },
    insertDetailType: function () {//新增明細檔
        var fieldData = this.state.fieldData;
        //新增要自動帶資料
        this.setState({
            detail_edit_type: 1,
            fieldDetailData: {
                born_id: null,
                meal_id: null,
                customer_id: fieldData.customer_id,
                mom_name: fieldData.customer_name,
                sno: fieldData.sno,
                birthday: fieldData.birthday,
                tel_1: fieldData.tel_1,
                tel_2: fieldData.tel_2,
                tw_zip_1: fieldData.tw_zip_1,
                tw_zip_2: fieldData.tw_zip_2,
                tw_city_1: fieldData.tw_city_1,
                tw_city_2: fieldData.tw_city_2,
                tw_country_1: fieldData.tw_country_1,
                tw_country_2: fieldData.tw_country_2,
                tw_address_1: fieldData.tw_address_1,
                tw_address_2: fieldData.tw_address_2,
                born_type: 1
            }
        });
    },
    deleteDetail:function(detail_id,e){

        if(!confirm('確定是否刪除?')){
            return;
        }

        jqDelete(this.props.apiSubPathName + '?ids=' + detail_id,{})            
        .done(function(data, textStatus, jqXHRdata) {
            if(data.result){
                tosMessage(null,'刪除完成',1);
                this.queryGridDetailData(0);
            }else{
                tosMessage(null,data.message,3);
            }
        }.bind(this))
        .fail(function( jqXHR, textStatus, errorThrown ) {
            showAjaxError(errorThrown);
        });
    },
    render: function () {
        var outHtml = null;
        var searchData = this.state.searchData;
        var customer_detail_out_html = null;
        var fieldDetailData = this.state.fieldDetailData;
        var fieldData = this.state.fieldData;
        var MdoaleditCustomerDtail = ReactBootstrap.Modal;
        var MdoaleditCustomerBorn = ReactBootstrap.Modal;
        var customer_born_out_html = null;

        //二次視窗
        if (this.state.isShowCustomerBornEdit) {
            customer_born_out_html =
                    <MdoaleditCustomerBorn bsSize="large" animation={false} onRequestHide={this.closeEditDetail}>
                        <div className="modal-header">
                            <button className="close" onClick={this.closeEditDetail}>&times;</button>
                            <h5 className="modal-title text-secondary">客戶生產紀錄 <small><i className="fa-angle-double-right"></i> 編輯</small></h5>
                        </div>
                        <form className="form form-sm" onSubmit={this.detailHandleSubmit} id="form2">
                            <div className="modal-body">
                                <div className="form-group row">
                                    <label className="col-xs-2 form-control-label text-xs-right"><span className="text-danger">*</span> 媽媽姓名</label>
                                    <div className="col-xs-3">
                                        <input type="text"
                                               className="form-control"
                                               value={fieldDetailData.mom_name}
                                               onChange={this.changeFDDValue.bind(this,'mom_name')}
                                               maxLength="64"
                                               required
                                               disabled={this.state.detail_edit_type==3} />
                                    </div>
                                </div>

                                <div className="form-group row">
                                    <label className="col-xs-2 form-control-label text-xs-right">聯絡電話1</label>
                                    <div className="col-xs-3">
                                        <input type="tel"
                                               className="form-control"
                                               value={fieldDetailData.tel_1}
                                               onChange={this.changeFDDValue.bind(this,'tel_1')}
                                               maxLength="16"
                                               disabled={this.state.detail_edit_type==3} />
                                    </div>
                                   <label className="col-xs-2 form-control-label text-xs-right">聯絡電話2</label>
                                   <div className="col-xs-4">
                                       <input type="tel"
                                              className="form-control"
                                              value={fieldDetailData.tel_2}
                                              onChange={this.changeFDDValue.bind(this,'tel_2')}
                                              maxLength="16"
                                              disabled={this.state.detail_edit_type==3} />
                                   </div>
                                </div>

                               <div className="form-group row">
                                   <label className="col-xs-2 form-control-label text-xs-right">身分證字號</label>
                                   <div className="col-xs-3">
                                       <input type="text"
                                              className="form-control"
                                              value={fieldDetailData.sno}
                                              onChange={this.changeFDDValue.bind(this,'sno')}
                                              maxLength="10"
                                              disabled={this.state.detail_edit_type==3} />
                                   </div>
                                   <label className="col-xs-2 form-control-label text-xs-right">生日</label>
                                   <div className="col-xs-4">
                                       <InputDate id="birthday"
                                                  onChange={this.changeFDDValue}
                                                  field_name="birthday"
                                                  value={fieldDetailData.birthday}
                                                  disabled={this.state.detail_edit_type==3} />
                                   </div>
                               </div>

                               <div className="form-group row">
                                   <label className="col-xs-2 form-control-label text-xs-right"><span className="text-danger">*</span> 送餐地址</label>
                                    <TwAddress ver={3}
                                               onChange={this.changeFDDValue}
                                               setFDValue={this.setFDValue}
                                               zip_value={fieldDetailData.tw_zip_1}
                                               city_value={fieldDetailData.tw_city_1}
                                               country_value={fieldDetailData.tw_country_1}
                                               address_value={fieldDetailData.tw_address_1}
                                               zip_field="tw_zip_1"
                                               city_field="tw_city_1"
                                               country_field="tw_country_1"
                                               address_field="tw_address_1"
                                               disabled={this.state.detail_edit_type==3} />
                               </div>

                               <div className="form-group row">
                                   <label className="col-xs-2 form-control-label text-xs-right">備用地址</label>
                                   <TwAddress ver={3}
                                              onChange={this.changeFDDValue}
                                              setFDValue={this.setFDValue}
                                              zip_value={fieldDetailData.tw_zip_2}
                                              city_value={fieldDetailData.tw_city_2}
                                              country_value={fieldDetailData.tw_country_2}
                                              address_value={fieldDetailData.tw_address_2}
                                              zip_field="tw_zip_2"
                                              city_field="tw_city_2"
                                              country_field="tw_country_2"
                                              address_field="tw_address_2"
                                              disabled={this.state.detail_edit_type==3} />
                               </div>
                               <div className="form-group row">
                                   <label className="col-xs-2 form-control-label text-xs-right">預產期</label>
                                   <div className="col-xs-3">
                                       <InputDate id="expected_born_day"
                                                  onChange={this.changeFDDValue}
                                                  field_name="expected_born_day"
                                                  value={fieldDetailData.expected_born_day}
                                                  disabled={this.state.detail_edit_type==3} />
                                   </div>
                                   <label className="col-xs-2 form-control-label text-xs-right"><span className="text-danger">*</span> 生產日期</label>
                                    <div className="col-xs-4">
                                        <InputDate id="born_day"
                                                   onChange={this.changeFDDValue}
                                                   field_name="born_day"
                                                   value={fieldDetailData.born_day}
                                                   required={true}
                                                   disabled={this.state.detail_edit_type==3} />
                                    </div>
                               </div>
                               <div className="form-group row">
                                   <label className="col-xs-2 form-control-label text-xs-right">產檢醫院</label>
                                   <div className="col-xs-3">
                                        <input type="text"
                                               className="form-control"
                                               value={fieldDetailData.checkup_hospital}
                                               onChange={this.changeFDDValue.bind(this,'checkup_hospital')}
                                               maxLength="50"
                                               disabled={this.state.detail_edit_type==3} />
                                   </div>
                                   <label className="col-xs-2 form-control-label text-xs-right">生產醫院</label>
                                   <div className="col-xs-4">
                                        <input type="text"
                                               className="form-control"
                                               value={fieldDetailData.born_hospital}
                                               onChange={this.changeFDDValue.bind(this,'born_hospital')}
                                               maxLength="50"
                                               disabled={this.state.detail_edit_type==3} />
                                   </div>
                               </div>
                               <div className="form-group row">
                                   <label className="col-xs-2 form-control-label text-xs-right">第幾胎</label>
                                   <div className="col-xs-1">
                                        <input type="text"
                                               className="form-control"
                                               value={fieldDetailData.born_frequency}
                                               onChange={this.changeFDDValue.bind(this,'born_frequency')}
                                               maxLength="5"
                                               disabled={this.state.detail_edit_type==3} />
                                   </div>
                                   <label className="col-xs-1 form-control-label text-xs-right">生產方式</label>
                                   <div className="col-xs-3">
                                        <select className="form-control"
                                                value={fieldDetailData.born_type}
                                                onChange={this.changeFDDValue.bind(this,'born_type')}
                                                disabled={this.state.detail_edit_type==3}>
                                            {
                                           CommData.BornType.map(function (itemData, i) {
                                               return(
                                               <option key={itemData.id} value={itemData.id }>{itemData.label}</option>);
                                           })
                                            }
                                        </select>
                                   </div>
                                   <label className="col-xs-2 form-control-label text-xs-right">寶寶性別</label>
                                   <div className="col-xs-2">
                                        <select className="form-control"
                                                value={fieldDetailData.baby_sex}
                                                onChange={this.changeFDDValue.bind(this,'baby_sex')}
                                                disabled={this.state.detail_edit_type==3}>
                                            {
                                           CommData.SexType.map(function (itemData, i) {
                                               return(
                                               <option key={itemData.id} value={itemData.id }>{itemData.label}</option>);
                                           })
                                            }
                                        </select>
                                   </div>
                               </div>
                               <div className="form-group row">
                                   <label className="col-xs-2 form-control-label text-xs-right">備註</label>
                                   <div className="col-xs-9">
                                        <textarea col="30" row="2" className="form-control"
                                                  value={fieldDetailData.memo}
                                                  onChange={this.changeFDDValue.bind(this,'memo')}
                                                  maxLength="256"
                                                  disabled={this.state.detail_edit_type==3}></textarea>
                                   </div>
                               </div>
                            </div>
                           <div className="modal-footer form-action row">
                               <div className="col-xs-11">
                                    <button type="submit" form="form2" className="btn btn-primary btn-sm col-xs-offset-2"><i className="fa-check"></i> 存檔確認</button> { }
                                    <button className="btn btn-blue-grey btn-sm" type="button" onClick={this.closeEditDetail}><i className="fa-times"></i> 關閉</button>
                               </div>
                           </div>
                        </form>
                        {detail_out_html}
                    </MdoaleditCustomerBorn>;
        }
        //二次視窗


        var new_detail_out_html = null;
        if (this.state.edit_type == 2) {
new_detail_out_html=<div>
<hr className="lg" />
                    <h3 className="h3">
                        客戶生產紀錄 明細檔
                        <button type="button" onClick={this.addDetail} className="btn btn-success btn-sm m-l-1"><i className="fa-plus-circle"></i> 新增生產紀錄</button>
                    </h3>
                    <table className="table table-sm table-bordered table-striped">
                        <thead>
                            <tr>
                                <th className="text-xs-center">編輯</th>
                                <th>生產日期</th>
                                <th>用餐編號</th>
                                <th>媽媽姓名</th>
                                <th>寶寶性別</th>
                                <th>生產方式</th>{/*<th className="col-1">是否結案</th>*/}
                                <th>備註</th>
                                <th className="text-xs-center">查看</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                            this.state.gridDetailData.map(function (itemData, i) {
                                var out_sub_button = null;
                                if (itemData.is_close) {//結案後僅能檢視生產紀錄
                                    out_sub_button =
                                            <td className="text-xs-center">
                                                <button className="btn btn-link btn-lg text-info" type="button" onClick={this.viewDetail.bind(this,itemData.born_id)}><i className="fa-search-plus"></i></button>
                                            </td>;
                                } else {
                                    out_sub_button =
                                            <td className="text-xs-center">
                                                <button className="btn btn-link btn-lg text-info" type="button" onClick={this.editDetail.bind(this,itemData.born_id)}><i className="fa-pencil"></i></button> { }
                                                <button className="btn btn-link btn-lg text-danger" type="button" onClick={this.deleteDetail.bind(this,itemData.born_id)}><i className="fa-trash-o"></i></button>
                                            </td>;
                                }
                                var out_sub_html =
                                        <tr key={i}>
                                            {out_sub_button}
                                            <td>{moment(itemData.born_day).format('YYYY/MM/DD')}</td>
                                            <td>{itemData.meal_id}</td>
                                            <td><button type="button" className="btn btn-link btn-sm" onClick={this.closeQuickSearchForAllEdit.bind(this,itemData.born_id,itemData.customer_id)}>{itemData.mom_name}</button></td>
                                            <td><StateForGrid stateData={CommData.SexType} id={itemData.baby_sex} /></td>
                                            <td><StateForGrid stateData={CommData.BornType} id={itemData.born_type} /></td>{/*<td>{itemData.is_close? <span className="label label-success">結案</span>:<span className="label label-danger">未結案</span>}</td>*/}
                                            <td>{itemData.memo}</td>
                                            <td className="text-xs-center"><button type="button" className="btn btn-link btn-sm text-info" onClick={this.closeQuickSearchForAllEdit.bind(this,itemData.born_id,itemData.customer_id)}><i className="fa-search"></i></button></td>
                                        </tr>;
                                return out_sub_html;
                            }.bind(this))
                        }
                        </tbody>
                    </table></div>;
        }else{
                            new_detail_out_html=(
                    <div>
                        <hr className="lg" />
                        <h3 className="h3">客戶生產紀錄 明細檔</h3>
                        <div className="alert alert-warning">請先按上方的 <strong>存檔確認</strong>，再進行「客戶生產紀錄」新增。</div>
                    </div>
                    );
        }
        //一次視窗
        if (this.state.isShowCustomerEdit) {
            customer_detail_out_html =
                <MdoaleditCustomerDtail bsSize="large" animation={false} onRequestHide={this.closeEditDetail}>
                <div className="modal-header">
                    <button className="close" onClick={this.closeEditDetail}>&times;</button>
                    <h5 className="modal-title text-secondary">基本資料 <small><i className="fa-angle-double-right"></i> 編輯</small></h5>
                </div>
                <div className="modal-body">
    				<form className="form form-sm" onSubmit={this.handleSubmit}>
    					<div className="form-group row">
    						<label className="col-xs-1 form-control-label text-xs-right">客戶編號</label>
    						<div className="col-xs-3">
    							<input type="text"
                                       className="form-control"
                                       value={fieldData.customer_sn}
                                       onChange={this.changeFDValue.bind(this,'customer_sn')}
                                       placeholder="系統自動產生"
                                       disabled={true} />
    						</div>
    						<small className="col-xs-8 text-muted">系統自動產生，無法修改</small>
    					</div>
    					<div className="form-group row">
    						<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 客戶類別</label>
    						<div className="col-xs-3">
    							<select className="form-control"
                                        value={fieldData.customer_type}
                                        onChange={this.changeFDValue.bind(this,'customer_type')}>
    							    {
    							    CommData.CustomerType.map(function (itemData, i) {
    							        return(
    							        <option key={itemData.id} value={itemData.id}>{itemData.label}</option>);
    							    })
    							    }
    							</select>
    						</div>
    					</div>

    					<div className="form-group row">
    						<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 客戶名稱</label>
    						<div className="col-xs-3">
    							<input type="text"
                                       className="form-control"
                                       value={fieldData.customer_name}
                                       onChange={this.changeFDValue.bind(this,'customer_name')}
                                       maxLength="64"
                                       required />
    						</div>
    						<small className="col-xs-8 text-muted">
    						    如並非自有客戶，請填該單位名稱。ex. 宏其醫院
    						</small>
    					</div>

						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">聯絡電話1</label>
							<div className="col-xs-3">
								<input type="tel"
                                       className="form-control"
                                       value={fieldData.tel_1}
                                       onChange={this.changeFDValue.bind(this,'tel_1')}
                                       maxLength="16" />
							</div>
							<label className="col-xs-1 form-control-label text-xs-right">聯絡電話2</label>
							<div className="col-xs-4">
								<input type="tel"
                                       className="form-control"
                                       value={fieldData.tel_2}
                                       onChange={this.changeFDValue.bind(this,'tel_2')}
                                       maxLength="16" />
							</div>
						</div>

						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">身分證號</label>
							<div className="col-xs-3">
								<input type="text"
                                       className="form-control"
                                       value={fieldData.sno}
                                       onChange={this.changeFDValue.bind(this,'sno')}
                                       maxLength="10" />
							</div>
							<label className="col-xs-1 form-control-label text-xs-right">生日</label>
							<div className="col-xs-4">
								<InputDate id="birthday"
                                           onChange={this.changeFDValue}
                                           field_name="birthday"
                                           value={fieldData.birthday} />
							</div>
						</div>

						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 送餐地址</label>
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
                                       address_field="tw_address_1" />
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
                                       address_field="tw_address_2" />
						</div>

                        <div className="form-group row">
                            <label className="col-xs-1 form-control-label text-xs-right">APP 帳號</label>
                            <div className="col-xs-3">
                                <input type="text"
                                       className="form-control"
                                       value={fieldData.app_account}
                                       onChange={this.changeFDValue.bind(this,'app_account')}
                                       maxLength="16" />
                            </div>
                            <label className="col-xs-1 form-control-label text-xs-right">APP 密碼</label>
                            <div className="col-xs-4">
                                <input type="password"
                                       className="form-control"
                                       value={fieldData.app_password}
                                       onChange={this.changeFDValue.bind(this,'app_password')}
                                       maxLength="16" />
                            </div>
                        </div>
    					<div className="form-group row">
    						<label className="col-xs-1 form-control-label text-xs-right">備註</label>
    						<div className="col-xs-8">
    							<textarea col="30" row="3" className="form-control"
                                          value={fieldData.memo}
                                          onChange={this.changeFDValue.bind(this,'memo')}
                                          maxLength="256"></textarea>
    						</div>
    					</div>
    					<div className="form-action">
    						<button type="submit" className="btn btn-primary btn-sm col-xs-offset-1" name="btn-1"><i className="fa-check"></i> 存檔確認</button> { }
    						<button type="button" className="btn btn-blue-grey btn-sm" onClick={this.closeDetail}><i className="fa-times"></i> 回列表</button>
    					</div>
    				</form>
                    {new_detail_out_html}
                </div>
                </MdoaleditCustomerDtail>;
        }
        //一次視窗
        outHtml =
        (
        <div>
            {customer_detail_out_html}
                    {customer_born_out_html}
				<h3 className="h3">{this.props.Caption}</h3>
				<form onSubmit={this.handleSearch}>
						<div className="table-header">
                            <div className="table-filter">
                                <div className="form-inline form-sm">
                                    <div className="form-group">
                                        <label className="text-sm">客戶名稱/身分證號/電話</label> { }
                                        <input type="text" className="form-control"
                                               value={searchData.word}
                                               onChange={this.changeGDValue.bind(this,'word')}
                                               placeholder="請擇一填寫" /> { }
                                        <label className="text-sm">客戶分類</label> { }
                                        <select className="form-control"
                                                value={searchData.customer_type}
                                                onChange={this.onCustomerTypeChange}>
                                            <option value="">全部</option>
                                            {
                                                CommData.CustomerType.map(function (itemData, i) {
                                                    return (
                                                    <option key={itemData.id} value={itemData.id }>{itemData.label}</option>);
                                                })
                                            }
                                        </select> { }
                                        <label className="text-sm">地址</label> { }
                                        <select className="form-control"
                                                value={searchData.city}
                                                onChange={this.onCityChange}>
                                            <option value="">全部縣市</option>
                                            {
                                            CommData.twDistrict.map(function (itemData, i) {
                                                return (
                                                <option key={itemData.city} value={itemData.city }>{itemData.city}</option>);
                                            })
                                            }
                                        </select> { }
                                        <select className="form-control"
                                                value={searchData.country}
                                                onChange={this.onCountryChange}>
                                            <option value="">全部鄉鎮市區</option>
                                            {
                                            this.state.country_list.map(function (itemData, i) {
                                                return (
                                                <option key={itemData.county} value={itemData.county }>{itemData.county}</option>);
                                            })
                                            }
                                        </select> { }
                                        <button className="btn btn-secondary btn-sm" type="submit"><i className="fa-search"></i> 搜尋</button>
                                    </div>
                                </div>
                            </div>
						</div>
                        <table className="table table-sm table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th style={{"width":"5%"}} className="text-xs-center">
                        				<label className="c-input c-checkbox">
                        					<input type="checkbox" checked={this.state.checkAll} onChange={this.checkAll} />
                        					<span className="c-indicator"></span>
                        				</label>
                                    </th>
                        			<th style={{"width":"5%"}} className="text-xs-center">修改</th>
                        			<th style={{"width":"10%"}}>客戶名稱</th>
                        			<th style={{"width":"10%"}}>客戶分類</th>
                        			<th style={{"width":"15%"}}>身分證號</th>
                                    <th style={{"width":"10%"}}>電話1</th>
                        			<th style={{"width":"10%"}}>電話2</th>
                        			<th style={{"width":"35%"}}>送餐地址</th>
                                </tr>
                            </thead>
							<tbody>
							    {
							    this.state.gridData.rows.map(function (itemData, i) {
							        return (
							        <GridRowForQuick key={i}
                                                     ikey={i}
                                                     primKey={itemData.customer_id}
                                                     itemData={itemData}
                                                     delCheck={this.delCheck}
                                                     updateType={this.updateType}
                                                     openAllEdit={this.props.openAllEdit} />);
							    }.bind(this))
							    }
							</tbody>
                        </table>
					   <GridNavPage   ref="QuickSearch"
                                      StartCount={this.state.gridData.startcount}
                                      EndCount={this.state.gridData.endcount}
                                      RecordCount={this.state.gridData.records}
                                      TotalPage={this.state.gridData.total}
                                      NowPage={this.state.gridData.page}
                                      onQueryGridData={this.queryGridData}
                                      InsertType={this.insertType}
                                      deleteSubmit={this.deleteSubmit}/>
				</form>
        </div>
			);
        return outHtml;
    }
});

var GirdSubForm = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function () {
        return {
            gridData: { rows: [], page: 1 },
            gridDetailData: [],//生產紀錄list
            fieldDetailData: {},
            searchData: { title: null },
            detail_edit_type: 0,//生產紀錄edit
            checkAll: false,
            mealid_list: [],
            isShowCustomerBornEdit: false,//控制生產紀錄編輯視窗顯示
            isShowMealidSelect: false//控制選取用餐編號視窗顯示
        };
    },
    getDefaultProps: function () {
        return {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPathName: gb_approot + 'api/Customer'
        };
    },
    componentDidMount: function () {
        this.queryGridDetailData(this.props.mom_id);
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
    },
    deleteSubmit: function (e) {

        if (!confirm('確定是否刪除?')) {
            return;
        }

        var ids = [];
        for (var i in this.state.gridData.rows) {
            if (this.state.gridData.rows[i].check_del) {
                ids.push('ids=' + this.state.gridData.rows[i].customer_id);
            }
        }

        if (ids.length == 0) {
            tosMessage(null, '未選擇刪除項', 2);
            return;
        }

        jqDelete(this.props.apiPathName + '?' + ids.join('&'), {})
		.done(function (data, textStatus, jqXHRdata) {
		    if (data.result) {
		        tosMessage(null, '刪除完成', 1);
		        this.queryGridData(0);
		    } else {
		        tosMessage(null, data.message, 3);
		    }
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    handleSearch: function (e) {
        e.preventDefault();
        this.queryGridData(0);
        return;
    },
    detailHandleSubmit: function (e) {//新增及修改 生產編輯
        e.preventDefault();

        //檢查電話格式
        var check_tel_1 = checkTelReg(this.state.fieldDetailData['tel_1']);
        var check_tel_2 = checkTelReg(this.state.fieldDetailData['tel_2']);
        if (!check_tel_1.result) {
            tosMessage(gb_title_from_invalid, '連絡電話1-' + check_tel_1.errMsg, 3);
            return;
        }
        if (!check_tel_2.result) {
            tosMessage(gb_title_from_invalid, '連絡電話2-' + check_tel_2.errMsg, 3);
            return;
        }
        //檢查身分證字號
        if (!checkTwID(this.state.fieldDetailData['sno'])) {
            tosMessage(gb_title_from_invalid, '身分證字號格式錯誤!!', 3);
            return;
        }
        //檢查地址
        if (
            this.state.fieldDetailData['tw_city_1'] == undefined || this.state.fieldDetailData['tw_city_1'] == '' ||
            this.state.fieldDetailData['tw_country_1'] == undefined || this.state.fieldDetailData['tw_country_1'] == '' ||
            this.state.fieldDetailData['tw_address_1'] == undefined || this.state.fieldDetailData['tw_address_1'] == ''
            ) {

            tosMessage(gb_title_from_invalid, '送餐地址需填寫完整', 3);
            return;
        }

        if (this.state.detail_edit_type == 1) {
            jqPost(this.props.apiSubPathName, this.state.fieldDetailData)
			.done(function (data, textStatus, jqXHRdata) {
			    if (data.result) {
			        if (data.message != null) {
			            tosMessage(null, '新增完成' + data.message, 1);
			        } else {
			            tosMessage(null, '新增完成', 1);
			        }
			        //this.updateDetailType(data.id);
			        this.closeEditDetail();//新增完直接關閉
			    } else {
			        tosMessage(null, data.message, 3);
			    }
			}.bind(this))
			.fail(function (jqXHR, textStatus, errorThrown) {
			    showAjaxError(errorThrown);
			});
        }
        else if (this.state.detail_edit_type == 2) {
            jqPut(this.props.apiSubPathName, this.state.fieldDetailData)
			.done(function (data, textStatus, jqXHRdata) {
			    if (data.result) {
			        if (data.message != null) {
			            tosMessage(null, '修改完成' + data.message, 1);
			        } else {
			            tosMessage(null, '修改完成', 1);
			        }
			        this.closeEditDetail();//修改完直接關閉
			    } else {
			        tosMessage(null, data.message, 3);
			    }
			}.bind(this))
			.fail(function (jqXHR, textStatus, errorThrown) {
			    showAjaxError(errorThrown);
			});
        };
        return;
    },
    delCheck: function (i, chd) {

        var newState = this.state;
        this.state.gridData.rows[i].check_del = !chd;
        this.setState(newState);
    },
    checkAll: function () {

        var newState = this.state;
        newState.checkAll = !newState.checkAll;
        for (var prop in this.state.gridData.rows) {
            this.state.gridData.rows[prop].check_del = newState.checkAll;
        }
        this.setState(newState);
    },
    gridDetailData: function (page) {

        var parms = {
            main_id: this.props.main_id
        };

        $.extend(parms, this.state.searchData);

        return jqGet(this.props.apiSubPathName, parms);
    },
   queryGridDetailData: function (mom_id) {
        this.gridDetailData(mom_id)
        .done(function (data, textStatus, jqXHRdata) {
            this.setState({ gridDetailData: data });
        }.bind(this))
        .fail(function (jqXHR, textStatus, errorThrown) {
            showAjaxError(errorThrown);
        });
    },
    insertDetailType: function () {//新增明細檔
        var fiedlData = this.props.fiedlData;
        //新增要自動帶資料
        this.setState({
            detail_edit_type: 1,
            fieldDetailData: {
                born_id: null,
                meal_id: null,
                customer_id: fiedlData.customer_id,
                mom_name: fiedlData.customer_name,
                sno: fiedlData.sno,
                birthday: fiedlData.birthday,
                tel_1: fiedlData.tel_1,
                tel_2: fiedlData.tel_2,
                tw_zip_1: fiedlData.tw_zip_1, 
                tw_zip_2: fiedlData.tw_zip_2,
                tw_city_1: fiedlData.tw_city_1,
                tw_city_2: fiedlData.tw_city_2,
                tw_country_1: fiedlData.tw_country_1,
                tw_country_2: fiedlData.tw_country_2,
                tw_address_1: fiedlData.tw_address_1,
                tw_address_2: fiedlData.tw_address_2,
                born_type: 1
            }
        });
    },
    updateDetailType: function (id) {//修改明細檔
        jqGet(this.props.apiSubPathName, { id: id })
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ detail_edit_type: 2, fieldDetailData: data.data });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    viewDetailType: function (id) {//檢視明細檔
        jqGet(this.props.apiSubPathName, { id: id })
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ detail_edit_type: 3, fieldDetailData: data.data });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    changeFDDValue: function (name, e) {
        this.setInputValue(this.props.fddName, name, e);
    },
    changeGDValue: function (name, e) {
        this.setInputValue(this.props.gdName, name, e);
    },
    setFDValue: function (fieldName, value) {
        //此function提供給次元件調用，所以要以屬性往下傳。
        var obj = this.state[this.props.fddName];
        obj[fieldName] = value;
        this.setState({ fieldDetailData: obj });
    },
    setInputValue: function (collentName, name, e) {

        var obj = this.state[collentName];
        if (e.target.value == 'true') {
            obj[name] = true;
        } else if (e.target.value == 'false') {
            obj[name] = false;
        } else {
            obj[name] = e.target.value;
        }
        this.setState({ fieldDetailData: obj });
    },
    addDetail: function (e) {
        //新增生產紀錄
        this.insertDetailType();
        this.setState({ isShowCustomerBornEdit: true });
    },
    editDetail: function (detail_id, e) {
        //修改生產紀錄
        this.updateDetailType(detail_id);
        this.setState({ isShowCustomerBornEdit: true });
    },
    viewDetail: function (detail_id, e) {
        //修改生產紀錄
        this.viewDetailType(detail_id);
        this.setState({ isShowCustomerBornEdit: true });
    },
    deleteDetail: function (detail_id, e) {

        if (!confirm('確定是否刪除?')) {
            return;
        }

        jqDelete(this.props.apiSubPathName + '?ids=' + detail_id, {})
		.done(function (data, textStatus, jqXHRdata) {
		    if (data.result) {
		        tosMessage(null, '刪除完成', 1);
		        this.queryGridDetailData(0);
		    } else {
		        tosMessage(null, data.message, 3);
		    }
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    closeEditDetail: function () {
        //關閉生產紀錄視窗並更新list
        this.gridDetailData(0)
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ isShowCustomerBornEdit: false, detail_edit_type: 0, gridDetailData: data });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});

    },
    queryAllMealID: function () {//選取用餐編號-取得未使用的用餐編號List
        jqGet(gb_approot + 'api/GetAction/GetAllMealID', {})
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ mealid_list: data });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    showSelectMealid: function () {
        this.queryAllMealID();
        this.setState({ isShowMealidSelect: true });
    },
    closeSelectMealid: function () {
        this.setState({ isShowMealidSelect: false });
    },
    selectMealid: function (meal_id) {
        var fieldDetailData = this.state.fieldDetailData;//選取後變更mealid
        jqPost(gb_approot + 'api/GetAction/ChangeMealIDState', { old_id: fieldDetailData.meal_id, new_id: meal_id })
		.done(function (data, textStatus, jqXHRdata) {
		    if (!data.result) {
		        alert(data.message);
		    }
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    //showAjaxError(errorThrown);
		});

        fieldDetailData.meal_id = meal_id;
        this.setState({ isShowMealidSelect: false, fieldDetailData: fieldDetailData });
    },
    render: function () {
        var outHtml = null;
        var fieldDetailData = this.state.fieldDetailData;//明細檔-客戶生產資料

        var MdoaleditCustomerBorn = ReactBootstrap.Modal;//啟用生產編輯的視窗內容
        var MdoalMealidSelect = ReactBootstrap.Modal;//啟用選取用餐編號的視窗內容
        var error_out_html =null;
        var customer_born_out_html = null;//存放生產編輯的視窗內容
        var mealid_select_out_html = null;//存放選取用餐編號的視窗內容
        if (this.state.isShowMealidSelect) {
            mealid_select_out_html =
					<MdoalMealidSelect bsSize="small" animation={false} onRequestHide={this.closeSelectMealid}>
                        <div className="modal-header">
                            <button className="close" onClick={this.closeSelectMealid}>&times;</button>
                            <h5 className="modal-title text-secondary">選擇用餐編號</h5>
                        </div>
							<div className="modal-body">
								<div className="alert alert-warning">僅列出尚未使用的用餐編號</div>
								<table>
									<tbody>
										<tr>
											<th style={{"width":"30%;"}} className="text-xs-center">選擇</th>
											<th style={{"width":"70%;"}}>用餐編號</th>
										</tr>
									    {
											this.state.mealid_list.map(function (itemData, i) {

											    var mealid_out_html =
													<tr key={itemData.meal_id}>
														<td className="text-xs-center">
															<label className="c-input c-checkbox">
																<input type="checkbox" onClick={this.selectMealid.bind(this,itemData.meal_id)} />
																<span className="c-indicator"></span>
															</label>
														</td>
														<td>{itemData.meal_id}</td>
													</tr>;
											    return mealid_out_html;
											}.bind(this))
									    }
									</tbody>
								</table>
							</div>
							<div className="modal-footer form-action">
								<button onClick={this.closeSelectMealid} className="btn btn-sm btn-blue-grey"><i className="fa-times"></i> { } 關閉</button>
							</div>
					</MdoalMealidSelect>;
        }
        if (this.state.isShowCustomerBornEdit) {
            customer_born_out_html =
					<MdoaleditCustomerBorn bsSize="large" animation={false} onRequestHide={this.closeEditDetail}>
                        <div className="modal-header">
                            <button className="close" onClick={this.closeEditDetail}>&times;</button>
                            <h5 className="modal-title text-secondary">客戶生產紀錄 <small><i className="fa-angle-double-right"></i> 編輯</small></h5>
                        </div>
						<form className="form form-sm" onSubmit={this.detailHandleSubmit} id="form2">
							<div className="modal-body">
							    {mealid_select_out_html}
							    {error_out_html}
								<div className="form-group row">
									<label className="col-xs-2 form-control-label text-xs-right"><span className="text-danger">*</span> 媽媽姓名</label>
									<div className="col-xs-3">
										<input type="text"
                                               className="form-control"
                                               value={fieldDetailData.mom_name}
                                               onChange={this.changeFDDValue.bind(this,'mom_name')}
                                               maxLength="64"
                                               required
                                               disabled={this.state.detail_edit_type==3} />
									</div>
								</div>

								<div className="form-group row">
									<label className="col-xs-2 form-control-label text-xs-right">聯絡電話1</label>
									<div className="col-xs-3">
										<input type="tel"
                                               className="form-control"
                                               value={fieldDetailData.tel_1}
                                               onChange={this.changeFDDValue.bind(this,'tel_1')}
                                               maxLength="16"
                                               disabled={this.state.detail_edit_type==3} />
									</div>
									<label className="col-xs-2 form-control-label text-xs-right">聯絡電話2</label>
									<div className="col-xs-4">
										<input type="tel"
                                               className="form-control"
                                               value={fieldDetailData.tel_2}
                                               onChange={this.changeFDDValue.bind(this,'tel_2')}
                                               maxLength="16"
                                               disabled={this.state.detail_edit_type==3} />
									</div>
								</div>

								<div className="form-group row">
									<label className="col-xs-2 form-control-label text-xs-right">身分證字號</label>
									<div className="col-xs-3">
										<input type="text"
                                               className="form-control"
                                               value={fieldDetailData.sno}
                                               onChange={this.changeFDDValue.bind(this,'sno')}
                                               maxLength="10"
                                               disabled={this.state.detail_edit_type==3} />
									</div>
									<label className="col-xs-2 form-control-label text-xs-right">生日</label>
									<div className="col-xs-4">
										<span className="has-feedback">
											<InputDate id="birthday"
                                                       onChange={this.changeFDDValue}
                                                       field_name="birthday"
                                                       value={fieldDetailData.birthday}
                                                       disabled={this.state.detail_edit_type==3} />
										</span>
									</div>
								</div>

								<div className="form-group row">
									<label className="col-xs-2 form-control-label text-xs-right"><span className="text-danger">*</span> 送餐地址</label>
									<TwAddress ver={3}
                                               onChange={this.changeFDDValue}
                                               setFDValue={this.setFDValue}
                                               zip_value={fieldDetailData.tw_zip_1}
                                               city_value={fieldDetailData.tw_city_1}
                                               country_value={fieldDetailData.tw_country_1}
                                               address_value={fieldDetailData.tw_address_1}
                                               zip_field="tw_zip_1"
                                               city_field="tw_city_1"
                                               country_field="tw_country_1"
                                               address_field="tw_address_1"
                                               disabled={this.state.detail_edit_type==3} />
								</div>

								<div className="form-group row">
									<label className="col-xs-2 form-control-label text-xs-right">備用地址</label>
									<TwAddress ver={3}
                                               onChange={this.changeFDDValue}
                                               setFDValue={this.setFDValue}
                                               zip_value={fieldDetailData.tw_zip_2}
                                               city_value={fieldDetailData.tw_city_2}
                                               country_value={fieldDetailData.tw_country_2}
                                               address_value={fieldDetailData.tw_address_2}
                                               zip_field="tw_zip_2"
                                               city_field="tw_city_2"
                                               country_field="tw_country_2"
                                               address_field="tw_address_2"
                                               disabled={this.state.detail_edit_type==3} />
								</div>
								<div className="form-group row">
									<label className="col-xs-2 form-control-label text-xs-right">預產期</label>
									<div className="col-xs-3">
										<InputDate id="expected_born_day"
                                                   onChange={this.changeFDDValue}
                                                   field_name="expected_born_day"
                                                   value={fieldDetailData.expected_born_day}
                                                   disabled={this.state.detail_edit_type==3} />
									</div>
									<label className="col-xs-2 form-control-label text-xs-right"><span className="text-danger">*</span> 生產日期</label>
									<div className="col-xs-4">
										<InputDate id="born_day"
                                                   onChange={this.changeFDDValue}
                                                   field_name="born_day"
                                                   value={fieldDetailData.born_day}
                                                   required={true}
                                                   disabled={this.state.detail_edit_type==3} />
									</div>
								</div>
								<div className="form-group row">
									<label className="col-xs-2 form-control-label text-xs-right">產檢醫院</label>
									<div className="col-xs-3">
										<input type="text"
                                               className="form-control"
                                               value={fieldDetailData.checkup_hospital}
                                               onChange={this.changeFDDValue.bind(this,'checkup_hospital')}
                                               maxLength="50"
                                               disabled={this.state.detail_edit_type==3} />
									</div>
									<label className="col-xs-2 form-control-label text-xs-right">生產醫院</label>
									<div className="col-xs-4">
										<input type="text"
                                               className="form-control"
                                               value={fieldDetailData.born_hospital}
                                               onChange={this.changeFDDValue.bind(this,'born_hospital')}
                                               maxLength="50"
                                               disabled={this.state.detail_edit_type==3} />
									</div>
								</div>
								<div className="form-group row">
									<label className="col-xs-2 form-control-label text-xs-right">第幾胎</label>
									<div className="col-xs-1">
										<input type="text"
                                               className="form-control"
                                               value={fieldDetailData.born_frequency}
                                               onChange={this.changeFDDValue.bind(this,'born_frequency')}
                                               maxLength="5"
                                               disabled={this.state.detail_edit_type==3} />
									</div>
									<label className="col-xs-1 form-control-label text-xs-right">生產方式</label>
									<div className="col-xs-3">
										<select className="form-control"
                                                value={fieldDetailData.born_type}
                                                onChange={this.changeFDDValue.bind(this,'born_type')}
                                                disabled={this.state.detail_edit_type==3}>
										    {
											CommData.BornType.map(function (itemData, i) {
											    return(
											    <option key={itemData.id} value={itemData.id }>{itemData.label}</option>);
											})
										    }
										</select>
									</div>
									<label className="col-xs-2 form-control-label text-xs-right">寶寶性別</label>
									<div className="col-xs-2">
										<select className="form-control"
                                                value={fieldDetailData.baby_sex}
                                                onChange={this.changeFDDValue.bind(this,'baby_sex')}
                                                disabled={this.state.detail_edit_type==3}>
										    {
											CommData.SexType.map(function (itemData, i) {
											    return(
											    <option key={itemData.id} value={itemData.id }>{itemData.label}</option>);
											})
										    }
										</select>
									</div>
								</div>
								<div className="form-group row">
									<label className="col-xs-2 form-control-label text-xs-right">備註</label>
									<div className="col-xs-9">
										<textarea col="30" row="2" className="form-control"
                                                  value={fieldDetailData.memo}
                                                  onChange={this.changeFDDValue.bind(this,'memo')}
                                                  maxLength="256"
                                                  disabled={this.state.detail_edit_type==3}></textarea>
									</div>
								</div>
							</div>
							<div className="modal-footer form-action row">
			        			<div className="col-xs-11">
			        				<button type="submit" form="form2" className="btn btn-sm btn-primary"><i className="fa-check"></i> 存檔確認</button> { }
			       					<button className="btn btn-sm btn-blue-grey" type="button" onClick={this.closeEditDetail}><i className="fa-times"></i>關閉</button>
			        			</div>
							</div>
						</form>
					</MdoaleditCustomerBorn>;
        }

        outHtml = (
				<div>
				    {customer_born_out_html}
                            <hr className="lg" />
                            <h3 className="h3">
                                客戶生產紀錄 明細檔
                                <button type="button" onClick={this.addDetail} className="btn btn-sm btn-success m-l-1"><i className="fa-plus-circle"></i> 新增生產紀錄</button>
                            </h3>
                            <table className="table table-sm table-bordered">
                                <thead>
                                    <tr>
                                        <th style={{"width":"10%;"}} className="text-xs-center">編輯</th>
                                        <th style={{"width":"15%;"}}>生產日期</th>
                                        <th style={{"width":"15%;"}}>用餐編號</th>
                                        <th style={{"width":"15%;"}}>媽媽姓名</th>
                                        <th style={{"width":"15%;"}}>寶寶性別</th>
                                        <th style={{"width":"10%;"}}>生產方式</th>
                                        {/*<th className="col-xs-1">是否結案</th>*/}
                                        <th style={{"width":"20%;"}}>備註</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.gridDetailData.map(function (itemData, i) {
                                            var out_sub_button = null;
                                            if (itemData.is_close) {//結案後僅能檢視生產紀錄
                                                out_sub_button =
                                                    <td className="text-xs-center">
                                                        <button className="btn-link btn-lg text-info" type="button" onClick={this.viewDetail.bind(this,itemData.born_id)}><i className="fa-search-plus"></i></button>
                                                    </td>;
                                            } else {
                                                out_sub_button =
                                                    <td className="text-xs-center">
                                                        <button className="btn-link btn-lg text-info" type="button" onClick={this.editDetail.bind(this,itemData.born_id)}><i className="fa-pencil"></i></button> { }
                                                        <button className="btn-link btn-lg text-danger" type="button" onClick={this.deleteDetail.bind(this,itemData.born_id)}><i className="fa-trash-o"></i></button>
                                                    </td>;
                                            }
                                            var out_sub_html =
                                                <tr key={i}>
                                                    {out_sub_button}
                                                    <td>{moment(itemData.born_day).format('YYYY/MM/DD')}</td>
                                                    <td>{itemData.meal_id}</td>
                                                    <td>{itemData.mom_name}</td>
                                                    <td><StateForGrid stateData={CommData.SexType} id={itemData.baby_sex} /></td>
                                                    <td><StateForGrid stateData={CommData.BornType} id={itemData.born_type} /></td>
                                                    {/*<td>{itemData.is_close? <span className="label label-success">結案</span>:<span className="label label-danger">未結案</span>}</td>*/}
                                                    <td>{itemData.memo}</td>
                                                </tr>;
                                            return out_sub_html;
                                        }.bind(this))
                                }
                                </tbody>
                            </table>
				</div>
                    );
        return outHtml;
    }
});
var dom = document.getElementById('page_content');
React.render(<GirdForm />, dom);
