using Newtonsoft.Json;
using ProcCore;
using ProcCore.Business.DB0;
using ProcCore.HandleResult;
using ProcCore.WebCore;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
namespace DotWeb.Api
{
    public class GetActionController : BaseApiController
    {
        
        //public async Task<IHttpActionResult> GetCustomerVisit([FromUri]ParmGetCustomerVisit parm)
        //{
        //    db0 = getDB0();
        //    try
        //    {
        //        int page_size = 10;

        //        var items = from x in db0.VisitDetail
        //                    orderby x.start_time descending, x.customer_id
        //                    select (new CustomerVisit()
        //                    {
        //                        customer_name = x.Customer.customer_name,
        //                        visit_date = x.Visit.visit_date,
        //                        state = x.state,
        //                        visit_start = x.start_time,
        //                        visit_end = x.end_time,
        //                        cumulative_time = x.cumulative_time,
        //                        users_id = x.users_id,
        //                        user_name = ""
        //                    });
        //        #region 驗證業務端只能看到自己的資料
        //        var getRoles = db0.AspNetUsers.FirstOrDefault(x => x.Id == this.UserId).AspNetRoles.Select(x => x.Name);

        //        if (!getRoles.Contains("Admins") & !getRoles.Contains("Managers"))
        //        {
        //            items = items.Where(x => x.users_id == this.UserId);
        //        }
        //        #endregion
        //        if (parm.start_date != null && parm.end_date != null)
        //        {
        //            DateTime end = ((DateTime)parm.end_date).AddDays(1);
        //            items = items.Where(x => x.visit_date >= parm.start_date && x.visit_date < end);
        //        }
        //        if (parm.users_id != null)
        //        {
        //            items = items.Where(x => x.users_id == parm.users_id);
        //        }
        //        if (parm.customer_name != null)
        //        {
        //            items = items.Where(x => x.customer_name.Contains(parm.customer_name));
        //        }


        //        int page = (parm.page == 0 ? 1 : parm.page);
        //        int startRecord = PageCount.PageInfo(page, page_size, items.Count());
        //        var resultItems = await items.Skip(startRecord).Take(page_size).ToListAsync();

        //        foreach (var item in resultItems)
        //        {
        //            string User_Name = db0.AspNetUsers.FirstOrDefault(x => x.Id == item.users_id).user_name_c;
        //            item.user_name = User_Name;
        //        }


        //        return Ok(new
        //        {
        //            rows = resultItems,
        //            total = PageCount.TotalPage,
        //            page = PageCount.Page,
        //            records = PageCount.RecordCount,
        //            startcount = PageCount.StartCount,
        //            endcount = PageCount.EndCount
        //        });
        //    }
        //    finally
        //    {
        //        db0.Dispose();
        //    }
        //}

    }
    #region Parm
    public class ParmSetVisit
    {
        public int customer_id { get; set; }
        public DateTime visit_date { get; set; }
    }
    public class ParmRemoveVisit
    {
        public int visit_detail_id { get; set; }
    }
    public class ParmFinishVisit
    {
        public int visit_detail_id { get; set; }
        public IList<ParmProduct> proudcts { get; set; }
        public class ParmProduct
        {
            public int product_id { get; set; }
            public int price { get; set; }
            public string description { get; set; }
        }
    }
    public class ParmMapUsersProduct
    {
        public string users_id { get; set; }
        public int product_id { get; set; }
    }
    public class ParmMapAgentCustomer
    {
        public int agent_id { get; set; }
        public int customer_id { get; set; }
    }
    public class ParmSetUsersArea
    {
        public string users_id { get; set; }
        public int area_id { get; set; }
        public bool is_take { get; set; }
    }
    public class ParmSetCustomerAgent
    {
        public int customer_id { get; set; }
        public int agent_id { get; set; }
        public bool is_take { get; set; }
    }
    public class ParmMyCustomerQuery
    {
        public string city { get; set; }
        public string country { get; set; }
        public string word { get; set; }
        public int? area { get; set; }
        public int[] customers { get; set; }
    }
    public class ParmGetMyCustomer
    {
        public DateTime visit_date { get; set; }
        public int page { get; set; }
        public string city { get; set; }
        public string country { get; set; }
        public string word { get; set; }
    }
    public class PutPauseCustomer
    {
        public int visit_detail_id { get; set; }
    }
    public class ParmPostSetStockSelectProduct
    {
        public int stock_id { get; set; }
        public Products[] products { get; set; }

        public class Products
        {
            public int product_id { get; set; }
        }
    }
    public class ParmPostSetStockSelectCustomer
    {
        public int agent_id { get; set; }
        public int stock_id { get; set; }
        public int detail_id { get; set; }
        public Products[] products { get; set; }
        public Customers[] customers { get; set; }
        public class Products
        {
            public int stock_detail_id { get; set; }
            public int product_id { get; set; }
        }
        public class Customers
        {
            public int customer_id { get; set; }
        }
    }
    public class ParmGetStockDetail
    {
        public int stock_id { get; set; }


    }
    public class ParmUpdateVisit
    {
        public int visit_detail_id { get; set; }
        public int no_visit_reason { get; set; }
        public string memo { get; set; }

    }
    public class ParmPutStockQty
    {
        public int stock_detail_qty_id { get; set; }
        public int qty { get; set; }
    }
    public class ParmGetLeftCustomer
    {
        public int? agent_id { get; set; }
        public string name { get; set; }
        public int? area_id { get; set; }
        public string tw_city { get; set; }
        public string tw_country { get; set; }
    }
    public class ParmGetNextId : q_Customer
    {
        public int now_id { get; set; }
    }
    #endregion
}
