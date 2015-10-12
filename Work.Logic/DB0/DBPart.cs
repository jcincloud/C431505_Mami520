using System;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Core;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;
namespace ProcCore.Business.DB0
{
    public enum EditState
    {
        Insert = 0,
        Update = 1
    }
    public enum VisitDetailState
    {
        none,
        wait,
        progress,
        finish,
        pause
    }
    public enum CustomerType
    {
        Common = 1,//自有客戶
        Hospital = 2,//醫院
        PostnatalCareCenter = 3,//月子中心
        Transfer = 4//轉介
    }
    public enum SendType
    {
        SendMsg = 1,
        SendMsgByFactor = 2
    }
    public enum SendFactor
    {
        FirstPayment = 2,//頭款
        SesameOil = 3,//可麻油
        BalancePayment = 4//尾款
    }
    public enum ProdyctType
    {
        Tryout = 1,//試吃
        PostnatalMeal = 2,//月子餐
        Common = 3,//一般產品
        DiscountAndRefund = 4//折扣及退款
    }
    public enum MealType
    {
        Breakfast = 1,
        Lunch = 2,
        Dinner = 3
    }
    #region set CodeSheet

    public static class CodeSheet
    {
        public static List<i_Code> product_type = new List<i_Code>()
        {
            new i_Code{ Code = 1, Value = "試吃", LangCode = "wait" },
            new i_Code{ Code = 2, Value = "月子餐", LangCode = "progress" },
            new i_Code{ Code = 3, Value = "一般產品", LangCode = "finish" },
            new i_Code{ Code = 4, Value = "折扣&退款", LangCode = "pause" }
        };

        public static string GetProductTypeVal(int code)
        {
            string Val = string.Empty;
            foreach (var item in product_type)
            {
                if (item.Code == code)
                    Val = item.Value;
            }
            return Val;
        }

    }
    public class i_Code
    {
        public int? Code { get; set; }
        public string LangCode { get; set; }
        public string Value { get; set; }
    }
    #endregion

    public partial class C43A0_Mani520Entities : DbContext
    {
        public C43A0_Mani520Entities(string connectionstring)
            : base(connectionstring)
        {
        }

        public override Task<int> SaveChangesAsync()
        {
            return base.SaveChangesAsync();
        }
        public override int SaveChanges()
        {
            try
            {
                return base.SaveChanges();
            }
            catch (DbEntityValidationException ex)
            {
                Log.Write(ex.Message, ex.StackTrace);
                foreach (var err_Items in ex.EntityValidationErrors)
                {
                    foreach (var err_Item in err_Items.ValidationErrors)
                    {
                        Log.Write("欄位驗證錯誤", err_Item.PropertyName, err_Item.ErrorMessage);
                    }
                }

                throw ex;
            }
            catch (DbUpdateException ex)
            {
                Log.Write("DbUpdateException", ex.InnerException.Message);
                throw ex;
            }
            catch (EntityException ex)
            {
                Log.Write("EntityException", ex.Message);
                throw ex;
            }
            catch (UpdateException ex)
            {
                Log.Write("UpdateException", ex.Message);
                throw ex;
            }
            catch (Exception ex)
            {
                Log.Write("Exception", ex.Message);
                throw ex;
            }
        }

    }
    #region category
    public static class CategoryType
    {
        public static int ElementFood = 1;//(可變動)
        public static int ConstituteFood = 2;//(可變動)
    }
    #endregion
    #region Model Expand
    public partial class m_Customer
    {
        public int born_times { get; set; }
    }
    public partial class m_CustomerNeed
    {
        public string name { get; set; }
        public string tel_1 { get; set; }
        public string tel_2 { get; set; }
    }
    public partial class CustomerNeed
    {
        public string name { get; set; }
        public string tel_1 { get; set; }
        public string tel_2 { get; set; }
        public string tw_zip_1 { get; set; }
        public string tw_city_1 { get; set; }
        public string tw_country_1 { get; set; }
        public string tw_address_1 { get; set; }
    }
    public partial class m_ProductRecord
    {
        public string name { get; set; }
        public string meal_id { get; set; }
    }
    public partial class ProductRecord
    {
        public string customer_name { get; set; }
        public int customer_type { get; set; }
        public string name { get; set; }
        public string meal_id { get; set; }
        public string sno { get; set; }
        public DateTime? birthday { get; set; }
        public string tel_1 { get; set; }
        public string tel_2 { get; set; }
        public string tw_zip_1 { get; set; }
        public string tw_city_1 { get; set; }
        public string tw_country_1 { get; set; }
        public string tw_address_1 { get; set; }
        public string tw_zip_2 { get; set; }
        public string tw_city_2 { get; set; }
        public string tw_country_2 { get; set; }
        public string tw_address_2 { get; set; }
    }
    public partial class CustomerBorn
    {
        public bool have_record { get; set; }//檢查生產紀錄有沒有產品銷售主檔
    }
    public partial class m_GiftRecord
    {
        public string mom_name { get; set; }
        public string activity_name { get; set; }
        public string sno { get; set; }
        public string tel_1 { get; set; }
    }
    public partial class GiftRecord
    {
        public DateTime record_day { get; set; }
        public string customer_name { get; set; }
        public string name { get; set; }
        public string sno { get; set; }
        public DateTime? birthday { get; set; }
        public string tel_1 { get; set; }
        public string tel_2 { get; set; }
        public string tw_zip_1 { get; set; }
        public string tw_city_1 { get; set; }
        public string tw_country_1 { get; set; }
        public string tw_address_1 { get; set; }
        public string tw_zip_2 { get; set; }
        public string tw_city_2 { get; set; }
        public string tw_country_2 { get; set; }
        public string tw_address_2 { get; set; }

