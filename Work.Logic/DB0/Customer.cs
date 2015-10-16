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
    
    using Newtonsoft.Json;
    public partial class Customer : BaseEntityTable
    {
        public Customer()
        {
            this.CustomerBorn = new HashSet<CustomerBorn>();
            this.CustomerNeed = new HashSet<CustomerNeed>();
            this.ProductRecord = new HashSet<ProductRecord>();
            this.SendMsgOfCustomer = new HashSet<SendMsgOfCustomer>();
            this.AccountsPayable = new HashSet<AccountsPayable>();
        }
    
        public int customer_id { get; set; }
        public string customer_sn { get; set; }
        public string customer_name { get; set; }
        public int customer_type { get; set; }
        public string sno { get; set; }
        public Nullable<System.DateTime> birthday { get; set; }
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
        public string memo { get; set; }
        public string app_account { get; set; }
        public string app_password { get; set; }
        public bool i_Hide { get; set; }
        public string i_InsertUserID { get; set; }
        public Nullable<int> i_InsertDeptID { get; set; }
        public Nullable<System.DateTime> i_InsertDateTime { get; set; }
        public string i_UpdateUserID { get; set; }
        public Nullable<int> i_UpdateDeptID { get; set; }
        public Nullable<System.DateTime> i_UpdateDateTime { get; set; }
        public string i_Lang { get; set; }
        public int company_id { get; set; }
    
    	[JsonIgnore]
        public virtual ICollection<CustomerBorn> CustomerBorn { get; set; }
    	[JsonIgnore]
        public virtual ICollection<CustomerNeed> CustomerNeed { get; set; }
    	[JsonIgnore]
        public virtual ICollection<ProductRecord> ProductRecord { get; set; }
    	[JsonIgnore]
        public virtual ICollection<SendMsgOfCustomer> SendMsgOfCustomer { get; set; }
    	[JsonIgnore]
        public virtual ICollection<AccountsPayable> AccountsPayable { get; set; }
    }
}
