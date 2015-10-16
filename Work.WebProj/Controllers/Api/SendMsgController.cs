using DotWeb.Helpers;
using ProcCore.Business.DB0;
using ProcCore.HandleResult;
using ProcCore.WebCore;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;

namespace DotWeb.Api
{
    public class SendMsgController : ajaxApi<SendMsg, q_SendMsg>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.SendMsg.FindAsync(id);
                r = new ResultInfo<SendMsg>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_SendMsg q)
        {
            #region 連接BusinessLogicLibary資料庫並取得資料

            using (db0 = getDB0())
            {
                var qr = db0.SendMsg
                    .Where(x => x.send_type == q.send_type)
                    .OrderByDescending(x => x.sort).AsQueryable();


                if (q.title != null)
                {
                    qr = qr.Where(x => x.title.Contains(q.title));
                }

                if (q.is_complete != null)
                {
                    qr = qr.Where(x => x.is_complete == q.is_complete);
                }
                if (q.is_send != null)
                {
                    qr = qr.Where(x => x.is_send == q.is_send);
                }

                var result = qr.Select(x => new m_SendMsg()
                {
                    send_msg_id = x.send_msg_id,
                    send_day = x.send_day,
                    title = x.title,
                    sort = x.sort,
                    is_send = x.is_send,
                    is_complete = x.is_complete
                });


                int page = (q.page == null ? 1 : (int)q.page);
                int position = PageCount.PageInfo(page, this.defPageSize, qr.Count());
                var segment = await result.Skip(position).Take(this.defPageSize).ToListAsync();

                return Ok<GridInfo<m_SendMsg>>(new GridInfo<m_SendMsg>()
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
        public async Task<IHttpActionResult> Put([FromBody]SendMsg md)
        {
            ResultInfo r = new ResultInfo();
            try
            {
                db0 = getDB0();

                item = await db0.SendMsg.FindAsync(md.send_msg_id);
                item.send_day = md.send_day;
                item.is_complete = md.is_complete;
                item.sort = md.sort;
                item.title = md.title;
                item.send_content = md.send_content;


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
        public async Task<IHttpActionResult> Post([FromBody]SendMsg md)
        {
            md.send_msg_id = GetNewId(ProcCore.Business.CodeTable.SendMsg);
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
                #region 發送條件新增對應
                if (md.send_type == (int)SendType.SendMsgByFactor)
                {
                    List<int> customer_id = new List<int>();
                    var getItem = db0.ScheduleDetail
                                    .Where(x => x.tel_day == md.send_day)
                                    .Select(x => new m_ScheduleDetail { customer_id = x.customer_id, tel_reason = x.tel_reason });
                    if (md.send_factor == (int)SendFactor.FirstPayment)
                    {
                        customer_id = getItem.Where(x => x.tel_reason == (int)SendFactor.FirstPayment).Select(x => x.customer_id).Distinct().ToList();
                    }
                    if (md.send_factor == (int)SendFactor.SesameOil)
                    {
                        customer_id = getItem.Where(x => x.tel_reason == (int)SendFactor.SesameOil).Select(x => x.customer_id).Distinct().ToList();
                    }
                    if (md.send_factor == (int)SendFactor.BalancePayment)
                    {
                        customer_id = getItem.Where(x => x.tel_reason == (int)SendFactor.BalancePayment).Select(x => x.customer_id).Distinct().ToList();
                    }

                    foreach (var id in customer_id)
                    {
                        var detailItem = new SendMsgOfCustomer()
                        {
                            customer_id = id,
                            send_msg_id = md.send_msg_id,
                            i_InsertUserID = this.UserId,
                            i_InsertDateTime = DateTime.Now,
                            i_InsertDeptID = this.departmentId,
                            i_Lang = "zh-TW"
                        };
                        db0.SendMsgOfCustomer.Add(detailItem);
                    }
                }
                #endregion

                md.i_InsertUserID = this.UserId;
                md.i_InsertDateTime = DateTime.Now;
                md.i_InsertDeptID = this.departmentId;
                md.company_id = this.companyId;
                md.i_Lang = "zh-TW";

                db0.SendMsg.Add(md);
                await db0.SaveChangesAsync();

                r.result = true;
                r.id = md.send_msg_id;
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
                    bool check = db0.SendMsgOfCustomer.Any(x => x.send_msg_id == id);
                    if (check)
                    {
                        r.result = false;
                        r.message = Resources.Res.Log_Err_Delete_DetailExist;
                        return Ok(r);
                    }
                    item = new SendMsg() { send_msg_id = id };
                    db0.SendMsg.Attach(item);
                    db0.SendMsg.Remove(item);
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
