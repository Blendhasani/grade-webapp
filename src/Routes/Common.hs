{-# LANGUAGE OverloadedStrings #-}

module Routes.Common (liftAndRead) where

import Control.Monad.IO.Class (liftIO)
import Data.IORef (IORef, readIORef)
import Types (GradeRecord)
import Web.Scotty (ActionM)

liftAndRead :: IORef [GradeRecord] -> ActionM [GradeRecord]
liftAndRead = liftIO . readIORef
