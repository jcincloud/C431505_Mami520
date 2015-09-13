using Newtonsoft.Json;
using ProcCore;
using ProcCore.Business.DB0;
using ProcCore.HandleResult;
using ProcCore.WebCore;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
namespace DotWeb.Api
{
    public class GetActionController : BaseApiController
    {

        public IHttpActionResult GetAllMealID()
        {
            db0 = getDB0();
            try
            {
                var items = db0.MealID
                    .OrderBy(x => x.meal_id)
                    .Where(x => !x.i_Use & !x.i_Hide)
                    .Select(x => new { x.meal_id });

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        public async Task<IHttpActionResult> ChangeMealIDState([FromBody]ParmChangeMealID parm)
        {
            db0 = getDB0();
            try
            {
                var check_old = db0.MealID.Any(x => x.meal_id == parm.old_id);
                var check_new = db0.MealID.Any(x => x.meal_id == parm.new_id & !x.i_Use);

                if (!check_new)
                {//如果發先新id已被使用
                    return Ok(new { result = false, message = "此用餐編號已被使用!" });
                }
                if (check_old)
                {
                    var old_item = await db0.MealID.FindAsync(parm.old_id);
                    old_item.i_Use = false;//將舊id改回未使用狀態
                }
                var new_item = await db0.MealID.FindAsync(parm.new_id);
                new_item.i_Use = true;

                await db0.SaveChangesAsync();
                return Ok(new { result = true });
            }
            finally
            {
                db0.Dispose();
            }
        }
        public async Task<IHttpActionResult> CheckMealID([FromBody]ParmCheckMealID parm)
        {
            db0 = getDB0();
            try
            {
                var check_born = db0.CustomerBorn.Any(x => x.born_id == parm.born_id);//先檢查此筆生產存不存在
                var meal_item = await db0.MealID.FindAsync(parm.meal_id);
                if (!check_born)
                {
                    meal_item.i_Use = false;
                }
                else
                {
                    var born_item = await db0.CustomerBorn.FindAsync(parm.born_id);
                    if (born_item.meal_id != parm.meal_id)
                    {
                        var old_item = await db0.MealID.FindAsync(born_item.meal_id);
                        if (old_item.i_Use)
                        {//如果舊id已經被其他人用
                            born_item.meal_id = parm.meal_id;//換成新id
                        }
                        else
                        {
                            old_item.i_Use = true;
                            meal_item.i_Use = false;
                        }
                    }

                }

                await db0.SaveChangesAsync();
                return Ok(new { result = true });
            }
            finally
            {
                db0.Dispose();
            }
        }
        #region 組合菜單對應基礎菜單
        public IHttpActionResult GetLeftElement([FromUri]ParmGetLeftElement parm)
        {
            db0 = getDB0();
            try
            {
                var element_id = db0.ConstituteOfElement
                    .Where(x => x.constitute_id == parm.constitute_id)
                    .Select(x => x.element_id);

                //設定未啟用i_hide=true的不顯示
                var items = db0.ElementFood.Where(x => !element_id.Contains(x.element_id) & !x.i_Hide).OrderByDescending(x => x.sort).Select(x => new { x.element_id, x.category_id, x.element_name });


                if (parm.name != null)
                {
                    items = items.Where(x => x.element_name.Contains(parm.name));
                }
                if (parm.category_id != null)
                {
                    items = items.Where(x => x.category_id == parm.category_id);
                }
                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetRightElement(int? constitute_id)
        {
            db0 = getDB0();
            try
            {
                var items = from x in db0.ConstituteOfElement
                            join y in db0.ElementFood on x.element_id equals y.element_id
                            where x.constitute_id == constitute_id
                            select new { x.element_id, y.category_id, y.element_name };

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpPost]
        public async Task<IHttpActionResult> PostConstituteOfElement([FromBody]ParmConstituteOfElement parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = db0.ConstituteOfElement.Where(x => x.constitute_id == parm.constitute_id && x.element_id == parm.element_id).FirstOrDefault();
                if (item == null)
                {
                    item = new ConstituteOfElement()
                    {
                        constitute_id = parm.constitute_id,
                        element_id = parm.element_id,
                        i_InsertUserID = this.UserId,
                        i_InsertDateTime = DateTime.Now,
                        i_InsertDeptID = this.departmentId,
                        i_Lang = "zh-TW"
                    };
                    db0.ConstituteOfElement.Add(item);
                }

                await db0.SaveChangesAsync();

                r.result = true;
                r.id = item.constitute_id;
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
        [HttpDelete]
        public async Task<IHttpActionResult> DeleteConstituteOfElement([FromBody]ParmConstituteOfElement parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = await db0.ConstituteOfElement.FindAsync(parm.element_id, parm.constitute_id);
                if (item != null)
                {
                    db0.ConstituteOfElement.Remove(item);
                    await db0.SaveChangesAsync();
                }
                else
                {
                    r.result = false;
                    r.message = "未刪除";
                    return Ok(r);
                }
                r.result = true;
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
        #endregion
        #region 每日菜單對應組合菜單
        public IHttpActionResult GetLeftConstitute([FromUri]ParmGetLeftConstitute parm)
        {
            db0 = getDB0();
            try
            {
                var constitute_id = db0.DailyMenuOfConstitute
                    .Where(x => x.dail_menu_id == parm.dail_menu_id)
                    .Select(x => x.constitute_id);

                //設定未啟用i_hide=true的不顯示
                var items = db0.ConstituteFood.Where(x => !constitute_id.Contains(x.constitute_id) & !x.i_Hide).OrderByDescending(x => x.sort).Select(x => new { x.constitute_id, x.category_id, x.constitute_name });


                if (parm.name != null)
                {
                    items = items.Where(x => x.constitute_name.Contains(parm.name));
                }
                if (parm.category_id != null)
                {
                    items = items.Where(x => x.category_id == parm.category_id);
                }
                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetRightConstitute(int? dail_menu_id)
        {
            db0 = getDB0();
            try
            {
                var items = from x in db0.DailyMenuOfConstitute
                            join y in db0.ConstituteFood on x.constitute_id equals y.constitute_id
                            where x.dail_menu_id == dail_menu_id
                            select new { x.constitute_id, y.category_id, y.constitute_name };

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpPost]
        public async Task<IHttpActionResult> PostDailyMenuOfConstitute([FromBody]ParmDailyMenuOfConstitute parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = db0.DailyMenuOfConstitute.Where(x => x.constitute_id == parm.constitute_id && x.dail_menu_id == parm.dail_menu_id).FirstOrDefault();
                if (item == null)
                {
                    item = new DailyMenuOfConstitute()
                    {
                        constitute_id = parm.constitute_id,
                         dail_menu_id= parm.dail_menu_id,
                        i_InsertUserID = this.UserId,
                        i_InsertDateTime = DateTime.Now,
                        i_InsertDeptID = this.departmentId,
                        i_Lang = "zh-TW"
                    };
                    db0.DailyMenuOfConstitute.Add(item);
                }

                await db0.SaveChangesAsync();

                r.result = true;
                r.id = item.dail_menu_id;
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
        [HttpDelete]
        public async Task<IHttpActionResult> DeleteDailyMenuOfConstitute([FromBody]ParmDailyMenuOfConstitute parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = await db0.DailyMenuOfConstitute.FindAsync(parm.constitute_id,parm.dail_menu_id);
                if (item != null)
                {
                    db0.DailyMenuOfConstitute.Remove(item);
                    await db0.SaveChangesAsync();
                }
                else
                {
                    r.result = false;
                    r.message = "未刪除";
                    return Ok(r);
                }
                r.result = true;
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
        #endregion
    }
    #region Parm
    public class ParmChangeMealID
    {
        public string old_id { get; set; }
        public string new_id { get; set; }
    }
    public class ParmCheckMealID
    {
        public int born_id { get; set; }
        public string meal_id { get; set; }
    }
    public class ParmGetLeftElement
    {
        public int? constitute_id { get; set; }
        public string name { get; set; }
        public int? category_id { get; set; }

    }
    public class ParmConstituteOfElement
    {
        public int constitute_id { get; set; }
        public int element_id { get; set; }
    }
    public class ParmGetLeftConstitute
    {
        public int? dail_menu_id { get; set; }
        public string name { get; set; }
        public int? category_id { get; set; }
    }
    public class ParmDailyMenuOfConstitute
    {
        public int constitute_id { get; set; }
        public int dail_menu_id { get; set; }
    }
    #endregion
}
