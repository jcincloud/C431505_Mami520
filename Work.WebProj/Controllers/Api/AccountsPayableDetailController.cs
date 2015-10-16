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
    public class AccountsPayableDetailController : ajaxApi<AccountsPayableDetail, q_AccountsPayableDetail>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.AccountsPayableDetail.FindAsync(id);

                r = new ResultInfo<AccountsPayableDetail>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_AccountsPayableDetail q)
        {
            #region 連接BusinessLogicLibary資料庫並取得資料

            using (db0 = getDB0())
            {
                var qr = db0.AccountsPayableDetail
                    .Where(x => x.company_id == this.companyId)
                    .OrderBy(x => x.receipt_day).AsQueryable();


                if (q.word != null)
                {
                    // qr = qr.Where(x => );
                }


                var result = qr.Select(x => new m_AccountsPayableDetail()
                {
                    accounts_payable_detail_id=x.accounts_payable_detail_id,
                    accounts_payable_id = x.accounts_payable_id,
                    receipt_day = x.receipt_day,//收款日期
                    meal_type = x.meal_type,//收款餐別
                    receipt_person = x.receipt_person,//收款人員
                    receipt_item = x.receipt_item,//收款項目
                    receipt_sn = x.receipt_sn,//收款單號
                    actual_receipt = x.actual_receipt//本次實收
                });


                int page = (q.page == null ? 1 : (int)q.page);
                int position = PageCount.PageInfo(page, this.defPageSize, qr.Count());
                var segment = await result.Skip(position).Take(this.defPageSize).ToListAsync();

                return Ok<GridInfo<m_AccountsPayableDetail>>(new GridInfo<m_AccountsPayableDetail>()
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
        public async Task<IHttpActionResult> Put([FromBody]AccountsPayableDetail md)
        {
            ResultInfo r = new ResultInfo();
            try
            {
                db0 = getDB0();

                item = await db0.AccountsPayableDetail.FindAsync(md.accounts_payable_detail_id);

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
        public async Task<IHttpActionResult> Post([FromBody]AccountsPayableDetail md)
        {
            md.accounts_payable_detail_id = GetNewId(ProcCore.Business.CodeTable.AccountsPayableDetail);
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
                md.company_id = this.companyId;
                md.i_Lang = "zh-TW";

                db0.AccountsPayableDetail.Add(md);
                await db0.SaveChangesAsync();

                r.result = true;
                r.id = md.accounts_payable_detail_id;
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
                    item = new AccountsPayableDetail() { accounts_payable_detail_id = id };
                    db0.AccountsPayableDetail.Attach(item);
                    db0.AccountsPayableDetail.Remove(item);
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
