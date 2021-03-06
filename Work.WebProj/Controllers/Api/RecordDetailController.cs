﻿using DotWeb.Helpers;
using DotWeb.WebApp.Models;
using ProcCore;
using ProcCore.Business.DB0;
using ProcCore.HandleResult;
using ProcCore.WebCore;
using System;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;


namespace DotWeb.Api
{
    public class RecordDetailController : ajaxApi<RecordDetail, q_RecordDetail>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.RecordDetail.FindAsync(id);
                var getCustomerBorn = await db0.CustomerBorn.FindAsync(item.born_id);
                item.mom_name = getCustomerBorn.mom_name;
                item.sno = getCustomerBorn.sno;
                item.birthday = getCustomerBorn.birthday;
                item.tel_1 = getCustomerBorn.tel_1;
                item.tel_2 = getCustomerBorn.tel_2;
                item.tw_zip_1 = getCustomerBorn.tw_zip_1;
                item.tw_city_1 = getCustomerBorn.tw_city_1;
                item.tw_country_1 = getCustomerBorn.tw_country_1;
                item.tw_address_1 = getCustomerBorn.tw_address_1;
                item.tw_zip_2 = getCustomerBorn.tw_zip_2;
                item.tw_city_2 = getCustomerBorn.tw_city_2;
                item.tw_country_2 = getCustomerBorn.tw_country_2;
                item.tw_address_2 = getCustomerBorn.tw_address_2;

