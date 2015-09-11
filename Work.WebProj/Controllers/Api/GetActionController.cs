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
    #endregion
}
