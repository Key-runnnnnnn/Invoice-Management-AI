import { configureStore } from "@reduxjs/toolkit";
import dataReducer from "./Slice";

const store = configureStore({
  reducer: {
    data: dataReducer,
  },
});

export default store;
