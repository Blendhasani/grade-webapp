{-# LANGUAGE OverloadedStrings #-}

module Routes.JsonRows (gradeRecordRow) where

import Analyzer (categorizeGrade)
import Data.Aeson (Value, object, (.=))
import Types (GradeRecord (..))

-- | Same JSON shape as GradeRecord plus a stable @category@ label for the UI.
gradeRecordRow :: GradeRecord -> Value
gradeRecordRow r =
  object
    [ "recordStudent" .= recordStudent r
    , "recordSubject" .= recordSubject r
    , "recordGrade" .= recordGrade r
    , "category" .= show (categorizeGrade (recordGrade r))
    ]
