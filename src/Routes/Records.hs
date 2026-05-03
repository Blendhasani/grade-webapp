{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE ScopedTypeVariables #-}

module Routes.Records (mountRecordsRoutes) where

import Control.Exception (SomeException)
import Data.Aeson (object, (.=))
import Data.Char (isSpace)
import Data.IORef
import Network.HTTP.Types.Status (status400)
import Web.Scotty
import Analyzer (addGradeRecord)
import Routes.Common (liftAndRead)
import Routes.JsonRows (gradeRecordRow)
import Types (GradeRecord (..), Student (..))

-- | Reject structurally valid JSON that is not acceptable as a new record.
validateNewRecord :: GradeRecord -> Either String ()
validateNewRecord r
  | studentId (recordStudent r) <= 0 =
      Left "Student ID must be a positive number"
  | not (nameHasContent (studentName (recordStudent r))) =
      Left "Student name is required"
  | let g = recordGrade r in g < 0 || g > 100 =
      Left "Grade must be between 0 and 100"
  | otherwise = Right ()
  where
    nameHasContent :: String -> Bool
    nameHasContent s = any (not . isSpace) s

mountRecordsRoutes :: IORef [GradeRecord] -> ScottyM ()
mountRecordsRoutes recordsRef = do
  get "/api/records" $ do
    records <- liftAndRead recordsRef
    json (map gradeRecordRow records)

  post "/api/records" $ do
    maybeRecord <-
      (Right <$> jsonData)
        `catch` (\(_ :: SomeException) -> return (Left "Invalid JSON body" :: Either String GradeRecord))
    case maybeRecord of
      Left errMsg -> do
        status status400
        json $ object ["error" .= errMsg]
      Right newRecord ->
        case validateNewRecord newRecord of
          Left errMsg -> do
            status status400
            json $ object ["error" .= errMsg]
          Right {} -> do
            records <- liftAndRead recordsRef
            let updated = addGradeRecord newRecord records
            liftIO $ writeIORef recordsRef updated
            json (gradeRecordRow newRecord)