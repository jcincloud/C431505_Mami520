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
    public class DeatilTelRecordController : ajaxApi<DeatilTelRecord, q_DeatilTelRecord>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.DeatilTelRecord.FindAsync(id);
                r = new ResultInfo<DeatilTelRecord>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_DeatilTelRecord q)
        {
            #region 連接BusinessLogicLibary資料庫並取得資料

            using (db0 = getDB0())
            {
                var qr = db0.DeatilTelRecord
                             .OrderBy(x => x.tel_datetime)
                             .Where(x => x.schedule_detail_id == q.main_id & x.company_id == this.companyId)
                             .Select(x => new m_DeatilTelRecord()
                             {
                                 schedule_detail_id = x.schedule_detail_id,
                                 deatil_tel_record_id = x.deatil_tel_record_id,
                                 tel_datetime = x.tel_datetime,
                                 tel_state = x.tel_state,
                                 memo = x.memo,
                                 i_InsertUserID = x.i_InsertUserID
                             }).AsQueryable();

                var result = qr.ToList();
                foreach (var item in result)
                {
                    string getUserName = db0.AspNetUsers.Where(x => x.Id == item.i_InsertUserID).FirstOrDefault().user_name_c;
                    item.user_name = getUserName;
                }
                return Ok(result);
            }
            #endregion
        }
        public async Task<IHttpActionResult> Put([FromBody]DeatilTelRecord md)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                db0 = getDB0();

                item = await db0.DeatilTelRecord.FindAsync(md.deatil_tel_record_id);
                item.tel_state = md.tel_state;
                item.memo = md.memo;


                item.i_UpdateUserID = this.UserId;
                item.i_UpdateDateTime = DateTime.Now;
                item.i_UpdateDeptID = this.departmentId;


                await db0.SaveChangesAsync();
                r.result = true;
                r.id = md.deatil_tel_record_id;
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
        public async Task<IHttpActionResult> Post([FromBody]DeatilTelRecord md)
        {
            ResultInfo r = new ResultInfo();

            md.deatil_tel_record_id = GetNewId(ProcCore.Business.CodeTable.DeatilTelRecord);

            //if (!ModelState.IsValid)
            //{
            //    r.message = ModelStateErrorPack();
            //    r.result = false;
            //    return Ok(r);
            //}
            try
            {
                #region working a
                db0 = getDB0();
                md.tel_datetime = DateTime.Now;

                md.i_InsertUserID = this.UserId;
                md.i_InsertDateTime = DateTime.Now;
                md.i_InsertDeptID = this.departmentId;
                md.company_id = this.companyId;
                md.i_Lang = "zh-TW";
                db0.DeatilTelRecord.Add(md);
                await db0.SaveChangesAsync();

                r.result = true;
                r.id = md.deatil_tel_record_id;
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
                    item = new DeatilTelRecord() { deatil_tel_record_id = id };
                    db0.DeatilTelRecord.Attach(item);
                    db0.DeatilTelRecord.Remove(item);
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
