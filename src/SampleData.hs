module SampleData
  ( initialRecords
  ) where

import Types

student1, student2, student3, student4, student5 :: Student
student1 = Student 1 "Blend Hasani"
student2 = Student 2 "Dion Berisha"
student3 = Student 3 "Yllka Shala"
student4 = Student 4 "Arta Gashi"
student5 = Student 5 "Liridon Krasniqi"

initialRecords :: [GradeRecord]
initialRecords =
  [ GradeRecord student1 Programming 95
  , GradeRecord student2 Mathematics 67
  , GradeRecord student3 Algorithms 88
  , GradeRecord student4 Databases 81
  , GradeRecord student5 Programming 56
  , GradeRecord student1 Mathematics 38
  , GradeRecord student2 Algorithms 73
  , GradeRecord student3 Databases 91
  ]
