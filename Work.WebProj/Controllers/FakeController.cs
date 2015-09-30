using System.Linq;
using System.Web.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Text;
using System.IO;
using System;
using System.Collections.Generic;
using System.Net.Mail;
using ProcCore.HandleResult;
using DotWeb.CommSetup;
using DotWeb.Controller;
namespace DotWeb.Controllers
{
    public class FakeController : WebUserController
    {
        public ActionResult Index()
        {
            return View("Index");
        }

        public ActionResult Birth()
        {
            return View("Birth");
        }
        public ActionResult Birth_2()
        {
            return View("Birth_2");
        }
        public ActionResult Birth2()
        {
            return View("Birth2");
        }
        public ActionResult Birth2_2()
        {
            return View("Birth2_2");
        }
        public ActionResult Birth3()
        {
            return View("Birth3");
        }
        public ActionResult Birth3_2()
        {
            return View("Birth3_2");
        }

        public ActionResult Sell()
        {
            return View("Sell");
        }
        public ActionResult Sell_2()
        {
            return View("Sell_2");
        }
        public ActionResult Sell2()
        {
            return View("Sell2");
        }
        public ActionResult Sell2_2()
        {
            return View("Sell2_2");
        }
        public ActionResult Sell2_3()
        {
            return View("Sell2_3");
        }

        public ActionResult Require()
        {
            return View("Require");
        }
        public ActionResult Require_2()
        {
            return View("Require_2");
        }
        public ActionResult Require2()
        {
            return View("Require2");
        }
        public ActionResult Require2_2()
        {
            return View("Require2_2");
        }
        public ActionResult Require2_3()
        {
            return View("Require2_3");
        }

        public ActionResult Schedule()
        {
            return View("Schedule");
        }
        public ActionResult Schedule_2()
        {
            return View("Schedule_2");
        }

        public ActionResult Dishes()
        {
            return View("Dishes");
        }
        public ActionResult Dishes_2()
        {
            return View("Dishes_2");
        }
        public ActionResult Dishes2()
        {
            return View("Dishes2");
        }
        public ActionResult Dishes2_2()
        {
            return View("Dishes2_2");
        }
        public ActionResult Dishes3()
        {
            return View("Dishes3");
        }
        public ActionResult Dishes3_2()
        {
            return View("Dishes3_2");
        }
        public ActionResult Dishes4()
        {
            return View("Dishes4");
        }
        public ActionResult Dishes4_2()
        {
            return View("Dishes4_2");
        }

        public ActionResult Gift()
        {
            return View("Gift");
        }
        public ActionResult Gift_2()
        {
            return View("Gift_2");
        }
        public ActionResult Gift2()
        {
            return View("Gift2");
        }
        public ActionResult Gift2_2()
        {
            return View("Gift2_2");
        }

        public ActionResult Tel()
        {
            return View("Tel");
        }
        public ActionResult Tel_2()
        {
            return View("Tel_2");
        }
        public ActionResult Tel_3()
        {
            return View("Tel_3");
        }
        public ActionResult Tel2()
        {
            return View("Tel2");
        }
        public ActionResult Tel2_2()
        {
            return View("Tel2_2");
        }
        public ActionResult Tel3()
        {
            return View("Tel3");
        }
        public ActionResult Tel3_2()
        {
            return View("Tel3_2");
        }
        public ActionResult Tel3_3()
        {
            return View("Tel3_3");
        }
        public ActionResult Tel4()
        {
            return View("Tel4");
        }
        public ActionResult Tel4_2()
        {
            return View("Tel4_2");
        }
        public ActionResult Tel4_3()
        {
            return View("Tel4_3");
        }
        public ActionResult Tel5()
        {
            return View("Tel5");
        }
        public ActionResult Tel5_2()
        {
            return View("Tel5_2");
        }

        public ActionResult Check()
        {
            return View("Check");
        }
        public ActionResult Check_2()
        {
            return View("Check_2");
        }

        public ActionResult Report()
        {
            return View("Report");
        }
        public ActionResult Report2()
        {
            return View("Report2");
        }
        public ActionResult Report3()
        {
            return View("Report3");
        }
    }
}