                if (item.product_type == (int)ProdyctType.PostnatalMeal)
                {
                    bool check_meal_start = db0.DailyMeal.Any(x => x.meal_day <= DateTime.Now &&
                                               x.record_deatil_id == id);
                    item.isMealStart = check_meal_start;
                    bool check_have_data = db0.DailyMeal.Any(x => x.record_deatil_id == id);
                    item.isDailyMealAdd = check_have_data;
                }
                r = new ResultInfo<RecordDetail>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_RecordDetail q)
        {
            #region 連接BusinessLogicLibary資料庫並取得資料

            using (db0 = getDB0())
            {
                var qr = db0.RecordDetail
                    .Where(x => x.product_type == (int)ProdyctType.PostnatalMeal & x.company_id == this.companyId)
                    .OrderByDescending(x => x.sell_day).AsQueryable();


                if (q.word != null)
                {
                    qr = qr.Where(x => x.CustomerBorn.mom_name.Contains(q.word) ||
                                       x.meal_id.Contains(q.word) ||
                                       x.CustomerBorn.sno.Contains(q.word) ||
                                       x.CustomerBorn.tel_1.Contains(q.word));
                }

                if (q.start_date != null && q.end_date != null)
                {//日期區間的比對
                    DateTime end = ((DateTime)q.end_date).AddDays(1);
                    qr = qr.Where(x => x.meal_start <= end && x.meal_end >= q.start_date);
                }

                if (q.born_id != null)
                {
                    qr = qr.Where(x => x.born_id == q.born_id);
                }
                var result = qr.Select(x => new m_RecordDetail()
                {
                    record_deatil_id = x.record_deatil_id,
                    product_record_id = x.product_record_id,
                    customer_id = x.customer_id,
                    born_id = x.born_id,
                    meal_id = x.meal_id,
                    mom_name = x.CustomerBorn.mom_name,
                    sno = x.CustomerBorn.sno,
                    tel_1 = x.CustomerBorn.tel_1,
                    meal_start = x.meal_start,
                    meal_end = x.meal_end
                });


                int page = (q.page == null ? 1 : (int)q.page);
                int position = PageCount.PageInfo(page, this.defPageSize, qr.Count());
                var segment = await result.Skip(position).Take(this.defPageSize).ToListAsync();

                return Ok<GridInfo<m_RecordDetail>>(new GridInfo<m_RecordDetail>()
                {
                    rows = segment,
                    total = PageCount.TotalPage,
                    page = PageCount.Page,
                    records = PageCount.RecordCount,
                    startcount = PageCount.StartCount,
                    endcount = PageCount.EndCount
                });
            }
            #endregion
        }
        public async Task<IHttpActionResult> Put([FromBody]RecordDetail md)
        {
            ResultInfo r = new ResultInfo();
            #region 試吃餐別陣列
            string[] tmp_tryout_mealtype = new string[] { };
            if (md.tryout_mealtype != null && md.tryout_mealtype.Length > 0)
            {
                tmp_tryout_mealtype = md.tryout_mealtype.Split(',');
            }
            #endregion
            try
            {
                db0 = getDB0();

                item = await db0.RecordDetail.FindAsync(md.record_deatil_id);

                #region 變更應收總額
                if (item.ProductRecord.is_receipt)
                {
                    //轉應收後,產品明細檔有變動就要更新應收
                    double getDetailTotal = db0.RecordDetail.Where(x => x.product_record_id == item.product_record_id).Sum(x => x.subtotal);
                    var getAccountsPayable = db0.AccountsPayable.Where(x => x.product_record_id == item.product_record_id).FirstOrDefault();
                    if (getAccountsPayable != null)
                    {
                        getAccountsPayable.estimate_payable = getDetailTotal + (md.subtotal - item.subtotal);
                        getAccountsPayable.trial_payable = getDetailTotal + (md.subtotal - item.subtotal);
                    }
                }
                #endregion

                //一般產品
                item.price = md.price;
                item.qty = md.qty;
                item.subtotal = md.subtotal;
                item.memo = md.memo;

                //用餐排程
                item.meal_start = md.meal_start;
                item.meal_end = md.meal_end;
                item.estimate_breakfast = md.estimate_breakfast;
                item.estimate_dinner = md.estimate_dinner;
                item.estimate_lunch = md.estimate_lunch;
                item.meal_memo = md.meal_memo;

                #region 修改用餐編號
                if (md.product_type == (int)ProdyctType.PostnatalMeal)
                {
                    item.tryout_mealtype = md.tryout_mealtype;
                    #region 驗證MealId
                    var getBorn = await db0.CustomerBorn.FindAsync(md.born_id);//更新生產紀錄用餐編號
                    if (md.meal_id != null & md.meal_id != getBorn.meal_id)
                    {//用餐編號有更新才驗證
                        bool check_exist = db0.MealID.Any(x => x.meal_id == md.meal_id & x.company_id == this.companyId);
                        if (!check_exist)
                        {
                            r.result = false;
                            r.message = Resources.Res.Log_Check_MealId_Exist;
                            return Ok(r);
                        }
                        var item_mealId = db0.MealID.Find(md.meal_id, this.companyId);
                        if (item_mealId.i_Use)
                        {
                            r.result = false;
                            r.message = Resources.Res.Log_Check_MealId_Use;
                            return Ok(r);
                        }
                        if (getBorn.meal_id != null)
                        {
                            var old_mealId = db0.MealID.Find(getBorn.meal_id, this.companyId);
                            old_mealId.i_Use = false;
                        }
                        item_mealId.i_Use = true;
                        #region use sql update
                        StringBuilder sb = new StringBuilder();
                        Log.Write("Start...");
                        var sqlt = @"Update DailyMeal
                                 Set meal_id='{0}'
                                Where record_deatil_id={1} And company_id={2};";
                        sb.AppendFormat(sqlt, md.meal_id
                                            , md.record_deatil_id
                                            , md.company_id);
                        Log.Write("Save...");
                        var t = await db0.Database.ExecuteSqlCommandAsync(sb.ToString());
                        sb.Clear();
                        Log.Write("End...");
                        Log.WriteToFile();
                        #endregion
                    }
                    #endregion
                    getBorn.meal_id = md.meal_id;
                    item.meal_id = md.meal_id;
                }
                #endregion

                #region 試吃用餐排程修改
                if (item.product_type == (int)ProdyctType.Tryout)
                {
                    item.tryout_mealtype = md.tryout_mealtype;
                    var getDailyMeal = db0.DailyMeal.Where(x => x.record_deatil_id == md.record_deatil_id).FirstOrDefault();
                    if (getDailyMeal != null)
                    {
                        getDailyMeal.meal_day = (DateTime)md.meal_start;

                        getDailyMeal.breakfast_state = md.tryout_mealtype == "breakfast" ? (int)MealState.CommonMeal : (int)MealState.CommonNotMeal;
                        getDailyMeal.lunch_state = md.tryout_mealtype == "lunch" ? (int)MealState.CommonMeal : (int)MealState.CommonNotMeal;
                        getDailyMeal.dinner_state = md.tryout_mealtype == "dinner" ? (int)MealState.CommonMeal : (int)MealState.CommonNotMeal;
                    }

                }
                #endregion

                #region 新增用餐排程資料
                if (md.product_type == (int)ProdyctType.PostnatalMeal & md.meal_start != null & md.meal_end != null & md.meal_id != null)
                {
                    //檢查先前是否有用餐排程資料
                    bool check_DailMeal = db0.DailyMeal.Any(x => x.record_deatil_id == md.record_deatil_id);
                    if (!check_DailMeal)//沒有才新增
                    {

                        DateTime start = DateTime.Parse(md.meal_start.ToString());
                        DateTime end = DateTime.Parse(md.meal_end.ToString());

                        int breakfast_state = (int)MealState.CommonMeal;
                        int lunch_state = (int)MealState.CommonMeal;
                        int dinner_state = (int)MealState.CommonMeal;

                        if (tmp_tryout_mealtype.Count() > 0)
                        {
                            breakfast_state = tmp_tryout_mealtype.Contains("breakfast") ? (int)MealState.CommonMeal : (int)MealState.CommonNotMeal;
                            lunch_state = tmp_tryout_mealtype.Contains("lunch") ? (int)MealState.CommonMeal : (int)MealState.CommonNotMeal;
                            dinner_state = tmp_tryout_mealtype.Contains("dinner") ? (int)MealState.CommonMeal : (int)MealState.CommonNotMeal;
                        }


                        var getDateSection = (end - start).TotalDays + 1;

                        #region 計算奇數及偶數天結束日期
                        int? start_index = null;
                        int? end_index = null;
                        if (md.meal_select_state == 1 || md.meal_select_state == 2)
                        {//奇數、偶數天用餐
                            for (int j = (int)(getDateSection - 1); j >= 0; j--)
                            {
                                var setDayObj = start.AddDays(j);
                                if (md.meal_select_state == 1 & setDayObj.Day % 2 != 0 & end_index == null)
                                {
                                    end_index = j;
                                    break;
                                }
                                else if (md.meal_select_state == 2 & setDayObj.Day % 2 == 0 & end_index == null)
                                {
                                    end_index = j;
                                    break;
                                }
                            }
                        }
                        else {
                            start_index = 0;
                            end_index = (int)(getDateSection - 1);
                        }
                        #endregion

                        for (int i = 0; i < getDateSection; i++)
                        {
                            var setDayObj = start.AddDays(i);

                            int breakfast_state_i = breakfast_state;
                            int lunch_state_i = lunch_state;
                            int dinner_state_i = dinner_state;

                            #region 特殊排餐

                            if (md.meal_select_state == 1)
                            {//奇數天用餐
                                #region 計算基數天的起始、結束
                                if (start_index == null & setDayObj.Day % 2 != 0)
                                {//起始奇數天
                                    start_index = i;
                                }
                                #endregion
                                if (setDayObj.Day % 2 == 0)
                                {
                                    breakfast_state_i = (int)MealState.CommonNotMeal;
                                    lunch_state_i = (int)MealState.CommonNotMeal;
                                    dinner_state_i = (int)MealState.CommonNotMeal;
                                }
                            }
                            else if (md.meal_select_state == 2)
                            {//偶數天用餐
                                #region 計算偶數天的起始、結束
                                if (start_index == null & setDayObj.Day % 2 == 0)
                                {//起始偶數天
                                    start_index = i;
                                }
                                #endregion
                                if (setDayObj.Day % 2 != 0)
                                {
                                    breakfast_state_i = (int)MealState.CommonNotMeal;
                                    lunch_state_i = (int)MealState.CommonNotMeal;
                                    dinner_state_i = (int)MealState.CommonNotMeal;
                                }
                            }
                            #endregion

                            #region 設定起始餐別、結束餐別
                            if (start_index == i & md.set_start_meal != null)
                            {
                                if (md.set_start_meal == (int)MealType.Lunch)
                                {//午開始
                                    breakfast_state_i = (int)MealState.CommonNotMeal;
                                }
                                else if (md.set_start_meal == (int)MealType.Dinner)
                                {//晚開始
                                    breakfast_state_i = (int)MealState.CommonNotMeal;
                                    lunch_state_i = (int)MealState.CommonNotMeal;
                                }
                            }
                            if (end_index == i & md.set_end_meal != null)
                            {
                                if (md.set_end_meal == (int)MealType.Breakfast)
                                {//早結束
                                    lunch_state_i = (int)MealState.CommonNotMeal;
                                    dinner_state_i = (int)MealState.CommonNotMeal;
                                }
                                else if (md.set_end_meal == (int)MealType.Lunch)
                                {//晚開始
                                    dinner_state_i = (int)MealState.CommonNotMeal;
                                }
                            }
                            #endregion

                            #region use sql insert
                            StringBuilder sb = new StringBuilder();
                            Log.Write("Start...");
                            var sqlt = @"insert into DailyMeal
                                (daily_meal_id, record_deatil_id, customer_id,born_id,meal_day,i_InsertUserID,i_InsertDateTime,i_InsertDeptID,product_type,meal_id,breakfast_state,lunch_state,dinner_state,company_id) 
                                values({0},{1},{2},{3},'{4}','{5}','{6}',{7},{8},'{9}',{10},{11},{12},{13});";
                            sb.AppendFormat(sqlt, GetNewId(ProcCore.Business.CodeTable.DailyMeal)
                                                , md.record_deatil_id
                                                , md.customer_id
                                                , md.born_id
                                                , setDayObj.ToString("yyyy/MM/dd HH:mm:ss")
                                                , this.UserId
                                                , DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss")
                                                , this.departmentId
                                                , md.product_type
                                                , md.meal_id
                                                , breakfast_state_i
                                                , lunch_state_i
                                                , dinner_state_i
                                                , this.companyId);
                            Log.Write("Save...");
                            var t = await db0.Database.ExecuteSqlCommandAsync(sb.ToString());
                            sb.Clear();
                            Log.Write("End...");
                            Log.WriteToFile();
                            #endregion
                        }
                    }
                }
                #endregion

                item.i_UpdateUserID = this.UserId;
                item.i_UpdateDateTime = DateTime.Now;
                item.i_UpdateDeptID = this.departmentId;


                await db0.SaveChangesAsync();
                r.result = true;
                r.id = md.customer_id;
            }
            catch (Exception ex)
            {
                r.result = false;
                r.message = ex.ToString();
            }
            finally
            {
                db0.Dispose();
            }
            return Ok(r);
        }
        public async Task<IHttpActionResult> Post([FromBody]RecordDetail md)
        {
            ResultInfo r = new ResultInfo();
            #region 試吃餐別陣列
            string[] tmp_tryout_mealtype = new string[] { };
            if (md.tryout_mealtype != null && md.tryout_mealtype.Length > 0)
            {
                tmp_tryout_mealtype = md.tryout_mealtype.Split(',');
            }
            #endregion
            md.record_deatil_id = GetNewId(ProcCore.Business.CodeTable.RecordDetail);
            if (!ModelState.IsValid)
            {
                r.message = ModelStateErrorPack();
                r.result = false;
                return Ok(r);
            }
            try
            {
                #region working a
                db0 = getDB0();
                #region 試吃、生產紀錄不重複驗證
                if (md.product_type == (int)ProdyctType.Tryout)
                {
                    //驗證一筆生產紀錄只能有一筆試吃
                    var check_Tryout = db0.RecordDetail.Any(x => x.born_id == md.born_id & x.product_type == (int)ProdyctType.Tryout);
                    if (check_Tryout)
                    {
                        r.result = false;
                        r.message = Resources.Res.Log_Check_RecordDetail_Tryout;
                        return Ok(r);
                    }
                }
                if (md.product_type == (int)ProdyctType.PostnatalMeal)
                {
                    //驗證一筆生產紀錄只能有一筆月子餐
                    //var check_PostnatalMeal = db0.RecordDetail.Any(x => x.born_id == md.born_id & x.product_type == (int)ProdyctType.PostnatalMeal);
                    //if (check_PostnatalMeal)
                    //{
                    //    r.result = false;
                    //    r.message = Resources.Res.Log_Check_RecordDetail_PostnatalMeal;
                    //    return Ok(r);
                    //}
                    md.estimate_breakfast = md.estimate_breakfast == null ? 0 : md.estimate_breakfast;
                    md.estimate_lunch = md.estimate_lunch == null ? 0 : md.estimate_lunch;
                    md.estimate_dinner = md.estimate_dinner == null ? 0 : md.estimate_dinner;

                    md.real_meal_start = md.meal_start;
                    md.real_meal_end = md.meal_end;
                    md.real_breakfast = md.estimate_breakfast;
                    md.real_lunch = md.estimate_lunch;
                    md.real_dinner = md.estimate_dinner;

                    md.real_estimate_meal_start = md.meal_start;
                    md.real_estimate_meal_end = md.meal_end;
                    md.real_estimate_breakfast = md.estimate_breakfast;
                    md.real_estimate_lunch = md.estimate_lunch;
                    md.real_estimate_dinner = md.estimate_dinner;

                    #region 檢查用餐編號
                    //if (md.meal_id == null)
                    //{
                    //    r.result = false;
                    //    r.message = Resources.Res.Log_Check_RecordDetail_Mealid;
                    //    return Ok(r);
                    //}
                    #region 驗證MealId
                    var getBorn = await db0.CustomerBorn.FindAsync(md.born_id);//更新生產紀錄用餐編號

                    if (md.meal_id != null & md.meal_id != getBorn.meal_id)
                    {
                        bool check_exist = db0.MealID.Any(x => x.meal_id == md.meal_id & x.company_id == this.companyId);
                        if (!check_exist)
                        {
                            r.result = false;
                            r.message = Resources.Res.Log_Check_MealId_Exist;
                            return Ok(r);
                        }

                        var item_mealId = db0.MealID.Find(md.meal_id, this.companyId);
                        if (item_mealId.i_Use)
                        {
                            r.result = false;
                            r.message = Resources.Res.Log_Check_MealId_Use;
                            return Ok(r);
                        }
                        if (getBorn.meal_id != null)
                        {
                            var old_mealId = db0.MealID.Find(getBorn.meal_id, this.companyId);
                            old_mealId.i_Use = false;
                        }
                        item_mealId.i_Use = true;
                        getBorn.meal_id = md.meal_id;
                    }
                    #endregion

                    //檢查用餐編號是否釋放過
                    md.is_release = false;
                    #endregion
                }
                #endregion


                #region 變更應收總額
                bool is_receipt = db0.ProductRecord.Where(x => x.product_record_id == md.product_record_id).FirstOrDefault().is_receipt;
                if (is_receipt)
                {
                    //轉應收後,產品明細檔有變動就要更新應收
                    double getDetailTotal = 0;
                    bool check_detail = db0.RecordDetail.Any(x => x.product_record_id == md.product_record_id);
                    if (check_detail)
                        getDetailTotal = db0.RecordDetail.Where(x => x.product_record_id == md.product_record_id).Sum(x => x.subtotal);

                    var getAccountsPayable = db0.AccountsPayable.Where(x => x.product_record_id == md.product_record_id).FirstOrDefault();
                    if (getAccountsPayable != null)
                    {
                        getAccountsPayable.estimate_payable = getDetailTotal + md.subtotal;
                        getAccountsPayable.trial_payable = getDetailTotal + md.subtotal;
                    }
                }
                #endregion

                md.sell_day = DateTime.Now;

                md.i_InsertUserID = this.UserId;
                md.i_InsertDateTime = DateTime.Now;
                md.i_InsertDeptID = this.departmentId;
                md.company_id = this.companyId;
                md.i_Lang = "zh-TW";
                db0.RecordDetail.Add(md);
                await db0.SaveChangesAsync();

                #region 新增用餐排程資料
                if (md.product_type == (int)ProdyctType.PostnatalMeal & md.meal_start != null & md.meal_end != null & md.meal_id != null)
                {
                    DateTime start = DateTime.Parse(md.meal_start.ToString());
                    DateTime end = DateTime.Parse(md.meal_end.ToString());

                    int breakfast_state = (int)MealState.CommonMeal;
                    int lunch_state = (int)MealState.CommonMeal;
                    int dinner_state = (int)MealState.CommonMeal;

                    if (tmp_tryout_mealtype.Count() > 0)
                    {
                        breakfast_state = tmp_tryout_mealtype.Contains("breakfast") ? (int)MealState.CommonMeal : (int)MealState.CommonNotMeal;
                        lunch_state = tmp_tryout_mealtype.Contains("lunch") ? (int)MealState.CommonMeal : (int)MealState.CommonNotMeal;
                        dinner_state = tmp_tryout_mealtype.Contains("dinner") ? (int)MealState.CommonMeal : (int)MealState.CommonNotMeal;
                    }


                    var getDateSection = (end - start).TotalDays + 1;

                    #region 計算奇數及偶數天結束日期
                    int? start_index = null;
                    int? end_index = null;
                    if (md.meal_select_state == 1 || md.meal_select_state == 2)
                    {//奇數、偶數天用餐
                        for (int j = (int)(getDateSection - 1); j >= 0; j--)
                        {
                            var setDayObj = start.AddDays(j);
                            if (md.meal_select_state == 1 & setDayObj.Day % 2 != 0 & end_index == null)
                            {
                                end_index = j;
                                break;
                            }
                            else if (md.meal_select_state == 2 & setDayObj.Day % 2 == 0 & end_index == null)
                            {
                                end_index = j;
                                break;
                            }
                        }
                    }
                    else {
                        start_index = 0;
                        end_index = (int)(getDateSection - 1);
                    }
                    #endregion


                    for (int i = 0; i < getDateSection; i++)
                    {
                        var setDayObj = start.AddDays(i);

                        int breakfast_state_i = breakfast_state;
                        int lunch_state_i = lunch_state;
                        int dinner_state_i = dinner_state;

                        #region 特殊排餐

                        if (md.meal_select_state == 1)
                        {//奇數天用餐
                            #region 計算基數天的起始、結束
                            if (start_index == null & setDayObj.Day % 2 != 0)
                            {//起始奇數天
                                start_index = i;
                            }
                            #endregion
                            if (setDayObj.Day % 2 == 0)
                            {
                                breakfast_state_i = (int)MealState.CommonNotMeal;
                                lunch_state_i = (int)MealState.CommonNotMeal;
                                dinner_state_i = (int)MealState.CommonNotMeal;
                            }
                        }
                        else if (md.meal_select_state == 2)
                        {//偶數天用餐
                            #region 計算偶數天的起始、結束
                            if (start_index == null & setDayObj.Day % 2 == 0)
                            {//起始偶數天
                                start_index = i;
                            }
                            #endregion
                            if (setDayObj.Day % 2 != 0)
                            {
                                breakfast_state_i = (int)MealState.CommonNotMeal;
                                lunch_state_i = (int)MealState.CommonNotMeal;
                                dinner_state_i = (int)MealState.CommonNotMeal;
                            }
                        }
                        #endregion

                        #region 設定起始餐別、結束餐別
                        if (start_index == i & md.set_start_meal != null)
                        {
                            if (md.set_start_meal == (int)MealType.Lunch)
                            {//午開始
                                breakfast_state_i = (int)MealState.CommonNotMeal;
                            }
                            else if (md.set_start_meal == (int)MealType.Dinner)
                            {//晚開始
                                breakfast_state_i = (int)MealState.CommonNotMeal;
                                lunch_state_i = (int)MealState.CommonNotMeal;
                            }
                        }
                        if (end_index == i & md.set_end_meal != null)
                        {
                            if (md.set_end_meal == (int)MealType.Breakfast)
                            {//早結束
                                lunch_state_i = (int)MealState.CommonNotMeal;
                                dinner_state_i = (int)MealState.CommonNotMeal;
                            }
                            else if (md.set_end_meal == (int)MealType.Lunch)
                            {//晚開始
                                dinner_state_i = (int)MealState.CommonNotMeal;
                            }
                        }
                        #endregion

                        #region use sql insert
                        StringBuilder sb = new StringBuilder();
                        Log.Write("Start...");
                        var sqlt = "insert into DailyMeal(daily_meal_id, record_deatil_id, customer_id,born_id,meal_day,i_InsertUserID,i_InsertDateTime,i_InsertDeptID,product_type,meal_id,breakfast_state,lunch_state,dinner_state,company_id) values({0},{1},{2},{3},'{4}','{5}','{6}',{7},{8},'{9}',{10},{11},{12},{13});";
                        sb.AppendFormat(sqlt, GetNewId(ProcCore.Business.CodeTable.DailyMeal)
                                            , md.record_deatil_id
                                            , md.customer_id
                                            , md.born_id
                                            , setDayObj.ToString("yyyy/MM/dd HH:mm:ss")
                                            , this.UserId
                                            , DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss")
                                            , this.departmentId
                                            , md.product_type
                                            , md.meal_id
                                            , breakfast_state_i
                                            , lunch_state_i
                                            , dinner_state_i
                                            , this.companyId);
                        Log.Write("Save...");
                        var t = await db0.Database.ExecuteSqlCommandAsync(sb.ToString());
                        sb.Clear();
                        Log.Write("End...");
                        Log.WriteToFile();
                        #endregion
                    }

                }
                #endregion

                #region 新增試吃排程資料
                if (md.product_type == (int)ProdyctType.Tryout & md.meal_start != null)
                {
                    DateTime start = DateTime.Parse(md.meal_start.ToString());

                    int breakfast_state = (int)MealState.CommonNotMeal;
                    int lunch_state = (int)MealState.CommonNotMeal;
                    int dinner_state = (int)MealState.CommonNotMeal;
                    if (md.tryout_mealtype == "breakfast")
                        breakfast_state = (int)MealState.CommonMeal;
                    if (md.tryout_mealtype == "lunch")
                        lunch_state = (int)MealState.CommonMeal;
                    if (md.tryout_mealtype == "dinner")
                        dinner_state = (int)MealState.CommonMeal;

                    #region use sql insert
                    StringBuilder sb = new StringBuilder();
                    Log.Write("Start...");
                    var sqlt = "insert into DailyMeal(daily_meal_id, record_deatil_id, customer_id,born_id,meal_day,i_InsertUserID,i_InsertDateTime,i_InsertDeptID,breakfast_state,lunch_state,dinner_state,product_type,company_id) values({0},{1},{2},{3},'{4}','{5}','{6}',{7},{8},{9},{10},{11},{12});";
                    sb.AppendFormat(sqlt, GetNewId(ProcCore.Business.CodeTable.DailyMeal)
                                        , md.record_deatil_id
                                        , md.customer_id
                                        , md.born_id
                                        , start.ToString("yyyy/MM/dd HH:mm:ss")
                                        , this.UserId
                                        , DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss")
                                        , this.departmentId
                                        , breakfast_state
                                        , lunch_state
                                        , dinner_state
                                        , md.product_type
                                        , this.companyId);
                    Log.Write("Save...");
                    var t = await db0.Database.ExecuteSqlCommandAsync(sb.ToString());
                    sb.Clear();
                    Log.Write("End...");
                    Log.WriteToFile();
                    #endregion

                }
                #endregion


                r.result = true;
                r.id = md.born_id;
                return Ok(r);
                #endregion
            }
            catch (DbEntityValidationException ex)
            {
                r.result = false;

                foreach (var m in ex.EntityValidationErrors)
                {

                    foreach (var n in m.ValidationErrors)
                    {
                        r.message += "[" + n.PropertyName + ":" + n.ErrorMessage + "]";
                    }
                }
                return Ok(r);
            }
            catch (Exception ex)
            {
                r.result = false;
                r.message = ex.Message;
                return Ok(r);
            }
            finally
            {
                db0.Dispose();
                //tx.Dispose();
            }
        }
        public async Task<IHttpActionResult> Delete([FromUri]int[] ids)
        {
            ResultInfo r = new ResultInfo();
            try
            {
                db0 = getDB0();

                #region 變更應收總額
                double getDetailTotal = 0;
                var getItem = db0.RecordDetail.Where(x => x.record_deatil_id == ids.FirstOrDefault()).First();
                if (getItem.ProductRecord.is_receipt)
                {
                    //轉應收後,產品明細檔有變動就要更新應收
                    bool check_detail = db0.RecordDetail.Any(x => x.product_record_id == getItem.product_record_id);
                    if (check_detail)
                        getDetailTotal = db0.RecordDetail.Where(x => x.product_record_id == getItem.product_record_id).Sum(x => x.subtotal);

                    var getAccountsPayable = db0.AccountsPayable.Where(x => x.product_record_id == getItem.product_record_id).FirstOrDefault();
                    if (getAccountsPayable != null)
                    {
                        getAccountsPayable.estimate_payable = getDetailTotal - getItem.subtotal;
                        getAccountsPayable.trial_payable = getDetailTotal - getItem.subtotal;
                    }
                }
                #endregion
                foreach (var id in ids)
                {
                    var item = db0.RecordDetail.Find(id);
                    if (item.product_type == (int)ProdyctType.PostnatalMeal & item.is_release != null)
                    {
                        if (item.meal_id != null & !(bool)item.is_release)
                        {
                            r.result = false;
                            r.message = Resources.Res.Log_Err_RDetail_Delete_release;
                            return Ok(r);
                        }
                    }

                    #region use sql delete
                    StringBuilder sb = new StringBuilder();
                    Log.Write("Start...");
                    var sqlt = "DELETE FROM DailyMealChangeRecord WHERE record_deatil_id = {0};DELETE FROM DailyMeal WHERE record_deatil_id = {0}; ";
                    sb.AppendFormat(sqlt, id);
                    Log.Write("Delete...");
                    var t = await db0.Database.ExecuteSqlCommandAsync(sb.ToString());
                    sb.Clear();
                    Log.Write("End...");
                    Log.WriteToFile();
                    #endregion

                    //item = new RecordDetail() { record_deatil_id = id };
                    //db0.RecordDetail.Attach(item);

                    db0.RecordDetail.Remove(item);
                }


                await db0.SaveChangesAsync();

                r.result = true;
                return Ok(r);
            }
            catch (DbUpdateException ex)
            {
                r.result = false;
                if (ex.InnerException != null)
                {
                    r.message = Resources.Res.Log_Err_Delete_DetailExist
                        + "\r\n" + getErrorMessage(ex);
                }
                else
                {
                    r.message = ex.Message;
                }
                return Ok(r);
            }
            catch (Exception ex)
            {
                r.result = false;
                r.message = ex.Message;
                return Ok(r);
            }
            finally
            {
                db0.Dispose();
            }
        }
    }
}
