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
    public class MenuCopyTemplateController : ajaxApi<MenuCopyTemplate, q_MenuCopyTemplate>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.MenuCopyTemplate.FindAsync(id);
                r = new ResultInfo<MenuCopyTemplate>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_MenuCopyTemplate q)
        {
            #region 連接BusinessLogicLibary資料庫並取得資料

            using (db0 = getDB0())
            {
                var qr = db0.MenuCopyTemplate
                    .Where(x => x.company_id == this.companyId)
                    .OrderByDescending(x => x.menu_copy_template_id).AsQueryable();


                if (q.keyword != null)
                {
                    qr = qr.Where(x => x.template_name.Contains(q.keyword));
                }

                var result = qr.Select(x => new m_MenuCopyTemplate()
                {
                    menu_copy_template_id = x.menu_copy_template_id,
                    template_name = x.template_name,
                    memo = x.memo
                });


                int page = (q.page == null ? 1 : (int)q.page);
                int position = PageCount.PageInfo(page, this.defPageSize, qr.Count());
                var segment = await result.Skip(position).Take(this.defPageSize).ToListAsync();

                return Ok<GridInfo<m_MenuCopyTemplate>>(new GridInfo<m_MenuCopyTemplate>()
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
        public async Task<IHttpActionResult> Put([FromBody]MenuCopyTemplate md)
        {
            ResultInfo r = new ResultInfo();
            try
            {
                db0 = getDB0();

                item = await db0.MenuCopyTemplate.FindAsync(md.menu_copy_template_id);
                item.template_name = md.template_name;
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
        public async Task<IHttpActionResult> Post([FromBody]MenuCopyTemplate md)
        {
            md.menu_copy_template_id = GetNewId(ProcCore.Business.CodeTable.MenuCopyTemplate);
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

                db0.MenuCopyTemplate.Add(md);
                await db0.SaveChangesAsync();

                r.result = true;
                r.id = md.menu_copy_template_id;
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
                    bool check = db0.MenuCopy.Any(x => x.menu_copy_template_id == id);
                    if (check)
                    {
                        r.result = false;
                        r.message = Resources.Res.Log_Err_Delete_DetailExist;
                        return Ok(r);
                    }
                    item = new MenuCopyTemplate() { menu_copy_template_id = id };
                    db0.MenuCopyTemplate.Attach(item);
                    db0.MenuCopyTemplate.Remove(item);
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
