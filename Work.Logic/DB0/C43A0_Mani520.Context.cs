﻿//------------------------------------------------------------------------------
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
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    
    public partial class C43A0_Mani520Entities : DbContext
    {
        public C43A0_Mani520Entities()
            : base("name=C43A0_Mani520Entities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<AspNetRoles> AspNetRoles { get; set; }
        public virtual DbSet<AspNetUsers> AspNetUsers { get; set; }
        public virtual DbSet<Department> Department { get; set; }
        public virtual DbSet<i_Currency> i_Currency { get; set; }
        public virtual DbSet<i_IDX> i_IDX { get; set; }
        public virtual DbSet<i_Lang> i_Lang { get; set; }
        public virtual DbSet<i_Parm> i_Parm { get; set; }
        public virtual DbSet<i_SN> i_SN { get; set; }
        public virtual DbSet<i_UserLoginLog> i_UserLoginLog { get; set; }
        public virtual DbSet<Menu> Menu { get; set; }
        public virtual DbSet<MealID> MealID { get; set; }
        public virtual DbSet<Customer> Customer { get; set; }
        public virtual DbSet<CustomerBorn> CustomerBorn { get; set; }
        public virtual DbSet<All_Category_L1> All_Category_L1 { get; set; }
        public virtual DbSet<All_Category_L2> All_Category_L2 { get; set; }
        public virtual DbSet<ElementFood> ElementFood { get; set; }
        public virtual DbSet<ConstituteFood> ConstituteFood { get; set; }
        public virtual DbSet<ConstituteOfElement> ConstituteOfElement { get; set; }
        public virtual DbSet<DailyMenu> DailyMenu { get; set; }
        public virtual DbSet<DailyMenuOfConstitute> DailyMenuOfConstitute { get; set; }
        public virtual DbSet<DietaryNeed> DietaryNeed { get; set; }
        public virtual DbSet<DietaryNeedOfElement> DietaryNeedOfElement { get; set; }
        public virtual DbSet<Activity> Activity { get; set; }
        public virtual DbSet<CustomerNeed> CustomerNeed { get; set; }
        public virtual DbSet<CustomerOfDietaryNeed> CustomerOfDietaryNeed { get; set; }
        public virtual DbSet<Draft> Draft { get; set; }
        public virtual DbSet<ProductRecord> ProductRecord { get; set; }
        public virtual DbSet<GiftRecord> GiftRecord { get; set; }
        public virtual DbSet<Product> Product { get; set; }
        public virtual DbSet<RecordDetail> RecordDetail { get; set; }
        public virtual DbSet<ContactSchedule> ContactSchedule { get; set; }
        public virtual DbSet<ScheduleDetail> ScheduleDetail { get; set; }
        public virtual DbSet<DeatilTelRecord> DeatilTelRecord { get; set; }
    }
}
