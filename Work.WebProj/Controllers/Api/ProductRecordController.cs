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
    public class ProductRecordController : ajaxApi<ProductRecord, q_ProductRecord>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.ProductRecord.FindAsync(id);
                var getCustomer = await db0.Customer.FindAsync(item.customer_id);
                var getCustomerBorn = await db0.CustomerBorn.FindAsync(item.born_id);
                item.customer_type = getCustomer.customer_type;
                item.customer_name = getCustomer.customer_name;
                item.meal_id = getCustomerBorn.meal_id;
                item.name = getCustomerBorn.mom_name;
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
                item.born_memo = getCustomerBorn.memo;

                r = new ResultInfo<ProductRecord>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_ProductRecord q)
        {
            #region 連接BusinessLogicLibary資料庫並取得資料

            using (db0 = getDB0())
            {
                var qr = db0.ProductRecord
                    .Where(x => x.company_id == this.companyId)
                    .OrderByDescending(x => x.record_day).AsQueryable();

                if (q.word != null)
                {
                    qr = qr.Where(x => x.CustomerBorn.mom_name.Contains(q.word) ||
                                       x.CustomerBorn.meal_id.Contains(q.word) ||
                                       x.CustomerBorn.tel_1.Contains(q.word) ||
                                       x.CustomerBorn.tel_2.Contains(q.word));
                }
                if (q.name != null)
                {
                    qr = qr.Where(x => x.CustomerBorn.mom_name.Contains(q.name));
                }
                if (q.meal_id != null)
                {
                    qr = qr.Where(x => x.CustomerBorn.meal_id.Contains(q.meal_id));
                }

                if (q.is_close != null)
                {
                    qr = qr.Where(x => x.is_close == q.is_close);
                }

                if (q.is_receipt != null)
                {
                    qr = qr.Where(x => x.is_receipt == q.is_receipt);
                }
                if (q.start_date != null && q.end_date != null)
                {
                    DateTime end = ((DateTime)q.end_date).AddDays(1);
                    qr = qr.Where(x => x.record_day >= q.start_date && x.record_day < end);
                }

                if (q.customer_type != null)
                {
                    qr = qr.Where(x => x.Customer.customer_type == q.customer_type);
                }
                if(q.born_id!=null)
                {
                    qr = qr.Where(x => x.born_id == q.born_id);
                }
                var result = qr.Select(x => new m_ProductRecord()
                {
                    product_record_id = x.product_record_id,
                    customer_id = x.customer_id,
                    born_id = x.born_id,
                    is_receipt = x.is_receipt,
                    is_close = x.is_close,
                    record_sn = x.record_sn,
                    record_day = x.record_day,
                    name = x.CustomerBorn.mom_name,
                    meal_id = x.CustomerBorn.meal_id,
                    tel_1 = x.CustomerBorn.tel_1,
                    customer_type = x.Customer.customer_type
                });


                int page = (q.page == null ? 1 : (int)q.page);
                int position = PageCount.PageInfo(page, this.defPageSize, qr.Count());
                var segment = await result.Skip(position).Take(this.defPageSize).ToListAsync();

                return Ok<GridInfo<m_ProductRecord>>(new GridInfo<m_ProductRecord>()
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
        public async Task<IHttpActionResult> Put([FromBody]ProductRecord md)
        {
            ResultInfo r = new ResultInfo();
            try
            {
                db0 = getDB0();

                item = await db0.ProductRecord.FindAsync(md.product_record_id);
                item.customer_id = md.customer_id;
                item.born_id = md.born_id;
                item.record_sn = md.record_sn;
                item.record_day = md.record_day;
                item.is_close = md.is_close;
                item.is_receipt = md.is_receipt;


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
        public async Task<IHttpActionResult> Post([FromBody]ProductRecord md)
        {
            md.product_record_id = GetNewId(ProcCore.Business.CodeTable.ProductRecord);
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

                md.record_sn = md.product_record_id.ToString();
                md.record_day = DateTime.Now;

                md.i_InsertUserID = this.UserId;
                md.i_InsertDateTime = DateTime.Now;
                md.i_InsertDeptID = this.departmentId;
                md.company_id = this.companyId;
                md.i_Lang = "zh-TW";

                db0.ProductRecord.Add(md);

                await db0.SaveChangesAsync();

                r.result = true;
                r.id = md.product_record_id;
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
                    var check_gift = db0.GiftRecord.Any(x => x.product_record_id == id);
                    var check_accounts_payable = db0.AccountsPayable.Any(x => x.product_record_id == id);
                    if (check_gift)
                    {
                        r.result = false;
                        r.message = Resources.Res.Log_Err_PRecord_Delete_GiftRecord;
                        return Ok(r);
                    }
                    if (check_accounts_payable)
                    {
                        r.result = false;
                        r.message = Resources.Res.Log_Err_PRecord_Delete_AccountsPayable;
                        return Ok(r);
                    }

                    item = new ProductRecord() { product_record_id = id };
                    db0.ProductRecord.Attach(item);
                    db0.ProductRecord.Remove(item);
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
