//------------------------------------------------------------------------------
// <auto-generated>
//     這個程式碼是由範本產生。
//
//     對這個檔案進行手動變更可能導致您的應用程式產生未預期的行為。
//     如果重新產生程式碼，將會覆寫對這個檔案的手動變更。
// </auto-generated>
//------------------------------------------------------------------------------

namespace ProcCore.Business.DB0
{
    using System;
    using System.Collections.Generic;
    public partial class m_RecordDetail :BaseEntityTable {
    public int record_deatil_id { get; set; }
    public int product_record_id { get; set; }
    public int customer_id { get; set; }
    public int born_id { get; set; }
    public string meal_id { get; set; }
    public System.DateTime sell_day { get; set; }
    public int product_id { get; set; }
    public int product_type { get; set; }
    public string product_name { get; set; }
    public string standard { get; set; }
    public double price { get; set; }
    public double qty { get; set; }
    public double subtotal { get; set; }
    public string memo { get; set; }
    public Nullable<System.DateTime> meal_start { get; set; }
    public Nullable<System.DateTime> meal_end { get; set; }
    public Nullable<int> estimate_breakfast { get; set; }
    public Nullable<int> estimate_lunch { get; set; }
    public Nullable<int> estimate_dinner { get; set; }
    public Nullable<System.DateTime> real_estimate_meal_start { get; set; }
    public Nullable<System.DateTime> real_estimate_meal_end { get; set; }
    public Nullable<int> real_estimate_breakfast { get; set; }
    public Nullable<int> real_estimate_lunch { get; set; }
    public Nullable<int> real_estimate_dinner { get; set; }
    public Nullable<System.DateTime> real_meal_start { get; set; }
    public Nullable<System.DateTime> real_meal_end { get; set; }
    public Nullable<int> real_breakfast { get; set; }
    public Nullable<int> real_lunch { get; set; }
    public Nullable<int> real_dinner { get; set; }
    public string meal_memo { get; set; }
    public Nullable<bool> is_release { get; set; }
    public string tryout_mealtype { get; set; }
    public bool i_Hide { get; set; }
    public string i_InsertUserID { get; set; }
    public Nullable<int> i_InsertDeptID { get; set; }
    public Nullable<System.DateTime> i_InsertDateTime { get; set; }
    public string i_UpdateUserID { get; set; }
    public Nullable<int> i_UpdateDeptID { get; set; }
    public Nullable<System.DateTime> i_UpdateDateTime { get; set; }
    public string i_Lang { get; set; }
    public int company_id { get; set; }
    }
}
