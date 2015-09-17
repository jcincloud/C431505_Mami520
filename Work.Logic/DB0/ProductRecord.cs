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
    public partial class ProductRecord : BaseEntityTable
    {
        public ProductRecord()
        {
            this.GiftRecord = new HashSet<GiftRecord>();
        }
    
        public int product_record_id { get; set; }
        public string record_sn { get; set; }
        public System.DateTime record_day { get; set; }
        public int customer_id { get; set; }
        public int born_id { get; set; }
        public bool is_close { get; set; }
        public Nullable<bool> is_receipt { get; set; }
        public bool i_Hide { get; set; }
        public string i_InsertUserID { get; set; }
        public Nullable<int> i_InsertDeptID { get; set; }
        public Nullable<System.DateTime> i_InsertDateTime { get; set; }
        public string i_UpdateUserID { get; set; }
        public Nullable<int> i_UpdateDeptID { get; set; }
        public Nullable<System.DateTime> i_UpdateDateTime { get; set; }
        public string i_Lang { get; set; }
    
    	[JsonIgnore]
        public virtual Customer Customer { get; set; }
    	[JsonIgnore]
        public virtual CustomerBorn CustomerBorn { get; set; }
    	[JsonIgnore]
        public virtual ICollection<GiftRecord> GiftRecord { get; set; }
    }
}

