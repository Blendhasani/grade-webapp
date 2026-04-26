{-# LANGUAGE OverloadedStrings #-}

module Routes.Records (mountRecordsRoutes) where

import Data.IORef
import Web.Scotty
import Types (GradeRecord)

mountRecordsRoutes :: IORef [GradeRecord] -> ScottyM ()
mountRecordsRoutes _ = do
  get "/api/records" $ json ([] :: [GradeRecord])
