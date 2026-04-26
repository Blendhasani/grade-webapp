{-# LANGUAGE OverloadedStrings #-}

module Main where


import Data.IORef
import Network.Wai.Middleware.Static
import Web.Scotty
import Routes.Filters (mountFiltersRoutes)
import Routes.Records (mountRecordsRoutes)
import qualified Routes.Report as ReportAPI
import Types (GradeRecord)

main :: IO ()
main = do
  recordsRef <- newIORef ([] :: [GradeRecord])
  scotty 3000 $ do
    middleware $ staticPolicy (addBase "static")
    get "/" $ file "static/index.html"
    mountRecordsRoutes recordsRef
    mountFiltersRoutes recordsRef
    ReportAPI.mountReportRoutes recordsRef
