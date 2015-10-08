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
    public class ConstituteFoodController : ajaxApi<ConstituteFood, q_ConstituteFood>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.ConstituteFood.FindAsync(id);
                r = new ResultInfo<ConstituteFood>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_ConstituteFood q)
        {
            #region 連接BusinessLogicLibary資料庫並取得資料

            using (db0 = getDB0())
            {
                var qr = db0.ConstituteFood
                    .OrderByDescending(x => new { c_sort = x.All_Category_L2.sort, x.sort }).AsQueryable();


                if (q.constitute_name != null)
                {
                    qr = qr.Where(x => x.constitute_name.Contains(q.constitute_name));
                }

                if (q.category_id != null)
                {
                    qr = qr.Where(x => x.category_id == q.category_id);
                }
                if (q.i_Hide != null)
                {
                    qr = qr.Where(x => x.i_Hide == q.i_Hide);
                }

                var result = qr.Select(x => new m_ConstituteFood()
                {
                    constitute_id = x.constitute_id,
                    constitute_name = x.constitute_name,
                    category_id = x.category_id,
                    sort = x.sort,
                    i_Hide = x.i_Hide
                });


                int page = (q.page == null ? 1 : (int)q.page);
                int position = PageCount.PageInfo(page, this.defPageSize, qr.Count());
                var segment = await result.Skip(position).Take(this.defPageSize).ToListAsync();

                return Ok<GridInfo<m_ConstituteFood>>(new GridInfo<m_ConstituteFood>()
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
        public async Task<IHttpActionResult> Put([FromBody]ConstituteFood md)
        {
            ResultInfo r = new ResultInfo();
            try
            {
                db0 = getDB0();

                item = await db0.ConstituteFood.FindAsync(md.constitute_id);
                item.constitute_name = md.constitute_name;
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
        public async Task<IHttpActionResult> Post([FromBody]ConstituteFood md)
        {
            md.constitute_id = GetNewId(ProcCore.Business.CodeTable.ConstituteFood);
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

                db0.ConstituteFood.Add(md);
                await db0.SaveChangesAsync();

                r.result = true;
                r.id = md.constitute_id;
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
                    bool check = db0.ConstituteOfElement.Any(x => x.constitute_id == id);
                    if (check)
                    {
                        r.result = false;
                        r.message = Resources.Res.Log_Err_Delete_DetailExist;
                        return Ok(r);
                    }
                    item = new ConstituteFood() { constitute_id = id };
                    db0.ConstituteFood.Attach(item);
                    db0.ConstituteFood.Remove(item);
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