        public double totle_price { get; set; }
    }
    public partial class m_ContactSchedule
    {
        public string mom_name { get; set; }
        public string sno { get; set; }
        public string tel_1 { get; set; }
        public string tel_2 { get; set; }
    }
    public partial class ContactSchedule
    {
        public string customer_name { get; set; }
        public int customer_type { get; set; }
        public string mom_name { get; set; }
        public string sno { get; set; }
        public DateTime? birthday { get; set; }
        public string tel_1 { get; set; }
        public string tel_2 { get; set; }
        public string tw_zip_1 { get; set; }
        public string tw_city_1 { get; set; }
        public string tw_country_1 { get; set; }
        public string tw_address_1 { get; set; }
        public string tw_zip_2 { get; set; }
        public string tw_city_2 { get; set; }
        public string tw_country_2 { get; set; }
        public string tw_address_2 { get; set; }
        public int? born_type { get; set; }
        public DateTime? born_day { get; set; }
    }
    public partial class m_ScheduleDetail
    {
        public string mom_name { get; set; }
        public string tel_1 { get; set; }
        public string tel_2 { get; set; }
    }
    public partial class ScheduleDetail
    {
        public string customer_name { get; set; }
        public int customer_type { get; set; }
        public string mom_name { get; set; }
        public string sno { get; set; }
        public DateTime? birthday { get; set; }
        public string tel_1 { get; set; }
        public string tel_2 { get; set; }
        public string tw_zip_1 { get; set; }
        public string tw_city_1 { get; set; }
        public string tw_country_1 { get; set; }
        public string tw_address_1 { get; set; }
        public string tw_zip_2 { get; set; }
        public string tw_city_2 { get; set; }
        public string tw_country_2 { get; set; }
        public string tw_address_2 { get; set; }
        public int? born_type { get; set; }
        public DateTime? born_day { get; set; }

        public bool is_detailInsert { get; set; }//判斷是否為明細檔自行新增
    }
    public partial class m_DeatilTelRecord
    {
        public string user_name { get; set; }
    }
    public partial class m_RecordDetail
    {
        public string mom_name { get; set; }
        public string sno { get; set; }
        public string tel_1 { get; set; }
    }
    public partial class RecordDetail
    {
        public string mom_name { get; set; }
        public string sno { get; set; }
        public DateTime? birthday { get; set; }
        public string tel_1 { get; set; }
        public string tel_2 { get; set; }
        public string tw_zip_1 { get; set; }
        public string tw_city_1 { get; set; }
        public string tw_country_1 { get; set; }
        public string tw_address_1 { get; set; }
        public string tw_zip_2 { get; set; }
        public string tw_city_2 { get; set; }
        public string tw_country_2 { get; set; }
        public string tw_address_2 { get; set; }
        //用餐排程用
        public bool isMealStart { get; set; }
    }
    public partial class DailyMealChangeRecord
    {
        public string user_name { get; set; }
    }
    public partial class m_AccountsPayable
    {
        public string customer_name { get; set; }
        public string sno { get; set; }
        public string tel_1 { get; set; }
    }
    public partial class AccountsPayable
    {
        public string customer_name { get; set; }
        public string tel_1 { get; set; }
        public string tel_2 { get; set; }
    }
    /// <summary>
    /// 分類選單用
    /// </summary>
    public class option
    {
        public int val { get; set; }
        public string Lname { get; set; }
    }


