using DotWeb.WebApp.Models;
using Newtonsoft.Json;
using ProcCore;
using ProcCore.Business.DB0;
using ProcCore.HandleResult;
using ProcCore.NetExtension;
using ProcCore.WebCore;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Transactions;
using System.Web;
using System.Web.Http;
using LinqKit;

namespace DotWeb.Api
{
    public class GetActionController : BaseApiController
    {
        #region 首頁-搜尋客戶
        [HttpGet]
        public async Task<IHttpActionResult> ta_CustomerBorn(string keyword)
        {
            db0 = getDB0();
            var item = await db0.CustomerBorn
                .OrderBy(x => x.born_id)
                .Where(x => x.mom_name.Contains(keyword) && x.company_id == this.companyId)
                .Select(x => new { x.mom_name, x.meal_id, x.tel_1, x.tw_city_1, x.tw_country_1, x.tw_address_1 })
                .Take(5).ToListAsync();

            return Ok(item);
        }
        #endregion
        #region 客戶生產-用餐編號選取
        public IHttpActionResult GetAllMealID([FromUri]GetAllMealIDParm q)
        {
            db0 = getDB0();
            try
            {
                var items = db0.MealID
                    .OrderBy(x => x.meal_id)
                    .Where(x => !x.i_Use & !x.i_Hide & x.company_id == this.companyId)
                    .Select(x => new { x.meal_id });

                if (q.keyword != null)
                {
                    items = items.Where(x => x.meal_id.StartsWith(q.keyword));
                }
                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        public async Task<IHttpActionResult> ChangeMealIDState([FromBody]ParmChangeMealID parm)
        {
            db0 = getDB0();
            try
            {
                var check_old = db0.MealID.Any(x => x.meal_id == parm.old_id & x.company_id == this.companyId);
                var check_new = db0.MealID.Any(x => x.meal_id == parm.new_id & !x.i_Use & x.company_id == this.companyId);

                if (!check_new)
                {//如果發先新id已被使用
                    return Ok(new { result = false, message = "此用餐編號已被使用!" });
                }
                if (check_old)
                {
                    var old_item = await db0.MealID.FindAsync(parm.old_id, this.companyId);
                    old_item.i_Use = false;//將舊id改回未使用狀態
                }
                var new_item = await db0.MealID.FindAsync(parm.new_id, this.companyId);
                new_item.i_Use = true;

                await db0.SaveChangesAsync();
                return Ok(new { result = true });
            }
            finally
            {
                db0.Dispose();
            }
        }
        public async Task<IHttpActionResult> CheckMealID([FromBody]ParmCheckMealID parm)
        {
            db0 = getDB0();
            try
            {
                bool check_born = db0.CustomerBorn.Any(x => x.born_id == parm.born_id & x.company_id == this.companyId);//先檢查此筆生產存不存在
                if (parm.meal_id != null)//有選用餐編號才改
                {
                    var meal_item = await db0.MealID.FindAsync(parm.meal_id, this.companyId);
                    if (!check_born || parm.born_id == null)
                    {
                        meal_item.i_Use = false;
                    }
                    else
                    {
                        var born_item = await db0.CustomerBorn.FindAsync(parm.born_id);
                        if (born_item.meal_id != parm.meal_id)
                        {
                            var old_item = await db0.MealID.FindAsync(born_item.meal_id, this.companyId);
                            if (old_item.i_Use)
                            {//如果舊id已經被其他人用
                                born_item.meal_id = parm.meal_id;//換成新id
                            }
                            else
                            {
                                old_item.i_Use = true;
                                meal_item.i_Use = false;
                            }
                        }

                    }

                    await db0.SaveChangesAsync();
                }

                return Ok(new { result = true });
            }
            finally
            {
                db0.Dispose();
            }
        }
        #endregion
        #region 客戶需求-用餐編號選取
        public IHttpActionResult GetNotCloseMealID(int? old_id, int? main_id)
        {
            db0 = getDB0();
            try
            {
                //過濾-已有客戶需求資料的客戶生產資料
                IQueryable<int> born_id = null;
                if (main_id != null)
                {
                    born_id = db0.CustomerNeed.Where(x => x.customer_need_id != main_id & x.company_id == this.companyId).Select(x => x.born_id);
                }
                else
                {
                    born_id = db0.CustomerNeed.Where(x => x.company_id == this.companyId).Select(x => x.born_id);
                }

                var items = db0.CustomerBorn
                    .OrderBy(x => x.meal_id)
                    .Where(x => !x.is_close & !born_id.Contains(x.born_id) & x.company_id == this.companyId)
                    .Select(x => new { x.customer_id, x.born_id, x.meal_id, x.mom_name, x.born_frequency });

                if (old_id != null)
                {
                    items = items.Where(x => x.born_id != old_id);//過濾目前選取的客戶生產資料id
                }

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetBornData(int born_id)
        {
            db0 = getDB0();
            try
            {
                var items = db0.CustomerBorn.Find(born_id);

                return Ok(items);
            }
            finally
            {
                db0.Dispose();
            }
        }
        #endregion
        #region 產品銷售資料主檔-客戶生產選取
        public IHttpActionResult GetAllBorn([FromUri]ParmGetAllBorn parm)
        {
            db0 = getDB0();
            try
            {

                var items = db0.CustomerBorn
                    .Where(x => x.company_id == this.companyId)
                    .OrderBy(x => new { x.customer_id, x.meal_id })
                    .Select(x => new
                    {
                        x.customer_id,
                        x.born_id,
                        x.Customer.customer_sn,
                        x.Customer.customer_name,
                        x.meal_id,
                        x.mom_name,
                        x.born_frequency,
                        x.Customer.customer_type,//客戶類別
                        x.tel_1,
                        x.memo,
                        x.expected_born_day//預產期
                    });

                if (parm.customer_type != null)
                {
                    items = items.Where(x => x.customer_type == parm.customer_type);
                }
                if (parm.is_meal != null)
                {
                    if ((bool)parm.is_meal)
                    {
                        items = items.Where(x => x.meal_id != null);
                    }
                    else
                    {
                        items = items.Where(x => x.meal_id == null);
                    }

                }
                if (parm.word != null)
                {
                    items = items.Where(x => x.customer_name.Contains(parm.word) || x.mom_name.Contains(parm.word) || x.meal_id.Contains(parm.word));
                }

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetCustomerAndBorn(int customer_id, int born_id)
        {
            db0 = getDB0();
            try
            {
                var getBorn = db0.CustomerBorn.Find(born_id);
                var getCustomer = db0.Customer.Find(customer_id);

                return Ok(new { getBorn = getBorn, getCustomer = getCustomer });
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpPost]
        public async Task<IHttpActionResult> closeRecord([FromBody]ParmCloseRecord parm)
        {
            ResultInfo r = new ResultInfo();
            db0 = getDB0();
            try
            {
                var getRecord = await db0.ProductRecord.FindAsync(parm.main_id);//產品銷售主檔
                //檢查是否有未釋放的用餐編號
                var check_release = db0.RecordDetail.Any(x => x.product_record_id == getRecord.product_record_id &&
                                                            x.is_release == false);

                if (check_release)
                {//如果有的話,提醒先釋放用餐編號在結案
                    r.result = false;
                    r.message = Resources.Res.Log_Err_PRecord_Close_Mealid;
                    return Ok(r);
                }
                getRecord.is_close = true;

                await db0.SaveChangesAsync();

                r.result = true;
                r.id = parm.main_id;
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
        [HttpPost]
        public async Task<IHttpActionResult> insertAccountsPayable([FromBody]ParminsertAccountsPayable parm)
        {
            ResultInfo r = new ResultInfo();
            db0 = getDB0();
            try
            {
                var getRecord = await db0.ProductRecord.FindAsync(parm.product_record_id);//產品銷售主檔
                double getDetailTotal = 0;
                bool check_detail = db0.RecordDetail.Any(x => x.product_record_id == parm.product_record_id);
                if (check_detail)
                    getDetailTotal = db0.RecordDetail.Where(x => x.product_record_id == parm.product_record_id).Sum(x => x.subtotal);

                #region 產生應收帳款主檔
                var item = db0.AccountsPayable.Where(x => x.product_record_id == parm.product_record_id).FirstOrDefault();
                if (item == null)
                {
                    item = new AccountsPayable()
                    {
                        accounts_payable_id = GetNewId(ProcCore.Business.CodeTable.AccountsPayable),
                        product_record_id = parm.product_record_id,
                        customer_id = parm.customer_id,
                        record_sn = parm.record_sn,
                        estimate_payable = getDetailTotal,
                        trial_payable = getDetailTotal,
                        i_InsertUserID = this.UserId,
                        i_InsertDateTime = DateTime.Now,
                        i_InsertDeptID = this.departmentId,
                        company_id = this.companyId,
                        i_Lang = "zh-TW"
                    };
                    db0.AccountsPayable.Add(item);
                }
                #endregion

                getRecord.is_receipt = true;

                await db0.SaveChangesAsync();

                r.result = true;
                r.id = parm.product_record_id;
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
        /// <summary>
        /// admin 才有權限修改回未結案狀態
        /// </summary>
        /// <param name="parm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IHttpActionResult> openRecord([FromBody]ParmCloseRecord parm)
        {
            ResultInfo r = new ResultInfo();
            db0 = getDB0();
            try
            {
                var getRecord = await db0.ProductRecord.FindAsync(parm.main_id);//產品銷售主檔

                getRecord.is_close = false;

                await db0.SaveChangesAsync();

                r.result = true;
                r.id = parm.main_id;
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
        #endregion
        #region 產品銷售資料明細檔
        public IHttpActionResult GetAllProduct([FromUri]ParmProductSelect parm)
        {
            db0 = getDB0();
            try
            {
                //檢查此筆生產紀錄是否已有"試吃"及"月子餐"
                var check_Tryout = db0.RecordDetail.Any(x => x.born_id == parm.born_id & x.product_type == (int)ProdyctType.Tryout);
                //var check_PostnatalMeal = db0.RecordDetail.Any(x => x.born_id == parm.born_id & x.product_type == (int)ProdyctType.PostnatalMeal);

                var items = db0.Product
                    .OrderBy(x => new { x.sort })
                    .Where(x => !x.i_Hide & x.company_id == this.companyId)
                    .Select(x => new { x.product_id, x.product_name, x.product_type, x.price, x.standard, x.meal_type, x.breakfast_price, x.lunch_price, x.dinner_price });

                if (parm.name != null)
                {
                    items = items.Where(x => x.product_name.Contains(parm.name));
                }
                if (parm.product_type != null)
                {
                    items = items.Where(x => x.product_type == parm.product_type);
                }
                if (check_Tryout)
                {//已有試吃,將不列出試吃產品
                    items = items.Where(x => x.product_type != (int)ProdyctType.Tryout);
                }
                //if (check_PostnatalMeal)
                //{//已有月子餐,將不列出月子餐產品
                //    items = items.Where(x => x.product_type != (int)ProdyctType.PostnatalMeal);
                //}

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetAllRecordDetail([FromUri]q_RecordDetail q)
        {
            db0 = getDB0();
            try
            {
                var qr = db0.RecordDetail
                             .OrderByDescending(x => x.sell_day)
                             .Where(x => x.product_record_id == q.main_id & x.company_id == this.companyId)
                             .Select(x => new m_RecordDetail()
                             {
                                 product_record_id = x.product_record_id,
                                 record_deatil_id = x.record_deatil_id,
                                 product_name = x.product_name,
                                 product_type = x.product_type,
                                 price = x.price,
                                 qty = x.qty,
                                 subtotal = x.subtotal
                             }).AsQueryable();

                return Ok(qr.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpPost]
        public async Task<IHttpActionResult> releaseMealID([FromBody]ParmReleaseMealID parm)
        {
            ResultInfo r = new ResultInfo();
            db0 = getDB0();
            try
            {
                var getRecordDetail = await db0.RecordDetail.FindAsync(parm.record_deatil_id);//產品銷售明細檔
                var getMealID = await db0.MealID.FindAsync(parm.meal_id, this.companyId);//用餐編號
                var getBorn = await db0.CustomerBorn.FindAsync(getRecordDetail.born_id);//生產紀錄

                var end_dailymeal = db0.DailyMeal.Where(x => x.record_deatil_id == getRecordDetail.record_deatil_id & (x.breakfast_state > 0 || x.dinner_state > 0 || x.lunch_state > 0))
                                .OrderByDescending(x => x.meal_day).FirstOrDefault();
                if (end_dailymeal != null)
                {
                    DateTime end = end_dailymeal.meal_day;
                    end = end.AddDays(1);
                    if (DateTime.Now < end)
                    {//未用餐完畢,不可釋放用餐編號
                        r.result = false;
                        r.message = Resources.Res.Log_Check_RecordDetail_MealEnd;
                        return Ok(r);
                    }
                }

                if (getRecordDetail.is_release == false)
                {
                    getBorn.meal_id = null;
                    getMealID.i_Use = false;
                    getRecordDetail.is_release = true;
                }

                await db0.SaveChangesAsync();

                r.result = true;
                r.id = parm.record_deatil_id;
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
        #endregion
        #region 禮品贈送紀錄-取得贈品活動list
        public IHttpActionResult GetAllActivity()
        {
            db0 = getDB0();
            try
            {
                var items = db0.Activity
                    .OrderByDescending(x => x.sort)
                    .Where(x => !x.i_Hide & x.company_id == this.companyId)
                    .Select(x => new option() { val = x.activity_id, Lname = x.activity_name });

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetAllRecord([FromUri]ParmGetAllRecord parm)
        {
            db0 = getDB0();
            try
            {
                //一筆生產紀錄只能有一筆禮品贈送紀錄
                var born_id = db0.GiftRecord.Where(x => x.company_id == this.companyId).Select(x => x.born_id).AsQueryable();

                var items = db0.ProductRecord
                    .OrderByDescending(x => x.record_day)
                    .Where(x => !born_id.Contains(x.born_id) & x.company_id == this.companyId)
                    .Select(x => new
                    {
                        x.product_record_id,
                        x.record_sn,
                        x.customer_id,
                        x.born_id,
                        x.Customer.customer_name,
                        x.CustomerBorn.mom_name,
                        x.is_close,
                        x.CustomerBorn.born_frequency,
                        x.record_day,
                        x.CustomerBorn.tel_1,
                        x.CustomerBorn.tel_2,
                        x.CustomerBorn.sno,
                        x.CustomerBorn.birthday,
                        x.CustomerBorn.tw_zip_1,
                        x.CustomerBorn.tw_zip_2,
                        x.CustomerBorn.tw_city_1,
                        x.CustomerBorn.tw_city_2,
                        x.CustomerBorn.tw_country_1,
                        x.CustomerBorn.tw_country_2,
                        x.CustomerBorn.tw_address_1,
                        x.CustomerBorn.tw_address_2
                    });

                if (parm.old_id != null)
                {
                    items = items.Where(x => x.product_record_id != parm.old_id);//過濾目前已選擇的id
                }
                if (parm.is_close != null)
                {
                    items = items.Where(x => x.is_close == parm.is_close);
                }
                if (parm.word != null)
                {
                    items = items.Where(x => x.record_sn.Contains(parm.word) ||
                                            x.mom_name.Contains(parm.word) ||
                                            x.customer_name.Contains(parm.word) ||
                                            x.sno.Contains(parm.word));
                }
                if (parm.start_date != null && parm.end_date != null)
                {
                    DateTime end = ((DateTime)parm.end_date).AddDays(1);
                    items = items.Where(x => x.record_day >= parm.start_date && x.record_day < end);
                }
                if (parm.born_id != null)
                {
                    items = items.Where(x => x.born_id == parm.born_id);
                }

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        #endregion
        #region 每日電訪排程
        public IHttpActionResult GetScheduleDetail(int main_id)
        {
            #region 連接BusinessLogicLibary資料庫並取得資料

            using (db0 = getDB0())
            {
                var qr = db0.ScheduleDetail
                             .OrderBy(x => x.tel_day)
                             .Where(x => x.schedule_id == main_id & x.company_id == this.companyId)
                             .Select(x => new m_ScheduleDetail()
                             {
                                 schedule_detail_id = x.schedule_detail_id,
                                 schedule_id = x.schedule_id,
                                 tel_day = x.tel_day,
                                 tel_reason = x.tel_reason
                             }).AsQueryable();
                return Ok(qr.ToList());
            }
            #endregion
        }
        #endregion
        #region 用餐排程
        public IHttpActionResult GetMealCalendar([FromUri]ParmGetMealCalendar parm)
        {
            MonthObject Mobj = null;
            DateTime standard_day = DateTime.Parse(parm.year + "/" + parm.month + "/1");//基準日期(以此天為標準產生月曆)

            using (db0 = getDB0())
            {

                //取得該月第一天及最後一天
                var getCalendarFirstDay = standard_day.CalendarFirstDay();
                var getCalendarLastDay = standard_day.CalendarLastDay();

                //取得該月天數
                var getDateSection = (getCalendarLastDay - getCalendarFirstDay).TotalDays + 1;

                var Yesterday = DateTime.Parse(DateTime.Now.ToShortDateString()).AddDays(-1);
                bool check_meal_start = db0.DailyMeal.Any(x => x.meal_day < Yesterday &&
                                             x.record_deatil_id == parm.record_deatil_id);

                Mobj = new MonthObject()
                {
                    year = standard_day.Year,
                    month = standard_day.Month,
                    isMealStart = check_meal_start
                };

                List<WeekObject> wObj = new List<WeekObject>();
                WeekObject weekObject = null;
                List<DayObject> dObj = new List<DayObject>();



                for (int i = 0; i < getDateSection; i++)
                {
                    var setDayObj = getCalendarFirstDay.AddDays(i);

                    if (setDayObj.DayOfWeek == DayOfWeek.Sunday) //遇到星期日 要製作新的Week物件
                    {
                        if (dObj.Count() > 0) //製作Week物件時 要將之前的資料取出來，但第一排第一天這時是不會有日期資料
                        {
                            weekObject.dayInfo = dObj.ToArray();
                            dObj.Clear();
                            wObj.Add(weekObject);
                        }

                        weekObject = new WeekObject(); //產生新的week物件
                    }
                    var check_meal = db0.DailyMeal.Where(x => x.meal_day.Year == setDayObj.Year &&
                                                             x.meal_day.Month == setDayObj.Month &&
                                                             x.meal_day.Day == setDayObj.Day &&
                                                             x.record_deatil_id == parm.record_deatil_id).FirstOrDefault();
                    bool haveMeal = false;
                    MealState bState = MealState.NotShow, lState = MealState.NotShow, dState = MealState.NotShow;
                    int? daily_meal_id = null;
                    if (check_meal != null)
                    {
                        haveMeal = true;
                        bState = (MealState)check_meal.breakfast_state;
                        lState = (MealState)check_meal.lunch_state;
                        dState = (MealState)check_meal.dinner_state;
                        daily_meal_id = check_meal.daily_meal_id;
                    }
                    dObj.Add(new DayObject()
                    {
                        meal_day = setDayObj,
                        isNowMonth = (setDayObj >= standard_day.MonthFirstDay() && setDayObj <= standard_day.MonthLastDay()),
                        isHaveMeal = haveMeal,
                        breakfast = bState,
                        lunch = lState,
                        dinner = dState,
                        record_deatil_id = parm.record_deatil_id,
                        daily_meal_id = daily_meal_id
                    });
                }

                if (dObj.Count() > 0)
                {
                    weekObject.dayInfo = dObj.ToArray();
                    dObj.Clear();
                    wObj.Add(weekObject);
                }

                Mobj.weekInfo = wObj.ToArray();

                return Ok(Mobj);
            }
        }
        [HttpPost]
        public async Task<IHttpActionResult> PostDailyMealState([FromBody]ParmPostDailyMealState parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = await db0.DailyMeal.FindAsync(parm.daily_meal_id);
                var RecordDetailItem = await db0.RecordDetail.FindAsync(parm.record_deatil_id);

                var Yesterday = DateTime.Parse(DateTime.Now.ToShortDateString()).AddDays(-1);
                bool check_meal_start = db0.DailyMeal.Any(x => x.meal_day <= Yesterday &&
                                                               x.record_deatil_id == parm.record_deatil_id);
                #region 早餐
                RecordDetailItem.real_breakfast = db0.DailyMeal.Where(x => x.record_deatil_id == parm.record_deatil_id & x.breakfast_state > 0).Count();
                if (parm.meal_type == (int)MealType.Breakfast)
                {
                    item.breakfast_state = parm.meal_state;
                    if (parm.meal_state > 0)//增餐
                    {
                        RecordDetailItem.real_breakfast += 1;
                    }
                    else if (parm.meal_state < 0)//減餐
                    {
                        RecordDetailItem.real_breakfast += -1;
                    }

                    if (!check_meal_start)
                    {
                        RecordDetailItem.real_estimate_breakfast = RecordDetailItem.real_breakfast;
                    }
                    else
                    {//開始用餐後變動新增異動紀錄
                        int change_type = parm.meal_state > 0 ? 1 : -1;
                        var changeRecord = new DailyMealChangeRecord()
                        {
                            change_record_id = GetNewId(ProcCore.Business.CodeTable.DailyMealChangeRecord),
                            daily_meal_id = parm.daily_meal_id,
                            record_deatil_id = parm.record_deatil_id,
                            change_time = DateTime.Now,
                            meal_day = item.meal_day,
                            meal_type = parm.meal_type,
                            change_type = change_type,
                            i_InsertUserID = this.UserId,
                            i_InsertDateTime = DateTime.Now,
                            i_InsertDeptID = this.departmentId,
                            company_id = this.companyId,
                            i_Lang = "zh-TW"
                        };
                        db0.DailyMealChangeRecord.Add(changeRecord);
                    }
                }
                #endregion
                #region 午餐
                RecordDetailItem.real_lunch = db0.DailyMeal.Where(x => x.record_deatil_id == parm.record_deatil_id & x.lunch_state > 0).Count();
                if (parm.meal_type == (int)MealType.Lunch)
                {
                    item.lunch_state = parm.meal_state;
                    if (parm.meal_state > 0)//增餐
                    {
                        RecordDetailItem.real_lunch += 1;
                    }
                    else if (parm.meal_state < 0)//減餐
                    {
                        RecordDetailItem.real_lunch += -1;
                    }
                    if (!check_meal_start)
                    {
                        RecordDetailItem.real_estimate_lunch = RecordDetailItem.real_lunch;
                    }
                    else
                    {//開始用餐後變動新增異動紀錄
                        int change_type = parm.meal_state > 0 ? 1 : -1;
                        var changeRecord = new DailyMealChangeRecord()
                        {
                            change_record_id = GetNewId(ProcCore.Business.CodeTable.DailyMealChangeRecord),
                            daily_meal_id = parm.daily_meal_id,
                            record_deatil_id = parm.record_deatil_id,
                            change_time = DateTime.Now,
                            meal_day = item.meal_day,
                            meal_type = parm.meal_type,
                            change_type = change_type,
                            i_InsertUserID = this.UserId,
                            i_InsertDateTime = DateTime.Now,
                            i_InsertDeptID = this.departmentId,
                            company_id = this.companyId,
                            i_Lang = "zh-TW"
                        };
                        db0.DailyMealChangeRecord.Add(changeRecord);
                    }
                }
                #endregion
                #region 晚餐
                RecordDetailItem.real_dinner = db0.DailyMeal.Where(x => x.record_deatil_id == parm.record_deatil_id & x.dinner_state > 0).Count();
                if (parm.meal_type == (int)MealType.Dinner)
                {
                    item.dinner_state = parm.meal_state;
                    if (parm.meal_state > 0)//增餐
                    {
                        RecordDetailItem.real_dinner += 1;
                    }
                    else if (parm.meal_state < 0)//減餐
                    {
                        RecordDetailItem.real_dinner += -1;
                    }
                    if (!check_meal_start)
                    {
                        RecordDetailItem.real_estimate_dinner = RecordDetailItem.real_dinner;
                    }
                    else
                    {//開始用餐後變動新增異動紀錄
                        int change_type = parm.meal_state > 0 ? 1 : -1;
                        var changeRecord = new DailyMealChangeRecord()
                        {
                            change_record_id = GetNewId(ProcCore.Business.CodeTable.DailyMealChangeRecord),
                            daily_meal_id = parm.daily_meal_id,
                            record_deatil_id = parm.record_deatil_id,
                            change_time = DateTime.Now,
                            meal_day = item.meal_day,
                            meal_type = parm.meal_type,
                            change_type = change_type,
                            i_InsertUserID = this.UserId,
                            i_InsertDateTime = DateTime.Now,
                            i_InsertDeptID = this.departmentId,
                            company_id = this.companyId,
                            i_Lang = "zh-TW"
                        };
                        db0.DailyMealChangeRecord.Add(changeRecord);
                    }
                }
                #endregion

                double old_subtotal = RecordDetailItem.subtotal;

                #region 變更產品數量
                double b_point = 0, l_point = 0, d_point = 0;//餐別計算點數
                var product = db0.Product.Find(RecordDetailItem.product_id);
                b_point = Math.Round(product.breakfast_price / product.price, 4);
                l_point = Math.Round(product.lunch_price / product.price, 4);
                d_point = Math.Round(product.dinner_price / product.price, 4);

                RecordDetailItem.qty = Math.Round((double)RecordDetailItem.real_breakfast * b_point + (double)RecordDetailItem.real_lunch * l_point + (double)RecordDetailItem.real_dinner * d_point, 4);
                RecordDetailItem.subtotal = Math.Round(RecordDetailItem.qty * RecordDetailItem.price);
                #endregion

                #region 變更應收帳款
                if (RecordDetailItem.ProductRecord.is_receipt)
                {
                    //轉應收後,產品明細檔有變動就要更新應收
                    double getDetailTotal = 0;
                    bool check_detail = db0.RecordDetail.Any(x => x.product_record_id == RecordDetailItem.product_record_id);
                    if (check_detail)
                        getDetailTotal = db0.RecordDetail.Where(x => x.product_record_id == RecordDetailItem.product_record_id).Sum(x => x.subtotal);

                    var getAccountsPayable = db0.AccountsPayable.Where(x => x.product_record_id == RecordDetailItem.product_record_id).FirstOrDefault();
                    if (getAccountsPayable != null)
                    {
                        getAccountsPayable.estimate_payable = getDetailTotal + (RecordDetailItem.subtotal - old_subtotal);
                        getAccountsPayable.trial_payable = getDetailTotal + (RecordDetailItem.subtotal - old_subtotal);
                    }
                }
                #endregion


                await db0.SaveChangesAsync();

                r.result = true;
                r.id = RecordDetailItem.record_deatil_id;
                return Ok(r);
                #endregion
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
        [HttpPost]
        public async Task<IHttpActionResult> AddDailyMeal([FromBody]ParmAddDailyMeal parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = db0.DailyMeal.Where(x => x.record_deatil_id == parm.record_deatil_id && x.meal_day == parm.meal_day).FirstOrDefault();
                var RecordDetailItem = await db0.RecordDetail.FindAsync(parm.record_deatil_id);

                var Yesterday = DateTime.Parse(DateTime.Now.ToShortDateString()).AddDays(-1);
                bool check_meal_start = db0.DailyMeal.Any(x => x.meal_day <= Yesterday &&
                                                               x.record_deatil_id == parm.record_deatil_id);
                //先前日期,先開放可以加
                if (item == null)//& DateTime.Now <= parm.meal_day
                {
                    item = new DailyMeal()
                    {
                        daily_meal_id = GetNewId(ProcCore.Business.CodeTable.DailyMeal),
                        record_deatil_id = parm.record_deatil_id,
                        customer_id = parm.customer_id,
                        born_id = parm.born_id,
                        meal_id = RecordDetailItem.meal_id,
                        product_type = RecordDetailItem.product_type,
                        meal_day = parm.meal_day,
                        breakfast_state = (int)MealState.CommonNotMeal,
                        lunch_state = (int)MealState.CommonNotMeal,
                        dinner_state = (int)MealState.CommonNotMeal,
                        i_InsertUserID = this.UserId,
                        i_InsertDateTime = DateTime.Now,
                        i_InsertDeptID = this.departmentId,
                        company_id = this.companyId,
                        i_Lang = "zh-TW"
                    };
                    db0.DailyMeal.Add(item);
                    #region 變更實際(實訂)用餐起日及迄日
                    #region 實訂
                    if (!check_meal_start)
                    {
                        if (RecordDetailItem.real_estimate_meal_start >= parm.meal_day)
                            RecordDetailItem.real_estimate_meal_start = parm.meal_day;

                        if (RecordDetailItem.real_estimate_meal_end <= parm.meal_day)
                            RecordDetailItem.real_estimate_meal_end = parm.meal_day;

                    }
                    #endregion
                    #region 實際
                    if (RecordDetailItem.real_meal_start >= parm.meal_day)
                        RecordDetailItem.real_meal_start = parm.meal_day;

                    if (RecordDetailItem.real_meal_end <= parm.meal_day)
                        RecordDetailItem.real_meal_end = parm.meal_day;
                    #endregion
                    #endregion

                }

                await db0.SaveChangesAsync();

                r.result = true;
                r.id = item.daily_meal_id;
                return Ok(r);
                #endregion
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
        public IHttpActionResult GetChangeRecord(int record_deatil_id)
        {

            using (db0 = getDB0())
            {
                bool isHaveRecord = false;
                var items = db0.DailyMealChangeRecord.Where(x => x.record_deatil_id == record_deatil_id).ToList();
                foreach (var item in items)
                {
                    string user_name = db0.AspNetUsers.Where(x => x.Id == item.i_InsertUserID).FirstOrDefault().user_name_c;
                    item.user_name = user_name;
                }

                if (items.Count() > 0)
                    isHaveRecord = true;

                return Ok(new { isHaveRecord = isHaveRecord, Data = items });
            }
        }
        public IHttpActionResult GetRecordDetail(int record_deatil_id)
        {

            using (db0 = getDB0())
            {
                #region 訂餐日期及餐數異動紀錄
                var item = db0.RecordDetail.Where(x => x.record_deatil_id == record_deatil_id)
                                           .Select(x => new m_RecordDetail()
                                           {
                                               meal_start = x.meal_start,
                                               real_estimate_meal_start = x.real_estimate_meal_start,
                                               real_meal_start = x.real_meal_start,
                                               meal_end = x.meal_end,
                                               real_estimate_meal_end = x.real_estimate_meal_end,
                                               real_meal_end = x.real_meal_end,
                                               estimate_breakfast = x.estimate_breakfast,
                                               estimate_lunch = x.estimate_lunch,
                                               estimate_dinner = x.estimate_dinner,
                                               real_estimate_breakfast = x.real_estimate_breakfast,
                                               real_estimate_lunch = x.real_estimate_lunch,
                                               real_estimate_dinner = x.real_estimate_dinner,
                                               real_breakfast = x.real_breakfast,
                                               real_lunch = x.real_lunch,
                                               real_dinner = x.real_dinner
                                           }).FirstOrDefault();
                #endregion

                int pause_meal = 0, add_meal = 0, estimate_total = 0, real_total = 0, already_eat = 0;
                estimate_total = ((int)item.estimate_breakfast + (int)item.estimate_lunch + (int)item.estimate_dinner);
                real_total = ((int)item.real_breakfast + (int)item.real_lunch + (int)item.real_dinner);
                #region 增餐&停餐&已吃
                var getDailyMeal = db0.DailyMeal.Where(x => x.record_deatil_id == record_deatil_id).ToList();
                var Yesterday = DateTime.Parse(DateTime.Now.ToShortDateString()).AddDays(-1);
                foreach (var i in getDailyMeal)
                {
                    #region 已吃
                    if (i.meal_day <= Yesterday)
                    {
                        if (i.breakfast_state > 0)
                            already_eat++;
                        if (i.lunch_state > 0)
                            already_eat++;
                        if (i.dinner_state > 0)
                            already_eat++;
                    }
                    #endregion
                    #region 增餐
                    if (i.breakfast_state == (int)MealState.AddMeal)
                        add_meal++;
                    if (i.lunch_state == (int)MealState.AddMeal)
                        add_meal++;
                    if (i.dinner_state == (int)MealState.AddMeal)
                        add_meal++;
                    #endregion
                    #region 停餐
                    if (i.breakfast_state == (int)MealState.PauseMeal)
                        pause_meal++;
                    if (i.lunch_state == (int)MealState.PauseMeal)
                        pause_meal++;
                    if (i.dinner_state == (int)MealState.PauseMeal)
                        pause_meal++;
                    #endregion
                }
                #endregion

                var meal_count = new MealTotalCount()
                {
                    add_meal = add_meal,
                    pause_meal = pause_meal,
                    estimate_total = estimate_total,
                    real_total = real_total,
                    already_eat = already_eat,
                    not_eat = real_total - already_eat
                };
                return Ok(new { meal_count = meal_count, record_detail = item });

            }
        }
        #endregion
        #region 組合菜單對應基礎菜單
        public async Task<IHttpActionResult> GetLeftElement([FromUri]ParmGetLeftElement parm)
        {
            db0 = getDB0();
            try
            {
                int page_size = 10;
                var element_id = db0.ConstituteOfElement
                    .Where(x => x.constitute_id == parm.main_id & x.company_id == this.companyId)
                    .Select(x => x.element_id);

                //設定未啟用i_hide=true的不顯示
                var items = db0.ElementFood.Where(x => !element_id.Contains(x.element_id) & !x.i_Hide & x.company_id == this.companyId).OrderByDescending(x => x.sort).Select(x => new { x.element_id, x.category_id, x.element_name });


                if (parm.name != null)
                {
                    items = items.Where(x => x.element_name.Contains(parm.name));
                }
                if (parm.category_id != null)
                {
                    items = items.Where(x => x.category_id == parm.category_id);
                }

                int page = (parm.page == 0 ? 1 : parm.page);
                int startRecord = PageCount.PageInfo(page, page_size, items.Count());
                var resultItems = await items.Skip(startRecord).Take(page_size).ToListAsync();

                return Ok(new
                {
                    rows = resultItems,
                    total = PageCount.TotalPage,
                    page = PageCount.Page,
                    records = PageCount.RecordCount,
                    startcount = PageCount.StartCount,
                    endcount = PageCount.EndCount
                });
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetRightElement(int? main_id)
        {
            db0 = getDB0();
            try
            {
                var items = from x in db0.ConstituteOfElement
                            join y in db0.ElementFood on x.element_id equals y.element_id
                            where x.constitute_id == main_id & x.company_id == this.companyId
                            select new { x.element_id, y.category_id, y.element_name };

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpPost]
        public async Task<IHttpActionResult> PostConstituteOfElement([FromBody]ParmConstituteOfElement parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = db0.ConstituteOfElement.Where(x => x.constitute_id == parm.constitute_id && x.element_id == parm.element_id).FirstOrDefault();
                if (item == null)
                {
                    item = new ConstituteOfElement()
                    {
                        constitute_id = parm.constitute_id,
                        element_id = parm.element_id,
                        i_InsertUserID = this.UserId,
                        i_InsertDateTime = DateTime.Now,
                        i_InsertDeptID = this.departmentId,
                        company_id = this.companyId,
                        i_Lang = "zh-TW"
                    };
                    db0.ConstituteOfElement.Add(item);
                }

                await db0.SaveChangesAsync();

                r.result = true;
                r.id = item.constitute_id;
                return Ok(r);
                #endregion
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
        [HttpDelete]
        public async Task<IHttpActionResult> DeleteConstituteOfElement([FromBody]ParmConstituteOfElement parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = await db0.ConstituteOfElement.FindAsync(parm.element_id, parm.constitute_id);
                if (item != null)
                {
                    db0.ConstituteOfElement.Remove(item);
                    await db0.SaveChangesAsync();
                }
                else
                {
                    r.result = false;
                    r.message = "未刪除";
                    return Ok(r);
                }
                r.result = true;
                return Ok(r);
                #endregion
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
        #endregion
        #region 每日菜單對應組合菜單
        public async Task<IHttpActionResult> GetLeftConstitute([FromUri]ParmGetLeftConstitute parm)
        {
            db0 = getDB0();
            try
            {
                int page_size = 10;
                var constitute_id = db0.DailyMenuOfConstitute
                    .Where(x => x.dail_menu_id == parm.main_id & x.company_id == this.companyId)
                    .Select(x => x.constitute_id);

                //設定未啟用i_hide=true的不顯示
                var items = db0.ConstituteFood.Where(x => !constitute_id.Contains(x.constitute_id) & !x.i_Hide & x.company_id == this.companyId).OrderByDescending(x => x.sort).Select(x => new { x.constitute_id, x.category_id, x.constitute_name });


                if (parm.name != null)
                {
                    items = items.Where(x => x.constitute_name.Contains(parm.name));
                }
                if (parm.category_id != null)
                {
                    items = items.Where(x => x.category_id == parm.category_id);
                }
                int page = (parm.page == 0 ? 1 : parm.page);
                int startRecord = PageCount.PageInfo(page, page_size, items.Count());
                var resultItems = await items.Skip(startRecord).Take(page_size).ToListAsync();

                return Ok(new
                {
                    rows = resultItems,
                    total = PageCount.TotalPage,
                    page = PageCount.Page,
                    records = PageCount.RecordCount,
                    startcount = PageCount.StartCount,
                    endcount = PageCount.EndCount
                });
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetRightConstitute(int? main_id)
        {
            db0 = getDB0();
            try
            {
                var items = from x in db0.DailyMenuOfConstitute
                            join y in db0.ConstituteFood on x.constitute_id equals y.constitute_id
                            where x.dail_menu_id == main_id & x.company_id == this.companyId
                            select new { x.constitute_id, y.category_id, y.constitute_name };

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpPost]
        public async Task<IHttpActionResult> PostDailyMenuOfConstitute([FromBody]ParmDailyMenuOfConstitute parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = db0.DailyMenuOfConstitute.Where(x => x.constitute_id == parm.constitute_id && x.dail_menu_id == parm.dail_menu_id).FirstOrDefault();
                if (item == null)
                {
                    item = new DailyMenuOfConstitute()
                    {
                        constitute_id = parm.constitute_id,
                        dail_menu_id = parm.dail_menu_id,
                        i_InsertUserID = this.UserId,
                        i_InsertDateTime = DateTime.Now,
                        i_InsertDeptID = this.departmentId,
                        company_id = this.companyId,
                        i_Lang = "zh-TW"
                    };
                    db0.DailyMenuOfConstitute.Add(item);
                }

                await db0.SaveChangesAsync();

                r.result = true;
                r.id = item.dail_menu_id;
                return Ok(r);
                #endregion
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
        [HttpDelete]
        public async Task<IHttpActionResult> DeleteDailyMenuOfConstitute([FromBody]ParmDailyMenuOfConstitute parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = await db0.DailyMenuOfConstitute.FindAsync(parm.constitute_id, parm.dail_menu_id);
                if (item != null)
                {
                    db0.DailyMenuOfConstitute.Remove(item);
                    await db0.SaveChangesAsync();
                }
                else
                {
                    r.result = false;
                    r.message = "未刪除";
                    return Ok(r);
                }
                r.result = true;
                return Ok(r);
                #endregion
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
        #endregion
        #region 需求元素對應基礎菜單
        public async Task<IHttpActionResult> GetLeftElement_byNeed([FromUri]ParmGetLeftElement parm)
        {
            db0 = getDB0();
            try
            {
                int page_size = 10;
                var element_id = db0.DietaryNeedOfElement
                    .Where(x => x.dietary_need_id == parm.main_id & x.company_id == this.companyId)
                    .Select(x => x.element_id);

                //設定未啟用i_hide=true的不顯示
                var items = db0.ElementFood.Where(x => !element_id.Contains(x.element_id) & !x.i_Hide & x.company_id == this.companyId).OrderByDescending(x => x.sort).Select(x => new { x.element_id, x.category_id, x.element_name });


                if (parm.name != null)
                {
                    items = items.Where(x => x.element_name.Contains(parm.name));
                }
                if (parm.category_id != null)
                {
                    items = items.Where(x => x.category_id == parm.category_id);
                }
                int page = (parm.page == 0 ? 1 : parm.page);
                int startRecord = PageCount.PageInfo(page, page_size, items.Count());
                var resultItems = await items.Skip(startRecord).Take(page_size).ToListAsync();

                return Ok(new
                {
                    rows = resultItems,
                    total = PageCount.TotalPage,
                    page = PageCount.Page,
                    records = PageCount.RecordCount,
                    startcount = PageCount.StartCount,
                    endcount = PageCount.EndCount
                });
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetRightElement_byNeed(int? main_id)
        {
            db0 = getDB0();
            try
            {
                var items = from x in db0.DietaryNeedOfElement
                            join y in db0.ElementFood on x.element_id equals y.element_id
                            where x.dietary_need_id == main_id & x.company_id == this.companyId
                            select new { x.element_id, y.category_id, y.element_name };

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpPost]
        public async Task<IHttpActionResult> PostDietaryNeedOfElement([FromBody]ParmDietaryNeedOfElement parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = db0.DietaryNeedOfElement.Where(x => x.dietary_need_id == parm.dietary_need_id && x.element_id == parm.element_id).FirstOrDefault();
                if (item == null)
                {
                    item = new DietaryNeedOfElement()
                    {
                        dietary_need_id = parm.dietary_need_id,
                        element_id = parm.element_id,
                        i_InsertUserID = this.UserId,
                        i_InsertDateTime = DateTime.Now,
                        i_InsertDeptID = this.departmentId,
                        company_id = this.companyId,
                        i_Lang = "zh-TW"
                    };
                    db0.DietaryNeedOfElement.Add(item);
                }

                await db0.SaveChangesAsync();

                r.result = true;
                r.id = item.dietary_need_id;
                return Ok(r);
                #endregion
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
        [HttpDelete]
        public async Task<IHttpActionResult> DeleteDietaryNeedOfElement([FromBody]ParmDietaryNeedOfElement parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = await db0.DietaryNeedOfElement.FindAsync(parm.element_id, parm.dietary_need_id);
                if (item != null)
                {
                    db0.DietaryNeedOfElement.Remove(item);
                    await db0.SaveChangesAsync();
                }
                else
                {
                    r.result = false;
                    r.message = "未刪除";
                    return Ok(r);
                }
                r.result = true;
                return Ok(r);
                #endregion
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
        #endregion
        #region 客戶需求對應需求元素
        public async Task<IHttpActionResult> GetLeftDietaryNeed([FromUri]ParmGetLeftDietaryNeed parm)
        {
            db0 = getDB0();
            try
            {
                int page_size = 10;
                var dietary_need_id = db0.CustomerOfDietaryNeed
                    .Where(x => x.customer_need_id == parm.main_id & x.company_id == this.companyId)
                    .Select(x => x.dietary_need_id);

                //設定未啟用i_hide=true的不顯示
                var items = db0.DietaryNeed.Where(x => !dietary_need_id.Contains(x.dietary_need_id) & !x.i_Hide & x.company_id == this.companyId).OrderBy(x => x.short_name).Select(x => new { x.dietary_need_id, x.name, x.is_correspond, x.is_breakfast, x.is_lunch, x.is_dinner });


                if (parm.name != null)
                {
                    items = items.Where(x => x.name.Contains(parm.name));
                }
                if (parm.is_correspond != null)
                {
                    items = items.Where(x => x.is_correspond == parm.is_correspond);
                }
                if (parm.is_breakfast != null)
                {
                    items = items.Where(x => x.is_breakfast == parm.is_breakfast);
                }
                if (parm.is_lunch != null)
                {
                    items = items.Where(x => x.is_lunch == parm.is_lunch);
                }
                if (parm.is_dinner != null)
                {
                    items = items.Where(x => x.is_dinner == parm.is_dinner);
                }

                int page = (parm.page == 0 ? 1 : parm.page);
                int startRecord = PageCount.PageInfo(page, page_size, items.Count());
                var resultItems = await items.Skip(startRecord).Take(page_size).ToListAsync();

                return Ok(new
                {
                    rows = resultItems,
                    total = PageCount.TotalPage,
                    page = PageCount.Page,
                    records = PageCount.RecordCount,
                    startcount = PageCount.StartCount,
                    endcount = PageCount.EndCount
                });
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetRightDietaryNeed(int? main_id)
        {
            db0 = getDB0();
            try
            {
                var items = from x in db0.CustomerOfDietaryNeed
                            join y in db0.DietaryNeed on x.dietary_need_id equals y.dietary_need_id
                            where x.customer_need_id == main_id & x.company_id == this.companyId
                            select new { x.dietary_need_id, y.name, y.is_correspond, y.is_breakfast, y.is_lunch, y.is_dinner };

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpPost]
        public async Task<IHttpActionResult> PostCustomerOfDietaryNeed([FromBody]ParmCustomerOfDietaryNeed parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = db0.CustomerOfDietaryNeed.Where(x => x.dietary_need_id == parm.dietary_need_id && x.customer_need_id == parm.customer_need_id).FirstOrDefault();
                if (item == null)
                {
                    item = new CustomerOfDietaryNeed()
                    {
                        dietary_need_id = parm.dietary_need_id,
                        customer_need_id = parm.customer_need_id,
                        i_InsertUserID = this.UserId,
                        i_InsertDateTime = DateTime.Now,
                        i_InsertDeptID = this.departmentId,
                        company_id = this.companyId,
                        i_Lang = "zh-TW"
                    };
                    db0.CustomerOfDietaryNeed.Add(item);
                }

                await db0.SaveChangesAsync();

                r.result = true;
                r.id = item.dietary_need_id;
                return Ok(r);
                #endregion
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
        [HttpDelete]
        public async Task<IHttpActionResult> DeleteCustomerOfDietaryNeed([FromBody]ParmCustomerOfDietaryNeed parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = await db0.CustomerOfDietaryNeed.FindAsync(parm.dietary_need_id, parm.customer_need_id);
                if (item != null)
                {
                    db0.CustomerOfDietaryNeed.Remove(item);
                    await db0.SaveChangesAsync();
                }
                else
                {
                    r.result = false;
                    r.message = "未刪除";
                    return Ok(r);
                }
                r.result = true;
                return Ok(r);
                #endregion
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
        #endregion
        #region 菜單複製
        #region 每日菜單樣板對應組合菜單(E04.MenuCopyTemp)
        public async Task<IHttpActionResult> GetLeftConstituteByT([FromUri]ParmGetLeftConstitute parm)
        {
            db0 = getDB0();
            try
            {
                int page_size = 10;
                var constitute_id = db0.MenuCopyOfConstitute
                    .Where(x => x.menu_copy_id == parm.main_id & x.company_id == this.companyId)
                    .Select(x => x.constitute_id);

                //設定未啟用i_hide=true的不顯示
                var items = db0.ConstituteFood.Where(x => !constitute_id.Contains(x.constitute_id) & !x.i_Hide & x.company_id == this.companyId).OrderByDescending(x => x.sort).Select(x => new { x.constitute_id, x.category_id, x.constitute_name });


                if (parm.name != null)
                {
                    items = items.Where(x => x.constitute_name.Contains(parm.name));
                }
                if (parm.category_id != null)
                {
                    items = items.Where(x => x.category_id == parm.category_id);
                }
                int page = (parm.page == 0 ? 1 : parm.page);
                int startRecord = PageCount.PageInfo(page, page_size, items.Count());
                var resultItems = await items.Skip(startRecord).Take(page_size).ToListAsync();

                return Ok(new
                {
                    rows = resultItems,
                    total = PageCount.TotalPage,
                    page = PageCount.Page,
                    records = PageCount.RecordCount,
                    startcount = PageCount.StartCount,
                    endcount = PageCount.EndCount
                });
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetRightConstituteByT(int? main_id)
        {
            db0 = getDB0();
            try
            {
                var items = from x in db0.MenuCopyOfConstitute
                            join y in db0.ConstituteFood on x.constitute_id equals y.constitute_id
                            where x.menu_copy_id == main_id & x.company_id == this.companyId
                            select new { x.constitute_id, y.category_id, y.constitute_name };

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpPost]
        public async Task<IHttpActionResult> PostMenuCopyOfConstitute([FromBody]ParmMenuCopyOfConstitute parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = db0.MenuCopyOfConstitute.Where(x => x.constitute_id == parm.constitute_id && x.menu_copy_id == parm.menu_copy_id).FirstOrDefault();
                if (item == null)
                {
                    item = new MenuCopyOfConstitute()
                    {
                        constitute_id = parm.constitute_id,
                        menu_copy_id = parm.menu_copy_id,
                        i_InsertUserID = this.UserId,
                        i_InsertDateTime = DateTime.Now,
                        i_InsertDeptID = this.departmentId,
                        company_id = this.companyId,
                        i_Lang = "zh-TW"
                    };
                    db0.MenuCopyOfConstitute.Add(item);
                }

                await db0.SaveChangesAsync();

                r.result = true;
                r.id = item.menu_copy_id;
                return Ok(r);
                #endregion
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
        [HttpDelete]
        public async Task<IHttpActionResult> DeleteMenuCopyOfConstitute([FromBody]ParmMenuCopyOfConstitute parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = await db0.MenuCopyOfConstitute.FindAsync(parm.constitute_id, parm.menu_copy_id);
                if (item != null)
                {
                    db0.MenuCopyOfConstitute.Remove(item);
                    await db0.SaveChangesAsync();
                }
                else
                {
                    r.result = false;
                    r.message = "未刪除";
                    return Ok(r);
                }
                r.result = true;
                return Ok(r);
                #endregion
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
        #endregion
        public IHttpActionResult GetTempRangeCount(int? main_id)
        {
            db0 = getDB0();
            try
            {
                var items = db0.MenuCopy.Where(x => x.company_id == this.companyId & x.menu_copy_template_id == main_id)
                    .OrderBy(x => new { x.day, x.meal_type }).AsQueryable();
                //算目前最搭天數為
                int maxVal = items.Max(x => x.day);
                List<CopyErrList> err = new List<CopyErrList>();
                for (int i = 1; i <= maxVal; i++)
                {//檢查有沒有缺天缺餐
                    List<int> meals = new List<int>() { 1, 2, 3 };
                    List<int> get_meal = items.Where(x => x.day == i).Select(x => x.meal_type).ToList();
                    if (get_meal.Count() < 3)
                    {//有缺餐才計算
                        List<int> lack_meal = meals.Where(x => !get_meal.Contains(x)).ToList();
                        foreach (var meal in lack_meal)
                        {
                            err.Add(new CopyErrList() { day = i, meal_type = meal });
                        }
                    }

                }

                return Ok(new { range_day = maxVal, list = err });
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpPost]
        public async Task<IHttpActionResult> CopyMenuData([FromBody]ParmCopyMenuData parm)
        {
            db0 = getDB0();
            try
            {
                if (parm.copy_start == null || parm.copy_end == null)
                {
                    return Ok(new { result = false, msg = "請填寫完整的日期~!" });
                }

                DateTime start = (DateTime)parm.copy_start;
                DateTime end = ((DateTime)parm.copy_end).AddDays(1);

                bool check_dailyMenu = db0.DailyMenu.Any(x => x.company_id == this.companyId & x.day >= start & x.day < end);
                if (check_dailyMenu)
                {
                    return Ok(new { result = false, msg = "要複製的日期內已有安排「每日菜單」,請確認後再複製~!" });
                }

                #region copy
                var items = db0.MenuCopy.Where(x => x.company_id == this.companyId & x.menu_copy_template_id == parm.main_id)
                            .OrderBy(x => new { x.day, x.meal_type }).ToList();
                foreach (var i in items)
                {
                    var setDayObj = start.AddDays(i.day - 1);
                    var item = new DailyMenu()
                    {
                        dail_menu_id = GetNewId(ProcCore.Business.CodeTable.DailyMenu),
                        day = setDayObj,
                        meal_type = i.meal_type,
                        i_InsertUserID = this.UserId,
                        i_InsertDateTime = DateTime.Now,
                        i_InsertDeptID = this.departmentId,
                        company_id = this.companyId,
                        i_Lang = "zh-TW"
                    };

                    db0.DailyMenu.Add(item);

                    foreach (var corr in i.MenuCopyOfConstitute)
                    {
                        var c = new DailyMenuOfConstitute()
                        {
                            constitute_id = corr.constitute_id,
                            dail_menu_id = item.dail_menu_id,
                            i_InsertUserID = this.UserId,
                            i_InsertDateTime = DateTime.Now,
                            i_InsertDeptID = this.departmentId,
                            company_id = this.companyId,
                            i_Lang = "zh-TW"
                        };
                        db0.DailyMenuOfConstitute.Add(c);
                    }
                }
                await db0.SaveChangesAsync();
                #endregion

                return Ok(new { result = true });
            }
            catch (Exception ex)
            {
                return Ok(new { result = false, msg = ex.ToString() });
            }
            finally
            {
                db0.Dispose();
            }
        }
        #endregion
        #region 發送訊息對應客戶
        public IHttpActionResult GetDraftData(int draft_id)
        {
            db0 = getDB0();
            try
            {
                var getDraft = db0.Draft.Find(draft_id);

                return Ok(new { title = getDraft.draft_title, content = getDraft.draft_content, draft_id = draft_id });
            }
            finally
            {
                db0.Dispose();
            }
        }
        public async Task<IHttpActionResult> GetLeftCustomer([FromUri]ParmGetLeftCustomer parm)
        {
            db0 = getDB0();
            try
            {
                int page_size = 10;
                var customer_id = db0.SendMsgOfCustomer
                    .Where(x => x.send_msg_id == parm.main_id & x.company_id == this.companyId)
                    .Select(x => x.customer_id);

                var items = db0.Customer.Where(x => !customer_id.Contains(x.customer_id) & x.company_id == this.companyId).OrderByDescending(x => x.customer_id).Select(x => new { x.customer_id, x.customer_name, x.customer_type });


                if (parm.name != null)
                {
                    items = items.Where(x => x.customer_name.Contains(parm.name));
                }
                if (parm.customer_type != null)
                {
                    items = items.Where(x => x.customer_type == parm.customer_type);
                }

                int page = (parm.page == 0 ? 1 : parm.page);
                int startRecord = PageCount.PageInfo(page, page_size, items.Count());
                var resultItems = await items.Skip(startRecord).Take(page_size).ToListAsync();

                return Ok(new
                {
                    rows = resultItems,
                    total = PageCount.TotalPage,
                    page = PageCount.Page,
                    records = PageCount.RecordCount,
                    startcount = PageCount.StartCount,
                    endcount = PageCount.EndCount
                });
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetRightCustomer(int? main_id)
        {
            db0 = getDB0();
            try
            {
                var items = from x in db0.SendMsgOfCustomer
                            join y in db0.Customer on x.customer_id equals y.customer_id
                            where x.send_msg_id == main_id & x.company_id == this.companyId
                            select new { x.customer_id, y.customer_name, y.customer_type };

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpPost]
        public async Task<IHttpActionResult> PostSendMsgOfCustomer([FromBody]ParmSendMsgOfCustomer parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = db0.SendMsgOfCustomer.Where(x => x.customer_id == parm.customer_id && x.send_msg_id == parm.send_msg_id).FirstOrDefault();
                if (item == null)
                {
                    item = new SendMsgOfCustomer()
                    {
                        customer_id = parm.customer_id,
                        send_msg_id = parm.send_msg_id,
                        i_InsertUserID = this.UserId,
                        i_InsertDateTime = DateTime.Now,
                        i_InsertDeptID = this.departmentId,
                        company_id = this.companyId,
                        i_Lang = "zh-TW"
                    };
                    db0.SendMsgOfCustomer.Add(item);
                }

                await db0.SaveChangesAsync();

                r.result = true;
                r.id = item.customer_id;
                return Ok(r);
                #endregion
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
        [HttpDelete]
        public async Task<IHttpActionResult> DeleteSendMsgOfCustomer([FromBody]ParmSendMsgOfCustomer parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = await db0.SendMsgOfCustomer.FindAsync(parm.customer_id, parm.send_msg_id);
                if (item != null)
                {
                    db0.SendMsgOfCustomer.Remove(item);
                    await db0.SaveChangesAsync();
                }
                else
                {
                    r.result = false;
                    r.message = "未刪除";
                    return Ok(r);
                }
                r.result = true;
                return Ok(r);
                #endregion
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
        #endregion
        #region 應收帳款
        public IHttpActionResult GetAccountsPayableDetail(int main_id)
        {
            #region 連接BusinessLogicLibary資料庫並取得資料

            using (db0 = getDB0())
            {
                var qr = db0.AccountsPayableDetail
                             .OrderBy(x => x.receipt_day)
                             .Where(x => x.accounts_payable_id == main_id & x.company_id == this.companyId)
                             .Select(x => new m_AccountsPayableDetail()
                             {
                                 accounts_payable_detail_id = x.accounts_payable_detail_id,
                                 accounts_payable_id = x.accounts_payable_id,
                                 receipt_day = x.receipt_day,
                                 meal_type = x.meal_type,
                                 receipt_person = x.receipt_person,
                                 receipt_item = x.receipt_item,
                                 receipt_sn = x.receipt_sn,
                                 actual_receipt = x.actual_receipt
                             }).AsQueryable();

                double total = 0;
                if (qr.Count() > 0)
                {
                    total = qr.Sum(x => x.actual_receipt);
                }


                return Ok(new { items = qr.ToList(), total = total });
            }
            #endregion
        }
        #endregion
        #region 取得報表列印資料
        /// <summary>
        /// R01 每日菜單報表
        /// </summary>
        /// <param name="parm"></param>
        /// <returns></returns>
        public IHttpActionResult GetDailyMealInfo([FromUri]ParmGetDailyMealInfo parm)
        {
            db0 = getDB0();
            try
            {
                R01_DailyMeal data = new R01_DailyMeal();
                Matters matters = new Matters();

                //取得正在用餐日期內的客戶生產編號
                var all_born_id = db0.RecordDetail.Where(x => x.product_type == (int)ProdyctType.PostnatalMeal & x.real_meal_start <= parm.meal_day & x.real_meal_end >= parm.meal_day & x.is_release == false & x.company_id == this.companyId)
                                                      .OrderBy(x => x.meal_id)
                                                      .Select(x => new { x.born_id, x.meal_id, x.real_meal_start, x.real_meal_end }).ToList();

                MealDay pause_meal = new MealDay();
                MealDay start_meal = new MealDay();
                MealDay end_meal = new MealDay();
                MealDaybyTryout tryout_meal = new MealDaybyTryout();
                #region 塞空資料
                pause_meal.breakfast = new List<string>();
                pause_meal.lunch = new List<string>();
                pause_meal.dinner = new List<string>();
                start_meal.breakfast = new List<string>();
                start_meal.lunch = new List<string>();
                start_meal.dinner = new List<string>();
                end_meal.breakfast = new List<string>();
                end_meal.lunch = new List<string>();
                end_meal.dinner = new List<string>();
                #endregion
                foreach (var born_id in all_born_id)
                {
                    #region 停餐
                    var pause_DailyMeal = db0.DailyMeal.Where(x => x.born_id == born_id.born_id &
                                                                x.product_type == (int)ProdyctType.PostnatalMeal &
                                                                x.meal_day == parm.meal_day).FirstOrDefault();
                    if (pause_DailyMeal == null)
                    {
                        pause_meal.breakfast.Add(born_id.meal_id);
                        pause_meal.lunch.Add(born_id.meal_id);
                        pause_meal.dinner.Add(born_id.meal_id);
                    }
                    else
                    {
                        if (pause_DailyMeal.breakfast_state <= 0)
                            pause_meal.breakfast.Add(born_id.meal_id);
                        if (pause_DailyMeal.lunch_state <= 0)
                            pause_meal.lunch.Add(born_id.meal_id);
                        if (pause_DailyMeal.dinner_state <= 0)
                            pause_meal.dinner.Add(born_id.meal_id);
                    }
                    #endregion

                    #region 開始
                    var start_DailyMeal = db0.DailyMeal.Where(x => x.born_id == born_id.born_id &
                                                                   x.product_type == (int)ProdyctType.PostnatalMeal &
                                                                  (x.breakfast_state > 0 || x.lunch_state > 0 || x.dinner_state > 0))
                                                       .OrderBy(x => x.meal_day).FirstOrDefault();
                    if (start_DailyMeal.meal_day == parm.meal_day)//開始用餐日期為當日
                    {
                        if (start_DailyMeal.breakfast_state > 0)
                        {
                            start_meal.breakfast.Add(born_id.meal_id);
                        }
                        else if (start_DailyMeal.lunch_state > 0)
                        {
                            start_meal.lunch.Add(born_id.meal_id);

                        }
                        else if (start_DailyMeal.dinner_state > 0)
                        {
                            start_meal.dinner.Add(born_id.meal_id);
                        }
                    }
                    #endregion

                    #region 結束
                    var end_DailyMeal = db0.DailyMeal.Where(x => x.born_id == born_id.born_id &
                                            x.product_type == (int)ProdyctType.PostnatalMeal &
                                            (x.breakfast_state > 0 || x.lunch_state > 0 || x.dinner_state > 0))
                                            .OrderByDescending(x => x.meal_day).FirstOrDefault();
                    if (end_DailyMeal.meal_day == parm.meal_day)//結束用餐日期為當日
                    {
                        if (end_DailyMeal.dinner_state > 0)
                        {
                            end_meal.dinner.Add(born_id.meal_id);
                        }
                        else if (end_DailyMeal.lunch_state > 0)
                        {
                            end_meal.lunch.Add(born_id.meal_id);
                        }
                        else if (end_DailyMeal.breakfast_state > 0)
                        {
                            end_meal.breakfast.Add(born_id.meal_id);
                        }
                    }
                    #endregion
                }
                #region 試吃
                var tryout_DailyMeal = db0.DailyMeal.Where(x => x.product_type == (int)ProdyctType.Tryout &
                                                                 x.meal_day == parm.meal_day & x.company_id == this.companyId);
                tryout_meal.breakfast = tryout_DailyMeal.Where(x => x.breakfast_state > 0).Count();
                tryout_meal.lunch = tryout_DailyMeal.Where(x => x.lunch_state > 0).Count();
                tryout_meal.dinner = tryout_DailyMeal.Where(x => x.dinner_state > 0).Count();
                #endregion
                matters.pause_meal = pause_meal;
                matters.start_meal = start_meal;
                matters.end_meal = end_meal;
                matters.tryout_meal = tryout_meal;


                //取得今天用餐排程
                var getDailyMeal = db0.DailyMeal.Where(x => x.meal_day == parm.meal_day && x.product_type == (int)ProdyctType.PostnatalMeal & x.company_id == this.companyId).OrderBy(x => x.meal_id).ToList();

                List<Require> special_diet = new List<Require>();
                MealDiet breakfast = new MealDiet();
                MealDiet lunch = new MealDiet();
                MealDiet dinner = new MealDiet();
                breakfast.dishs = new List<Dish>();
                lunch.dishs = new List<Dish>();
                dinner.dishs = new List<Dish>();

                #region 取得三餐菜單
                //取得當日菜單
                var getDailyMenu = db0.DailyMenu.Where(x => x.day == parm.meal_day & x.company_id == this.companyId).ToList();
                foreach (var DailyMenu_item in getDailyMenu)
                {
                    #region 取得對應組合菜單
                    List<Dish> dishs = new List<Dish>();
                    var constitute_id = db0.DailyMenuOfConstitute.Where(x => x.dail_menu_id == DailyMenu_item.dail_menu_id & x.company_id == this.companyId)
                                           .OrderByDescending(x => x.ConstituteFood.All_Category_L2.sort).Select(x => new { x.constitute_id, x.ConstituteFood.constitute_name }).ToList();
                    foreach (var id in constitute_id)
                    {
                        List<Require> Empty_RequireData = new List<Require>();
                        var dish = new Dish()
                        {
                            constitute_id = id.constitute_id,
                            dish_name = id.constitute_name,
                            meal_diet = Empty_RequireData//暫時塞空資料
                        };
                        dishs.Add(dish);
                    }
                    #endregion
                    if (DailyMenu_item.meal_type == (int)MealType.Breakfast)
                    {
                        breakfast.dishs = dishs;
                        breakfast.isHaveData = true;
                        breakfast.count = getDailyMeal.Where(x => x.breakfast_state > 0).Count();
                    }
                    if (DailyMenu_item.meal_type == (int)MealType.Lunch)
                    {
                        lunch.dishs = dishs;
                        lunch.isHaveData = true;
                        lunch.count = getDailyMeal.Where(x => x.lunch_state > 0).Count();
                    }
                    if (DailyMenu_item.meal_type == (int)MealType.Dinner)
                    {
                        dinner.dishs = dishs;
                        dinner.isHaveData = true;
                        dinner.count = getDailyMeal.Where(x => x.dinner_state > 0).Count();
                    }
                }
                #endregion

                foreach (var DailyMeal_Item in getDailyMeal)
                {
                    if (DailyMeal_Item.breakfast_state > 0 || DailyMeal_Item.lunch_state > 0 || DailyMeal_Item.dinner_state > 0)
                    {//只要三餐有一餐有,就列特殊飲食
                     //取得該客戶需求元素id
                        var dietary_need_id = db0.CustomerOfDietaryNeed.Where(x => x.CustomerNeed.born_id == DailyMeal_Item.born_id & x.company_id == this.companyId).Select(x => x.dietary_need_id);

                        #region 無對應特殊飲食習慣
                        //未對應
                        var no_correspond = db0.DietaryNeed.Where(x => dietary_need_id.Contains(x.dietary_need_id) & !x.is_correspond & x.company_id == this.companyId).ToList();
                        foreach (var dn_item in no_correspond)
                        {
                            //檢查此特殊飲食是否出現過
                            bool check_r = special_diet.Any(x => x.dietary_need_id == dn_item.dietary_need_id);
                            if (check_r)
                            {
                                var s = special_diet.Where(x => x.dietary_need_id == dn_item.dietary_need_id).FirstOrDefault();
                                s.count = s.count + 1;
                                s.meal_id.Add(DailyMeal_Item.meal_id);
                            }
                            else
                            {
                                List<string> meal_id = new List<string>();
                                meal_id.Add(DailyMeal_Item.meal_id);
                                var s = new Require()
                                {
                                    dietary_need_id = dn_item.dietary_need_id,
                                    require_name = dn_item.short_name,
                                    count = 1,
                                    meal_id = meal_id
                                };
                                special_diet.Add(s);
                            }
                        }
                        #endregion

                        #region 有對應特殊飲食習慣
                        //有對應
                        var correspond = db0.DietaryNeed.Where(x => dietary_need_id.Contains(x.dietary_need_id) & x.is_correspond & x.company_id == this.companyId).ToList();
                        foreach (var dn_item in correspond)
                        {
                            #region 早餐
                            if (DailyMeal_Item.breakfast_state > 0 && dn_item.is_breakfast && breakfast.isHaveData)
                            {

                                foreach (var b in breakfast.dishs)
                                {
                                    //取得菜單元素對應元素
                                    var b_element_id = db0.ConstituteOfElement.Where(x => x.constitute_id == b.constitute_id).Select(x => x.element_id).ToList();
                                    //如果和需求元素對應元素d有重疊
                                    bool check_element_id = db0.DietaryNeedOfElement.Any(x => b_element_id.Contains(x.element_id) && x.dietary_need_id == dn_item.dietary_need_id);
                                    #region 有重疊就加入
                                    if (check_element_id)
                                    {
                                        //檢查此飲食是否在此餐出現過
                                        bool check_b = b.meal_diet.Any(x => x.dietary_need_id == dn_item.dietary_need_id);
                                        if (check_b)
                                        {
                                            var s = b.meal_diet.Where(x => x.dietary_need_id == dn_item.dietary_need_id).FirstOrDefault();
                                            s.count = s.count + 1;
                                            s.meal_id.Add(DailyMeal_Item.meal_id);
                                        }
                                        else
                                        {
                                            List<string> meal_id = new List<string>();
                                            meal_id.Add(DailyMeal_Item.meal_id);
                                            var s = new Require()
                                            {
                                                dietary_need_id = dn_item.dietary_need_id,
                                                require_name = dn_item.short_name,
                                                count = 1,
                                                meal_id = meal_id
                                            };
                                            b.meal_diet.Add(s);
                                        }
                                    }
                                    #endregion
                                }
                            }
                            #endregion
                            #region 午餐
                            if (DailyMeal_Item.lunch_state > 0 && dn_item.is_lunch && lunch.isHaveData)
                            {

                                foreach (var l in lunch.dishs)
                                {
                                    //取得菜單元素對應元素
                                    var l_element_id = db0.ConstituteOfElement.Where(x => x.constitute_id == l.constitute_id).Select(x => x.element_id).ToList();
                                    //如果和需求元素對應元素d有重疊
                                    bool check_element_id = db0.DietaryNeedOfElement.Any(x => l_element_id.Contains(x.element_id) && x.dietary_need_id == dn_item.dietary_need_id);
                                    #region 有重疊就加入
                                    if (check_element_id)
                                    {
                                        //檢查此飲食是否在此餐出現過
                                        bool check_l = l.meal_diet.Any(x => x.dietary_need_id == dn_item.dietary_need_id);
                                        if (check_l)
                                        {
                                            var s = l.meal_diet.Where(x => x.dietary_need_id == dn_item.dietary_need_id).FirstOrDefault();
                                            s.count = s.count + 1;
                                            s.meal_id.Add(DailyMeal_Item.meal_id);
                                        }
                                        else
                                        {
                                            List<string> meal_id = new List<string>();
                                            meal_id.Add(DailyMeal_Item.meal_id);
                                            var s = new Require()
                                            {
                                                dietary_need_id = dn_item.dietary_need_id,
                                                require_name = dn_item.short_name,
                                                count = 1,
                                                meal_id = meal_id
                                            };
                                            l.meal_diet.Add(s);
                                        }
                                    }
                                    #endregion
                                }
                            }
                            #endregion
                            #region 晚餐
                            if (DailyMeal_Item.dinner_state > 0 && dn_item.is_dinner && dinner.isHaveData)
                            {

                                foreach (var d in dinner.dishs)
                                {
                                    //取得菜單元素對應元素
                                    var d_element_id = db0.ConstituteOfElement.Where(x => x.constitute_id == d.constitute_id).Select(x => x.element_id).ToList();
                                    //如果和需求元素對應元素d有重疊
                                    bool check_element_id = db0.DietaryNeedOfElement.Any(x => d_element_id.Contains(x.element_id) && x.dietary_need_id == dn_item.dietary_need_id);
                                    #region 有重疊就加入
                                    if (check_element_id)
                                    {
                                        //檢查此飲食是否在此餐出現過
                                        bool check_d = d.meal_diet.Any(x => x.dietary_need_id == dn_item.dietary_need_id);
                                        if (check_d)
                                        {
                                            var s = d.meal_diet.Where(x => x.dietary_need_id == dn_item.dietary_need_id).FirstOrDefault();
                                            s.count = s.count + 1;
                                            s.meal_id.Add(DailyMeal_Item.meal_id);
                                        }
                                        else
                                        {
                                            List<string> meal_id = new List<string>();
                                            meal_id.Add(DailyMeal_Item.meal_id);
                                            var s = new Require()
                                            {
                                                dietary_need_id = dn_item.dietary_need_id,
                                                require_name = dn_item.short_name,
                                                count = 1,
                                                meal_id = meal_id
                                            };
                                            d.meal_diet.Add(s);
                                        }
                                    }
                                    #endregion
                                }
                            }
                            #endregion
                        }
                        #endregion

                    }
                }

                data.matters = matters;
                data.special_diet = special_diet;
                data.breakfast = breakfast;
                data.lunch = lunch;
                data.dinner = dinner;


                return Ok(data);
            }
            catch (Exception ex)
            {
                string test = ex.ToString();
                return Ok(test);
            }
            finally
            {
                db0.Dispose();
            }
        }
        /// <summary>
        /// R02 產品銷售紀錄報表
        /// </summary>
        /// <param name="parm"></param>
        /// <returns></returns>
        public async Task<IHttpActionResult> GetProductRecord([FromUri]ParmGetProductRecord parm)
        {
            db0 = getDB0();
            try
            {
                int page_size = 10;

                var items = from x in db0.RecordDetail
                            orderby x.ProductRecord.record_sn descending
                            where x.company_id == this.companyId
                            select (new R02_RecordDetail()
                            {
                                product_record_id = x.product_record_id,
                                record_deatil_id = x.record_deatil_id,
                                born_id = x.born_id,
                                record_sn = x.ProductRecord.record_sn,
                                customer_name = x.ProductRecord.Customer.customer_name,
                                sell_day = x.sell_day,
                                product_type = x.product_type,
                                product_name = x.product_name,
                                qty = x.qty,
                                price = x.price,
                                subtotal = x.subtotal,
                                user_id = x.i_InsertUserID
                            });

                if (parm.start_date != null && parm.end_date != null)
                {
                    DateTime end = ((DateTime)parm.end_date).AddDays(1);
                    items = items.Where(x => x.sell_day >= parm.start_date && x.sell_day < end);
                }

                if (parm.product_type != null)
                {
                    items = items.Where(x => x.product_type == parm.product_type);
                }

                if (parm.product_name != null)
                {
                    items = items.Where(x => x.product_name.Contains(parm.product_name));
                }
                if (parm.word != null)
                {
                    items = items.Where(x => x.record_sn.Contains(parm.word) ||
                                             x.customer_name.Contains(parm.word));
                }

                int page = (parm.page == 0 ? 1 : parm.page);
                int startRecord = PageCount.PageInfo(page, page_size, items.Count());
                var resultItems = await items.Skip(startRecord).Take(page_size).ToListAsync();
                foreach (var item in resultItems)
                {
                    string User_Name = db0.AspNetUsers.FirstOrDefault(x => x.Id == item.user_id).user_name_c;
                    item.user_name = User_Name;
                }

                return Ok(new
                {
                    rows = resultItems,
                    total = PageCount.TotalPage,
                    page = PageCount.Page,
                    records = PageCount.RecordCount,
                    startcount = PageCount.StartCount,
                    endcount = PageCount.EndCount
                });
            }
            finally
            {
                db0.Dispose();
            }
        }
        /// <summary>
        /// R03 應收帳款報表
        /// </summary>
        /// <param name="parm"></param>
        /// <returns></returns>
        public async Task<IHttpActionResult> GetAccountsPayable([FromUri]ParmGetAccountsPayable parm)
        {
            db0 = getDB0();
            try
            {
                int page_size = 10;

                var items = from x in db0.AccountsPayable
                            orderby x.record_sn descending
                            where x.company_id == this.companyId
                            select (new R03_AccountsPayable()
                            {
                                product_record_id = x.product_record_id,
                                accounts_payable_id = x.accounts_payable_id,
                                customer_id = x.customer_id,
                                record_sn = x.ProductRecord.record_sn,
                                customer_name = x.Customer.customer_name,
                                record_day = x.ProductRecord.record_day,
                                estimate_payable = x.estimate_payable,
                                total_money = 0
                            });

                if (parm.start_date != null && parm.end_date != null)
                {
                    DateTime end = ((DateTime)parm.end_date).AddDays(1);
                    items = items.Where(x => x.record_day >= parm.start_date && x.record_day < end);
                }

                if (parm.word != null)
                {
                    items = items.Where(x => x.record_sn.Contains(parm.word) ||
                                             x.customer_name.Contains(parm.word));
                }

                int page = (parm.page == 0 ? 1 : parm.page);
                int startRecord = PageCount.PageInfo(page, page_size, items.Count());
                var resultItems = await items.Skip(startRecord).Take(page_size).ToListAsync();
                foreach (var item in resultItems)
                {
                    if (db0.AccountsPayableDetail.Any(x => x.accounts_payable_id == item.accounts_payable_id))
                        item.total_money = db0.AccountsPayableDetail.Where(x => x.accounts_payable_id == item.accounts_payable_id).Sum(x => x.actual_receipt);
                }
                return Ok(new
                {
                    rows = resultItems,
                    total = PageCount.TotalPage,
                    page = PageCount.Page,
                    records = PageCount.RecordCount,
                    startcount = PageCount.StartCount,
                    endcount = PageCount.EndCount
                });
            }
            finally
            {
                db0.Dispose();
            }
        }
        #endregion
        public async Task<IHttpActionResult> GetInsertRoles()
        {
            var system_roles = await roleManager.Roles.Where(x => x.Name != "Admins").ToListAsync();
            IList<RoleArray> obj = new List<RoleArray>();
            foreach (var role in system_roles)
            {
                obj.Add(new RoleArray() { role_id = role.Id, role_name = role.Name, role_use = false });
            }
            return Ok(obj);
        }
        [HttpGet]
        public async Task<IHttpActionResult> GetMealID()
        {
            try
            {
                db0 = getDB0();
                var result = await db0.MealID.AsExpandable()
                    .Where(x => x.company_id == this.companyId)
                    .OrderBy(x => x.meal_id.Substring(0, 1))
                    .GroupBy(x => x.meal_id.Substring(0, 1))
                    .Select(x => new
                    {
                        key = x.Key,
                        meal_idlist = x.Select(y => y.meal_id).ToList()
                    })
                    .ToListAsync();
                return Ok(result);
            }
            catch (Exception e)
            {
                string test = e.ToString();
                return Ok(test);
            }
        }
        [HttpGet]
        public async Task<IHttpActionResult> GetMomName()
        {
            try
            {
                db0 = getDB0();
                var result = await db0.CustomerBorn.AsExpandable()
                    .Where(x => x.company_id == this.companyId & x.meal_id != null)
                    .OrderBy(x => x.meal_id.Substring(0, 1))
                    .Join(db0.RecordDetail,
                    bornid => bornid.meal_id,
                    rdid => rdid.meal_id,
                    (bornid, rdid) => new { bornid.mom_name, meal_id = rdid.meal_id, rdid.is_release, bornid.born_id, bornid.customer_id })
                    .Where(x => x.is_release == false)
                    .Select(x => new
                    {
                        x.mom_name,
                        x.meal_id,
                        x.born_id,
                        x.customer_id
                    })
                    .ToListAsync();
                //var test = (from a in db0.MealID
                //            join b in db0.RecordDetail
                //            on a.meal_id equals b.meal_id
                //            where a.i_Use == true && b.is_release == false && b.meal_id!=null
                //            select new
                //            {

                //            }
                //         );
                return Ok(result);
            }
            catch (Exception e)
            {
                string test = e.ToString();
                return Ok(test);
            }

        }
        [HttpGet]
        public IHttpActionResult GetContactSchedule(int born_id)
        {
            try
            {
                db0 = getDB0();
                var result =db0.ContactSchedule
                    .Where(x => x.company_id == this.companyId & x.born_id == born_id)
                    .Select(x => new m_ContactSchedule
                    {
                        schedule_id=x.schedule_id,
                        customer_id = x.customer_id,
                        customer_name =x.CustomerBorn.Customer.customer_name,
                        born_id = x.born_id,
                        meal_id = x.meal_id,
                        mom_name = x.CustomerBorn.mom_name,
                        sno = x.CustomerBorn.sno,
                        tel_1 = x.CustomerBorn.tel_1,
                        tel_2 = x.CustomerBorn.tel_2
                    })
                    .FirstOrDefault();
                //var test = (from a in db0.MealID
                //            join b in db0.RecordDetail
                //            on a.meal_id equals b.meal_id
                //            where a.i_Use == true && b.is_release == false && b.meal_id!=null
                //            select new
                //            {

                //            }
                //         );
                return Ok(result);
            }
            catch (Exception e)
            {
                string test = e.ToString();
                return Ok(test);
            }
            finally
            {
                db0.Dispose();
            }

        }
        [HttpGet]
        public IHttpActionResult GetCustomerNeed(int born_id)
        {
            try
            {
                db0 = getDB0();
                var result = db0.CustomerNeed
                    .Where(x => x.company_id == this.companyId & x.born_id == born_id)
                    .Select(x => new m_CustomerNeed
                    {
                        customer_need_id = x.customer_need_id,
                        customer_id = x.customer_id,
                        born_id = x.born_id,
                        meal_id = x.meal_id,
                        name = x.CustomerBorn.mom_name,
                        memo = x.memo,
                        tel_1 = x.CustomerBorn.tel_1,
                        tel_2 = x.CustomerBorn.tel_2,
                        tw_zip_1 = x.CustomerBorn.tw_zip_1,
                        tw_city_1 = x.CustomerBorn.tw_city_1,
                        tw_country_1 = x.CustomerBorn.tw_country_1,
                        tw_address_1 = x.CustomerBorn.tw_address_1
                    })
                    .FirstOrDefault();

                return Ok(result);
            }
            catch (Exception e)
            {
                string test = e.ToString();
                return Ok(test);
            }
            finally
            {
                db0.Dispose();
            }

        }
        [HttpGet]
        public async Task<IHttpActionResult> GetTodaySchedule()
        {
            db0 = getDB0();
            var result = await db0.ScheduleDetail.AsExpandable()
                .Where(x => x.company_id == this.companyId)
                .ToListAsync();
            return Ok(result);
        }
        [HttpGet]
        public async Task<IHttpActionResult> ta_Customer(string keyword)
        {
            db0 = getDB0();
            var predicate = PredicateBuilder.True<Customer>();
            if (keyword != null)
                predicate = predicate.And(x => x.customer_name.Contains(keyword));

            var result = await db0.Customer.AsExpandable()
                .Where(predicate)
                .OrderBy(x => x.customer_name)
                .Select(x => new { value = x.customer_id, text = x.customer_name })
                .Take(5)
                .ToListAsync();

            return Ok(result);
        }

        [HttpGet]
        public async Task<IHttpActionResult> GetCustomerById(int customer_id)
        {
            db0 = getDB0();

            var customer = await db0.Customer.FindAsync(customer_id);
            var born = customer.CustomerBorn;
            var productRecord = customer.ProductRecord;
            var customerNeed = customer.CustomerNeed;
            //var MealSchedule = DailyMeal

            return Ok(new { customer, born, productRecord, customerNeed });
        }

        [HttpPost]
        public async Task<IHttpActionResult> test()
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();

                for (var i = 1; i <= 100; i++)
                {
                    string id = "N" + i.ToString().PadLeft(3, '0');
                    var item = new MealID()
                    {
                        meal_id = id,
                        company_id = this.companyId,
                        i_Lang = "zh-TW"
                    };
                    db0.MealID.Add(item);
                }




                await db0.SaveChangesAsync();

                r.result = true;
                r.id = 0;
                return Ok(r);
                #endregion
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
    #region Parm
    public class GetAllMealIDParm
    {
        public string keyword { get; set; }
    }
    public class ParmChangeMealID
    {
        public string old_id { get; set; }
        public string new_id { get; set; }
    }
    public class ParmCheckMealID
    {
        public int? born_id { get; set; }
        public string meal_id { get; set; }
    }
    public class ParmGetLeftElement
    {
        public int? main_id { get; set; }
        public string name { get; set; }
        public int? category_id { get; set; }
        public int page { get; set; }

    }
    public class ParmConstituteOfElement
    {
        public int constitute_id { get; set; }
        public int element_id { get; set; }
    }
    public class ParmGetLeftConstitute : ParmGetLeftElement
    {
    }
    public class ParmDailyMenuOfConstitute
    {
        public int constitute_id { get; set; }
        public int dail_menu_id { get; set; }
    }
    public class ParmDietaryNeedOfElement
    {
        public int dietary_need_id { get; set; }
        public int element_id { get; set; }
    }
    public class ParmGetLeftDietaryNeed
    {
        public int? main_id { get; set; }
        public string name { get; set; }
        public bool? is_correspond { get; set; }
        public bool? is_breakfast { get; set; }
        public bool? is_lunch { get; set; }
        public bool? is_dinner { get; set; }
        public int page { get; set; }
    }
    public class ParmCustomerOfDietaryNeed
    {
        public int dietary_need_id { get; set; }
        public int customer_need_id { get; set; }
    }
    public class ParmCloseRecord
    {
        public int main_id { get; set; }
    }
    public class ParmProductSelect
    {
        public string name { get; set; }
        public int? product_type { get; set; }
        public int born_id { get; set; }
    }
    public class ParmGetAllBorn
    {
        public string word { get; set; }
        public int? customer_type { get; set; }
        public bool? is_meal { get; set; }
    }
    public class ParmGetLeftCustomer
    {
        public int? customer_type { get; set; }
        public int? main_id { get; set; }
        public string name { get; set; }
        public int page { get; set; }
    }
    public class ParmSendMsgOfCustomer
    {
        public int send_msg_id { get; set; }
        public int customer_id { get; set; }
    }
    public class ParmGetMealCalendar
    {
        public int record_deatil_id { get; set; }
        public int year { get; set; }
        public int month { get; set; }
    }
    public class ParmPostDailyMealState
    {
        public int daily_meal_id { get; set; }
        public int record_deatil_id { get; set; }
        public int meal_type { get; set; }
        public int meal_state { get; set; }
        public bool isMealStart { get; set; }
    }
    public class ParmAddDailyMeal
    {
        public int record_deatil_id { get; set; }
        public int customer_id { get; set; }
        public int born_id { get; set; }
        public DateTime meal_day { get; set; }
    }
    public class ParminsertAccountsPayable
    {
        public int product_record_id { get; set; }
        public int customer_id { get; set; }
        public string record_sn { get; set; }
    }
    public class ParmReleaseMealID
    {
        public int record_deatil_id { get; set; }
        public string meal_id { get; set; }
    }
    public class ParmGetAllRecord
    {
        public int? old_id { get; set; }
        public bool? is_close { get; set; }
        public string word { get; set; }
        public DateTime? start_date { get; set; }
        public int? born_id { get; set; }
        public DateTime? end_date { get; set; }
    }
    public class ParmMenuCopyOfConstitute
    {
        public int constitute_id { get; set; }
        public int menu_copy_id { get; set; }
    }
    public class ParmCopyMenuData
    {
        public DateTime? copy_start { get; set; }
        public DateTime? copy_end { get; set; }
        public int main_id { get; set; }
    }
    #endregion
    public class MealTotalCount
    {
        public int pause_meal { get; set; }//停餐
        public int add_meal { get; set; }//增餐
        public int estimate_total { get; set; }//應排
        public int real_total { get; set; }//已排
        public int already_eat { get; set; }//已吃
        public int not_eat { get; set; }//未吃
    }
    #region R01
    public class ParmGetDailyMealInfo
    {
        public DateTime meal_day { get; set; }
    }
    public class R01_DailyMeal
    {
        public Matters matters { get; set; }
        public List<Require> special_diet { get; set; }
        public MealDiet breakfast { get; set; }
        public MealDiet lunch { get; set; }
        public MealDiet dinner { get; set; }
    }
    /// <summary>
    /// 當日事項
    /// </summary>
    public class Matters
    {
        public MealDay pause_meal { get; set; }
        public MealDay start_meal { get; set; }
        public MealDay end_meal { get; set; }
        public MealDaybyTryout tryout_meal { get; set; }
    }
    /// <summary>
    /// 一天三餐
    /// </summary>
    public class MealDay
    {
        public List<string> breakfast { get; set; }
        public List<string> lunch { get; set; }
        public List<string> dinner { get; set; }
    }
    public class MealDaybyTryout
    {
        public int breakfast { get; set; }
        public int lunch { get; set; }
        public int dinner { get; set; }
    }
    /// <summary>
    /// 早餐、午餐、晚餐
    /// </summary>
    public class MealDiet
    {
        /// <summary>
        /// 一餐有好幾道菜
        /// </summary>
        public List<Dish> dishs { get; set; }
        /// <summary>
        /// 判斷是否有排每日菜單
        /// </summary>
        public bool isHaveData { get; set; }
        /// <summary>
        /// 計算該餐有幾人用餐
        /// </summary>
        public int count { get; set; }
    }
    public class Require
    {
        public int dietary_need_id { get; set; }//需求元素編號
        public string require_name { get; set; }
        public int count { get; set; }
        public List<string> meal_id { get; set; }
    }
    /// <summary>
    /// 一道菜
    /// </summary>
    public class Dish
    {
        public int constitute_id { get; set; }//組合菜單編號
        public string dish_name { get; set; }
        public List<Require> meal_diet { get; set; }
    }
    #endregion
    #region R02
    public class R02_RecordDetail
    {
        public int product_record_id { get; set; }
        public int record_deatil_id { get; set; }
        public int born_id { get; set; }
        public string record_sn { get; set; }
        public string customer_name { get; set; }
        public DateTime sell_day { get; set; }
        public int product_type { get; set; }
        public string product_name { get; set; }
        public double qty { get; set; }
        public double price { get; set; }
        public double subtotal { get; set; }
        public string user_id { get; set; }
        public string user_name { get; set; }
    }
    public class ParmGetProductRecord
    {
        public DateTime? start_date { get; set; }
        public DateTime? end_date { get; set; }
        public int? product_type { get; set; }
        public string product_name { get; set; }
        public string word { get; set; }
        public int page { get; set; }
    }
    #endregion
    #region R03
    public class R03_AccountsPayable
    {
        public int product_record_id { get; set; }
        public int accounts_payable_detail_id { get; set; }
        public int accounts_payable_id { get; set; }
        public int customer_id { get; set; }
        public string record_sn { get; set; }
        public string customer_name { get; set; }
        public DateTime record_day { get; set; }
        public double estimate_payable { get; set; }
        public double total_money { get; set; }
    }
    public class ParmGetAccountsPayable
    {
        public DateTime? start_date { get; set; }
        public DateTime? end_date { get; set; }
        public string word { get; set; }
        public int page { get; set; }
    }
    #endregion

    public class CopyErrList
    {
        public int day { get; set; }
        public int meal_type { get; set; }
    }
}
