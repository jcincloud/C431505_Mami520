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
                    .Where(x => x.product_type == (int)ProdyctType.PostnatalMeal)
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

            try
            {
                db0 = getDB0();

                item = await db0.RecordDetail.FindAsync(md.record_deatil_id);
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
                    var check_PostnatalMeal = db0.RecordDetail.Any(x => x.born_id == md.born_id & x.product_type == (int)ProdyctType.PostnatalMeal);
                    if (check_PostnatalMeal)
                    {
                        r.result = false;
                        r.message = Resources.Res.Log_Check_RecordDetail_PostnatalMeal;
                        return Ok(r);
                    }

                    md.real_breakfast = md.estimate_breakfast;
                    md.real_lunch = md.estimate_lunch;
                    md.real_dinner = md.estimate_dinner;

                    md.real_estimate_meal_start = md.meal_start;
                    md.real_estimate_meal_end = md.meal_end;
                    md.real_estimate_breakfast = md.estimate_breakfast;
                    md.real_estimate_lunch = md.estimate_lunch;
                    md.real_estimate_dinner = md.estimate_dinner;
                }
                #endregion

                md.sell_day = DateTime.Now;

                md.i_InsertUserID = this.UserId;
                md.i_InsertDateTime = DateTime.Now;
                md.i_InsertDeptID = this.departmentId;
                md.i_Lang = "zh-TW";
                db0.RecordDetail.Add(md);
                await db0.SaveChangesAsync();

                #region 新增用餐排程資料
                if (md.product_type == (int)ProdyctType.PostnatalMeal & md.meal_start != null & md.meal_end != null)
                {
                    DateTime start = DateTime.Parse(md.meal_start.ToString());
                    DateTime end = DateTime.Parse(md.meal_end.ToString());

                    var getDateSection = (end - start).TotalDays + 1;
                    for (int i = 0; i < getDateSection; i++)
                    {
                        var setDayObj = start.AddDays(i);
                        #region use sql insert
                        StringBuilder sb = new StringBuilder();
                        Log.Write("Start...");
                        var sqlt = "insert into DailyMeal(daily_meal_id, record_deatil_id, customer_id,born_id,meal_day,i_InsertUserID,i_InsertDateTime,i_InsertDeptID) values({0},{1},{2},{3},'{4}','{5}','{6}',{7});";
                        sb.AppendFormat(sqlt, GetNewId(ProcCore.Business.CodeTable.DailyMeal)
                                            , md.record_deatil_id
                                            , md.customer_id
                                            , md.born_id
                                            , setDayObj.ToString("yyyy/MM/dd HH:mm:ss")
                                            , this.UserId
                                            , DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss")
                                            , this.departmentId);
                        Log.Write("Save...");
                        var t = await db0.Database.ExecuteSqlCommandAsync(sb.ToString());
                        sb.Clear();
                        Log.Write("End...");
                        Log.WriteToFile();
                        #endregion
                    }

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

                foreach (var id in ids)
                {
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

                    item = new RecordDetail() { record_deatil_id = id };
                    db0.RecordDetail.Attach(item);
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
