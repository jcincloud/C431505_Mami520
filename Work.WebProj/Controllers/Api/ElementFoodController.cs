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
    public class ElementFoodController : ajaxApi<ElementFood, q_ElementFood>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.ElementFood.FindAsync(id);
                r = new ResultInfo<ElementFood>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_ElementFood q)
        {
            #region 連接BusinessLogicLibary資料庫並取得資料

            using (db0 = getDB0())
            {
                var qr = db0.ElementFood
                    .OrderByDescending(x => new { c_sort = x.All_Category_L2.sort, x.sort }).AsQueryable();


                if (q.element_name != null)
                {
                    qr = qr.Where(x => x.element_name.Contains(q.element_name));
                }

                if (q.category_id != null)
                {
                    qr = qr.Where(x => x.category_id == q.category_id);
                }
                if (q.i_Hide != null)
                {
                    qr = qr.Where(x => x.i_Hide == q.i_Hide);
                }

                var result = qr.Select(x => new m_ElementFood()
                {
                    element_id = x.element_id,
                    element_name = x.element_name,
                    category_id = x.category_id,
                    sort = x.sort,
                    i_Hide = x.i_Hide
                });


                int page = (q.page == null ? 1 : (int)q.page);
                int position = PageCount.PageInfo(page, this.defPageSize, qr.Count());
                var segment = await result.Skip(position).Take(this.defPageSize).ToListAsync();

                return Ok<GridInfo<m_ElementFood>>(new GridInfo<m_ElementFood>()
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
        public async Task<IHttpActionResult> Put([FromBody]ElementFood md)
        {
            ResultInfo r = new ResultInfo();
            try
            {
                db0 = getDB0();

                item = await db0.ElementFood.FindAsync(md.element_id);
                item.element_name = md.element_name;
                item.category_id = md.category_id;
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
        public async Task<IHttpActionResult> Post([FromBody]ElementFood md)
        {
            md.element_id = GetNewId(ProcCore.Business.CodeTable.ElementFood);
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

                db0.ElementFood.Add(md);
                await db0.SaveChangesAsync();

                r.result = true;
                r.id = md.element_id;
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
                    item = new ElementFood() { element_id = id };
                    db0.ElementFood.Attach(item);
                    db0.ElementFood.Remove(item);
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
