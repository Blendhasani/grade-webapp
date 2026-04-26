{-# LANGUAGE OverloadedStrings #-}

module Routes.Filters (mountFiltersRoutes) where

import Data.IORef
import Web.Scotty
import Types (GradeRecord)

mountFiltersRoutes :: IORef [GradeRecord] -> ScottyM ()
mountFiltersRoutes _ = do
  get "/api/passing" $ json ([] :: [GradeRecord])
  get "/api/failing" $ json ([] :: [GradeRecord])
  get "/api/subject/:name" $ json ([] :: [GradeRecord])
