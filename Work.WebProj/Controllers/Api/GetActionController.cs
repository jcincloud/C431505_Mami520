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
        #region 客戶生產-用餐編號選取
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
        #endregion
        #region 客戶需求-用餐編號選取
        public IHttpActionResult GetNotCloseMealID(int? old_id)
        {
            db0 = getDB0();
            try
            {
                //過濾-已有客戶需求資料的客戶生產資料
                var born_id = db0.CustomerNeed.Select(x => x.born_id);

                var items = db0.CustomerBorn
                    .OrderBy(x => x.meal_id)
                    .Where(x => !x.is_close & !born_id.Contains(x.born_id))
                    .Select(x => new { x.customer_id, x.born_id, x.meal_id, x.mom_name, x.born_frequency });

                if (old_id != null)
                {
                    items = items.Where(x => x.born_id != old_id);//過濾目前選取的客戶生產資料id
                }

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        #endregion
        #region 組合菜單對應基礎菜單
        public async Task<IHttpActionResult> GetLeftElement([FromUri]ParmGetLeftElement parm)
        {
            db0 = getDB0();
            try
            {
                int page_size = 10;
                var element_id = db0.ConstituteOfElement
                    .Where(x => x.constitute_id == parm.main_id)
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

                int page = (parm.page == 0 ? 1 : parm.page);
                int startRecord = PageCount.PageInfo(page, page_size, items.Count());
                var resultItems = await items.Skip(startRecord).Take(page_size).ToListAsync();

                return Ok(new
                {
                    rows = resultItems,
                    total = PageCount.TotalPage,
                    page = PageCount.Page,
                    records = PageCount.RecordCount,
                    startcount = PageCount.StartCount,
                    endcount = PageCount.EndCount
                });
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetRightElement(int? main_id)
        {
            db0 = getDB0();
            try
            {
                var items = from x in db0.ConstituteOfElement
                            join y in db0.ElementFood on x.element_id equals y.element_id
                            where x.constitute_id == main_id
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
        public async Task<IHttpActionResult> GetLeftConstitute([FromUri]ParmGetLeftConstitute parm)
        {
            db0 = getDB0();
            try
            {
                int page_size = 10;
                var constitute_id = db0.DailyMenuOfConstitute
                    .Where(x => x.dail_menu_id == parm.main_id)
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
                int page = (parm.page == 0 ? 1 : parm.page);
                int startRecord = PageCount.PageInfo(page, page_size, items.Count());
                var resultItems = await items.Skip(startRecord).Take(page_size).ToListAsync();

                return Ok(new
                {
                    rows = resultItems,
                    total = PageCount.TotalPage,
                    page = PageCount.Page,
                    records = PageCount.RecordCount,
                    startcount = PageCount.StartCount,
                    endcount = PageCount.EndCount
                });
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetRightConstitute(int? main_id)
        {
            db0 = getDB0();
            try
            {
                var items = from x in db0.DailyMenuOfConstitute
                            join y in db0.ConstituteFood on x.constitute_id equals y.constitute_id
                            where x.dail_menu_id == main_id
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
                        dail_menu_id = parm.dail_menu_id,
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
                var item = await db0.DailyMenuOfConstitute.FindAsync(parm.constitute_id, parm.dail_menu_id);
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
        #region 需求元素對應基礎菜單
        public async Task<IHttpActionResult> GetLeftElement_byNeed([FromUri]ParmGetLeftElement parm)
        {
            db0 = getDB0();
            try
            {
                int page_size = 10;
                var element_id = db0.DietaryNeedOfElement
                    .Where(x => x.dietary_need_id == parm.main_id)
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
                int page = (parm.page == 0 ? 1 : parm.page);
                int startRecord = PageCount.PageInfo(page, page_size, items.Count());
                var resultItems = await items.Skip(startRecord).Take(page_size).ToListAsync();

                return Ok(new
                {
                    rows = resultItems,
                    total = PageCount.TotalPage,
                    page = PageCount.Page,
                    records = PageCount.RecordCount,
                    startcount = PageCount.StartCount,
                    endcount = PageCount.EndCount
                });
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetRightElement_byNeed(int? main_id)
        {
            db0 = getDB0();
            try
            {
                var items = from x in db0.DietaryNeedOfElement
                            join y in db0.ElementFood on x.element_id equals y.element_id
                            where x.dietary_need_id == main_id
                            select new { x.element_id, y.category_id, y.element_name };

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpPost]
        public async Task<IHttpActionResult> PostDietaryNeedOfElement([FromBody]ParmDietaryNeedOfElement parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = db0.DietaryNeedOfElement.Where(x => x.dietary_need_id == parm.dietary_need_id && x.element_id == parm.element_id).FirstOrDefault();
                if (item == null)
                {
                    item = new DietaryNeedOfElement()
                    {
                        dietary_need_id = parm.dietary_need_id,
                        element_id = parm.element_id,
                        i_InsertUserID = this.UserId,
                        i_InsertDateTime = DateTime.Now,
                        i_InsertDeptID = this.departmentId,
                        i_Lang = "zh-TW"
                    };
                    db0.DietaryNeedOfElement.Add(item);
                }

                await db0.SaveChangesAsync();

                r.result = true;
                r.id = item.dietary_need_id;
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
        public async Task<IHttpActionResult> DeleteDietaryNeedOfElement([FromBody]ParmDietaryNeedOfElement parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = await db0.DietaryNeedOfElement.FindAsync(parm.element_id, parm.dietary_need_id);
                if (item != null)
                {
                    db0.DietaryNeedOfElement.Remove(item);
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
        #region 客戶需求對應需求元素
        public async Task<IHttpActionResult> GetLeftDietaryNeed([FromUri]ParmGetLeftDietaryNeed parm)
        {
            db0 = getDB0();
            try
            {
                int page_size = 10;
                var dietary_need_id = db0.CustomerOfDietaryNeed
                    .Where(x => x.customer_need_id == parm.main_id)
                    .Select(x => x.dietary_need_id);

                //設定未啟用i_hide=true的不顯示
                var items = db0.DietaryNeed.Where(x => !dietary_need_id.Contains(x.dietary_need_id) & !x.i_Hide).OrderByDescending(x => x.sort).Select(x => new { x.dietary_need_id, x.name, x.is_correspond, x.is_breakfast, x.is_lunch, x.is_dinner });


                if (parm.name != null)
                {
                    items = items.Where(x => x.name.Contains(parm.name));
                }
                if (parm.is_correspond != null)
                {
                    items = items.Where(x => x.is_correspond == parm.is_correspond);
                }
                if (parm.is_breakfast != null)
                {
                    items = items.Where(x => x.is_breakfast == parm.is_breakfast);
                }
                if (parm.is_lunch != null)
                {
                    items = items.Where(x => x.is_lunch == parm.is_lunch);
                }
                if (parm.is_dinner != null)
                {
                    items = items.Where(x => x.is_dinner == parm.is_dinner);
                }

                int page = (parm.page == 0 ? 1 : parm.page);
                int startRecord = PageCount.PageInfo(page, page_size, items.Count());
                var resultItems = await items.Skip(startRecord).Take(page_size).ToListAsync();

                return Ok(new
                {
                    rows = resultItems,
                    total = PageCount.TotalPage,
                    page = PageCount.Page,
                    records = PageCount.RecordCount,
                    startcount = PageCount.StartCount,
                    endcount = PageCount.EndCount
                });
            }
            finally
            {
                db0.Dispose();
            }
        }
        public IHttpActionResult GetRightDietaryNeed(int? main_id)
        {
            db0 = getDB0();
            try
            {
                var items = from x in db0.CustomerOfDietaryNeed
                            join y in db0.DietaryNeed on x.dietary_need_id equals y.dietary_need_id
                            where x.customer_need_id == main_id
                            select new { x.dietary_need_id, y.name, y.is_correspond, y.is_breakfast, y.is_lunch, y.is_dinner };

                return Ok(items.ToList());
            }
            finally
            {
                db0.Dispose();
            }
        }
        [HttpPost]
        public async Task<IHttpActionResult> PostCustomerOfDietaryNeed([FromBody]ParmCustomerOfDietaryNeed parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = db0.CustomerOfDietaryNeed.Where(x => x.dietary_need_id == parm.dietary_need_id && x.customer_need_id == parm.customer_need_id).FirstOrDefault();
                if (item == null)
                {
                    item = new CustomerOfDietaryNeed()
                    {
                        dietary_need_id = parm.dietary_need_id,
                        customer_need_id = parm.customer_need_id,
                        i_InsertUserID = this.UserId,
                        i_InsertDateTime = DateTime.Now,
                        i_InsertDeptID = this.departmentId,
                        i_Lang = "zh-TW"
                    };
                    db0.CustomerOfDietaryNeed.Add(item);
                }

                await db0.SaveChangesAsync();

                r.result = true;
                r.id = item.dietary_need_id;
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
        public async Task<IHttpActionResult> DeleteCustomerOfDietaryNeed([FromBody]ParmCustomerOfDietaryNeed parm)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                #region working a
                db0 = getDB0();
                var item = await db0.CustomerOfDietaryNeed.FindAsync(parm.dietary_need_id, parm.customer_need_id);
                if (item != null)
                {
                    db0.CustomerOfDietaryNeed.Remove(item);
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
        public int? main_id { get; set; }
        public string name { get; set; }
        public int? category_id { get; set; }
        public int page { get; set; }

    }
    public class ParmConstituteOfElement
    {
        public int constitute_id { get; set; }
        public int element_id { get; set; }
    }
    public class ParmGetLeftConstitute : ParmGetLeftElement
    {
    }
    public class ParmDailyMenuOfConstitute
    {
        public int constitute_id { get; set; }
        public int dail_menu_id { get; set; }
    }
    public class ParmDietaryNeedOfElement
    {
        public int dietary_need_id { get; set; }
        public int element_id { get; set; }
    }
    public class ParmGetLeftDietaryNeed
    {
        public int? main_id { get; set; }
        public string name { get; set; }
        public bool? is_correspond { get; set; }
        public bool? is_breakfast { get; set; }
        public bool? is_lunch { get; set; }
        public bool? is_dinner { get; set; }
        public int page { get; set; }
    }
    public class ParmCustomerOfDietaryNeed
    {
        public int dietary_need_id { get; set; }
        public int customer_need_id { get; set; }
    }
    #endregion
}
