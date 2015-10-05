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
    public class AccountsPayableController : ajaxApi<AccountsPayable, q_AccountsPayable>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.AccountsPayable.FindAsync(id);
                item.customer_name = item.Customer.customer_name;
                item.tel_1 = item.Customer.tel_1;
                item.tel_2 = item.Customer.tel_2;
                r = new ResultInfo<AccountsPayable>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_AccountsPayable q)
        {
            #region 連接BusinessLogicLibary資料庫並取得資料

            using (db0 = getDB0())
            {
                var qr = db0.AccountsPayable
                    .OrderByDescending(x => x.record_sn).AsQueryable();


                if (q.word != null)
                {
                    qr = qr.Where(x => x.Customer.customer_name.Contains(q.word) ||
                                      x.Customer.sno.Contains(q.word) ||
                                      x.Customer.tel_1.Contains(q.word) ||
                                      x.record_sn.Contains(q.word));
                }


                var result = qr.Select(x => new m_AccountsPayable()
                {
                    accounts_payable_id = x.accounts_payable_id,
                    customer_id = x.customer_id,
                    product_record_id = x.product_record_id,
                    record_sn = x.record_sn,
                    is_close = x.is_close,
                    customer_name = x.Customer.customer_name,
                    sno = x.Customer.sno,
                    tel_1 = x.Customer.tel_1
                });


                int page = (q.page == null ? 1 : (int)q.page);
                int position = PageCount.PageInfo(page, this.defPageSize, qr.Count());
                var segment = await result.Skip(position).Take(this.defPageSize).ToListAsync();

                return Ok<GridInfo<m_AccountsPayable>>(new GridInfo<m_AccountsPayable>()
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
        public async Task<IHttpActionResult> Put([FromBody]AccountsPayable md)
        {
            ResultInfo r = new ResultInfo();
            try
            {
                db0 = getDB0();

                item = await db0.AccountsPayable.FindAsync(md.accounts_payable_id);

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
        public async Task<IHttpActionResult> Post([FromBody]AccountsPayable md)
        {
            md.accounts_payable_id = GetNewId(ProcCore.Business.CodeTable.AccountsPayable);
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

                db0.AccountsPayable.Add(md);
                await db0.SaveChangesAsync();

                r.result = true;
                r.id = md.accounts_payable_id;
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
                    item = new AccountsPayable() { accounts_payable_id = id };
                    db0.AccountsPayable.Attach(item);
                    db0.AccountsPayable.Remove(item);
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
