using ProcCore.Business.DB0;
using ProcCore.HandleResult;
using System;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;

namespace DotWeb.Api
{
    public class RecordDetailController : ajaxApi<RecordDetail, q_RecordDetail>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.RecordDetail.FindAsync(id);
                r = new ResultInfo<RecordDetail>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_RecordDetail q)
        {
            #region 連接BusinessLogicLibary資料庫並取得資料

            using (db0 = getDB0())
            {
                var items = (from x in db0.RecordDetail
                             orderby x.sell_day descending
                             where x.product_record_id == q.main_id
                             select new m_RecordDetail()
                             {
                                 product_record_id=x.product_record_id,
                                 record_deatil_id=x.record_deatil_id,
                                 product_name = x.product_name,
                                 product_type = x.product_type,
                                 price = x.price,
                                 qty = x.qty,
                                 subtotal = x.subtotal
                             });

                return Ok(items.ToList());
            }
            #endregion
        }
        public async Task<IHttpActionResult> Put([FromBody]RecordDetail md)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                db0 = getDB0();

                item = await db0.RecordDetail.FindAsync(md.record_deatil_id);
                //一般產品
                item.price = md.price;
                item.qty = md.qty;
                item.memo = md.memo;

                //用餐排程
                item.meal_start = md.meal_start;
                item.meal_end = md.meal_end;
                item.estimate_breakfast = md.estimate_breakfast;
                item.estimate_dinner = md.estimate_dinner;
                item.estimate_lunch = md.estimate_lunch;
                item.meal_memo = md.meal_memo;

                item.i_UpdateUserID = this.UserId;
                item.i_UpdateDateTime = DateTime.Now;
                item.i_UpdateDeptID = this.departmentId;


                await db0.SaveChangesAsync();
                r.result = true;
                r.id = md.customer_id;
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
        public async Task<IHttpActionResult> Post([FromBody]RecordDetail md)
        {
            ResultInfo r = new ResultInfo();

            md.record_deatil_id = GetNewId(ProcCore.Business.CodeTable.RecordDetail);

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
                db0.RecordDetail.Add(md);
                await db0.SaveChangesAsync();

                r.result = true;
                r.id = md.born_id;
                return Ok(r);
                #endregion
            }
            catch (DbEntityValidationException ex)
            {
                r.result = false;

                foreach (var m in ex.EntityValidationErrors)
                {

                    foreach (var n in m.ValidationErrors)
                    {
                        r.message += "[" + n.PropertyName + ":" + n.ErrorMessage + "]";
                    }
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
                //tx.Dispose();
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
                    item = new RecordDetail() { record_deatil_id = id };
                    db0.RecordDetail.Attach(item);
                    db0.RecordDetail.Remove(item);
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
