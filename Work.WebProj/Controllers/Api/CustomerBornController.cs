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
    public class CustomerBornController : ajaxApi<CustomerBorn, q_CustomerBorn>
    {
        public async Task<IHttpActionResult> Get(int id)
        {
            using (db0 = getDB0())
            {
                item = await db0.CustomerBorn.FindAsync(id);

                bool check_record = db0.ProductRecord.Any(x => x.born_id == id);
                //檢查生產紀錄是否有對應的產品銷售資料主檔
                if (check_record)
                {
                    item.have_record = true;
                }

                r = new ResultInfo<CustomerBorn>() { data = item };
            }

            return Ok(r);
        }
        public async Task<IHttpActionResult> Get([FromUri]q_CustomerBorn q)
        {
            #region 連接BusinessLogicLibary資料庫並取得資料

            using (db0 = getDB0())
            {
                var items = (from x in db0.CustomerBorn
                             orderby x.born_day descending
                             where x.customer_id == q.main_id
                             select new m_CustomerBorn()
                             {
                                 customer_id = x.customer_id,
                                 born_id = x.born_id,
                                 born_day = x.born_day,
                                 meal_id = x.meal_id,
                                 mom_name = x.mom_name,
                                 baby_sex = x.baby_sex,
                                 born_type = x.born_type,
                                 is_close = x.is_close
                             });

                return Ok(items.ToList());
            }
            #endregion
        }
        public async Task<IHttpActionResult> Put([FromBody]CustomerBorn md)
        {
            ResultInfo r = new ResultInfo();

            try
            {
                db0 = getDB0();

                item = await db0.CustomerBorn.FindAsync(md.born_id);
                item.mom_name = md.mom_name;
                item.meal_id = md.meal_id;
                item.sno = md.sno;
                item.birthday = md.birthday;
                item.tel_1 = md.tel_1;
                item.tel_2 = md.tel_2;
                item.tw_zip_1 = md.tw_zip_1;
                item.tw_zip_2 = md.tw_zip_2;
                item.tw_city_1 = md.tw_city_1;
                item.tw_city_2 = md.tw_city_2;
                item.tw_country_1 = md.tw_country_1;
                item.tw_country_2 = md.tw_country_2;
                item.tw_address_1 = md.tw_address_1;
                item.tw_address_2 = md.tw_address_2;
                item.memo = md.memo;
                item.born_frequency = md.born_frequency;
                item.baby_sex = md.baby_sex;
                item.born_day = md.born_day;
                item.expected_born_day = md.expected_born_day;
                item.born_type = md.born_type;
                item.checkup_hospital = md.checkup_hospital;
                item.born_hospital = md.born_hospital;

                #region 修改生產紀錄時要將資料反寫回客戶資料
                var getCustomer = await db0.Customer.FindAsync(md.customer_id);
                if (getCustomer.customer_type == (int)CustomerType.Common)//如果客戶分類為:自有客戶
                {
                    getCustomer.sno = md.sno;
                    getCustomer.birthday = md.birthday;
                    getCustomer.tel_1 = md.tel_1;
                    getCustomer.tel_2 = md.tel_2;
                    getCustomer.tw_zip_1 = md.tw_zip_1;
                    getCustomer.tw_zip_2 = md.tw_zip_2;
                    getCustomer.tw_city_1 = md.tw_city_1;
                    getCustomer.tw_city_2 = md.tw_city_2;
                    getCustomer.tw_country_1 = md.tw_country_1;
                    getCustomer.tw_country_2 = md.tw_country_2;
                    getCustomer.tw_address_1 = md.tw_address_1;
                    getCustomer.tw_address_2 = md.tw_address_2;
                }
                #endregion

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
        public async Task<IHttpActionResult> Post([FromBody]CustomerBorn md)
        {
            ResultInfo r = new ResultInfo();

            md.born_id = GetNewId(ProcCore.Business.CodeTable.CustomerBorn);

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

                #region 新增生產紀錄時要將資料反寫回客戶資料
                var getCustomer = await db0.Customer.FindAsync(md.customer_id);
                if (getCustomer.customer_type == (int)CustomerType.Common)//如果客戶分類為:自有客戶
                {
                    getCustomer.sno = md.sno;
                    getCustomer.birthday = md.birthday;
                    getCustomer.tel_1 = md.tel_1;
                    getCustomer.tel_2 = md.tel_2;
                    getCustomer.tw_zip_1 = md.tw_zip_1;
                    getCustomer.tw_zip_2 = md.tw_zip_2;
                    getCustomer.tw_city_1 = md.tw_city_1;
                    getCustomer.tw_city_2 = md.tw_city_2;
                    getCustomer.tw_country_1 = md.tw_country_1;
                    getCustomer.tw_country_2 = md.tw_country_2;
                    getCustomer.tw_address_1 = md.tw_address_1;
                    getCustomer.tw_address_2 = md.tw_address_2;
                }
                #endregion

                md.i_InsertUserID = this.UserId;
                md.i_InsertDateTime = DateTime.Now;
                md.i_InsertDeptID = this.departmentId;
                md.i_Lang = "zh-TW";
                db0.CustomerBorn.Add(md);
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
                    item = db0.CustomerBorn.Find(id);

                    //刪除生產紀錄要自動釋放用餐編號(如果未結案)
                    bool check_mealid = db0.MealID.Any(x => x.meal_id == item.meal_id);
                    if (check_mealid)
                    {
                        var getMealid = db0.MealID.Find(item.meal_id);
                        if (!item.is_close & getMealid.i_Use)
                            getMealid.i_Use = false;
                    }

                    db0.CustomerBorn.Attach(item);
                    db0.CustomerBorn.Remove(item);
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
