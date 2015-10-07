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
    public class GiftRecordController : ajaxApi<GiftRecord, q_GiftRecord>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.GiftRecord.FindAsync(id);
                var getCustomer = await db0.Customer.FindAsync(item.customer_id);
                double total = db0.RecordDetail.Where(x => x.product_record_id == item.product_record_id).Sum(x => x.subtotal);
                item.totle_price = total;

                item.record_day = item.ProductRecord.record_day;
                item.customer_name = getCustomer.customer_name;
                item.name = item.CustomerBorn.mom_name;
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

                r = new ResultInfo<GiftRecord>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_GiftRecord q)
        {
            #region 連接BusinessLogicLibary資料庫並取得資料

            using (db0 = getDB0())
            {
                var qr = db0.GiftRecord
                    .OrderByDescending(x => x.gift_record_id).AsQueryable();


                if (q.name != null)
                {
                    qr = qr.Where(x => x.CustomerBorn.mom_name.Contains(q.name) ||
                                       x.record_sn.Contains(q.name) ||
                                       x.CustomerBorn.sno.Contains(q.name) ||
                                       x.CustomerBorn.tel_1.Contains(q.name));
                }

                if (q.activity_name != null)
                {
                    qr = qr.Where(x => x.Activity.activity_name.Contains(q.activity_name));
                }

                if (q.receive_state != null)
                {
                    qr = qr.Where(x => x.receive_state == q.receive_state);
                }

                var result = qr.Select(x => new m_GiftRecord()
                {
                    gift_record_id = x.gift_record_id,
                    product_record_id = x.product_record_id,
                    record_sn = x.record_sn,
                    mom_name = x.CustomerBorn.mom_name,
                    sno=x.CustomerBorn.sno,
                    tel_1=x.CustomerBorn.tel_1,
                    activity_name = x.Activity.activity_name,
                    receive_state = x.receive_state
                });


                int page = (q.page == null ? 1 : (int)q.page);
                int position = PageCount.PageInfo(page, this.defPageSize, qr.Count());
                var segment = await result.Skip(position).Take(this.defPageSize).ToListAsync();

                return Ok<GridInfo<m_GiftRecord>>(new GridInfo<m_GiftRecord>()
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
        public async Task<IHttpActionResult> Put([FromBody]GiftRecord md)
        {
            ResultInfo r = new ResultInfo();
            try
            {
                db0 = getDB0();

                item = await db0.GiftRecord.FindAsync(md.gift_record_id);
                item.product_record_id = md.product_record_id;
                item.record_sn = md.record_sn;
                item.customer_id = md.customer_id;
                item.born_id = md.born_id;
                item.activity_id = md.activity_id;
                item.receive_state = md.receive_state;
                item.memo = md.memo;


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
        public async Task<IHttpActionResult> Post([FromBody]GiftRecord md)
        {
            md.gift_record_id = GetNewId(ProcCore.Business.CodeTable.GiftRecord);
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

                md.i_InsertUserID = this.UserId;
                md.i_InsertDateTime = DateTime.Now;
                md.i_InsertDeptID = this.departmentId;
                md.i_Lang = "zh-TW";

                db0.GiftRecord.Add(md);
                await db0.SaveChangesAsync();

                r.result = true;
                r.id = md.gift_record_id;
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
                    item = new GiftRecord() { gift_record_id = id };
                    db0.GiftRecord.Attach(item);
                    db0.GiftRecord.Remove(item);
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
