﻿using DotWeb.WebApp.Models;
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
using System.Web;
using System.Web.Http;
namespace DotWeb.Api
{
    public class GetActionController : BaseApiController
    {
        #region 客戶生產-用餐編號選取
        public IHttpActionResult GetAllMealID()
        {
            db0 = getDB0();
            try
            {
                var items = db0.MealID
                    .OrderBy(x => x.meal_id)
                    .Where(x => !x.i_Use & !x.i_Hide)
                    .Select(x => new { x.meal_id });

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
                var check_old = db0.MealID.Any(x => x.meal_id == parm.old_id);
                var check_new = db0.MealID.Any(x => x.meal_id == parm.new_id & !x.i_Use);

                if (!check_new)
                {//如果發先新id已被使用
                    return Ok(new { result = false, message = "此用餐編號已被使用!" });
                }
                if (check_old)
                {
                    var old_item = await db0.MealID.FindAsync(parm.old_id);
                    old_item.i_Use = false;//將舊id改回未使用狀態
                }
                var new_item = await db0.MealID.FindAsync(parm.new_id);
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
                bool check_born = db0.CustomerBorn.Any(x => x.born_id == parm.born_id);//先檢查此筆生產存不存在
                if (parm.meal_id != null)//有選用餐編號才改
                {
                    var meal_item = await db0.MealID.FindAsync(parm.meal_id);
                    if (!check_born || parm.born_id == null)
                    {
                        meal_item.i_Use = false;
                    }
                    else
                    {
                        var born_item = await db0.CustomerBorn.FindAsync(parm.born_id);
                        if (born_item.meal_id != parm.meal_id)
                        {
                            var old_item = await db0.MealID.FindAsync(born_item.meal_id);
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
                    born_id = db0.CustomerNeed.Where(x => x.customer_need_id != main_id).Select(x => x.born_id);
                }
                else
                {
                    born_id = db0.CustomerNeed.Select(x => x.born_id);
                }

                var items = db0.CustomerBorn
                    .OrderBy(x => x.meal_id)
                    .Where(x => !x.is_close & !born_id.Contains(x.born_id))
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
                    .OrderBy(x => new { x.customer_id, x.meal_id })
                    .Select(x => new { x.customer_id, x.born_id, x.Customer.customer_sn, x.Customer.customer_name, x.meal_id, x.mom_name, x.born_frequency, x.is_close });

                if (parm.is_close != null)
                {
                    items = items.Where(x => x.is_close == parm.is_close);
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
                                                                                //var getBorn = await db0.CustomerBorn.FindAsync(getRecord.born_id);//客戶生產紀錄
                                                                                //var getMealID = await db0.MealID.FindAsync(getBorn.meal_id);//用餐編號

                getRecord.is_close = true;
                //getBorn.is_close = true;
                //getMealID.i_Use = false;


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
                var getBorn = await db0.CustomerBorn.FindAsync(getRecord.born_id);//客戶生產紀錄
                var getMealID = await db0.MealID.FindAsync(getBorn.meal_id);//用餐編號

                getRecord.is_close = false;
                getBorn.is_close = false;
                if (getMealID.i_Use)
                {
                    r.result = false;
                    r.message = "此用餐編號已被其他客戶使用!";
                    return Ok(r);
                }
                getMealID.i_Use = true;


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
                var check_PostnatalMeal = db0.RecordDetail.Any(x => x.born_id == parm.born_id & x.product_type == (int)ProdyctType.PostnatalMeal);

                var items = db0.Product
                    .OrderBy(x => new { x.sort })
                    .Select(x => new { x.product_id, x.product_name, x.product_type, x.price, x.standard });

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
                if (check_PostnatalMeal)
                {//已有月子餐,將不列出月子餐產品
                    items = items.Where(x => x.product_type != (int)ProdyctType.PostnatalMeal);
                }

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
                             .Where(x => x.product_record_id == q.main_id)
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
        #endregion
        #region 禮品贈送紀錄-取得贈品活動list
        public IHttpActionResult GetAllActivity()
        {
            db0 = getDB0();
            try
            {
                var items = db0.Activity
                    .OrderByDescending(x => x.sort)
                    .Where(x => !x.i_Hide)
                    .Select(x => new option() { val = x.activity_id, Lname = x.activity_name });

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetAllRecord(int? old_id)
        {
            db0 = getDB0();
            try
            {
                //一筆生產紀錄只能有一筆禮品贈送紀錄
                var born_id = db0.GiftRecord.Select(x => x.born_id).AsQueryable();

                var items = db0.ProductRecord
                    .OrderByDescending(x => x.record_day)
                    .Where(x => !born_id.Contains(x.born_id))
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
                        x.CustomerBorn.tel_2
                    });

                if (old_id != null)
                {
                    items = items.Where(x => x.product_record_id != old_id);//過濾目前已選擇的id
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
                             .Where(x => x.schedule_id == main_id)
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

                bool check_meal_start = db0.DailyMeal.Any(x => x.meal_day <= DateTime.Now &&
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
                #region 早餐
                if (parm.meal_type == (int)MealType.Breakfast)
                {
                    item.breakfast_state = parm.meal_state;
                    if (parm.meal_state > 0)//增餐
                    {
                        RecordDetailItem.real_breakfast += 1;
                        if (!parm.isMealStart)
                        {
                            RecordDetailItem.real_estimate_breakfast += 1;
                        }
                        else
                        {//開始用餐後變動新增異動紀錄
                            var changeRecord = new DailyMealChangeRecord()
                            {
                                change_record_id = GetNewId(ProcCore.Business.CodeTable.DailyMealChangeRecord),
                                daily_meal_id = parm.daily_meal_id,
                                record_deatil_id = parm.record_deatil_id,
                                change_time = DateTime.Now,
                                meal_day = item.meal_day,
                                meal_type = parm.meal_type,
                                change_type = 1,
                                i_InsertUserID = this.UserId,
                                i_InsertDateTime = DateTime.Now,
                                i_InsertDeptID = this.departmentId,
                                i_Lang = "zh-TW"
                            };
                            db0.DailyMealChangeRecord.Add(changeRecord);
                        }
                    }
                    else if (parm.meal_state < 0)//停餐
                    {
                        RecordDetailItem.real_breakfast -= 1;
                        if (!parm.isMealStart)
                        {
                            RecordDetailItem.real_estimate_breakfast -= 1;
                        }
                        else
                        {//開始用餐後變動新增異動紀錄
                            var changeRecord = new DailyMealChangeRecord()
                            {
                                change_record_id = GetNewId(ProcCore.Business.CodeTable.DailyMealChangeRecord),
                                daily_meal_id = parm.daily_meal_id,
                                record_deatil_id = parm.record_deatil_id,
                                change_time = DateTime.Now,
                                meal_day = item.meal_day,
                                meal_type = parm.meal_type,
                                change_type = -1,
                                i_InsertUserID = this.UserId,
                                i_InsertDateTime = DateTime.Now,
                                i_InsertDeptID = this.departmentId,
                                i_Lang = "zh-TW"
                            };
                            db0.DailyMealChangeRecord.Add(changeRecord);
                        }
                    }
                }
                #endregion
                #region 午餐
                if (parm.meal_type == (int)MealType.Lunch)
                {
                    item.lunch_state = parm.meal_state;
                    if (parm.meal_state > 0)//增餐
                    {
                        RecordDetailItem.real_lunch += 1;
                        if (!parm.isMealStart)
                        {
                            RecordDetailItem.real_estimate_lunch += 1;
                        }
                        else
                        {//開始用餐後變動新增異動紀錄
                            var changeRecord = new DailyMealChangeRecord()
                            {
                                change_record_id = GetNewId(ProcCore.Business.CodeTable.DailyMealChangeRecord),
                                daily_meal_id = parm.daily_meal_id,
                                record_deatil_id = parm.record_deatil_id,
                                change_time = DateTime.Now,
                                meal_day = item.meal_day,
                                meal_type = parm.meal_type,
                                change_type = 1,
                                i_InsertUserID = this.UserId,
                                i_InsertDateTime = DateTime.Now,
                                i_InsertDeptID = this.departmentId,
                                i_Lang = "zh-TW"
                            };
                            db0.DailyMealChangeRecord.Add(changeRecord);
                        }
                    }
                    else if (parm.meal_state < 0)//停餐
                    {
                        RecordDetailItem.real_lunch -= 1;
                        if (!parm.isMealStart)
                        {
                            RecordDetailItem.real_estimate_lunch -= 1;
                        }
                        else
                        {//開始用餐後變動新增異動紀錄
                            var changeRecord = new DailyMealChangeRecord()
                            {
                                change_record_id = GetNewId(ProcCore.Business.CodeTable.DailyMealChangeRecord),
                                daily_meal_id = parm.daily_meal_id,
                                record_deatil_id = parm.record_deatil_id,
                                change_time = DateTime.Now,
                                meal_day = item.meal_day,
                                meal_type = parm.meal_type,
                                change_type = -1,
                                i_InsertUserID = this.UserId,
                                i_InsertDateTime = DateTime.Now,
                                i_InsertDeptID = this.departmentId,
                                i_Lang = "zh-TW"
                            };
                            db0.DailyMealChangeRecord.Add(changeRecord);
                        }
                    }
                }
                #endregion
                #region 晚餐
                if (parm.meal_type == (int)MealType.Dinner)
                {
                    item.dinner_state = parm.meal_state;
                    if (parm.meal_state > 0)//增餐
                    {
                        RecordDetailItem.real_dinner += 1;
                        if (!parm.isMealStart)
                        {
                            RecordDetailItem.real_estimate_dinner += 1;
                        }
                        else
                        {//開始用餐後變動新增異動紀錄
                            var changeRecord = new DailyMealChangeRecord()
                            {
                                change_record_id = GetNewId(ProcCore.Business.CodeTable.DailyMealChangeRecord),
                                daily_meal_id = parm.daily_meal_id,
                                record_deatil_id = parm.record_deatil_id,
                                change_time = DateTime.Now,
                                meal_day = item.meal_day,
                                meal_type = parm.meal_type,
                                change_type = 1,
                                i_InsertUserID = this.UserId,
                                i_InsertDateTime = DateTime.Now,
                                i_InsertDeptID = this.departmentId,
                                i_Lang = "zh-TW"
                            };
                            db0.DailyMealChangeRecord.Add(changeRecord);
                        }
                    }
                    else if (parm.meal_state < 0)//停餐
                    {
                        RecordDetailItem.real_dinner -= 1;
                        if (!parm.isMealStart)
                        {
                            RecordDetailItem.real_estimate_dinner -= 1;
                        }
                        else
                        {//開始用餐後變動新增異動紀錄
                            var changeRecord = new DailyMealChangeRecord()
                            {
                                change_record_id = GetNewId(ProcCore.Business.CodeTable.DailyMealChangeRecord),
                                daily_meal_id = parm.daily_meal_id,
                                record_deatil_id = parm.record_deatil_id,
                                change_time = DateTime.Now,
                                meal_day = item.meal_day,
                                meal_type = parm.meal_type,
                                change_type = -1,
                                i_InsertUserID = this.UserId,
                                i_InsertDateTime = DateTime.Now,
                                i_InsertDeptID = this.departmentId,
                                i_Lang = "zh-TW"
                            };
                            db0.DailyMealChangeRecord.Add(changeRecord);
                        }
                    }
                }
                #endregion

                double old_subtotal = RecordDetailItem.subtotal;

                #region 變更產品數量
                RecordDetailItem.qty = Math.Round((int)RecordDetailItem.real_breakfast * 0.3 + (int)RecordDetailItem.real_lunch * 0.35 + (int)RecordDetailItem.real_dinner * 0.35, 2);
                RecordDetailItem.subtotal = RecordDetailItem.qty * RecordDetailItem.price;
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
                bool check_meal_start = db0.DailyMeal.Any(x => x.meal_day <= DateTime.Now &&
                                                               x.record_deatil_id == parm.record_deatil_id);
                if (item == null & DateTime.Now <= parm.meal_day)
                {
                    item = new DailyMeal()
                    {
                        daily_meal_id = GetNewId(ProcCore.Business.CodeTable.DailyMeal),
                        record_deatil_id = parm.record_deatil_id,
                        customer_id = parm.customer_id,
                        born_id = parm.born_id,
                        meal_day = parm.meal_day,
                        breakfast_state = (int)MealState.CommonNotMeal,
                        lunch_state = (int)MealState.CommonNotMeal,
                        dinner_state = (int)MealState.CommonNotMeal,
                        i_InsertUserID = this.UserId,
                        i_InsertDateTime = DateTime.Now,
                        i_InsertDeptID = this.departmentId,
                        i_Lang = "zh-TW"
                    };
                    db0.DailyMeal.Add(item);
                    if (!check_meal_start)
                    {
                        if (RecordDetailItem.real_estimate_meal_start >= parm.meal_day)
                            RecordDetailItem.real_estimate_meal_start = parm.meal_day;

                        if (RecordDetailItem.real_estimate_meal_end <= parm.meal_day)
                            RecordDetailItem.real_estimate_meal_end = parm.meal_day;

                    }

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
                #region 取得實際用餐起日及迄日
                var getDMItem = db0.DailyMeal.Where(x => x.record_deatil_id == record_deatil_id);
                DateTime start = getDMItem.OrderBy(x => x.meal_day).FirstOrDefault().meal_day;
                DateTime end = getDMItem.OrderByDescending(x => x.meal_day).FirstOrDefault().meal_day;
                #endregion
                var item = db0.RecordDetail.Where(x => x.record_deatil_id == record_deatil_id)
                                           .Select(x => new m_RecordDetail()
                                           {
                                               meal_start = x.meal_start,
                                               real_estimate_meal_start = x.real_estimate_meal_start,
                                               real_meal_start = start,
                                               meal_end = x.meal_end,
                                               real_estimate_meal_end = x.real_estimate_meal_end,
                                               real_meal_end = end,
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
                foreach (var i in getDailyMeal)
                {
                    #region 已吃
                    if (i.meal_day <= DateTime.Now)
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
                    .Where(x => x.constitute_id == parm.main_id)
                    .Select(x => x.element_id);

                //設定未啟用i_hide=true的不顯示
                var items = db0.ElementFood.Where(x => !element_id.Contains(x.element_id) & !x.i_Hide).OrderByDescending(x => x.sort).Select(x => new { x.element_id, x.category_id, x.element_name });


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
                            where x.constitute_id == main_id
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
                    .Where(x => x.dail_menu_id == parm.main_id)
                    .Select(x => x.constitute_id);

                //設定未啟用i_hide=true的不顯示
                var items = db0.ConstituteFood.Where(x => !constitute_id.Contains(x.constitute_id) & !x.i_Hide).OrderByDescending(x => x.sort).Select(x => new { x.constitute_id, x.category_id, x.constitute_name });


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
                            where x.dail_menu_id == main_id
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
                    .Where(x => x.dietary_need_id == parm.main_id)
                    .Select(x => x.element_id);

                //設定未啟用i_hide=true的不顯示
                var items = db0.ElementFood.Where(x => !element_id.Contains(x.element_id) & !x.i_Hide).OrderByDescending(x => x.sort).Select(x => new { x.element_id, x.category_id, x.element_name });


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
                            where x.dietary_need_id == main_id
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
                    .Where(x => x.customer_need_id == parm.main_id)
                    .Select(x => x.dietary_need_id);

                //設定未啟用i_hide=true的不顯示
                var items = db0.DietaryNeed.Where(x => !dietary_need_id.Contains(x.dietary_need_id) & !x.i_Hide).OrderByDescending(x => x.sort).Select(x => new { x.dietary_need_id, x.name, x.is_correspond, x.is_breakfast, x.is_lunch, x.is_dinner });


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
                            where x.customer_need_id == main_id
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
                    .Where(x => x.send_msg_id == parm.main_id)
                    .Select(x => x.customer_id);

                var items = db0.Customer.Where(x => !customer_id.Contains(x.customer_id)).OrderByDescending(x => x.customer_id).Select(x => new { x.customer_id, x.customer_name, x.customer_type });


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
                            where x.send_msg_id == main_id
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
                             .Where(x => x.accounts_payable_id == main_id)
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
    }
    #region Parm
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
        public bool? is_close { get; set; }
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
}
