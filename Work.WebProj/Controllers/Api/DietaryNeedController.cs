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
    public class DietaryNeedController : ajaxApi<DietaryNeed, q_DietaryNeed>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.DietaryNeed.FindAsync(id);
                r = new ResultInfo<DietaryNeed>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_DietaryNeed q)
        {
            #region 連接BusinessLogicLibary資料庫並取得資料

            using (db0 = getDB0())
            {
                var qr = db0.DietaryNeed
                    .Where(x => x.company_id == this.companyId)
                    .OrderByDescending(x => x.sort).AsQueryable();


                if (q.name != null)
                {//簡稱或全名有重複
                    qr = qr.Where(x => x.name.Contains(q.name) || x.short_name.Contains(q.name));
                }
                if (q.i_Hide != null)
                {
                    qr = qr.Where(x => x.i_Hide == q.i_Hide);
                }

                var result = qr.Select(x => new m_DietaryNeed()
                {
                    dietary_need_id = x.dietary_need_id,
                    short_name = x.short_name,
                    name = x.name,
                    is_correspond = x.is_correspond,
                    sort = x.sort,
                    i_Hide = x.i_Hide
                });


                int page = (q.page == null ? 1 : (int)q.page);
                int position = PageCount.PageInfo(page, this.defPageSize, qr.Count());
                var segment = await result.Skip(position).Take(this.defPageSize).ToListAsync();

                return Ok<GridInfo<m_DietaryNeed>>(new GridInfo<m_DietaryNeed>()
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
        public async Task<IHttpActionResult> Put([FromBody]DietaryNeed md)
        {
            ResultInfo r = new ResultInfo();
            try
            {
                db0 = getDB0();

                #region 重複檢查
                bool check_name = db0.DietaryNeed.Any(x => x.short_name == md.short_name & x.dietary_need_id != md.dietary_need_id);
                if (check_name)
                {
                    if (check_name)
                    {
                        r.message = string.Format(Resources.Res.Log_Err_RepeatName, "需求元素名稱");
                        r.result = false;
                        return Ok(r);
                    }
                }
                #endregion

                item = await db0.DietaryNeed.FindAsync(md.dietary_need_id);
                item.name = md.name;
                item.short_name = md.short_name;
                item.is_correspond = md.is_correspond;
                item.is_breakfast = md.is_breakfast;
                item.is_lunch = md.is_lunch;
                item.is_dinner = md.is_dinner;
                item.i_Hide = md.i_Hide;
                item.sort = md.sort;
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
        public async Task<IHttpActionResult> Post([FromBody]DietaryNeed md)
        {
            md.dietary_need_id = GetNewId(ProcCore.Business.CodeTable.DietaryNeed);
            md.name = md.short_name;
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
                #region 重複檢查
                bool check_name = db0.DietaryNeed.Any(x => x.short_name == md.short_name);
                if (check_name)
                {
                    if (check_name)
                    {
                        r.message = string.Format(Resources.Res.Log_Err_RepeatName, "需求元素名稱");
                        r.result = false;
                        return Ok(r);
                    }
                }
                #endregion
                md.i_InsertUserID = this.UserId;
                md.i_InsertDateTime = DateTime.Now;
                md.i_InsertDeptID = this.departmentId;
                md.company_id = this.companyId;
                md.i_Lang = "zh-TW";

                db0.DietaryNeed.Add(md);
                await db0.SaveChangesAsync();

                r.result = true;
                r.id = md.dietary_need_id;
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
                    bool check = db0.DietaryNeedOfElement.Any(x => x.dietary_need_id == id);
                    if (check)
                    {
                        r.result = false;
                        r.message = Resources.Res.Log_Err_Delete_DetailExist;
                        return Ok(r);
                    }
                    item = new DietaryNeed() { dietary_need_id = id };
                    db0.DietaryNeed.Attach(item);
                    db0.DietaryNeed.Remove(item);
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
