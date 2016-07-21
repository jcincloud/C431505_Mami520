//主表單
var GirdForm = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function () {
        return {
            gridData: { rows: [], page: 1 },
            fieldData: {},
            searchData: { title: null },
            edit_type: 0,
            checkAll: false,
            data: [],
            name: []
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
            console.log(data);
        }.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    getmomName: function () {
        jqGet(gb_approot + 'api/GetAction/GetMomName', {})
       .done(function (data, textStatus, jqXHRdata) {
           this.setState({ name: data });
           console.log(data);
       }.bind(this))
       .fail(function (jqXHR, textStatus, errorThrown) {
           showAjaxError(errorThrown);
       });
    },
    render: function () {
        var outHtml = null;

        outHtml = (
                    <div>

                        <ul className="breadcrumb">
                        <li>
                            <i className="fa-caret-right"></i>
                            首頁
                        </li>
                        </ul>
                        <h3 className="h3">首頁</h3>

                         <ul className="nav nav-tabs" role="tablist">
                            <li className="nav-item">
                                <a className="nav-link active" data-toggle="tab" href="#Meal" role="tab"><i className="fa-spoon"></i> 用餐列表</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" data-toggle="tab" href="#Call" role="tab"><i className="fa-phone"></i> 今日電訪</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" data-toggle="tab" href="#Search" role="tab"><i className="fa-search"></i> 快速搜尋</a>
                            </li>
                         </ul>

                           <div className="tab-content">
                        <div className="tab-pane" id="Meal" role="tabpanel">
                             <div className="row">

                                 {this.state.data.map(function (itemData, i) {
                                     return <div className="col-xs-2">
                               <ul className="list-unstyled" id={itemData.key}>
                                   {
                                        itemData.meal_idlist.map(function (itemArry, j) {
                                            var is_disabled = true;
                                            var mom_html = null;
                                            return
                                            <li>
                                                {this.state.name.map(function (itemName, k) {
                                                    if (itemArry == itemName.meal_id) {
                                                        mom_html = <tl>{itemName.mom_name}</tl>;
                                                        is_disabled = false;
                                                    }
                                                }.bind(this))}
                                                <button className="btn btn-block btn-blue-grey-outline text-xs-left"
                                                        type="button" disabled={is_disabled}>
                                                    {itemArry}{mom_html}
                                                </button>
                                            </li>;
                                        }.bind(this))
                                   }
                               </ul>
                                     </div>;
                                 }.bind(this))}
                             </div>
                        </div>
                                <div className="tab-pane" id="Call" role="tabpanel">
                                    <TelRecord />
                                </div>
                                <div className="tab-pane" id="Search" role="tabpanel">
                                    <QuickSearch />
                                </div>
                           </div>

                    </div>
                    );
        return outHtml;
    }
});
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
					<td className="text-center"><GridCheckDel iKey={this.props.ikey} chd={this.props.itemData.check_del} delCheck={this.delCheck} /></td>
					<td className="text-center"><GridButtonModify modify={this.modify} /></td>
					<td>{this.props.itemData.mom_name}</td>
					<td>{this.props.itemData.meal_id}</td>
					<td>{this.props.itemData.tel_1}</td>
					<td>{this.props.itemData.tel_2}</td>
					<td className="text-center"><StateForGrid stateData={CommData.TelReasonByDetail} id={this.props.itemData.tel_reason} /></td>
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
		    console.log(data);
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
                <MdoalCustomerBornSelect bsSize="xsmall" title="選擇客戶" onRequestHide={this.closeSelectCustomerBorn}>
                        <div className="modal-body">
                            <div className="table-header">
                                <div className="table-filter">
                                    <div className="form-inline">
                                        <div className="form-group">
                                            <label for="">客戶名稱/餐編/媽媽姓名</label> { }
                                            <input type="text" className="form-control input-sm"
                                                   value={searchBornData.word}
                                                   onChange={this.changeGDBornValue.bind(this,'word')}
                                                   placeholder="請擇一填寫" />
                                        </div>
                                    <label>客戶分類</label> { }
                                    <select className="form-control input-sm"
                                            value={searchBornData.customer_type}
                                            onChange={this.changeGDBornValue.bind(this,'customer_type')}>
                                    <option value="">全部</option>
                                        {
                                            CommData.CustomerType.map(function (itemData, i) {
                                                return
                                                <option key={itemData.id} value={itemData.id }>{itemData.label}</option>;
                                            })
                                        }
                                    </select> { }
                                        <div className="form-group">
                                            <label for="">正在用餐</label> { }
                                            <select className="form-control input-sm"
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
                            <table className="table-condensed">
                                <tbody>
                                    <tr>
                                        <th className="col-xs-1 text-center">選擇</th>
                                        <th className="col-xs-1">客戶姓名</th>
                                        <th className="col-xs-1">客戶類別</th>
                                        <th className="col-xs-1">用餐編號</th>
                                        <th className="col-xs-1">媽媽姓名</th>
                                        <th className="col-xs-1">電話1</th>
                                        <th className="col-xs-1">備註</th>
                                        <th className="col-xs-1">預產期</th>
                                    </tr>
                                    {
                                this.state.born_list.map(function (itemData, i) {

                                    var born_out_html =
                                        <tr key={itemData.born_id}>
                                            <td className="text-center">
                                                <label className="cbox">
                                                    <input type="checkbox" onClick={this.selectCustomerBorn.bind(this,itemData.customer_id,itemData.born_id,itemData.meal_id)} />
                                                    <i className="fa-check"></i>
                                                </label>
                                            </td>
                                            <td>{itemData.customer_name}</td>
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
                        <button onClick={this.closeSelectCustomerBorn}><i className="fa-times"></i> { } 關閉</button>
                    </div>
                </MdoalCustomerBornSelect>;
        }
        //二次視窗
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
			<MdoaleditCustomerBorn bsSize="large" title="電訪記錄編輯" onRequestHide={this.closeEditDetail}>
						<div>
				<h3 className="title">{this.props.Caption} 主檔</h3>

				<form className="form-horizontal clearfix" onSubmit={this.handleSubmit}>
					<div className="col-xs-9">
						<div className="form-group">
							<label className="col-xs-2 control-label">選擇客戶</label>
							<div className="col-xs-3">
								<div className="input-group">
									<input type="text"
                                           className="form-control"
                                           value={fieldData.mom_name}
                                           onChange={this.changeGDValue}
                                           maxLength="64"
                                           disabled />
                                         <span className="input-group-btn">
                                             <a className="btn"
                                                onClick={this.showSelectCustomerBorn}
                                                disabled={this.state.edit_type ==2}><i className="fa-plus"></i></a>
                                         </span>
								</div>
							</div>
                        <small className="help-inline col-xs-6"><span className="text-danger">(必填)</span> 請按 <i className="fa-plus"></i> 選取</small>
						</div>
                        <div className="form-group">
                            <label className="col-xs-2 control-label">電訪日期</label>
                            <div className="col-xs-3">
                                <span className="has-feedback">
                                    <InputDate id="tel_day"
                                               onChange={this.changeGDValue}
                                               field_name="tel_day"
                                               value={fieldData.tel_day}
                                               required={true}
                                               disabled={true} />
                                </span>
                            </div>
                        <small className="help-inline col-xs-6">系統自動產生，無法修改</small>
                        </div>
                        <div className="form-group">
                        <label className="col-xs-2 control-label">電訪原因</label>
                        <div className="col-xs-3">
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
                        <small className="text-danger col-xs-6">(必填)</small>
                        </div>
                        <div className="form-group">
                            <label className="col-xs-2 control-label">客戶類別</label>
                            <div className="col-xs-3">
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
                        </div>
					</div>
				</form>
						</div>
			    {/*---產品明細---*/}{detail_out_html}
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
                                        <div className="form-group m-r-1">
                                            <label className="text-sm" for="">電訪日期</label>
                                            <span className="has-feedback">
											<InputDate id="start_date" ver={1}
                                                       onChange={this.changeGDValue}
                                                       field_name="start_date"
                                                       value={searchData.start_date} />
                                            </span>

                                            <label className="text-sm">電訪原因</label>
							            <select className="form-control input-sm"
                                                value={searchData.tel_reason}
                                                onChange={this.changeGDValue.bind(this, 'tel_reason')}>
							                <option value="">全部</option>
							                {
							                CommData.TelReasonByDetail.map(function (itemData, i) {
							                    return (
							                    <option key={itemData.id} value={itemData.id }>{itemData.label}</option>);
							                })
							                }
							            </select>
                                        <button className="btn-primary btn-sm" type="submit"><i className="fa-search"></i>{ }搜尋</button>
                                        </div>
                                    </div>
                                </div>
                        </div>
                        <table className="table table-sm table-bordered table-striped">
                            <thead>
                                    <tr>
                                        <th className="col-xs-1 text-center" style={{ width: "7%" }}>
										<label className="cbox">
											<input type="checkbox" checked={this.state.checkAll} onChange={this.checkAll} />
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
                                             updateType={this.updateType} />);
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

//明細檔編輯
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
                tel_state: 1
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
                return
                <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
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
										<th className="col-xs-3 text-center">時間</th>
										<th className="col-xs-2 text-center">原因</th>
										<th className="col-xs-4">內容</th>
										<th className="col-xs-1 text-center">狀態</th>
										<th className="col-xs-2">人員</th>
									</tr>
								    {
										this.state.gridSubData.map(function (itemData, i) {
										    var sub_out_html =
												<tr key={itemData.deatil_tel_record_id}>
												    {/*<td className="text-center">
														<button className="btn-link" type="button" onClick={this.updateSubType.bind(this,itemData.deatil_tel_record_id)}><i className="fa-pencil"></i></button>
														<button className="btn-link text-danger" onClick={this.detailDeleteSubmit.bind(this,itemData.deatil_tel_record_id)}><i className="fa-trash"></i></button>
													</td>*/}
													<td className="text-center"><strong>{moment(itemData.tel_datetime).format('YYYY/MM/DD hh:mm:ss')}</strong></td>
													<td className="text-center"><StateForGrid stateData={CommData.TelReasonByDetail} id={this.props.tel_reason} /></td>
													<td>{itemData.memo}</td>
													<td className="text-center"><StateForGrid stateData={CommData.TelState} id={itemData.tel_state} /></td>
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
					<td className="text-center"><GridCheckDel iKey={this.props.ikey} chd={this.props.itemData.check_del} delCheck={this.delCheck} /></td>
					<td className="text-center"><GridButtonModify modify={this.modify} /></td>
					<td>{this.props.itemData.customer_name}</td>
					<td><StateForGrid stateData={CommData.CustomerType} id={this.props.itemData.customer_type} /></td>
					<td>{this.props.itemData.sno}</td>
                    <td>{this.props.itemData.tel_1}</td>
					<td>{this.props.itemData.tel_2}</td>
					<td>{this.props.itemData.tw_city_1+this.props.itemData.tw_country_1+this.props.itemData.tw_address_1}</td>
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
            searchData: { title: null },
            edit_type: 0,
            checkAll: false,
            country_list: [],
            next_id: null,
            isShowCustomerEdit:false
        };
    },
    getDefaultProps: function () {
        return {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPathName: gb_approot + 'api/Customer',
            apiSubPathName:gb_approot+'api/CustomerBorn'
        };
    },
    changeGDValue: function (name, e) {
        this.setInputValue(this.props.gdName, name, e);
    },
    gridData: function () {
        var parms = {
            main_id: this.props.main_id
        };
        $.extend(parms, this.state.searchData);

        return jqGet(this.props.apiPathName, parms);
    },
    componentDidMount: function () {
        this.queryGridData(1);
        this.queryGridDetailData(1);
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
            this.setState({ isShowCustomerEdit: false, detail_edit_type: 0, gridDetailData: data });
        }.bind(this))
        .fail(function (jqXHR, textStatus, errorThrown) {
            showAjaxError(errorThrown);
        });
        //檢查mealID
        var fDData = this.state.fieldDetailData;
        jqPost(gb_approot + 'api/GetAction/CheckMealID', { born_id: fDData.born_id, meal_id: fDData.meal_id })
        .done(function (data, textStatus, jqXHRdata) {
        }.bind(this));

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
    handleSearch: function (e) {
        e.preventDefault();
        this.queryGridData(0);
        return;
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
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
		    this.setState({ edit_type: 2, fieldData: data.data, isShowCustomerEdit: true });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    editDetail: function (detail_id, e) {
        //修改生產紀錄
        this.updateDetailType(detail_id);
        this.setState({ isShowCustomerEdit: true });
    },
    viewDetail: function (detail_id, e) {
        //修改生產紀錄
        this.viewDetailType(detail_id);
        this.setState({ isShowCustomerEdit: true });
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
    delCheck: function (i, chd) {
        var newState = this.state;
        this.state.gridData.rows[i].check_del = !chd;
        this.setState(newState);
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
    changeFDValue: function (name, e) {
        var obj = this.state.searchData;
        obj[name] = e.target.value;
        this.setState({ searchData: obj });
        this.queryAllCustomer();
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
    gridDetailData: function (page) {

        var parms = {
            main_id: this.props.main_id
        };

        $.extend(parms, this.state.searchData);

        return jqGet(this.props.apiSubPathName, parms);
    },
    render: function () {
        var outHtml = null;
        var searchData = this.state.searchData;
        //一次視窗
        var customer_detail_out_html = null;
        var fieldDetailData = this.state.fieldDetailData;
        var fieldData = this.state.fieldData;
        var MdoaleditCustomerDtail = ReactBootstrap.Modal;
        
        if (this.state.isShowCustomerEdit) {
            customer_detail_out_html=
                <MdoaleditCustomerDtail bsSize="large" title="基本資料編輯" onRequestHide={this.closeEditDetail}>
    <div>
				<h3 className="h3">{this.props.Caption}<small className="sub"><i className="fa-angle-double-right"></i> { }編輯</small></h3>
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
    							    CommData.CustomerType.map(function(itemData,i) {
    							    return
    							    <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
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
    						<button type="button" className="btn btn-blue-grey btn-sm" onClick={this.closeEditDetail}><i className="fa-times"></i> 回列表</button>
    					</div>
    				</form>
        </div>
     <div>
                    <hr className="lg" />
                    <h3 className="h3">
                        客戶生產紀錄 明細檔 { }
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
                            </tr>
                        </thead>
                        <tbody>
                            {
                            this.state.gridDetailData.map(function(itemData,i) {
                            var out_sub_button=null;
                            if(itemData.is_close){//結案後僅能檢視生產紀錄
                            out_sub_button=
                                            <td className="text-xs-center">
                                                <button className="btn btn-link btn-lg text-info" type="button" onClick={this.viewDetail.bind(this,itemData.born_id)}><i className="fa-search-plus"></i></button>
                                            </td>;
                        }else{
                        out_sub_button=
                                            <td className="text-xs-center">
                                                <button className="btn btn-link btn-lg text-info" type="button" onClick={this.editDetail.bind(this,itemData.born_id)}><i className="fa-pencil"></i></button> { }
                                                <button className="btn btn-link btn-lg text-danger" type="button" onClick={this.deleteDetail.bind(this,itemData.born_id)}><i className="fa-trash-o"></i></button>
                                            </td>;
                        }
                        var out_sub_html =
                                        <tr key={i}>{out_sub_button}
                                            <td>{moment(itemData.born_day).format('YYYY/MM/DD')}</td>
                                            <td>{itemData.meal_id}</td>
                                            <td>{itemData.mom_name}</td>
                                            <td><StateForGrid stateData={CommData.SexType} id={itemData.baby_sex} /></td>
                                            <td><StateForGrid stateData={CommData.BornType} id={itemData.born_type} /></td>{/*<td>{itemData.is_close? <span className="label label-success">結案</span>:<span className="label label-danger">未結案</span>}</td>*/}
                                            <td>{itemData.memo}</td>
                                        </tr>;
                        return out_sub_html;
                        }.bind(this))
                        }
                        </tbody>
                    </table>
     </div>
</MdoaleditCustomerDtail>;
        }
        //一次視窗
        outHtml =
        (
        <div>
            {customer_detail_out_html}
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
                                               placeholder="請擇一填寫" />
                                    </div> { }
<div className="form-group">
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
    </select>
</div> { }
    <div className="form-group">
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
        </select>
    </div> { }
    <button className="btn btn-secondary btn-sm" type="submit"><i className="fa-search"></i> { }搜尋</button>
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
                                         updateType={this.updateType} />);
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
                                 deleteSubmit={this.deleteSubmit}
                                 showAdd={false} />
				</form>
        </div>
			);
        return outHtml;
    }
});

var dom = document.getElementById('page_content');
React.render(<GirdForm />, dom);
