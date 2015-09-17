using DotWeb.Helpers;
using ProcCore.Business.DB0;
using ProcCore.HandleResult;
using ProcCore.WebCore;
using System;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;

namespace DotWeb.Api
{
    public class CustomerController : ajaxApi<Customer, q_Customer>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.Customer.FindAsync(id);
                r = new ResultInfo<Customer>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_Customer q)
        {
            #region 連接BusinessLogicLibary資料庫並取得資料

            using (db0 = getDB0())
            {
                var qr = db0.Customer
                    .OrderByDescending(x => x.customer_id).AsQueryable();

                if (q.customer_name != null)
                {
                    qr = qr.Where(x => x.customer_name.Contains(q.customer_name));
                }

                if (q.tel != null)
                {
                    qr = qr.Where(x => x.tel_1.Contains(q.tel));
                }
                if (q.customer_type != null)
                {
                    qr = qr.Where(x => x.customer_type == q.customer_type);
                }

                if (q.address != null)
                {
                    qr = qr.Where(x => x.tw_address_1.Contains(q.address));
                }

                if (q.city != null)
                {
                    qr = qr.Where(x => x.tw_city_1 == q.city);
                }

                if (q.country != null)
                {
                    qr = qr.Where(x => x.tw_country_1 == q.country);
                }

                var result = qr.Select(x => new m_Customer()
                {
                    customer_id = x.customer_id,
                    customer_sn = x.customer_sn,
                    customer_name = x.customer_name,
                    customer_type = x.customer_type,
                    tw_city_1 = x.tw_city_1,
                    tw_country_1 = x.tw_country_1,
                    tw_address_1 = x.tw_address_1,
                    tel_1 = x.tel_1,
                    tel_2 = x.tel_2,
                    born_times = 0
                });

                int page = (q.page == null ? 1 : (int)q.page);
                int position = PageCount.PageInfo(page, this.defPageSize, qr.Count());
                var segment = await result.Skip(position).Take(this.defPageSize).ToListAsync();
                foreach (var item in segment)
                {
                    int count = db0.CustomerBorn.Where(x => x.customer_id == item.customer_id).Count();
                    item.born_times = count;
                }
                return Ok<GridInfo<m_Customer>>(new GridInfo<m_Customer>()
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
        public async Task<IHttpActionResult> Put([FromBody]Customer md)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                db0 = getDB0();

                item = await db0.Customer.FindAsync(md.customer_id);
                item.customer_name = md.customer_name;
                item.customer_type = md.customer_type;
                item.sno = md.sno;
                item.birthday = md.birthday;
                item.tel_1 = md.tel_1;
                item.tel_2 = md.tel_2;
                item.tw_zip_1 = md.tw_zip_1;
                item.tw_zip_2 = md.tw_zip_2;
                item.tw_city_1 = md.tw_city_1;
                item.tw_city_2 = md.tw_city_2;
                item.tw_country_1 = md.tw_country_1;
                item.tw_country_2 = md.tw_country_2;
                item.tw_address_1 = md.tw_address_1;
                item.tw_address_2 = md.tw_address_2;
                item.memo = md.memo;
                item.app_account = md.app_account;
                item.app_password = md.app_password;

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
        public async Task<IHttpActionResult> Post([FromBody]Customer md)
        {
            ResultInfo r = new ResultInfo();

            md.customer_id = GetNewId(ProcCore.Business.CodeTable.Customer);
            md.customer_sn = md.customer_id.ToString();
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
                db0.Customer.Add(md);
                await db0.SaveChangesAsync();

                r.result = true;
                r.id = md.customer_id;
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
                    bool check = db0.CustomerBorn.Any(x => x.customer_id == id);
                    if (check)
                    {
                        r.result = false;
                        r.message = Resources.Res.Log_Err_Delete_DetailExist;
                        return Ok(r);
                    }
                    item = new Customer() { customer_id = id };
                    db0.Customer.Attach(item);
                    db0.Customer.Remove(item);
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
