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
    public class MenuCopyController : ajaxApi<MenuCopy, q_MenuCopy>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.MenuCopy.FindAsync(id);
                r = new ResultInfo<MenuCopy>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_MenuCopy q)
        {
            #region 連接BusinessLogicLibary資料庫並取得資料

            using (db0 = getDB0())
            {
                var qr = db0.MenuCopy
                    .Where(x => x.company_id == this.companyId)
                    .OrderByDescending(x => new { x.day, x.meal_type }).AsQueryable();


                if (q.day != null)
                {
                    qr = qr.Where(x => x.day == q.day);
                }

                if (q.meal_type != null)
                {
                    qr = qr.Where(x => x.meal_type == q.meal_type);
                }

                var result = qr.Select(x => new m_MenuCopy()
                {
                    menu_copy_id = x.menu_copy_id,
                    day = x.day,
                    meal_type = x.meal_type
                });


                int page = (q.page == null ? 1 : (int)q.page);
                int position = PageCount.PageInfo(page, this.defPageSize, qr.Count());
                var segment = await result.Skip(position).Take(this.defPageSize).ToListAsync();

                return Ok<GridInfo<m_MenuCopy>>(new GridInfo<m_MenuCopy>()
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
        public async Task<IHttpActionResult> Put([FromBody]MenuCopy md)
        {
            ResultInfo r = new ResultInfo();
            try
            {
                db0 = getDB0();
                bool check = db0.MenuCopy.Any(x => x.day == md.day & x.meal_type == md.meal_type & x.menu_copy_id != md.menu_copy_id);
                if (check)
                {//不能有同日期同餐別的資料存在
                    r.message = "已有同日期同餐別的資料存在!!";
                    r.result = false;
                    return Ok(r);
                }

                item = await db0.MenuCopy.FindAsync(md.menu_copy_id);
                item.day = md.day;
                item.meal_type = md.meal_type;

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
        public async Task<IHttpActionResult> Post([FromBody]MenuCopy md)
        {
            md.menu_copy_id = GetNewId(ProcCore.Business.CodeTable.MenuCopy);
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
                bool check = db0.MenuCopy.Any(x => x.day == md.day & x.meal_type == md.meal_type);
                if (check)
                {//不能有同日期同餐別的資料存在
                    r.message = "已有同天同餐別的資料存在!!";
                    r.result = false;
                    return Ok(r);
                }

                md.i_InsertUserID = this.UserId;
                md.i_InsertDateTime = DateTime.Now;
                md.i_InsertDeptID = this.departmentId;
                md.company_id = this.companyId;
                md.i_Lang = "zh-TW";

                db0.MenuCopy.Add(md);
                await db0.SaveChangesAsync();

                r.result = true;
                r.id = md.menu_copy_id;
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
                    bool check = db0.MenuCopyOfConstitute.Any(x => x.menu_copy_id == id);
                    if (check)
                    {
                        r.result = false;
                        r.message = Resources.Res.Log_Err_Delete_DetailExist;
                        return Ok(r);
                    }
                    item = new MenuCopy() { menu_copy_id = id };
                    db0.MenuCopy.Attach(item);
                    db0.MenuCopy.Remove(item);
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
