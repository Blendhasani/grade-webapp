{-# LANGUAGE OverloadedStrings #-}

module Routes.Filters (mountFiltersRoutes) where

import Analyzer (filterBySubject, getFailingStudents, getPassingStudents)
import Control.Monad.IO.Class (liftIO)
import Data.Aeson (object, (.=))
import Data.IORef (IORef, readIORef)
import Network.HTTP.Types.Status (status400)
import Text.Read (readMaybe)
import Types (GradeRecord, Subject)
import Web.Scotty

mountFiltersRoutes :: IORef [GradeRecord] -> ScottyM ()
mountFiltersRoutes recordsRef = do
  get "/api/passing" $ do
    records <- liftAndRead recordsRef
    json (getPassingStudents records)

  get "/api/failing" $ do
    records <- liftAndRead recordsRef
    json (getFailingStudents records)

  get "/api/subject/:name" $ do
    name <- param "name"
    records <- liftAndRead recordsRef
    case parseSubject name of
      Nothing -> do
        status status400
        json $ object ["error" .= ("Invalid subject" :: String)]
      Just subject -> json (filterBySubject subject records)

liftAndRead :: IORef [GradeRecord] -> ActionM [GradeRecord]
liftAndRead = liftIO . readIORef

parseSubject :: String -> Maybe Subject
parseSubject = readMaybe
