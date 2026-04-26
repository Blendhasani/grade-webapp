{-# LANGUAGE OverloadedStrings #-}

module Routes.Report (mountReportRoutes) where

import Data.Aeson (Value)
import Data.IORef
import Web.Scotty
import Types (ClassReport (..), GradeRecord)

mountReportRoutes :: IORef [GradeRecord] -> ScottyM ()
mountReportRoutes _ = do
  get "/api/report" $ json (ClassReport 0 0 0 0 0 0)
  get "/api/categories" $ json ([] :: [Value])
 