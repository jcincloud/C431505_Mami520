using DotWeb.CommSetup;
using DotWeb.Controller;
using ProcCore.HandleResult;
using System;
using System.IO;
using System.Web.Mvc;

namespace DotWeb.Areas.Active.Controllers
{
    public class ReportController : AdminController
    {
        #region Action and function section
        public ActionResult DailyMeal()
        {
            ActionRun();
            return View();
        }
        public ActionResult ProductRecord()
        {
            ActionRun();
            return View();
        }
        public ActionResult AccountsPayable()
        {
            ActionRun();
            return View();
        }
        #endregion
    }
}