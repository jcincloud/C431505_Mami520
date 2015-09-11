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
            return View("Birth");
        }

        public ActionResult Birth()
        {
            return View("Birth");
        }
        public ActionResult Birth2()
        {
            return View("Birth2");
        }

        public ActionResult Sell()
        {
            return View("Sell");
        }
        public ActionResult Sell2()
        {
            return View("Sell2");
        }

        public ActionResult Require()
        {
            return View("Require");
        }
        public ActionResult Require2()
        {
            return View("Require2");
        }

        public ActionResult Schedule()
        {
            return View("Schedule");
        }

        public ActionResult Dishes()
        {
            return View("Dishes");
        }
        public ActionResult Dishes2()
        {
            return View("Dishes2");
        }
        public ActionResult Dishes3()
        {
            return View("Dishes3");
        }

        public ActionResult Gift()
        {
            return View("Gift");
        }
        public ActionResult Gift2()
        {
            return View("Gift2");
        }

        public ActionResult Tel()
        {
            return View("Tel");
        }
        public ActionResult Tel2()
        {
            return View("Tel2");
        }
        public ActionResult Tel3()
        {
            return View("Tel3");
        }
        public ActionResult Tel4()
        {
            return View("Tel4");
        }
        public ActionResult Tel5()
        {
            return View("Tel5");
        }

        public ActionResult Check()
        {
            return View("Check");
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
