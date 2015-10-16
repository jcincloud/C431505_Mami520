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
    public class CustomerNeedController : ajaxApi<CustomerNeed, q_CustomerNeed>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.CustomerNeed.FindAsync(id);

                var getCustomerBorn = await db0.CustomerBorn.FindAsync(item.born_id);
                item.meal_id = getCustomerBorn.meal_id;
                item.name = getCustomerBorn.mom_name;
                item.tel_1 = getCustomerBorn.tel_1;
                item.tel_2 = getCustomerBorn.tel_2;
                item.tw_zip_1 = getCustomerBorn.tw_zip_1;
                item.tw_city_1 = getCustomerBorn.tw_city_1;
                item.tw_country_1 = getCustomerBorn.tw_country_1;
                item.tw_address_1 = getCustomerBorn.tw_address_1;

                r = new ResultInfo<CustomerNeed>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_CustomerNeed q)
        {
            #region 連接BusinessLogicLibary資料庫並取得資料

            using (db0 = getDB0())
            {
                var qr = db0.CustomerNeed
                    .Where(x => x.company_id == this.companyId)
                    .OrderBy(x=>x.CustomerBorn.mom_name).AsQueryable();


                if (q.name != null)
                {//簡稱或全名有重複
                    qr = qr.Where(x => x.CustomerBorn.mom_name.Contains(q.name));
                }
                if (q.tel_1 != null)
                {
                    qr = qr.Where(x => x.CustomerBorn.tel_1.Contains(q.tel_1));
                }
                if (q.tel_2 != null)
                {
                    qr = qr.Where(x => x.CustomerBorn.tel_2.Contains(q.tel_2));
                }
                if (q.meal_id != null)
                {
                    qr = qr.Where(x => x.CustomerBorn.meal_id.Contains(q.meal_id));
                }

                var result = qr.Select(x => new m_CustomerNeed()
                {
                    customer_need_id = x.customer_need_id,
                    customer_id = x.customer_id,
                    born_id = x.born_id,
                    name = x.CustomerBorn.mom_name,
                    tel_1 = x.CustomerBorn.tel_1,
                    tel_2 = x.CustomerBorn.tel_2,
                    meal_id = x.CustomerBorn.meal_id
                });


                int page = (q.page == null ? 1 : (int)q.page);
                int position = PageCount.PageInfo(page, this.defPageSize, qr.Count());
                var segment = await result.Skip(position).Take(this.defPageSize).ToListAsync();

                return Ok<GridInfo<m_CustomerNeed>>(new GridInfo<m_CustomerNeed>()
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
        public async Task<IHttpActionResult> Put([FromBody]CustomerNeed md)
        {
            ResultInfo r = new ResultInfo();
            try
            {
                db0 = getDB0();

                item = await db0.CustomerNeed.FindAsync(md.customer_need_id);
                item.customer_id = md.customer_id;
                item.born_id = md.born_id;
                item.meal_id = md.meal_id;
                item.memo = md.memo;


                item.i_UpdateUserID = this.UserId;
                item.i_UpdateDateTime = DateTime.Now;
                item.i_UpdateDeptID = this.departmentId;

                await db0.SaveChangesAsync();
                r.result = true;
                r.id = md.customer_need_id;
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
        public async Task<IHttpActionResult> Post([FromBody]CustomerNeed md)
        {
            md.customer_need_id = GetNewId(ProcCore.Business.CodeTable.CustomerNeed);
            ResultInfo r = new ResultInfo();
            //if (!ModelState.IsValid)
            //{
            //    r.message = ModelStateErrorPack();
            //    r.result = false;
            //    return Ok(r);
            //}

            try
            {
                #region working a
                db0 = getDB0();

                md.i_InsertUserID = this.UserId;
                md.i_InsertDateTime = DateTime.Now;
                md.i_InsertDeptID = this.departmentId;
                md.company_id = this.companyId;
                md.i_Lang = "zh-TW";

                db0.CustomerNeed.Add(md);
                await db0.SaveChangesAsync();

                r.result = true;
                r.id = md.customer_need_id;
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
                    bool check = db0.CustomerOfDietaryNeed.Any(x => x.customer_need_id == id);
                    if (check)
                    {
                        r.result = false;
                        r.message = Resources.Res.Log_Err_Delete_DetailExist;
                        return Ok(r);
                    }
                    item = new CustomerNeed() { customer_need_id = id };
                    db0.CustomerNeed.Attach(item);
                    db0.CustomerNeed.Remove(item);
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
