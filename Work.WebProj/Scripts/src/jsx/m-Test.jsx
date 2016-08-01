

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
            li: ['nav-link active']
        };
    },
    getDefaultProps: function () {
        return {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPathName: gb_approot + 'api/Activity'
        };
    },
    componentDidMount: function () {

    },
    shouldComponentUpdate: function (nextProps, nextState) {
        return true;
    },
    render: function () {
        var outHtml = null;
        outHtml = (
<div>
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
                            a
                        </div>
                        <div className="tab-pane" id="Call" role="tabpanel">
                            b
                        </div>
                        <div className="tab-pane" id="Search" role="tabpanel">
                            c
                        </div>
     </div>


</div>);

        return outHtml;
    }
});

var dom = document.getElementById('page_content');
React.render(<GirdForm />, dom);