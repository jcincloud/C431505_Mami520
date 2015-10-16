using DotWeb.Helpers;
using ProcCore.Business.DB0;
using ProcCore.HandleResult;
using ProcCore.WebCore;
using System;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;

namespace DotWeb.Api
{
    public class ScheduleDetailController : ajaxApi<ScheduleDetail, q_ScheduleDetail>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.ScheduleDetail.FindAsync(id);
                var getCustomer = await db0.Customer.FindAsync(item.customer_id);
                item.customer_type = getCustomer.customer_type;
                item.customer_name = getCustomer.customer_name; ;
                item.mom_name = item.CustomerBorn.mom_name;
                item.sno = item.CustomerBorn.sno;
                item.birthday = item.CustomerBorn.birthday;
                item.tel_1 = item.CustomerBorn.tel_1;
                item.tel_2 = item.CustomerBorn.tel_2;
                item.tw_zip_1 = item.CustomerBorn.tw_zip_1;
                item.tw_city_1 = item.CustomerBorn.tw_city_1;
                item.tw_country_1 = item.CustomerBorn.tw_country_1;
                item.tw_address_1 = item.CustomerBorn.tw_address_1;
                item.tw_zip_2 = item.CustomerBorn.tw_zip_2;
                item.tw_city_2 = item.CustomerBorn.tw_city_2;
                item.tw_country_2 = item.CustomerBorn.tw_country_2;
                item.tw_address_2 = item.CustomerBorn.tw_address_2;
                item.born_type = item.CustomerBorn.born_type;
                item.born_day = item.CustomerBorn.born_day;
                r = new ResultInfo<ScheduleDetail>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_ScheduleDetail q)
        {
            #region 連接BusinessLogicLibary資料庫並取得資料

            using (db0 = getDB0())
            {
                var qr = db0.ScheduleDetail
                    .OrderByDescending(x => x.tel_day).AsQueryable();


                if (q.tel_reason != null)
                {
                    qr = qr.Where(x => x.tel_reason == q.tel_reason);
                }
                if (q.word != null)
                {
                    qr = qr.Where(x => x.meal_id.Contains(q.word) ||
                                      x.CustomerBorn.mom_name.Contains(q.word) ||
                                      x.CustomerBorn.tel_1.Contains(q.word) ||
                                      x.CustomerBorn.tel_2.Contains(q.word));
                }
                if (q.start_date != null && q.end_date != null)
                {
                    DateTime end = ((DateTime)q.end_date).AddDays(1);
                    qr = qr.Where(x => x.tel_day >= q.start_date && x.tel_day < end);
                }
                var result = qr.Select(x => new m_ScheduleDetail()
                {
                    schedule_id = x.schedule_id,
                    schedule_detail_id = x.schedule_detail_id,
                    meal_id = x.meal_id,
                    mom_name = x.CustomerBorn.mom_name,
                    tel_1 = x.CustomerBorn.tel_1,
                    tel_2 = x.CustomerBorn.tel_2,
                    tel_reason = x.tel_reason,
                    tel_day = x.tel_day
                });


                int page = (q.page == null ? 1 : (int)q.page);
                int position = PageCount.PageInfo(page, this.defPageSize, qr.Count());
                var segment = await result.Skip(position).Take(this.defPageSize).ToListAsync();

                return Ok<GridInfo<m_ScheduleDetail>>(new GridInfo<m_ScheduleDetail>()
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
        public async Task<IHttpActionResult> Put([FromBody]ScheduleDetail md)
        {
            ResultInfo r = new ResultInfo();
            try
            {
                db0 = getDB0();

                item = await db0.ScheduleDetail.FindAsync(md.schedule_detail_id);
                item.customer_id = md.customer_id;
                item.born_id = md.born_id;
                item.meal_id = md.meal_id;
                item.tel_day = md.tel_day;
                item.tel_reason = md.tel_reason;

                item.i_UpdateUserID = this.UserId;
                item.i_UpdateDateTime = DateTime.Now;
                item.i_UpdateDeptID = this.departmentId;

                await db0.SaveChangesAsync();
                r.result = true;
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
        public async Task<IHttpActionResult> Post([FromBody]ScheduleDetail md)
        {
            md.schedule_detail_id = GetNewId(ProcCore.Business.CodeTable.ScheduleDetail);
            ResultInfo r = new ResultInfo();
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
                if (md.is_detailInsert)
                {
                    md.tel_day = DateTime.Parse(DateTime.Now.ToShortDateString());
                }

                md.i_InsertUserID = this.UserId;
                md.i_InsertDateTime = DateTime.Now;
                md.i_InsertDeptID = this.departmentId;
                md.company_id = this.companyId;
                md.i_Lang = "zh-TW";

                db0.ScheduleDetail.Add(md);
                await db0.SaveChangesAsync();

                r.result = true;
                r.id = md.schedule_detail_id;
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
        public async Task<IHttpActionResult> Delete([FromUri]int[] ids)
        {
            ResultInfo r = new ResultInfo();
            try
            {
                db0 = getDB0();

                foreach (var id in ids)
                {
                    item = new ScheduleDetail() { schedule_detail_id = id };
                    db0.ScheduleDetail.Attach(item);
                    db0.ScheduleDetail.Remove(item);
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
