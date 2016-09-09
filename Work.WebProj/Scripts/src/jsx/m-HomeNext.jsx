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
        this.getmomName();
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
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
    },
    selectCustomerBorn: function (customer_id, born_id, meal_id,customer_need_id,schedule_id) {
        jqGet(gb_approot + 'api/GetAction/GetCustomerAndBorn', { born_id: born_id, customer_id: customer_id ,customer_need_id:customer_need_id,schedule_id:schedule_id})
		.done(function (data, textStatus, jqXHRdata) {
		    var fieldData = this.state.fieldData;//選取後變更customer_id,born_id,mealid
		    fieldData.customer_id = gb_customer_id;
		    fieldData.born_id = gb_born_id;
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
        var name_html=null;
         this.state.name.map(function(itemName,i){
                                  if(itemName.born_id==gb_born_id){
                                      name_html=<h3 className="h3">{itemName.meal_id}. <span>{itemName.mom_name}</span></h3>;
                                  }
                              })   
        outHtml = ( 
                    <div>
                            {name_html}
                    
                                    <ul className="nav nav-tabs active" role="tablist">
                                        <li className="nav-item">
                                            <a className="nav-link a-tab active" data-toggle="tab" href="#Profile" role="tab">基本資料</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link a-tab " data-toggle="tab" href="#Birth" role="tab">生產紀錄</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link a-tab " data-toggle="tab" href="#Sell" role="tab">銷售紀錄</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link a-tab " data-toggle="tab" href="#MealSchedule" role="tab">用餐排程</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link a-tab " data-toggle="tab" href="#Query" role="tab">用餐需求</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link a-tab " data-toggle="tab" href="#CallSchedule" role="tab">電訪排程</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link a-tab " data-toggle="tab" href="#CallRecord" role="tab">電訪紀錄</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link a-tab " data-toggle="tab" href="#Gift" role="tab">禮品紀錄</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link a-tab " data-toggle="tab" href="#Pay" role="tab">帳款紀錄</a>
                                        </li>
                                    </ul>
                                <div className="tab-content active">
                                    <div className="tab-pane active" id="Profile" role="tabpanel">
                                        <BasicData closeAllEdit={this.closeSelectCustomerBorn} born_id={gb_born_id} mom_id={gb_customer_id} />
                                    </div>
                                    <div className="tab-pane" id="Birth" role="tabpanel">
                                        <CustomerBornData closeAllEdit={this.closeSelectCustomerBorn} born_id={gb_born_id} mom_id={gb_customer_id} />
                                    </div>
                                    <div className="tab-pane" id="Sell" role="tabpanel">
                                        <SalesDetailData born_id={gb_born_id} mom_id={gb_customer_id} />
                                    </div>
                                    <div className="tab-pane" id="MealSchedule" role="tabpanel">
                                        <MealScheduleData born_id={gb_born_id} mom_id={gb_customer_id}/>
                                    </div>
                                    <div className="tab-pane" id="Query" role="tabpanel">
                                        <DiningDemandData closeAllEdit={this.closeSelectCustomerBorn} born_id={gb_born_id} mom_id={gb_customer_id}/>
                                    </div>
                                    <div className="tab-pane" id="CallSchedule" role="tabpanel">
                                        <TelScheduleData closeAllEdit={this.closeSelectCustomerBorn} born_id={gb_born_id} mom_id={gb_customer_id}/>
                                    </div>
                                    <div className="tab-pane" id="CallRecord" role="tabpanel">
                                        <TelRecordData born_id={gb_born_id} mom_id={gb_customer_id}/>
                                    </div>
                                    <div className="tab-pane" id="Gift" role="tabpanel">
                                        <GiftRecordData born_id={gb_born_id} mom_id={gb_customer_id} />
                                    </div>
                                    <div className="tab-pane" id="Pay" role="tabpanel">
                                        <AccountRecordData born_id={gb_born_id} mom_id={gb_customer_id} />
                                    </div>
                                </div>
                            </div>
                    );
        return outHtml;
    }
});
//總攬視窗_基本資料
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
        this.gridDetailData(this.props.mom_id)
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

        var detail_out_html = null;
        if (this.state.edit_type == 2) {
            detail_out_html =
            <SubForm ref="SubForm"
                     main_id={fieldData.schedule_detail_id}
                     tel_reason={fieldData.tel_reason} />;
        }
        outHtml = (
			<div>
                <h3 className="h3">基本資料</h3>
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
                 {/*{customer_born_out_html}
                    <hr className="lg" />
                    <h4 className="h4">
                        客戶生產紀錄 明細檔 { }
                        <button type="button" onClick={this.addDetail} className="btn btn-success btn-sm m-l-1"><i className="fa-plus-circle"></i> 新增生產紀錄</button>
                    </h4>
                    <table className="table table-sm table-bordered table-striped">
                        <thead>
                            <tr>
                                <th className="text-xs-center">編輯</th>
                                <th>生產日期</th>
                                <th>用餐編號</th>
                                <th>媽媽姓名</th>
                                <th>寶寶性別</th>
                                <th>生產方式</th>
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
                                            <td><StateForGrid stateData={CommData.BornType} id={itemData.born_type} /></td>
                                            <td>{itemData.memo}</td>
                                        </tr>;
                                return out_sub_html;
                            }.bind(this))
                        }
                        </tbody>
                    </table>*/}
                 </div>
			</div>
 );
        return outHtml;
    }

});
//總覽紀錄_生產紀錄
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
				{/*<form className="form form-sm" onSubmit={this.handleSubmit} id="form1">
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
					</div>
				</form>*/}
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
					{/*<td><StateForGrid stateData={CommData.CustomerType} id={this.props.itemData.customer_type} /></td>
					<td>{this.props.itemData.meal_id}</td>
					<td>{this.props.itemData.name}</td>
					<td>{this.props.itemData.tel_1}</td>*/}
					<td>{this.props.itemData.is_receipt?<span className="text-muted">已轉單</span>:<span className="text-indigo">未轉單</span>}</td>
					<td>{this.props.itemData.is_close?<span className="text-muted">結案</span>:<span className="text-danger">未結案</span>}</td>
				</tr>
			);
    }
});
//總攬紀錄_銷售紀錄
var SalesDetailData = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function () {
        return {
            gridData: { rows: [], page: 1 },
            fieldData: { born_memo: null },
            searchData: { title: null,born_id:this.props.born_id },
            searchBornData: { word: null, customer_type: null, is_meal: false },
            edit_type: 0,
            checkAll: false,
            isShowCustomerBornSelect: false,
            isShowModifySelect:false,
            born_list: [],
            searchProductData:{name:null,product_type:null,born_id:this.props.born_id},
            isShowProductSelect:false,//控制選取產品視窗顯示
			product_list:[],
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
        this.queryGridData(1);
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
        this.setState({ edit_type: 1, fieldData: {
            customer_id:this.props.mom_id,
            product_record_id:null,
            i_Lang:'zh-TW',
            born_id:this.props.born_id
        },isShowModifySelect:true });
    },
    updateType: function (id) {
        jqGet(this.props.apiPathName, { id: id })
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ edit_type: 2, fieldData: data.data,isShowModifySelect:true});
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
        this.setState({ isShowCustomerBornSelect: true,isShowModifySelect:true });
    },
    closeSelectCustomerBorn: function () {
        this.queryGridData(0);
        this.setState({ isShowCustomerBornSelect: false,isShowModifySelect:false});
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

		    this.setState({ isShowCustomerBornSelect: false, fieldData: fieldData ,isShowModifySelect:false});
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
    changeGDProductValue:function(name,e){
		var obj = this.state.searchProductData;
		obj[name] = e.target.value;
		this.setState({searchProductData:obj});
		this.queryAllProduct();
	},
    queryAllProduct:function(){//選取產品編號-
		jqGet(gb_approot + 'api/GetAction/GetAllProduct',this.state.searchProductData)
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({product_list:data});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});		
	},
    showSelectProduct:function(){
		this.queryAllProduct();
		this.setState({isShowProductSelect:true});
	},
	closeSelectProduct:function(){
		this.setState({isShowProductSelect:false});
	},
    selectProduct:function(product_id,e){
		 var fSD = this.refs["SubFormForSalesProduct"].state.fieldSubData;
		 var tryout_array=this.refs["SubFormForSalesProduct"].state.tryout_array;
		 var parm=this.refs["SubFormForSalesProduct"].state.parm;//用餐點數計算
		 tryout_array.forEach(function(object, i){object.value=false;})//選之前先清空

		this.state.product_list.forEach(function(obj,i){
			if(obj.product_id==product_id){
				fSD.product_id=product_id;
				fSD.product_type=obj.product_type;
				fSD.product_name=obj.product_name;
				fSD.price=obj.price;
				fSD.standard=obj.standard;
				fSD.subtotal=fSD.qty*obj.price;
				if(obj.product_type==1 || obj.product_type==2){
					//parm:{breakfast:0,lunch:0,dinner:0}
					//依產品各餐別計算售價點數
					parm.breakfast=roundX(obj.breakfast_price/obj.price,4);
					parm.lunch=roundX(obj.lunch_price/obj.price,4);
					parm.dinner=roundX(obj.dinner_price/obj.price,4);

					fSD.tryout_mealtype=obj.meal_type;
					//依產品選擇餐別帶出餐別
					if(obj.meal_type!=undefined){
						var array=obj.meal_type.split(",");
						tryout_array.forEach(function(object, i){
							array.forEach(function(a_obj,j){
								if(object.name==a_obj){
									object.value=true;
								}
							})
			    		})
					}
				}
			}
		});
		if(fSD.product_type==2){//如果產品為月子餐就儲存用餐編號
			fSD.meal_id=this.props.meal_id;
		}
		this.refs["SubFormForSalesProduct"].updateSelectProduct(fSD,tryout_array,parm);
		this.setState({isShowProductSelect:false});
	},
    render: function () {
        var searchData = this.state.searchData;
        var modify_html=null;
        var ModalProductSelect=ReactBootstrap.Modal;
		var detail_out_html=null;//明細檔
        var fieldData=this.state.fieldData;
        //產品選取視窗
        var searchProductData=this.state.searchProductData;
	var ModalProductSelect=ReactBootstrap.Modal;//啟用產品選取的視窗內容
		var product_select_out_html=null;
        var accounts_receivable_out_html=null;

		if(this.state.isShowProductSelect){
			product_select_out_html=
			<ModalProductSelect bsSize="medium" animation={false} onRequestHide={this.closeSelectProduct}>
                <div className="modal-header">
                            <button className="close" onClick={this.closeSelectProduct}>&times;</button>
                            <h5 className="modal-title text-secondary">選擇產品</h5>
                        </div>
						<div className="modal-body">
						<div className="alert alert-warning">
							一筆生產紀錄只能對應一筆試吃
						</div>
							<div className="table-header">
			                    <div className="table-filter">
			                        <div className="form-inline form-sm">
			                            <div className="form-group">
			                                <label className="text-sm">產品名稱</label> { }
			                                <input type="text" className="form-control"
			                            	value={searchProductData.name}
											onChange={this.changeGDProductValue.bind(this,'name')} />
			                            </div> { }
			                            <div className="form-group">
			                                <label className="text-sm">產品分類</label> { }
			                                <select className="form-control"
			                                	value={searchProductData.product_type}
												onChange={this.changeGDProductValue.bind(this,'product_type')}>
			                                    <option value="">全部</option>
												{
													CommData.ProductType.map(function(itemData,i) {
														return <option  key={itemData.id} value={itemData.id}>{itemData.label}</option>;
													})
												}
			                                </select>
			                            </div> { }
			                            <button className="btn btn-secondary btn-sm" onClick={this.queryAllProduct}><i className="fa-search"></i> 搜尋</button>
			                        </div>
			                    </div>
			                </div>
			                <table className="table table-sm table-bordered table-striped">
			                <tbody>
				                    <tr>
				                        <th style={{"width":"10%;"}} className="text-xs-center">選擇</th>
				                        <th style={{"width":"30%;"}}>產品名稱</th>
				                        <th style={{"width":"20%;"}}>產品分類</th>
				                        <th style={{"width":"40%;"}}>售價</th>
				                    </tr>
				                    {
										this.state.product_list.map(function(itemData,i) {
											
											var product_out_html = 
												<tr key={itemData.product_id}>
													<td className="text-xs-center">
														<label className="c-input c-checkbox">
				                                			<input type="checkbox" onClick={this.selectProduct.bind(this,itemData.product_id)} />
				                                			<span className="c-indicator"></span>
				                            			</label>
				                            		</td>
													<td>{itemData.product_name}</td>
													<td><StateForGrid stateData={CommData.ProductType} id={itemData.product_type} /></td>
													<td>{itemData.price}</td>
												</tr>;
											return product_out_html;
										}.bind(this))
									}
			                    </tbody>                   
			                </table>
						</div>
						<div className="modal-footer form-action">
			                <button type="button" className="btn btn-sm btn-blue-grey" onClick={this.closeSelectProduct}><i className="fa-times"></i> 關閉</button>
			            </div>
				</ModalProductSelect>;
        }
//產品選取視窗
        if(this.state.edit_type==1){
				save_out_html=<button type="submit" className="btn btn-sm btn-primary col-xs-offset-2"><i className="fa-check"></i> 存檔確認</button>;
			}else{
				save_out_html=<strong className="text-danger col-xs-offset-2">主檔資料不可修改！</strong>;
				detail_out_html=
				<SubFormForSalesProduct ref="SubFormForSalesProduct" 
				main_id={fieldData.product_record_id}
				customer_id={fieldData.customer_id}
				born_id={fieldData.born_id} 
				meal_id={fieldData.meal_id}
				is_close={fieldData.is_close}
                showSelectProduct={this.showSelectProduct} />;
				if(!fieldData.is_close){
					close_out_html=<button className="btn btn-success btn-block" type="button" onClick={this.closeRecord}><i className="fa-check"></i> 設為 已結案</button>;
				}
				if(fieldData.is_close){
					close_out_html=<button className="btn btn-default btn-block disabled"><i className="fa-check"></i> 已結案</button>;
				}
				if(fieldData.is_receipt){//轉應收後出現可檢視應收帳款按鈕
					receipt_out_html=<button className="btn btn-info btn-block" type="button" onClick={this.setAccountsPayable.bind(this)}><i className="fa-search"></i> 檢視 應收帳款</button>;
				}else{
					receipt_out_html=<button className="btn btn-success btn-block" type="button" onClick={this.insertAccountsPayable.bind(this)}><i className="fa-check"></i>轉 應收帳款</button>;
				}
			}
    if(this.state.isShowModifySelect){
            accounts_receivable_out_html=(
                <div className="form-group row">
                <div className="col-xs-6">
						<div className="card">
							<div className="card-header"><i className="fa-file-text-o"></i> 訂單狀態【{fieldData.is_close?<strong>已結案</strong>:<strong className="text-danger">未結案</strong>}】</div>
							<div className="card-block">
								{close_out_html}
								<small className="text-muted">結案後，無法新增、修改及刪除產品明細</small>
							</div>
						</div>
					</div>
					<div className="col-xs-6">
						<div className="card">
							<div className="card-header"><i className="fa-dollar"></i> 帳務狀態【{fieldData.is_receipt?<strong>已轉應收帳款</strong>:<strong className="text-danger">未轉應收帳款</strong>}】</div>
							<div className="card-block">
								{receipt_out_html}
								<small className="text-muted">未轉應收帳款前不可結案</small>
							</div>
						</div>
					</div>
                    </div>);
        }
        if(this.state.isShowModifySelect){
            modify_html=(
                <ModalProductSelect bsSize="large" animation={false} onRequestHide={this.closeSelectCustomerBorn}>
                    <div className="modal-header">
                        <button className="close" onClick={this.closeSelectCustomerBorn}>&times;</button>
                        <h5 className="modal-title text-secondary">產品銷售資料</h5>
                    </div>
                <div className="modal-body">
                    <h3 className="h3"><small className="sub"><i className="fa-angle-double-right"></i> 產品銷售主檔</small></h3>
				    <form className="form form-sm" onSubmit={this.handleSubmit}>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">銷售單號</label>
							<div className="col-xs-2">
								<input type="text" 							
								className="form-control"	
								value={fieldData.record_sn}
								onChange={this.changeFDValue.bind(this,'record_sn')}
								maxLength="64"
								disabled
								placeholder="系統自動產生" />
							</div>
							{/*<small className="text-muted col-xs-6">系統自動產生，無法修改</small>*/}
							<label className="col-xs-1 form-control-label text-xs-right">訂單日期</label>
							<div className="col-xs-3">
								<InputDate id="record_day" 
									onChange={this.changeFDValue} 
									field_name="record_day" 
									value={fieldData.record_day}
									disabled={true}
									placeholder="系統自動產生" />
							</div>
							{/*<small className="text-muted col-xs-6">系統自動產生，無法修改</small>*/}
							<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 選擇客戶</label>
							<div className="col-xs-2">
								<input type="text"                          
                                    className="form-control"    
                                    value={fieldData.customer_name}
                                    onChange={this.changeFDValue.bind(this,'customer_name')}
                                    maxLength="64"
                                    disabled />
							</div>
						</div>
						{/*<div className="form-group row">
							<label className="col-xs-2 form-control-label text-xs-right">客戶類別</label>
							<div className="col-xs-3">
								<select className="form-control" 
								value={fieldData.customer_type}
								disabled
								onChange={this.changeFDValue.bind(this,'customer_type')}>
								{
									CommData.CustomerType.map(function(itemData,i) {
										return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
									})
								}
								</select>
							</div>
							<label className="col-xs-1 form-control-label text-xs-right">客戶名稱</label>
							<div className="col-xs-3">
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
							<label className="col-xs-2 form-control-label text-xs-right">用餐編號</label>
							<div className="col-xs-3">
								<input type="text" 
								className="form-control"	
								value={fieldData.meal_id}
								onChange={this.changeFDValue.bind(this,'meal_id')}
								required
								disabled />
							</div>
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
							<label className="col-xs-2 form-control-label text-xs-right">連絡電話1</label>
							<div className="col-xs-3">
								<input type="tel" 
								className="form-control"	
								value={fieldData.tel_1}
								onChange={this.changeFDValue.bind(this,'tel_1')}
								maxLength="16"
								disabled />
							</div>
							<label className="col-xs-1 form-control-label text-xs-right">連絡電話2</label>
							<div className="col-xs-3">
								<input type="tel" 
								className="form-control"	
								value={fieldData.tel_2}
								onChange={this.changeFDValue.bind(this,'tel_2')}
								maxLength="16"
								disabled />
							</div>
						</div>						
						<div className="form-group row">
							<label className="col-xs-2 form-control-label text-xs-right">身分證字號</label>
							<div className="col-xs-3">
								<input type="text" 
								className="form-control"	
								value={fieldData.sno}
								onChange={this.changeFDValue.bind(this,'sno')}
								maxLength="10"
								disabled />
							</div>
							<label className="col-xs-1 form-control-label text-xs-right">生日</label>
							<div className="col-xs-3">
								<InputDate id="birthday" 
									onChange={this.changeFDValue} 
									field_name="birthday" 
									value={fieldData.birthday}
									disabled={true} />
							</div>
						</div>
						<div className="form-group row">
							<label className="col-xs-2 form-control-label text-xs-right">送餐地址</label>
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
								disabled={true}/>
						</div>
						<div className="form-group row">
							<label className="col-xs-2 form-control-label text-xs-right">備用地址</label>
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
								disabled={true}/>
						</div>
						<div className="form-group row">
							<label className="col-xs-2 form-control-label text-xs-right">生產備註</label>
							<div className="col-xs-8">
								<input type="text" 							
								className="form-control"	
								value={fieldData.born_memo}
								onChange={this.changeFDValue.bind(this,'born_memo')}
								maxLength="256"
								disabled/>
							</div>
						</div>*/}

						<div className="form-action">
							{save_out_html} { }
							<button type="button" className="btn btn-sm btn-blue-grey" onClick={this.closeSelectCustomerBorn}><i className="fa-arrow-left"></i> 回前頁</button>
						</div>
				</form>
				<hr />
				{/*---產品明細---*/}
				{detail_out_html}
				{/* ---是否結案按鈕start--- */}
				<hr />
                {accounts_receivable_out_html}
				{/* ---是否結案按鈕end--- */}

			</div></ModalProductSelect>
                
            );
        }

        outHtml = (
            <div>
            {modify_html}
            {product_select_out_html}
            <h3 className="h3">銷售紀錄</h3>
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
									<th style={{"width":"10%;"}} className="text-xs-center">
										<label className="c-input c-checkbox">
											<input type="checkbox" checked={this.state.checkAll} onChange={this.checkAll} />
											<span className="c-indicator"></span>
										</label>
									</th>
									<th style={{"width":"10%;"}} className="text-xs-center">修改</th>
									<th style={{"width":"20%;"}}>銷售單號</th>
									<th style={{"width":"20%;"}}>訂購時間</th>
									{/*<th style={{"width":"10%;"}}>客戶分類</th>
									<th style={{"width":"10%;"}}>用餐編號</th>
									<th style={{"width":"14%;"}}>媽媽姓名</th>
									<th style={{"width":"12%;"}}>電話1</th>*/}
									<th style={{"width":"20%;"}}>是否轉單</th>
									<th style={{"width":"20%;"}}>是否結案</th>
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
//總覽紀錄_用餐排程
var MealScheduleData = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function () {
        return {
            gridData: { rows: [], page: 1 },
            fieldData: {},
            searchData: { title: null ,born_id:this.props.born_id},
            edit_type: 0,
            checkAll: false,
            isShowCustomerEdit: false
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
        this.queryGridData(1);
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
            this.setState({ edit_type: 2, fieldData: data.data,isShowCustomerEdit: true });
        }.bind(this))
        .fail(function (jqXHR, textStatus, errorThrown) {
            showAjaxError(errorThrown);
        });
    },
    noneType: function () {
        this.gridData(0)
        .done(function (data, textStatus, jqXHRdata) {
            this.setState({ edit_type: 0, gridData: data ,isShowCustomerEdit: false});
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
        var fieldData=this.state.fieldData;
        var modify_html=null;
        var MdoaleditCustomerDtail=ReactBootstrap.Modal;

        if(this.state.isShowCustomerEdit){
            modify_html=(
            <MdoaleditCustomerDtail bsSize="large" animation={false}  onRequestHide={this.noneType} >
                    <div className="modal-header">
                        <button className="close" onClick={this.noneType}>&times;</button>
                        <h5 className="modal-title text-secondary">用餐排程資料 <small><i className="fa-angle-double-right"></i> 編輯</small></h5>
                    </div>
            <div className="modal-body">
                <form className="form form-sm" role="form">              
                        <div className="form-group row">
                            <label className="col-xs-1 form-control-label text-xs-right">用餐週期<br />說明</label>
                            <div className="col-xs-11">
                                <textarea col="30" row="2" className="form-control"
                                value={fieldData.meal_memo}
                                onChange={this.changeFDValue.bind(this,'meal_memo')}
                                maxLength="256" disabled></textarea>
                            </div>
                        </div>
                </form>

            {/*---用餐排程---*/}
            <MealCalendar ref="MealCalendar"
            noneType={this.noneType}
            product_record_id={fieldData.product_record_id}
            record_deatil_id={fieldData.record_deatil_id}
            customer_id={fieldData.customer_id}
            born_id={fieldData.born_id}
            day={new Date(moment(fieldData.meal_start).format('YYYY/MM/DD'))}  />


            </div>
            </MdoaleditCustomerDtail>
            );
        }

        outHtml = (
            <div>
            {modify_html}
                <h4 className="h4">{this.props.Caption}</h4>

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
var MealCalendar = React.createClass({ 
    mixins: [React.addons.LinkedStateMixin], 
    getInitialState: function() {  
        return {
            ChangeRecord_list:[],
            isHaveRecord:false,
            RecordDetailData:{},
            MealCount:{},
            CalendarGrid:{indexYear:(this.props.day).getFullYear(),
                          indexMonth:((this.props.day).getMonth()+1),
                          nextYear:0,
                          nextMonth:0,
                          nextNextYear:0,
                          nextNextMonth:0}
        };  
    },
    componentWillMount:function(){
        //在輸出前觸發，只執行一次如果您在這個方法中呼叫 setState() ，會發現雖然 render() 再次被觸發了但它還是只執行一次。
        this.setCalendarGrid();
    },
    componentDidMount:function(){
        this.queryChangeRecord();
        this.queryRecordDetail();
    },
    shouldComponentUpdate:function(nextProps,nextState){
        return true;
    },
    queryChangeRecord:function(){
        jqGet(gb_approot + 'api/GetAction/GetChangeRecord',{record_deatil_id:this.props.record_deatil_id})
        .done(function(data, textStatus, jqXHRdata) {
            this.setState({ChangeRecord_list:data.Data,isHaveRecord:data.isHaveRecord});
        }.bind(this))
        .fail(function( jqXHR, textStatus, errorThrown ) {
            showAjaxError(errorThrown);
        });     
    },
    queryRecordDetail:function(){
        jqGet(gb_approot + 'api/GetAction/GetRecordDetail',{record_deatil_id:this.props.record_deatil_id})
        .done(function(data, textStatus, jqXHRdata) {
            this.setState({RecordDetailData:data.record_detail,MealCount:data.meal_count});
        }.bind(this))
        .fail(function( jqXHR, textStatus, errorThrown ) {
            showAjaxError(errorThrown);
        });     
    },
    setCalendarGrid:function(){
        var CalendarGrid=this.state.CalendarGrid;

        if((CalendarGrid.indexMonth+1)>=13){
            CalendarGrid.nextYear=CalendarGrid.indexYear+1;
            CalendarGrid.nextMonth=1;
        }else{
            CalendarGrid.nextYear=CalendarGrid.indexYear;
            CalendarGrid.nextMonth=CalendarGrid.indexMonth+1;
        }
        if((CalendarGrid.indexMonth+2)>=13){
            CalendarGrid.nextNextYear=CalendarGrid.indexYear+1;
            CalendarGrid.nextNextMonth=(CalendarGrid.indexMonth+2)-12;
        }else{
            CalendarGrid.nextNextYear=CalendarGrid.indexYear;
            CalendarGrid.nextNextMonth=CalendarGrid.indexMonth+2;
        }
        // if((CalendarGrid.indexMonth-1)<=1){
        //     CalendarGrid.prveYear=CalendarGrid.indexYear-1;
        //     CalendarGrid.prveMonth=12;
        // }else{
        //     CalendarGrid.prveYear=CalendarGrid.indexYear;
        //     CalendarGrid.prveMonth=CalendarGrid.indexMonth-1;
        // }
        this.setState({CalendarGrid:CalendarGrid});
    },
    setPrve3Month:function(){
        var CalendarGrid=this.state.CalendarGrid;
        var prve=1;
        //上
        if((CalendarGrid.indexMonth-prve)<=0){
            CalendarGrid.indexYear=CalendarGrid.indexYear-1;
            CalendarGrid.indexMonth=(CalendarGrid.indexMonth-prve)+12;
        }else{
            CalendarGrid.indexMonth=CalendarGrid.indexMonth-prve;
        }
        //中
        if((CalendarGrid.nextMonth-prve)<=0){
            CalendarGrid.nextYear=CalendarGrid.nextYear-1;
            CalendarGrid.nextMonth=(CalendarGrid.nextMonth-prve)+12;
        }else{
            CalendarGrid.nextMonth=CalendarGrid.nextMonth-prve;
        }
        //下
        if((CalendarGrid.nextNextMonth-prve)<=0){
            CalendarGrid.nextNextYear=CalendarGrid.nextNextYear-1;
            CalendarGrid.nextNextMonth=(CalendarGrid.nextNextMonth-prve)+12;
        }else{
            CalendarGrid.nextNextMonth=CalendarGrid.nextNextMonth-prve;
        }
        this.setState({CalendarGrid:CalendarGrid});
    },
    setNext3Month:function(){
        var CalendarGrid=this.state.CalendarGrid;
        var next=1;
        //上
        if((CalendarGrid.indexMonth+next)>=13){
            CalendarGrid.indexYear=CalendarGrid.indexYear+1;
            CalendarGrid.indexMonth=(CalendarGrid.indexMonth+next)-12;
        }else{
            CalendarGrid.indexMonth=CalendarGrid.indexMonth+next;
        }
        //中
        if((CalendarGrid.nextMonth+next)>=13){
            CalendarGrid.nextYear=CalendarGrid.nextYear+1;
            CalendarGrid.nextMonth=(CalendarGrid.nextMonth+next)-12;
        }else{
            CalendarGrid.nextMonth=CalendarGrid.nextMonth+next;
        }
        //下
        if((CalendarGrid.nextNextMonth+next)>=13){
            CalendarGrid.nextNextYear=CalendarGrid.nextNextYear+1;
            CalendarGrid.nextNextMonth=(CalendarGrid.nextNextMonth+next)-12;
        }else{
            CalendarGrid.nextNextMonth=CalendarGrid.nextNextMonth+next;
        }
        this.setState({CalendarGrid:CalendarGrid}); 
    },
    setProductRecord:function(){
        //返回產品銷售
        document.location.href = gb_approot + 'Active/Product/ProductRecord?product_record_id=' + this.props.product_record_id;
    },  
    render: function() {
        var outHtml = null;
        var change_record_html=null;
        if(this.state.isHaveRecord){
            change_record_html=(
                <table className="table table-sm table-bordered table-striped">
                    <thead>
                        <tr>
                            <th style={{"width":"20;"}}>異動時間</th>
                            <th style={{"width":"15;"}}>用餐日期</th>
                            <th style={{"width":"20;"}} className="text-xs-center">餐別</th>
                            <th style={{"width":"20;"}} className="text-xs-center">停／增餐</th>
                            <th style={{"width":"25;"}} className="text-xs-center">操作人員</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.state.ChangeRecord_list.map(function(itemData,i) {                                           
                                var product_out_html = 
                                    <tr key={itemData.change_record_id}>
                                        <td>{moment(itemData.change_time).format('YYYY/MM/DD HH:mm:ss')}</td>
                                        <td>{moment(itemData.meal_day).format('YYYY/MM/DD')}</td>
                                        <td className="text-xs-center"><StateForGrid stateData={CommData.MealType} id={itemData.meal_type} /></td>
                                        <td className="text-xs-center"><StateForGrid stateData={CommData.ChangeMealType} id={itemData.change_type} /></td>
                                        <td className="text-xs-center">{itemData.user_name}</td>
                                    </tr>;
                                return product_out_html;
                            }.bind(this))
                        }
                    </tbody>
                </table>
                );
        }else{
            change_record_html=(
                <div className="alert alert-warning">
                    <i className="fa-exclamation-triangle"></i> 目前暫無資料
                </div>
                );
        }
        var RecordDetailData=this.state.RecordDetailData;
        var MealCount=this.state.MealCount;
            outHtml =
            (
                <div>
                {/*---用餐排程start---*/}
                    <hr className="lg" />
                    <h3 className="h3">用餐排程</h3>

                    <div className="alert alert-warning">
                        <p> 已停 <strong>{MealCount.pause_meal}</strong> 餐／
                            已增 <strong>{MealCount.add_meal}</strong> 餐／
                            應排 <strong>{MealCount.estimate_total}</strong> 餐／
                            已排 <strong>{MealCount.real_total}</strong> 餐／
                            已吃 <strong>{MealCount.already_eat}</strong> 餐／
                            未吃 <strong>{MealCount.not_eat}</strong> 餐</p>
                        <p><strong className="text-default">黑色：正常</strong>／<strong className="text-danger">紅色：停餐</strong>／<strong className="text-success">綠色：增餐</strong></p>
                    </div>

                    <p className="text-xs-center">
                        <span className="btn-group">
                            <button className="btn btn-sm btn-primary-outline" onClick={this.setPrve3Month.bind(this)}><i className="fa-arrow-left"></i> 前 1 個月</button>
                            <button className="btn btn-sm btn-primary-outline" onClick={this.setNext3Month.bind(this)}>後 1 個月 <i className="fa-arrow-right"></i></button>
                        </span>
                    </p>

                    {/*<Calendar ref="Calendar1"
                    year={this.state.CalendarGrid.prveYear}
                    month={this.state.CalendarGrid.prveMonth}
                    record_deatil_id={this.props.record_deatil_id}
                    customer_id={this.props.customer_id}
                    born_id={this.props.born_id}
                    queryChangeRecord={this.queryChangeRecord}
                    queryRecordDetail={this.queryRecordDetail} />*/}

                    <Calendar ref="Calendar1"
                    year={this.state.CalendarGrid.indexYear}
                    month={this.state.CalendarGrid.indexMonth}
                    record_deatil_id={this.props.record_deatil_id}
                    customer_id={this.props.customer_id}
                    born_id={this.props.born_id}
                    queryChangeRecord={this.queryChangeRecord}
                    queryRecordDetail={this.queryRecordDetail} />

                    <Calendar ref="Calendar2"
                    year={this.state.CalendarGrid.nextYear}
                    month={this.state.CalendarGrid.nextMonth}
                    record_deatil_id={this.props.record_deatil_id}
                    customer_id={this.props.customer_id}
                    born_id={this.props.born_id}
                    queryChangeRecord={this.queryChangeRecord}
                    queryRecordDetail={this.queryRecordDetail} />

                    <Calendar ref="Calendar3"
                    year={this.state.CalendarGrid.nextNextYear}
                    month={this.state.CalendarGrid.nextNextMonth}
                    record_deatil_id={this.props.record_deatil_id}
                    customer_id={this.props.customer_id}
                    born_id={this.props.born_id}
                    queryChangeRecord={this.queryChangeRecord}
                    queryRecordDetail={this.queryRecordDetail} />

                    <div className="clearfix">
                        <p className="pull-xs-left"><strong>開始送餐後(含送餐當日) 請勿任意修改用餐排程，如有異動會留下紀錄！</strong></p>
                        <p className="pull-xs-right text-xs-right">
                            <button type="button" className="btn btn-sm btn-blue-grey" onClick={this.props.noneType}><i className="fa-arrow-left"></i> 回列表</button> { }
                            <button type="button" className="btn btn-sm btn-info" onClick={this.setProductRecord.bind(this)}><i className="fa-undo"></i> 回產品銷售</button>
                        </p>
                    </div>
                {/*---用餐排程end---*/}
                {/*---異動紀錄start---*/}
                    <hr className="lg" />

                    <h3 className="h3">異動紀錄</h3>
                        
                            <ul className="nav nav-tabs" role="tablist">
                                <li className="nav-item"><a className="nav-link active" href="#changeLog1" role="tab" data-toggle="tab">用餐排程異動紀錄</a></li>
                                <li className="nav-item"><a className="nav-link" href="#changeLog2" role="tab" data-toggle="tab">訂餐日期及餐數異動紀錄</a></li>
                            </ul>{/*---tab-nav---*/}
                            <div className="tab-content">
                                <div className="tab-pane active" id="changeLog1">
                                    {change_record_html}
                                </div>
                                <div className="tab-pane" id="changeLog2">
                                    <table className="table table-sm table-bordered table-striped">
                                        <thead>
                                            <tr>
                                                <th style={{"width":"20%;"}}></th>
                                                <th style={{"width":"30%;"}}>送餐起日</th>
                                                <th style={{"width":"30%;"}}>送餐迄日</th>
                                                <th style={{"width":"20%;"}}>餐數</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="text-xs-right"><strong>原訂</strong></td>
                                                <td>{moment(RecordDetailData.meal_start).format('YYYY/MM/DD')}</td>
                                                <td>{moment(RecordDetailData.meal_end).format('YYYY/MM/DD')}</td>
                                                <td>早 {RecordDetailData.estimate_breakfast}／
                                                    午 {RecordDetailData.estimate_lunch}／
                                                    晚 {RecordDetailData.estimate_dinner}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-xs-right"><strong>實訂</strong></td>
                                                <td>{moment(RecordDetailData.real_estimate_meal_start).format('YYYY/MM/DD')}</td>
                                                <td>{moment(RecordDetailData.real_estimate_meal_end).format('YYYY/MM/DD')}</td>
                                                <td>早 {RecordDetailData.real_estimate_breakfast}／
                                                    午 {RecordDetailData.real_estimate_lunch}／
                                                    晚 {RecordDetailData.real_estimate_dinner}</td>
                                            </tr>
                                            <tr>
                                                <td className="text-xs-right"><strong>實際</strong></td>
                                                <td>{moment(RecordDetailData.real_meal_start).format('YYYY/MM/DD')}</td>
                                                <td>{moment(RecordDetailData.real_meal_end).format('YYYY/MM/DD')}</td>
                                                <td>早 {RecordDetailData.real_breakfast}／
                                                    午 {RecordDetailData.real_lunch}／
                                                    晚 {RecordDetailData.real_dinner}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>{/*table-content*/}
                {/*---異動紀錄end---*/}            
                </div>
            );

        return outHtml;
    }
});
//每月日曆
var Calendar = React.createClass({ 
    mixins: [React.addons.LinkedStateMixin], 
    getInitialState: function() {  
        return {            
            MonthObj:{weekInfo:[]},
            Calendar_id:'calendar-'+this.props.month,
            searchData:{record_deatil_id:this.props.record_deatil_id,month:this.props.month,year:this.props.year},
            dailyMealData:{ record_deatil_id:this.props.record_deatil_id,
                            customer_id:this.props.customer_id,
                            born_id:this.props.born_id,
                            meal_day:null}
        };  
    },
    getDefaultProps:function(){
        return{ 
            year:null,
            month:null
        };
    },
    componentDidMount:function(){
        this.queryMonthObj(this.props.year,this.props.month);
    },
    shouldComponentUpdate:function(nextProps,nextState){
        return true;
    },
    componentWillReceiveProps:function(nextProps){
        //當元件收到新的 props 時被執行，這個方法在初始化時並不會被執行。使用的時機是在我們使用 setState() 並且呼叫 render() 之前您可以比對 props，舊的值在 this.props，而新值就從 nextProps 來。
        if(nextProps.month!=this.props.month){
            this.queryMonthObj(nextProps.year,nextProps.month);
        }
    },
    queryMonthObj:function(year,month){
        var searchData=this.state.searchData;
        searchData.month=month;
        searchData.year=year;

        jqGet(gb_approot + 'api/GetAction/GetMealCalendar',searchData)
        .done(function(data, textStatus, jqXHRdata) {
            this.setState({MonthObj:data,searchData:searchData});
        }.bind(this))
        .fail(function( jqXHR, textStatus, errorThrown ) {
            showAjaxError(errorThrown);
        });     
    },
    addDailyMeal:function(meal_day,e){
        var meal_day_f=new Date(moment(meal_day).format('YYYY/MM/DD'));//轉換日期格式
        //正常判斷式先隱藏
        // if(getNowDate()>=meal_day_f)
        // {//今天 >= 用餐日期 不可編輯
        //     return;
        // }
        if(!confirm('是否增加此天用餐排程?')){
            return;
        }
        this.state.dailyMealData.meal_day=meal_day;

        jqPost(gb_approot + 'api/GetAction/AddDailyMeal',this.state.dailyMealData)
        .done(function(data, textStatus, jqXHRdata) {
            if(data.result){
                this.queryMonthObj(this.props.year,this.props.month);
                this.props.queryRecordDetail();
            }
        }.bind(this))
        .fail(function( jqXHR, textStatus, errorThrown ) {
            //showAjaxError(errorThrown);
        }); 
    },
    render: function() {
        var outHtml = null;
        var MonthObj=this.state.MonthObj;
            outHtml =
            (
                <div className="card m-b-1">
                   <div className="panel">
                        <div className="card-header panel-heading bg-primary-light">
                            <span className="panel-title">
                                <a className="center-block text-xs-left text-secondary" data-toggle="collapse"  href={'#'+this.state.Calendar_id}>
                                    <i className="fa-calendar"></i> { }
                                    {MonthObj.year} 年 {MonthObj.month} 月
                                </a>
                            </span>
                        </div>
                        <div id={this.state.Calendar_id} className="panel-collapse collapse in">
                            <div className="card-block panel-body">
                                <table className="table table-sm table-bordered calendar">
                                    <thead>
                                        <tr>
                                            <th className="text-xs-center">日</th>
                                            <th className="text-xs-center">一</th>
                                            <th className="text-xs-center">二</th>
                                            <th className="text-xs-center">三</th>
                                            <th className="text-xs-center">四</th>
                                            <th className="text-xs-center">五</th>
                                            <th className="text-xs-center">六</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            MonthObj.weekInfo.map(function(weekObj,i) {                                                    
                                                var week_out_html = 
                                                    <tr key={MonthObj.month+'-'+i}>
                                                    {
                                                        weekObj.dayInfo.map(function(dayObj,i) {
                                                            var day_out_html=null;
                                                            if(dayObj.isNowMonth && dayObj.isHaveMeal){                                                                                                                                    day_out_html = 
                                                                day_out_html=
                                                                <td key={moment(dayObj.meal_day).format('MM-DD')}> {/* 非當月的日期 class="disabled" */}
                                                                    <small className="text-muted">{moment(dayObj.meal_day).format('MM/DD')}</small>
                                                                    <div className="c-inputs-stacked">
                                                                        <MealCheckBox
                                                                        meal_type={1}
                                                                        meal_day={dayObj.meal_day}
                                                                        meal_name={'早'}
                                                                        meal_state={dayObj.breakfast}
                                                                        daily_meal_id={dayObj.daily_meal_id}
                                                                        record_deatil_id={dayObj.record_deatil_id}
                                                                        isMealStart={MonthObj.isMealStart}
                                                                        queryChangeRecord={this.props.queryChangeRecord}
                                                                        queryRecordDetail={this.props.queryRecordDetail} />

                                                                        <MealCheckBox
                                                                        meal_type={2}
                                                                        meal_day={dayObj.meal_day}
                                                                        meal_name={'午'}
                                                                        meal_state={dayObj.lunch}
                                                                        daily_meal_id={dayObj.daily_meal_id}
                                                                        record_deatil_id={dayObj.record_deatil_id}
                                                                        isMealStart={MonthObj.isMealStart}
                                                                        queryChangeRecord={this.props.queryChangeRecord}
                                                                        queryRecordDetail={this.props.queryRecordDetail} />
                                                                        
                                                                        <MealCheckBox
                                                                        meal_type={3}
                                                                        meal_day={dayObj.meal_day}
                                                                        meal_name={'晚'}
                                                                        meal_state={dayObj.dinner}
                                                                        daily_meal_id={dayObj.daily_meal_id}
                                                                        record_deatil_id={dayObj.record_deatil_id}
                                                                        isMealStart={MonthObj.isMealStart}
                                                                        queryChangeRecord={this.props.queryChangeRecord}
                                                                        queryRecordDetail={this.props.queryRecordDetail} />
                                                                    </div>
                                                                </td>;
                                                            }else if(dayObj.isNowMonth){
                                                                day_out_html=
                                                                <td key={moment(dayObj.meal_day).format('MM-DD')} onClick={this.addDailyMeal.bind(this,dayObj.meal_day)}>
                                                                    <small className="text-muted">{moment(dayObj.meal_day).format('MM/DD')}</small>
                                                                </td>;
                                                            }else{//非當月日期
                                                                day_out_html=                                                                                                               day_out_html=
                                                                <td key={moment(dayObj.meal_day).format('MM-DD')} className="disabled">
                                                                    <small className="text-muted">{moment(dayObj.meal_day).format('MM/DD')}</small>
                                                                </td>;
                                                            }                                    

                                                            return day_out_html;
                                                        }.bind(this))
                                                    }
      
                                                    </tr>;
                                                return week_out_html;
                                            }.bind(this))
                                        }
                                        
                                    </tbody>                                     
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            );

        return outHtml;
    }
});

//用餐checkbox
var MealCheckBox = React.createClass({ 
    mixins: [React.addons.LinkedStateMixin], 
    getInitialState: function() {  
        return {            
            MealData:{  daily_meal_id:this.props.daily_meal_id,
                        record_deatil_id:this.props.record_deatil_id,
                        meal_type:this.props.meal_type,
                        meal_state:this.props.meal_state,
                        isMealStart:this.props.isMealStart},
            isMealFinished:false //此日期已經用餐完畢
        };  
    },
    getDefaultProps:function(){
        return{ 
            today:getNowDate(),
            Yesterday:addDate(getNowDate(),-1),
            meal_day:null,
            meal_state:0,
            meal_type:0,//判斷 早餐:1 / 午餐:2 / 晚餐:3
            meal_name:null,
            daily_meal_id:0,
            record_deatil_id:0,
            isMealStart:false
        };
    },
    componentDidMount:function(){
    },
    shouldComponentUpdate:function(nextProps,nextState){
        return true;
    },
    changeMealValue:function(e){
        var obj = this.state.MealData;
        if(!this.props.isMealStart)
        {//正式開始用餐前怎麼修改都不會出現異動紀錄
            if(e.target.checked){
                obj.meal_state=1;
            }else{
                obj.meal_state=-1;
            }
        }else{
            if(!confirm('是否變更此天用餐排程?')){
                return;
            }
            if(e.target.checked){
                obj.meal_state=2;
            }else{
                obj.meal_state=-2;
            }
        }
        jqPost(gb_approot + 'api/GetAction/PostDailyMealState',this.state.MealData)
        .done(function(data, textStatus, jqXHRdata) {
            if(data.result){
                if(this.props.isMealStart){
                    this.props.queryChangeRecord();
                }
                this.props.queryRecordDetail();
            }
        }.bind(this))
        .fail(function( jqXHR, textStatus, errorThrown ) {
            //showAjaxError(errorThrown);
        }); 


        this.setState({MealData:obj});
    },
    render: function() {
        var outHtml = null;
        var name_out_html=null;
        var MealData=this.state.MealData;
        var meal_day=new Date(moment(this.props.meal_day).format('YYYY/MM/DD'));

        if(this.props.Yesterday>=meal_day && this.props.meal_state>0)
        {
            name_out_html=(<span className="disabled">{this.props.meal_name +'(已吃)'}</span>);
        }
        else if(MealData.meal_state==2)
        {
            name_out_html=(<span className="text-success">{this.props.meal_name +'(增)'}</span>);
        }
        else if(MealData.meal_state==-2)
        {
            name_out_html=(<span className="text-danger">{this.props.meal_name +'(停)'}</span>);
        }
        else
        {
            name_out_html=(<span>{this.props.meal_name}</span>);
        }
        if(this.props.Yesterday>=meal_day)
        {//用餐日期 < 今天 不可編輯
            this.state.isMealFinished=true;
        }

        var disabledOutHtml=null;//正常判斷式,日期已結束之排餐不可修改
            disabledOutHtml =
            (
                <label className="c-input c-checkbox">
                    <input type="checkbox"                             
                        onChange={this.changeMealValue.bind(this)}
                        checked={MealData.meal_state > 0}
                        disabled={this.state.isMealFinished}  />
                    <span className="c-indicator"></span>
                    {name_out_html}
                </label>
            );

            outHtml =
            (
                <label className="c-input c-checkbox">
                    <input type="checkbox"                             
                        onChange={this.changeMealValue.bind(this)}
                        checked={MealData.meal_state > 0}  />
                    <span className="c-indicator"></span>
                    {name_out_html}
                </label>
            );
        return outHtml;
    }
});
//總覽紀錄_用餐紀錄
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
            apiPathName: gb_approot + 'api/CustomerNeed',
            apiGetDataPathName:gb_approot + 'api/GetAction/GetCustomerNeed',
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
                born_id: this.props.born_id,
                customer_need_id: null,
                customer_id: this.props.mom_id,
                meal_id: null
            }
        });
    },
    updateType: function (id) {
        jqGet(this.props.apiGetDataPathName, { born_id: id })
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
        jqGet(gb_approot + 'api/GetAction/GetRightDietaryNeed',{main_id:this.state.fieldData.customer_need_id})
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
        jqPost(gb_approot + 'api/GetAction/PostCustomerOfDietaryNeed',{customer_need_id:this.state.fieldData.customer_need_id,dietary_need_id:dietary_need_id})
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
        jqDelete(gb_approot + 'api/GetAction/DeleteCustomerOfDietaryNeed',{customer_need_id:this.state.fieldData.customer_need_id,dietary_need_id:dietary_need_id})
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
        if(this.state.edit_type==1) {
            outHtml = (
                <div>
                    <div className="alert alert-warning">這位媽媽還沒有用餐需求喔……</div>
                    <form onSubmit={this.handleSubmit}>
                        <button type="submit" className="btn btn-lg btn-success" name="btn-1"><i className="fa-plus-circle"></i> 新增用餐需求</button>
                    </form>
                </div>
            );
        } else {
            outHtml = (
                <div>
                    <form className="form form-sm" onSubmit={this.handleSubmit}>
                        {/*<div className="form-group row">
                            <label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 用餐編號</label>
                            <div className="col-xs-3">
                                <div className="input-group input-group-sm">
                                    <input type="text"
                                           className="form-control"
                                           value={fieldData.meal_id}
                                           onChange={this.changeFDValue.bind(this,'meal_id')}
                                           required 
                                           disabled={true} />
                                </div>
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
                        </div>*/}
                        <div className="form-group row">
                            <label className="col-xs-1 form-control-label text-xs-right">需求備註</label>
                            <div className="col-xs-10">
                                <textarea col="30" row="2" className="form-control"
                                          value={fieldData.memo}
                                          onChange={this.changeFDValue.bind(this,'memo')}
                                          maxLength="256"></textarea>
                            </div>
                            <div className="col-xs-1">
                                <button type="submit" className="btn btn-sm btn-primary" name="btn-1"><i className="fa-check"></i> 存檔確認</button>
                            </div>
                        </div>
                    </form>
                    {map_out_html}
                </div>
            );
        }

        return outHtml;
    }
});
//總覽紀錄_電訪排程
var TelScheduleData = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function () {
        return {
            gridData: { rows: [], page: 1 },
            fieldData: {schedule_id:null},
            searchData: { title: null, },
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
            apiPathName: gb_approot+'api/ContactSchedule',
            apiGetDataPathName: gb_approot + 'api/GetAction/GetContactSchedule'
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
        this.setState({ edit_type: 1, fieldData: {
            schedule_id:null,
            customer_id:this.props.mom_id,
            born_id:this.props.born_id,
            meal_id:null
        } });
    },
    updateType: function (id) {
        jqGet(this.props.apiGetDataPathName, { born_id: id })
		.done(function (data, textStatus, jqXHRdata) {
            if(data!=null){
		    this.setState({ edit_type: 2, fieldData: data });
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
        var insert_inpnt_button=null;
        var insert_out_html =null;
        var insert_info_html=null;
console.log('edit',this.state.edit_type);


			if(this.state.edit_type==1){
				save_out_html=<button type="submit" className="btn btn-sm btn-primary col-xs-offset-1"><i className="fa-check"></i> 存檔確認</button>;
                          insert_info_html=(
						<div className="alert alert-warning">
							此生產紀錄無電訪排程資料,如需新增請按 <strong>存檔確認</strong>，來新增此生產紀錄之電訪排程。
						</div>		
                );
			}else if(this.state.edit_type==2){
				save_out_html=<strong className="text-danger col-xs-offset-1">主檔資料不可修改！</strong>;
				detail_out_html=(
                    <SubFormForTelSch ref="SubFormForTelSch" 
				main_id={fieldData.schedule_id}
				customer_id={fieldData.customer_id}
				born_id={fieldData.born_id}
				meal_id={fieldData.meal_id}/>
                );
			}

                 
        outHtml = (
            <div>
                <h3 className="h3">{this.props.Caption}<small className="sub"><i className="fa-angle-double-right"></i> 主檔</small></h3>
                {insert_info_html}
				<form className="form form-sm" onSubmit={this.handleSubmit}>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 選擇客戶</label>
							<div className="col-xs-2">
								<input type="text"
                                           className="form-control"
                                           value={fieldData.customer_name}
                                           onChange={this.changeFDValue.bind(this,'customer_name')}
                                           maxLength="64"
                                           disabled />
    						</div>
							<label className="col-xs-1 form-control-label text-xs-right">客戶類別</label>
							<div className="col-xs-2">
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
							<div className="col-xs-3">
								<input type="text"
                                       className="form-control"
                                       value={fieldData.customer_name}
                                       onChange={this.changeFDValue.bind(this,'customer_name')}
                                       maxLength="64"
                                       required
                                       disabled />
							</div>
						</div>
						{/*<div className="form-group row">
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
					</div>*/}
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
//明細檔編輯
var SubFormForTelRec = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return {
			gridSubData:[],
			fieldSubData:{},
			edit_sub_type:0,//預設皆為新增狀態
			checkAll:false
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldSubData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/DeatilTelRecord'
		};
	},
	componentDidMount:function(){
		this.queryGridData();
		this.insertSubType();//一開始載入預設為新增狀態
	},
	shouldComponentUpdate:function(nextProps,nextState){
		return true;
	},
	detailHandleSubmit: function(e) {
		e.preventDefault();

		if(this.state.edit_sub_type==1){
			jqPost(this.props.apiPathName,this.state.fieldSubData)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					if(data.message!=null){
						tosMessage(null,'新增完成'+data.message,1);
					}else{
						tosMessage(null,'新增完成',1);
					}
					//儲存後更新下分list
					this.queryGridData();
					this.insertSubType();
				}else{
					tosMessage(null,data.message,3);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
		}		
		else if(this.state.edit_sub_type==2){
			jqPut(this.props.apiPathName,this.state.fieldSubData)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					if(data.message!=null){
						tosMessage(null,'修改完成'+data.message,1);
					}else{
						tosMessage(null,'修改完成',1);
					}
					//儲存後更新下分list
					this.queryGridData();
					this.insertSubType();
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
	detailDeleteSubmit:function(id,e){

		if(!confirm('確定是否刪除?')){
			return;
		}
		jqDelete(this.props.apiPathName + '?ids=' +id ,{})			
		.done(function(data, textStatus, jqXHRdata) {
			if(data.result){
				tosMessage(null,'刪除完成',1);
				this.queryGridData();
				this.insertSubType();
			}else{
				tosMessage(null,data.message,3);
			}
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
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
			this.setState({gridSubData:data});
		}.bind(this))
		.fail(function(jqXHR, textStatus, errorThrown) {
			showAjaxError(errorThrown);
		});
	},
	insertSubType:function(){
		$('textarea').val("");
		this.setState({edit_sub_type:1,fieldSubData:{
			schedule_detail_id:this.props.main_id,
			tel_state:1
		}});
	},
	updateSubType:function(id,e){
		jqGet(this.props.apiPathName,{id:id})
		.done(function(data, textStatus, jqXHRdata) {
			data.data.tel_datetime=moment(data.data.tel_datetime).format('YYYY/MM/DD hh:mm:ss');
			this.setState({edit_sub_type:2,fieldSubData:data.data});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	changeFDValue:function(name,e){
		this.setInputValue(this.props.fdName,name,e);
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
		this.setState({fieldSubData:obj});
	},
	render: function() {
		var outHtml = null;
		var fieldSubData = this.state.fieldSubData;//明細檔資料

			outHtml =
			(
				<div>
			{/*---產品明細編輯start---*/}
					<h3 className="h3">電訪明細<small className="sub"><i className="fa-angle-double-right"></i> 新增電訪紀錄</small></h3>
					<form className="form form-sm" role="form" id="form2" onSubmit={this.detailHandleSubmit}>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">電訪時間</label>
							<div className="col-xs-4">
								<input type="datetime" 							
								className="form-control"	
								value={fieldSubData.tel_datetime}
								onChange={this.changeFDValue.bind(this,'tel_datetime')}
								maxLength="30"
								required disabled　/>
							</div>
							<small className="text-muted col-xs-6">系統自動產生，無法修改</small>
						</div>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 電訪狀態</label>
							<div className="col-xs-4">
								<select className="form-control" 
								value={fieldSubData.tel_state}
								onChange={this.changeFDValue.bind(this,'tel_state')}>
								{
									CommData.TelState.map(function(itemData,i) {
										return <option  key={itemData.id} value={itemData.id}>{itemData.label}</option>;
									})
								}
								</select>
							</div>
						</div>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">電訪內容<br/>(備註)</label>
							<div className="col-xs-8">
								<textarea col="30" rows="5" className="form-control"
								value={fieldSubData.memo}
								onChange={this.changeFDValue.bind(this,'memo')}
								maxLength="256"></textarea>
							</div>
						</div>
						<div className="form-action">
							<button className="btn btn-sm btn-primary col-xs-offset-1"
							type="submit" form="form2">
								<i className="fa-check"></i> 存檔確認
							</button>
						</div>
					</form>
				{/*---產品明細編輯end---*/}

					<hr className="lg" />

				{/*---產品明細列表start---*/}
					<h3 className="h3">電訪紀錄</h3>
					<table className="table table-sm table-bordered table-striped">
						<thead>
							<tr>
								{/*<th className="col-xs-1 text-center">編輯</th>*/}
								<th style={{"width":"20%;"}}>時間</th>
								<th style={{"width":"20%;"}}>原因</th>
								<th style={{"width":"20%;"}}>內容</th>
								<th style={{"width":"20%;"}}>狀態</th>
								<th style={{"width":"20%;"}}>人員</th>
							</tr>
						</thead>
						<tbody>
							{
								this.state.gridSubData.map(function(itemData,i) {
									var sub_out_html = 
										<tr key={itemData.deatil_tel_record_id}>
											{/*<td className="text-center">
												<button className="btn-link" type="button" onClick={this.updateSubType.bind(this,itemData.deatil_tel_record_id)}><i className="fa-pencil"></i></button>
												<button className="btn-link text-danger" onClick={this.detailDeleteSubmit.bind(this,itemData.deatil_tel_record_id)}><i className="fa-trash"></i></button>
											</td>*/}
											<td><strong>{moment(itemData.tel_datetime).format('YYYY/MM/DD hh:mm:ss')}</strong></td>
											<td><StateForGrid stateData={CommData.TelReasonByDetail} id={this.props.tel_reason} /></td>
											<td>{itemData.memo}</td>
											<td><StateForGrid stateData={CommData.TelState} id={itemData.tel_state} /></td>
											<td>{itemData.user_name}</td>			
										</tr>;
										return sub_out_html;
								}.bind(this))
							}
						</tbody>
					</table>
				{/*---產品明細列表end---*/}
				</div>
			);

		return outHtml;
	}
});
//總覽紀錄_電訪紀錄
var TelRecordData = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function () {
        return {
            gridData: { rows: [], page: 1 },
            fieldData: {},
            searchData: { title: null, 
                start_date:null, 
                end_date: null,
                born_id:this.props.born_id },
            searchBornData: { word: null, is_close: null },
            edit_type: 0,
            checkAll: false,
            isShowCustomerBornSelect: false,
            isShowCustomerSelect:false,
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
        this.setState({ edit_type: 1, fieldData: { tel_reason: 1,
             is_detailInsert: true ,
             born_id:this.props.born_id,
            customer_id:this.props.mom_id},isShowCustomerSelect:true });
    },
    updateType: function (id) {
        jqGet(this.props.apiPathName, { id: id })
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ edit_type: 2, fieldData: data.data,isShowCustomerSelect:true });
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
        this.setState({ isShowCustomerBornSelect: true,isShowCustomerSelect:true });
    },
    closeSelectCustomerBorn: function () {
        this.queryGridData(0);
        this.setState({ isShowCustomerBornSelect: false,isShowCustomerSelect:false });
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

		    this.setState({ isShowCustomerBornSelect: false, fieldData: fieldData,isShowCustomerSelect:false });
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
        var fieldData=this.state.fieldData; 
        var insert_html=null;
        var MdoalCustomerBornSelect=ReactBootstrap.Modal;
        var MdoalCustomerSelect=ReactBootstrap.Modal;
        var save_out_html=null;
			var detail_out_html=null;
            var born_select_out_html=null;//存放選取用餐編號的視窗內容
			if(this.state.isShowCustomerBornSelect){
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
								            <label className="text-sm">客戶名稱/餐編/媽媽姓名</label> { }
								            <input type="text" className="form-control"
									            value={searchBornData.word}
									            onChange={this.changeGDBornValue.bind(this,'word')}
									            placeholder="請擇一填寫" />
								            <label className="text-sm">客戶分類</label> { }
								            <select className="form-control" 
									            value={searchBornData.customer_type}
									            onChange={this.changeGDBornValue.bind(this,'customer_type')}>
									            <option value="">全部</option>
									            {
									            	CommData.CustomerType.map(function(itemData,i) {
									            		return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
									            	})
									            }
								            </select> { }							                
								            <label className="text-sm">正在用餐</label> { }
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
								<table className="table table-sm table-bordered table-striped">
									<thead>
										<tr>
											<th style={{"width":"7%;"}} className="text-xs-center">選擇</th>
											<th style={{"width":"18%;"}}>客戶姓名</th>
											<th style={{"width":"10%;"}}>客戶類別</th>
											<th style={{"width":"10%;"}}>用餐編號</th>
											<th style={{"width":"17%;"}}>媽媽姓名</th>										
											<th style={{"width":"13%;"}}>電話1</th>
											<th style={{"width":"10%;"}}>預產期</th>
											<th style={{"width":"15%;"}}>備註</th>
										</tr>
									</thead>
									<tbody>
										{
											this.state.born_list.map(function(itemData,i) {
												
												var born_out_html = 
													<tr key={itemData.born_id}>
														<td className="text-xs-center">
															<label className="c-input c-checkbox">
										                        <input type="checkbox" onClick={this.selectCustomerBorn.bind(this,itemData.customer_id,itemData.born_id,itemData.meal_id)} />
										                        <span className="c-indicator"></span>
										                    </label>
														</td>
														<td>{itemData.customer_name}</td>
														<td><StateForGrid stateData={CommData.CustomerType} id={itemData.customer_type} /></td>
														<td>{itemData.meal_id}</td>
														<td>{itemData.mom_name}</td>
														<td>{itemData.tel_1}</td>
														<td>{moment(itemData.expected_born_day).format('YYYY/MM/DD')}</td>
														<td>{itemData.memo}</td>
													</tr>;
												return born_out_html;
											}.bind(this))
										}
									</tbody>
								</table>
							</div>
							<div className="modal-footer">
								<button className="btn btn-sm btn-blue-grey" onClick={this.closeSelectCustomerBorn}><i className="fa-times"></i> 關閉</button>
							</div>
					</MdoalCustomerBornSelect>;
			}
			if(this.state.edit_type==1){
				save_out_html=<button type="submit" className="btn btn-sm btn-primary col-xs-offset-1"><i className="fa-check"></i> 存檔確認</button>;
			}else{
				save_out_html=<strong className="text-danger col-xs-offset-1">主檔資料不可修改！</strong>;
				detail_out_html=
				<SubFormForTelRec ref="SubFormForTelRec" 
				main_id={fieldData.schedule_detail_id}
				tel_reason={fieldData.tel_reason} />;
			}
        if(this.state.isShowCustomerSelect){
            insert_html=(
            <MdoalCustomerSelect bsSize="large" animation={false} onRequestHide={this.closeSelectCustomerBorn}>
                        <div className="modal-header">
                            <button className="close" onClick={this.closeSelectCustomerBorn}>&times;</button>
                            <h5 className="modal-title text-secondary">選擇客戶</h5>
                        </div>
            <div className="modal-body">
				{born_select_out_html}
				<h3 className="h3">{this.props.Caption}<small className="sub"><i className="fa-angle-double-right"></i> 主檔</small></h3>

				<form className="form form-sm" onSubmit={this.handleSubmit}>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 選擇客戶</label>
						<div className="col-xs-3">
							<input type="text"                           
                                className="form-control"    
                                value={fieldData.customer_name}
                                onChange={this.changeFDValue.bind(this,'customer_name')}
                                maxLength="64"
                                disabled />
						</div>
					</div>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">電訪日期</label>
						<div className="col-xs-3">
							<InputDate id="tel_day" 
								onChange={this.changeFDValue} 
								field_name="tel_day" 
								value={fieldData.tel_day}
								required={true}
								disabled={true} />
						</div>
						<small className="text-muted col-xs-6">系統自動產生，無法修改</small>
					</div>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 電訪原因</label>
						<div className="col-xs-3">
			                <select className="form-control"
			                value={fieldData.tel_reason}
			                onChange={this.changeFDValue.bind(this,'tel_reason')}
			                disabled={this.state.edit_type==2}>
					            {
									CommData.TelReasonByDetail.map(function(itemData,i) {
									return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
									})
								}
			                </select>
						</div>
					</div>
					<div className="form-group row">
						<label className="col-xs-1 form-control-label text-xs-right">客戶類別</label>
						<div className="col-xs-3">
							<select className="form-control" 
							value={fieldData.customer_type}
							disabled
							onChange={this.changeFDValue.bind(this,'customer_type')}>
							{
								CommData.CustomerType.map(function(itemData,i) {
									return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
								})
							}
							</select>
						</div>
						<label className="col-xs-1 form-control-label text-xs-right">客戶名稱</label>
						<div className="col-xs-3">
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
						<div className="col-xs-3">
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
								CommData.BornType.map(function(itemData,i) {
								return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
								})
							}
							</select>
						</div>
						<label className="col-xs-1 form-control-label text-xs-right">生產日期</label>
						<div className="col-xs-3">
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
						<div className="col-xs-3">
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
						<div className="col-xs-3">
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
							disabled={true}/>
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
							disabled={true}/>
					</div>
					<div className="form-action">
			            {save_out_html} { }
			            <button type="button" className="btn btn-sm btn-blue-grey" onClick={this.closeSelectCustomerBorn}><i className="fa-times"></i> 回前頁</button>
			        </div>
				</form>

				<hr className="lg" />

				
				{/*---產品明細---*/}
				{detail_out_html}


			</div></MdoalCustomerSelect>
            );
        }
        outHtml = (
            <div>
				<form onSubmit={this.handleSearch}>
            {insert_html}

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
					                <th style={{"width":"16%;"}}>電訪原因</th>
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
//總覽紀錄_禮品贈送
var GiftRecordData = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function () {
        return {
            gridData: { rows: [], page: 1 },
            fieldData: {},
            searchData: { title: null,born_id:this.props.born_id },
            searchRecordData: { is_close: false,born_id:this.props.born_id },
            edit_type: 0,
            checkAll: false,
            activity_list: [],
            isShowRecordSelect: false,
            isShowInsertSelect:false,
            record_list: [], 
            searchBornData:{}
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
        this.setState({edit_type:1,fieldData:{receive_state:1,activity_id:defaultA[0].val,product_record_id:null},isShowInsertSelect:true});
    },
    updateType: function (id) {
        jqGet(this.props.apiPathName, { id: id })
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ edit_type: 2, fieldData: data.data ,isShowInsertSelect:true});
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
        this.setState({ isShowRecordSelect: true,isShowInsertSelect:true });
    },
    closeSelectRecord: function () {
        this.queryGridData(0);
        this.setState({ isShowRecordSelect: false,isShowInsertSelect:false });
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
        var fieldData = this.state.fieldData;
        var searchBornData=this.state.searchBornData;
        var searchRecordData =this.state.searchRecordData ;
        var insert_html=null;
        var MdoalCustomerSelect=ReactBootstrap.Modal;
        var MdoalRecordSelect=ReactBootstrap.Modal;//啟用選取用餐編號的視窗內容
        var record_select_out_html=null;//存放選取用餐編號的視窗內容
        if(this.state.isShowRecordSelect){
				record_select_out_html = 					
					<MdoalRecordSelect bsSize="medium" animation={false} onRequestHide={this.closeSelectRecord}>
                        <div className="modal-header">
                            <button className="close" onClick={this.closeSelectRecord}>&times;</button>
                            <h5 className="modal-title text-secondary">選擇產品銷售紀錄</h5>
                        </div>
							<div className="modal-body">
								<div className="alert alert-warning"><p>此列表僅列出<strong className="text-danger">未有過禮品贈送紀錄</strong>的客戶生產紀錄之銷售。</p></div>
							    <div className="table-header">
							        <div className="table-filter">
							            <div className="form-inline form-sm">
							                <div className="form-group">
							                    <label className="text-sm">銷售單號/客戶名稱/媽媽姓名/身分證號</label> { }
							                    <input type="text" className="form-control"
							                    value={searchRecordData.word}
												onChange={this.changeGDRecordValue.bind(this,'word')}
										 		placeholder="請擇一填寫" />
							                </div> { }
							                <div className="form-group">
							                    <label className="text-sm">是否結案</label> { }
							                    <select className="form-control"
							                    value={searchRecordData.is_close}
												onChange={this.changeGDRecordValue.bind(this,'is_close')}>
							                        <option value="">全部</option>
							                        <option value="true">已結案</option>
							                        <option value="false">未結案</option>
							                    </select>
							                </div> { }
							                <div className="form-group">
							                    <label className="text-sm">訂單日期</label> { }
													<InputDate id="start_date" 
													onChange={this.changeGDRecordValue} 
													field_name="start_date" 
													value={searchRecordData.start_date} /> { }
												<label className="text-sm">~</label> { }
													<InputDate id="end_date" 
													onChange={this.changeGDRecordValue} 
													field_name="end_date" 
													value={searchRecordData.end_date} />
							                </div> { }
							                <button className="btn btn-secondary btn-sm" onClick={this.queryAllRecord.bind(this)}><i className="fa-search"></i> 搜尋</button>
							            </div>
							        </div>
							    </div>
								<table className="table table-sm table-bordered table-striped">
									<thead>
										<tr>
											<th style={{"width":"10%;"}} className="text-xs-center">選擇</th>
					            			<th style={{"width":"15%;"}}>銷售單號</th>
					            			<th style={{"width":"15%;"}}>訂單日期</th>
					            			<th style={{"width":"20%;"}}>客戶名稱</th>
					            			<th style={{"width":"15%;"}}>媽媽姓名</th>
					            			<th style={{"width":"15%;"}}>身分證號</th>
					            			<th style={{"width":"10%;"}}>結案?</th>
										</tr>
									</thead>
									<tbody>
										{
											this.state.record_list.map(function(itemData,i) {
												
												var born_out_html = 
													<tr key={itemData.product_record_id}>
														<td className="text-xs-center">
															<label className="c-input c-checkbox">
																<input type="checkbox" onClick={this.selectRecord.bind(this,itemData.product_record_id,itemData.customer_id,itemData.born_id)} />
																<span className="c-indicator"></span>
															</label>
														</td>
														<td>{itemData.record_sn}</td>
														<td>{moment(itemData.record_day).format('YYYY/MM/DD')}</td>
														<td>{itemData.customer_name}</td>
														<td>{itemData.mom_name}</td>
														<td>{itemData.sno}</td>
														<td>{itemData.is_close? <span className="text-muted">結案</span>:<span className="text-danger">未結案</span>}</td>			
													</tr>;
												return born_out_html;
											}.bind(this))
										}
									</tbody>
								</table>
							</div>
							<div className="modal-footer">
								<button className="btn btn-sm btn-blue-grey" onClick={this.closeSelectRecord}><i className="fa-times"></i> { } 關閉</button>
							</div>
					</MdoalRecordSelect>;
			}
        if(this.state.isShowInsertSelect){
            insert_html=(
                <MdoalCustomerSelect bsSize="medium" animation={false} onRequestHide={this.closeSelectRecord}>
                <div className="modal-header">
                            <button className="close" onClick={this.closeSelectRecord}>&times;</button>
                            <h5 className="modal-title text-secondary">禮品紀錄 <small><i className="fa-angle-double-right"></i> 編輯</small></h5>
                        </div>
                <div className="modal-body">
				{record_select_out_html}

				<form className="form form-sm" onSubmit={this.handleSubmit}>

					<div className="form-group row">
						<label className="col-xs-2 form-control-label text-xs-right"><span className="text-danger">*</span> 銷售單號</label>
						<div className="col-xs-4">
							<div className="input-group input-group-sm">
								<input type="text" 							
								className="form-control"	
								value={fieldData.record_sn}
								onChange={this.changeFDValue.bind(this,'record_sn')}
								maxLength="128"
								required disabled />
								<span className="input-group-btn">
									<a className="btn btn-success" data-toggle="modal" onClick={this.showSelectRecord} disabled={this.state.edit_type==2} ><i className="fa-plus"></i></a>
								</span>
							</div>
						</div>
						<small className="text-muted col-xs-6">請按 <i className="fa-plus"></i> 選取</small>
					</div>
					<div className="form-group row">
						<label className="col-xs-2 form-control-label text-xs-right">訂單日期</label>
						<div className="col-xs-4">
							<InputDate id="record_day" 
								onChange={this.changeFDValue} 
								field_name="record_day" 
								value={fieldData.record_day}
								disabled={true} />
						</div>
						<label className="col-xs-2 form-control-label text-xs-right">訂購總金額</label>
						<div className="col-xs-4">
							<div className="input-group input-group-sm">
								<input type="number" 
									className="form-control"	
									value={fieldData.totle_price}
									onChange={this.changeFDValue.bind(this,'totle_price')}
									disabled />
								<span className="input-group-addon">元</span>
							</div>
						</div>
					</div>
					{/*<div className="form-group row">
						<label className="col-xs-2 form-control-label text-xs-right">客戶姓名</label>
						<div className="col-xs-4">
							<input type="text" 
							className="form-control"	
							value={fieldData.customer_name}
							onChange={this.changeFDValue.bind(this,'customer_name')}
							maxLength="64"
							disabled />
						</div>
						<label className="col-xs-2 form-control-label text-xs-right">媽媽姓名</label>
						<div className="col-xs-4">
							<input type="text" 
							className="form-control"	
							value={fieldData.name}
							onChange={this.changeFDValue.bind(this,'name')}
							maxLength="64"
							disabled />
						</div>
					</div>
					<div className="form-group row">
						<label className="col-xs-2 form-control-label text-xs-right">聯絡電話1</label>
						<div className="col-xs-4">
							<input type="tel"
                                   className="form-control"
                                   value={fieldData.tel_1}
                                   onChange={this.changeFDValue.bind(this,'tel_1')}
                                   maxLength="16"
                                   disabled />
						</div>
						<label className="col-xs-2 form-control-label text-xs-right">聯絡電話2</label>
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
						<label className="col-xs-2 form-control-label text-xs-right">身分證號</label>
						<div className="col-xs-4">
							<input type="text"
                                   className="form-control"
                                   value={fieldData.sno}
                                   onChange={this.changeFDValue.bind(this,'sno')}
                                   maxLength="10"
                                   disabled />
						</div>
						<label className="col-xs-2 form-control-label text-xs-right">生日</label>
						<div className="col-xs-4">
								<InputDate id="birthday"
                                           onChange={this.changeFDValue}
                                           field_name="birthday"
                                           value={fieldData.birthday}
                                           disabled={true} />
						</div>
					</div>

					<div className="form-group row">
						<label className="col-xs-2 form-control-label text-xs-right">送餐地址</label>
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
						<label className="col-xs-2 form-control-label text-xs-right">備用地址</label>
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
					</div>*/}
					<div className="form-group row">
						<label className="col-xs-2 form-control-label text-xs-right"><span className="text-danger">*</span> 參與活動</label>
						<div className="col-xs-10">
							<select className="form-control" 
							value={fieldData.activity_id}
							onChange={this.changeFDValue.bind(this,'activity_id')}>
							{
								this.state.activity_list.map(function(itemData,i) {
									return <option key={itemData.val} value={itemData.val}>{itemData.Lname}</option>;
								})
							}
							</select>
						</div>
					</div>

					<div className="form-group row">
						<label className="col-xs-2 form-control-label text-xs-right"><span className="text-danger">*</span> 領取狀態</label>
						<div className="col-xs-10">
								<label className="c-input c-radio">
									<input type="radio" 
											name="receive_state"
											value={1}
											checked={fieldData.receive_state==1} 
											onChange={this.changeFDValue.bind(this,'receive_state')}
									/>
									<span className="c-indicator"></span>
									<span className="text-sm">未領取</span>
								</label>
								<label className="c-input c-radio">
									<input type="radio" 
											name="receive_state"
											value={2}
											checked={fieldData.receive_state==2} 
											onChange={this.changeFDValue.bind(this,'receive_state')}
											/>
									<span className="c-indicator"></span>
									<span className="text-sm">領取部分</span>
								</label>
								<label className="c-input c-radio">
									<input type="radio" 
											name="receive_state"
											value={3}
											checked={fieldData.receive_state==3} 
											onChange={this.changeFDValue.bind(this,'receive_state')}
											/>
									<span className="c-indicator"></span>
									<span className="text-sm">已領完</span>
								</label>
						</div>
					</div>

					<div className="form-group row">
						<label className="col-xs-2 form-control-label text-xs-right">備註</label>
						<div className="col-xs-10">
							<textarea col="30" rows="3" className="form-control"
							value={fieldData.memo}
							onChange={this.changeFDValue.bind(this,'memo')}
							maxLength="256"></textarea>
						</div>
					</div>

					<div className="form-action">
						<button type="submit" className="btn btn-sm btn-primary col-xs-offset-2" name="btn-1"><i className="fa-check"></i> 存檔確認</button> { }
						<button type="button" className="btn btn-sm btn-blue-grey" onClick={this.closeSelectRecord}><i className="fa-times"></i> 回前頁</button>
					</div>

				</form>
			</div>
                </MdoalCustomerSelect>
            );
        }
        outHtml = (
            <div>
            {insert_html}
                 <h3 className="h3">禮品紀錄</h3>

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
					{/*<td>{this.props.itemData.customer_name}</td>
					<td>{this.props.itemData.sno}</td>
					<td>{this.props.itemData.tel_1}</td>*/}
				</tr>
			);
    }
});
//總覽紀錄_帳務紀錄
var AccountRecordData = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function () {
        return {
            gridData: { rows: [], page: 1 },
            fieldData: {},
            searchData: { title: null ,customer_id:this.props.mom_id},
            edit_type: 0,
            checkAll: false,
            isShowCustomerEdit: false,
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
        this.queryGridData(1);
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
		    this.setState({ edit_type: 2, fieldData: data.data ,isShowCustomerEdit: true});
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    noneType: function () {
        this.gridData(0)
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ edit_type: 0, gridData: data ,isShowCustomerEdit: false});
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
    closeSelectRecord: function () {
        this.queryGridData(0);
        this.setState({ isShowCustomerEdit: false});
    },
    render: function () {
        var searchData = this.state.searchData;
        var fieldData=this.sat
        var modify_html=null;
        var MdoalCustomerSelect=ReactBootstrap.Modal;var fieldData = this.state.fieldData;

			var detail_out_html=null;
			if(this.state.edit_type==2){
				detail_out_html=
				<SubFormForAccountPay ref="SubFormForAccountPay" 
				main_id={fieldData.accounts_payable_id}
				customer_id={fieldData.customer_id}
				product_record_id={fieldData.product_record_id}
				noneType={this.noneType}
				main_total={fieldData.estimate_payable} />;
			}
        if(this.state.isShowCustomerEdit){
            modify_html=(
                <MdoalCustomerSelect bsSize="large" animation={false} onRequestHide={this.closeSelectRecord}>
                <div className="modal-header">
                            <button className="close" onClick={this.closeSelectRecord}>&times;</button>
                            <h5 className="modal-title text-secondary">帳款紀錄 <small><i className="fa-angle-double-right"></i> 編輯</small></h5>
                        </div>
                <div className="modal-body">

				<form className="form form-sm" role="form" onSubmit={this.handleSubmit}>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">客戶姓名</label>
							<div className="col-xs-4">
								<input type="text"
                                className="form-control"
                                value={fieldData.customer_name}
                                onChange={this.changeFDValue.bind(this,'customer_name')}
                                maxLength="64"
                                disabled />
							</div>
							<label className="col-xs-2 form-control-label text-xs-right">來源銷售單號</label>
							<div className="col-xs-4">
								<input type="text"
                                className="form-control"
                                value={fieldData.record_sn}
                                onChange={this.changeFDValue.bind(this,'record_sn')}
                                maxLength="64"
                                disabled />
							</div>
						</div>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">連絡電話1</label>
							<div className="col-xs-4">
								<input type="tel"
                                className="form-control"
                                value={fieldData.tel_1}
                                onChange={this.changeFDValue.bind(this,'tel_1')}
                                maxLength="16"
                                disabled />
							</div>
							<label className="col-xs-2 form-control-label text-xs-right">連絡電話2</label>
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
							<label className="col-xs-1 form-control-label text-xs-right">預計應收</label>
							<div className="col-xs-4">
								<div className="input-group input-group-sm">
									<input type="number"
	                                className="form-control"
	                                value={fieldData.estimate_payable}
	                                onChange={this.changeFDValue.bind(this,'estimate_payable')}
	                                disabled />
	                                <span className="input-group-addon">元</span>
								</div>
							</div>
							<label className="col-xs-2 form-control-label text-xs-right">試算應收</label>
							<div className="col-xs-4">
                                <div className="input-group input-group-sm">
									<input type="number"
	                                className="form-control"
	                                value={fieldData.trial_payable}
	                                onChange={this.changeFDValue.bind(this,'trial_payable')}
	                                disabled />
	                                <span className="input-group-addon">元</span>
								</div>
							</div>
						</div>
				</form>
				
				{/*---應收帳款明細---*/}
				{detail_out_html}


			</div></MdoalCustomerSelect>
            );
        }
        outHtml = (
            <div>
            {modify_html}
                <h3 className="h3">帳款紀錄</h3>

				<form onSubmit={this.handleSearch}>

						<div className="table-header">
							<div className="table-filter">
								<div className="form-inline form-sm">
									<div className="form-group">
										<label className="text-sm">來源銷售單號</label> { }
										<input type="text" className="form-control input-sm"
                                               value={searchData.word}
                                               onChange={this.changeGDValue.bind(this,'word')}
                                               placeholder="搜尋來源銷售單號..." /> { }

										<button className="btn btn-secondary btn-sm" type="submit"><i className="fa-search"></i> 搜尋</button>
									</div>
								</div>
							</div>
						</div>
						<table className="table table-sm table-bordered table-striped">
							<thead>
								<tr>
									<th style={{"width":"10%;"}} className="text-xs-center">修改</th>
					                <th style={{"width":"90%;"}}>銷售單號</th>
					                {/*<th style={{"width":"25%;"}}>客戶名稱</th>
					                <th style={{"width":"25%;"}}>身分證號</th>
					                <th style={{"width":"20%;"}}>電話1</th>*/}
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
//明細檔編輯
var SubFormForTelSch = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return {
			gridSubData:[],
			fieldSubData:{},
			searchData:{name:null,product_type:null},
			grid_right_detail:[]
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldSubData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/ScheduleDetail',
			initPathName:gb_approot+'Active/Product/aj_Init'
		};
	},
	componentDidMount:function(){
		this.queryScheduleDetail();
		this.insertSubType();
	},
	shouldComponentUpdate:function(nextProps,nextState){
		return true;
	},
	queryScheduleDetail:function(){//取得右邊已增加的電訪排程
		jqGet(gb_approot + 'api/GetAction/GetScheduleDetail',{main_id:this.props.main_id})
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({grid_right_detail:data});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});		
	},
	detailHandleSubmit:function(e){//新增 
		e.preventDefault();
			
		jqPost(this.props.apiPathName,this.state.fieldSubData)
		.done(function(data, textStatus, jqXHRdata) {
			if(data.result){
				if(data.message!=null){
					tosMessage(null,'新增完成'+data.message,1);
				}else{
					tosMessage(null,'新增完成',1);
				}
				this.queryScheduleDetail();
				this.insertSubType();
			}else{
				tosMessage(null,data.message,3);
			}
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
		return;
	},
	detailDeleteSubmit:function(id,e){

		if(!confirm('確定是否刪除?')){
			return;
		}
		jqDelete(this.props.apiPathName + '?ids=' +id ,{})			
		.done(function(data, textStatus, jqXHRdata) {
			if(data.result){
				tosMessage(null,'刪除完成',1);
				this.queryScheduleDetail();
			}else{
				tosMessage(null,data.message,3);
			}
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	insertSubType:function(){
		this.setState({fieldSubData:{
			schedule_id:this.props.main_id,
			customer_id:this.props.customer_id,
			born_id:this.props.born_id,
			meal_id:this.props.meal_id,
			tel_reason:2
		}});
	},
	changeFDValue:function(name,e){
		var obj = this.state.fieldSubData;
		obj[name] = e.target.value;

		this.setState({fieldSubData:obj});
	},
	render: function() {
		var outHtml = null;
		var fieldSubData=this.state.fieldSubData;

			outHtml =
			(
				<div className="row">
				    <div className="col-xs-6">
				    	<div className="card">
				    		<div className="card-header bg-primary-light text-secondary">新增電訪排程</div>
					        <form className="form form-sm" role="form" id="detailForm" onSubmit={this.detailHandleSubmit}>
						        <div className="card-block">
						            <div className="form-group row">
						                <label className="col-xs-3 form-control-label text-xs-right"><span className="text-danger">*</span> 電訪日期</label>
						                <div className="col-xs-9">
											<InputDate id="tel_day" 
												onChange={this.changeFDValue} 
												field_name="tel_day" 
												value={fieldSubData.tel_day}
												required={true} />
						                </div>
						            </div>
						            <div className="form-group row">
						                <label className="col-xs-3 form-control-label text-xs-right">電訪原因</label>
						                <div className="col-xs-9">
						                    <select className="form-control"
						                    value={fieldSubData.tel_reason}
						                    onChange={this.changeFDValue.bind(this,'tel_reason')}>
								                {
													CommData.TelReasonBySchedule.map(function(itemData,i) {
													return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
													})
												}
						                    </select>
						                </div>
						            </div>
						        </div>
						        <div className="card-footer text-xs-center">
						            <button type="submit" form="detailForm" className="btn btn-sm btn-primary"><i className="fa-check"></i> 存檔確認</button>
						        </div>
					        </form>
				        </div>
				    </div>
				    <div className="col-xs-6">
				        <div className="card">
				    		<div className="card-header bg-primary-light text-secondary">電訪排程明細</div>
				    		<div className="card-block">
						        <table className="table table-sm table-bordered table-striped">
						        	<thead>
							            <tr>
							                <th style={{"width":"40%;"}}>電訪日期</th>
							                <th style={{"width":"40%;"}}>電訪原因</th>
							                <th style={{"width":"20%;"}} className="text-xs-center">移除</th>
							            </tr>
							        </thead>
							        <tbody>
							            {
											this.state.grid_right_detail.map(function(itemData,i) {										
												var detail_out_html = 
													<tr key={itemData.schedule_detail_id}>
														<td>{moment(itemData.tel_day).format('YYYY/MM/DD')}</td>
														<td><StateForGrid stateData={CommData.TelReasonBySchedule} id={itemData.tel_reason} /></td>
														<td className="text-xs-center">
										                    <button className="btn btn-link btn-lg text-danger" onClick={this.detailDeleteSubmit.bind(this,itemData.schedule_detail_id)}><i className="fa-times"></i></button>
										                </td>
													</tr>;
												return detail_out_html;
											}.bind(this))
										}
						            </tbody>
						        </table>
						    </div>
						</div>
				    </div>
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
                    <h3 className="h3">生產紀錄</h3>
                            <button type="button" onClick={this.addDetail} className="btn btn-success m-b-1"><i className="fa-plus-circle"></i> 新增生產紀錄</button>
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
var SubFormForSalesProduct = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return {
			gridSubData:[],
			fieldSubData:{},			
			searchMealIDData:{keyword:'A'},
			edit_sub_type:0,//預設皆為新增狀態
			checkAll:false,
			parm:{breakfast:0,lunch:0,dinner:0},//計算用
			isShowMealidSelect:false,//控制選取用餐編號顯示
			mealid_list:[],
			tryout_array:[
				{name:'breakfast',name_c:'早餐',value:false},
				{name:'lunch',name_c:'午餐',value:false},
				{name:'dinner',name_c:'晚餐',value:false}
			]
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldSubData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/RecordDetail',
			initPathName:gb_approot+'Active/Product/aj_Init',
			apiGridPathName:gb_approot+'api/GetAction/GetAllRecordDetail'
		};
	},
	componentDidMount:function(){
		this.queryGridData();
		this.insertSubType();//一開始載入預設為新增狀態
		//this.getAjaxInitData();//載入init資料
	},
	shouldComponentUpdate:function(nextProps,nextState){
		return true;
	},
	getAjaxInitData:function(){
		jqGet(this.props.initPathName)
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({parm:{breakfast:data.breakfast,lunch:data.lunch,dinner:data.dinner}});
			//載入用餐點數計算
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	detailHandleSubmit: function(e) {

		e.preventDefault();
		var fieldSubData=this.state.fieldSubData;

		if(fieldSubData.product_id==null || fieldSubData.product_id==undefined){
			tosMessage(gb_title_from_invalid,'未選擇產品!!',3);
			return;
		}
		if(fieldSubData.product_type==1){
			if(!this.state.tryout_array[0]['value'] && !this.state.tryout_array[1]['value'] && !this.state.tryout_array[2]['value']){
				tosMessage(gb_title_from_invalid,'產品為試吃時,請選擇試吃的餐別!!',3);
				return;
			}
			if(fieldSubData.tryout_mealtype.indexOf(',')!=-1){
				tosMessage(gb_title_from_invalid,'試吃僅能選擇一項餐別!!',3);
				return;
			}
		}

		if(this.state.edit_sub_type==1){
			jqPost(this.props.apiPathName,fieldSubData)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					if(data.message!=null){
						tosMessage(null,'新增完成'+data.message,1);
					}else{
						tosMessage(null,'新增完成',1);
					}
					//儲存後更新下分list
					this.queryGridData();
					this.insertSubType();
				}else{
					tosMessage(null,data.message,3);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
		}		
		else if(this.state.edit_sub_type==2){
			jqPut(this.props.apiPathName,fieldSubData)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					if(data.message!=null){
						tosMessage(null,'修改完成'+data.message,1);
					}else{
						tosMessage(null,'修改完成',1);
					}
					//儲存後更新下分list
					this.queryGridData();
					this.insertSubType();
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
	detailDeleteSubmit:function(id,e){

		if(!confirm('確定是否刪除?')){
			return;
		}
		jqDelete(this.props.apiPathName + '?ids=' +id ,{})			
		.done(function(data, textStatus, jqXHRdata) {
			if(data.result){
				tosMessage(null,'刪除完成',1);
				this.queryGridData();
				this.insertSubType();
			}else{
				tosMessage(null,data.message,3);
			}
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	gridData:function(){
		var parms = {
			main_id:this.props.main_id
		};
		$.extend(parms, this.state.searchData);

		return jqGet(this.props.apiGridPathName,parms);
	},
	queryGridData:function(){
		this.gridData()
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({gridSubData:data});
		}.bind(this))
		.fail(function(jqXHR, textStatus, errorThrown) {
			showAjaxError(errorThrown);
		});
	},
	insertSubType:function(){
		$('textarea').val("");
		var tryout_array=this.state.tryout_array;
		tryout_array.forEach(function(object, i){object.value=false;})

		this.setState({edit_sub_type:1,fieldSubData:{
			product_record_id:this.props.main_id,
			customer_id:this.props.customer_id,
			born_id:this.props.born_id,
			qty:1,
			subtotal:0,
			tryout_mealtype:null,
			meal_select_state:0,
			meal_id:null,
			meal_start:null,
			meal_end:null,
			isDailyMealAdd:false,
			set_start_meal:null,
			set_end_meal:null,
			diff_day:0
		},
		tryout_array:tryout_array
	});
	},
	updateSubType:function(id,e){
		jqGet(this.props.apiPathName,{id:id})
		.done(function(data, textStatus, jqXHRdata) {
			//計算天數
			var diff_mealday=DiffDate(data.data.meal_start,data.data.meal_end);
			data.data.diff_day=diff_mealday.diff_day;
			//計算點數
			data.data.estimate_count=MealCount(this.state.parm,data.data.estimate_breakfast,data.data.estimate_lunch,data.data.estimate_dinner);
			data.data.real_count=MealCount(this.state.parm,data.data.real_breakfast,data.data.real_lunch,data.data.real_dinner);
			//試吃餐別
			var tryout_array=this.state.tryout_array;
			tryout_array.forEach(function(object, i){object.value=false;})//選之前先清空
			if(data.data.tryout_mealtype!=undefined){
				var array=data.data.tryout_mealtype.split(",");
				tryout_array.forEach(function(object, i){
					array.forEach(function(a_obj,j){
						if(object.name==a_obj){
							object.value=true;
						}
					})
	    		})
			}
			//console.log(data);
			this.setState({edit_sub_type:2,fieldSubData:data.data,tryout_array:tryout_array});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	changeFDValue:function(name,e){
		this.setInputValue(this.props.fdName,name,e);
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
		this.setState({fieldSubData:obj});
	},
	changeMealday:function(name,e){//計算日期天數
		var obj = this.state.fieldSubData;
		var parm=this.state.parm;
		if(obj.isMealStart){
			tosMessage(gb_title_from_invalid,'已開始正式用餐後,請勿變更預計用餐起日及迄日!!',3);
		}else{
			var old_val=obj[name];//修改前
			obj[name] = e.target.value;//先變更修改後的日期在計算

			var diff_mealday=DiffDate(obj.meal_start,obj.meal_end);
			obj.diff_day=diff_mealday.diff_day;
			if(diff_mealday.result==-1){
				tosMessage(gb_title_from_invalid,'預計送餐起日不可大於預計送餐迄日!!',3);
				obj[name]=old_val;
			}else{
				if(parm.breakfast>0){obj.estimate_breakfast=diff_mealday.diff_day;}else{obj.estimate_breakfast=0;}
				if(parm.lunch>0){obj.estimate_lunch=diff_mealday.diff_day;}else{obj.estimate_lunch=0;}
				if(parm.dinner>0){obj.estimate_dinner=diff_mealday.diff_day;}else{obj.estimate_dinner=0;}
				
				obj.qty=diff_mealday.diff_day;
				obj.subtotal=obj.qty*obj.price;
			}
		}

		this.setState({fieldSubData:obj});
	},
	changeMealDayCount:function(e){
		var obj = this.state.fieldSubData;
		var parm=this.state.parm;
		if(obj.meal_start!=null & (e.target.value!=null & e.target.value!='')){
			var tmp_date = new Date(obj.meal_start);
			var end_date=addDate(tmp_date,parseInt(e.target.value)-1);

			obj.meal_end=format_Date(end_date);
			if(parm.breakfast>0){
				obj.estimate_breakfast=parseInt(e.target.value);
			}else{obj.estimate_breakfast=0;}
			if(parm.lunch>0){
				obj.estimate_lunch=parseInt(e.target.value);
			}else{obj.estimate_lunch=0;}
			if(parm.dinner>0){
				obj.estimate_dinner=parseInt(e.target.value);
			}else{obj.estimate_dinner=0;}
			obj.qty=parseInt(e.target.value);
			obj.subtotal=obj.qty*obj.price;
		}

		obj.diff_day=e.target.value;
		this.setState({fieldSubData:obj});
	},
	changePriceCount:function(name,e){
		var obj = this.state.fieldSubData;
		obj[name] = e.target.value;
		obj.subtotal=obj.qty*obj.price;
		this.setState({fieldSubData:obj});
	},
	changeMealCount:function(name,e){
		var obj = this.state.fieldSubData;
		obj[name] = e.target.value;

		obj.estimate_count=MealCount(this.state.parm,obj.estimate_breakfast,obj.estimate_lunch,obj.estimate_dinner);
		obj.qty=obj.estimate_count;
		obj.subtotal=obj.qty*obj.price;

		this.setState({fieldSubData:obj});
	},
	setReleaseMealID:function(meal_id,record_deatil_id){
		if(!confirm('確定釋放用餐編號?')){
			return;
		}
		if(meal_id==null || meal_id==''){
			tosMessage('操作錯誤提示','無用餐編號無法釋放!!',3);
			return;
		}
		if(this.state.fieldSubData.is_release==true){
			tosMessage('操作錯誤提示','用餐編號已釋放!!',3);
			return;
		}

		jqPost(gb_approot + 'api/GetAction/releaseMealID',{record_deatil_id:record_deatil_id,meal_id:meal_id})
		.done(function(data, textStatus, jqXHRdata) {
			if(data.result){
				tosMessage(null,'完成用餐編號釋放',1);
				var fieldSubData = this.state.fieldSubData;
				fieldSubData.is_release=data.result;
				this.props.meal_id=null;
				this.setState({fieldSubData:fieldSubData});
			}else{
				tosMessage(null,data.message,3);
			}
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	setMealSchedule:function(record_deatil_id){
		//設定用餐排程
		document.location.href = gb_approot + 'Active/MealSchedule?record_deatil_id=' + record_deatil_id;
	},
	queryAllMealID:function(){//選取用餐編號-取得未使用的用餐編號List
		jqGet(gb_approot + 'api/GetAction/GetAllMealID',this.state.searchMealIDData)
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({mealid_list:data});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});		
	},
	changeGDMealIDValue:function(name,e){
		var obj = this.state.searchMealIDData;
		obj[name] = e.target.value;
		this.setState({searchMealIDData:obj});
		this.queryAllMealID();
	},
	showSelectMealid:function(){
		this.queryAllMealID();
		this.setState({isShowMealidSelect:true});
	},
	closeSelectMealid:function(){
		this.setState({isShowMealidSelect:false});
	},
	selectMealid:function(meal_id){
		var fieldSubData = this.state.fieldSubData;//選取後變更mealid
		// jqPost(gb_approot + 'api/GetAction/ChangeMealIDState',{old_id:fieldSubData.meal_id,new_id:meal_id})
		// .done(function(data, textStatus, jqXHRdata) {
		// 	if(!data.result){
		// 		alert(data.message);
		// 	}
		// }.bind(this))
		// .fail(function( jqXHR, textStatus, errorThrown ) {
		// 	//showAjaxError(errorThrown);
		// });

		fieldSubData.meal_id=meal_id;
		this.setState({isShowMealidSelect:false,fieldSubData:fieldSubData});
	},
	onMealChange:function(index,e){
		var obj = this.state.fieldSubData;
		var arrayObj=this.state.tryout_array;
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
		obj.tryout_mealtype=array;
		this.setState({fieldSubData:obj,tryout_array:arrayObj});
	},
    updateSelectProduct:function(fSD,tryout_array,parm){
        this.setState({fieldSubData:fSD,tryout_array:tryout_array,parm:parm});
    },
	render: function() {
		var outHtml = null;
		var fieldSubData = this.state.fieldSubData;//明細檔資料
		var searchProductData=this.state.searchProductData;//

		var MdoalMealidSelect=ReactBootstrap.Modal;//啟用選取用餐編號的視窗內容
		var mealid_select_out_html=null;//存放選取用餐編號的視窗內容
		var searchMealIDData=this.state.searchMealIDData;
		if(this.state.isShowMealidSelect){
			mealid_select_out_html = 					
				<MdoalMealidSelect bsSize="small" animation={false} onRequestHide={this.closeSelectMealid}>
                    <div className="modal-header">
                            <button className="close" onClick={this.closeSelectMealid}>&times;</button>
                            <h5 className="modal-title text-secondary">選擇用餐編號</h5>
                        </div>
						<div className="modal-body">
							<div className="alert alert-warning">僅列出尚未使用的用餐編號</div>
								<div className="table-header">
							        <div className="table-filter">
							            <div className="form-inline form-sm">
							                <div className="form-group">
							                    <label className="text-sm">用餐編號分類</label> { }
							                    <select className="form-control"
							                    value={searchMealIDData.keyword}
												onChange={this.changeGDMealIDValue.bind(this,'keyword')}>
							                        <option value="">全部</option>
							                        <option value="A">A</option>
							                        <option value="B">B</option>
							                        <option value="C">C</option>
							                        <option value="H">H</option>
							                        <option value="N">N</option>
							                        <option value="T">T</option>
							                    </select> { }
							                    <button type="button" className="btn btn-secondary btn-sm"><i className="fa-search"></i> 搜尋</button>
							                </div>
							            </div>
							        </div>
							    </div>							
							<table className="table table-sm table-bordered table-striped">
								<tbody>
									<tr>
										<th style={{"width":"20%;"}} className="text-xs-center">選擇</th>
										<th style={{"width":"80%;"}}>用餐編號</th>
									</tr>
									{
										this.state.mealid_list.map(function(itemData,i) {
										
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
							<button className="btn btn-sm btn-blue-grey" onClick={this.closeSelectMealid}><i className="fa-times"></i> 關閉</button>
						</div>
				</MdoalMealidSelect>;
		}
		//月子餐用的用餐編號
		var meal_id_html=null;
		if(fieldSubData.product_type==2){
			meal_id_html=(
				<div className="form-group row">
					{mealid_select_out_html}
					<label className="col-xs-1 form-control-label text-xs-right">用餐編號</label>
					<div className="col-xs-4">
						<div className="input-group input-group-sm">
				            <input type="text" 
							className="form-control"	
							value={fieldSubData.meal_id}
							onChange={this.changeFDValue.bind(this,'meal_id')}
							required
							disabled={true} />
			            	<span className="input-group-btn">
			         			<a className="btn btn-success"
								onClick={this.showSelectMealid}>
								{/*---disabled={this.state.edit_sub_type==2 & fieldSubData.meal_id!=null}---*/}
									<i className="fa-plus"></i>
								</a>
			            	</span>
			        	</div>
			        	<small className="text-muted">請按 <i className="fa-plus"></i> 選取</small>
					</div>
					<button className="btn btn-indigo btn-sm" type="button" 
					onClick={this.setReleaseMealID.bind(this,fieldSubData.meal_id,fieldSubData.record_deatil_id)}
					disabled={this.state.edit_sub_type==1 || fieldSubData.meal_id==null}>
						<i className="fa-check"></i> 釋放用餐編號
					</button>
				</div>
				);
		}

		var total=0;

			outHtml =
			(
				<div>
                <h3 className="h3">銷售紀錄</h3>
				{/*---產品明細編輯start---*/}
					<h3 className="h3"> <small className="sub"><i className="fa-angle-double-right"></i> 新增產品銷售明細</small></h3>
					<form className="form form-sm" role="form" id="form2" onSubmit={this.detailHandleSubmit}>
						<h4 className="h4">1. 填寫產品資料</h4>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 選擇產品</label>
							<div className="col-xs-4">
								<div className="input-group input-group-sm">
									<input type="text" 							
									className="form-control"	
									value={fieldSubData.product_name}
									onChange={this.changeFDValue.bind(this,'product_name')}
									maxLength="64"
									required disabled　/>
									<span className="input-group-btn">
										<a className="btn btn-success" onClick={this.props.showSelectProduct}
										disabled={this.state.edit_sub_type==2} ><i className="fa-plus"></i></a>
									</span>
								</div>
								<small className="text-muted">請按 <i className="fa-plus"></i> 選取</small>
							</div>
							<label className="col-xs-1 form-control-label text-xs-right">銷售日期</label>
							<div className="col-xs-4">
								<InputDate id="sell_day" 
									onChange={this.changeFDValue} 
									field_name="sell_day" 
									value={fieldSubData.sell_day}
									disabled={true}
									placeholder="系統自動產生" />
								<small className="text-muted">系統自動產生，無法修改</small>
							</div>
						</div>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">產品分類</label>
							<div className="col-xs-4">
								<select className="form-control" 
								value={fieldSubData.product_type}
								onChange={this.changeFDValue.bind(this,'product_type')}
								disabled>
								{
									CommData.ProductType.map(function(itemData,i) {
										return <option  key={itemData.id} value={itemData.id}>{itemData.label}</option>;
									})
								}
								</select>
							</div>
							<label className="col-xs-1 form-control-label text-xs-right">規格</label>
							<div className="col-xs-4">
								<input type="text" 							
								className="form-control"	
								value={fieldSubData.standard}
								onChange={this.changeFDValue.bind(this,'standard')}
								maxLength="64"
								required disabled　/>
							</div>
						</div>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">售價</label>
							<div className="col-xs-2">
								<div className="input-group input-group-sm">
									<input type="number" 
									className="form-control"	
									value={fieldSubData.price}
									onChange={this.changePriceCount.bind(this,'price')} />
									<span className="input-group-addon">元</span>
								</div>
							</div>
							<label className="col-xs-1 form-control-label text-xs-right"><span className="text-danger">*</span> 數量</label>
							<div className="col-xs-1">
								<input type="text"				
								className="form-control"	
								value={fieldSubData.qty}
								onChange={this.changePriceCount.bind(this,'qty')}
								required/>
							</div>
							<label className="col-xs-1 form-control-label text-xs-right">小計</label>
							<div className="col-xs-4">
								<div className="input-group input-group-sm">
									<input type="number" 							
									className="form-control"	
									value={fieldSubData.subtotal}
									onChange={this.changeFDValue.bind(this,'subtotal')}
									required disabled　/>
									<span className="input-group-addon">元</span>
								</div>
							</div>
						</div>
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">備註</label>
							<div className="col-xs-9">
								<textarea col="30" row="2" className="form-control"
								value={fieldSubData.memo}
								onChange={this.changeFDValue.bind(this,'memo')}
								maxLength="256"></textarea>
							</div>
						</div>
						
						<h4 className="h4 m-t-1">
							2. 用餐排程 &amp; 試算
							<small className="text-muted m-l-1">產品分類為【月子餐】才需填寫！</small>
						</h4>
						
						{meal_id_html}
						<div className="form-group row">
							<label className="col-xs-1 form-control-label text-xs-right">預計送餐起日</label>
							<div className="col-xs-4">
								<InputDate id="meal_start" 
									onChange={this.changeMealday} 
									field_name="meal_start" 
									value={fieldSubData.meal_start}
									required={(fieldSubData.product_type==2 & fieldSubData.meal_id!=null & fieldSubData.meal_id!=undefined & fieldSubData.meal_id!='')|| fieldSubData.product_type==1}
									disabled={(fieldSubData.product_type==2 & fieldSubData.isDailyMealAdd) & this.state.edit_sub_type==2} />
							</div>
                            {/*---早開始、午開始、晚開始---*/}
                                <div className="col-xs-4">
                                    <label className="c-input c-radio">
                                        <input type="radio" 
                                                name="set_start_meal"
                                                value={1}
                                                checked={fieldSubData.set_start_meal==1} 
                                                onChange={this.changeFDValue.bind(this,'set_start_meal')}
                                        />
                                        <span className="c-indicator"></span>
                                        <span className="text-sm">早開始</span>
                                    </label>
                                    <label className="c-input c-radio">
                                        <input type="radio" 
                                                name="set_start_meal"
                                                value={2}
                                                checked={fieldSubData.set_start_meal==2} 
                                                onChange={this.changeFDValue.bind(this,'set_start_meal')}
                                        />
                                        <span className="c-indicator"></span>
                                        <span className="text-sm">午開始</span>
                                    </label>
                                    <label className="c-input c-radio">
                                        <input type="radio" 
                                                name="set_start_meal"
                                                value={3}
                                                checked={fieldSubData.set_start_meal==3} 
                                                onChange={this.changeFDValue.bind(this,'set_start_meal')}
                                        />
                                        <span className="c-indicator"></span>
                                        <span className="text-sm">晚開始</span>
                                    </label>                                    
                                </div>
                                {/*---早開始、午開始、晚開始---*/} 
                        </div>
                        <div className="form-group row">					
							<label className="col-xs-1 form-control-label text-xs-right">預計送餐迄日</label>
							<div className="col-xs-4">
								<InputDate id="meal_end" 
									onChange={this.changeMealday} 
									field_name="meal_end" 
									value={fieldSubData.meal_end}
									required={fieldSubData.product_type==2 & fieldSubData.meal_id!=null & fieldSubData.meal_id!=undefined & fieldSubData.meal_id!=''}
									disabled={(fieldSubData.product_type==2 & fieldSubData.isDailyMealAdd) & this.state.edit_sub_type==2} />
							</div>
                            {/*---早結束、午結束、晚結束---*/}
                                <div className="col-xs-4">
                                    <label className="c-input c-radio">
                                        <input type="radio" 
                                                name="set_end_meal"
                                                value={1}
                                                checked={fieldSubData.set_end_meal==1} 
                                                onChange={this.changeFDValue.bind(this,'set_end_meal')}
                                            />
                                        <span className="c-indicator"></span>
                                        <span className="text-sm">早結束</span>
                                    </label>
                                    <label className="c-input c-radio">
                                        <input type="radio" 
                                                name="set_end_meal"
                                                value={2}
                                                checked={fieldSubData.set_end_meal==2} 
                                                onChange={this.changeFDValue.bind(this,'set_end_meal')}
                                            />
                                        <span className="c-indicator"></span>
                                        <span className="text-sm">午結束</span>
                                    </label>
                                    <label className="c-input c-radio">
                                        <input type="radio" 
                                                name="set_end_meal"
                                                value={3}
                                                checked={fieldSubData.set_end_meal==3} 
                                                onChange={this.changeFDValue.bind(this,'set_end_meal')}
                                                />
                                        <span className="c-indicator"></span>
                                        <span className="text-sm">晚結束</span>
                                    </label>                                            
                                </div>
                                {/*---早結束、午結束、晚結束---*/}
						</div>
							<div className="form-group row">
								<label className="col-xs-1 form-control-label text-xs-right">預計天數</label>
								<div className="col-xs-2">
									<div className="input-group input-group-sm">
										<input type="number" 							
										className="form-control"	
										value={fieldSubData.diff_day}
										onChange={this.changeMealDayCount.bind(this)}
										min="0"
										disabled={fieldSubData.product_type!=2 || (this.state.edit_sub_type==2 & fieldSubData.isDailyMealAdd)}/>
										<span className="input-group-addon">天</span>
									</div>
									<small className="text-muted">系統自動計算</small>
								</div>
								<label className="col-xs-1 form-control-label text-xs-right">餐別</label>
								<div className="col-xs-3">
								{
									this.state.tryout_array.map(function(itemData,i) {
										var out_check = 							
										<label className="c-input c-checkbox" key={i}>
											<input  type="checkbox" 
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
								<label className="col-xs-1 form-control-label text-xs-right">特殊排餐</label>
								<div className="col-xs-2">
									<select className="form-control" 
									value={fieldSubData.meal_select_state}
									onChange={this.changeFDValue.bind(this,'meal_select_state')}
									disabled={fieldSubData.product_type!=2 || (this.state.edit_sub_type==2 & fieldSubData.isDailyMealAdd)}>
									<option value="0">無</option>
									<option value="1">奇數天排餐</option>
									<option value="2">偶數天排餐</option>
									</select>
								</div>
							</div>
							{/*<div className="form-group row">
								<label className="col-xs-1 form-control-label text-xs-right">預計餐數</label>
								<div className="col-xs-2">
									<div className="input-group input-group-sm">
										<span className="input-group-addon" id="meal1-1">早</span>
										<input type="number" 							
										className="form-control"	
										value={fieldSubData.estimate_breakfast}
										onChange={this.changeMealCount.bind(this,'estimate_breakfast')}
										required={fieldSubData.product_type==2 & fieldSubData.meal_id!=null & fieldSubData.meal_id!=undefined & fieldSubData.meal_id!=''}
										min="0"/>
									</div>
								</div>
								<div className="col-xs-2">
									<div className="input-group input-group-sm">
										<span className="input-group-addon" id="meal1-2">午</span>
										<input type="number" 							
										className="form-control"	
										value={fieldSubData.estimate_lunch}
										onChange={this.changeMealCount.bind(this,'estimate_lunch')}
										required={fieldSubData.product_type==2 & fieldSubData.meal_id!=null & fieldSubData.meal_id!=undefined & fieldSubData.meal_id!=''}
										min="0"/>
									</div>
								</div>
								<div className="col-xs-2">
									<div className="input-group input-group-sm">
										<span className="input-group-addon" id="meal1-3">晚</span>
										<input type="number" 							
										className="form-control"	
										value={fieldSubData.estimate_dinner}
										onChange={this.changeMealCount.bind(this,'estimate_dinner')}
										required={fieldSubData.product_type==2 & fieldSubData.meal_id!=null & fieldSubData.meal_id!=undefined & fieldSubData.meal_id!=''}
										min="0"/>
									</div>
								</div>
								<label className="col-xs-1 form-control-label text-xs-right">預計點數</label>
								<div className="col-xs-2">
									<input type="number" 							
									className="form-control"	
									value={fieldSubData.estimate_count}
									onChange={this.changeFDValue.bind(this,'estimate_count')}
									min="0" disabled/>
									<small className="text-muted">系統自動計算</small>
								</div>
							</div>*/}
							<div className="form-group row">
								<label className="col-xs-1 form-control-label text-xs-right">用餐週期<br />說明</label>
								<div className="col-xs-9">
									<textarea col="30" rows="3" className="form-control"
									value={fieldSubData.meal_memo}
									onChange={this.changeFDValue.bind(this,'meal_memo')}
									maxLength="256"></textarea>
								</div>
							</div>
							<div className="form-group row">
								<label className="col-xs-1 form-control-label text-xs-right">實際餐數</label>
								<div className="col-xs-2">
									<div className="input-group input-group-sm">
										<span className="input-group-addon" id="meal2-1">早</span>
										<input type="number" 							
										className="form-control"	
										value={fieldSubData.real_breakfast}
										onChange={this.changeFDValue.bind(this,'real_breakfast')}
										min="0" disabled/>
									</div>
								</div>
								<div className="col-xs-2">
									<div className="input-group input-group-sm">
										<span className="input-group-addon" id="meal2-2">午</span>
										<input type="number" 							
										className="form-control"	
										value={fieldSubData.real_lunch}
										onChange={this.changeFDValue.bind(this,'real_lunch')}
										min="0" disabled/>
									</div>
								</div>
								<div className="col-xs-2">
									<div className="input-group input-group-sm">
										<span className="input-group-addon" id="meal2-3">晚</span>
										<input type="number" 							
										className="form-control"	
										value={fieldSubData.real_dinner}
										onChange={this.changeFDValue.bind(this,'real_dinner')}
										min="0" disabled/>
									</div>
								</div>
								<label className="col-xs-1 form-control-label text-xs-right">實際點數</label>
								<div className="col-xs-2">
									<input type="number" 							
									className="form-control"	
									value={fieldSubData.real_count}
									onChange={this.changeFDValue.bind(this,'real_count')}
									min="0" disabled/>
								</div>
							</div>
						</form>
						<div className="form-action">
							<button className="btn btn-sm btn-primary col-xs-offset-1"
							disabled={this.props.is_close}
							type="submit" form="form2">
								<i className="fa-check"></i> 存檔確認
							</button> { }
							<button className="btn btn-sm btn-blue-grey" type="button" onClick={this.insertSubType}><i className="fa-times"></i> 取消</button>
						</div>
							

		
				{/*---產品明細編輯end---*/}

					<hr />

				{/*---產品明細列表start---*/}
					<h3 className="h3">產品銷售明細<small className="sub"><i className="fa-angle-double-right"></i> 列表</small></h3>
					<table className="table table-sm table-bordered table-striped">
						<thead>
							<tr>
								<th style={{"width":"10%;"}} className="text-xs-center">編輯</th>
								<th style={{"width":"10%;"}}>產品分類</th>
								<th style={{"width":"20%;"}}>產品名稱</th>
								<th style={{"width":"12%;"}}>單價</th>
								<th style={{"width":"12%;"}}>數量</th>
								<th style={{"width":"12%;"}}>小計</th>
								<th style={{"width":"14%;"}} className="text-xs-center">用餐明細</th>
							</tr>
						</thead>
						<tbody>
							{
								this.state.gridSubData.map(function(itemData,i) {
									var meal_detail_button=null;
									if(itemData.product_type==2)//產品為月子餐才有用餐明細
									{
										meal_detail_button=<button className="btn btn-info btn-sm" onClick={this.setMealSchedule.bind(this,itemData.record_deatil_id)}><i className="fa-search"></i> 查看</button>;
									}
									total+=itemData.subtotal;
									var sub_out_html = 
										<tr key={itemData.record_deatil_id}>
											<td className="text-xs-center">
												<button className="btn btn-link btn-lg text-info" type="button" onClick={this.updateSubType.bind(this,itemData.record_deatil_id)}><i className="fa-pencil"></i></button> { }
												<button className="btn btn-link btn-lg text-danger" onClick={this.detailDeleteSubmit.bind(this,itemData.record_deatil_id)} disabled={this.props.is_close}><i className="fa-trash"></i></button>
											</td>
											<td><StateForGrid stateData={CommData.ProductType} id={itemData.product_type} /></td>
											<td>{itemData.product_name}</td>
											<td>{itemData.price}</td>
											<td>{itemData.qty}</td>
											<td>{itemData.subtotal}</td>
											<td className="text-xs-center">{meal_detail_button}</td>			
										</tr>;
										return sub_out_html;
								}.bind(this))
							}
							<tr className="table-warning">
								<th className="text-xs-center text-danger" colSpan={5}>總　計</th>
								<th className="text-xs-danger" colSpan={2}><strong className="text-danger">{total}</strong></th>
							</tr>
						</tbody>
					</table>
				{/*---產品明細列表end---*/}
				</div>
			);

		return outHtml;
	}
});
//明細檔編輯
var SubFormForAccountPay = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return {
			gridSubData:[],
			fieldSubData:{},
			searchData:{name:null,product_type:null},
			Total_Money:0,
			edit_sub_type:1
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldSubData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/AccountsPayableDetail'
		};
	},
	componentDidMount:function(){
		this.queryAccountsPayableDetail();
		this.insertSubType();
	},
	shouldComponentUpdate:function(nextProps,nextState){
		return true;
	},
	queryAccountsPayableDetail:function(){
		jqGet(gb_approot + 'api/GetAction/GetAccountsPayableDetail',{main_id:this.props.main_id})
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({gridSubData:data.items,Total_Money:data.total});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});		
	},
	detailHandleSubmit:function(e){//新增 
		e.preventDefault();
	    if(this.state.edit_sub_type==1){
			jqPost(this.props.apiPathName,this.state.fieldSubData)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					if(data.message!=null){
						tosMessage(null,'新增完成'+data.message,1);
					}else{
						tosMessage(null,'新增完成',1);
					}
					this.queryAccountsPayableDetail();
					this.insertSubType();
				}else{
					tosMessage(null,data.message,3);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
	    }else if(this.state.edit_sub_type==2){
			jqPut(this.props.apiPathName,this.state.fieldSubData)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					if(data.message!=null){
						tosMessage(null,'修改完成'+data.message,1);
					}else{
						tosMessage(null,'修改完成',1);
					}
					this.queryAccountsPayableDetail();
					this.insertSubType();
				}else{
					tosMessage(null,data.message,3);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
	    }

		return;
	},
	detailDeleteSubmit:function(id,e){

		if(!confirm('確定是否刪除?')){
			return;
		}
		jqDelete(this.props.apiPathName + '?ids=' +id ,{})			
		.done(function(data, textStatus, jqXHRdata) {
			if(data.result){
				tosMessage(null,'刪除完成',1);
				this.queryAccountsPayableDetail();
				this.insertSubType();
			}else{
				tosMessage(null,data.message,3);
			}
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	insertSubType:function(){
		this.setState({
			edit_sub_type:1,
			fieldSubData:{
			accounts_payable_id:this.props.main_id,
			customer_id:this.props.customer_id,
			meal_type:0,
			receipt_day:format_Date(getNowDate()),
			receipt_person:1,
			receipt_item:1,
			receipt_sn:null,
			actual_receipt:0
		}});
	},
	updateSubType:function(id,e){
		jqGet(this.props.apiPathName,{id:id})
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({edit_sub_type:2,fieldSubData:data.data});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	changeFDValue:function(name,e){
		var obj = this.state.fieldSubData;
		obj[name] = e.target.value;

		this.setState({fieldSubData:obj});
	},
	setProductRecord:function(){
        //返回產品銷售
        document.location.href = gb_approot + 'Active/Product/ProductRecord?product_record_id=' + this.props.product_record_id;
    },  
	render: function() {
		var outHtml = null;
		var fieldSubData=this.state.fieldSubData;
		var editor_html=null;
		var editor_colspan=4;
		if(gb_roles=='Managers'){
			editor_html=<th style={{"width":"10%;"}} className="text-xs-center">編輯</th>;
			editor_colspan=5;
		}
			outHtml =
			(
				<div>
				{/*---新增收款明細start---*/}
					<hr className="lg" />
					<h4 className="h4">新增收款明細</h4>

					<form className="form form-sm" role="form" id="SubFormForAccountPayForm" onSubmit={this.detailHandleSubmit}>
							<div className="form-group row">
								<label className="col-xs-1 form-control-label text-xs-right">收款日期</label>
								<div className="col-xs-5">
					                <span className="has-feedback">
										<InputDate id="receipt_day" 
										onChange={this.changeFDValue} 
										field_name="receipt_day" 
										value={fieldSubData.receipt_day}
										required={true} />
									</span>
								</div>
								<label className="col-xs-1 form-control-label text-xs-right">收款單號</label>
								<div className="col-xs-4">
									<input type="text"
                                    className="form-control"
                                    value={fieldSubData.receipt_sn}
                                    onChange={this.changeFDValue.bind(this,'receipt_sn')}
                                    maxLength="10"
                                    required />
								</div>
							</div>
							<div className="form-group row">
								<label className="col-xs-1 form-control-label text-xs-right">收款餐別</label>
								<div className="col-xs-2">
				                    <select className="form-control"
				                    value={fieldSubData.meal_type}
				                    onChange={this.changeFDValue.bind(this,'meal_type')}>
						                {
											CommData.MealTypeByAccountsPayable.map(function(itemData,i) {
											return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
											})
										}
				                    </select>
								</div>
								<label className="col-xs-1 form-control-label text-xs-right">項目</label>
								<div className="col-xs-2">
				                    <select className="form-control"
				                    value={fieldSubData.receipt_item}
				                    onChange={this.changeFDValue.bind(this,'receipt_item')}>
						                {
											CommData.ReceiptItemType.map(function(itemData,i) {
											return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
											})
										}
				                    </select>
								</div>
								<label className="col-xs-1 form-control-label text-xs-right">收款人員</label>
								<div className="col-xs-4">
				                    <select className="form-control"
				                    value={fieldSubData.receipt_person}
				                    onChange={this.changeFDValue.bind(this,'receipt_person')}>
						                {
											CommData.ReceiptPersonType.map(function(itemData,i) {
											return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
											})
										}
				                    </select>
								</div>
							</div>
							<div className="form-group row">
								<label className="col-xs-1 form-control-label text-xs-right">本次實收</label>
								<div className="col-xs-10">
									<div className="input-group input-group-sm">
										<input type="number"
	                                    className="form-control"
	                                    value={fieldSubData.actual_receipt}
	                                    onChange={this.changeFDValue.bind(this,'actual_receipt')}
	                                    required />
	                                    <span className="input-group-addon">元</span>
									</div>
								</div>
							</div>
							<div className="form-action">
								<button type="submit" form="SubFormForAccountPayForm" className="btn btn-sm btn-primary col-xs-offset-1"><i className="fa-check"></i> 存檔確認</button> { }
								<button type="button" className="btn btn-sm btn-blue-grey" onClick={this.insertSubType}><i className="fa-times"></i> 取消</button> { }
								<button type="button" className="btn btn-sm btn-blue-grey col-xs-offset-5" onClick={this.props.noneType}><i className="fa-arrow-left"></i> 回列表</button> { }
                            	<button type="button" className="btn btn-sm btn-info" onClick={this.setProductRecord.bind(this)}><i className="fa-undo"></i> 回產品銷售</button>
							</div>
					</form>
				{/*---新增收款明細end---*/}
					<hr className="lg" />
				{/*---收款明細列表start---*/}
					<h4 className="h4">收款明細</h4>
					<div className="table-header">
						【實收 <strong className="text-danger">${formatMoney(this.state.Total_Money,0)}</strong>】 { }
						【未收 <strong className="text-danger">${formatMoney(this.props.main_total-this.state.Total_Money,0)}</strong>】
					</div>
					<table className="table table-sm table-bordered table-striped">
								<thead>
									<tr>
										{editor_html}
										<th style={{"width":"15%;"}}>收款日期</th>
										<th style={{"width":"10%;"}} className="text-xs-center">收款餐別</th>
										<th style={{"width":"15%;"}}>收款人員</th>
										<th style={{"width":"10%;"}}>收款項目</th>
										<th style={{"width":"20%;"}}>收款單號</th>
										<th style={{"width":"20%;"}}>本次實收</th>
									</tr>
								</thead>
								<tbody>
									{
										this.state.gridSubData.map(function(itemData,i) {
											var button_html=null;
											if(gb_roles=='Managers'){
												button_html=(
													<td className="text-xs-center">
														<button className="btn btn-link btn-lg text-info" type="button" onClick={this.updateSubType.bind(this,itemData.accounts_payable_detail_id)}><i className="fa-pencil"></i></button> { }
														<button className="btn btn-link btn-lg text-danger" onClick={this.detailDeleteSubmit.bind(this,itemData.accounts_payable_detail_id)} disabled={this.props.is_close}><i className="fa-trash"></i></button>
													</td>
													);
											}								
											var detail_out_html = 
												<tr key={itemData.accounts_payable_detail_id}>
													{button_html}												
													<td>{moment(itemData.receipt_day).format('YYYY/MM/DD')}</td>
													<td className="text-xs-center"><StateForGrid stateData={CommData.MealTypeByAccountsPayable} id={itemData.meal_type} /></td>
													<td><StateForGrid stateData={CommData.ReceiptPersonType} id={itemData.receipt_person} /></td>
													<td><StateForGrid stateData={CommData.ReceiptItemType} id={itemData.receipt_item} /></td>
													<td>{itemData.receipt_sn}</td>
													<td>${formatMoney(itemData.actual_receipt,0)}</td>
												</tr>;
											return detail_out_html;
										}.bind(this))
									}
									<tr className="table-warning">
										<th className="text-xs-center text-danger" colSpan={editor_colspan}>總計</th>
										<th>未收：<span className="text-danger">${formatMoney(this.props.main_total-this.state.Total_Money,0)}</span></th>
										<th>實收：<span className="text-danger">${formatMoney(this.state.Total_Money,0)}</span></th>
									</tr>
								</tbody>
					</table>
				{/*---收款明細列表end---*/}

				</div>
			);

		return outHtml;
	}
});//電訪明細檔編輯
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
var dom = document.getElementById('page_content');
React.render(<GirdForm />, dom);
