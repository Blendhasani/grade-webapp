module Analyzer
  ( addGradeRecord
  , getPassingStudents
  , getFailingStudents
  , filterBySubject
  , classAverage
  , highestGrade
  , lowestGrade
  , passRate
  , categorizeGrade
  ) where

import Types

addGradeRecord :: GradeRecord -> [GradeRecord] -> [GradeRecord]
addGradeRecord newRecord records = records ++ [newRecord]

getPassingStudents :: [GradeRecord] -> [GradeRecord]
getPassingStudents records = filter (\record -> recordGrade record >= 50.0) records

getFailingStudents :: [GradeRecord] -> [GradeRecord]
getFailingStudents records = filter (\record -> recordGrade record < 50.0) records

filterBySubject :: Subject -> [GradeRecord] -> [GradeRecord]
filterBySubject subject records = filter (\record -> recordSubject record == subject) records

classAverage :: [GradeRecord] -> Double
classAverage [] = 0.0
classAverage records = sum (map recordGrade records) / fromIntegral (length records)

highestGrade :: [GradeRecord] -> Double
highestGrade [] = 0.0
highestGrade records = maximum (map recordGrade records)

lowestGrade :: [GradeRecord] -> Double
lowestGrade [] = 0.0
lowestGrade records = minimum (map recordGrade records)

passRate :: [GradeRecord] -> Double
passRate [] = 0.0
passRate records =
  (fromIntegral (length (getPassingStudents records)) / fromIntegral (length records)) * 100.0

categorizeGrade :: Double -> GradeCategory
categorizeGrade grade
  | grade >= 90.0 = Excellent
  | grade >= 75.0 = Good
  | grade >= 50.0 = Satisfactory
  | otherwise = Poor
