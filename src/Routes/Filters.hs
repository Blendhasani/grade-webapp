{-# LANGUAGE OverloadedStrings #-}

module Routes.Filters (mountFiltersRoutes) where

import Analyzer (filterBySubject, getFailingStudents, getPassingStudents)
import Data.Aeson (object, (.=))
import Data.IORef (IORef)
import Network.HTTP.Types.Status (status400)
import Routes.Common (liftAndRead)
import Routes.JsonRows (gradeRecordRow)
import Text.Read (readMaybe)
import Types (GradeRecord, Subject)
import Web.Scotty

mountFiltersRoutes :: IORef [GradeRecord] -> ScottyM ()
mountFiltersRoutes recordsRef = do
  get "/api/passing" $ do
    records <- liftAndRead recordsRef
    json (map gradeRecordRow (getPassingStudents records))

  get "/api/failing" $ do
    records <- liftAndRead recordsRef
    json (map gradeRecordRow (getFailingStudents records))

  get "/api/subject/:name" $ do
    name <- pathParam "name"
    records <- liftAndRead recordsRef
    case parseSubject name of
      Nothing -> do
        status status400
        json $ object ["error" .= ("Invalid subject" :: String)]
      Just subject -> json (map gradeRecordRow (filterBySubject subject records))

parseSubject :: String -> Maybe Subject
parseSubject = readMaybe