    #endregion

    #region q_Model_Define
    public class q_AspNetRoles : QueryBase
    {
        public string Name { set; get; }

    }
    public class q_AspNetUsers : QueryBase
    {
        public string UserName { set; get; }

    }
    public class q_Product : QueryBase
    {
        public string product_name { get; set; }
        public int? product_type { get; set; }
    }
    public class q_ProductRecord : QueryBase
    {
        public string name { get; set; }
        public string meal_id { get; set; }
        public bool? is_close { get; set; }
        public bool? is_receipt { get; set; }
        public DateTime? start_date { get; set; }
        public DateTime? end_date { get; set; }
    }
    public class q_Customer : QueryBase
    {
        public string word { get; set; }//客戶搜尋
        public string word_born { get; set; }//生產客戶搜尋
        public string customer_name { get; set; }
        public string city { get; set; }
        public string country { get; set; }
        public string address { get; set; }
        public string tel { get; set; }
        public int? customer_type { get; set; }
    }
    public class q_CustomerBorn : QueryBase
    {
        public int? main_id { get; set; }
    }
    public class q_MealID : QueryBase
    {
        public string meal_id { get; set; }
        public bool? i_Use { get; set; }
        public bool? i_Hide { get; set; }
    }
    public class q_All_Category_L1 : QueryBase
    {
        public int? l1_id { get; set; }
        public string title { get; set; }
    }
    public class q_All_Category_L2 : QueryBase
    {
        public string l2_name { get; set; }
        public int? l1_id { get; set; }
        public int? l2_id { get; set; }

    }
    public class q_ElementFood : QueryBase
    {
        public string element_name { get; set; }
        public int? category_id { get; set; }
        public bool? i_Hide { get; set; }
    }
    public class q_ConstituteFood : QueryBase
    {
        public string constitute_name { get; set; }
        public int? category_id { get; set; }
        public bool? i_Hide { get; set; }
    }
    public class q_DailyMenu : QueryBase
    {
        public DateTime? start_date { get; set; }
        public DateTime? end_date { get; set; }
        public int? meal_type { get; set; }
    }
    public class q_DietaryNeed : QueryBase
    {
        public string name { get; set; }
        public bool? i_Hide { get; set; }
    }
    public class q_Activity : QueryBase
    {
        public string name { get; set; }
        public DateTime? start_date { get; set; }
        public DateTime? end_date { get; set; }
        public bool? i_Hide { get; set; }
    }
    public class q_CustomerNeed : QueryBase
    {
        public string name { get; set; }
        public string tel_1 { get; set; }
        public string tel_2 { get; set; }
        public string meal_id { get; set; }
    }
    public class q_Draft : q_DietaryNeed
    {
    }
    public class q_GiftRecord : QueryBase
    {
        public string name { get; set; }
        public string activity_name { get; set; }
        public int? receive_state { get; set; }
    }
    public class q_RecordDetail : QueryBase
    {
        public int main_id { get; set; }
        public string word { get; set; }
        public DateTime? start_date { get; set; }
        public DateTime? end_date { get; set; }
    }
    public class q_ContactSchedule : QueryBase
    {
        public string word { get; set; }
    }
    public class q_ScheduleDetail : QueryBase
    {
        public int? tel_reason { get; set; }
        public string word { get; set; }
        public DateTime? start_date { get; set; }
        public DateTime? end_date { get; set; }
    }
    public class q_DeatilTelRecord : QueryBase
    {
        public int main_id { get; set; }
    }
    public class q_SendMsg : QueryBase
    {
        public string title { get; set; }
        public bool? is_complete { get; set; }
        public bool? is_send { get; set; }
        public int send_type { get; set; }
    }
    public class q_AccountsPayable : QueryBase
    {
        public string word { get; set; }
    }
    public class q_AccountsPayableDetail : QueryBase
    {
        public string word { get; set; }
    }
    #endregion

    #region c_Model_Define
    public class c_AspNetRoles
    {
        public q_AspNetRoles q { get; set; }
        public AspNetRoles m { get; set; }
    }
    public partial class c_AspNetUsers
    {
        public q_AspNetUsers q { get; set; }
        public AspNetUsers m { get; set; }
    }
    #endregion
}
