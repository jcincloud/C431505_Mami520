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
            isShowCustomerAllDetail: false,
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
        this.queryAllCustomerBorn();
        this.setState({ isShowCustomerAllDetail: true,born_id:born_id,customer_id:customer_id ,meal_id:meal_id,customer_need_id:customer_need_id,schedule_id:schedule_id});
    },
    closeSelectCustomerBorn: function () {
        this.setState({ isShowCustomerAllDetail: false });
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
        var all_detail_out_html = null;
        var MdoalCustomerDetailSelect = ReactBootstrap.Modal;
        var fieldData=this.state.fieldData;
        if (this.state.isShowCustomerAllDetail) {
            all_detail_out_html =
                       <MdoalCustomerDetailSelect bsSize="large" title="客戶資料總覽" onRequestHide={this.closeSelectCustomerBorn}>
                                 <div id="OverView">
                                    <ul className="breadcrumb">
                                        <li>
                                             <i className="fa-caret-right"></i>
                                            客戶資料總覽
                                        </li>
                                    </ul>
                                    <h3 className="h3">客戶資料總覽 </h3>

                                     <ul className="nav nav-tabs" role="tablist">
                                        <li className="nav-item">
                                            <a className="nav-link active" data-toggle="tab" href="#Profile" role="tab">基本資料</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link" data-toggle="tab" href="#Birth" role="tab">生產紀錄</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link" data-toggle="tab" href="#Sell" role="tab">銷售紀錄</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link" data-toggle="tab" href="#MealSchedule" role="tab">用餐排程</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link" data-toggle="tab" href="#Query" role="tab">用餐需求</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link" data-toggle="tab" href="#CallSchedule" role="tab">電訪排程</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link" data-toggle="tab" href="#CallRecord" role="tab">電訪紀錄</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link" data-toggle="tab" href="#Gift" role="tab">禮品紀錄</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link" data-toggle="tab" href="#Pay" role="tab">帳款紀錄</a>
                                        </li>
                                     </ul>

                                 </div>
                                <div className="tab-content">
                                    <div className="tab-pane" id="Profile" role="tabpanel">
                                        <BasicData closeAllEdit={this.closeSelectCustomerBorn} born_id={this.state.born_id} mom_id={this.state.customer_id} />
                                    </div>
                                    <div className="tab-pane" id="Birth" role="tabpanel">
                                        <CustomerBornData closeAllEdit={this.closeSelectCustomerBorn} born_id={this.state.born_id} mom_id={this.state.customer_id} />
                                    </div>
                                    <div className="tab-pane" id="Sell" role="tabpanel">
                                        <SalesDetailData born_id={this.state.born_id} mom_id={this.state.customer_id} />
                                    </div>
                                    <div className="tab-pane" id="MealSchedule" role="tabpanel">
                                        <MealScheduleData born_id={this.state.born_id} mom_id={this.state.customer_id} />
                                    </div>
                                    <div className="tab-pane" id="Query" role="tabpanel">
                                        <DiningDemandData closeAllEdit={this.closeSelectCustomerBorn} born_id={this.state.born_id} mom_id={this.state.customer_id} meal_id={this.state.meal_id} customer_need_id={this.state.customer_need_id} />
                                    </div>
                                    <div className="tab-pane" id="CallSchedule" role="tabpanel">
                                        <TelScheduleData closeAllEdit={this.closeSelectCustomerBorn} born_id={this.state.born_id} mom_id={this.state.customer_id} meal_id={this.state.meal_id} schedule_id={this.state.schedule_id} />
                                    </div>
                                    <div className="tab-pane" id="CallRecord" role="tabpanel">
                                        <TelRecordData born_id={this.state.born_id} mom_id={this.state.customer_id} />
                                    </div>
                                    <div className="tab-pane" id="Gift" role="tabpanel">
                                        <GiftRecordData born_id={this.state.born_id} mom_id={this.state.customer_id} />
                                    </div>
                                    <div className="tab-pane" id="Pay" role="tabpanel">
                                        <AccountRecordData born_id={this.state.born_id} mom_id={this.state.customer_id} />
                                    </div>
                                </div>
                       </MdoalCustomerDetailSelect>
        }
        outHtml = (
                    <div>
                        {all_detail_out_html}
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
					<td><button type="button" onClick={this.props.openAllEdit}>{this.props.itemData.mom_name}</button></td>
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
                                                return  (
                                                <option key={itemData.id} value={itemData.id }>{itemData.label}</option>);
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
					<td><button type="button" onClick={this.props.openAllEdit}>{this.props.itemData.customer_name}</button></td>
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
                this.queryGridDetailData(this.state.fieldData.customer_id);
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
            this.setState({ isShowCustomerBornEdit: false, detail_edit_type: 0, gridDetailData: data });
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
        var fieldData = this.state.fieldData;
        console.log(fieldData);
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
    handleSearch: function (e) {
        e.preventDefault();
        this.queryGridData(0);
        return;
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
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
    setFDValue: function (fieldName, value) {
        //此function提供給次元件調用，所以要以屬性往下傳。
        var obj = this.state[this.props.fddName];
        obj[fieldName] = value;
        this.setState({ fieldDetailData: obj });
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
                    <MdoaleditCustomerBorn bsSize="large" title="客戶生產紀錄 編輯" onRequestHide={this.closeEditDetail}>
                        {/*<div className="modal-header light">
                            <div className="pull-right">
                                <button onClick={this.closeEditDetail} type="button"><i className="fa-times"></i></button>
                            </div>
                            <h4 className="modal-title">編輯 { } 生產紀錄</h4>
                        </div>*/}
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

        var detail_out_html = null;
        if (this.state.edit_type == 2) {
            detail_out_html =
            <SubForm ref="SubForm"
                     main_id={fieldData.schedule_detail_id}
                     tel_reason={fieldData.tel_reason} />;
        }
        //一次視窗
        if (this.state.isShowCustomerEdit) {
            customer_detail_out_html =
                <MdoaleditCustomerDtail bsSize="large" title="基本資料編輯" onRequestHide={this.closeEditDetail}>
    <div>
        {customer_born_out_html}
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
                                 deleteSubmit={this.deleteSubmit}
                                 showAdd={false} />
				</form>
        </div>
			);
        return outHtml;
    }
});
var BasicData = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function () {
        return {
            gridData: { rows: [], page: 1 },
            fieldData: { customer_sn:null },
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
        //this.queryGridData(1);
        console.log(this.props.born_id,this.props.mom_id);
        this.updateType(this.props.mom_id);
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
    queryGridDetailData: function (mom_id) {
        this.gridDetailData(mom_id)
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
                this.queryGridDetailData(this.state.fieldData.customer_id);
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
            this.setState({ isShowCustomerBornEdit: false, detail_edit_type: 0, gridDetailData: data });
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
        var fieldData = this.state.fieldData;
        console.log(fieldData);
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
    handleSearch: function (e) {
        e.preventDefault();
        this.queryGridData(0);
        return;
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
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
    setFDValue: function (fieldName, value) {
        //此function提供給次元件調用，所以要以屬性往下傳。
        var obj = this.state[this.props.fddName];
        obj[fieldName] = value;
        this.setState({ fieldDetailData: obj });
    },
    render: function () {
        var fieldData = this.state.fieldData;
        var fieldDetailData = this.state.fieldDetailData;
        var detail_out_html=null;
        var customer_born_out_html=null;
        var MdoaleditCustomerBorn = ReactBootstrap.Modal;
        if (this.state.isShowCustomerBornEdit) {
            customer_born_out_html =
                    <MdoaleditCustomerBorn bsSize="large" title="客戶生產紀錄 編輯" onRequestHide={this.closeEditDetail}>
                        {/*<div className="modal-header light">
                            <div className="pull-right">
                                <button onClick={this.closeEditDetail} type="button"><i className="fa-times"></i></button>
                            </div>
                            <h4 className="modal-title">編輯 { } 生產紀錄</h4>
                        </div>*/}
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

        var detail_out_html = null;
        if (this.state.edit_type == 2) {
            detail_out_html =
            <SubForm ref="SubForm"
                     main_id={fieldData.schedule_detail_id}
                     tel_reason={fieldData.tel_reason} />;
        }
        outHtml = (
			<div title="基本資料編輯">
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
    							    CommData.CustomerType.map(function (itemData, i) {
    							        return (
    							        <option key={itemData.id} value={itemData.id }>{itemData.label}</option>);
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
    						<button type="button" className="btn btn-blue-grey btn-sm" onClick={this.props.closeAllEdit}><i className="fa-times"></i> 回列表</button>
    					</div>
    				 </form>{/*---生產紀錄版面---*/}
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
			</div>
 );
        return outHtml;
    }

});
var CustomerBornData = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function () {
        return {
            gridData: { rows: [], page: 1 },
            fieldData: { customer_sn: null },
            searchData: { title: null },
            edit_type: 0,
            checkAll: false,
            country_list: []
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
        this.updateType(this.props.mom_id);
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
    queryGridData: function (mom_id) {
        this.gridData(mom_id)
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ gridData: data });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    insertType: function () {//未使用
        this.setState({
            edit_type: 1,
            fieldData: { customer_type: 1, tw_city_1: '桃園市', tw_country_1: '中壢區' },
            gridDetailData: []
        });
    },
    updateType: function (id) {
        jqGet(this.props.apiPathName, { id: id })
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({
		        edit_type: 2,
		        fieldData: data.data
		    });
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
    render: function () {
        var fieldData = this.state.fieldData;
        var GirdSubForm_html=null;
        if(fieldData.customer_id!=undefined){
            GirdSubForm_html=( <GirdSubForm main_id={fieldData.customer_id}
                                            customer_type={fieldData.customer_type}
                                            fiedlData={fieldData} />);
        }
        outHtml = (
            <div>
                <h3 className="h3">{this.props.Caption}<small className=""></small></h3>
				<form className="form form-sm" onSubmit={this.handleSubmit} id="form1">
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">客戶編號</label>
						<div className="col-xs-2">
							<input type="text"
                                   className="form-control"
                                   value={fieldData.customer_sn}
                                   onChange={this.changeFDValue.bind(this,'customer_sn')}
                                   placeholder="系統自動產生"
                                   disabled={true} />
						</div>

						<label className="col-xs-1 form-control-label text-xs-right">客戶名稱</label>
						<div className="col-xs-2">
							<input type="text"
                                   className="form-control"
                                   value={fieldData.customer_name}
                                   onChange={this.changeFDValue.bind(this,'customer_name')}
                                   maxLength="64"
                                   required
                                   disabled={true} />
						</div>

						<label className="col-xs-1 form-control-label text-xs-right">客戶類別</label>
						<div className="col-xs-2">
							<select className="form-control"
                                    value={fieldData.customer_type}
                                    onChange={this.changeFDValue.bind(this,'customer_type')}
                                    disabled={true}>
							    {
							    CommData.CustomerType.map(function (itemData, i) {
							        return(
							        <option key={itemData.id} value={itemData.id}>{itemData.label}</option>);
							    })
							    }
							</select>
						</div>
						<div className="col-xs-1 pull-xs-right">
							<button type="button" onClick={this.props.closeAllEdit} className="btn btn-sm btn-blue-grey"><i className="fa-arrow-left"></i> 回列表</button>
						</div>
					</div>
				</form>
                {/*---生產紀錄版面---*/}
                {GirdSubForm_html}
            </div>
            );
        return outHtml;
    }
});
var GridRowForSales = React.createClass({
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
					<td className="text-xs-center"><GridButtonModify modify={this.modify} /></td>
					<td>{this.props.itemData.record_sn}</td>
					<td>{moment(this.props.itemData.record_day).format('YYYY/MM/DD')}</td>
					<td><StateForGrid stateData={CommData.CustomerType} id={this.props.itemData.customer_type} /></td>
					<td>{this.props.itemData.meal_id}</td>
					<td>{this.props.itemData.name}</td>
					<td>{this.props.itemData.tel_1}</td>
					<td>{this.props.itemData.is_receipt?<span className="text-muted">已轉單</span>:<span className="text-indigo">未轉單</span>}</td>
					<td>{this.props.itemData.is_close?<span className="text-muted">結案</span>:<span className="text-danger">未結案</span>}</td>
				</tr>
			);
    }
});
var SalesDetailData = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function () {
        return {
            gridData: { rows: [], page: 1 },
            fieldData: { born_memo: null },
            searchData: { title: null },
            searchBornData: { word: null, customer_type: null, is_meal: false },
            edit_type: 0,
            checkAll: false,
            isShowCustomerBornSelect: false,
            born_list: []
        };
    },
    getDefaultProps: function () {
        return {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPathName: gb_approot + 'api/ProductRecord'
        };
    },
    componentDidMount: function () {
        //if (gb_main_id == 0) {
        //    this.queryGridData(1);
        //} else {//有帶id的話,直接進入修改頁面
        //    this.updateType(gb_main_id);
        //}
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
    },
    handleSubmit: function (e) {

        e.preventDefault();

        if (this.state.fieldData.customer_id == null || this.state.fieldData.customer_id == undefined) {
            tosMessage(gb_title_from_invalid, '未選擇客戶無法新增產品銷售資料!!', 3);
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
                ids.push('ids=' + this.state.gridData.rows[i].product_record_id);
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
    queryGridData: function (page) {
        this.gridData(page)
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ gridData: data });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    insertType: function () {
        this.setState({ edit_type: 1, fieldData: {} });
    },
    updateType: function (id) {
        jqGet(this.props.apiPathName, { id: id })
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ edit_type: 2, fieldData: data.data });
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
    onSelectChange: function (name, e) {
        var obj = this.state.searchData;
        obj[name] = e.target.value;
        this.setState({ searchData: obj });
        this.queryGridData(0);
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

		    fieldData.name = data.getBorn.mom_name;
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
		    fieldData.born_memo = data.getBorn.memo;

		    this.setState({ isShowCustomerBornSelect: false, fieldData: fieldData });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    //showAjaxError(errorThrown);
		});
    },
    closeRecord: function () {
        if (!confirm('確定是否結案?')) {
            return;
        }
        if (!this.state.fieldData.is_receipt) {
            tosMessage(null, '未轉應收帳款前不可結案!!', 3);
            return;
        }

        jqPost(gb_approot + 'api/GetAction/closeRecord', { main_id: this.state.fieldData.product_record_id })
		.done(function (data, textStatus, jqXHRdata) {
		    if (data.result) {
		        var fieldData = this.state.fieldData;
		        fieldData.is_close = data.result;
		        this.setState({ fieldData: fieldData });
		    } else {
		        tosMessage(null, data.message, 3);
		    }
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
    insertAccountsPayable: function () {
        //轉 應收帳款
        if (!confirm('確定是否轉應收帳款?')) {
            return;
        }
        var parms = {
            product_record_id: this.state.fieldData.product_record_id,
            customer_id: this.state.fieldData.customer_id,
            record_sn: this.state.fieldData.record_sn
        };

        jqPost(gb_approot + 'api/GetAction/insertAccountsPayable', parms)
		.done(function (data, textStatus, jqXHRdata) {
		    var fieldData = this.state.fieldData;
		    fieldData.is_receipt = data.result;
		    this.setState({ fieldData: fieldData });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    onCustomerTypeChange: function (e) {
        var obj = this.state.searchData;
        obj['customer_type'] = e.target.value;
        this.setState({ searchData: obj });
        this.queryGridData(0);
    },
    setAccountsPayable: function () {
        //檢視 應收帳款
        document.location.href = gb_approot + 'Active/AccountsPayable?product_record_id=' + this.state.fieldData.product_record_id;
    },
    render: function () {

        var searchData = this.state.searchData;
        outHtml = (
            <div>
				<h3 className="h3">{this.props.Caption}</h3>
				<form onSubmit={this.handleSearch}>

						<div className="table-header">
							<div className="table-filter">
								<div className="form-inline form-sm">
									<div className="form-group">
										<label className="text-sm">訂單日期</label> { }
											<InputDate id="start_date" ver={2}
                                                       onChange={this.changeGDValue}
                                                       field_name="start_date"
                                                       value={searchData.start_date} /> { }
										<label className="text-sm">~</label> { }
											<InputDate id="end_date" ver={2}
                                                       onChange={this.changeGDValue}
                                                       field_name="end_date"
                                                       value={searchData.end_date} /> { }
										<label className="text-sm">是否轉單</label> { }
										<select className="form-control"
                                                value={searchData.is_receipt}
                                                onChange={this.onSelectChange.bind(this,'is_receipt')}>
											<option value="">是否轉單</option>
											<option value="true">已轉單</option>
											<option value="false">未轉單</option>
										</select> { }

										<label className="text-sm">是否結案</label> { }
										<select className="form-control"
                                                value={searchData.is_close}
                                                onChange={this.onSelectChange.bind(this,'is_close')}>
											<option value="">是否結案</option>
											<option value="true">結案</option>
											<option value="false">未結案</option>
										</select> { }

										<button className="btn btn-secondary btn-sm" type="submit"><i className="fa-search"></i> { }搜尋</button>
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
									<th style={{"width":"12%;"}}>銷售單號</th>
									<th style={{"width":"12%;"}}>訂購時間</th>
									<th style={{"width":"10%;"}}>客戶分類</th>
									<th style={{"width":"10%;"}}>用餐編號</th>
									<th style={{"width":"14%;"}}>媽媽姓名</th>
									<th style={{"width":"12%;"}}>電話1</th>
									<th style={{"width":"10%;"}}>是否轉單</th>
									<th style={{"width":"10%;"}}>是否結案</th>
								</tr>
							</thead>
							<tbody>
							    {
								this.state.gridData.rows.map(function (itemData, i) {
								    return(
								    <GridRowForSales key={i}
                                                     ikey={i}
                                                     primKey={itemData.product_record_id}
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
var GridRowForMealSchedule = React.createClass({
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
                    <td className="text-xs-center"><GridButtonModify modify={this.modify} /></td>
                    <td>{this.props.itemData.meal_id}</td>
                    <td>{this.props.itemData.mom_name}</td>
                    <td>{this.props.itemData.sno}</td>
                    <td>{this.props.itemData.tel_1}</td>
                    <td>{moment(this.props.itemData.meal_start).format('YYYY/MM/DD')}</td>
                    <td>{moment(this.props.itemData.meal_end).format('YYYY/MM/DD')}</td>
                </tr>
            );
    }
});
var MealScheduleData = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function () {
        return {
            gridData: { rows: [], page: 1 },
            fieldData: {},
            searchData: { title: null },
            edit_type: 0,
            checkAll: false
        };
    },
    getDefaultProps: function () {
        return {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPathName: gb_approot + 'api/RecordDetail'
        };
    },
    componentDidMount: function () {
        //if (gb_main_id == 0) {
        //    this.queryGridData(1);
        //} else {//有帶id的話,直接進入修改頁面
        //    this.updateType(gb_main_id);
        //}
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
                ids.push('ids=' + this.state.gridData.rows[i].gift_record_id);
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
    queryGridData: function (page) {
        this.gridData(page)
        .done(function (data, textStatus, jqXHRdata) {
            this.setState({ gridData: data });
        }.bind(this))
        .fail(function (jqXHR, textStatus, errorThrown) {
            showAjaxError(errorThrown);
        });
    },
    insertType: function () {
        this.setState({ edit_type: 1, fieldData: {} });
    },
    updateType: function (id) {
        jqGet(this.props.apiPathName, { id: id })
        .done(function (data, textStatus, jqXHRdata) {
            this.setState({ edit_type: 2, fieldData: data.data });
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
    queryAllActivity: function () {//選德目前所有贈品活動
        jqGet(gb_approot + 'api/GetAction/GetAllActivity', {})
        .done(function (data, textStatus, jqXHRdata) {
            this.setState({ activity_list: data });
        }.bind(this))
        .fail(function (jqXHR, textStatus, errorThrown) {
            showAjaxError(errorThrown);
        });
    },
    render: function () {
        var searchData = this.state.searchData;
        outHtml = (
            <div>
                <h3 className="h3">{this.props.Caption}</h3>

                <form onSubmit={this.handleSearch}>

                        <div className="table-header">
                            <div className="table-filter">
                                <div className="form-inline form-sm">
                                    <div className="form-group">
                                        <label className="text-sm">送餐日期</label> { }
                                                <InputDate id="start_date" ver={2}
                                                           onChange={this.changeGDValue}
                                                           field_name="start_date"
                                                           value={searchData.start_date} /> { }
                                        <label className="text-sm">~</label> { }
                                                <InputDate id="end_date" ver={2}
                                                           onChange={this.changeGDValue}
                                                           field_name="end_date"
                                                           value={searchData.end_date} />
                                    </div> { }
                                    <button className="btn btn-secondary btn-sm" type="submit"><i className="fa-search"></i> 搜尋</button>
                                </div>
                            </div>
                        </div>
                        <table className="table table-sm table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th style={{"width":"7%;"}} className="text-xs-center">修改</th>
                                    <th style={{"width":"15%;"}}>用餐編號</th>
                                    <th style={{"width":"15%;"}}>媽媽姓名</th>
                                    <th style={{"width":"20%;"}}>身分證號</th>
                                    <th style={{"width":"13%;"}}>電話1</th>
                                    <th style={{"width":"15%;"}}>送餐起日</th>
                                    <th style={{"width":"15%;"}}>送餐迄日</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                this.state.gridData.rows.map(function (itemData, i) {
                                    return(
                                    <GridRowForMealSchedule key={i}
                                                            ikey={i}
                                                            primKey={itemData.record_deatil_id}
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
                                 showAdd={false}
                                 showDelete={false} />
                </form>
            </div>
            );
        return outHtml;
    }
});
var DiningDemandData = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function () {
        return {
            gridData: { rows: [], page: 1 },
            fieldData: {},
            searchData: { name: null ,main_id:this.props.main_id,is_correspond:null,is_breakfast:null,is_lunch:null,is_dinner:null},
            edit_type: 0,
            checkAll: false,
            category: [],
            isShowMealidSelect: false,
            mealid_list: [],
            grid_right_element:[],
            grid_left_element:{rows:[]},
            category_element:[],
            LeftGridPageIndex:1
        };
    },
    getDefaultProps: function () {
        return {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPathName: gb_approot + 'api/GetAction/GetCustomerNeed',
            apiPathProduct:gb_approot+'api/Product',
            initPathName: gb_approot + 'Active/Food/constitute_food_Init'
        };
    },
    componentDidMount: function () {
        this.updateType(this.props.born_id);
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
    },
    getAjaxInitData: function () {
        jqGet(this.props.initPathName)
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ category: data.options_category });
		    //載入下拉是選單內容
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    handleSubmit: function (e) {

        e.preventDefault();
        var fieldData = this.state.fieldData;
        //if(fieldData.customer_id==null || fieldData.born_id==null || fieldData.meal_id==null){
        if (fieldData.customer_id == null || fieldData.born_id == null) {
            tosMessage(gb_title_from_invalid, '請選取客戶生產紀錄在儲存!', 3);
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
                ids.push('ids=' + this.state.gridData.rows[i].customer_need_id);
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
    queryGridData: function (page) {
        this.gridData(page)
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ gridData: data });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    insertType: function () {
        this.setState({
            edit_type: 1, fieldData: {
                born_id: null,
                customer_need_id: null,
                customer_id: null,
                meal_id: null
            }
        });
    },
    updateType: function (id) {
        jqGet(this.props.apiPathName, { born_id: id })
		.done(function (data, textStatus, jqXHRdata) {
		    if(data!=null){
		        this.setState({ edit_type: 2, fieldData: data });
		        this.queryLeftElement();
		        this.queryRightElement();
		    }else{
		        this.insertType();
		    }
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
    onHideChange: function (e) {
        var obj = this.state.searchData;
        obj['i_Hide'] = e.target.value;
        this.setState({ searchData: obj });
    },
    onMealChange: function (name, e) {
        var obj = this.state.fieldData;
        if (e.target.checked) {
            obj[name] = true;

        } else {
            obj[name] = false;
        }
        this.setState({ fieldData: obj });
    },
    queryAllMealID: function () {//選取用餐編號-取得未結案客戶生產的用餐編號List
        //mealid 列表 要過濾目前已選取的資料
        var parms = {
            old_id: this.state.fieldData.born_id,
            main_id: this.state.fieldData.customer_need_id
        };

        jqGet(gb_approot + 'api/GetAction/GetNotCloseMealID', parms)
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
    selectMealid: function (customer_id, born_id, meal_id) {
        jqGet(gb_approot + 'api/GetAction/GetBornData', { born_id: born_id })
		.done(function (data, textStatus, jqXHRdata) {
		    var fieldData = this.state.fieldData;//選取後變更customer_id,born_id,mealid
		    fieldData.customer_id = customer_id;
		    fieldData.born_id = born_id;
		    fieldData.meal_id = meal_id;

		    //用餐編號改變下方帶入的資料要一起變更
		    fieldData.name = data.mom_name;
		    fieldData.tel_1 = data.tel_1;
		    fieldData.tel_2 = data.tel_2;
		    fieldData.tw_zip_1 = data.tw_zip_1;
		    fieldData.tw_city_1 = data.tw_city_1;
		    fieldData.tw_country_1 = data.tw_country_1;
		    fieldData.tw_address_1 = data.tw_address_1;

		    this.setState({ isShowMealidSelect: false, fieldData: fieldData });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    //showAjaxError(errorThrown);
		});
    },
    queryLeftElement:function(){
        var parms = {
            page:this.state.LeftGridPageIndex
        };

        $.extend(parms, this.state.searchData);
        jqGet(gb_approot + 'api/GetAction/GetLeftDietaryNeed',parms)
        .done(function(data, textStatus, jqXHRdata) {
            this.setState({grid_left_element:data});
        }.bind(this))
        .fail(function( jqXHR, textStatus, errorThrown ) {
            showAjaxError(errorThrown);
        });
    },
    queryRightElement:function(){
        jqGet(gb_approot + 'api/GetAction/GetRightDietaryNeed',{main_id:this.props.main_id})
        .done(function(data, textStatus, jqXHRdata) {
            this.setState({grid_right_element:data});
        }.bind(this))
        .fail(function( jqXHR, textStatus, errorThrown ) {
            showAjaxError(errorThrown);
        });
    },
    queryChangeElementParam:function(name,e){
        var obj = this.state.searchData;
        obj[name] = e.target.value;
        this.setState({searchData:obj});
        this.queryLeftElement();
    },
    queryMealParam:function(name,e){
        var obj = this.state.searchData;
        if(e.target.checked){
            obj[name]=true;

        }else{
            obj[name]=false;
        }
        this.setState({searchData:obj});
        this.queryLeftElement();
    },
    addElement:function(dietary_need_id){
        jqPost(gb_approot + 'api/GetAction/PostCustomerOfDietaryNeed',{customer_need_id:this.props.main_id,dietary_need_id:dietary_need_id})
        .done(function(data, textStatus, jqXHRdata) {
            if(data.result){
                this.queryLeftElement();
                this.queryRightElement();
            }else{
                alert(data.message);
            }
        }.bind(this))
        .fail(function( jqXHR, textStatus, errorThrown ) {
            showAjaxError(errorThrown);
        });
    },
    removeElement:function(dietary_need_id){
        jqDelete(gb_approot + 'api/GetAction/DeleteCustomerOfDietaryNeed',{customer_need_id:this.props.main_id,dietary_need_id:dietary_need_id})
        .done(function(data, textStatus, jqXHRdata) {
            if(data.result){
                this.queryLeftElement();
                this.queryRightElement();
            }else{
                alert(data.message);
            }

        }.bind(this))
        .fail(function( jqXHR, textStatus, errorThrown ) {
            showAjaxError(errorThrown);
        });
    },
    Filter:function(value,CName){
        var val="";
        this.state[CName].forEach(function(object, i){
            if(value==object.val){
                val=object.Lname;
            }
        })
        return val;
    },
    LeftGridPrev:function(){
        if(this.state.LeftGridPageIndex>1){
            this.state.LeftGridPageIndex --;
            this.queryLeftElement();
        }
    },
    LeftGridNext:function() {
        if(this.state.LeftGridPageIndex < this.state.grid_left_element.total){
            this.state.LeftGridPageIndex ++;
            this.queryLeftElement();
        }
    },
    showMealType:function(breakfast,lunch,dinner){
        var val="";
        if(!breakfast & !lunch & !dinner){
            val="無";
        }else{
            if(breakfast){
                val+="早";
            }
            if(lunch){
                val+="午";
            }
            if(dinner){
                val+="晚";
            }
        }

        return val;
    },
    render: function () {
        var searchData = this.state.searchData;
        var fieldData = this.state.fieldData;
        var map_out_html = null;
        if(this.state.edit_type==2){
            map_out_html = (
            <div>
        <hr className="lg" />
        <h3 className="h3">飲食需求設定</h3>
        <div className="row">
            <div className="col-xs-6">
                <div className="table-header">
                    <div className="form-inline form-sm">
                        <div className="form-group">
                            <select name="" id="" className="form-control"
                                    onChange={this.queryChangeElementParam.bind(this,'is_correspond')}
                                    value={searchData.is_correspond}>
                                { }
        <option value="">全部</option>
        <option value="true">有對應</option>
        <option value="false">無對應</option>

                            </select> { }
    <input type="text" className="form-control" placeholder="需求元素名稱"
           value={searchData.name} onChange={this.queryChangeElementParam.bind(this,'name')} />
                        </div> { }
 <div className="form-group">
     <label className="c-input c-checkbox">
         <input type="checkbox"
                id="is_breakfast"
                checked={searchData.is_breakfast}
                onChange={this.queryMealParam.bind(this,'is_breakfast')} />
     <span className="c-indicator"></span>
     <span className="text-sm">早餐</span>
     </label>
 <label className="c-input c-checkbox">
     <input type="checkbox"
            id="is_lunch"
            checked={searchData.is_lunch}
            onChange={this.queryMealParam.bind(this,'is_lunch')} />
     <span className="c-indicator"></span>
     <span className="text-sm">午餐</span>
 </label>
 <label className="c-input c-checkbox">
     <input type="checkbox"
            id="is_dinner"
            checked={searchData.is_dinner}
            onChange={this.queryMealParam.bind(this,'is_dinner')} />
     <span className="c-indicator"></span>
     <span className="text-sm">晚餐</span>
 </label>
 </div>
                    </div>
                </div>
<table className="table table-sm table-bordered table-striped">
    <thead>
        <tr>
            <th>元素對應</th>
            <th>餐別</th>
            <th>需求元素</th>
            <th className="text-xs-center">加入</th>
        </tr>
    </thead>
    <tbody>
        {
            this.state.grid_left_element.rows.map(function(itemData,i) {
                var out_sub_html =
                    <tr key={itemData.dietary_need_id}>
                        <td>{itemData.is_correspond ? "有對應":"無對應"}</td>
                        <td>{this.showMealType(itemData.is_breakfast,itemData.is_lunch,itemData.is_dinner)}</td>
                        <td>{itemData.name}</td>
                        <td className="text-xs-center">
                            <button className="btn btn-link text-success" type="button" onClick={this.addElement.bind(this,itemData.dietary_need_id)}>
                                <i className="fa-plus"></i>
                            </button>
                        </td>
                    </tr>;
                return out_sub_html;
            }.bind(this))
        }
    </tbody>
</table>
<div className="table-footer">
    <ul className="pager pager-sm list-inline">
        <li><a href="#" onClick={this.LeftGridPrev}><i className="fa-double-arrow-left"></i> 上一頁</a></li>
        <li>{this.state.LeftGridPageIndex +' / ' + this.state.grid_left_element.total}</li>
        <li><a href="#" onClick={this.LeftGridNext}>下一頁 <i className="fa-double-arrow-right"></i></a></li>
    </ul>
</div>
            </div>
<div className="col-xs-6">
    <div className="table-header"><span className="text-secondary">已加入飲食需求：</span></div>
						<table className="table table-sm table-bordered table-striped">
							<thead>
								<tr>
									<th>元素對應</th>
									<th>餐別</th>
									<th>需求元素</th>
				                	<th className="text-xs-center">刪除</th>
								</tr>
							</thead>
							<tbody>
							    {
									this.state.grid_right_element.map(function(itemData,i) {
									    var out_sub_html =
											<tr key={itemData.dietary_need_id}>
												<td>{itemData.is_correspond ? "有對應":"無對應"}</td>
												<td>{this.showMealType(itemData.is_breakfast,itemData.is_lunch,itemData.is_dinner)}</td>
						                        <td>{itemData.name}</td>
			                        			<td className="text-xs-center">
													<button className="btn btn-link text-danger" type="button" onClick={this.removeElement.bind(this,itemData.dietary_need_id)}>
														<i className="fa-times"></i>
													</button>
			                        			</td>
											</tr>;
									    return out_sub_html;
									}.bind(this))
							    }
							</tbody>
						</table>
</div>
        </div>
            </div>
					);
        }
        var add_born_button=null;
        var insert_info_html=null;
        if(this.state.edit_type==1){
            add_born_button=(
                                <span className="input-group-btn">
									<button className="btn btn-success" type="button" onClick={this.showSelectMealid}>
										<i className="fa-plus"></i>
									</button>
                                </span>);
            insert_info_html=(
						<div className="alert alert-warning">
							此生產紀錄無用餐需求資料,如需新增請按 <strong>存檔確認</strong>，來新增此生產紀錄之用餐需求。
						</div>		
                );
        }

            outHtml = (
            <div>
                <h3 className="h3">{this.props.Caption}<small className="sub"><i className="fa-angle-double-right"></i> 編輯</small></h3>
                {insert_info_html}
				<form className="form form-sm" onSubmit={this.handleSubmit}>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 用餐編號</label>
						<div className="col-xs-3">
							<div className="input-group input-group-sm">
								<input type="text"
                                       className="form-control"
                                       value={fieldData.meal_id}
                                       onChange={this.changeFDValue.bind(this,'meal_id')}
                                       required
                                       disabled={true} />
                                {add_born_button}
							</div>
							<small className="text-muted">請按 <i className="fa-plus"></i> 選取</small>
						</div>

					</div>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">媽媽姓名</label>
						<div className="col-xs-3">
							<input type="text"
                                   className="form-control"
                                   value={fieldData.name}
                                   onChange={this.changeFDValue.bind(this,'name')}
                                   maxLength="64"
                                   required
                                   disabled />
						</div>
					</div>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">連絡電話1</label>
						<div className="col-xs-3">
							<input type="text"
                                   className="form-control"
                                   value={fieldData.tel_1}
                                   onChange={this.changeFDValue.bind(this,'tel_1')}
                                   maxLength="15"
                                   required
                                   disabled />
						</div>
					</div>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">連絡電話2</label>
						<div className="col-xs-3">
							<input type="text"
                                   className="form-control"
                                   value={fieldData.tel_2}
                                   onChange={this.changeFDValue.bind(this,'tel_2')}
                                   maxLength="15"
                                   required
                                   disabled />
						</div>
					</div>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">送餐地址</label>
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
                                   address_field="tw_address_1"
                                   disabled={true} />
					</div>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">備註</label>
						<div className="col-xs-8">
							<textarea col="30" row="2" className="form-control"
                                      value={fieldData.memo}
                                      onChange={this.changeFDValue.bind(this,'memo')}
                                      maxLength="256"></textarea>
						</div>
					</div>
					<div className="form-action">
						<button type="submit" className="btn btn-sm btn-primary col-xs-offset-1" name="btn-1"><i className="fa-check"></i> 存檔確認</button> { }
						<button type="button" className="btn btn-sm btn-blue-grey" onClick={this.props.closeAllEdit}><i className="fa-times"></i> 回前頁</button>
					</div>
				</form>
                {map_out_html}
            </div>
            );

        return outHtml;
    }
});
var TelScheduleData = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function () {
        return {
            gridData: { rows: [], page: 1 },
            fieldData: {},
            searchData: { title: null },
            searchBornData: { word: null, is_close: null },
            edit_type: 0,
            checkAll: false,
            isShowCustomerBornSelect: false,
            born_list: []
        };
    },
    getDefaultProps: function () {
        return {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPathName: gb_approot + 'api/GetAction/GetContactSchedule'
        };
    },
    componentDidMount: function () {
        //this.queryGridData(this.props.born_id);
        this.updateType(this.props.born_id)
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
    },
    handleSubmit: function (e) {

        e.preventDefault();

        if (this.state.fieldData.customer_id == null || this.state.fieldData.customer_id == undefined) {
            tosMessage(gb_title_from_invalid, '未選擇客戶無法新增電訪排程資料!!', 3);
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
                ids.push('ids=' + this.state.gridData.rows[i].schedule_id);
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
    queryGridData: function (page) {
        this.gridData(page)
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ gridData: data });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    insertType: function () {
        this.setState({ edit_type: 1, fieldData: {} });
    },
    updateType: function (id) {
        jqGet(this.props.apiPathName, { id: id })
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ edit_type: 2, fieldData: data.data });
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
    onSelectChange: function (name, e) {
        var obj = this.state.searchData;
        obj[name] = e.target.value;
        this.setState({ searchData: obj });
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
        jqGet(gb_approot + 'api/GetAction/GetCustomerAndBorn', { born_id: this.props.born_id, customer_id: customer_id })
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
    changeGDBornValue: function (name, e) {
        var obj = this.state.searchBornData;
        obj[name] = e.target.value;
        this.setState({ searchBornData: obj });
        this.queryAllCustomerBorn();
    },
    render: function () {
        var fieldData = this.state.fieldData;
        var detail_out_html = null;
        var save_out_html = null;
        save_out_html = <strong className="text-danger col-xs-offset-1">主檔資料不可修改！</strong>;
        detail_out_html =
        <SubForm ref="SubForm"
                 main_id={fieldData.schedule_id}
                 customer_id={fieldData.customer_id}
                 born_id={fieldData.born_id}
                 meal_id={fieldData.meal_id} />;
        outHtml = (
            <div>
                <h3 className="h3">{this.props.Caption}<small className="sub"><i className="fa-angle-double-right"></i> 主檔</small></h3>

				<form className="form form-sm" onSubmit={this.handleSubmit}>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 選擇客戶</label>
							<div className="col-xs-3">
								<div className="input-group input-group-sm">
									<input type="text"
                                           className="form-control"
                                           value={fieldData.customer_name}
                                           onChange={this.changeFDValue.bind(this,'customer_name')}
                                           maxLength="64"
                                           disabled />
									<span className="input-group-btn">
										<a className="btn btn-success"
                                           onClick={this.showSelectCustomerBorn}
                                           disabled={this.state.edit_type==2}><i className="fa-plus"></i></a>
									</span>
								</div>
							</div>
							<small className="text-muted col-xs-6">請按 <i className="fa-plus"></i> 選取</small>
						</div>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">客戶類別</label>
							<div className="col-xs-3">
								<select className="form-control"
                                        value={fieldData.customer_type}
                                        disabled
                                        onChange={this.changeFDValue.bind(this,'customer_type')}>
								    {
								    CommData.CustomerType.map(function (itemData, i) {
								        return(
								        <option key={itemData.id} value={itemData.id}>{itemData.label}</option>);
								    })
								    }
								</select>
							</div>
							<label className="col-xs-1 form-control-label text-xs-right">客戶名稱</label>
							<div className="col-xs-4">
								<input type="text"
                                       className="form-control"
                                       value={fieldData.customer_name}
                                       onChange={this.changeFDValue.bind(this,'customer_name')}
                                       maxLength="64"
                                       required
                                       disabled />
							</div>
						</div>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">用餐編號</label>
							<div className="col-xs-3">
								<input type="text"
                                       className="form-control"
                                       value={fieldData.meal_id}
                                       onChange={this.changeFDValue.bind(this,'meal_id')}
                                       required
                                       disabled />
							</div>
							<label className="col-xs-1 form-control-label text-xs-right">媽媽姓名</label>
							<div className="col-xs-4">
								<input type="text"
                                       className="form-control"
                                       value={fieldData.mom_name}
                                       onChange={this.changeFDValue.bind(this,'mom_name')}
                                       maxLength="64"
                                       required
                                       disabled />
							</div>
						</div>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">生產方式</label>
							<div className="col-xs-3">
								<select className="form-control"
                                        value={fieldData.born_type}
                                        onChange={this.changeFDValue.bind(this,'born_type')}
                                        disabled>
								    {
								    CommData.BornType.map(function (itemData, i) {
								        return(
								        <option key={itemData.id} value={itemData.id}>{itemData.label}</option>);
								    })
								    }
								</select>
							</div>
							<label className="col-xs-1 form-control-label text-xs-right">生產日期</label>
							<div className="col-xs-4">
								<InputDate id="born_day"
                                           onChange={this.changeFDValue}
                                           field_name="born_day"
                                           value={fieldData.born_day}
                                           required={true}
                                           disabled={true} />
							</div>
						</div>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">連絡電話1</label>
						<div className="col-xs-3">
							<input type="tel"
                                   className="form-control"
                                   value={fieldData.tel_1}
                                   onChange={this.changeFDValue.bind(this,'tel_1')}
                                   maxLength="16"
                                   disabled />
						</div>
						<label className="col-xs-1 form-control-label text-xs-right">連絡電話2</label>
						<div className="col-xs-4">
							<input type="tel"
                                   className="form-control"
                                   value={fieldData.tel_2}
                                   onChange={this.changeFDValue.bind(this,'tel_2')}
                                   maxLength="16"
                                   disabled />
						</div>
					</div>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">身分證字號</label>
						<div className="col-xs-3">
							<input type="text"
                                   className="form-control"
                                   value={fieldData.sno}
                                   onChange={this.changeFDValue.bind(this,'sno')}
                                   maxLength="10"
                                   disabled />
						</div>
						<label className="col-xs-1 form-control-label text-xs-right">生日</label>
						<div className="col-xs-4">
							<InputDate id="birthday"
                                       onChange={this.changeFDValue}
                                       field_name="birthday"
                                       value={fieldData.birthday}
                                       disabled={true} />
						</div>
					</div>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">送餐地址</label>
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
                                       address_field="tw_address_1"
                                       disabled={true} />
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
                                       address_field="tw_address_2"
                                       disabled={true} />
					</div>
					<div className="form-action">
					    {save_out_html} { }
			            <button type="button" className="btn btn-sm btn-blue-grey" onClick={this.props.closeAllEdit}><i className="fa-arrow-left"></i> 回前頁</button>
					</div>

				</form>

				<hr className="lg" />
                {detail_out_html}
            </div>
            );
        return outHtml;
    }
});
var GridRowForTelRecord = React.createClass({
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
					<td className="text-xs-center"><GridButtonModify modify={this.modify} /></td>
					<td>{moment(this.props.itemData.tel_day).format('YYYY/MM/DD')}</td>
					<td>{this.props.itemData.meal_id}</td>
					<td>{this.props.itemData.mom_name}</td>
					<td>{this.props.itemData.tel_1}</td>
					<td>{this.props.itemData.tel_2}</td>
					<td><StateForGrid stateData={CommData.TelReasonByDetail} id={this.props.itemData.tel_reason} /></td>
				</tr>
			);
    }
});
var TelRecordData = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function () {
        return {
            gridData: { rows: [], page: 1 },
            fieldData: {},
            searchData: { title: null, start_date: moment(Date()).format('YYYY/MM/DD'), end_date: moment(Date()).format('YYYY/MM/DD') },
            searchBornData: { word: null, is_close: null },
            edit_type: 0,
            checkAll: false,
            isShowCustomerBornSelect: false,
            born_list: []
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
        this.queryGridData(1);
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
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
    queryGridData: function (page) {
        this.gridData(page)
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ gridData: data });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    insertType: function () {
        this.setState({ edit_type: 1, fieldData: { tel_reason: 1, is_detailInsert: true } });
    },
    updateType: function (id) {
        jqGet(this.props.apiPathName, { id: id })
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ edit_type: 2, fieldData: data.data });
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
    onSelectChange: function (name, e) {
        var obj = this.state.searchData;
        obj[name] = e.target.value;
        this.setState({ searchData: obj });
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
    changeGDBornValue: function (name, e) {
        var obj = this.state.searchBornData;
        obj[name] = e.target.value;
        this.setState({ searchBornData: obj });
        this.queryAllCustomerBorn();
    },
    render: function () {
        var searchData = this.state.searchData;
        outHtml = (
            <div>
                 <h3 className="h3">{this.props.Caption}</h3>

				<form onSubmit={this.handleSearch}>

						<div className="table-header">
							<div className="table-filter">
								<div className="form-inline form-sm">
									<div className="form-group">
							            <label className="text-sm">電訪原因</label> { }
							            <select className="form-control"
                                                value={searchData.tel_reason}
                                                onChange={this.changeGDValue.bind(this,'tel_reason')}>
							                <option value="">全部</option>
							                {
							                CommData.TelReasonByDetail.map(function (itemData, i) {
							                    return(
							                    <option key={itemData.id} value={itemData.id}>{itemData.label}</option>);
							                })
							                }
							            </select> { }
					                    <label className="text-sm">預計電訪日期</label> { }
											<InputDate id="start_date" ver={2}
                                                       onChange={this.changeGDValue}
                                                       field_name="start_date"
                                                       value={searchData.start_date} /> { }
										<label className="text-sm">~</label> { }
											<InputDate id="end_date" ver={2}
                                                       onChange={this.changeGDValue}
                                                       field_name="end_date"
                                                       value={searchData.end_date} /> { }
										<button className="btn btn-secondary btn-sm" type="submit"><i className="fa-search"></i> 搜尋</button>
									</div>
								</div>
							</div>
						</div>
						<table className="table table-sm table-bordered table-striped">
							<thead>
								<tr>
									<th style={{"width":"7%;"}} className="text-xs-center">
										<label className="c-input c-checkbox">
											<input type="checkbox" checked={this.state.checkAll} onChange={this.checkAll} />
											<span className="c-indicator"></span>
										</label>
									</th>
									<th style={{"width":"7%;"}} className="text-xs-center">修改</th>
									<th style={{"width":"13%;"}}>電訪日期</th>
					                <th style={{"width":"14%;"}}>用餐編號</th>
					                <th style={{"width":"20%;"}}>媽媽姓名</th>
					                <th style={{"width":"15%;"}}>電話1</th>
					                <th style={{"width":"15%;"}}>電話2</th>
					                <th style={{"width":"10%;"}}>電訪原因</th>
								</tr>
							</thead>
							<tbody>
							    {
							    this.state.gridData.rows.map(function (itemData, i) {
							        return(
							        <GridRowForTelRecord key={i}
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
var GridRowForGift = React.createClass({
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
					<td className="text-xs-center"><GridButtonModify modify={this.modify} /></td>
					<td>{this.props.itemData.record_sn}</td>
					<td>{this.props.itemData.activity_name}</td>
					<td>{this.props.itemData.mom_name}</td>
					<td>{this.props.itemData.sno}</td>
					<td>{this.props.itemData.tel_1}</td>
					<td><StateForGrid stateData={CommData.ReceiveState} id={this.props.itemData.receive_state} /></td>
				</tr>
			);
    }
});
var GiftRecordData = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function () {
        return {
            gridData: { rows: [], page: 1 },
            fieldData: {},
            searchData: { title: null },
            searchRecordData: { is_close: false },
            edit_type: 0,
            checkAll: false,
            activity_list: [],
            isShowRecordSelect: false,
            record_list: []
        };
    },
    getDefaultProps: function () {
        return {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPathName: gb_approot + 'api/GiftRecord'
        };
    },
    componentDidMount: function () {
        this.queryGridData(1);
        this.queryAllActivity();
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
    },
    handleSubmit: function (e) {

        e.preventDefault();
        if (this.state.fieldData.start_date > this.state.fieldData.end_date) {
            tosMessage(gb_title_from_invalid, '活動起日不可大於活動迄日!!', 3);
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
                ids.push('ids=' + this.state.gridData.rows[i].gift_record_id);
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
    queryGridData: function (page) {
        this.gridData(page)
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ gridData: data });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    insertType: function () {
        var defaultA = this.state.activity_list;
        this.setState({ edit_type: 1, fieldData: { receive_state: 1, activity_id: defaultA[0].val, product_record_id: null } });
    },
    updateType: function (id) {
        jqGet(this.props.apiPathName, { id: id })
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ edit_type: 2, fieldData: data.data });
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
    queryAllActivity: function () {//選德目前所有贈品活動
        jqGet(gb_approot + 'api/GetAction/GetAllActivity', {})
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ activity_list: data });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    queryAllRecord: function () {//選取產品銷售紀錄主檔list
        var searchRecordData = this.state.searchRecordData;
        searchRecordData.old_id = this.state.fieldData.product_record_id;

        jqGet(gb_approot + 'api/GetAction/GetAllRecord', searchRecordData)
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ record_list: data });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    showSelectRecord: function () {
        this.queryAllRecord();
        this.setState({ isShowRecordSelect: true });
    },
    closeSelectRecord: function () {
        this.setState({ isShowRecordSelect: false });
    },
    selectRecord: function (product_record_id, customer_id, born_id) {
        var fieldData = this.state.fieldData;//選取後變更customer_id,born_id,mealid

        this.state.record_list.forEach(function (obj, i) {
            if (product_record_id == obj.product_record_id) {
                fieldData.product_record_id = product_record_id;
                fieldData.record_sn = obj.record_sn;
                fieldData.customer_id = customer_id;
                fieldData.born_id = born_id;

                fieldData.customer_name = obj.customer_name;
                fieldData.name = obj.mom_name;
                fieldData.record_day = obj.record_day;
                fieldData.tel_1 = obj.tel_1;
                fieldData.tel_2 = obj.tel_2;
                fieldData.sno = obj.sno;
                fieldData.birthday = obj.birthday;
                fieldData.tw_zip_1 = obj.tw_zip_1;
                fieldData.tw_city_1 = obj.tw_city_1;
                fieldData.tw_country_1 = obj.tw_country_1;
                fieldData.tw_address_1 = obj.tw_address_1;
                fieldData.tw_zip_2 = obj.tw_zip_2;
                fieldData.tw_city_2 = obj.tw_city_2;
                fieldData.tw_country_2 = obj.tw_country_2;
                fieldData.tw_address_2 = obj.tw_address_2;
            }
        });

        this.setState({ isShowRecordSelect: false, fieldData: fieldData });

    },
    changeGDRecordValue: function (name, e) {
        var obj = this.state.searchRecordData;
        obj[name] = e.target.value;
        this.setState({ searchRecordData: obj });
        this.queryAllRecord();
    },
    render: function () {
        var searchData = this.state.searchData;
        outHtml = (
            <div>
                 <h3 className="h3">{this.props.Caption}</h3>

				<form onSubmit={this.handleSearch}>

						<div className="table-header">
							<div className="table-filter">
								<div className="form-inline form-sm">
									<div className="form-group">
						                <label className="text-sm">是否領取</label> { }
						                <select className="form-control"
                                                value={searchData.receive_state}
                                                onChange={this.changeGDValue.bind(this,'receive_state')}>
						                        <option value="">全部</option>
						                    {
						                    CommData.ReceiveState.map(function (itemData, i) {
						                        return(
						                        <option key={itemData.id} value={itemData.id}>{itemData.label}</option>);
						                    })
						                    }
						                </select> { }
										<button className="btn btn-sm btn-secondary" type="submit"><i className="fa-search"></i>{ }搜尋</button>
									</div>
								</div>
							</div>
						</div>
						<table className="table table-sm table-bordered table-striped">
							<thead>
								<tr>
									<th style={{"width":"7%;"}} className="text-xs-center">
										<label className="c-input c-checkbox">
											<input type="checkbox" checked={this.state.checkAll} onChange={this.checkAll} />
											<span className="c-indicator"></span>
										</label>
									</th>
									<th style={{"width":"7%;"}} className="text-xs-center">修改</th>
					                <th style={{"width":"16%;"}}>銷售單號</th>
					                <th style={{"width":"20%;"}}>活動名稱</th>
					                <th style={{"width":"15%;"}}>媽媽姓名</th>
					                <th style={{"width":"15%;"}}>身分證號</th>
					                <th style={{"width":"13%;"}}>電話1</th>
					                <th style={{"width":"7%;"}}>是否領取</th>
								</tr>
							</thead>
							<tbody>
							    {
							    this.state.gridData.rows.map(function (itemData, i) {
							        return(
							        <GridRowForGift key={i}
                                                    ikey={i}
                                                    primKey={itemData.gift_record_id}
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
});var GridRowForAccount = React.createClass({
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
					<td className="text-xs-center"><GridButtonModify modify={this.modify} /></td>
					<td>{this.props.itemData.record_sn}</td>
					<td>{this.props.itemData.customer_name}</td>
					<td>{this.props.itemData.sno}</td>
					<td>{this.props.itemData.tel_1}</td>
				</tr>
			);
    }
});
var AccountRecordData = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function () {
        return {
            gridData: { rows: [], page: 1 },
            fieldData: {},
            searchData: { title: null },
            edit_type: 0,
            checkAll: false
        };
    },
    getDefaultProps: function () {
        return {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPathName: gb_approot + 'api/AccountsPayable'
        };
    },
    componentDidMount: function () {
        //if (gb_main_id == 0) {
        //    this.queryGridData(1);
        //} else {//有帶id的話,直接進入修改頁面
        //    this.updateType(gb_main_id);
        //}
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
    },
    handleSubmit: function (e) {

        e.preventDefault();


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
                ids.push('ids=' + this.state.gridData.rows[i].accounts_payable_id);
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
    queryGridData: function (page) {
        this.gridData(page)
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ gridData: data });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    insertType: function () {
        this.setState({ edit_type: 1, fieldData: {} });
    },
    updateType: function (id) {
        jqGet(this.props.apiPathName, { id: id })
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ edit_type: 2, fieldData: data.data });
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
    onSelectChange: function (name, e) {
        var obj = this.state.searchData;
        obj[name] = e.target.value;
        this.setState({ searchData: obj });
    },
    render: function () {
        var searchData = this.state.searchData;
        outHtml = (
            <div>
                <h3 className="h3">{this.props.Caption}</h3>

				<form onSubmit={this.handleSearch}>

						<div className="table-header">
							<div className="table-filter">
								<div className="form-inline form-sm">
									<div className="form-group">
										<label className="text-sm">來源銷售單號</label> { }
										<input type="text" className="form-control input-sm"
                                               value={searchData.word}
                                               onChange={this.changeGDValue.bind(this,'word')}
                                               placeholder="請擇一填寫..." /> { }

										<button className="btn btn-secondary btn-sm" type="submit"><i className="fa-search"></i>{ }搜尋</button>
									</div>
								</div>
							</div>
						</div>
						<table className="table table-sm table-bordered table-striped">
							<thead>
								<tr>
									<th style={{"width":"10%;"}} className="text-xs-center">修改</th>
					                <th style={{"width":"20%;"}}>銷售單號</th>
					                <th style={{"width":"25%;"}}>客戶名稱</th>
					                <th style={{"width":"25%;"}}>身分證號</th>
					                <th style={{"width":"20%;"}}>電話1</th>
								</tr>
							</thead>
							<tbody>
							    {
							    this.state.gridData.rows.map(function (itemData, i) {
							        return(
							        <GridRowForAccount key={i}
                                                       ikey={i}
                                                       primKey={itemData.accounts_payable_id}
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
                                 showAdd={false}
                                 showDelete={false} />
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
            fddName: 'fieldDetailData',
            gdName: 'searchData',
            apiSubPathName: gb_approot + 'api/CustomerBorn'
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
        //檢查mealID
        var fDData = this.state.fieldDetailData;
        jqPost(gb_approot + 'api/GetAction/CheckMealID', { born_id: fDData.born_id, meal_id: fDData.meal_id })
		.done(function (data, textStatus, jqXHRdata) {
		}.bind(this));

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
					<MdoalMealidSelect bsSize="small" title="選擇用餐編號" onRequestHide={this.closeSelectMealid}>
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
					<MdoaleditCustomerBorn bsSize="large" title="客戶生產紀錄編輯" onRequestHide={this.closeEditDetail}>
					    {/*<div className="modal-header light">
							<div className="pull-right">
								<button onClick={this.closeEditDetail} type="button"><i className="fa-times"></i></button>
							</div>
							<h4 className="modal-title">編輯 { } 生產紀錄</h4>
						</div>*/}
						<form className="form form-sm" onSubmit={this.detailHandleSubmit} id="form2">
							<div className="modal-body">
							    {mealid_select_out_html}
							    {error_out_html}
							    {/*<div className="form-group">
									<label className="col-xs-2 form-control-label text-xs-right">用餐編號</label>
									<div className="col-xs-3">
									    <div className="input-group">
				            				<input type="text"
											className="form-control"
											value={fieldDetailData.meal_id}
											onChange={this.changeFDDValue.bind(this,'meal_id')}
											required
											disabled={this.state.detail_edit_type==3 || true} />
			            					<span className="input-group-btn">
			            						<a className="btn"
												onClick={this.showSelectMealid}
												disabled={this.state.detail_edit_type==3 || (fieldDetailData.have_record && fieldDetailData.meal_id!=null)}>
												<i className="fa-plus"></i>
												</a>
			            					</span>
			            				</div>
									</div>
									<small className="help-inline col-xs-7">請按 <i className="fa-plus"></i> 選取</small>
								</div>*/}
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
