﻿using DotWeb.CommSetup;
using DotWeb.Controller;
using ProcCore.HandleResult;
using System;
using System.IO;
using System.Web.Mvc;

namespace DotWeb.Areas.Active.Controllers
{
    public class ProductBrandController : AdminController
    {
        #region Action and function section
        public ActionResult Main()
        {
            ActionRun();
            return View();
        }

        #endregion
    }
}