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
    public class DailyMenuController : ajaxApi<DailyMenu, q_DailyMenu>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.DailyMenu.FindAsync(id);
                r = new ResultInfo<DailyMenu>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_DailyMenu q)
        {
            #region 連接BusinessLogicLibary資料庫並取得資料

            using (db0 = getDB0())
            {
                var qr = db0.DailyMenu
                    .OrderByDescending(x => new { x.day, x.meal_type }).AsQueryable();


                if (q.start_date != null && q.end_date != null)
                {
                    DateTime end = ((DateTime)q.end_date).AddDays(1);
                    qr = qr.Where(x => x.day >= q.start_date && x.day < end);
                }

                if (q.meal_type != null)
                {
                    qr = qr.Where(x => x.meal_type == q.meal_type);
                }

                var result = qr.Select(x => new m_DailyMenu()
                {
                    dail_menu_id = x.dail_menu_id,
                    day = x.day,
                    meal_type = x.meal_type
                });


                int page = (q.page == null ? 1 : (int)q.page);
                int position = PageCount.PageInfo(page, this.defPageSize, qr.Count());
                var segment = await result.Skip(position).Take(this.defPageSize).ToListAsync();

                return Ok<GridInfo<m_DailyMenu>>(new GridInfo<m_DailyMenu>()
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
        public async Task<IHttpActionResult> Put([FromBody]DailyMenu md)
        {
            ResultInfo r = new ResultInfo();
            try
            {
                db0 = getDB0();
                bool check = db0.DailyMenu.Any(x => x.day == md.day & x.meal_type == md.meal_type & x.dail_menu_id != md.dail_menu_id);
                if (check)
                {//不能有同日期同餐別的資料存在
                    r.message = "已有同日期同餐別的資料存在!!";
                    r.result = false;
                    return Ok(r);
                }

                item = await db0.DailyMenu.FindAsync(md.dail_menu_id);
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
        public async Task<IHttpActionResult> Post([FromBody]DailyMenu md)
        {
            md.dail_menu_id = GetNewId(ProcCore.Business.CodeTable.DailyMenu);
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
                bool check = db0.DailyMenu.Any(x => x.day == md.day & x.meal_type == md.meal_type);
                if (check)
                {//不能有同日期同餐別的資料存在
                    r.message = "已有同日期同餐別的資料存在!!";
                    r.result = false;
                    return Ok(r);
                }

                md.i_InsertUserID = this.UserId;
                md.i_InsertDateTime = DateTime.Now;
                md.i_InsertDeptID = this.departmentId;
                md.i_Lang = "zh-TW";

                db0.DailyMenu.Add(md);
                await db0.SaveChangesAsync();

                r.result = true;
                r.id = md.dail_menu_id;
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
                    item = new DailyMenu() { dail_menu_id = id };
                    db0.DailyMenu.Attach(item);
                    db0.DailyMenu.Remove(item);
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
