{-# LANGUAGE OverloadedStrings #-}

module Routes.Report (mountReportRoutes) where

import Analyzer (categorizeGrade)
import Control.Monad.IO.Class (liftIO)
import Data.Aeson (Value, object, (.=))
import Data.IORef (IORef, readIORef)
import Report (generateClassReport)
import Types (GradeRecord (..), Student (..))
import Web.Scotty

-- GET /api/report  — class summary (JSON mirrors ClassReport / ToJSON field names)
-- GET /api/categories — [{ student, subject, grade, category }, ...] for stable frontend use
mountReportRoutes :: IORef [GradeRecord] -> ScottyM ()
mountReportRoutes recordsRef = do
  get "/api/report" $ do
    records <- liftAndRead recordsRef
    json (generateClassReport records)

  get "/api/categories" $ do
    records <- liftAndRead recordsRef
    json (map categoryRow records)

liftAndRead :: IORef [GradeRecord] -> ActionM [GradeRecord]
liftAndRead = liftIO . readIORef

categoryRow :: GradeRecord -> Value
categoryRow record =
  object
    [ "student" .= studentName (recordStudent record)
    , "subject" .= show (recordSubject record)
    , "grade" .= recordGrade record
    , "category" .= show (categorizeGrade (recordGrade record))
    ]