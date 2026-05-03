module Report (generateClassReport) where

import Analyzer
  ( classAverage
  , getFailingStudents
  , getPassingStudents
  , highestGrade
  , lowestGrade
  , passRate
  )
import Types (ClassReport (..), GradeRecord)

generateClassReport :: [GradeRecord] -> ClassReport
generateClassReport records =
  ClassReport
    { reportAverage = classAverage records
    , reportHighest = highestGrade records
    , reportLowest = lowestGrade records
    , reportPassRate = passRate records
    , reportPassingCount = length (getPassingStudents records)
    , reportFailingCount = length (getFailingStudents records)
    }
