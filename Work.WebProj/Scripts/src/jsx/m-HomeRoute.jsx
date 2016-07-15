//主表單
var GirdForm = React.createClass({
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
            apiPathName: gb_approot + 'api/Draft'
        };
    },
    componentDidMount: function () {
        this.queryGridData(1);
    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
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
                                <div className="tab-pane active" id="Meal" role="tabpanel">
                                    用餐編號內容
                                </div>
                                <div className="tab-pane" id="Call" role="tabpanel">
                                    電訪紀錄內容
                                </div>
                                <div className="tab-pane" id="Search" role="tabpanel">
                                    快速搜尋內容
                                </div>
                           </div>

                    </div>
                    );
        return outHtml;
    }
});

var dom = document.getElementById('page_content');
React.render(<GirdForm />, dom); 