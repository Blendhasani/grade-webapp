{-# LANGUAGE DeriveGeneric #-}

module Types
  ( Student(..)
  , Subject(..)
  , GradeRecord(..)
  , GradeCategory(..)
  , ClassReport(..)
  ) where

import Data.Aeson (FromJSON, ToJSON)
import GHC.Generics (Generic)

data Student = Student
  { studentId :: Int
  , studentName :: String
  } deriving (Show, Eq, Generic)

instance ToJSON Student
instance FromJSON Student

data Subject
  = Programming
  | Mathematics
  | Algorithms
  | Databases
  deriving (Show, Eq, Enum, Bounded, Read, Generic)

instance ToJSON Subject
instance FromJSON Subject

data GradeRecord = GradeRecord
  { recordStudent :: Student
  , recordSubject :: Subject
  , recordGrade :: Double
  } deriving (Show, Eq, Generic)

instance ToJSON GradeRecord
instance FromJSON GradeRecord

data GradeCategory
  = Excellent
  | Good
  | Satisfactory
  | Poor
  deriving (Show, Eq, Generic)

instance ToJSON GradeCategory
instance FromJSON GradeCategory

data ClassReport = ClassReport
  { reportAverage :: Double
  , reportHighest :: Double
  , reportLowest :: Double
  , reportPassRate :: Double
  , reportPassingCount :: Int
  , reportFailingCount :: Int
  } deriving (Show, Eq, Generic)

instance ToJSON ClassReport
instance FromJSON ClassReport
