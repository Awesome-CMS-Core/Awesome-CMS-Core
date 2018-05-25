﻿//lib stylesheet
import "../css/lib.scss";

//app stylesheet
import "../css/app.scss";

import "./App/lib";
import "./App/app";
import { isDevEnviroment } from "./App/Helper/EnvConfig";

if (isDevEnviroment()) {
  module.hot.accept();
}